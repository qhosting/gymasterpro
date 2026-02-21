
import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, CreditCard, Clock, BrainCircuit } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { Member, MembershipStatus } from '../types';
import { getGymAnalyticsSummary } from '../services/geminiService';

const Dashboard: React.FC<{ members: Member[] }> = ({ members }) => {
  const [aiSummary, setAiSummary] = useState<string>("Analizando datos del gimnasio...");
  const [isAiLoading, setIsAiLoading] = useState(true);

  const stats = {
    total: members.length,
    activos: members.filter(m => m.status === MembershipStatus.ACTIVO).length,
    vencidos: members.filter(m => m.status === MembershipStatus.VENCIDO).length,
    ingresosEstimados: members.reduce((acc, m) => acc + (m.status === MembershipStatus.ACTIVO ? 350 : 0), 0)
  };

  useEffect(() => {
    const fetchAiAnalysis = async () => {
      setIsAiLoading(true);
      const summary = await getGymAnalyticsSummary(members);
      setAiSummary(summary);
      setIsAiLoading(false);
    };
    fetchAiAnalysis();
  }, [members]);

  const dataAsistencia = [
    { name: 'Lun', visitas: 45 },
    { name: 'Mar', visitas: 52 },
    { name: 'Mie', visitas: 38 },
    { name: 'Jue', visitas: 65 },
    { name: 'Vie', visitas: 48 },
    { name: 'Sab', visitas: 30 },
    { name: 'Dom', visitas: 15 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bienvenido al Panel Pro</h1>
          <p className="text-gray-500">Aquí tienes el resumen de tu gimnasio hoy.</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-400">Fecha actual</p>
          <p className="text-lg font-bold text-orange-500">{new Date().toLocaleDateString('es-MX', { dateStyle: 'long' })}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Total Miembros" value={stats.total.toString()} color="bg-blue-500" />
        <StatCard icon={TrendingUp} label="Miembros Activos" value={stats.activos.toString()} color="bg-green-500" />
        <StatCard icon={Clock} label="Vencidos/Pendientes" value={stats.vencidos.toString()} color="bg-red-500" />
        <StatCard icon={CreditCard} label="Ingresos Mensuales" value={`$${stats.ingresosEstimados}`} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-6">Asistencia Semanal</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dataAsistencia}>
                  <defs>
                    <linearGradient id="colorVisitas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                    cursor={{stroke: '#f97316', strokeWidth: 2}}
                  />
                  <Area type="monotone" dataKey="visitas" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitas)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI Column */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-xl text-white">
            <div className="flex items-center gap-2 mb-4">
              <BrainCircuit className="text-orange-500" size={24} />
              <h3 className="text-lg font-bold">Resumen de Inteligencia</h3>
            </div>
            {isAiLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-700 rounded w-4/6"></div>
              </div>
            ) : (
              <p className="text-sm text-gray-300 leading-relaxed italic">
                "{aiSummary}"
              </p>
            )}
            <button className="mt-6 w-full py-3 bg-orange-500 hover:bg-orange-600 rounded-xl font-bold transition-all transform active:scale-95">
              Generar Reporte Detallado
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Próximos Vencimientos</h3>
            <div className="space-y-4">
              {members.filter(m => m.status === MembershipStatus.ACTIVO).slice(0, 3).map(m => (
                <div key={m.id} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <img src={m.foto} className="w-8 h-8 rounded-full" />
                    <p className="text-sm font-medium group-hover:text-orange-500 transition-colors">{m.nombre}</p>
                  </div>
                  <span className="text-xs text-red-500 font-bold">{m.fechaVencimiento}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: any, label: string, value: string, color: string }> = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md hover:-translate-y-1">
    <div className={`${color} p-4 rounded-xl text-white`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

export default Dashboard;
