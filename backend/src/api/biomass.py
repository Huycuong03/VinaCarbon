import json

import numpy as np
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from src.dependencies import (
    get_biomass_preliminary_estimation_service,
    get_biomass_runtime_estimation_service,
    verify_token,
)
from src.models import BiomassEstimationGeoTIFF, FeatureCollection, User
from src.services import (
    BiomassPreliminaryEstimationService,
    BiomassRuntimeEstimationService,
)
from src.settings import LOGGER, SETTINGS

router = APIRouter(prefix="/api/biomass")


@router.post("/preliminary")
def get_preliminary_estimation(
    feature_collection: FeatureCollection,
    biomass_service: BiomassPreliminaryEstimationService = Depends(
        get_biomass_preliminary_estimation_service
    ),
):
    try:
        estimation = biomass_service.get_estimation(feature_collection)
        return stream_estimation(estimation)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        LOGGER.debug(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@router.post("/runtime")
def get_runtime_estimation(
    feature_collection: FeatureCollection,
    _: User = Depends(verify_token),
    biomass_service: BiomassRuntimeEstimationService = Depends(
        get_biomass_runtime_estimation_service
    ),
):
    try:
        estimation = biomass_service.get_estimation(feature_collection)
        return stream_estimation(estimation)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        LOGGER.debug(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


def stream_estimation(estimation: BiomassEstimationGeoTIFF) -> StreamingResponse:
    raw_estimation = np.abs(estimation.data)
    valid = ~np.isnan(raw_estimation)

    area = float(np.count_nonzero(valid) / 100)
    min_biomass_density = float(raw_estimation[valid].min())
    max_biomass_density = float(raw_estimation[valid].max())
    mean_biomass_density = float(raw_estimation[valid].mean())
    total_biomass = float((raw_estimation / 100)[valid].sum())
    total_carbon_stock = float(total_biomass * SETTINGS.carbon_stock_to_biomass_ratio)

    statistics = [
        {"name": "Diện tích", "value": area, "unit": "ha"},
        {
            "name": "Mật độ sinh khối (min)",
            "value": min_biomass_density,
            "unit": "Mg/ha",
        },
        {
            "name": "Mật độ sinh khối (max)",
            "value": max_biomass_density,
            "unit": "Mg/ha",
        },
        {"name": "Diện tích", "value": mean_biomass_density, "unit": "Mg/ha"},
        {"name": "Mật độ sinh khối", "value": total_biomass, "unit": "Mg"},
        {
            "name": "Trữ lượng Carbon",
            "value": total_carbon_stock,
            "unit": "Mg",
        },
    ]

    raw_estimation[valid] = (raw_estimation[valid] - min_biomass_density) / (
        max_biomass_density - min_biomass_density
    )

    estimation.data = raw_estimation

    headers = {
        "X-Statistics": json.dumps(statistics),
        "Content-Disposition": 'attachment; filename="image.tif"',
    }

    return StreamingResponse(
        estimation.stream(), media_type="image/tiff", headers=headers
    )
