import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
    ArrowLeft, User, Mail, Phone, MapPin, Building2, CheckCircle,
    TrendingUp, Eye, Edit3, Loader2,
} from 'lucide-react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

/* ── Constants ─────────────────────────────────────── */
const TYPE_COLORS = { sale: '#10b981', rent: '#8b5cf6', investment: '#f59e0b' };
const TYPE_LABELS = { sale: 'Venta', rent: 'Alquiler', investment: 'Inversión' };

const STATUS_COLORS = { published: '#10b981', draft: '#f59e0b', sold: '#6366f1', rented: '#14b8a6', archived: '#94a3b8' };
const STATUS_LABELS = { published: 'Publicada', draft: 'Borrador', sold: 'Vendida', rented: 'Alquilada', archived: 'Archivada' };

const STATUS_BADGE = {
    published: 'bg-green-100 text-green-700',
    draft: 'bg-yellow-100 text-yellow-700',
    sold: 'bg-blue-100 text-blue-700',
    rented: 'bg-teal-100 text-teal-700',
    archived: 'bg-gray-100 text-gray-500',
};
const TYPE_BADGE = {
    sale: 'bg-emerald-100 text-emerald-700',
    rent: 'bg-violet-100 text-violet-700',
    investment: 'bg-amber-100 text-amber-700',
};

