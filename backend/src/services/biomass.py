from abc import ABC, abstractmethod

import ee.filter
import ee.geometry
import ee.image
import ee.imagecollection
import numpy as np
import rasterio
import rasterio.features
import rasterio.transform
import rasterio.windows
import shapely.geometry
from pyproj import Geod
from src.ai.biomass import estimate_biomass
from src.models import BiomassEstimationGeoTIFF, CollectionID, FeatureCollection
from src.settings import SETTINGS

BANDS: dict[CollectionID, list[str]] = {
    "sen1": ["VV", "VH"],
    "sen2_10m": ["B2", "B3", "B4", "B8"],
    "sen2_20m": ["B5", "B6", "B7", "B8A", "B11", "B12"],
    "sen2_60m": ["B1", "B9"],
}


class BiomassEstimationService(ABC):
    def __init__(self):
        with open(SETTINGS.preliminary_estimation_list_path) as file:
            preliminary_estimation_urls = file.readlines()
            preliminary_estimations: list[BiomassEstimationGeoTIFF] = []
            for url in preliminary_estimation_urls:
                with rasterio.open(url) as src:
                    preliminary_estimations.append(
                        BiomassEstimationGeoTIFF(data=url, profile=src.profile)
                    )
        self.geod = Geod(ellps="WGS84")
        self.preliminary_estimations = preliminary_estimations

    def get_preliminary_estimation(
        self, bbox: shapely.geometry.Polygon
    ) -> BiomassEstimationGeoTIFF | None:
        for estimation in self.preliminary_estimations:
            if estimation.bounding_box.contains(bbox):
                return estimation

        return None

    @abstractmethod
    def _get_raw_estimation(
        self,
        bbox: shapely.geometry.Polygon,
        preliminary_estimation: BiomassEstimationGeoTIFF,
    ) -> np.ndarray:
        pass

    def get_estimation(
        self, feature_collection: FeatureCollection
    ) -> BiomassEstimationGeoTIFF:
        multipolygon = feature_collection.get_multipolygon()
        minx, miny, maxx, maxy = multipolygon.bounds

        bbox = shapely.geometry.box(minx, miny, maxx, maxy)

        area, _ = self.geod.geometry_area_perimeter(bbox)
        if area > SETTINGS.estimation_area_limit:
            raise ValueError(f"Area too large (max=100ha) : {bbox.area}")

        preliminary_estimation = self.get_preliminary_estimation(bbox)
        if preliminary_estimation is None:
            raise ValueError(f"Unsupported area: {bbox}")

        raw_estimation = self._get_raw_estimation(bbox, preliminary_estimation)
        height = raw_estimation.shape[0]
        width = raw_estimation.shape[1]

        transform = rasterio.transform.from_bounds(
            minx, miny, maxx, maxy, width, height
        )

        mask = rasterio.features.geometry_mask(
            multipolygon.geoms,
            out_shape=(height, width),
            transform=transform,
            invert=True,
        )
        raw_estimation = np.where(mask, raw_estimation, np.nan)

        profile = preliminary_estimation.profile.copy()
        profile.update(
            {
                "count": 1,
                "height": height,
                "width": width,
                "transform": transform,
            }
        )

        estimation = BiomassEstimationGeoTIFF(data=raw_estimation, profile=profile)
        return estimation


class BiomassPreliminaryEstimationService(BiomassEstimationService):
    def __init__(self):
        super().__init__()

    def _get_raw_estimation(
        self,
        bbox: shapely.geometry.Polygon,
        preliminary_estimation: BiomassEstimationGeoTIFF,
    ) -> np.ndarray:
        if not isinstance(preliminary_estimation.data, str):
            raise TypeError(
                f"Preliminary estimation's GeoTIFF must be a URL (string), but found: {type(preliminary_estimation.data)}"
            )

        with rasterio.open(preliminary_estimation.data) as src:
            minx, miny, maxx, maxy = bbox.bounds
            window = rasterio.windows.from_bounds(
                minx, miny, maxx, maxy, transform=src.transform
            )
            raw_estimation: np.ndarray = src.read(1, window=window)
            return raw_estimation


class BiomassRuntimeEstimationService(BiomassEstimationService):
    def __init__(self):
        super().__init__()
        self.collections: dict[CollectionID, ee.imagecollection.ImageCollection] = {
            "sen1": ee.imagecollection.ImageCollection("COPERNICUS/S1_GRD")
            .filter(
                ee.filter.Filter.listContains("transmitterReceiverPolarisation", "VV")
            )
            .select(BANDS["sen1"]),
            "sen2_10m": ee.imagecollection.ImageCollection(
                "COPERNICUS/S2_SR_HARMONIZED"
            ).select(BANDS["sen2_10m"]),
            "sen2_20m": ee.imagecollection.ImageCollection(
                "COPERNICUS/S2_SR_HARMONIZED"
            ).select(BANDS["sen2_20m"]),
            "sen2_60m": ee.imagecollection.ImageCollection(
                "COPERNICUS/S2_SR_HARMONIZED"
            ).select(BANDS["sen2_60m"]),
        }

    def _get_raw_estimation(
        self,
        bbox: shapely.geometry.Polygon,
        preliminary_estimation: BiomassEstimationGeoTIFF,
    ) -> np.ndarray:
        coords, sen1, sen2_10m, sen2_20m, sen2_60m = self._load_data(bbox)
        raw_estimation = estimate_biomass(coords, sen1, sen2_10m, sen2_20m, sen2_60m)
        raw_estimation = raw_estimation[0]
        return raw_estimation

    def _get_coordinates(
        self,
        collection_id: CollectionID,
        bbox: ee.geometry.Geometry,
    ) -> np.ndarray:
        img: ee.image.Image = (
            self.collections[collection_id]
            .filterBounds(bbox)
            .sort("system:time_start", False)
            .first()
        )
        proj = img.projection()
        sample = ee.image.Image.pixelCoordinates(proj).sampleRectangle(bbox)
        x = sample.getArray("x").getInfo()
        y = sample.getArray("y").getInfo()

        coords = np.stack([x, y], axis=0)  # type: ignore
        return coords

    def _sample_data(
        self,
        collection_id: CollectionID,
        bbox: ee.geometry.Geometry,
    ) -> np.ndarray:
        img: ee.image.Image = (
            self.collections[collection_id]
            .filterBounds(bbox)
            .sort("system:time_start", False)
            .first()
        )
        sample = img.sampleRectangle(bbox)
        bands = []
        for band_name in BANDS[collection_id]:
            band = sample.getArray(band_name).getInfo()
            bands.append(band)

        data = np.stack(bands, axis=-1)
        return data

    def _load_data(self, bbox: shapely.geometry.Polygon):
        minx, miny, maxx, maxy = bbox.bounds
        gee_bbox = ee.geometry.Geometry.Polygon(
            [[[minx, miny], [maxx, miny], [maxx, maxy], [minx, maxy], [minx, miny]]]
        )

        coords = self._get_coordinates("sen1", gee_bbox)
        sen1 = self._sample_data("sen1", gee_bbox)
        sen2_10m = self._sample_data("sen2_10m", gee_bbox)
        sen2_20m = self._sample_data("sen2_20m", gee_bbox)
        sen2_60m = self._sample_data("sen2_60m", gee_bbox)

        return coords, sen1, sen2_10m, sen2_20m, sen2_60m
