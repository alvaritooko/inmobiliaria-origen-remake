import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthContext';
import { 
    MessageSquare, Mail, Phone, Calendar, Search, Filter, 
    MoreHorizontal, CheckCircle, Clock, AlertCircle, ExternalLink, 
    ChevronDown, User, DollarSign, Download, FileText, ChevronRight, PlusCircle, X, Trash2
} from 'lucide-react';

const STATUS_LABELS = {
    new: 'Nuevo',
    contacted: 'Contactado',
    interested: 'Interesado',
    closed: 'Cerrado',
    discarded: 'Descartado'
};

const STATUS_COLORS = {
    new: 'bg-blue-100 text-blue-700',
    contacted: 'bg-amber-100 text-amber-700',
    interested: 'bg-emerald-100 text-emerald-700',
    closed: 'bg-primary-950 text-white',
    discarded: 'bg-gray-100 text-gray-500'
};

const AdminLeads = () => {
    const { profile } = useAuth();
    const [leads, setLeads] = useState([]);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [agentFilter, setAgentFilter] = useState('all');
    const [editingFinancials, setEditingFinancials] = useState(null); 
    const [selectedLead, setSelectedLead] = useState(null);
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [isSavingNote, setIsSavingNote] = useState(false);

    useEffect(() => {
        fetchLeads();
        if (profile?.role === 'admin') {
            fetchAgents();
        }
    }, [profile]);

    useEffect(() => {
        if (selectedLead) {
            fetchNotes(selectedLead.id);
        }
    }, [selectedLead]);

    const fetchAgents = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('role', ['admin', 'agent'])
            .order('full_name');
        
        if (!error && data) setAgents(data);
    };

    const fetchLeads = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('leads')
            .select(`
                *,
                properties(title),
                agent:profiles!leads_agent_id_fkey(full_name)
            `)
            .order('created_at', { ascending: false });

        if (!error && data) setLeads(data);
        setLoading(false);
    };

    const fetchNotes = async (leadId) => {
        const { data, error } = await supabase
            .from('lead_notes')
            .select(`
                *,
                agent:profiles(full_name)
            `)
            .eq('lead_id', leadId)
            .order('created_at', { ascending: false });
        
        if (!error && data) setNotes(data);
    };

    const addNote = async () => {
        if (!newNote.trim() || !selectedLead) return;
        setIsSavingNote(true);
        
        const { data, error } = await supabase
            .from('lead_notes')
            .insert({
                lead_id: selectedLead.id,
                agent_id: profile.id,
                content: newNote.trim()
            })
            .select(`
                *,
                agent:profiles(full_name)
            `)
            .single();

        if (!error && data) {
            setNotes([data, ...notes]);
            setNewNote('');
        }
        setIsSavingNote(false);
    };

    const reassignLead = async (leadId, newAgentId) => {
        const { error } = await supabase
            .from('leads')
            .update({ agent_id: newAgentId })
            .eq('id', leadId);

        if (!error) {
            setLeads(leads.map(l => l.id === leadId ? { 
                ...l, 
                agent_id: newAgentId,
                agent: agents.find(a => a.id === newAgentId)
            } : l));
            if (selectedLead?.id === leadId) {
                setSelectedLead({
                    ...selectedLead,
                    agent_id: newAgentId,
                    agent: agents.find(a => a.id === newAgentId)
                });
            }
        }
    };

    const updateStatus = async (id, newStatus, financialData = {}) => {
        const updateData = { 
            status: newStatus,
            last_contact_at: new Date().toISOString(),
            ...financialData 
        };

        const { error } = await supabase
            .from('leads')
            .update(updateData)
            .eq('id', id);

        if (!error) {
            setLeads(leads.map(l => l.id === id ? { ...l, ...updateData } : l));
            setEditingFinancials(null);
            if (selectedLead?.id === id) {
                setSelectedLead({ ...selectedLead, ...updateData });
            }
        }
    };

    const deleteLead = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este lead definitivamente?')) return;
        
        const { error } = await supabase
            .from('leads')
            .delete()
            .eq('id', id);

        if (!error) {
            setLeads(leads.filter(l => l.id !== id));
            if (selectedLead?.id === id) setSelectedLead(null);
        } else {
            alert('Error al eliminar el lead');
        }
    };

    const downloadCSV = () => {
        const headers = ["Fecha", "Nombre", "Email", "Telefono", "Estado", "Propiedad", "Agente", "Valor Operacion", "Comision"];
        const rows = filteredLeads.map(l => [
            new Date(l.created_at).toLocaleDateString(),
            l.full_name,
            l.email,
            l.phone,
            STATUS_LABELS[l.status],
            l.properties?.title || "Consulta General",
            l.agent?.full_name || "Sin asignar",
            l.deal_value || 0,
            l.commission_percentage || 0
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(r => r.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `leads_origen_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = 
            lead.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.phone?.includes(searchTerm);
        
        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
        const matchesAgent = agentFilter === 'all' || lead.agent_id === agentFilter;
        
        return matchesSearch && matchesStatus && matchesAgent;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-950 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-display font-light text-primary-950 uppercase tracking-tight">
                        Gestión de <span className="font-bold">Leads</span>
                    </h1>
                    <p className="text-[10px] text-primary-400 font-bold uppercase tracking-widest mt-1">
                        Seguimiento de interesados y contactos
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={downloadCSV}
                        className="flex items-center gap-2 bg-white border border-gray-100 text-primary-950 px-4 py-2 rounded-sm text-[10px] uppercase font-bold tracking-widest hover:bg-gray-50 transition-colors"
                    >
                        <Download size={14} /> Exportar CSV
                    </button>
                    {profile?.role === 'admin' && (
                        <div className="bg-primary-900 text-white px-4 py-2 rounded-sm text-[10px] uppercase font-bold tracking-widest">
                            Total: {filteredLeads.length} leads
                        </div>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-sm border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o teléfono..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-primary-300 transition-colors"
                    />
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    {profile?.role === 'admin' && (
                        <div className="flex items-center gap-2">
                            <User size={16} className="text-primary-400" />
                            <select
                                value={agentFilter}
                                onChange={(e) => setAgentFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-100 rounded-sm text-[10px] font-bold uppercase tracking-widest text-primary-600 bg-white"
                            >
                                <option value="all">Todos los agentes</option>
                                {agents.map(agent => (
                                    <option key={agent.id} value={agent.id}>{agent.full_name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-primary-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-100 rounded-sm text-[10px] font-bold uppercase tracking-widest text-primary-600 bg-white"
                        >
                            <option value="all">Todos los estados</option>
                            {Object.entries(STATUS_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="p-4 text-[10px] uppercase font-bold tracking-widest text-primary-400">Interesado</th>
                                <th className="p-4 text-[10px] uppercase font-bold tracking-widest text-primary-400">Propiedad</th>
                                {profile?.role === 'admin' && (
                                    <th className="p-4 text-[10px] uppercase font-bold tracking-widest text-primary-400">Agente</th>
                                )}
                                <th className="p-4 text-[10px] uppercase font-bold tracking-widest text-primary-400">Estado</th>
                                <th className="p-4 text-[10px] uppercase font-bold tracking-widest text-primary-400">Fecha</th>
                                <th className="p-4 text-[10px] uppercase font-bold tracking-widest text-primary-400 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredLeads.length > 0 ? filteredLeads.map((lead) => {
                                const isStale = lead.status !== 'closed' && 
                                                lead.last_contact_at && 
                                                (new Date() - new Date(lead.last_contact_at)) > (3 * 24 * 60 * 60 * 1000);

                                return (
                                    <tr key={lead.id} className={`group border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${isStale ? 'bg-red-50/30' : ''}`}>
                                        <td className="p-4">
                                            <div className="flex flex-col cursor-pointer" onClick={() => setSelectedLead(lead)}>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-primary-950 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{lead.full_name}</span>
                                                    {isStale && (
                                                        <span className="flex items-center gap-1 text-[8px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                                                            <AlertCircle size={8} /> Estancado
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] text-primary-400 font-bold uppercase tracking-widest">{lead.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs text-primary-600 truncate max-w-[200px] block">
                                                {lead.properties?.title || 'Consulta General'}
                                            </span>
                                        </td>
                                        {profile?.role === 'admin' && (
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-[10px] text-primary-600 font-bold">
                                                        {lead.agent?.full_name?.charAt(0) || <User size={10} />}
                                                    </div>
                                                    <span className="text-xs text-primary-500">{lead.agent?.full_name || 'Sin asignar'}</span>
                                                </div>
                                            </td>
                                        )}
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${STATUS_COLORS[lead.status] || 'bg-gray-100'}`}>
                                                {STATUS_LABELS[lead.status] || lead.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-primary-400">
                                                <Calendar size={12} />
                                                <span className="text-[10px] font-medium">
                                                    {new Date(lead.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2 items-center">
                                                <button 
                                                    onClick={() => setSelectedLead(lead)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-sm bg-gray-50 text-primary-400 hover:bg-primary-950 hover:text-white transition-all"
                                                >
                                                    <FileText size={14} />
                                                </button>
                                                {profile?.role === 'admin' && (
                                                    <button 
                                                        onClick={() => deleteLead(lead.id)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-sm bg-gray-50 text-red-400 hover:bg-red-600 hover:text-white transition-all"
                                                        title="Eliminar lead"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                                <select
                                                    value={lead.status}
                                                    onChange={(e) => {
                                                        const newStatus = e.target.value;
                                                        if (newStatus === 'interested' || newStatus === 'closed') {
                                                            setEditingFinancials({ 
                                                                id: lead.id, 
                                                                status: newStatus,
                                                                deal_value: lead.deal_value || 0, 
                                                                commission_percentage: lead.commission_percentage || 3 
                                                            });
                                                        } else {
                                                            updateStatus(lead.id, newStatus);
                                                        }
                                                    }}
                                                    className="text-[9px] font-bold uppercase tracking-widest border border-gray-100 rounded-sm px-2 py-1 focus:outline-none focus:border-primary-300 bg-white"
                                                >
                                                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                                                        <option key={key} value={key}>{label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={profile?.role === 'admin' ? "6" : "5"} className="p-12 text-center text-primary-300 text-sm">
                                        No se encontraron leads
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Financials Modal/Overlay */}
            {editingFinancials && (
                <div className="fixed inset-0 bg-primary-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-sm shadow-xl p-8 max-w-sm w-full animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xs uppercase font-bold tracking-[0.2em] text-primary-950 mb-6 border-b border-gray-50 pb-4">
                            Detalles de la Operación
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] uppercase font-bold tracking-widest text-primary-400 block mb-2">Valor de la Propiedad ($)</label>
                                <input 
                                    type="number" 
                                    value={editingFinancials.deal_value}
                                    onChange={(e) => setEditingFinancials({...editingFinancials, deal_value: e.target.value})}
                                    className="w-full border-gray-100 border p-3 text-sm focus:border-primary-950 outline-none transition-all rounded-sm"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold tracking-widest text-primary-400 block mb-2">% Comisión</label>
                                <input 
                                    type="number" 
                                    value={editingFinancials.commission_percentage}
                                    onChange={(e) => setEditingFinancials({...editingFinancials, commission_percentage: e.target.value})}
                                    className="w-full border-gray-100 border p-3 text-sm focus:border-primary-950 outline-none transition-all rounded-sm"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button 
                                    onClick={() => setEditingFinancials(null)}
                                    className="flex-1 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-primary-400 hover:text-primary-950 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={() => updateStatus(editingFinancials.id, editingFinancials.status, {
                                        deal_value: Number(editingFinancials.deal_value),
                                        commission_percentage: Number(editingFinancials.commission_percentage)
                                    })}
                                    className="flex-1 bg-primary-950 text-white px-4 py-3 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-gold-600 transition-colors shadow-lg shadow-primary-950/20"
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Lead Detail Sidebar Overlay */}
            {selectedLead && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    <div className="absolute inset-0 bg-primary-950/20 backdrop-blur-sm" onClick={() => setSelectedLead(null)} />
                    <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        {/* Header */}
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <div>
                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest mb-2 inline-block ${STATUS_COLORS[selectedLead.status]}`}>
                                    {STATUS_LABELS[selectedLead.status]}
                                </span>
                                <h2 className="text-xl font-display font-bold text-primary-950 uppercase tracking-tight">{selectedLead.full_name}</h2>
                                <p className="text-[10px] text-primary-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                                    <Mail size={10} /> {selectedLead.email}
                                    {selectedLead.phone && <span className="flex items-center gap-2"><Phone size={10} /> {selectedLead.phone}</span>}
                                </p>
                            </div>
                            <button 
                                onClick={() => setSelectedLead(null)}
                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 text-primary-300 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {/* Meta Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-sm">
                                    <label className="text-[9px] uppercase font-bold tracking-widest text-primary-400 block mb-1">Propiedad</label>
                                    <p className="text-xs font-bold text-primary-950 leading-tight">{selectedLead.properties?.title || 'Consulta General'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-sm">
                                    <label className="text-[9px] uppercase font-bold tracking-widest text-primary-400 block mb-1">Registrado el</label>
                                    <p className="text-xs font-bold text-primary-950">{new Date(selectedLead.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Original Message */}
                            {selectedLead.message && (
                                <div>
                                    <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary-400 mb-4 flex items-center gap-2">
                                        <MessageSquare size={12} /> Mensaje Original
                                    </h4>
                                    <div className="p-6 bg-primary-950 text-white rounded-sm text-sm leading-relaxed font-light italic">
                                        "{selectedLead.message}"
                                    </div>
                                </div>
                            )}

                            {/* Admin Controls: Reassignment */}
                            {profile?.role === 'admin' && (
                                <div className="p-6 border border-gray-100 rounded-sm bg-gray-50/50">
                                    <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary-950 mb-4 flex items-center gap-2">
                                        <User size={12} /> Asignación de Agente
                                    </h4>
                                    <select
                                        value={selectedLead.agent_id || ''}
                                        onChange={(e) => reassignLead(selectedLead.id, e.target.value)}
                                        className="w-full bg-white border border-gray-200 p-3 text-xs font-bold uppercase tracking-widest text-primary-700 rounded-sm outline-none focus:border-primary-950"
                                    >
                                        <option value="">Sin asignar</option>
                                        {agents.map(agent => (
                                            <option key={agent.id} value={agent.id}>{agent.full_name}</option>
                                        ))}
                                    </select>
                                    <p className="text-[9px] text-primary-300 mt-2 italic font-medium">Solo los administradores pueden reasignar prospectos.</p>
                                </div>
                            )}

                            {/* Internal Notes Section */}
                            <div className="space-y-6">
                                <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary-400 flex items-center justify-between">
                                    <span>Notas Internas de Seguimiento</span>
                                    <span className="bg-gray-100 text-primary-600 px-2 py-0.5 rounded-full text-[8px]">{notes.length}</span>
                                </h4>
                                
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Escribe una nota interna..."
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addNote()}
                                        className="flex-1 border-b border-gray-200 py-3 text-sm focus:border-primary-950 outline-none transition-colors"
                                    />
                                    <button 
                                        onClick={addNote}
                                        disabled={isSavingNote || !newNote.trim()}
                                        className="w-10 h-10 flex items-center justify-center rounded-sm bg-primary-950 text-white hover:bg-gold-600 transition-colors disabled:bg-gray-200"
                                    >
                                        <PlusCircle size={18} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {notes.length > 0 ? notes.map((note) => (
                                        <div key={note.id} className="p-4 rounded-sm bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[9px] font-bold uppercase text-primary-950 tracking-widest">{note.agent?.full_name}</span>
                                                <span className="text-[8px] font-bold text-primary-300">{new Date(note.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs text-primary-600 leading-relaxed font-medium">{note.content}</p>
                                        </div>
                                    )) : (
                                        <div className="text-center py-10">
                                            <p className="text-[10px] text-primary-200 uppercase font-bold tracking-widest italic">No hay notas registradas todavía.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-8 border-t border-gray-50 bg-gray-50/30 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                {selectedLead.phone && (
                                    <a 
                                        href={`https://wa.me/${selectedLead.phone.replace(/\D/g, '')}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors"
                                    >
                                        <Phone size={14} /> WhatsApp
                                    </a>
                                )}
                            </div>
                            <button 
                                onClick={() => setSelectedLead(null)}
                                className="text-[10px] font-bold uppercase tracking-widest text-primary-400 hover:text-primary-950"
                            >
                                Cerrar Ficha
                            </button>
                            {profile?.role === 'admin' && (
                                <button 
                                    onClick={() => deleteLead(selectedLead.id)}
                                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
                                >
                                    <Trash2 size={14} /> Eliminar Lead
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLeads;
