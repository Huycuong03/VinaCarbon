import torch
import torch.nn as nn


class ProjectionBlock(nn.Module):
    def __init__(self, channels: list[int]):
        super(ProjectionBlock, self).__init__()
        layers = []
        in_channels = channels.pop(0)
        for out_channels in channels:
            layers.extend(
                [
                    nn.Conv2d(in_channels, out_channels, 1, bias=False),
                    nn.BatchNorm2d(out_channels),
                    nn.ReLU(inplace=True),
                ]
            )
            in_channels = out_channels

        self.layers = nn.Sequential(*layers)

    def forward(self, x):
        out = self.layers(x)

        return out


class SeparableConvBlock(nn.Module):
    def __init__(self, in_channels, kernel_size=3, stride=1, padding=1):
        super(SeparableConvBlock, self).__init__()
        layers = [
            nn.Conv2d(
                in_channels,
                in_channels,
                kernel_size,
                stride,
                padding,
                groups=in_channels,
                bias=False,
            ),
            nn.Conv2d(in_channels, in_channels, 1, bias=False),
            nn.BatchNorm2d(in_channels),
            nn.ReLU(inplace=True),
        ]

        self.layers = nn.Sequential(*layers)

    def forward(self, x):
        out = self.layers(x)

        return out


class FeatureBlock(nn.Module):
    def __init__(self, in_channels):
        super(FeatureBlock, self).__init__()
        self.layers = nn.Sequential(
            SeparableConvBlock(in_channels),
            SeparableConvBlock(in_channels),
        )

    def forward(self, x):
        residual = self.layers(x)
        out = x + residual

        return out


class SpatialAttention(nn.Module):
    def __init__(self, in_channels: int, reduction: int = 16):
        super(SpatialAttention, self).__init__()
        self.squeeze = nn.Conv2d(in_channels, in_channels // reduction, 1, bias=False)
        self.hardswish = nn.Hardswish()
        self.excitation = nn.Conv2d(
            in_channels // reduction, in_channels, 1, bias=False
        )

    def forward(self, x):
        out = self.squeeze(x)
        out = self.hardswish(out)
        out = self.excitation(out)

        return out


class AgbdBlock(nn.Module):
    def __init__(self, in_channels, out_channels):
        super(AgbdBlock, self).__init__()
        self.conv = nn.Conv2d(in_channels, out_channels, 1)

    def forward(self, x):
        out = self.conv(x)

        return out


class VinaCarbon(nn.Module):
    def __init__(self):
        super(VinaCarbon, self).__init__()
        self.projection = ProjectionBlock([16, 128, 512, 728])
        self.feature_extraction = nn.Sequential(*[FeatureBlock(728) for _ in range(8)])
        self.spatial_attention = SpatialAttention(728)

        self.x_conv = nn.Conv2d(728, 728, 1, bias=False)
        self.z_conv = nn.Conv2d(728, 728, 1, bias=False)

        self.prediction = AgbdBlock(728, 2)

    def forward(self, coords, sen1, sen2_10m, sen2_20m, sen2_60m):
        x = torch.cat([coords, sen1, sen2_10m, sen2_20m, sen2_60m], dim=1)

        x = self.projection(x)
        z = self.feature_extraction(x)
        att = self.spatial_attention(z)
        z = z * att

        x = self.x_conv(x)
        z = self.z_conv(z)

        agbd = self.prediction(x + z)

        return x, z, agbd
