"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { FeatureGroup, MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import type { LeafletEvent, LocationEvent, LeafletMouseEvent } from "leaflet";
import "leaflet-draw";
import { LocateFixed, Square, Pentagon, FileBracesCorner, SquareFunction, Trash2, MapPin, Loader2, ScanSearch } from "lucide-react";
import { BACKEND_API_ENDPOINT, MAP_IMAGE_LAYER_URL, MAP_REFERENCE_LAYER_URL } from "@/constants";
import "leaflet-geotiff-2";
import "leaflet-geotiff-2/dist/leaflet-geotiff-plotty";

export function MapControls({ featureGroup, setStatistics, setLoading }: { featureGroup: any, setStatistics: (stats: any) => void, setLoading: (vale: boolean) => void }) {
    const { status } = useSession();
    const map = useMap();
    const [hasFeatures, setHasFeatures] = useState<boolean>(false);
    const drawTool = useRef<any>(null)
    const [cursorPos, setCursorPos] = useState<{ lat: number, lng: number } | null>(null);
    const geojsonInputRef = useRef<HTMLInputElement | null>(null);

    function enableDrawTool(isRectangle: boolean = true) {
        if (drawTool.current) {
            drawTool.current.disable();
            drawTool.current = null;
        }

        if (isRectangle) {
            drawTool.current = new L.Draw.Rectangle(map as any);
        } else {
            drawTool.current = new L.Draw.Polygon(map as any);
        }

        drawTool.current.enable()
    }

    function disbaleDrawTool() {
        if (drawTool.current) {
            drawTool.current.disable();
            drawTool.current = null;
        }
    }

    function onClearFeatures() {
        featureGroup.current.clearLayers();
        setHasFeatures(false);
        setStatistics(null);
    }

    async function onAnalyze(analysisType: "preliminary" | "runtime") {
        if (analysisType === "runtime" && status !== "authenticated") {
            alert("Vui lòng đăng nhập để sử dụng tính năng này.");
            return;
        }

        const features = featureGroup.current.toGeoJSON();
        onClearFeatures();
        setLoading(true);

        try {
            const response = await fetch(
                `/vinacarbon/api/backend${BACKEND_API_ENDPOINT.BIOMASS}/${analysisType}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(features),
                }
            );

            if (!response.ok) {
                if (response.status === 400) {
                    const { detail } = await response.json();
                    alert(detail);
                    setLoading(false);
                    return;
                }
            }

            const statsHeader = response.headers.get("X-Statistics");
            const stats = statsHeader ? JSON.parse(statsHeader) : null;
            setStatistics(stats);

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            const renderer = L.LeafletGeotiff.plotty({
                displayMin: -1,
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
            setLoading(false);


        } catch (error) {
            alert(error);
            setLoading(false);
        }

    };

    async function onUploadGeoJSON(e: React.ChangeEvent<HTMLInputElement>) {
        disbaleDrawTool();
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();      // read file contents
            const data = JSON.parse(text);
            const geoJSONLayer = L.geoJSON(data);
            geoJSONLayer.addTo(featureGroup.current);
            map.flyToBounds(geoJSONLayer.getBounds());
            setHasFeatures(true);
        } catch (err) {
            console.error("Error parsing JSON:", err);
        } finally {
            e.target.value = "";
        }
    };

    useEffect(() => {
        const onDrawCreated = (event: LeafletEvent) => {
            featureGroup.current.addLayer(event.layer);
            setHasFeatures(true);
            disbaleDrawTool();
        };

        const onLocationFound = (event: LocationEvent) => {
            disbaleDrawTool();
            map.flyTo(event.latlng, map.getZoom());
        };

        const onMouseMove = (event: LeafletMouseEvent) => {
            setCursorPos({ lat: event.latlng.lat, lng: event.latlng.lng });
        };

        map.on(L.Draw.Event.CREATED, onDrawCreated);
        map.on("locationfound", onLocationFound);
        map.on('mousemove', onMouseMove);

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
                    onClick={() => geojsonInputRef.current?.click()}
                >
                    <FileBracesCorner size={20} />
                    <input
                        ref={geojsonInputRef}
                        type="file"
                        accept=".geojson"
                        hidden
                        onChange={onUploadGeoJSON}
                    />
                </button>
                {hasFeatures && (
                    <>
                        <button className="leaflet-control leaflet-bar cursor-pointer p-2 bg-white" onClick={() => onAnalyze("preliminary")}>
                            <ScanSearch size={20} />
                        </button>
                        <button className="leaflet-control leaflet-bar cursor-pointer p-2 bg-white" onClick={() => onAnalyze("runtime")}>
                            <SquareFunction size={20} />
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
    const [loading, setLoading] = useState(false);
    const featureGroup = useRef(null);

    return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
            {loading && (
                <div className="absolute inset-0 z-1000 flex flex-col items-center justify-center animate-fade-in">
                    <div className="flex flex-col items-center justify-center min-w-[20%] p-6 bg-white/80 p-6 rounded-sm shadow-xl">
                        <Loader2 size={48} className="text-charcoal animate-spin mb-4" />
                        <p className="text-charcoal font-medium font-serif text-xl">Đang tải ...</p>
                    </div>
                </div>)}
            <MapContainer center={[21.0285, 105.8542]} zoom={13} style={{ width: "100%", height: "100%" }}>
                <TileLayer url={MAP_IMAGE_LAYER_URL} />
                <TileLayer url={MAP_REFERENCE_LAYER_URL} />
                <FeatureGroup ref={featureGroup} />
                <MapControls featureGroup={featureGroup} setStatistics={setStatistics} setLoading={setLoading} />
            </MapContainer>
        </div>
    );
};