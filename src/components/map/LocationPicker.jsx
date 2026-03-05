import React, { useState, useCallback } from 'react';
import { Marker, useMapEvents } from 'react-leaflet';
import { MapPin } from 'lucide-react';
import MapView, { goldMarkerIcon, DEFAULT_CENTER } from './MapView';

const ClickHandler = ({ onClick }) => {
    useMapEvents({
        click(e) {
            onClick(e.latlng);
        },
    });
    return null;
};

const LocationPicker = ({ latitude, longitude, onChange }) => {
    const hasCoords = latitude != null && longitude != null && latitude !== '' && longitude !== '';
    const position = hasCoords ? [Number(latitude), Number(longitude)] : null;
    const center = position || DEFAULT_CENTER;

    const handleMapClick = useCallback((latlng) => {
        onChange({
            latitude: parseFloat(latlng.lat.toFixed(6)),
            longitude: parseFloat(latlng.lng.toFixed(6)),
        });
    }, [onChange]);

    const handleMarkerDrag = useCallback((e) => {
        const latlng = e.target.getLatLng();
        onChange({
            latitude: parseFloat(latlng.lat.toFixed(6)),
            longitude: parseFloat(latlng.lng.toFixed(6)),
        });
    }, [onChange]);

    return (
        <div className="space-y-4">
            {/* Manual coordinate inputs */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-primary-950 block mb-2">
                        Latitud
                    </label>
                    <input
                        type="number"
                        step="any"
                        value={latitude || ''}
                        onChange={(e) => onChange({
                            latitude: e.target.value ? parseFloat(e.target.value) : null,
                            longitude: longitude || null,
                        })}
                        className="w-full px-4 py-3 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-primary-300 transition-colors"
                        placeholder="-27.3671"
                    />
                </div>
                <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-primary-950 block mb-2">
                        Longitud
                    </label>
                    <input
                        type="number"
                        step="any"
                        value={longitude || ''}
                        onChange={(e) => onChange({
                            latitude: latitude || null,
                            longitude: e.target.value ? parseFloat(e.target.value) : null,
                        })}
                        className="w-full px-4 py-3 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-primary-300 transition-colors"
                        placeholder="-55.8960"
                    />
                </div>
            </div>

            {/* Help text */}
            <p className="text-[10px] text-primary-300 flex items-center gap-1.5">
                <MapPin size={12} className="text-gold-500" />
                Hacé clic en el mapa para marcar la ubicación de la propiedad. Podés arrastrar el marcador para ajustar.
            </p>

            {/* Map */}
            <div className="rounded-sm overflow-hidden border border-gray-100" style={{ height: '320px' }}>
                <MapView
                    center={center}
                    zoom={position ? 15 : 13}
                    scrollWheelZoom={true}
                    key={`${center[0]}-${center[1]}`}
                >
                    <ClickHandler onClick={handleMapClick} />
                    {position && (
                        <Marker
                            position={position}
                            icon={goldMarkerIcon}
                            draggable={true}
                            eventHandlers={{ dragend: handleMarkerDrag }}
                        />
                    )}
                </MapView>
            </div>
        </div>
    );
};

export default LocationPicker;
