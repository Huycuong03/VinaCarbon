import numpy as np
import torch
from torchvision.transforms import v2 as transforms

from src.ai.models.vinacarbon import VinaCarbon
from src.models import CollectionID

device = "cuda" if torch.cuda.is_available() else "cpu"
dsen2_20m = torch.jit.load("src/ai/models/L2A20M.pt", map_location=device)
dsen2_60m = torch.jit.load("src/ai/models/L2A60M.pt", map_location=device)

checkpoint = torch.load(
    "src/ai/models/vinacarbon.pth",
    weights_only=False,
    map_location=device,
)
model = VinaCarbon().to(device)
model.load_state_dict(checkpoint["model"])

dsen2_20m.eval()
dsen2_60m.eval()
model.eval()


def estimate_biomass(
    coords_np: np.ndarray,
    sen1_np: np.ndarray,
    sen2_10m_np: np.ndarray,
    sen2_20m_np: np.ndarray,
    sen2_60m_np: np.ndarray,
) -> np.ndarray:
    height, width, _ = sen1_np.shape
    coords = transform_data("coords", coords_np, height, width)
    sen1 = transform_data("sen1", sen1_np, height, width)
    sen2_10m = transform_data("sen2_10m", sen2_10m_np, height, width)
    sen2_20m = transform_data("sen2_20m", sen2_20m_np, height, width)
    sen2_60m = transform_data("sen2_60m", sen2_60m_np, height, width)
    with torch.no_grad():
        sen2_20m = sen2_20m + dsen2_20m(torch.cat([sen2_10m, sen2_20m], dim=1))

        sen2_60m = sen2_60m + dsen2_60m(
            torch.cat([sen2_10m, sen2_20m, sen2_60m], dim=1)
        )

        _, _, estimation = model(coords, sen1, sen2_10m, sen2_20m, sen2_60m)
        estimation = estimation.squeeze(0).cpu().numpy()

        return estimation


def transform_data(
    collection_id: CollectionID, data: np.ndarray, height: int, width: int
) -> torch.Tensor:
    transform = get_transform(collection_id, height, width)
    tensor = transform(data)
    tensor = tensor.unsqueeze(0).to(device)
    return tensor


SCALE_FACTOR = 2_000


def get_transform(
    collection_id: CollectionID, height: int, width: int
) -> transforms.Compose:
    if collection_id == "coords":
        return transforms.Compose(
            [
                torch.from_numpy,
                transforms.ToDtype(torch.float32),
                transforms.Resize(
                    size=(height, width),
                    interpolation=transforms.InterpolationMode.BILINEAR,
                ),
                lambda img: img / 10_000,
            ]
        )
    elif collection_id == "sen1":
        return transforms.Compose(
            [
                transforms.ToImage(),
                transforms.ToDtype(torch.float32, scale=True),
                # transforms.Resize(
                #     size=(height, width),
                #     interpolation=transforms.InterpolationMode.BILINEAR,
                # ),
            ]
        )
    elif collection_id == "sen2_10m":
        return transforms.Compose(
            [
                transforms.ToImage(),
                transforms.ToDtype(torch.float32),
                transforms.Resize(
                    size=(height, width),
                    interpolation=transforms.InterpolationMode.BILINEAR,
                ),
                lambda img: img / SCALE_FACTOR,
            ]
        )
    elif collection_id == "sen2_20m":
        return transforms.Compose(
            [
                transforms.ToImage(),
                transforms.ToDtype(torch.float32),
                transforms.Resize(
                    size=(height, width),
                    interpolation=transforms.InterpolationMode.BILINEAR,
                ),
                lambda img: img / SCALE_FACTOR,
            ]
        )
    elif collection_id == "sen2_60m":
        return transforms.Compose(
            [
                transforms.ToImage(),
                transforms.ToDtype(torch.float32),
                transforms.Resize(
                    size=(height, width),
                    interpolation=transforms.InterpolationMode.BILINEAR,
                ),
                lambda img: img / SCALE_FACTOR,
            ]
        )
