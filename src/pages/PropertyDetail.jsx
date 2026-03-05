import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Bed, Bath, Maximize, MapPin, ArrowLeft, Phone, Mail, Share2, Heart, Loader2, User, ChevronLeft, ChevronRight, X, Play } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import MapView, { goldMarkerIcon } from '../components/map/MapView';
import { Marker } from 'react-leaflet';

/* ── Lightbox Component (supports images + optional YouTube video as last item) ── */
const Lightbox = ({ items, startIndex, onClose }) => {
    const [current, setCurrent] = useState(startIndex);

    const prev = useCallback(() => setCurrent(i => (i - 1 + items.length) % items.length), [items.length]);
    const next = useCallback(() => setCurrent(i => (i + 1) % items.length), [items.length]);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
        };
        window.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [onClose, prev, next]);

    const [touchStart, setTouchStart] = useState(null);
    const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
    const handleTouchEnd = (e) => {
        if (touchStart === null) return;
        const diff = touchStart - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 60) {
            diff > 0 ? next() : prev();
        }
        setTouchStart(null);
    };

    const currentItem = items[current];
    const isVideo = currentItem?.type === 'video';

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <button onClick={onClose} className="absolute top-6 right-6 z-10 p-3 text-white/70 hover:text-white transition-colors">
                <X size={28} />
            </button>
            <div className="absolute top-6 left-6 z-10 text-white/60 text-sm font-bold tracking-widest">
                {current + 1} / {items.length}
            </div>
            {items.length > 1 && (
                <button onClick={prev} className="absolute left-4 z-10 p-3 text-white/50 hover:text-white transition-colors">
                    <ChevronLeft size={36} />
                </button>
            )}
            {isVideo ? (
                <div className="w-[90vw] max-w-4xl aspect-video">
                    <iframe
                        src={`https://www.youtube.com/embed/${currentItem.videoId}?autoplay=1`}
                        title="Video"
                        className="w-full h-full rounded-sm"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            ) : (
                <img
                    src={currentItem?.src}
                    alt={`Foto ${current + 1}`}
                    className="max-h-[85vh] max-w-[90vw] object-contain select-none"
                    draggable={false}
                />
            )}
            {items.length > 1 && (
                <button onClick={next} className="absolute right-4 z-10 p-3 text-white/50 hover:text-white transition-colors">
                    <ChevronRight size={36} />
                </button>
            )}
            {items.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto pb-1 px-2">
                    {items.map((item, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`flex-shrink-0 w-16 h-12 rounded-sm overflow-hidden border-2 transition-all ${i === current ? 'border-white opacity-100' : 'border-transparent opacity-40 hover:opacity-70'
                                }`}
                        >
                            {item.type === 'video' ? (
                                <div className="w-full h-full bg-primary-950 flex items-center justify-center">
                                    <Play size={14} className="text-white" fill="white" />
                                </div>
                            ) : (
                                <img src={item.src} alt="" className="w-full h-full object-cover" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ── PropertyDetail Page ── */
const PropertyDetail = () => {
    const { id } = useParams();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [agent, setAgent] = useState(null);
    const [lightbox, setLightbox] = useState({ open: false, index: 0 });

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchProperty();
    }, [id]);

    const fetchProperty = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching property:', error);
            setLoading(false);
            return;
        }

        setProperty(data);

        if (data?.agent_id) {
            const { data: agentData } = await supabase
                .from('profiles')
                .select('full_name, phone, email, role')
                .eq('id', data.agent_id)
                .single();
            if (agentData) setAgent(agentData);
        }
        setLoading(false);
    };

    const openLightbox = (index) => setLightbox({ open: true, index });
    const closeLightbox = () => setLightbox({ open: false, index: 0 });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-primary-400" />
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-lg text-primary-400">Propiedad no encontrada</p>
                <Link to="/" className="text-sm font-bold uppercase tracking-widest text-primary-950 hover:underline">
                    ← Volver al inicio
                </Link>
            </div>
        );
    }

    const beds = property.bedrooms || 0;
    const baths = property.bathrooms || 0;
    const area = property.area_m2 ? `${property.area_m2}m²` : '—';
    const location = property.city ? `${property.city}, ${property.province || ''}` : property.location || '';
    const images = property.images?.length ? property.images : [];
    const typeLabels = { sale: 'Venta', rent: 'Alquiler', investment: 'Inversión' };
    const typeLabel = typeLabels[property.type] || 'Venta';

    // Extract YouTube video ID
    const getYouTubeId = (url) => {
        if (!url) return null;
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/);
        return match ? match[1] : null;
    };
    const youtubeId = getYouTubeId(property.video_url);
    const currencyLabel = property.currency || 'USD';

    // Build gallery items (images + optional video)
    const galleryItems = [
        ...images.map(src => ({ type: 'image', src })),
        ...(youtubeId ? [{ type: 'video', videoId: youtubeId }] : []),
    ];

    return (
        <div className="bg-[#fdfdfd] min-h-screen">
            {lightbox.open && galleryItems.length > 0 && (
                <Lightbox items={galleryItems} startIndex={lightbox.index} onClose={closeLightbox} />
            )}

            <Navbar />

            <main className="pt-20 px-6 max-w-7xl mx-auto pb-32">
                {/* Header */}
                <div className="py-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="space-y-3">
                        <h1 className="text-3xl md:text-5xl font-display font-light text-primary-950 leading-tight">
                            {property.title}
                        </h1>
                        <div className="flex items-center gap-2 text-primary-400">
                            <MapPin size={16} />
                            <span className="text-sm uppercase tracking-[0.2em] font-medium">{location}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-primary-400 font-bold block mb-2">Precio de {typeLabel}</span>
                        <span className="text-3xl md:text-4xl font-display font-light text-primary-950">{currencyLabel} {property.price?.toLocaleString()}</span>
                    </div>
                </div>

                {/* Gallery Grid — 1 large left + up to 4 right */}
                {galleryItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-sm overflow-hidden mb-12 h-auto md:h-[480px]">
                        {/* Main large image (left, spans 2 cols + full height) */}
                        <div
                            className="md:col-span-2 md:row-span-2 cursor-pointer overflow-hidden relative group"
                            onClick={() => openLightbox(0)}
                        >
                            {galleryItems[0].type === 'video' ? (
                                <div className="w-full h-full min-h-[300px] bg-primary-950 flex items-center justify-center">
                                    <Play size={48} className="text-white opacity-80 group-hover:opacity-100 transition-opacity" fill="white" />
                                </div>
                            ) : (
                                <img
                                    src={galleryItems[0].src}
                                    className="w-full h-full min-h-[300px] object-cover group-hover:scale-[1.02] transition-transform duration-500"
                                    alt={property.title}
                                />
                            )}
                        </div>

                        {/* Right side — up to 4 smaller items in 2x2 grid */}
                        {galleryItems.slice(1, 5).map((item, i) => (
                            <div
                                key={i + 1}
                                className="cursor-pointer overflow-hidden relative group hidden md:block"
                                onClick={() => openLightbox(i + 1)}
                            >
                                {item.type === 'video' ? (
                                    <div className="w-full h-full min-h-[140px] bg-primary-950 flex items-center justify-center">
                                        <Play size={28} className="text-white opacity-80 group-hover:opacity-100 transition-opacity" fill="white" />
                                    </div>
                                ) : (
                                    <img
                                        src={item.src}
                                        className="w-full h-full min-h-[140px] object-cover group-hover:scale-105 transition-transform duration-500"
                                        alt={`Foto ${i + 2}`}
                                    />
                                )}

                                {/* "Ver todas las fotos" button on last visible slot */}
                                {i === 3 && galleryItems.length > 5 && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <span className="text-white text-[10px] uppercase font-bold tracking-[0.2em]">
                                            +{galleryItems.length - 5} fotos más
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* "Ver todas" button */}
                        {galleryItems.length > 1 && (
                            <button
                                onClick={() => openLightbox(0)}
                                className="md:hidden mt-2 w-full py-3 bg-primary-950 text-white text-[10px] uppercase font-bold tracking-[0.2em] rounded-sm"
                            >
                                Ver todas las fotos ({galleryItems.length})
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="w-full h-[300px] bg-gray-100 flex items-center justify-center rounded-sm mb-12">
                        <p className="text-primary-300 text-sm">Sin imágenes</p>
                    </div>
                )}

                {/* Content */}
                <div className="grid md:grid-cols-12 gap-16">
                    <div className="md:col-span-8 space-y-12">
                        {/* Quick Stats */}
                        <div className="flex items-center gap-12 py-8 border-y border-gray-100">
                            <div className="space-y-1 text-center md:text-left">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-primary-400">Dormitorios</span>
                                <div className="flex items-center justify-center md:justify-start gap-2 text-primary-950">
                                    <Bed size={20} /> <span className="text-xl font-display font-light">{beds}</span>
                                </div>
                            </div>
                            <div className="space-y-1 text-center md:text-left">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-primary-400">Baños</span>
                                <div className="flex items-center justify-center md:justify-start gap-2 text-primary-950">
                                    <Bath size={20} /> <span className="text-xl font-display font-light">{baths}</span>
                                </div>
                            </div>
                            <div className="space-y-1 text-center md:text-left">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-primary-400">Superficie</span>
                                <div className="flex items-center justify-center md:justify-start gap-2 text-primary-950">
                                    <Maximize size={20} /> <span className="text-xl font-display font-light">{area}</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {property.description && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-display font-bold uppercase tracking-tight text-primary-950">Descripción</h3>
                                <p className="text-primary-600 font-light leading-relaxed text-lg whitespace-pre-line">
                                    {property.description}
                                </p>
                            </div>
                        )}

                        {/* Property Details */}
                        <div className="space-y-6">
                            <h3 className="text-2xl font-display font-bold uppercase tracking-tight text-primary-950">Detalles</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-primary-400">Tipo</span>
                                    <p className="text-sm text-primary-950 capitalize">{property.property_type || '—'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-primary-400">Operación</span>
                                    <p className="text-sm text-primary-950">{typeLabel}</p>
                                </div>
                                {property.address && (
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-primary-400">Dirección</span>
                                        <p className="text-sm text-primary-950">{property.address}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Location Map */}
                        {property.latitude && property.longitude && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-display font-bold uppercase tracking-tight text-primary-950">Ubicación</h3>
                                <div className="rounded-sm overflow-hidden border border-gray-100 shadow-sm" style={{ height: '360px' }}>
                                    <MapView
                                        center={[property.latitude, property.longitude]}
                                        zoom={15}
                                        scrollWheelZoom={false}
                                    >
                                        <Marker
                                            position={[property.latitude, property.longitude]}
                                            icon={goldMarkerIcon}
                                        />
                                    </MapView>
                                </div>
                                {property.address && (
                                    <div className="flex items-center gap-2 text-primary-400">
                                        <MapPin size={14} className="text-gold-500" />
                                        <span className="text-sm font-light">{property.address}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar / Agent */}
                    <div className="md:col-span-4">
                        <div className="bg-white border border-gray-100 p-8 rounded-sm shadow-sm sticky top-28">
                            <h4 className="text-[10px] uppercase font-bold tracking-[0.3em] text-gold-600 mb-8">Consultar por esta propiedad</h4>

                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <User size={24} className="text-primary-400" />
                                </div>
                                <div>
                                    <h5 className="font-display font-bold text-primary-950 uppercase tracking-tight text-sm">
                                        {agent?.full_name || 'Origen Inmobiliaria'}
                                    </h5>
                                    <span className="text-[10px] text-primary-400 uppercase tracking-widest font-medium">
                                        {agent?.role === 'admin' ? 'Gerente' : 'Agente'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <a
                                    href={agent?.phone ? `https://wa.me/${agent.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, estoy interesado en la propiedad: ${property.title}`)}` : '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-primary-950 text-white py-4 rounded-sm font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 hover:bg-primary-800 transition-all text-center"
                                >
                                    <Phone size={14} /> Contactar por WhatsApp
                                </a>
                                <a
                                    href={agent?.email ? `mailto:${agent.email}?subject=${encodeURIComponent(`Consulta por propiedad: ${property.title}`)}` : '#'}
                                    className="w-full border border-primary-200 text-primary-950 py-4 rounded-sm font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 hover:border-primary-950 transition-all text-center"
                                >
                                    <Mail size={14} /> Enviar Mensaje
                                </a>
                            </div>

                            <div className="mt-8 pt-8 border-t border-gray-50">
                                <p className="text-[9px] text-primary-300 uppercase leading-relaxed text-center font-bold tracking-widest">
                                    Al contactar, aceptas nuestros términos de servicio y políticas de privacidad.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PropertyDetail;
