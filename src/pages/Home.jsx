import React, { useState, useEffect } from 'react'
import { Building2, Search, ArrowRight, User, LogIn, Loader2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { useAuth } from '../features/auth/AuthContext'
import { supabase } from '../lib/supabase'
import PropertyCard from '../components/properties/PropertyCard'

const Home = () => {
    const { user, profile, loading } = useAuth()
    const navigate = useNavigate()
    const [properties, setProperties] = useState([])
    const [loadingProperties, setLoadingProperties] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchType, setSearchType] = useState('sale')

    const handleSearch = () => {
        const params = new URLSearchParams()
        if (searchQuery) params.set('q', searchQuery)
        if (searchType !== 'all') params.set('tipo', searchType)
        navigate(`/propiedades?${params.toString()}`)
    }

    const handleSearchKey = (e) => {
        if (e.key === 'Enter') handleSearch()
    }


    useEffect(() => {
        const fetchProperties = async () => {
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('status', 'published')
                .order('created_at', { ascending: false })
                .limit(6)

            if (error) {
                console.error('Error fetching properties:', error)
            } else {
                // Map DB fields to PropertyCard expected format
                const mapped = (data || []).map(p => ({
                    ...p,
                    beds: p.bedrooms || 0,
                    baths: p.bathrooms || 0,
                    area: p.area_m2 ? `${p.area_m2}m²` : '—',
                    images: p.images?.length ? p.images : ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop'],
                    location: p.city ? `${p.city}, ${p.province || ''}` : p.location || 'Sin ubicación',
                }))
                setProperties(mapped)
            }
            setLoadingProperties(false)
        }

        fetchProperties()
    }, [])

    return (
        <div className="relative overflow-hidden bg-white">
            {/* Elegant Nav */}
            <Navbar />

            {/* Hero Section */}
            <main className="pt-20">
                <section className="relative min-h-[90vh] flex items-center px-6">
                    <div className="absolute inset-0 z-0">
                        <img
                            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop"
                            className="w-full h-full object-cover grayscale-[0.2] brightness-[0.7]"
                            alt="Luxury Home"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary-950/90 via-primary-950/30 to-transparent"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto w-full">
                        <div className="max-w-3xl">
                            <h1 className="text-6xl md:text-[7rem] font-display font-light text-white leading-[0.9] mb-8 tracking-tighter">
                                Tu próximo <br />
                                <span className="font-bold italic">Origen</span>
                            </h1>
                            <p className="text-lg md:text-xl text-gray-200 mb-12 font-light max-w-xl leading-relaxed">
                                Propiedades exclusivas seleccionadas con un estándar de elegancia y sofisticación sinigual en Posadas.
                            </p>

                            {/* Elegant Search Bar */}
                            <div className="glass-morphism p-3 rounded-sm flex flex-col md:flex-row gap-4 max-w-5xl shadow-2xl items-center">
                                {/* Operation Type Selector */}
                                <div className="flex gap-2 p-1 rounded-sm w-full">
                                    {[
                                        { key: 'sale', label: 'Venta' },
                                        { key: 'rent', label: 'Alquiler' },
                                        { key: 'investment', label: 'Inversión' }
                                    ].map(t => (
                                        <button
                                            key={t.key}
                                            onClick={() => { setSearchType(t.key); navigate(`/propiedades?tipo=${t.key}`); }}
                                            className={`flex-1 px-3 md:px-6 py-3 rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all duration-300 transform bg-primary-950 text-white shadow-xl hover:scale-105 ${searchType === t.key ? 'scale-105 ring-1 ring-white/20' : 'opacity-90 hover:opacity-100'
                                                }`}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Divider or Spacer (hidden on mobile) */}
                                <div className="hidden md:block w-px h-8 bg-white/10 mx-2" />

                                {/* Search Input */}
                                <div className="flex-1 flex items-center px-4 gap-4 w-full">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={handleSearchKey}
                                        placeholder=""
                                        className="bg-transparent border-none outline-none w-full text-white text-sm font-light uppercase tracking-[0.3em]"
                                    />
                                </div>

                                {/* Explorar Button */}
                                <button
                                    onClick={() => navigate('/explorar')}
                                    className="w-full md:w-auto bg-primary-950 text-white px-10 py-4 rounded-sm hover:bg-primary-800 transition-all font-bold uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-4 group shadow-xl shadow-primary-950/20"
                                >
                                    Explorar <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Featured Listings */}
                <section className="py-32 px-6 bg-[#fdfdfd]">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-6">
                            <div>
                                <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold-600 mb-4 flex items-center gap-2">
                                    <span className="w-8 h-[1px] bg-gold-600"></span> Selección Origen
                                </h2>
                                <h3 className="text-5xl md:text-6xl font-display font-light text-primary-950 leading-tight">
                                    Propiedades <br /><span className="font-bold italic">Destacadas</span>
                                </h3>
                            </div>
                            <Link to="/propiedades" className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-950 border-b border-primary-200 pb-2 hover:border-primary-950 transition-all group">
                                Ver Catálogo Completo <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {loadingProperties ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 size={24} className="animate-spin text-primary-400" />
                            </div>
                        ) : properties.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-primary-300 text-sm">No hay propiedades publicadas aún</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
                                {properties.map(prop => (
                                    <PropertyCard key={prop.id} property={prop} />
                                ))}
                            </div>
                        )}
                    </div>
                </section>


                {/* Philosophy Intro */}
                <section className="py-32 bg-primary-950 text-white px-6 overflow-hidden relative">
                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="grid md:grid-cols-2 gap-24 items-center">
                            <div className="relative">
                                <div className="absolute -inset-6 border border-white/5 translate-x-6 translate-y-6"></div>
                                <img
                                    src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1974&auto=format&fit=crop"
                                    alt="Interior Design"
                                    className="w-full grayscale brightness-75 rounded-sm shadow-2xl relative z-10"
                                />
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gold-500/10 backdrop-blur-3xl rounded-full"></div>
                            </div>
                            <div className="space-y-10">
                                <h2 className="text-4xl md:text-5xl font-display font-light leading-tight">
                                    Redefiniendo el <br />
                                    <span className="font-bold italic">Mercado Inmobiliario</span>
                                </h2>
                                <p className="text-primary-300 text-lg font-light leading-relaxed max-w-md">
                                    En Origen, no solo gestionamos inmuebles; seleccionamos refugios que inspiran y elevan el estilo de vida. Una curaduría de diseño y exclusividad.
                                </p>
                                <div className="grid grid-cols-2 gap-12">
                                    <div className="space-y-2">
                                        <span className="text-5xl font-display font-bold text-gold-400 block tracking-tighter">15+</span>
                                        <span className="text-[10px] uppercase tracking-[0.3em] text-primary-400 font-bold">Años de Trayectoria</span>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-5xl font-display font-bold text-gold-400 block tracking-tighter">200+</span>
                                        <span className="text-[10px] uppercase tracking-[0.3em] text-primary-400 font-bold">Historias Creadas</span>
                                    </div>
                                </div>
                                <button className="px-10 py-5 border border-white/20 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white hover:text-primary-950 transition-all rounded-sm">
                                    Conoce Nuestro Equipo
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Elegant Footer */}
            <footer className="bg-white border-t border-gray-100 pt-32 pb-16 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-20 mb-32">
                    <div className="col-span-2 space-y-8">
                        <div className="flex items-center gap-3">
                            <img src="/origen_logo_color.png" alt="Origen Inmobiliaria" className="h-8 w-auto" />
                        </div>
                        <p className="text-primary-400 max-w-xs font-light leading-relaxed text-sm">
                            La inmobiliaria boutique líder en propiedades de lujo y diseño contemporáneo. Especialistas en hacer realidad lo extraordinario.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-display font-bold uppercase tracking-[0.3em] text-[10px] mb-10 text-primary-950">Navegación</h4>
                        <ul className="space-y-6 text-[11px] uppercase tracking-widest text-primary-400 font-bold">
                            <li className="hover:text-gold-600 cursor-pointer transition-colors">Propiedades</li>
                            <li className="hover:text-gold-600 cursor-pointer transition-colors">Vender Propiedad</li>
                            <li className="hover:text-gold-600 cursor-pointer transition-colors">Inversores</li>
                            <li className="hover:text-gold-600 cursor-pointer transition-colors">Contacto</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-display font-bold uppercase tracking-[0.3em] text-[10px] mb-10 text-primary-950">Oficina Central</h4>
                        <p className="text-sm text-primary-500 font-light leading-relaxed">
                            Posadas, Misiones<br />
                            Argentina<br /><br />
                            <span className="text-primary-950 font-medium">hola@origenprop.com</span><br />
                            +54 (376) 000 0000
                        </p>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto border-t border-gray-100 pt-16 flex flex-col md:flex-row justify-between items-center gap-6">
                    <span className="text-[9px] uppercase tracking-[0.4em] text-primary-300 font-bold">© 2026 Origen Inmobiliaria. Reservados todos los derechos.</span>
                    <div className="flex gap-8">
                        <span className="text-[9px] uppercase tracking-[0.4em] text-primary-300 font-bold hover:text-primary-950 cursor-pointer">Privacidad</span>
                        <span className="text-[9px] uppercase tracking-[0.4em] text-primary-300 font-bold hover:text-primary-950 cursor-pointer">Términos</span>
                    </div>
                </div>
            </footer>
        </div >
    )
}

export default Home
