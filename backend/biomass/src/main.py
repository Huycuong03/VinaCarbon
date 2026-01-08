import io
import json

import numpy as np
import rasterio
import rasterio.io
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from rasterio.mask import mask
from shapely.geometry import MultiPolygon, Polygon, shape
from src.settings import SETTINGS

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Statistics"],
)


@app.post("/")
def get_analysis(geojson: dict):
    geom = shape(geojson["features"][0]["geometry"])

    if isinstance(geom, Polygon):
        polygons = [geom]
    elif isinstance(geom, MultiPolygon):
        polygons = list(geom.geoms)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Geometry type {geom.geom_type} is not supported. Please use Polygon or MultiPolygon",
        )

    with rasterio.open(SETTINGS.preliminary_biomass_estimation_path) as src:
        try:
            image, transform = mask(src, polygons, crop=True, filled=False)
            image = image.astype("float32")

            biomass: np.ndarray = np.abs(image[0])
            valid = ~np.ma.getmaskarray(biomass)

            area = np.count_nonzero(valid) / 100
            min_biomass = biomass[valid].min()
            max_biomass = biomass[valid].max()
            mean_biomass = biomass[valid].mean()
            total_biomass = (biomass / 100)[valid].sum()
            carbon_stock = total_biomass * 0.47

            biomass[valid] = (biomass[valid] - min_biomass) / (
                max_biomass - min_biomass
            )
            image[0] = biomass

        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

        profile = src.profile
        profile.update(
            {
                "height": image.shape[1],
                "width": image.shape[2],
                "transform": transform,
            }
        )

        with rasterio.io.MemoryFile() as memfile:
            with memfile.open(**profile) as dst:
                dst.write(image)

            geotiff_bytes = memfile.read()

    headers = {
        "X-Statistics": json.dumps(
            {
                "area": {
                    "value": float(area),
                    "unit": "ha",
                },
                "min_biomass": {
                    "value": float(min_biomass),
                    "unit": "Mg/ha",
                },
                "max_biomass": {
                    "value": float(max_biomass),
                    "unit": "Mg/ha",
                },
                "mean_biomass": {
                    "value": float(mean_biomass),
                    "unit": "Mg/ha",
                },
                "total_biomass": {
                    "value": float(total_biomass),
                    "unit": "Mg",
                },
                "carbon_stock": {
                    "value": float(carbon_stock),
                    "unit": "Mg",
                },
            }
        ),
        "Content-Disposition": 'attachment; filename="image.tif"',
    }

    return StreamingResponse(
        io.BytesIO(geotiff_bytes), media_type="image/tiff", headers=headers
    )
