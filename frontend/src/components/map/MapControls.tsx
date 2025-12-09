"use client";

import { useEffect, useState, useRef, FormEvent } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-draw";
import { LocateFixed, Square, Pentagon, FileBracesCorner, ChartColumnBig, Trash2, MapPin } from "lucide-react";

export default function MapControls({ featureGroup }: { featureGroup: any }) {
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

    // const onAnalyze = () => {
    //     navigate("/estimation/analysis", {
    //     state: selectionLayer.current.toGeoJSON(),
    //     });
    // };

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
            map.off("mousemove")
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
                    <LocateFixed size={20}/>
                </button>
                <button className="leaflet-control leaflet-bar cursor-pointer p-2 bg-white" onClick={() => {enableDrawTool(true)}}>
                    <Square size={20}/>
                </button>
                <button className="leaflet-control leaflet-bar cursor-pointer p-2 bg-white" onClick={() => {enableDrawTool(false)}}>
                    <Pentagon size={20}/>
                </button>
                <button
                    className="leaflet-control leaflet-bar cursor-pointer p-2 bg-white"
                    onClick={() => document.getElementById("upload-geojson")?.click()}
                >
                    <FileBracesCorner size={20}/>
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
                        <button className="leaflet-control leaflet-bar cursor-pointer p-2 bg-white" onClick={() => {}}>
                            <ChartColumnBig size={20}/>
                        </button>
                        <button className="leaflet-control leaflet-bar cursor-pointer p-2 bg-white" onClick={onClearFeatures}>
                            <Trash2 size={20}/>
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
}