import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Bed, Bath, Maximize, MapPin, ArrowLeft, Phone, Mail, Share2, Heart, Loader2, User, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Navbar from '../components/layout/Navbar';

/* ── Lightbox Component ── */
const Lightbox = ({ images, startIndex, onClose }) => {
    const [current, setCurrent] = useState(startIndex);

    const prev = useCallback(() => setCurrent(i => (i - 1 + images.length) % images.length), [images.length]);
    const next = useCallback(() => setCurrent(i => (i + 1) % images.length), [images.length]);

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
                {current + 1} / {images.length}
            </div>
            {images.length > 1 && (
                <button onClick={prev} className="absolute left-4 z-10 p-3 text-white/50 hover:text-white transition-colors">
                    <ChevronLeft size={36} />
                </button>
            )}
            <img
                src={images[current]}
                alt={`Foto ${current + 1}`}
                className="max-h-[85vh] max-w-[90vw] object-contain select-none"
                draggable={false}
            />
            {images.length > 1 && (
                <button onClick={next} className="absolute right-4 z-10 p-3 text-white/50 hover:text-white transition-colors">
                    <ChevronRight size={36} />
                </button>
            )}
            {images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto pb-1 px-2">
                    {images.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`flex-shrink-0 w-16 h-12 rounded-sm overflow-hidden border-2 transition-all ${i === current ? 'border-white opacity-100' : 'border-transparent opacity-40 hover:opacity-70'
                                }`}
                        >
                            <img src={img} alt="" className="w-full h-full object-cover" />
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
    const typeLabel = property.type === 'rent' ? 'Alquiler' : 'Venta';
    const currencyLabel = property.currency || 'USD';

    return (
        <div className="bg-[#fdfdfd] min-h-screen">
            {lightbox.open && images.length > 0 && (
                <Lightbox images={images} startIndex={lightbox.index} onClose={closeLightbox} />
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

                {/* Main image — aspect ratio based, no fixed height */}
                <div
                    className="w-full aspect-[16/7] rounded-sm overflow-hidden cursor-pointer mb-3"
                    onClick={() => openLightbox(0)}
                >
                    {images.length > 0 ? (
                        <img
                            src={images[0]}
                            className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
                            alt={property.title}
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <p className="text-primary-300 text-sm">Sin imágenes</p>
                        </div>
                    )}
                </div>

                {/* Thumbnail strip */}
                {images.length > 1 && (
                    <div className="flex gap-2 mb-12 overflow-x-auto pb-2">
                        {images.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => openLightbox(i)}
                                className="flex-shrink-0 w-24 h-16 rounded-sm overflow-hidden border-2 border-gray-100 hover:border-primary-400 transition-colors cursor-pointer"
                            >
                                <img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}

                {images.length <= 1 && <div className="mb-12" />}

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
                                        {agent?.role === 'admin' ? 'Director' : 'Agente'}
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