/* ── Reusable sub-components ──────────────────────── */
const KPICard = ({ icon: Icon, label, value, accent }) => (
    <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6 flex flex-col transition-all hover:shadow-md">
        <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-sm flex items-center justify-center ${accent || 'bg-primary-100'}`}>
                <Icon size={18} className="text-primary-950" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary-400">{label}</span>
        </div>
        <div className="text-3xl font-display font-bold text-primary-950 tracking-tight">{value}</div>
    </div>
);

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-primary-950 text-white px-4 py-3 rounded-sm shadow-lg text-xs">
            {payload.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
                    <span>{p.name}: <strong>{p.value}</strong></span>
                </div>
            ))}
        </div>
    );
};

const renderCustomLabel = ({ name, percent }) => {
    if (percent < 0.05) return null;
    return `${name} ${(percent * 100).toFixed(0)}%`;
};

/* ════════════════════════════════════════════════════
   AGENT PROFILE — Main Component
   ════════════════════════════════════════════════════ */
const AgentProfile = () => {
    const { agentId } = useParams();
    const navigate = useNavigate();

    const [agent, setAgent] = useState(null);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [agentRes, propsRes] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', agentId).single(),
                supabase
                    .from('properties')
                    .select('*')
                    .eq('agent_id', agentId)
                    .order('created_at', { ascending: false }),
            ]);

            if (agentRes.data) setAgent(agentRes.data);
            if (propsRes.data) setProperties(propsRes.data);
            setLoading(false);
        };
        fetchData();
    }, [agentId]);

    /* ── Derived stats ──────────────────────────── */
    const stats = useMemo(() => {
        const total = properties.length;
        const published = properties.filter(p => p.status === 'published').length;
        const sold = properties.filter(p => p.status === 'sold').length;
        const rented = properties.filter(p => p.status === 'rented').length;

        const byType = Object.entries(
            properties.reduce((acc, p) => {
                const key = p.type || 'other';
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {})
        ).map(([key, value]) => ({
            name: TYPE_LABELS[key] || key,
            value,
            color: TYPE_COLORS[key] || '#94a3b8',
        }));

        const byStatus = Object.entries(
            properties.reduce((acc, p) => {
                const key = p.status || 'draft';
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {})
        ).map(([key, value]) => ({
            name: STATUS_LABELS[key] || key,
            value,
            color: STATUS_COLORS[key] || '#94a3b8',
        }));

        return { total, published, sold, rented, byType, byStatus };
    }, [properties]);

    /* ── Loading / Not Found ─────────────────────── */
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-primary-400" />
            </div>
        );
    }

    if (!agent) {
        return (
            <div className="text-center py-20">
                <p className="text-primary-300 text-sm mb-4">Agente no encontrado</p>
                <button
                    onClick={() => navigate('/admin/agentes')}
                    className="text-primary-950 text-xs font-bold uppercase tracking-widest hover:underline"
                >
                    ← Volver a Agentes
                </button>
            </div>
        );
    }

    /* ── Render ───────────────────────────────────── */
    return (
        <div className="space-y-8">
            {/* ── Back button ─────────────────────── */}
            <button
                onClick={() => navigate('/admin/agentes')}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-400 hover:text-primary-950 transition-colors"
            >
                <ArrowLeft size={14} /> Volver a Agentes
            </button>

            {/* ── Agent Header Card ───────────────── */}
            <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Avatar */}
                    <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User size={32} className="text-primary-400" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-3xl font-display font-light text-primary-950 uppercase tracking-tight">
                            Perfil de <span className="font-bold">{agent.full_name || 'Agente'}</span>
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 mt-3">
                            <div className="flex items-center gap-1.5 text-xs text-primary-400">
                                <Mail size={12} /> {agent.email || '—'}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-primary-400">
                                <Phone size={12} /> {agent.phone || '—'}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-primary-400">
                                <MapPin size={12} /> {agent.city || '—'}
                            </div>
                        </div>
                    </div>

                    {/* Status badge */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`w-2.5 h-2.5 rounded-full ${agent.is_active ? 'bg-green-500' : 'bg-red-400'}`} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary-400">
                            {agent.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                </div>

                {/* Joined date */}
                {agent.created_at && (
                    <div className="mt-4 pt-4 border-t border-gray-100 text-[10px] text-primary-300 uppercase tracking-widest font-bold">
                        Miembro desde {new Date(agent.created_at).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                )}
            </div>

            {/* ── KPI Cards ──────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard icon={Building2} label="Total Propiedades" value={stats.total} accent="bg-primary-100" />
                <KPICard icon={CheckCircle} label="Publicadas" value={stats.published} accent="bg-green-100" />
                <KPICard icon={TrendingUp} label="Vendidas" value={stats.sold} accent="bg-blue-100" />
                <KPICard icon={CheckCircle} label="Alquiladas" value={stats.rented} accent="bg-teal-100" />
            </div>

            {/* ── Charts ──────────────────────────── */}
            {stats.total > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Type distribution */}
                    <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6">
                        <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary-400 mb-6">
                            Distribución por Tipo
                        </h3>
                        {stats.byType.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={stats.byType}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={90}
                                        innerRadius={45}
                                        dataKey="value"
                                        label={renderCustomLabel}
                                        labelLine={false}
                                        stroke="none"
                                    >
                                        {stats.byType.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        formatter={(value) => (
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-primary-600">{value}</span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[260px] text-primary-300 text-sm">Sin datos</div>
                        )}
                    </div>

                    {/* Status distribution */}
                    <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6">
                        <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary-400 mb-6">
                            Distribución por Estado
                        </h3>
                        {stats.byStatus.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={stats.byStatus}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={90}
                                        innerRadius={45}
                                        dataKey="value"
                                        label={renderCustomLabel}
                                        labelLine={false}
                                        stroke="none"
                                    >
                                        {stats.byStatus.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        formatter={(value) => (
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-primary-600">{value}</span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[260px] text-primary-300 text-sm">Sin datos</div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Properties Table ─────────────────── */}
            <div>
                <h2 className="text-xl font-display font-light text-primary-950 uppercase tracking-tight mb-6">
                    Propiedades de <span className="font-bold">{agent.full_name || 'este agente'}</span>
                </h2>

                {properties.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-sm shadow-sm border border-gray-100">
                        <Building2 size={32} className="mx-auto text-primary-200 mb-3" />
                        <p className="text-primary-300 text-sm">Este agente aún no tiene propiedades</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100/50 border-b border-gray-100">
                                <tr>
                                    <th className="p-5 text-[10px] uppercase font-bold tracking-widest text-primary-400">Propiedad</th>
                                    <th className="p-5 text-[10px] uppercase font-bold tracking-widest text-primary-400 hidden md:table-cell">Precio</th>
                                    <th className="p-5 text-[10px] uppercase font-bold tracking-widest text-primary-400 hidden lg:table-cell">Tipo</th>
                                    <th className="p-5 text-[10px] uppercase font-bold tracking-widest text-primary-400">Estado</th>
                                    <th className="p-5 text-[10px] uppercase font-bold tracking-widest text-primary-400">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {properties.map((property) => (
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
                                            <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${TYPE_BADGE[property.type] || 'bg-gray-100 text-gray-500'}`}>
                                                {TYPE_LABELS[property.type] || property.type}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${STATUS_BADGE[property.status] || 'bg-gray-100 text-gray-500'}`}>
                                                {STATUS_LABELS[property.status] || property.status}
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
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentProfile;
