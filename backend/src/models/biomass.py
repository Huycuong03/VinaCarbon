from io import BytesIO
from typing import Literal

import numpy as np
import rasterio.io
import rasterio.profiles
import rasterio.transform
import shapely.geometry
from pydantic import BaseModel, ConfigDict

CollectionID = Literal["coords", "sen1", "sen2_10m", "sen2_20m", "sen2_60m"]


class BiomassEstimationGeoTIFF:
    def __init__(self, data: str | np.ndarray, profile: rasterio.profiles.Profile):
        self.data = data
        self.profile = profile

        bounds = rasterio.transform.array_bounds(
            profile["height"], profile["width"], profile["transform"]
        )
        self.bounding_box = shapely.geometry.box(*bounds)

    def stream(self) -> BytesIO:
        with rasterio.io.MemoryFile() as memfile:
            with memfile.open(**self.profile) as dst:
                dst.write(self.data, 1)

            return BytesIO(memfile.read())


class Geometry(BaseModel):
    type: Literal["Polygon"]
    coordinates: list

    model_config = ConfigDict(extra="ignore")


class Feature(BaseModel):
    type: Literal["Feature"]
    geometry: Geometry

    model_config = ConfigDict(extra="ignore")


class FeatureCollection(BaseModel):
    type: Literal["FeatureCollection"]
    features: list[Feature]

    model_config = ConfigDict(extra="ignore")

    def get_multipolygon(self) -> shapely.geometry.MultiPolygon:
        polygons: list[shapely.geometry.Polygon] = []
        for feature in self.features:
            geometry = shapely.geometry.shape(feature.geometry.model_dump())
            if isinstance(geometry, shapely.geometry.Polygon):
                polygons.append(geometry)

        multipolygon = shapely.geometry.MultiPolygon(polygons)
        return multipolygon
