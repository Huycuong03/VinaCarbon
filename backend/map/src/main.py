import numpy as np
import rasterio
import rasterio.io
from fastapi import FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from rasterio.mask import mask
from shapely.geometry import MultiPolygon, Polygon, shape

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

    with rasterio.open("C:/Users/caohu/Downloads/biomass_map.tif") as src:
        try:
            image, transform = mask(src, polygons, crop=True, filled=False)
            image = image.astype("float32")

            biomass = np.abs(image[0])
            valid = ~np.ma.getmaskarray(biomass)
            min_val = biomass[valid].min()
            max_val = biomass[valid].max()
            biomass[valid] = (biomass[valid] - min_val) / (max_val - min_val)
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

    return Response(content=geotiff_bytes, media_type="image/tiff")
