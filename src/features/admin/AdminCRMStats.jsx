import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import {
    Building2, Users, TrendingUp, CheckCircle, BarChart3, Clock, MessageSquare, DollarSign
} from 'lucide-react';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

/* ── Color palette ────────────────────────────────── */
const COLORS = ['#0f172a', '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const TYPE_COLORS = { sale: '#10b981', rent: '#8b5cf6', investment: '#f59e0b' };
const TYPE_LABELS = { sale: 'Venta', rent: 'Alquiler', investment: 'Inversión' };

const STATUS_COLORS = { published: '#10b981', draft: '#f59e0b', sold: '#6366f1', rented: '#14b8a6', archived: '#94a3b8' };
const STATUS_LABELS = { published: 'Publicada', draft: 'Borrador', sold: 'Vendida', rented: 'Alquilada', archived: 'Archivada' };

/* ── Helpers ──────────────────────────────────────── */
const isWithinDays = (dateStr, days) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = (now - d) / (1000 * 60 * 60 * 24);
    return diff <= days;
};

/* ── Custom Tooltip ──────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-primary-950 text-white px-4 py-3 rounded-sm shadow-lg text-xs">
            {label && <div className="font-bold mb-1">{label}</div>}
            {payload.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
                    <span>{p.name}: <strong>{p.value}</strong></span>
                </div>
            ))}
        </div>
    );
};

/* ── Custom Pie Label ────────────────────────────── */
const renderCustomLabel = ({ name, percent }) => {
    if (percent < 0.05) return null;
    return `${name} ${(percent * 100).toFixed(0)}%`;
};

