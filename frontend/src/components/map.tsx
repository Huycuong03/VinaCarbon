"use client";

import { useEffect, useState, useRef, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { FeatureGroup, MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-draw";
import { LocateFixed, Square, Pentagon, FileBracesCorner, ChartColumnBig, Trash2, MapPin } from "lucide-react";
import { BACKEND_API_ENDPOINT, BACKEND_URL, MAP_IMAGE_LAYER_URL, MAP_REFERENCE_LAYER_URL } from "@/constants";
import "leaflet-geotiff-2";
import "leaflet-geotiff-2/dist/leaflet-geotiff-plotty";

export function MapControls({ featureGroup, setStatistics, setMessage }: { featureGroup: any, setStatistics: (stats: any) => void, setMessage: (vale: string | null) => void}) {
    const { data: session, status } = useSession();
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
        setStatistics(null);
    }

    const onAnalyze = async () => {
        const features = featureGroup.current.toGeoJSON();
        onClearFeatures();
        setMessage("Uploading ...");

        try {
            const headers: HeadersInit = {
                "Content-Type": "application/json",
                ...(session?.user?.email && { 'X-Credential': session.user.email, }),
                ...(session?.apiKey && { 'X-Api-Key': session.apiKey, }),
            }
            const response = await fetch(
                `${BACKEND_URL}${BACKEND_API_ENDPOINT.BIOMASS}`,
                {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(features),
                }
            );

            setMessage(null);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail);
            }

            const statsHeader = response.headers.get("X-Statistics");
            const stats = statsHeader ? JSON.parse(statsHeader) : null;
            setStatistics(stats);

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
            alert(error);
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

export default function Map({ setStatistics }: { setStatistics: (stats: any) => void }) {
    const [message, setMessage] = useState<string | null>(null);
    const featureGroup = useRef(null);

    return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
            {message && (
                <div className="absolute inset-0 z-1000 flex items-center justify-center">
                    <div className="min-w-[20%] p-6 bg-white/80 font-semibold p-6 rounded-sm shadow-xl">{message}</div>
                </div>)}
            <MapContainer center={[21.0285, 105.8542]} zoom={13} style={{ width: "100%", height: "100%" }}>
                <TileLayer url={MAP_IMAGE_LAYER_URL} />
                <TileLayer url={MAP_REFERENCE_LAYER_URL} />
                <FeatureGroup ref={featureGroup} />
                <MapControls featureGroup={featureGroup} setStatistics={setStatistics} setMessage={setMessage} />
            </MapContainer>
        </div>
    );
};