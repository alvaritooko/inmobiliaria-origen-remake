import React from 'react';
import { Link } from 'react-router-dom';
import { User, LogIn, Menu } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';

const Navbar = () => {
    const { user, profile } = useAuth();

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 cursor-pointer">
                    <img src="/origen_logo_color.png" alt="Origen Inmobiliaria" className="h-14 w-auto" />
                </Link>

                {/* Mobile login icon — subtle, only visible on small screens */}
                <Link
                    to={user ? '/admin' : '/login'}
                    className="md:hidden flex items-center justify-center w-9 h-9 rounded-full bg-primary-950/10 text-primary-950/40 hover:bg-primary-950/20 hover:text-primary-950/70 transition-all"
                >
                    <Menu size={16} />
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
