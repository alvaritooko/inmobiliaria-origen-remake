import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../features/auth/AuthContext';
import { Search, Loader2, User, SlidersHorizontal } from 'lucide-react';
import PropertyCard from '../components/properties/PropertyCard';

import Navbar from '../components/layout/Navbar';

const Properties = () => {
    const { user, profile } = useAuth();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(searchParams.get('tipo') || 'all'); // all, sale, rent, investment
    const [search, setSearch] = useState(searchParams.get('q') || '');

    useEffect(() => {
        // Sync state if URL changes (e.g. back button or re-clicking search)
        const tipo = searchParams.get('tipo') || 'all';
        const q = searchParams.get('q') || '';
        setFilter(tipo);
        setSearch(q);
    }, [location.search]);

    useEffect(() => {
        fetchProperties();
    }, [filter]);

    const fetchProperties = async () => {
        setLoading(true);
        let query = supabase
            .from('properties')
            .select('*')
            .eq('status', 'published')
            .order('created_at', { ascending: false });

        if (filter === 'sale') query = query.eq('type', 'sale');
        if (filter === 'rent') query = query.eq('type', 'rent');
        if (filter === 'investment') query = query.eq('type', 'investment');

        const { data, error } = await query;

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

    const filtered = search
        ? properties.filter(p =>
            p.title?.toLowerCase().includes(search.toLowerCase()) ||
            p.location?.toLowerCase().includes(search.toLowerCase()) ||
            p.city?.toLowerCase().includes(search.toLowerCase())
        )
        : properties;

    return (
        <div className="bg-[#fdfdfd] min-h-screen">
            {/* Nav */}
            <Navbar />

            <main className="pt-20">
                {/* Header */}
                <section className="py-20 px-6 bg-primary-950 text-white">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-5xl md:text-7xl font-display font-light leading-tight mb-6">
                            Nuestras <span className="font-bold italic">Propiedades</span>
                        </h1>
                        <p className="text-primary-300 text-lg font-light max-w-xl">
                            Explorá nuestra selección de propiedades exclusivas en las mejores ubicaciones.
                        </p>
                    </div>
                </section>

                {/* Filters */}
                <section className="py-8 px-6 border-b border-gray-100 bg-white sticky top-20 z-40">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <SlidersHorizontal size={16} className="text-primary-400" />
                            <div className="flex gap-2">
                                {[
                                    { key: 'all', label: 'Todas' },
                                    { key: 'sale', label: 'Venta' },
                                    { key: 'rent', label: 'Alquiler' },
                                    { key: 'investment', label: 'Inversión' },
                                ].map(f => (
                                    <button
                                        key={f.key}
                                        onClick={() => setFilter(f.key)}
                                        className={`px-5 py-2.5 rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${filter === f.key
                                            ? 'bg-primary-950 text-white'
                                            : 'bg-gray-50 text-primary-400 hover:bg-gray-100'
                                            }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="relative w-full md:w-80">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-300" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar por nombre o ubicación..."
                                className="w-full pl-11 pr-4 py-3 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-primary-300 transition-colors"
                            />
                        </div>
                    </div>
                </section>

                {/* Properties Grid */}
                <section className="py-16 px-6">
                    <div className="max-w-7xl mx-auto">
                        <p className="text-xs text-primary-400 font-bold uppercase tracking-widest mb-10">
                            {filtered.length} propiedad{filtered.length !== 1 ? 'es' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
                        </p>

                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 size={24} className="animate-spin text-primary-400" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-primary-300 text-lg mb-2">No se encontraron propiedades</p>
                                <p className="text-primary-300 text-sm">Probá con otros filtros o términos de búsqueda</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
                                {filtered.map(prop => (
                                    <PropertyCard key={prop.id} property={prop} />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Properties;
