import React, { useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Premium gold marker icon for ORIGEN branding
export const goldMarkerIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42">
            <defs>
                <linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#c8a55a"/>
                    <stop offset="100%" style="stop-color:#9a7b3a"/>
                </linearGradient>
                <filter id="s" x="-20%" y="-10%" width="140%" height="130%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#000" flood-opacity="0.3"/>
                </filter>
            </defs>
            <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="url(#g)" filter="url(#s)"/>
            <circle cx="12" cy="12" r="5" fill="#0a0a0a"/>
            <circle cx="12" cy="12" r="2.5" fill="#c8a55a"/>
        </svg>
    `),
    iconSize: [28, 42],
    iconAnchor: [14, 42],
    popupAnchor: [0, -42],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41],
});

// Highlighted marker for hover state
export const goldMarkerHighlightIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="34" height="50">
            <defs>
                <linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#e8c56a"/>
                    <stop offset="100%" style="stop-color:#c8a55a"/>
                </linearGradient>
                <filter id="s" x="-20%" y="-10%" width="140%" height="130%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#c8a55a" flood-opacity="0.5"/>
                </filter>
            </defs>
            <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="url(#g)" filter="url(#s)"/>
            <circle cx="12" cy="12" r="5" fill="#0a0a0a"/>
            <circle cx="12" cy="12" r="2.5" fill="#e8c56a"/>
        </svg>
    `),
    iconSize: [34, 50],
    iconAnchor: [17, 50],
    popupAnchor: [0, -50],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [10, 41],
});

// CartoDB Dark Matter tiles — premium dark theme
const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const DARK_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

// Default center: Posadas, Misiones, Argentina
export const DEFAULT_CENTER = [-27.3671, -55.8960];
export const DEFAULT_ZOOM = 13;

const MapView = ({
    center = DEFAULT_CENTER,
    zoom = DEFAULT_ZOOM,
    children,
    className = '',
    style = {},
    scrollWheelZoom = true,
    ...props
}) => {
    return (
        <MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom={scrollWheelZoom}
            className={className}
            style={{ width: '100%', height: '100%', ...style }}
            {...props}
        >
            <TileLayer url={DARK_TILES} attribution={DARK_ATTRIBUTION} />
            {children}
        </MapContainer>
    );
};

export default MapView;
