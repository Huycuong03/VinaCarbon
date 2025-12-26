"use client";

import { useEffect, useState, useRef, FormEvent } from "react";
import { FeatureGroup, MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-draw";
import { LocateFixed, Square, Pentagon, FileBracesCorner, ChartColumnBig, Trash2, MapPin } from "lucide-react";
import { MAP_IMAGE_LAYER_URL, MAP_REFERENCE_LAYER_URL } from "@/constants";
import "leaflet-geotiff-2";
import "leaflet-geotiff-2/dist/leaflet-geotiff-plotty";

export function MapControls({ featureGroup }: { featureGroup: any }) {
    const map = useMap();
    const [hasFeatures, setHasFeatures] = useState<boolean>(false);
    const drawTool = useRef(null)
    const [cursorPos, setCursorPos] = useState<{ lat: number, lng: number } | null>(null);

    const enableDrawTool = (isRectangle: boolean = true) => {
        if (drawTool.current) {
            drawTool.current.disable();
            drawTool.current = null;
        }

        if (isRectangle) {
            drawTool.current = new L.Draw.Rectangle(map);
        } else {
            drawTool.current = new L.Draw.Polygon(map);
        }

        drawTool.current.enable()
    }

    const disbaleDrawTool = () => {
        if (drawTool.current) {
            drawTool.current.disable();
            drawTool.current = null;
        }
    }

    const onClearFeatures = () => {
        featureGroup.current.clearLayers();
        setHasFeatures(false);
    }

    const onAnalyze = async () => {
        const features = featureGroup.current.toGeoJSON();
        onClearFeatures();

        try{
            const response = await fetch(
                "http://localhost/biomass",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(features),
                }
            );

            if (!response.ok) {
                throw new Error(`Unexpected status: ${response.status}`);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            const renderer = L.LeafletGeotiff.plotty({
                displayMin: 0,
                displayMax: 1,
                applyDisplayRange: true,
                colorScale: "rainbow",
            });

            const imageLayer = L.leafletGeotiff(url, {
                renderer: renderer,
                band: 1,
                opacity: 1,
            });

            imageLayer.addTo(featureGroup.current);
            setHasFeatures(true);

        } catch (error) {
            console.error("Failed to get analysis", error);
        }

    };

    const onUploadGeoJSON = (e: FormEvent) => {
        disbaleDrawTool();

        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();

        reader.onload = function (e) {
            try {
                const text = e.target.result;
                const data = JSON.parse(text);
                const geoJSONLayer = L.geoJSON(data);
                geoJSONLayer.addTo(featureGroup.current);
                map.flyToBounds(geoJSONLayer.getBounds());
                setHasFeatures(true);
            } catch (err) {
                console.error("Error parsing JSON:", err);
            }
        };

        reader.readAsText(file);
    };

    useEffect(() => {
        const onDrawCreated = (e) => {
            featureGroup.current.addLayer(e.layer);
            setHasFeatures(true);
            disbaleDrawTool();
        };

        const onLocationFound = (e) => {
            disbaleDrawTool();
            map.flyTo(e.latlng, map.getZoom());
        };

        map.on(L.Draw.Event.CREATED, onDrawCreated);
        map.on("locationfound", onLocationFound);
        map.on('mousemove', (e: any) => {
            setCursorPos({ lat: e.latlng.lat, lng: e.latlng.lng });
        });

        return () => {
            map.off(L.Draw.Event.CREATED);
            map.off("locationfound");
            map.off("mousemove");
            disbaleDrawTool();
        };
    }, []);

    return (
        <>
            <div className="leaflet-top leaflet-left mt-30">
                <button
                    className="leaflet-control leaflet-bar cursor-pointer p-2 bg-white"
                    onClick={() => { map.locate() }}
                >
                    <LocateFixed size={20} />
                </button>
                <button className="leaflet-control leaflet-bar cursor-pointer p-2 bg-white" onClick={() => { enableDrawTool(true) }}>
                    <Square size={20} />
                </button>
                <button className="leaflet-control leaflet-bar cursor-pointer p-2 bg-white" onClick={() => { enableDrawTool(false) }}>
                    <Pentagon size={20} />
                </button>
                <button
                    className="leaflet-control leaflet-bar cursor-pointer p-2 bg-white"
                    onClick={() => document.getElementById("upload-geojson")?.click()}
                >
                    <FileBracesCorner size={20} />
                    <input
                        id="upload-geojson"
                        type="file"
                        accept=".geojson"
                        onChange={onUploadGeoJSON}
                        style={{ display: "none" }}
                    />
                </button>
                {hasFeatures && (
                    <>
                        <button className="leaflet-control leaflet-bar cursor-pointer p-2 bg-white" onClick={onAnalyze}>
                            <ChartColumnBig size={20} />
                        </button>
                        <button className="leaflet-control leaflet-bar cursor-pointer p-2 bg-white" onClick={onClearFeatures}>
                            <Trash2 size={20} />
                        </button>
                    </>
                )}
            </div>
            <div className="leaflet-bottom leaflet-left bg-white backdrop-blur p-2 px-4 mb-3 ml-3 text-xs font-mono shadow-md flex items-center gap-2">
                <MapPin size={12} className="text-forest" />
                {cursorPos ? `Lat: ${cursorPos.lat.toFixed(4)}° N, Long: ${cursorPos.lng.toFixed(4)}° E` : 'Move cursor to view coordinates'}
            </div>
        </>
    );
};

export default function Map() {
    const map = useRef(null);
    const featureGroup = useRef(null);

    return (
        <MapContainer ref={map} center={[21.0285, 105.8542]} zoom={13} style={{ width: "100%", height: "100%" }}>
            <TileLayer url={MAP_IMAGE_LAYER_URL} />
            <TileLayer url={MAP_REFERENCE_LAYER_URL} />
            <FeatureGroup ref={featureGroup} />
            <MapControls featureGroup={featureGroup} />
        </MapContainer>
    );
};