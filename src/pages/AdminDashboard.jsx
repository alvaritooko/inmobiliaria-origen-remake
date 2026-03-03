import React from 'react';
import { LayoutDashboard, Building2, Users, Settings, LogOut, Loader2 } from 'lucide-react';
import { Link, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import AdminProperties from '../features/admin/AdminProperties';
import PropertyForm from '../features/admin/PropertyForm';
import AdminAgents from '../features/admin/AdminAgents';
import AdminCRMStats from '../features/admin/AdminCRMStats';

const AdminSummary = () => {
    const { profile } = useAuth();

    return (
        <div>
            <h1 className="text-3xl font-display font-light text-primary-950 uppercase tracking-tight mb-2">
                Bienvenido, <span className="font-bold">{profile?.full_name || 'Admin'}</span>
            </h1>
            <p className="text-xs text-primary-400 font-bold uppercase tracking-widest mb-12">
                Panel de administración de Origen Inmobiliaria
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/admin/propiedades" className="bg-white rounded-sm shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow group">
                    <Building2 size={24} className="text-primary-300 mb-4 group-hover:text-primary-950 transition-colors" />
                    <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary-400 mb-1">Propiedades</h3>
                    <p className="text-sm text-primary-950">Gestionar publicaciones</p>
                </Link>
                {profile?.role === 'admin' && (
                    <Link to="/admin/agentes" className="bg-white rounded-sm shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow group">
                        <Users size={24} className="text-primary-300 mb-4 group-hover:text-primary-950 transition-colors" />
                        <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary-400 mb-1">Agentes</h3>
                        <p className="text-sm text-primary-950">Administrar equipo</p>
                    </Link>
                )}
                <Link to="/admin/ajustes" className="bg-white rounded-sm shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow group">
                    <Settings size={24} className="text-primary-300 mb-4 group-hover:text-primary-950 transition-colors" />
                    <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary-400 mb-1">Ajustes</h3>
                    <p className="text-sm text-primary-950">Configuración del perfil</p>
                </Link>
            </div>

            {/* CRM Stats — solo para admin */}
            {profile?.role === 'admin' && (
                <div className="mt-12">
                    <AdminCRMStats />
                </div>
            )}
        </div>
    );
};

const AdminDashboard = () => {
    const { profile, signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [isLoggingOut, setIsLoggingOut] = React.useState(false);

    const handleSignOut = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        try {
            await signOut();
            navigate('/login');
        } catch (err) {
            console.error('[Admin] Logout error:', err);
            alert('Error al cerrar sesión. Reintentalo.');
        } finally {
            setIsLoggingOut(false);
        }
    };

    const navItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Resumen', exact: true },
        { path: '/admin/propiedades', icon: Building2, label: 'Propiedades' },
        ...(profile?.role === 'admin' ? [{ path: '/admin/agentes', icon: Users, label: 'Agentes' }] : []),
        { path: '/admin/ajustes', icon: Settings, label: 'Ajustes' },
    ];

    const isActive = (item) => {
        if (item.exact) return location.pathname === item.path;
        return location.pathname.startsWith(item.path);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-primary-950 text-white flex flex-col p-8 flex-shrink-0">
                <Link to="/" className="mb-16 hover:opacity-80 transition-opacity">
                    <img src="/origen_logo_color.png" alt="Origen Admin" className="h-8 w-auto brightness-0 invert" />
                    <span className="text-[10px] font-display font-bold tracking-[0.3em] uppercase opacity-40 mt-3 block">Panel Administrativo</span>
                </Link>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] p-4 rounded-sm transition-all ${isActive(item)
                                ? 'bg-white/10 text-white'
                                : 'text-primary-400 hover:text-white'
                                }`}
                        >
                            <item.icon size={18} /> {item.label}
                        </Link>
                    ))}
                </nav>

                {/* User info + Logout */}
                <div className="border-t border-white/10 pt-6 mt-6">
                    <div className="mb-4">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                            {profile?.role === 'admin' ? 'Administrador' : 'Agente'}
                        </div>
                        <div className="text-xs text-white/40 mt-1 truncate">{profile?.email}</div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        disabled={isLoggingOut}
                        className={`flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] p-4 transition-colors w-full ${isLoggingOut ? 'text-gray-500 cursor-not-allowed' : 'text-primary-400 hover:text-red-400'}`}
                    >
                        {isLoggingOut ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <LogOut size={18} />
                        )}
                        {isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-12 overflow-y-auto">
                <Routes>
                    <Route index element={<AdminSummary />} />
                    <Route path="propiedades" element={<AdminProperties />} />
                    <Route path="propiedades/nueva" element={<PropertyForm />} />
                    <Route path="propiedades/:id/editar" element={<PropertyForm />} />
                    <Route path="agentes" element={
                        profile?.role === 'admin' ? <AdminAgents /> : <AdminSummary />
                    } />
                    <Route path="ajustes" element={
                        <div className="text-center py-20 text-primary-300 text-sm">
                            Configuración — próximamente
                        </div>
                    } />
                </Routes>
            </main>
        </div>
    );
};

export default AdminDashboard;
