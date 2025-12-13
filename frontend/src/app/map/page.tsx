"use client";

import { useEffect, useState, useRef } from "react";
import { FeatureGroup, MapContainer, TileLayer } from "react-leaflet";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MapControls from "@/components/map/MapControls";
import NavBar from "@/components/common/NavBar";
import { Page } from "@/types";


export default function MapPage() {
    const map = useRef(null);
    const featureGroup = useRef(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        if (map.current) {
            setTimeout(() => {
                map.current?.invalidateSize();
            }, 300);
        }
    }, [sidebarOpen])

return (
    <div className="h-[100vh] flex flex-col lg:flex-row overflow-hidden bg-white relative"> 
        {/* <NavBar page={Page.MAP} className="order-3" /> */}
        <div className="flex-1 relative bg-gray-200 z-0 order-1">
            <MapContainer ref={map} center={[21.0285, 105.8542]} zoom={13} style={{ width: "100%", height: "100%" }}>
                <TileLayer url={process.env.MAP_IMAGE_LAYER_URL} />
                <TileLayer url={process.env.MAP_REFERENCE_LAYER_URL} />
                <FeatureGroup ref={featureGroup} />
                <MapControls featureGroup={featureGroup} />
            </MapContainer>

            {!sidebarOpen && (
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="absolute top-4 right-4 z-[400] bg-white rounded-full text-forest p-2 shadow-xl cursor-pointer transition-all transform hover:scale-120"
                    title="Open Tools"
                >
                    <ChevronLeft size={20} />
                </button>
            )}
        </div>

        <div
            className={
                `bg-sand flex flex-col
                    overflow-hidden z-10 shadow-xl scrollbar-thin 
                    transition-all duration-300 ease-in-out order-2
                    ${sidebarOpen ? 'w-full lg:w-96 translate-x-0 opacity-100' : 'w-0 lg:w-0 translate-x-full opacity-0'}`
            }>
            <div className="w-full lg:w-96 min-w-[24rem] p-6 h-full overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="font-serif text-3xl text-forest font-bold mb-2">Land Analysis</h2>
                        <p className="text-charcoal/70 text-sm">Use satellite imagery to estimate biomass and carbon credit potential.</p>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-forest transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    </div>
);
}