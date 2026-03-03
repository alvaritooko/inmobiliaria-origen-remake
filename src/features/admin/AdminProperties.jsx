import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthContext';
import { Plus, Edit3, Trash2, Eye, Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminProperties = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const { profile, isAdmin } = useAuth();
    const navigate = useNavigate();

    const fetchProperties = async () => {
        setLoading(true);
        let query = supabase
            .from('properties')
            .select('*, profiles(full_name, email, city)')
            .order('created_at', { ascending: false });

        // Agentes solo ven sus propiedades
        if (!isAdmin) {
            query = query.eq('agent_id', profile.id);
        }

        const { data, error } = await query;
        if (error) console.error('Error fetching properties:', error);
        else setProperties(data || []);
        setLoading(false);
    };

    useEffect(() => {
        if (profile) fetchProperties();
    }, [profile]);

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar esta propiedad?')) return;
        setDeleting(id);

        const { error } = await supabase.from('properties').delete().eq('id', id);
        if (error) {
            console.error('Error deleting:', error);
            alert('Error al eliminar la propiedad');
        } else {
            setProperties(prev => prev.filter(p => p.id !== id));
        }
        setDeleting(null);
    };

    const filtered = properties.filter(p => {
        const s = search.toLowerCase();
        const matchesSearch = !s ||
            p.title?.toLowerCase().includes(s) ||
            p.location?.toLowerCase().includes(s) ||
            p.city?.toLowerCase().includes(s) ||
            p.profiles?.full_name?.toLowerCase().includes(s) ||
            p.profiles?.city?.toLowerCase().includes(s);
        const matchesType = filterType === 'all' || p.type === filterType;
        const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    const statusLabel = {
        published: { text: 'Publicada', color: 'bg-green-100 text-green-700' },
        draft: { text: 'Borrador', color: 'bg-yellow-100 text-yellow-700' },
        sold: { text: 'Vendida', color: 'bg-blue-100 text-blue-700' },
        rented: { text: 'Alquilada', color: 'bg-teal-100 text-teal-700' },
        archived: { text: 'Archivada', color: 'bg-gray-100 text-gray-500' },
    };

    const typeLabel = {
        sale: { text: 'Venta', color: 'bg-emerald-100 text-emerald-700' },
        rent: { text: 'Alquiler', color: 'bg-violet-100 text-violet-700' },
        investment: { text: 'Inversión', color: 'bg-amber-100 text-amber-700' },
    };

    return (
        <div>
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-display font-light text-primary-950 uppercase tracking-tight">
                        Mis <span className="font-bold">Propiedades</span>
                    </h1>
                    <p className="text-xs text-primary-400 font-bold uppercase tracking-widest mt-2">
                        {properties.length} propiedad{properties.length !== 1 ? 'es' : ''}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/admin/propiedades/nueva')}
                    className="bg-primary-950 text-white px-8 py-4 rounded-sm font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 hover:bg-primary-800 transition-all"
                >
                    <Plus size={16} /> Nueva Propiedad
                </button>
            </header>

            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-300" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por título o ubicación..."
                        className="w-full pl-12 pr-4 py-4 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-primary-300 transition-colors"
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-4 border border-gray-100 rounded-sm text-xs font-bold uppercase tracking-widest text-primary-600 focus:outline-none focus:border-primary-300 bg-white"
                >
                    <option value="all">Todos los tipos</option>
                    <option value="sale">Venta</option>
                    <option value="rent">Alquiler</option>
                    <option value="investment">Inversión</option>
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-4 border border-gray-100 rounded-sm text-xs font-bold uppercase tracking-widest text-primary-600 focus:outline-none focus:border-primary-300 bg-white"
                >
                    <option value="all">Todos los estados</option>
                    <option value="published">Publicadas</option>
                    <option value="draft">Borradores</option>
                    <option value="sold">Vendidas</option>
                    <option value="rented">Alquiladas</option>
                    <option value="archived">Archivadas</option>
                </select>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={24} className="animate-spin text-primary-400" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-primary-300 text-sm">No hay propiedades</p>
                    <button
                        onClick={() => navigate('/admin/propiedades/nueva')}
                        className="mt-4 text-primary-950 text-xs font-bold uppercase tracking-widest hover:underline"
                    >
                        Crear la primera →
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100/50 border-b border-gray-100">
                            <tr>
                                <th className="p-5 text-[10px] uppercase font-bold tracking-widest text-primary-400">Propiedad</th>
                                <th className="p-5 text-[10px] uppercase font-bold tracking-widest text-primary-400 hidden md:table-cell">Precio</th>
                                <th className="p-5 text-[10px] uppercase font-bold tracking-widest text-primary-400 hidden lg:table-cell">Tipo</th>
                                {isAdmin && (
                                    <th className="p-5 text-[10px] uppercase font-bold tracking-widest text-primary-400 hidden lg:table-cell">Agente</th>
                                )}
                                <th className="p-5 text-[10px] uppercase font-bold tracking-widest text-primary-400">Estado</th>
                                <th className="p-5 text-[10px] uppercase font-bold tracking-widest text-primary-400">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map((property) => (
                                <tr key={property.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-12 bg-gray-100 rounded-sm overflow-hidden flex-shrink-0">
                                                {property.images?.[0] && (
                                                    <img src={property.images[0]} alt="" className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-primary-950">{property.title}</div>
                                                <div className="text-[10px] text-primary-400 mt-0.5">{property.location}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5 hidden md:table-cell">
                                        <span className="text-sm font-medium text-primary-950">
                                            {property.currency} {Number(property.price).toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="p-5 hidden lg:table-cell">
                                        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${typeLabel[property.type]?.color || 'bg-gray-100 text-gray-500'}`}>
                                            {typeLabel[property.type]?.text || property.type}
                                        </span>
                                    </td>
                                    {isAdmin && (
                                        <td className="p-5 hidden lg:table-cell">
                                            <div>
                                                <span className="text-xs text-primary-600 font-medium">
                                                    {property.profiles?.full_name || property.profiles?.email || '—'}
                                                </span>
                                                {property.profiles?.city && (
                                                    <div className="text-[10px] text-primary-400 mt-0.5">{property.profiles.city}</div>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                    <td className="p-5">
                                        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${statusLabel[property.status]?.color || 'bg-gray-100 text-gray-500'}`}>
                                            {statusLabel[property.status]?.text || property.status}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => navigate(`/admin/propiedades/${property.id}/editar`)}
                                                className="p-2 text-primary-400 hover:text-primary-950 transition-colors"
                                                title="Editar"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/propiedad/${property.id}`)}
                                                className="p-2 text-primary-400 hover:text-primary-950 transition-colors"
                                                title="Ver"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(property.id)}
                                                disabled={deleting === property.id}
                                                className="p-2 text-primary-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                                title="Eliminar"
                                            >
                                                {deleting === property.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminProperties;
