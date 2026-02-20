import React, { useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import { Ruler, BarChart3, ShieldCheck, ChevronRight, Activity, Cpu, Briefcase } from 'lucide-react';

const About = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-[#f0f0f0] min-h-screen font-sans text-primary-950">
            <Navbar />

            <main className="pt-20">
                {/* 01. SITE ANALYSIS / HERO */}
                <section className="px-6 py-24 md:py-40 border-b border-gray-300 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-12 gap-12 items-baseline">
                            <div className="lg:col-span-1 text-[10px] font-bold tracking-[0.4em] text-primary-300">
                                01 / INTRO
                            </div>
                            <div className="lg:col-span-7">
                                <h1 className="text-5xl md:text-8xl font-display font-light leading-[0.9] tracking-tighter mb-12">
                                    Arquitectura <br />
                                    <span className="font-bold italic">De Negocios.</span>
                                </h1>
                                <p className="text-xl md:text-2xl font-light leading-relaxed max-w-2xl text-primary-600">
                                    ORIGEN no es una agencia inmobiliaria tradicional. Somos una consultora de activos estructurada bajo procesos de ingeniería, visión arquitectónica y rigor financiero.
                                </p>
                            </div>
                            <div className="lg:col-span-4 self-end">
                                <div className="p-8 border border-gray-200 bg-gray-50 rounded-sm">
                                    <div className="flex items-center gap-3 mb-4 text-gold-600">
                                        <Activity size={18} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Estado de Misión</span>
                                    </div>
                                    <p className="text-xs leading-relaxed text-primary-400 uppercase tracking-wider font-medium">
                                        "Transformar la incertidumbre del mercado en estructuras de valor patrimonial mediante análisis técnico y curaduría estética."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 02. STRUCTURAL CORE / VALUES */}
                <section className="px-6 py-32 border-b border-gray-300">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-12 gap-24">
                            <div className="lg:col-span-4 space-y-12">
                                <div>
                                    <div className="text-[10px] font-bold tracking-[0.4em] text-primary-300 mb-8">02 / CORE</div>
                                    <h2 className="text-4xl font-display font-light uppercase tracking-tight leading-none mb-6">
                                        Triangulación <br />
                                        <span className="font-bold italic">Estratégica.</span>
                                    </h2>
                                    <p className="text-primary-600 font-light">
                                        Operamos en la intersección de tres disciplinas críticas para garantizar la excelencia en cada activo.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <div className="h-px w-full bg-primary-200"></div>
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-primary-400">
                                        <span>ISO Standards Compliance</span>
                                        <span>2026/V.01</span>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-8 grid md:grid-cols-3 gap-8">
                                {/* Architect Node */}
                                <div className="p-10 bg-white border border-gray-200 hover:border-gold-500 transition-all group">
                                    <div className="mb-12 text-gold-500 group-hover:scale-110 transition-transform origin-left">
                                        <Ruler size={32} strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-xl font-display font-bold uppercase tracking-tighter mb-4">Arquitecto</h3>
                                    <p className="text-sm font-light text-primary-500 leading-relaxed italic mb-6">
                                        "La síntesis estética como valor de mercado."
                                    </p>
                                    <div className="text-[9px] uppercase font-bold tracking-[0.2em] text-primary-300 space-y-2">
                                        <div>• Curaduría de diseño</div>
                                        <div>• Optimización espacial</div>
                                        <div>• Semiótica del entorno</div>
                                    </div>
                                </div>

                                {/* Engineer Node */}
                                <div className="p-10 bg-white border border-gray-200 hover:border-gold-500 transition-all group">
                                    <div className="mb-12 text-gold-500 group-hover:scale-110 transition-transform origin-left">
                                        <Cpu size={32} strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-xl font-display font-bold uppercase tracking-tighter mb-4">Ingeniero</h3>
                                    <p className="text-sm font-light text-primary-500 leading-relaxed italic mb-6">
                                        "Infraestructura analítica y legal."
                                    </p>
                                    <div className="text-[9px] uppercase font-bold tracking-[0.2em] text-primary-300 space-y-2">
                                        <div>• Auditoría técnica</div>
                                        <div>• Seguridad jurídica</div>
                                        <div>• Procesos normativos</div>
                                    </div>
                                </div>

                                {/* Investor Node */}
                                <div className="p-10 bg-white border border-gray-200 hover:border-gold-500 transition-all group">
                                    <div className="mb-12 text-gold-500 group-hover:scale-110 transition-transform origin-left">
                                        <Briefcase size={32} strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-xl font-display font-bold uppercase tracking-tighter mb-4">Inversor</h3>
                                    <p className="text-sm font-light text-primary-500 leading-relaxed italic mb-6">
                                        "Maximización del ROI patrimonial."
                                    </p>
                                    <div className="text-[9px] uppercase font-bold tracking-[0.2em] text-primary-300 space-y-2">
                                        <div>• Ingeniería de mercado</div>
                                        <div>• Estrategia de capital</div>
                                        <div>• Gestión de portafolio</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 03. ASSET BLUEPRINT / METODOLOGÍA */}
                <section className="px-6 py-32 bg-primary-950 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-24 opacity-5 pointer-events-none">
                        <BarChart3 size={600} strokeWidth={0.5} />
                    </div>

                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="mb-24">
                            <span className="text-[10px] font-bold tracking-[0.4em] text-gold-500 mb-6 block uppercase">03 / METODOLOGÍA</span>
                            <h2 className="text-5xl md:text-7xl font-display font-light leading-none tracking-tighter uppercase">
                                El Protocolo <br />
                                <span className="font-bold italic">Origen.</span>
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-4 gap-12">
                            {[
                                { step: '01', title: 'Adquisición Técnica', desc: 'Identificación de activos subvaluados con potencial arquitectónico.' },
                                { step: '02', title: 'Estructuración', desc: 'Análisis de viabilidad técnica, legal y financiera multicapa.' },
                                { step: '03', title: 'Reposicionamiento', desc: 'Optimización de valor mediante curaduría y marketing estratégico.' },
                                { step: '04', title: 'Liquidación de Valor', desc: 'Ejecución de salida o gestión de renta con máximos rendimientos.' }
                            ].map((item, i) => (
                                <div key={i} className="space-y-6 pt-12 border-t border-white/10 group">
                                    <div className="text-xs font-display font-bold text-gold-500 group-hover:translate-x-2 transition-transform">{item.step}</div>
                                    <h4 className="text-lg font-bold uppercase tracking-widest leading-tight">{item.title}</h4>
                                    <p className="text-sm text-primary-300 font-light leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 04. CAPITAL STRATEGY / BUSINESS VISION */}
                <section className="px-6 py-32 bg-white">
                    <div className="max-w-3xl mx-auto text-center space-y-12">
                        <div className="text-[10px] font-bold tracking-[0.4em] text-primary-300 uppercase">04 / VISIÓN DE NEGOCIO</div>
                        <h2 className="text-4xl md:text-6xl font-display font-light text-primary-950 leading-tight">
                            "No gestionamos inmuebles, <br />
                            <span className="font-bold underline decoration-gold-500 underline-offset-8">Diseñamos Inversiones."</span>
                        </h2>
                        <p className="text-lg font-light text-primary-600 leading-relaxed italic">
                            En la industria de la construcción y el real estate, la rentabilidad nace en el tablero de diseño y se consolida en la ingeniería de procesos. ORIGEN une esos puntos para ofrecer seguridad absoluta al inversor.
                        </p>
                        <div className="pt-12">
                            <div className="inline-flex items-center gap-12 py-8 border-y border-gray-100">
                                <div className="text-center">
                                    <div className="text-3xl font-display font-bold mb-1">0%</div>
                                    <div className="text-[9px] uppercase tracking-widest text-primary-400">Tolerancia Error</div>
                                </div>
                                <div className="w-px h-10 bg-gray-200"></div>
                                <div className="text-center">
                                    <div className="text-3xl font-display font-bold mb-1">∞</div>
                                    <div className="text-[9px] uppercase tracking-widest text-primary-400">Compromiso Técnico</div>
                                </div>
                                <div className="w-px h-10 bg-gray-200"></div>
                                <div className="text-center">
                                    <div className="text-3xl font-display font-bold mb-1">100%</div>
                                    <div className="text-[9px] uppercase tracking-widest text-primary-400">Fidelidad Estructural</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FINAL STATEMENT */}
                <section className="py-24 bg-gray-50 border-t border-gray-200 overflow-hidden">
                    <div className="flex whitespace-nowrap animate-infinite-scroll hover:pause cursor-default">
                        {[...Array(10)].map((_, i) => (
                            <span key={i} className="text-6xl md:text-[10rem] font-display font-bold uppercase text-primary-950/5 tracking-tighter mx-8">
                                Architecture • Engineering • Capital • Strategy • Architecture •
                            </span>
                        ))}
                    </div>
                </section>
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes infinite-scroll {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                .animate-infinite-scroll {
                    display: flex;
                    width: max-content;
                    animation: infinite-scroll 60s linear infinite;
                }
                .pause:hover {
                    animation-play-state: paused;
                }
            `}} />
        </div>
    );
};

export default About;
