import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, handleSupabaseAuthError } from '../../lib/supabase';
import { useAuth } from '../auth/AuthContext';
import { Plus, Edit3, Trash2, Loader2, X, UserPlus, Mail, Phone, User, Save, MapPin, ChevronRight } from 'lucide-react';

const AdminAgents = () => {
    const navigate = useNavigate();
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();

    const [newAgent, setNewAgent] = useState({
        email: '',
        password: '',
        full_name: '',
        phone: '',
        city: '',
    });

    const [editAgent, setEditAgent] = useState({
        id: '',
        full_name: '',
        phone: '',
        email: '',
        city: '',
    });

    const fetchAgents = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'agent')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching agents:', error);
            handleSupabaseAuthError(error);
        } else {
            setAgents(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const handleCreateAgent = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            const response = await supabase.functions.invoke('smart-responder', {
                body: {
                    action: 'create',
                    email: newAgent.email,
                    password: newAgent.password,
                    full_name: newAgent.full_name,
                    phone: newAgent.phone,
                    city: newAgent.city,
                },
            });

            if (response.error) {
                throw new Error(response.error.message || 'Error al crear agente');
            }

            setShowModal(false);
            setNewAgent({ email: '', password: '', full_name: '', phone: '', city: '' });
            fetchAgents();
        } catch (err) {
            console.error('Error creating agent:', err);
            if (err.error) handleSupabaseAuthError(err.error);
            setError(err.message || 'Error al crear el agente');
        } finally {
            setSaving(false);
        }
    };

    const handleEditAgent = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: editAgent.full_name,
                    phone: editAgent.phone,
                    city: editAgent.city,
                })
                .eq('id', editAgent.id);

            if (error) {
                handleSupabaseAuthError(error);
                throw error;
            }

            setShowEditModal(false);
            setAgents(prev =>
                prev.map(a => a.id === editAgent.id
                    ? { ...a, full_name: editAgent.full_name, phone: editAgent.phone, city: editAgent.city }
                    : a
                )
            );
        } catch (err) {
            console.error('Error updating agent:', err);
            setError(err.message || 'Error al actualizar el agente');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAgent = async (agentId) => {
        setDeleting(true);

        try {
            const response = await supabase.functions.invoke('smart-responder', {
                body: {
                    action: 'delete',
                    agent_id: agentId,
                },
            });

            if (response.error) {
                throw new Error(response.error.message || 'Error al eliminar agente');
            }

            setShowDeleteConfirm(null);
            setAgents(prev => prev.filter(a => a.id !== agentId));
        } catch (err) {
            console.error('Error deleting agent:', err);
            if (err.error) handleSupabaseAuthError(err.error);
            alert('Error al eliminar el agente: ' + err.message);
        } finally {
            setDeleting(false);
        }
    };

    const handleToggleActive = async (agentId, currentStatus) => {
        const { error } = await supabase
            .from('profiles')
            .update({ is_active: !currentStatus })
            .eq('id', agentId);

        if (error) {
            console.error('Error updating agent:', error);
            handleSupabaseAuthError(error);
            alert('Error al actualizar el agente');
        } else {
            setAgents(prev =>
                prev.map(a => a.id === agentId ? { ...a, is_active: !currentStatus } : a)
            );
        }
    };

    const openEditModal = (agent) => {
        setEditAgent({
            id: agent.id,
            full_name: agent.full_name || '',
            phone: agent.phone || '',
            email: agent.email || '',
            city: agent.city || '',
        });
        setError('');
        setShowEditModal(true);
    };

    return (
        <div>
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-display font-light text-primary-950 uppercase tracking-tight">
                        Gestión de <span className="font-bold">Agentes</span>
                    </h1>
                    <p className="text-xs text-primary-400 font-bold uppercase tracking-widest mt-2">
                        {agents.length} agente{agents.length !== 1 ? 's' : ''} registrado{agents.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary-950 text-white px-8 py-4 rounded-sm font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 hover:bg-primary-800 transition-all"
                >
                    <UserPlus size={16} /> Nuevo Agente
                </button>
            </header>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={24} className="animate-spin text-primary-400" />
                </div>
            ) : agents.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-primary-300 text-sm">No hay agentes registrados</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="mt-4 text-primary-950 text-xs font-bold uppercase tracking-widest hover:underline"
                    >
                        Crear el primero →
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100/50 border-b border-gray-100">
                            <tr>
                                <th className="p-5 text-[10px] uppercase font-bold tracking-widest text-primary-400">Agente</th>
                                <th className="p-5 text-[10px] uppercase font-bold tracking-widest text-primary-400 hidden md:table-cell">Ciudad</th>
                                <th className="p-5 text-[10px] uppercase font-bold tracking-widest text-primary-400 hidden md:table-cell">Teléfono</th>
                                <th className="p-5 text-[10px] uppercase font-bold tracking-widest text-primary-400">Estado</th>
                                <th className="p-5 text-[10px] uppercase font-bold tracking-widest text-primary-400">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {agents.map((agent) => (
                                <tr key={agent.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-5">
                                        <div
                                            className="flex items-center gap-3 cursor-pointer group"
                                            onClick={() => navigate(`/admin/agentes/${agent.id}`)}
                                            title="Ver perfil del agente"
                                        >
                                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 transition-colors">
                                                <User size={16} className="text-primary-400 group-hover:text-primary-950 transition-colors" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-primary-950 group-hover:underline">
                                                    {agent.full_name || 'Sin nombre'}
                                                </div>
                                                <div className="text-[10px] text-primary-400">{agent.email}</div>
                                            </div>
                                            <ChevronRight size={14} className="text-primary-200 group-hover:text-primary-400 transition-colors" />
                                        </div>
                                    </td>
                                    <td className="p-5 hidden md:table-cell">
                                        <span className="text-xs text-primary-400">{agent.city || '—'}</span>
                                    </td>
                                    <td className="p-5 hidden md:table-cell">
                                        <span className="text-xs text-primary-400">{agent.phone || '—'}</span>
                                    </td>
                                    <td className="p-5">
                                        <button
                                            onClick={() => handleToggleActive(agent.id, agent.is_active)}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <span className={`w-2 h-2 rounded-full ${agent.is_active ? 'bg-green-500' : 'bg-red-400'}`} />
                                            <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">
                                                {agent.is_active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </button>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openEditModal(agent)}
                                                className="p-2 text-primary-400 hover:text-primary-950 transition-colors"
                                                title="Editar agente"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(agent)}
                                                className="p-2 text-primary-400 hover:text-red-500 transition-colors"
                                                title="Eliminar agente"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal: Nuevo Agente */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-sm shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-lg font-display font-light text-primary-950 uppercase tracking-tight">
                                Nuevo <span className="font-bold">Agente</span>
                            </h2>
                            <button
                                onClick={() => { setShowModal(false); setError(''); }}
                                className="p-2 text-primary-400 hover:text-primary-950 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateAgent} className="p-6 space-y-5">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-sm text-red-600 text-xs">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="text-[10px] uppercase font-bold tracking-widest text-primary-950 block mb-2">
                                    Nombre Completo *
                                </label>
                                <div className="relative">
                                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-300" />
                                    <input
                                        type="text"
                                        value={newAgent.full_name}
                                        onChange={(e) => setNewAgent(prev => ({ ...prev, full_name: e.target.value }))}
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-primary-300 transition-colors"
                                        placeholder="Juan Pérez"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-bold tracking-widest text-primary-950 block mb-2">
                                    Email *
                                </label>
                                <div className="relative">
                                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-300" />
                                    <input
                                        type="email"
                                        value={newAgent.email}
                                        onChange={(e) => setNewAgent(prev => ({ ...prev, email: e.target.value }))}
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-primary-300 transition-colors"
                                        placeholder="agente@origenprop.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-bold tracking-widest text-primary-950 block mb-2">
                                    Contraseña *
                                </label>
                                <input
                                    type="password"
                                    value={newAgent.password}
                                    onChange={(e) => setNewAgent(prev => ({ ...prev, password: e.target.value }))}
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-3 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-primary-300 transition-colors"
                                    placeholder="Mínimo 6 caracteres"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-bold tracking-widest text-primary-950 block mb-2">
                                    Teléfono
                                </label>
                                <div className="relative">
                                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-300" />
                                    <input
                                        type="tel"
                                        value={newAgent.phone}
                                        onChange={(e) => setNewAgent(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-primary-300 transition-colors"
                                        placeholder="+54 9 376 4123456"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-bold tracking-widest text-primary-950 block mb-2">
                                    Ciudad
                                </label>
                                <div className="relative">
                                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-300" />
                                    <input
                                        type="text"
                                        value={newAgent.city}
                                        onChange={(e) => setNewAgent(prev => ({ ...prev, city: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-primary-300 transition-colors"
                                        placeholder="Ej: Buenos Aires, Posadas, Córdoba"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-primary-950 text-white py-4 rounded-sm font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 hover:bg-primary-800 transition-colors disabled:opacity-50"
                                >
                                    {saving ? (
                                        <><Loader2 size={14} className="animate-spin" /> Creando...</>
                                    ) : (
                                        <><UserPlus size={14} /> Crear Agente</>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); setError(''); }}
                                    className="px-6 py-4 rounded-sm font-bold uppercase tracking-[0.2em] text-[10px] text-primary-400 hover:text-primary-950 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Editar Agente */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-sm shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-lg font-display font-light text-primary-950 uppercase tracking-tight">
                                Editar <span className="font-bold">Agente</span>
                            </h2>
                            <button
                                onClick={() => { setShowEditModal(false); setError(''); }}
                                className="p-2 text-primary-400 hover:text-primary-950 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleEditAgent} className="p-6 space-y-5">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-sm text-red-600 text-xs">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="text-[10px] uppercase font-bold tracking-widest text-primary-400 block mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-200" />
                                    <input
                                        type="email"
                                        value={editAgent.email}
                                        disabled
                                        className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-sm text-sm bg-gray-50 text-primary-400 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-bold tracking-widest text-primary-950 block mb-2">
                                    Nombre Completo
                                </label>
                                <div className="relative">
                                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-300" />
                                    <input
                                        type="text"
                                        value={editAgent.full_name}
                                        onChange={(e) => setEditAgent(prev => ({ ...prev, full_name: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-primary-300 transition-colors"
                                        placeholder="Juan Pérez"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-bold tracking-widest text-primary-950 block mb-2">
                                    Teléfono
                                </label>
                                <div className="relative">
                                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-300" />
                                    <input
                                        type="tel"
                                        value={editAgent.phone}
                                        onChange={(e) => setEditAgent(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-primary-300 transition-colors"
                                        placeholder="+54 9 376 4123456"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-bold tracking-widest text-primary-950 block mb-2">
                                    Ciudad
                                </label>
                                <div className="relative">
                                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-300" />
                                    <input
                                        type="text"
                                        value={editAgent.city}
                                        onChange={(e) => setEditAgent(prev => ({ ...prev, city: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-primary-300 transition-colors"
                                        placeholder="Ej: Buenos Aires, Posadas, Córdoba"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-primary-950 text-white py-4 rounded-sm font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 hover:bg-primary-800 transition-colors disabled:opacity-50"
                                >
                                    {saving ? (
                                        <><Loader2 size={14} className="animate-spin" /> Guardando...</>
                                    ) : (
                                        <><Save size={14} /> Guardar Cambios</>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowEditModal(false); setError(''); }}
                                    className="px-6 py-4 rounded-sm font-bold uppercase tracking-[0.2em] text-[10px] text-primary-400 hover:text-primary-950 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Confirmar Eliminación */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-sm shadow-xl w-full max-w-sm">
                        <div className="p-6">
                            <h2 className="text-lg font-display font-bold text-primary-950 uppercase tracking-tight mb-2">
                                Eliminar Agente
                            </h2>
                            <p className="text-sm text-primary-400 mb-1">
                                ¿Estás seguro de que querés eliminar a:
                            </p>
                            <p className="text-sm font-bold text-primary-950 mb-1">
                                {showDeleteConfirm.full_name || 'Sin nombre'}
                            </p>
                            <p className="text-xs text-primary-400 mb-6">
                                {showDeleteConfirm.email}
                            </p>
                            <div className="p-3 bg-red-50 border border-red-100 rounded-sm text-red-600 text-xs mb-6">
                                Esta acción es irreversible. Se eliminará el usuario y todos sus datos.
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleDeleteAgent(showDeleteConfirm.id)}
                                    disabled={deleting}
                                    className="flex-1 bg-red-500 text-white py-4 rounded-sm font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                    {deleting ? (
                                        <><Loader2 size={14} className="animate-spin" /> Eliminando...</>
                                    ) : (
                                        <><Trash2 size={14} /> Eliminar</>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="px-6 py-4 rounded-sm font-bold uppercase tracking-[0.2em] text-[10px] text-primary-400 hover:text-primary-950 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAgents;
