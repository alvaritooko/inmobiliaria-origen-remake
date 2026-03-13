import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { 
    DollarSign, TrendingUp, PieChart as PieChartIcon, 
    BarChart3, ArrowUpRight, ArrowDownRight, Users, Building2,
    Printer
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminFinance = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        expectedRevenue: 0,
        totalCommissions: 0,
        monthlyData: [],
        agentPerformance: [],
        rawLeads: [],
        closedCount: 0,
        interestedCount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFinanceData();
    }, []);

    const fetchFinanceData = async () => {
        setLoading(true);
        const { data: leads, error } = await supabase
            .from('leads')
            .select(`
                *,
                agent:profiles!leads_agent_id_fkey(full_name)
            `);

        if (!error && leads) {
            const closedLeads = leads.filter(l => l.status === 'closed');
            const interestedLeads = leads.filter(l => l.status === 'interested');

            const totalRevenue = closedLeads.reduce((sum, l) => sum + (Number(l.deal_value) || 0), 0);
            const totalCommissions = closedLeads.reduce((sum, l) => {
                const val = Number(l.deal_value) || 0;
                const comm = Number(l.commission_percentage) || 0;
                return sum + (val * (comm / 100));
            }, 0);

            const expectedRevenue = interestedLeads.reduce((sum, l) => sum + (Number(l.deal_value) || 0), 0);

            const agentStats = {};
            closedLeads.forEach(l => {
                const name = l.agent?.full_name || 'Desconocido';
                const comm = (Number(l.deal_value) || 0) * ((Number(l.commission_percentage) || 0) / 100);
                agentStats[name] = (agentStats[name] || 0) + comm;
            });
            
            const agentPerformance = Object.entries(agentStats).map(([name, value]) => ({ name, value }));

            setStats({
                totalRevenue,
                expectedRevenue,
                totalCommissions,
                monthlyData: [],
                agentPerformance,
                rawLeads: leads,
                closedCount: closedLeads.length,
                interestedCount: interestedLeads.length
            });
        }
        setLoading(false);
    };

    const downloadPDF = () => {
        try {
            const doc = new jsPDF();
            const dateStr = new Date().toLocaleDateString();

            // Header
            doc.setFillColor(15, 23, 42); // Primary 950
            doc.rect(0, 0, 210, 40, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.text("ORIGEN INMOBILIARIA", 15, 20);
            doc.setFontSize(10);
            doc.text("REPORTE FINANCIERO MENSUAL", 15, 30);
            doc.text(`Fecha: ${dateStr}`, 160, 30);

            // Summary Title
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(14);
            doc.text("RESUMEN DE OPERACIONES", 15, 55);

            // Stats Table
            autoTable(doc, {
                startY: 65,
                head: [['Concepto', 'Cantidad', 'Monto Total']],
                body: [
                    ['Ventas Cerradas', stats.closedCount.toString(), `$${stats.totalRevenue.toLocaleString()}`],
                    ['Comisiones Generadas', '-', `$${stats.totalCommissions.toLocaleString()}`],
                    ['Pipeline (Interesados)', stats.interestedCount.toString(), `$${stats.expectedRevenue.toLocaleString()}`]
                ],
                theme: 'grid',
                headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
                styles: { fontSize: 10, cellPadding: 5 }
            });

            // Agent Performance Title
            doc.setFontSize(14);
            doc.text("RENDIMIENTO POR AGENTE (COMISIONES)", 15, doc.lastAutoTable.finalY + 15);

            // Agent Performance Table
            const agentRows = stats.agentPerformance.map(a => [a.name, `$${a.value.toLocaleString()}`]);
            autoTable(doc, {
                startY: doc.lastAutoTable.finalY + 25,
                head: [['Agente', 'Comisión Generada']],
                body: agentRows.length > 0 ? agentRows : [['Sin cierres registrados', '$0']],
                theme: 'striped',
                headStyles: { fillColor: [67, 70, 241], textColor: [255, 255, 255] }, // Blue-600
                styles: { fontSize: 10 }
            });

            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`ORIGEN Inmobiliaria - Reporte Confidencial - Página ${i} de ${pageCount}`, 105, 287, { align: 'center' });
            }

            doc.save(`Reporte_Origen_${dateStr.replace(/\//g, '-')}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Hubo un error al generar el PDF. Por favor, revisa la consola del navegador.");
        }
    };

    if (loading) return <div className="p-8 text-center uppercase text-[10px] tracking-widest font-bold">Cargando datos financieros...</div>;

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-display font-light text-primary-950 uppercase tracking-tight">
                        Reportes <span className="font-bold">Financieros</span>
                    </h1>
                    <p className="text-[10px] text-primary-400 font-bold uppercase tracking-widest mt-1">
                        Control de ventas y comisiones totales
                    </p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={downloadPDF}
                        className="flex items-center gap-2 bg-primary-950 text-white px-4 py-2 rounded-sm text-[10px] uppercase font-bold tracking-widest hover:bg-primary-900 transition-all shadow-lg shadow-primary-950/20"
                    >
                        <Printer size={14} /> Descargar PDF
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-50 rounded-sm">
                            <DollarSign size={20} className="text-emerald-600" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            Ventas ({stats.closedCount})
                        </span>
                    </div>
                    <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary-400 mb-1">Volumen Total</h4>
                    <p className="text-2xl font-bold text-primary-950">${stats.totalRevenue.toLocaleString()}</p>
                </div>

                <div className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-50 rounded-sm">
                            <TrendingUp size={20} className="text-blue-600" />
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            Pipeline ({stats.interestedCount})
                        </span>
                    </div>
                    <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary-400 mb-1">Pipeline de Interés</h4>
                    <p className="text-2xl font-bold text-primary-950">${stats.expectedRevenue.toLocaleString()}</p>
                </div>

                <div className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-violet-50 rounded-sm">
                            <BarChart3 size={20} className="text-violet-600" />
                        </div>
                        <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            Ganancia Neta
                        </span>
                    </div>
                    <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary-400 mb-1">Comisiones Totales</h4>
                    <p className="text-2xl font-bold text-primary-950">${stats.totalCommissions.toLocaleString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Agent Performance Chart */}
                <div className="bg-white p-8 rounded-sm border border-gray-100 shadow-sm">
                    <h3 className="text-xs uppercase font-bold tracking-[0.2em] text-primary-950 mb-8 border-b border-gray-50 pb-4">
                        Comisiones por Agente
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.agentPerformance} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    tick={{fontSize: 10, fontWeight: 700, fill: '#1a1a1a'}} 
                                    width={100}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '0px', border: '1px solid #f0f0f0', fontSize: '10px', fontWeight: 'bold' }}
                                    formatter={(value) => [`$${value.toLocaleString()}`, 'Comisión']}
                                />
                                <Bar dataKey="value" fill="#1a1a1a" radius={[0, 2, 2, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* History list */}
                <div className="bg-white p-8 rounded-sm border border-gray-100 shadow-sm">
                    <h3 className="text-xs uppercase font-bold tracking-[0.2em] text-primary-950 mb-8 border-b border-gray-50 pb-4">
                        Resumen de Cierres Recientes
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-50">
                                    <th className="pb-3 text-[10px] uppercase font-bold tracking-widest text-primary-400">Cliente</th>
                                    <th className="pb-3 text-[10px] uppercase font-bold tracking-widest text-primary-400">Agente</th>
                                    <th className="pb-3 text-[10px] uppercase font-bold tracking-widest text-primary-400 text-right">Comisión</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {stats.rawLeads.filter(l => l.status === 'closed').slice(0, 5).map((l, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 text-xs font-bold text-primary-950">{l.full_name}</td>
                                        <td className="py-4 text-[10px] text-primary-400 font-bold uppercase tracking-tight">{l.agent?.full_name || "N/A"}</td>
                                        <td className="py-4 text-right text-xs font-bold text-emerald-600">
                                            ${((Number(l.deal_value) || 0) * ((Number(l.commission_percentage) || 0) / 100)).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {stats.rawLeads.filter(l => l.status === 'closed').length === 0 && (
                            <p className="text-[10px] text-primary-300 uppercase tracking-widest text-center py-20 font-bold italic">
                                Sin cierres registrados todavía.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminFinance;
