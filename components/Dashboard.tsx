
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, CreditCard, Clock, BrainCircuit, 
  Calendar, Apple, ChevronRight, Activity, Zap, 
  Target, Award, Dumbbell, ArrowUpRight, ArrowDownRight,
  Eye, Package, UserCheck, ShieldCheck, Heart
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, AreaChart, Area
} from 'recharts';
import { Member, MembershipStatus, User, UserRole } from '../types';
import { getGymAnalyticsSummary } from '../services/geminiService';
import { fetchAppointments, fetchAttendanceStats, fetchTodayAttendance, fetchTransactions } from '../services/apiService';

const Dashboard: React.FC<{ members: Member[], currentUser: User, onNavigate: (tab: string) => void }> = ({ members, currentUser, onNavigate }) => {
  const [aiSummary, setAiSummary] = useState<string>("Analizando datos del gimnasio...");
  const [isAiLoading, setIsAiLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [dataAsistencia, setDataAsistencia] = useState<any[]>([]);
  const [activeAttendance, setActiveAttendance] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  const role = currentUser.role;
  const isSuper = role === UserRole.SUPER_ADMIN;
  const isAdmin = role === UserRole.ADMIN || isSuper;
  const isNutri = role === UserRole.NUTRIOLOGO;
  const isInstructor = role === UserRole.INSTRUCTOR;
  const isMiembro = role === UserRole.MIEMBRO;

  const myMember = members.find(m => m.id === currentUser.id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const attStats = await fetchAttendanceStats();
        setDataAsistencia(attStats);
        
        const active = await fetchTodayAttendance();
        setActiveAttendance(active.filter((r: any) => !r.salida));
        
        const apps = await fetchAppointments();
        setAppointments(apps);

        if (isAdmin) {
          const trans = await fetchTransactions();
          setTransactions(trans);
        }
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      }
    };

    const fetchAiAnalysis = async () => {
      if (isAdmin || isInstructor || isNutri) {
        setIsAiLoading(true);
        const summary = await getGymAnalyticsSummary(members);
        setAiSummary(summary);
        setIsAiLoading(false);
      }
    };

    fetchData();
    fetchAiAnalysis();
  }, [members, role]);

  const stats = {
    total: members.length,
    activos: members.filter(m => m.status === MembershipStatus.ACTIVO).length,
    vencidos: members.filter(m => m.status === MembershipStatus.VENCIDO).length,
    ingresosHoy: transactions.filter(t => t.fecha === new Date().toISOString().split('T')[0]).reduce((acc, t) => acc + t.monto, 0),
    ingresosMes: transactions.reduce((acc, t) => acc + t.monto, 0),
    citasHoy: appointments.filter(a => a.fecha === new Date().toISOString().split('T')[0]).length,
    enSala: activeAttendance.length,
    rachaPromedio: members.length > 0 ? Math.floor(members.reduce((acc, m) => acc + (m.rachaDias || 0), 0) / members.length) : 0
  };

  const StatCard = ({ icon: Icon, label, value, subValue, color, trend }: any) => (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between transition-all hover:shadow-xl hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div className={`${color} p-4 rounded-2xl text-white shadow-lg`}>
          <Icon size={24} />
        </div>
        {trend && (
           <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
             {trend > 0 ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
             {Math.abs(trend)}%
           </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <div className="flex items-baseline gap-2">
           <p className="text-3xl font-black text-gray-900">{value}</p>
           {subValue && <span className="text-xs text-gray-400 font-bold italic">{subValue}</span>}
        </div>
      </div>
    </div>
  );

  if (isAdmin) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">GymMaster Pro <span className="text-orange-500">Command Center</span></h1>
            <p className="text-gray-500 font-medium italic">Resumen ejecutivo del estado de la sucursal.</p>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl border shadow-sm flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-black uppercase tracking-widest">{new Date().toLocaleDateString('es-MX', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Users} label="SOCIOS EN SALA" value={stats.enSala.toString()} subValue={`de ${stats.activos} activos`} color="bg-orange-500" trend={12} />
          <StatCard icon={TrendingUp} label="INGRESOS MES" value={`$${stats.ingresosMes.toLocaleString()}`} color="bg-green-500" trend={8.5} />
          <StatCard icon={Clock} label="POR VENCER (5D)" value={members.filter(m => {
             const diff = (new Date(m.fechaVencimiento).getTime() - Date.now()) / (1000 * 3600 * 24);
             return diff > 0 && diff <= 5;
          }).length.toString()} color="bg-red-500" />
          <StatCard icon={Award} label="RACHA GYM" value={stats.rachaPromedio.toString()} subValue="días prom." color="bg-purple-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Activity size={120} />
               </div>
               <div className="flex justify-between items-center mb-8 relative z-10">
                  <h3 className="text-xl font-black flex items-center gap-3">
                    <Activity size={24} className="text-orange-500" /> Fluidez de Asistencia
                  </h3>
               </div>
               <div className="h-72 w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dataAsistencia}>
                      <defs>
                        <linearGradient id="colorVisitas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} />
                      <Tooltip 
                        contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} 
                        cursor={{stroke: '#f97316', strokeWidth: 2}}
                      />
                      <Area type="monotone" dataKey="visitas" stroke="#f97316" strokeWidth={5} fillOpacity={1} fill="url(#colorVisitas)" />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
               <h3 className="text-xl font-black mb-8">Últimos Registros</h3>
               <div className="space-y-4">
                  {members.slice(0, 4).map(m => (
                    <div key={m.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-3xl transition-all">
                       <div className="flex items-center gap-4">
                          <img src={m.foto} className="w-12 h-12 rounded-2xl object-cover shadow-sm" />
                          <div>
                             <p className="font-black text-[13px]">{m.nombre}</p>
                             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{m.email}</p>
                          </div>
                       </div>
                       <ChevronRight className="text-gray-300" />
                    </div>
                  ))}
               </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-black p-8 rounded-[40px] shadow-2xl shadow-orange-500/10 text-white relative overflow-hidden">
               <div className="absolute -top-10 -right-10 opacity-20 transform rotate-12">
                  <BrainCircuit size={180} />
               </div>
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-orange-500 rounded-2xl"><BrainCircuit size={24} /></div>
                    <h3 className="text-xl font-black italic">Gemini Analytics</h3>
                  </div>
                  {isAiLoading ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-4 bg-white/10 rounded w-full"></div>
                      <div className="h-4 bg-white/10 rounded w-5/6"></div>
                      <div className="h-4 bg-white/10 rounded w-4/6"></div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-300 leading-relaxed font-medium">"{aiSummary}"</p>
                  )}
                  <button className="mt-8 w-full py-4 bg-white/10 hover:bg-white/20 border border-white/5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                    Descargar Insights
                  </button>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
               <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Próximos Vencimientos</h3>
               <div className="space-y-6">
                  {members.filter(m => m.status === MembershipStatus.ACTIVO).slice(0, 4).sort((a,b) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime()).map(m => (
                    <div key={m.id} className="flex items-center justify-between group">
                       <div className="flex items-center gap-4 text-left">
                          <img src={m.foto} className="w-10 h-10 rounded-xl" />
                          <div>
                             <p className="text-xs font-black">{m.nombre.split(' ')[0]}</p>
                             <p className="text-[10px] font-bold text-red-500">{m.fechaVencimiento.split('-').reverse().join('/')}</p>
                          </div>
                       </div>
                       <button className="p-2 bg-gray-50 text-gray-400 group-hover:text-orange-500 group-hover:bg-orange-50 rounded-xl transition-all">
                          <Package size={16} />
                       </button>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isInstructor) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Training <span className="text-blue-500">Hub</span></h1>
          <p className="text-gray-500 font-medium italic">Gestión de rutinas y actividad en sala.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Dumbbell} label="ENTRENANDO AHORA" value={stats.enSala.toString()} color="bg-blue-600" />
          <StatCard icon={Zap} label="RACHA PROMEDIO" value={`${stats.rachaPromedio} d`} color="bg-yellow-500" />
          <StatCard icon={UserCheck} label="NUEVOS (30D)" value={members.length.toString()} color="bg-orange-500" />
          <StatCard icon={ShieldCheck} label="METAS CUMPLIDAS" value="84%" color="bg-green-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
             <h3 className="text-xl font-black mb-8 flex items-center gap-3"><Users className="text-blue-500" /> Miembros en Sala</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeAttendance.length > 0 ? activeAttendance.map(att => {
                  const m = members.find(mem => mem.id === att.memberId);
                  return (
                    <div key={att.id} className="p-4 bg-gray-50 rounded-3xl flex items-center gap-4">
                       <img src={m?.foto} className="w-12 h-12 rounded-2xl object-cover" />
                       <div>
                          <p className="font-black text-sm">{m?.nombre}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{m?.objetivo || 'ACONDICIONAMIENTO'}</p>
                       </div>
                    </div>
                  );
                }) : <p className="col-span-2 py-10 text-center text-gray-400 italic">No hay socios en sala.</p>}
             </div>
          </div>
          <div className="bg-blue-600 p-8 rounded-[40px] text-white">
             <h3 className="text-xl font-black italic mb-4">Instructor Tips AI</h3>
             <p className="text-sm font-medium opacity-90 leading-relaxed italic">"{aiSummary.slice(0, 150)}..."</p>
          </div>
        </div>
      </div>
    );
  }

  if (isNutri) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Nutrition <span className="text-emerald-500">Center</span></h1>
          <p className="text-gray-500 font-medium italic">Agenda de citas y monitoreo de pacientes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Calendar} label="CITAS DE HOY" value={stats.citasHoy.toString()} color="bg-emerald-500" />
          <StatCard icon={Users} label="PACIENTES" value={stats.total.toString()} color="bg-blue-500" />
          <StatCard icon={Activity} label="EVALUACIONES" value={`${stats.total * 3}+`} color="bg-purple-500" />
          <StatCard icon={Apple} label="PLANES ACTIVOS" value={members.filter(m => m.objetivo).length.toString()} color="bg-orange-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
             <h3 className="text-xl font-black mb-8">Agenda de Hoy</h3>
             <div className="space-y-4">
                {appointments.filter(a => a.fecha === new Date().toISOString().split('T')[0]).length > 0 ? appointments.filter(a => a.fecha === new Date().toISOString().split('T')[0]).map(app => {
                  const m = members.find(mem => mem.id === app.memberId);
                  return (
                    <div key={app.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-3xl transition-all">
                       <div className="flex items-center gap-4">
                          <img src={m?.foto} className="w-14 h-14 rounded-2xl object-cover" />
                          <div>
                             <p className="font-black text-gray-900 text-lg uppercase tracking-tight">{m?.nombre}</p>
                             <span className="text-[10px] font-black text-emerald-600 bg-white px-2 py-0.5 rounded-lg border border-emerald-100">{app.hora} HS</span>
                          </div>
                       </div>
                    </div>
                  );
                }) : <p className="py-10 text-center text-gray-400 italic">No hay citas hoy.</p>}
             </div>
          </div>
          <div className="bg-emerald-600 p-8 rounded-[40px] text-white">
             <h3 className="text-xl font-black mb-6">Patient Insights</h3>
             <p className="text-xs italic opacity-80 leading-relaxed italic">"{aiSummary.slice(0, 100)}..."</p>
          </div>
        </div>
      </div>
    );
  }

  if (isMiembro && myMember) {
    const vencimiento = new Date(myMember.fechaVencimiento);
    const diasRestantes = Math.max(0, Math.ceil((vencimiento.getTime() - Date.now()) / (1000 * 3600 * 24)));
    
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">
        <div className="flex items-center gap-6">
           <div className="relative">
              <img src={myMember.foto} className="w-24 h-24 rounded-[32px] object-cover border-4 border-white shadow-2xl ring-4 ring-orange-500/20" />
              <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white p-2 rounded-xl shadow-lg"><Award size={20} /></div>
           </div>
           <div>
              <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] mb-1">¡Qué gusto verte!</p>
              <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase">Hola, {myMember.nombre.split(' ')[0]}</h1>
              <div className="flex gap-4 mt-2">
                 <span className="flex items-center gap-1.5 text-xs font-black text-orange-500"><Zap size={14} className="fill-orange-500"/> {myMember.rachaDias || 0} Días de Racha</span>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <StatCard icon={Clock} label="MEMBRESÍA" value={`${diasRestantes} Días`} color="bg-orange-500" trend={5} />
           <StatCard icon={CreditCard} label="SALDO PENDIENTE" value={`$${myMember.deuda}`} color="bg-red-500" />
           <StatCard icon={Heart} label="SALUD" value="Normal" color="bg-pink-500" />
           <StatCard icon={Target} label="PROGRESO" value="68%" color="bg-emerald-500" trend={12} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <button onClick={() => onNavigate('training')} className="group text-left bg-gray-900 text-white p-8 rounded-[40px] relative overflow-hidden transition-all hover:scale-[1.02]">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><Dumbbell size={120} /></div>
                    <div className="relative z-10 text-left">
                       <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mb-6"><Zap size={28} /></div>
                       <h3 className="text-2xl font-black mb-2 uppercase italic tracking-tight">Entrenamiento</h3>
                       <p className="text-orange-500 text-xs font-black uppercase tracking-widest flex items-center gap-1">Entrenar Ahora <ChevronRight size={16} /></p>
                    </div>
                 </button>
                 <button onClick={() => onNavigate('nutrition')} className="group text-left bg-white border border-gray-100 p-8 rounded-[40px] relative overflow-hidden transition-all hover:scale-[1.02]">
                    <div className="absolute top-0 right-0 p-8 opacity-5"><Apple size={120} /></div>
                    <div className="relative z-10 text-left">
                       <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 text-white"><Apple size={28} /></div>
                       <h3 className="text-2xl font-black mb-2 uppercase italic tracking-tight text-gray-900">Nutrición</h3>
                       <p className="text-emerald-500 text-xs font-black uppercase tracking-widest flex items-center gap-1">Ver Mi Dieta <ChevronRight size={16} /></p>
                    </div>
                 </button>
              </div>
           </div>
           
           <div className="space-y-8">
              <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 p-8 rounded-[40px] text-white relative shadow-2xl">
                 <h3 className="text-sm font-black uppercase tracking-widest mb-4">Próxima Medalla</h3>
                 <p className="text-xl font-black italic uppercase">Guerrero de Cobre</p>
                 <div className="h-3 w-full bg-white/20 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-orange-400 w-[80%]"></div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-10 text-center animate-in fade-in duration-500">
      <div className="p-20 bg-white rounded-[50px] shadow-sm border border-gray-100">
        <Package size={80} className="mx-auto text-gray-200 mb-6" />
        <h1 className="text-2xl font-black">Bienvenido</h1>
      </div>
    </div>
  );
};

export default Dashboard;
