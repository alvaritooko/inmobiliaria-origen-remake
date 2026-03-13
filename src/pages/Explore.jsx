import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import { Search, Loader2, MapPin, Map as MapIcon, List, PenTool, X, Layers, Bed, Bath, Maximize, ArrowUpRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/layout/Navbar';
import PropertyCard from '../components/properties/PropertyCard';
import MapView, { goldMarkerIcon, goldMarkerHighlightIcon, DEFAULT_CENTER, MAP_STYLES } from '../components/map/MapView';
import PropertyMapPopup from '../components/map/PropertyMapPopup';
import { Link } from 'react-router-dom';
import L from 'leaflet';

/* ── Point-in-polygon check (ray casting algorithm) ── */
const isPointInPolygon = (lat, lng, polygon) => {
    const vertices = polygon;
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
        const xi = vertices[i][0], yi = vertices[i][1];
        const xj = vertices[j][0], yj = vertices[j][1];
        const intersect = ((yi > lng) !== (yj > lng))
            && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};

/* ── Component to auto-fit map bounds to markers ── */
const FitBounds = ({ properties }) => {
    const map = useMap();

    useEffect(() => {
        const coords = properties
            .filter(p => p.latitude && p.longitude)
            .map(p => [p.latitude, p.longitude]);

        if (coords.length > 0) {
            const bounds = L.latLngBounds(coords);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        }
    }, [properties, map]);

    return null;
};

/* ── Custom Freehand Draw Controller (gold color) ── */
const DRAW_STYLE = {
    color: '#c8a55a',
    weight: 3,
    opacity: 0.9,
    fillColor: '#c8a55a',
    fillOpacity: 0.15,
};

const DrawController = ({ onZoneCreated, onZoneRemoved, isDrawing, setIsDrawing }) => {
    const map = useMap();
    const activeRef = useRef(false);
    const drawingNow = useRef(false);
    const pointsRef = useRef([]);
    const polylineRef = useRef(null);
    const polygonRef = useRef(null);

    const clearDrawing = useCallback(() => {
        if (polylineRef.current) {
            map.removeLayer(polylineRef.current);
            polylineRef.current = null;
        }
        if (polygonRef.current) {
            map.removeLayer(polygonRef.current);
            polygonRef.current = null;
        }
        pointsRef.current = [];
    }, [map]);

    // Convert screen point to LatLng (works for both mouse and touch)
    const getLatLng = useCallback((e) => {
        const rect = map.getContainer().getBoundingClientRect();
        let clientX, clientY;

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else if (e.changedTouches && e.changedTouches.length > 0) {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        return map.containerPointToLatLng(L.point(clientX - rect.left, clientY - rect.top));
    }, [map]);

    useEffect(() => {
        if (!map) return;
        const container = map.getContainer();

        const onStart = (e) => {
            if (!activeRef.current) return;
            e.preventDefault();
            e.stopPropagation();
            drawingNow.current = true;
            clearDrawing();

            const latlng = getLatLng(e);
            pointsRef.current = [latlng];
            polylineRef.current = L.polyline([latlng], {
                color: DRAW_STYLE.color,
                weight: DRAW_STYLE.weight,
                opacity: DRAW_STYLE.opacity,
            }).addTo(map);
        };

        const onMove = (e) => {
            if (!activeRef.current || !drawingNow.current || !polylineRef.current) return;
            e.preventDefault();
            e.stopPropagation();
            const latlng = getLatLng(e);
            pointsRef.current.push(latlng);
            polylineRef.current.addLatLng(latlng);
        };

        const onEnd = (e) => {
            if (!activeRef.current || !drawingNow.current || !polylineRef.current) return;
            e.preventDefault();
            drawingNow.current = false;

            const points = pointsRef.current;
            if (polylineRef.current) {
                map.removeLayer(polylineRef.current);
                polylineRef.current = null;
            }

            if (points.length > 2) {
                polygonRef.current = L.polygon(points, DRAW_STYLE).addTo(map);
                const polygon = points.map(ll => [ll.lat, ll.lng]);
                onZoneCreated(polygon);
            }

            activeRef.current = false;
            setIsDrawing(false);
        };

        // Native DOM events — captures touches BEFORE Leaflet can
        container.addEventListener('mousedown', onStart);
        container.addEventListener('mousemove', onMove);
        container.addEventListener('mouseup', onEnd);
        container.addEventListener('touchstart', onStart, { passive: false });
        container.addEventListener('touchmove', onMove, { passive: false });
        container.addEventListener('touchend', onEnd, { passive: false });

        map._clearDrawnZone = () => {
            clearDrawing();
            onZoneRemoved();
        };

        return () => {
            container.removeEventListener('mousedown', onStart);
            container.removeEventListener('mousemove', onMove);
            container.removeEventListener('mouseup', onEnd);
            container.removeEventListener('touchstart', onStart);
            container.removeEventListener('touchmove', onMove);
            container.removeEventListener('touchend', onEnd);
            delete map._clearDrawnZone;
        };
    }, [map, onZoneCreated, onZoneRemoved, setIsDrawing, clearDrawing, getLatLng]);

    useEffect(() => {
        activeRef.current = isDrawing;
        if (map) {
            map.getContainer().style.cursor = isDrawing ? 'crosshair' : '';
            if (isDrawing) {
                map.dragging.disable();
                map.touchZoom.disable();
                map.doubleClickZoom.disable();
            } else {
                map.dragging.enable();
                map.touchZoom.enable();
                map.doubleClickZoom.enable();
            }
        }
    }, [isDrawing, map]);

    return null;
};

const Explore = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [hoveredId, setHoveredId] = useState(null);
    const [showMobileMap, setShowMobileMap] = useState(true);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawnZone, setDrawnZone] = useState(null);
    const [mapStyle, setMapStyle] = useState('dark');
    const [showStyleMenu, setShowStyleMenu] = useState(false);
    const [showPanel, setShowPanel] = useState(false);
    const markerRefs = useRef({});
    const mapRef = useRef(null);

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('status', 'published')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching properties:', error);
        } else {
            const mapped = (data || []).map(p => ({
                ...p,
                beds: p.bedrooms || 0,
                baths: p.bathrooms || 0,
                area: p.area_m2 ? `${p.area_m2}m²` : '—',
                images: p.images?.length ? p.images : ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop'],
                location: p.city ? `${p.city}, ${p.province || ''}` : p.location || 'Sin ubicación',
            }));
            setProperties(mapped);
        }
        setLoading(false);
    };

    const handleZoneCreated = useCallback((polygon) => {
        setDrawnZone(polygon);
        setShowPanel(true);
    }, []);

    const handleZoneRemoved = useCallback(() => {
        setDrawnZone(null);
    }, []);

    const clearZone = useCallback(() => {
        if (mapRef.current?._clearDrawnZone) {
            mapRef.current._clearDrawnZone();
        }
        setDrawnZone(null);
        setIsDrawing(false);
    }, []);

    const toggleDraw = useCallback(() => {
        if (isDrawing) {
            setIsDrawing(false);
        } else {
            // Clear previous zone first
            clearZone();
            setIsDrawing(true);
        }
    }, [isDrawing, clearZone]);

    const filtered = useMemo(() => {
        let result = properties;

        if (filter !== 'all') {
            result = result.filter(p => p.type === filter);
        }

        if (search) {
            const q = search.toLowerCase();
            result = result.filter(p =>
                p.title?.toLowerCase().includes(q) ||
                p.location?.toLowerCase().includes(q) ||
                p.city?.toLowerCase().includes(q) ||
                p.province?.toLowerCase().includes(q)
            );
        }

        // Filter by drawn zone
        if (drawnZone) {
            result = result.filter(p =>
                p.latitude && p.longitude && isPointInPolygon(p.latitude, p.longitude, drawnZone)
            );
        }

        return result;
    }, [properties, filter, search, drawnZone]);

    const propertiesWithCoords = useMemo(
        () => filtered.filter(p => p.latitude && p.longitude),
        [filtered]
    );

    // Ref callback to get the map instance
    const MapRefSetter = () => {
        const map = useMap();
        useEffect(() => {
            mapRef.current = map;
        }, [map]);
        return null;
    };

    return (
        <div className="bg-[#fdfdfd] h-screen flex flex-col overflow-hidden">
            <Navbar />

            {/* Top Bar — glass-morphism matching Home design */}
            <div className="pt-20 glass-morphism text-primary-950 px-6 py-5 z-30 flex-shrink-0">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <MapIcon size={18} className="text-gold-600" />
                        <h1 className="text-lg font-display font-light uppercase tracking-[0.2em] text-primary-950">
                            Explorar <span className="font-bold italic">Mapa</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap justify-center">
                        {/* Filter buttons — matching Home style */}
                        <div className="flex gap-2">
                            {[
                                { key: 'all', label: 'Todas' },
                                { key: 'sale', label: 'Venta' },
                                { key: 'rent', label: 'Alquiler' },
                                { key: 'investment', label: 'Inversión' },
                            ].map(f => (
                                <button
                                    key={f.key}
                                    onClick={() => { setFilter(f.key); if (f.key !== 'all') setShowPanel(true); }}
                                    className="px-4 py-2.5 rounded-sm text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 bg-primary-950 text-white shadow-xl hover:scale-105"
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={toggleDraw}
                            className="hidden md:flex px-4 py-2.5 rounded-sm text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 items-center gap-2 bg-primary-950 text-white shadow-xl hover:scale-105"
                        >
                            <PenTool size={12} />
                            {isDrawing ? 'Dibujando...' : 'Dibujar Zona'}
                        </button>

                        {/* Clear Zone Button (desktop only) */}
                        {drawnZone && (
                            <button
                                onClick={clearZone}
                                className="hidden md:flex px-3 py-2.5 rounded-sm text-[9px] font-bold uppercase tracking-[0.2em] bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all items-center gap-1"
                            >
                                <X size={12} /> Borrar Zona
                            </button>
                        )}

                        {/* Search */}
                        <div className="relative w-full md:w-72">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); if (e.target.value) setShowPanel(true); }}
                                placeholder="Buscar ubicación..."
                                className="w-full pl-9 pr-4 py-2.5 bg-primary-950/10 border border-primary-200/30 rounded-sm text-sm text-primary-950 placeholder-primary-300 focus:outline-none focus:border-gold-500/50 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Mobile buttons: toggle + draw zone */}
                    <div className="md:hidden flex items-center gap-2">
                        <button
                            onClick={() => setShowMobileMap(!showMobileMap)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-primary-950 text-white rounded-sm text-[9px] font-bold uppercase tracking-[0.2em] shadow-xl"
                        >
                            {showMobileMap ? <><List size={14} /> Ver Lista</> : <><MapIcon size={14} /> Ver Mapa</>}
                        </button>
                        <button
                            onClick={toggleDraw}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-sm text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 bg-primary-950 text-white shadow-xl hover:scale-105"
                        >
                            <PenTool size={12} />
                            {isDrawing ? 'Dibujando...' : 'Dibujar Zona'}
                        </button>
                        {drawnZone && (
                            <button
                                onClick={clearZone}
                                className="flex items-center gap-1 px-3 py-2.5 rounded-sm text-[9px] font-bold uppercase tracking-[0.2em] bg-red-500/10 text-red-500 transition-all"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Drawing instructions banner */}
            {isDrawing && (
                <div className="bg-gold-500 text-primary-950 px-6 py-3 text-center flex-shrink-0 z-20">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">
                        <PenTool size={12} className="inline mr-2" />
                        Hacé clic sostenido y arrastrá para dibujar la zona · Soltá para cerrar el polígono
                    </p>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Property List (left panel) */}
                <div className={`w-full md:w-[420px] lg:w-[480px] flex-shrink-0 overflow-y-auto border-r border-gray-100 bg-white transition-all duration-300 ${showMobileMap ? 'hidden' : 'block'} ${showPanel ? 'md:block' : 'md:hidden'}`}>
                    <div className="p-6">
                        <p className="text-[10px] text-primary-400 font-bold uppercase tracking-widest mb-6">
                            {filtered.length} propiedad{filtered.length !== 1 ? 'es' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
                            {drawnZone && (
                                <span className="text-gold-600 ml-1">
                                    · filtrado por zona
                                </span>
                            )}
                            {!drawnZone && propertiesWithCoords.length < filtered.length && (
                                <span className="text-primary-300 ml-1">
                                    · {propertiesWithCoords.length} en mapa
                                </span>
                            )}
                        </p>

                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 size={24} className="animate-spin text-primary-400" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-20">
                                <MapPin size={32} className="mx-auto text-primary-200 mb-4" />
                                <p className="text-primary-300 text-sm">
                                    {drawnZone ? 'No hay propiedades en la zona dibujada' : 'No se encontraron propiedades'}
                                </p>
                                {drawnZone && (
                                    <button
                                        onClick={clearZone}
                                        className="mt-4 text-[10px] font-bold uppercase tracking-widest text-gold-600 hover:text-gold-700 transition-colors"
                                    >
                                        Borrar zona y ver todas
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {filtered.map(prop => (
                                    <div
                                        key={prop.id}
                                        onMouseEnter={() => setHoveredId(prop.id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                        className={`transition-all duration-200 rounded-sm ${hoveredId === prop.id ? 'ring-2 ring-gold-400/50 ring-offset-2' : ''}`}
                                    >
                                        <PropertyCard property={prop} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Map (right panel) */}
                <div className={`flex-1 relative ${showMobileMap ? 'block' : 'hidden md:block'}`}>
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-primary-950/90">
                            <Loader2 size={32} className="animate-spin text-gold-500" />
                        </div>
                    ) : (
                        <MapView
                            center={DEFAULT_CENTER}
                            zoom={12}
                            scrollWheelZoom={true}
                            tileStyle={mapStyle}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <MapRefSetter />
                            <FitBounds properties={propertiesWithCoords} />
                            <DrawController
                                onZoneCreated={handleZoneCreated}
                                onZoneRemoved={handleZoneRemoved}
                                isDrawing={isDrawing}
                                setIsDrawing={setIsDrawing}
                            />
                            {propertiesWithCoords.map(prop => (
                                <Marker
                                    key={prop.id}
                                    position={[prop.latitude, prop.longitude]}
                                    icon={hoveredId === prop.id ? goldMarkerHighlightIcon : goldMarkerIcon}
                                    ref={(ref) => { if (ref) markerRefs.current[prop.id] = ref; }}
                                    eventHandlers={{
                                        mouseover: () => setHoveredId(prop.id),
                                        mouseout: () => setHoveredId(null),
                                    }}
                                >
                                    <Popup
                                        closeButton={false}
                                        className="origen-popup"
                                        maxWidth={280}
                                    >
                                        <PropertyMapPopup property={prop} />
                                    </Popup>
                                </Marker>
                            ))}
                        </MapView>
                    )}

                    {/* Panel toggle button (desktop only) */}
                    <button
                        onClick={() => setShowPanel(!showPanel)}
                        className="hidden md:flex absolute top-24 left-4 z-[1000] bg-primary-950/80 backdrop-blur-sm text-white p-2.5 rounded-sm shadow-lg hover:bg-primary-950 transition-all items-center gap-2"
                        title={showPanel ? 'Ocultar lista' : 'Ver lista de propiedades'}
                    >
                        <List size={16} className="text-gold-500" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.15em]">
                            {showPanel ? 'Ocultar' : 'Ver Lista'}
                        </span>
                    </button>

                    {/* Map style switcher */}
                    <div className="absolute top-4 right-4 z-[1000]">
                        <button
                            onClick={() => setShowStyleMenu(!showStyleMenu)}
                            className="bg-primary-950/80 backdrop-blur-sm text-white p-2.5 rounded-sm shadow-lg hover:bg-primary-950 transition-all"
                            title="Cambiar estilo de mapa"
                        >
                            <Layers size={16} className="text-gold-500" />
                        </button>
                        {showStyleMenu && (
                            <div className="absolute right-0 mt-2 bg-primary-950/95 backdrop-blur-sm rounded-sm shadow-xl overflow-hidden min-w-[140px]">
                                {Object.entries(MAP_STYLES).map(([key, s]) => (
                                    <button
                                        key={key}
                                        onClick={() => { setMapStyle(key); setShowStyleMenu(false); }}
                                        className={`w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-all ${mapStyle === key
                                            ? 'bg-gold-500 text-primary-950'
                                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        {s.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Mobile bottom carousel — only when zone is drawn */}
                    {showMobileMap && drawnZone && filtered.length > 0 && (
                        <div className="md:hidden absolute bottom-0 left-0 right-0 z-[1000] pb-3">
                            {/* Count badge */}
                            <div className="px-3 pb-1.5">
                                <span className="inline-block bg-primary-950/80 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-sm text-[8px] uppercase tracking-[0.2em] font-bold">
                                    <MapPin size={8} className="inline text-gold-500 mr-1" />
                                    {filtered.length} propiedad{filtered.length !== 1 ? 'es' : ''} en zona
                                </span>
                            </div>
                            {/* Scrollable cards */}
                            <div className="flex gap-2 overflow-x-auto px-3 snap-x snap-mandatory scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
                                {filtered.map(prop => {
                                    const img = prop.images?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=400&auto=format&fit=crop';
                                    const typeLabels = { sale: 'Venta', rent: 'Alquiler', investment: 'Inversión' };
                                    return (
                                        <Link
                                            to={`/propiedad/${prop.id}`}
                                            key={prop.id}
                                            className="flex-shrink-0 w-[160px] snap-start bg-primary-950/95 backdrop-blur-sm rounded-sm overflow-hidden shadow-xl border border-white/10"
                                        >
                                            <div className="relative h-[70px]">
                                                <img src={img} alt={prop.title} className="w-full h-full object-cover" />
                                                <div className="absolute top-1 left-1 bg-gold-500 px-1 py-[1px] text-[6px] uppercase font-bold tracking-[0.1em] text-primary-950">
                                                    {typeLabels[prop.type] || 'Venta'}
                                                </div>
                                            </div>
                                            <div className="p-2 space-y-1">
                                                <h4 className="text-[10px] font-bold text-white leading-tight line-clamp-1">
                                                    {prop.title}
                                                </h4>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-bold text-gold-500">
                                                        {prop.currency || 'USD'} {prop.price?.toLocaleString()}
                                                    </span>
                                                    <ArrowUpRight size={10} className="text-gold-500" />
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Properties count overlay (desktop only) */}
                    <div className="hidden md:block absolute bottom-6 left-6 z-[1000] bg-primary-950/90 backdrop-blur-sm text-white px-4 py-2 rounded-sm pointer-events-none">
                        <span className="text-[9px] uppercase tracking-[0.2em] font-bold">
                            <MapPin size={10} className="inline text-gold-500 mr-1" />
                            {propertiesWithCoords.length} propiedades en el mapa
                            {drawnZone && ' (zona filtrada)'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Explore;
