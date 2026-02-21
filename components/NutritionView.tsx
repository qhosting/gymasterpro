
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
  User, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ClipboardList
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
import { Member, BodyMetrics, NutritionAppointment } from '../types';
import { MOCK_METRICS, MOCK_APPOINTMENTS } from '../constants';

interface NutritionViewProps {
  members: Member[];
}

const NutritionView: React.FC<NutritionViewProps> = ({ members }) => {
  const [appointments, setAppointments] = useState<NutritionAppointment[]>(MOCK_APPOINTMENTS);
  const [metrics, setMetrics] = useState<BodyMetrics[]>(MOCK_METRICS);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [isAddingMetrics, setIsAddingMetrics] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

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
      </div>

      {/* Member Selector */}
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Metrics Cards */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                <History className="text-orange-500" /> Historial Evolutivo
              </h3>
              <div className="flex gap-2">
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-blue-500">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div> Peso
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-orange-500">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div> Masa Muscular
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
                "Basado en tu racha de asistencia y tu ligero aumento en masa muscular, te recomendamos aumentar tu ingesta de proteína en 15g diarios y mantener el consumo de agua por encima del 60%."
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] text-white font-black">AI</div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Gemini Nutrition Engine</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionView;
