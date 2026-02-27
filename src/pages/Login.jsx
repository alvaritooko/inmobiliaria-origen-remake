import React, { useState } from 'react';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signIn(email, password);
            navigate('/admin');
        } catch (err) {
            setError(
                err.message === 'Invalid login credentials'
                    ? 'Email o contraseña incorrectos'
                    : 'Error al iniciar sesión. Intentá de nuevo.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row">
            {/* Visual Side */}
            <div className="hidden md:flex md:w-1/2 bg-primary-950 relative overflow-hidden items-center justify-center p-20">
                <div className="absolute inset-0 opacity-40">
                    <img
                        src="https://images.unsplash.com/photo-1600607687940-c52af04657b3?q=80&w=2070&auto=format&fit=crop"
                        className="w-full h-full object-cover grayscale"
                        alt="Office"
                    />
                </div>
                <div className="relative z-10 max-w-sm">
                    <h2 className="text-4xl font-display font-light text-white leading-tight mb-6">
                        Gestiona la excelencia <br /><span className="font-bold italic">desde el interior.</span>
                    </h2>
                    <p className="text-primary-400 font-light leading-relaxed">
                        Acceso exclusivo para agentes y administradores de Origen Inmobiliaria.
                    </p>
                </div>
            </div>

            {/* Form Side */}
            <div className="flex-1 flex items-center justify-center p-8 md:p-24">
                <div className="w-full max-w-sm space-y-12">
                    <Link to="/" className="flex items-center gap-3">
                        <img src="/origen_logo_color.png" alt="Origen Inmobiliaria" className="h-12 w-auto" />
                    </Link>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-display font-light text-primary-950">Bienvenido</h1>
                        <p className="text-sm text-primary-400 uppercase tracking-widest font-bold">Ingresa tus credenciales para continuar</p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-sm text-red-600">
                            <AlertCircle size={16} />
                            <span className="text-xs font-medium">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-primary-950">Email Institucional</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="agente@origenprop.com"
                                required
                                className="w-full px-0 py-4 border-b border-primary-100 focus:border-primary-950 outline-none transition-colors text-sm font-light tracking-wide placeholder:text-primary-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-primary-950">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="********"
                                required
                                className="w-full px-0 py-4 border-b border-primary-100 focus:border-primary-950 outline-none transition-colors text-sm font-light tracking-wide placeholder:text-primary-100"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-950 text-white py-5 rounded-sm font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 group mt-10 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-800 transition-colors"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" /> Ingresando...
                                </>
                            ) : (
                                <>
                                    Iniciar Sesión <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-[10px] text-primary-300 uppercase tracking-widest font-bold">
                        ¿Olvidaste tu acceso? <span className="text-primary-950 cursor-pointer">Contactar soporte</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
