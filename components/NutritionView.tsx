
import React, { useState } from 'react';
import { 
  Apple, 
  Calendar, 
  TrendingDown, 
  Scale, 
  Droplets, 
  Activity, 
  Plus, 
  ChevronRight, 
  History, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ClipboardList,
  Edit3,
  Save,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Member, BodyMetrics, NutritionAppointment, User, UserRole } from '../types';
import { fetchFullNutritionData, createMetrics, fetchAppointments, createAppointment } from '../services/apiService';

interface NutritionViewProps {
  members: Member[];
  currentUser: User;
}

const NutritionView: React.FC<NutritionViewProps> = ({ members, currentUser }) => {
  const isMember = currentUser.role === UserRole.MIEMBRO;
  const [appointments, setAppointments] = useState<NutritionAppointment[]>([]);
  const [metrics, setMetrics] = useState<BodyMetrics[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(isMember ? currentUser.id : (members[0]?.id || ''));
  const [isAddingMetrics, setIsAddingMetrics] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverRecommendation, setServerRecommendation] = useState("Cargando recomendación...");

  // Forms State
  const [newMetrics, setNewMetrics] = useState({
    peso: '',
    masaMuscular: '',
    grasaCorporal: '',
    agua: '',
    imc: ''
  });

  const [newAppointment, setNewAppointment] = useState({
    fecha: '',
    hora: ''
  });

  React.useEffect(() => {
    if (selectedMemberId) {
      loadMemberData(selectedMemberId);
    }
  }, [selectedMemberId]);

  const loadMemberData = async (memberId: string) => {
    try {
      const [{ metrics: metricsData, recommendation }, appointmentsData] = await Promise.all([
        fetchFullNutritionData(memberId),
        fetchAppointments(memberId)
      ]);
      setMetrics(metricsData);
      setAppointments(appointmentsData);
      setServerRecommendation(recommendation);
    } catch (error) {
      console.error("Error loading nutrition data:", error);
    }
  };

  const handleAddMetrics = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const savedMetrics = await createMetrics({
        memberId: selectedMemberId,
        ...newMetrics
      });
      setMetrics([...metrics, savedMetrics]);
      setIsAddingMetrics(false);
      setNewMetrics({ peso: '', masaMuscular: '', grasaCorporal: '', agua: '', imc: '' });
    } catch (error) {
      alert("Error al guardar métricas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleId = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const savedApp = await createAppointment({
        memberId: selectedMemberId,
        ...newAppointment
      });
      setAppointments([...appointments, savedApp]);
      setIsScheduling(false);
      setNewAppointment({ fecha: '', hora: '' });
    } catch (error) {
      alert("Error al agendar cita");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedMember = members.find(m => m.id === selectedMemberId);
  const memberMetrics = metrics
    .filter(m => m.memberId === selectedMemberId)
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  
  const memberAppointments = appointments
    .filter(a => a.memberId === selectedMemberId)
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  const latestMetrics = memberMetrics[memberMetrics.length - 1];
  const previousMetrics = memberMetrics[memberMetrics.length - 2];

  const calculateDiff = (current: number, previous: number) => {
    if (!previous) return null;
    const diff = current - previous;
    return {
      value: Math.abs(diff).toFixed(1),
      isIncrease: diff > 0,
      color: diff > 0 ? 'text-red-500' : 'text-green-500'
    };
  };

  const weightDiff = latestMetrics && previousMetrics ? calculateDiff(latestMetrics.peso, previousMetrics.peso) : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Módulo de Nutrición</h1>
          <p className="text-gray-500 font-medium">Seguimiento antropométrico y agenda de citas nutricionales.</p>
        </div>
        {!isMember && (
          <div className="flex gap-3">
            <button 
              onClick={() => setIsScheduling(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm"
            >
              <Calendar size={20} className="text-orange-500" />
              Agendar Cita
            </button>
            <button 
              onClick={() => setIsAddingMetrics(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold transition-all shadow-lg active:scale-95"
            >
              <Plus size={20} />
              Registrar Medidas
            </button>
          </div>
        )}
      </div>

      {/* Member Selector - Hidden for Members */}
      {!isMember && (
        <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="flex-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Seleccionar Socio para Análisis</label>
            <select 
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none font-bold text-gray-900"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.nombre} (ID: {m.id})</option>
              ))}
            </select>
          </div>
          {selectedMember && (
            <div className="flex items-center gap-4 px-6 py-2 border-l border-gray-100">
              <img src={selectedMember.foto} className="w-12 h-12 rounded-xl object-cover" alt="" />
              <div>
                <p className="font-black text-gray-900">{selectedMember.nombre}</p>
                <p className="text-[10px] text-orange-500 font-black uppercase">{selectedMember.objetivo || 'Sin objetivo definido'}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Metrics Cards */}
        <div className="lg:col-span-8 space-y-8 overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-50 text-blue-500 rounded-xl"><Scale size={20} /></div>
                {weightDiff && (
                  <span className={`text-[10px] font-black flex items-center gap-0.5 ${weightDiff.color}`}>
                    {weightDiff.isIncrease ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
                    {weightDiff.value}kg
                  </span>
                )}
              </div>
              <p className="text-2xl font-black text-gray-900">{latestMetrics?.peso || '--'} <span className="text-xs text-gray-400">kg</span></p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Peso Actual</p>
            </div>

            <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-50 text-orange-500 rounded-xl"><Activity size={20} /></div>
              </div>
              <p className="text-2xl font-black text-gray-900">{latestMetrics?.masaMuscular || '--'} <span className="text-xs text-gray-400">%</span></p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Masa Muscular</p>
            </div>

            <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl"><Droplets size={20} /></div>
              </div>
              <p className="text-2xl font-black text-gray-900">{latestMetrics?.agua || '--'} <span className="text-xs text-gray-400">%</span></p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Nivel de Agua</p>
            </div>

            <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-50 text-purple-500 rounded-xl"><TrendingDown size={20} /></div>
              </div>
              <p className="text-2xl font-black text-gray-900">{latestMetrics?.imc || '--'}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">IMC</p>
            </div>
          </div>

          {/* Charts */}
          <div className="bg-white p-6 sm:p-8 rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                <History className="text-orange-500" /> Historial Evolutivo
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 text-[8px] sm:text-[10px] font-black uppercase text-blue-500">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div> Peso
                </span>
                <span className="flex items-center gap-1.5 text-[8px] sm:text-[10px] font-black uppercase text-orange-500">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div> Masa
                </span>
              </div>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={memberMetrics}>
                  <defs>
                    <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMasa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="fecha" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}}
                    tickFormatter={(str) => new Date(str).toLocaleDateString('es-ES', { month: 'short' })}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                    labelStyle={{fontWeight: 'black', marginBottom: '4px'}}
                  />
                  <Area type="monotone" dataKey="peso" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorPeso)" />
                  <Area type="monotone" dataKey="masaMuscular" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#colorMasa)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Appointments & Schedule */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-gray-900 p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                <Clock className="text-orange-500" /> Próximas Citas
              </h3>
              
              <div className="space-y-4">
                {memberAppointments.filter(a => a.status === 'Programada').length === 0 ? (
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
                    <p className="text-gray-400 text-xs font-bold">No hay citas programadas.</p>
                  </div>
                ) : (
                  memberAppointments.filter(a => a.status === 'Programada').map(app => (
                    <div key={app.id} className="p-5 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center text-orange-500">
                          <Calendar size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-black">{new Date(app.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{app.hora} HS</p>
                        </div>
                      </div>
                      <button className="p-2 text-gray-500 hover:text-white transition-colors">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-8 p-6 bg-orange-500 rounded-3xl shadow-lg shadow-orange-500/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 bg-white/20 rounded-xl"><ClipboardList size={20} /></div>
                  <p className="text-xs font-black uppercase tracking-widest">Recordatorio Mensual</p>
                </div>
                <p className="text-sm font-bold leading-relaxed">
                  Las citas se agendan automáticamente al renovar tu plan mensual. ¡No faltes!
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-3">
              <Apple className="text-emerald-500" /> Recomendación IA
            </h3>
            <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
              <p className="text-xs font-bold text-emerald-800 leading-relaxed italic">
                "{serverRecommendation}"
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] text-white font-black">AI</div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Gemini Nutrition Engine</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal: Registrar Medidas */}
      {isAddingMetrics && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
            <div className="bg-gray-900 p-8 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black">Registrar Evolución</h2>
                <p className="opacity-80 text-sm font-medium">Capta las métricas actuales del socio.</p>
              </div>
              <button onClick={() => setIsAddingMetrics(false)} className="p-2 hover:bg-white/20 rounded-full"><X size={24}/></button>
            </div>
            <form onSubmit={handleAddMetrics} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Peso (kg)</label>
                  <input type="number" step="0.1" required className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-orange-500 font-bold" 
                    value={newMetrics.peso} onChange={e => setNewMetrics({...newMetrics, peso: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Masa Muscular (%)</label>
                  <input type="number" step="0.1" required className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-orange-500 font-bold"
                    value={newMetrics.masaMuscular} onChange={e => setNewMetrics({...newMetrics, masaMuscular: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Grasa Corp (%)</label>
                  <input type="number" step="0.1" required className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-orange-500 font-bold"
                    value={newMetrics.grasaCorporal} onChange={e => setNewMetrics({...newMetrics, grasaCorporal: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Agua (%)</label>
                  <input type="number" step="0.1" required className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-orange-500 font-bold"
                    value={newMetrics.agua} onChange={e => setNewMetrics({...newMetrics, agua: e.target.value})} />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">IMC</label>
                  <input type="number" step="0.01" required className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-orange-500 font-bold"
                    value={newMetrics.imc} onChange={e => setNewMetrics({...newMetrics, imc: e.target.value})} />
                </div>
              </div>
              <button disabled={isLoading} className="w-full py-5 bg-orange-500 text-white rounded-3xl font-black text-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-3">
                {isLoading ? <Loader2 className="animate-spin"/> : <Save size={20}/>} Guardar Métricas
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Agendar Cita */}
      {isScheduling && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
            <div className="bg-emerald-600 p-8 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black">Agendar Cita</h2>
                <p className="opacity-80 text-sm font-medium">Nueva sesión de seguimiento nutricional.</p>
              </div>
              <button onClick={() => setIsScheduling(false)} className="p-2 hover:bg-white/20 rounded-full"><X size={24}/></button>
            </div>
            <form onSubmit={handleScheduleId} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha de la Cita</label>
                  <input type="date" required className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-orange-500 font-bold"
                    value={newAppointment.fecha} onChange={e => setNewAppointment({...newAppointment, fecha: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hora</label>
                  <input type="time" required className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-orange-500 font-bold"
                    value={newAppointment.hora} onChange={e => setNewAppointment({...newAppointment, hora: e.target.value})} />
                </div>
              </div>
              <button disabled={isLoading} className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black text-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-3">
                {isLoading ? <Loader2 className="animate-spin"/> : <Calendar size={20}/>} Confirmar Cita
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionView;
