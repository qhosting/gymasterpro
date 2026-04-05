
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, CreditCard, Clock, BrainCircuit, 
  Calendar, Apple, ChevronRight, Activity, Zap, 
  Target, Award, Dumbbell, ArrowUpRight, ArrowDownRight,
  Eye, Package, UserCheck, ShieldCheck, Heart, MapPin, Cake
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
  const [coachDiary, setCoachDiary] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  
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

    const fetchCoachData = async () => {
      if (isInstructor) {
        try {
          const res = await fetch('/api/instructor/diary', {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('gym-token')}` }
          });
          const data = await res.json();
          setCoachDiary(data);
        } catch (err) {
          console.error("Error fetching coach diary:", err);
        }
      }
      if (isMiembro) {
        try {
          const res = await fetch('/api/classes/my-bookings', {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('gym-token')}` }
          });
          const data = await res.json();
          setMyBookings(data);
        } catch (err) {
          console.error("Error fetching my bookings:", err);
        }
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
    fetchCoachData();
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
    rachaPromedio: members.length > 0 ? Math.floor(members.reduce((acc, m) => acc + (m.rachaDias || 0), 0) / members.length) : 0,
    sucursalesActivas: 2
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
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
           <p className="text-3xl font-black text-gray-900 italic tracking-tighter">{value}</p>
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
            <h1 className="text-3xl font-black tracking-tight text-gray-900 italic uppercase">Aurum<span className="text-emerald-600">Fit</span> <span className="text-gray-400 font-medium">Command Center</span></h1>
            <p className="text-gray-500 font-medium italic">Resumen ejecutivo del estado del negocio.</p>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl border shadow-sm flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-black uppercase tracking-widest">{new Date().toLocaleDateString('es-MX', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={MapPin} label="SEDES ACTIVAS" value={stats.sucursalesActivas.toString()} subValue="Multi-Branch" color="bg-emerald-600" />
          <StatCard icon={Users} label="SOCIOS EN SALA" value={stats.enSala.toString()} subValue={`de ${stats.activos} activos`} color="bg-gray-900" trend={12} />
          <StatCard icon={TrendingUp} label="INGRESOS MES" value={`$${stats.ingresosMes.toLocaleString()}`} color="bg-emerald-500" trend={8.5} />
          <StatCard icon={Award} label="RACHA GYM" value={stats.rachaPromedio.toString()} subValue="días prom." color="bg-amber-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Activity size={120} />
               </div>
               <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-10">Métrica de <span className="text-emerald-600 italic">Asistencia</span></h3>
               <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dataAsistencia}>
                      <defs>
                        <linearGradient id="colorAsistencia" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00695c" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#00695c" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#999'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#999'}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="checkins" stroke="#00695c" strokeWidth={5} fillOpacity={1} fill="url(#colorAsistencia)" />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
            
            <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
               <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8 italic">Socios en <span className="text-emerald-600">Sala</span></h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeAttendance.map(att => {
                    const m = members.find(mem => mem.id === att.memberId);
                    return (
                      <div key={att.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-3xl border border-gray-100">
                        <div className="flex items-center gap-4">
                           <img src={m?.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(m?.nombre || 'U')}&background=00695c&color=fff`} className="w-12 h-12 rounded-2xl object-cover" />
                           <div>
                              <p className="font-black text-gray-900 leading-none mb-1">{m?.nombre}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{att.gym?.nombre || 'Sede Central'}</p>
                           </div>
                        </div>
                        <button className="p-2 text-emerald-600 bg-white rounded-xl shadow-sm"><ChevronRight size={16}/></button>
                      </div>
                    )
                  })}
               </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-gray-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all">
                  <BrainCircuit size={100} />
               </div>
               <h3 className="text-xl font-black italic mb-6 uppercase tracking-tighter">Gym <span className="text-emerald-500 italic">Analysis AI</span></h3>
               <p className="text-sm font-medium leading-relaxed opacity-80 italic italic">"{aiSummary}"</p>
               <button className="mt-8 flex items-center gap-2 text-emerald-500 font-black text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                  Ver Informe Detallado <ArrowUpRight size={16} />
               </button>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
               <h3 className="text-lg font-black italic mb-6 uppercase tracking-tighter">Últimos <span className="text-emerald-600">Pagos</span></h3>
               <div className="space-y-4">
                  {transactions.slice(0, 5).map(t => (
                    <div key={t.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-3xl">
                       <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${t.monto > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                             <CreditCard size={16} />
                          </div>
                          <div>
                             <p className="text-xs font-black text-gray-900 uppercase italic tracking-tighter leading-none mb-1">{t.concepto || 'Pago Cuota'}</p>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.fecha}</p>
                          </div>
                       </div>
                       <p className={`font-black italic ${t.monto > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {t.monto > 0 ? '+' : ''}${t.monto.toLocaleString()}
                       </p>
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
        <h1 className="text-3xl font-black italic uppercase">Aurum<span className="text-emerald-600">Fit</span> <span className="text-gray-400">Training Hub</span></h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <StatCard icon={Dumbbell} label="ENTRENANDO" value={stats.enSala.toString()} color="bg-emerald-600" />
           <StatCard icon={Zap} label="RACHA PROM" value={`${stats.rachaPromedio}d`} color="bg-amber-500" />
           <StatCard icon={Calendar} label="CLASES HOY" value={coachDiary.length.toString()} color="bg-gray-900" />
           <StatCard icon={Target} label="OBJETIVO" value="94%" color="bg-emerald-500" />
        </div>
        <div className="p-20 bg-white rounded-[40px] border border-dashed border-gray-200 text-center">
            <h3 className="text-xl font-black italic text-gray-400 uppercase">Panel de Instructor Premium</h3>
            <p className="text-gray-400 font-medium italic mt-2">Gestionando tus rutinas y clases con IA...</p>
        </div>
      </div>
    );
  }

  if (isNutri) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <h1 className="text-3xl font-black italic uppercase">Aurum<span className="text-emerald-600">Fit</span> <span className="text-gray-400">Nutrition Hub</span></h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <StatCard icon={Apple} label="CITAS PENDIENTES" value={appointments.filter(a => !a.completada).length.toString()} color="bg-emerald-600" />
           <StatCard icon={Activity} label="PACIENTES" value={members.length.toString()} color="bg-gray-900" />
        </div>
      </div>
    );
  }

  if (isMiembro && myMember) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
             <div className="relative">
                <img src={myMember.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(myMember.nombre)}&background=00695c&color=fff`} className="w-24 h-24 rounded-[32px] object-cover border-4 border-white shadow-2xl" />
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl shadow-lg"><Award size={20} /></div>
             </div>
             <div>
                <p className="text-emerald-600 font-black uppercase tracking-widest text-[10px] mb-1 leading-none italic">Socio Elite Club</p>
                <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase italic leading-none">Hola, {myMember.nombre.split(' ')[0]}</h1>
                <div className="flex gap-4 mt-2">
                   <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600 uppercase tracking-widest"><Zap size={14} className="fill-emerald-500"/> {myMember.rachaDias || 0} Días de Racha</span>
                </div>
             </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <button onClick={() => onNavigate('classes')} className="group bg-gray-900 text-left p-10 rounded-[40px] text-white relative overflow-hidden transition-all hover:scale-[1.02] shadow-2xl">
              <div className="absolute -right-10 -top-10 opacity-10 group-hover:opacity-20 transition-all"><Calendar size={180} /></div>
              <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/20"><Calendar size={32} /></div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2 italic">Reservar Clase</h3>
              <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">Explorar Horarios <ChevronRight size={16} /></p>
           </button>
           <button onClick={() => onNavigate('training')} className="group bg-emerald-600 text-left p-10 rounded-[40px] text-white relative overflow-hidden transition-all hover:scale-[1.02] shadow-2xl shadow-emerald-600/20">
              <div className="absolute -right-10 -top-10 opacity-10 group-hover:opacity-20 transition-all"><Dumbbell size={180} /></div>
              <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mb-8 backdrop-blur-md shadow-lg border border-white/10"><Zap size={32} /></div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2 italic">Mi Rutina</h3>
              <p className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">Continuar Entrenando <ChevronRight size={16} /></p>
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 p-10 text-center">
      <div className="p-20 bg-white rounded-[50px] shadow-sm border border-gray-100 max-w-lg w-full">
        <Package size={80} className="mx-auto text-gray-100 mb-8" />
        <h1 className="text-3xl font-black tracking-tighter uppercase italic italic">Configurando <span className="text-emerald-600 italic">Dashboard</span></h1>
        <p className="text-gray-400 font-medium italic mt-2">Personalizando tu entorno de alto rendimiento...</p>
      </div>
    </div>
  );
};

export default Dashboard;
