import React from 'react';
import { Link } from 'react-router-dom';
import { User, LogIn } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';

const Navbar = () => {
    const { user, profile } = useAuth();

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 cursor-pointer">
                    <img src="/origen_logo_negro.png" alt="Origen Inmobiliaria" className="h-10 w-auto" />
                </Link>

                <div className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em]">
                    <Link to="/" className="text-primary-400 hover:text-primary-950 transition-colors">Inicio</Link>
                    <Link to="/propiedades" className="text-primary-400 hover:text-primary-950 transition-colors">Propiedades</Link>
                    <Link
                        to={user ? '/admin' : '/login'}
                        className="px-5 py-2.5 bg-primary-950 text-white flex items-center gap-2 hover:bg-primary-800 transition-all rounded-sm shadow-xl shadow-primary-950/10"
                    >
                        {user ? <User size={12} /> : <LogIn size={12} />}
                        {user ? (profile?.full_name || 'Mi Panel') : 'Mi Cuenta'}
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