/* ── KPI Card ────────────────────────────────────── */
const KPICard = ({ icon: Icon, label, value, sub, accent }) => (
    <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6 flex flex-col transition-all hover:shadow-md">
        <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-sm flex items-center justify-center ${accent || 'bg-primary-100'}`}>
                <Icon size={18} className="text-primary-950" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary-400">{label}</span>
        </div>
        <div className="text-3xl font-display font-bold text-primary-950 tracking-tight">{value}</div>
        {sub && <div className="text-[10px] text-primary-400 mt-1 uppercase tracking-widest font-bold">{sub}</div>}
    </div>
);

/* ── Chart Wrapper ───────────────────────────────── */
const ChartCard = ({ title, children, className = '' }) => (
    <div className={`bg-white rounded-sm shadow-sm border border-gray-100 p-6 ${className}`}>
        <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary-400 mb-6">{title}</h3>
        {children}
    </div>
);

/* ════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════ */
const AdminCRMStats = () => {
    const [properties, setProperties] = useState([]);
    const [agents, setAgents] = useState([]);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month'); // week | month | year
    const [selectedAgent, setSelectedAgent] = useState('all'); // 'all' or agent UUID

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [propRes, agentRes, leadRes] = await Promise.all([
                supabase
                    .from('properties')
                    .select('*, profiles(full_name, email, city)')
                    .order('created_at', { ascending: false }),
                supabase
                    .from('profiles')
                    .select('*')
                    .in('role', ['agent', 'admin'])
                    .order('created_at', { ascending: false }),
                supabase
                    .from('leads')
                    .select('*')
                    .order('created_at', { ascending: false })
            ]);

            if (propRes.data) setProperties(propRes.data);
            if (agentRes.data) setAgents(agentRes.data);
            if (leadRes.data) setLeads(leadRes.data);
            setLoading(false);
        };
        fetchData();
    }, []);

    /* ── Derived stats ────────────────────────────── */
    const stats = useMemo(() => {
        const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : 365;

        // Filter properties by selected agent
        const filteredProps = selectedAgent === 'all'
            ? properties
            : properties.filter(p => p.agent_id === selectedAgent);

        const total = filteredProps.length;
        const published = filteredProps.filter(p => p.status === 'published').length;
        const sold = filteredProps.filter(p => p.status === 'sold').length;
        const rented = filteredProps.filter(p => p.status === 'rented').length;
        const activeAgents = agents.filter(a => a.is_active && a.role === 'agent').length;

        // Type distribution
        const byType = Object.entries(
            filteredProps.reduce((acc, p) => {
                const key = p.type || 'other';
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {})
        ).map(([key, value]) => ({
            name: TYPE_LABELS[key] || key,
            value,
            color: TYPE_COLORS[key] || '#94a3b8',
        }));

        // Status distribution
        const byStatus = Object.entries(
            filteredProps.reduce((acc, p) => {
                const key = p.status || 'draft';
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {})
        ).map(([key, value]) => ({
            name: STATUS_LABELS[key] || key,
            value,
            color: STATUS_COLORS[key] || '#94a3b8',
        }));

        // Properties per agent
        const perAgent = agents
            .filter(a => a.role === 'agent')
            .map(agent => {
                const agentProps = filteredProps.filter(p => p.agent_id === agent.id);
                const inPeriod = agentProps.filter(p => isWithinDays(p.created_at, periodDays));
                return {
                    name: agent.full_name || agent.email?.split('@')[0] || 'Agent',
                    city: agent.city || '—',
                    total: agentProps.length,
                    periodo: inPeriod.length,
                    ventas: agentProps.filter(p => p.type === 'sale').length,
                    alquileres: agentProps.filter(p => p.type === 'rent').length,
                    inversiones: agentProps.filter(p => p.type === 'investment').length,
                    publicadas: agentProps.filter(p => p.status === 'published').length,
                };
            })
            .sort((a, b) => b.total - a.total);

        // By city
        const byCity = Object.entries(
            filteredProps.reduce((acc, p) => {
                const city = p.city || 'Sin ciudad';
                acc[city] = (acc[city] || 0) + 1;
                return acc;
            }, {})
        )
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);

        // Recent activity (properties added in period)
        const recentCount = filteredProps.filter(p => isWithinDays(p.created_at, periodDays)).length;

        // Leads stats
        const periodLeads = leads.filter(l => isWithinDays(l.created_at, periodDays));
        const newLeads = periodLeads.filter(l => l.status === 'new').length;

        // Funnel Data
        const funnelData = [
            { name: 'Nuevos', value: leads.filter(l => l.status === 'new').length, fill: '#3b82f6' },
            { name: 'Contactados', value: leads.filter(l => l.status === 'contacted').length, fill: '#f59e0b' },
            { name: 'Interesados', value: leads.filter(l => l.status === 'interested').length, fill: '#10b981' },
            { name: 'Cerrados', value: leads.filter(l => l.status === 'closed').length, fill: '#1a1a1a' }
        ];

        // Financial KPIs
        const expectedRevenue = leads
            .filter(l => l.status === 'interested')
            .reduce((sum, l) => sum + (Number(l.deal_value) || 0), 0);

        return { 
            total, published, sold, rented, activeAgents, 
            byType, byStatus, perAgent, byCity, 
            recentCount, periodDays, newLeads, funnelData, expectedRevenue 
        };
    }, [properties, agents, leads, period, selectedAgent]);

    const periodLabel = period === 'week' ? 'esta semana' : period === 'month' ? 'este mes' : 'este año';

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-950 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* ── Filters: Agent + Period ──────────────── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-xl font-display font-light text-primary-950 uppercase tracking-tight">
                    <span className="font-bold">Estadísticas</span> CRM
                </h2>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Agent selector */}
                    <select
                        value={selectedAgent}
                        onChange={(e) => setSelectedAgent(e.target.value)}
                        className="px-4 py-2 border border-gray-100 rounded-sm text-[10px] font-bold uppercase tracking-[0.15em] text-primary-600 focus:outline-none focus:border-primary-300 bg-white"
                    >
                        <option value="all">Todos los agentes</option>
                        {agents.filter(a => a.role === 'agent').map(agent => (
                            <option key={agent.id} value={agent.id}>
                                {agent.full_name || agent.email} {agent.city ? `— ${agent.city}` : ''}
                            </option>
                        ))}
                    </select>
                    
                    {/* Period selector */}
                    <div className="flex bg-white rounded-sm border border-gray-100 overflow-hidden">
                        {[
                            { key: 'week', label: 'Semana' },
                            { key: 'month', label: 'Mes' },
                            { key: 'year', label: 'Año' },
                        ].map(opt => (
                            <button
                                key={opt.key}
                                onClick={() => setPeriod(opt.key)}
                                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors ${period === opt.key
                                    ? 'bg-primary-950 text-white'
                                    : 'text-primary-400 hover:text-primary-950'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── KPI Cards ───────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard icon={Building2} label="Total Propiedades" value={stats.total} accent="bg-primary-100" />
                <KPICard icon={MessageSquare} label="Nuevos Leads" value={stats.newLeads} accent="bg-blue-100" sub={periodLabel} />
                <KPICard icon={TrendingUp} label="Ventas Cerradas" value={stats.sold} accent="bg-emerald-100" />
                <KPICard icon={DollarSign} label="Ventas Proyectadas" value={`$${(stats.expectedRevenue / 1000).toFixed(0)}k`} accent="bg-violet-100" />
            </div>

            {/* ── Activity banner ─────────────────── */}
            <div className="bg-primary-950 text-white rounded-sm p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Clock size={20} className="text-primary-400" />
                    <div>
                        <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary-400">Actividad reciente</div>
                        <div className="text-2xl font-display font-bold tracking-tight mt-1">{stats.recentCount} propiedades</div>
                    </div>
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary-400">
                    cargadas {periodLabel}
                </div>
            </div>

            {/* ── Sales Funnel Row ────────────────── */}
            <div className="bg-white p-8 rounded-sm border border-gray-100 shadow-sm">
                <h3 className="text-xs uppercase font-bold tracking-[0.2em] text-primary-950 mb-8 border-b border-gray-50 pb-4">
                    Embudo de Ventas (Total)
                </h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.funnelData} layout="vertical" barSize={40}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                tick={{fontSize: 10, fontWeight: 700, fill: '#1a1a1a'}} 
                                width={120}
                            />
                            <Tooltip 
                                cursor={{fill: 'transparent'}}
                                contentStyle={{ borderRadius: '0px', border: '1px solid #f0f0f0', fontSize: '11px', fontWeight: 'bold' }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {stats.funnelData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ── Charts Row 1 ────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Type pie */}
                <ChartCard title="Distribución por Tipo">
                    {stats.byType.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={stats.byType}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    innerRadius={50}
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
                                    formatter={(value) => <span className="text-[10px] uppercase font-bold tracking-widest text-primary-600">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[280px] text-primary-300 text-sm">Sin datos</div>
                    )}
                </ChartCard>

                {/* Status pie */}
                <ChartCard title="Distribución por Estado">
                    {stats.byStatus.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={stats.byStatus}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    innerRadius={50}
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
                                    formatter={(value) => <span className="text-[10px] uppercase font-bold tracking-widest text-primary-600">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[280px] text-primary-300 text-sm">Sin datos</div>
                    )}
                </ChartCard>
            </div>

            {/* ── Charts Row 2 ────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Per agent bar */}
                <ChartCard title="Propiedades por Agente">
                    {stats.perAgent.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.perAgent} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={100} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="ventas" stackId="a" name="Ventas" fill={TYPE_COLORS.sale} radius={0} />
                                <Bar dataKey="alquileres" stackId="a" name="Alquileres" fill={TYPE_COLORS.rent} radius={0} />
                                <Bar dataKey="inversiones" stackId="a" name="Inversiones" fill={TYPE_COLORS.investment} radius={[0, 4, 4, 0]} />
                                <Legend
                                    formatter={(value) => <span className="text-[10px] uppercase font-bold tracking-widest text-primary-600">{value}</span>}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[300px] text-primary-300 text-sm">Sin datos</div>
                    )}
                </ChartCard>

                {/* By city bar */}
                <ChartCard title="Propiedades por Ciudad">
                    {stats.byCity.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.byCity} margin={{ bottom: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 9, fill: '#64748b' }}
                                    angle={-45}
                                    textAnchor="end"
                                    interval={0}
                                />
                                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" name="Propiedades" fill="#0f172a" radius={[4, 4, 0, 0]}>
                                    {stats.byCity.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[300px] text-primary-300 text-sm">Sin datos</div>
                    )}
                </ChartCard>
            </div>

            {/* ── Agent Ranking Table ─────────────── */}
            <ChartCard title={`Ranking de Agentes — ${periodLabel}`}>
                {stats.perAgent.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-gray-100">
                                <tr>
                                    <th className="pb-3 text-[10px] uppercase font-bold tracking-widest text-primary-400">#</th>
                                    <th className="pb-3 text-[10px] uppercase font-bold tracking-widest text-primary-400">Agente</th>
                                    <th className="pb-3 text-[10px] uppercase font-bold tracking-widest text-primary-400 hidden sm:table-cell">Ciudad</th>
                                    <th className="pb-3 text-[10px] uppercase font-bold tracking-widest text-primary-400 text-center">Total</th>
                                    <th className="pb-3 text-[10px] uppercase font-bold tracking-widest text-primary-400 text-center hidden md:table-cell">Período</th>
                                    <th className="pb-3 text-[10px] uppercase font-bold tracking-widest text-primary-400 text-center hidden md:table-cell">Publicadas</th>
                                    <th className="pb-3 text-[10px] uppercase font-bold tracking-widest text-primary-400 text-center hidden lg:table-cell">Ventas</th>
                                    <th className="pb-3 text-[10px] uppercase font-bold tracking-widest text-primary-400 text-center hidden lg:table-cell">Alquileres</th>
                                    <th className="pb-3 text-[10px] uppercase font-bold tracking-widest text-primary-400 text-center hidden lg:table-cell">Inversiones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {stats.perAgent.map((agent, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 pr-3">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' :
                                                i === 1 ? 'bg-gray-200 text-gray-600' :
                                                    i === 2 ? 'bg-orange-100 text-orange-600' :
                                                        'bg-gray-100 text-gray-400'
                                                }`}>
                                                {i + 1}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <span className="text-sm font-bold text-primary-950">{agent.name}</span>
                                        </td>
                                        <td className="py-4 hidden sm:table-cell">
                                            <span className="text-xs text-primary-400">{agent.city}</span>
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className="text-sm font-bold text-primary-950">{agent.total}</span>
                                        </td>
                                        <td className="py-4 text-center hidden md:table-cell">
                                            <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${agent.periodo > 0
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-400'
                                                }`}>
                                                {agent.periodo}
                                            </span>
                                        </td>
                                        <td className="py-4 text-center hidden md:table-cell">
                                            <span className="text-xs text-primary-600">{agent.publicadas}</span>
                                        </td>
                                        <td className="py-4 text-center hidden lg:table-cell">
                                            <span className="text-xs text-emerald-600">{agent.ventas}</span>
                                        </td>
                                        <td className="py-4 text-center hidden lg:table-cell">
                                            <span className="text-xs text-violet-600">{agent.alquileres}</span>
                                        </td>
                                        <td className="py-4 text-center hidden lg:table-cell">
                                            <span className="text-xs text-amber-600">{agent.inversiones}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-10 text-primary-300 text-sm">Sin agentes registrados</div>
                )}
            </ChartCard>
        </div>
    );
};

export default AdminCRMStats;
