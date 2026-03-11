
import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Plus, 
  Sparkles, 
  Clock, 
  Play, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  Target,
  User,
  X,
  Save,
  Loader2,
  Trash2
} from 'lucide-react';
import { Member, Routine, Exercise, User as UserType, UserRole } from '../types';
import { fetchRoutines, createRoutine, generateSmartRoutine } from '../services/apiService';

const EXERCISE_LIBRARY = [
  'Press de Banca', 'Sentadilla con Barra', 'Peso Muerto', 'Pull-ups (Dominadas)', 
  'Push-ups (Flexiones)', 'Plancha (Plank)', 'Burpees', 'Zancadas (Lunges)',
  'Curl de Bíceps', 'Press Francés', 'Remo con Mancuerna', 'Press Militar',
  'Aperturas con Mancuerna', 'Extensiones de Tríceps', 'Elevaciones Laterales',
  'Jalón al Pecho', 'Prensa de Piernas', 'Extensiones de Cuádriceps', 'Curl Femoral',
  'Crunch Abdominal', 'Leg Raise', 'Rueda Abdominal', 'Mountain Climbers'
];

const ROUTINE_TEMPLATES = {
  'Empuje (Push)': [
    { nombre: 'Press de Banca', series: 4, reps: '10', descanso: '90s' },
    { nombre: 'Press Militar', series: 3, reps: '12', descanso: '90s' },
    { nombre: 'Aperturas con Mancuerna', series: 3, reps: '15', descanso: '60s' },
    { nombre: 'Extensiones de Tríceps', series: 3, reps: '12', descanso: '60s' },
  ],
  'Tirón (Pull)': [
    { nombre: 'Peso Muerto', series: 3, reps: '8', descanso: '120s' },
    { nombre: 'Pull-ups (Dominadas)', series: 3, reps: 'Fallo', descanso: '90s' },
    { nombre: 'Remo con Mancuerna', series: 4, reps: '10', descanso: '90s' },
    { nombre: 'Curl de Bíceps', series: 3, reps: '12', descanso: '60s' },
  ],
  'Pierna (Legs)': [
    { nombre: 'Sentadilla con Barra', series: 4, reps: '8', descanso: '120s' },
    { nombre: 'Prensa de Piernas', series: 3, reps: '12', descanso: '90s' },
    { nombre: 'Curl Femoral', series: 3, reps: '15', descanso: '60s' },
    { nombre: 'Zancadas (Lunges)', series: 3, reps: '10 por pierna', descanso: '60s' },
  ],
  'Tabata (HIIT)': [
    { nombre: 'Burpees', series: 8, reps: '20 seg', descanso: '10 seg' },
    { nombre: 'Mountain Climbers', series: 8, reps: '20 seg', descanso: '10 seg' },
    { nombre: 'Sentadillas con Salto', series: 8, reps: '20 seg', descanso: '10 seg' },
    { nombre: 'Plancha (Plank)', series: 4, reps: '1 min', descanso: '30 seg' },
  ]
};

interface TrainingViewProps {
  members: Member[];
  currentUser: UserType;
}

const TrainingView: React.FC<TrainingViewProps> = ({ members, currentUser }) => {
  const isMember = currentUser.role === UserRole.MIEMBRO;
  const isInstructor = currentUser.role === UserRole.INSTRUCTOR || currentUser.role === UserRole.SUPER_ADMIN;
  
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(isMember ? currentUser.id : (members[0]?.id || ''));
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);

  // Form states
  const [newRoutine, setNewRoutine] = useState({
    nombre: '',
    descripcion: '',
    objetivo: 'Ganancia muscular',
    exercises: [] as Exercise[]
  });

  useEffect(() => {
    if (selectedMemberId) {
      loadRoutines(selectedMemberId);
    }
  }, [selectedMemberId]);

  const loadRoutines = async (memberId: string) => {
    setIsLoading(true);
    try {
      const data = await fetchRoutines(memberId);
      setRoutines(data);
      if (data.length > 0) setActiveRoutine(data[0]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    const member = members.find(m => m.id === selectedMemberId);
    if (!member) return;

    setIsLoading(true);
    try {
      const routine = await generateSmartRoutine(selectedMemberId, member.objetivo || 'Pérdida de peso');
      setRoutines([routine, ...routines]);
      setActiveRoutine(routine);
    } catch (error) {
      alert("Error generating routine");
    } finally {
      setIsLoading(false);
    }
  };

  const addExercise = () => {
    setNewRoutine({
      ...newRoutine,
      exercises: [...newRoutine.exercises, { nombre: '', series: 3, reps: '12', descanso: '60s' }]
    });
  };

  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const routine = await createRoutine({
        memberId: selectedMemberId,
        ...newRoutine,
        instructor: currentUser.nombre
      });
      setRoutines([routine, ...routines]);
      setActiveRoutine(routine);
      setIsCreating(false);
      setNewRoutine({ nombre: '', descripcion: '', objetivo: 'Ganancia muscular', exercises: [] });
    } catch (error) {
      alert("Error saving routine");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header & Member Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
            <Dumbbell className="text-orange-500" size={36} /> Entrenamiento Inteligente
          </h1>
          <p className="text-gray-500 font-bold mt-1 uppercase tracking-widest text-[10px]">Optimiza tu rendimiento con rutinas personalizadas</p>
        </div>

        {!isMember && (
          <div className="bg-white p-2 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-2">
            <User size={18} className="text-gray-400 ml-3" />
            <select 
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="bg-transparent border-none outline-none font-black text-xs uppercase tracking-widest p-3 pr-8 cursor-pointer"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Routine List & Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gray-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10 space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Acciones Pro</p>
                <h3 className="text-2xl font-black tracking-tight">Gestión de Rutinas</h3>
              </div>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleGenerateAI}
                  disabled={isLoading}
                  className="w-full py-4 bg-orange-500 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />} Generar Rutina IA
                </button>
                
                {isInstructor && (
                  <button 
                    onClick={() => setIsCreating(true)}
                    className="w-full py-4 bg-white/10 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/20 transition-all active:scale-95"
                  >
                    <Plus size={18} /> Subida Manual
                  </button>
                )}
              </div>
            </div>
            <Dumbbell size={120} className="absolute -bottom-10 -right-10 text-white/5 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 pb-4">Historial de Rutinas</h4>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {routines.length === 0 ? (
                <div className="text-center p-10 opacity-40">
                  <Dumbbell size={40} className="mx-auto mb-2" />
                  <p className="text-xs font-bold">No hay rutinas registradas</p>
                </div>
              ) : (
                routines.map(r => (
                  <div 
                    key={r.id}
                    onClick={() => setActiveRoutine(r)}
                    className={`p-5 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
                      activeRoutine?.id === r.id 
                        ? 'border-orange-500 bg-orange-50/30' 
                        : 'border-transparent bg-gray-50 hover:bg-white hover:border-gray-200'
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-black transition-colors ${activeRoutine?.id === r.id ? 'text-orange-600' : 'text-gray-900'}`}>
                        {r.nombre}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">
                        {new Date(r.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} • {r.instructor}
                      </p>
                    </div>
                    <ChevronRight size={18} className={`transition-transform ${activeRoutine?.id === r.id ? 'text-orange-500 translate-x-1' : 'text-gray-300'}`} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Routine Detail */}
        <div className="lg:col-span-8">
          {activeRoutine ? (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                
                <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {activeRoutine.objetivo || 'Entrenamiento General'}
                      </span>
                      <h2 className="text-4xl font-black tracking-tight text-gray-900 mt-3">{activeRoutine.nombre}</h2>
                      <p className="text-gray-500 font-medium text-sm max-w-lg italic">{activeRoutine.descripcion}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Entrenador</p>
                      <p className="text-lg font-black text-gray-900">{activeRoutine.instructor}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
                    <div className="p-6 bg-gray-50 rounded-[35px] border border-gray-100">
                      <TrendingUp size={24} className="text-orange-500 mb-2" />
                      <p className="text-[10px] font-black text-gray-400 uppercase">Dificultad</p>
                      <p className="text-lg font-black">Intermedio</p>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-[35px] border border-gray-100">
                      <Clock size={24} className="text-orange-500 mb-2" />
                      <p className="text-[10px] font-black text-gray-400 uppercase">Duración</p>
                      <p className="text-lg font-black">45-60 min</p>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-[35px] border border-gray-100">
                      <Target size={24} className="text-orange-500 mb-2" />
                      <p className="text-[10px] font-black text-gray-400 uppercase">Ejercicios</p>
                      <p className="text-lg font-black">{activeRoutine.exercises.length}</p>
                    </div>
                    <div className="p-6 bg-orange-500 rounded-[35px] text-white shadow-lg shadow-orange-500/20">
                      <Sparkles size={24} className="mb-2" />
                      <p className="text-[10px] font-black opacity-80 uppercase">Estado</p>
                      <p className="text-lg font-black">Actual</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[50px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                  <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                    <Play size={24} className="text-orange-500 fill-orange-500" /> Plan de Ejercicios
                  </h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sigue el orden establecido</p>
                </div>

                <div className="divide-y divide-gray-50">
                  {activeRoutine.exercises.map((ex, idx) => (
                    <div key={ex.id || idx} className="p-8 flex flex-col md:flex-row items-center gap-8 hover:bg-gray-50 transition-colors group">
                      <div className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-xl group-hover:scale-110 transition-transform">
                        {idx + 1}
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="text-xl font-black text-gray-900">{ex.nombre}</h4>
                        <p className="text-sm text-gray-400 font-medium">{ex.notas || 'Sin observaciones adicionales'}</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="text-center px-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
                          <p className="text-[9px] font-black text-gray-400 uppercase">Series</p>
                          <p className="text-xl font-black text-gray-900">{ex.series}</p>
                        </div>
                        <div className="text-center px-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
                          <p className="text-[9px] font-black text-gray-400 uppercase">Reps</p>
                          <p className="text-xl font-black text-gray-900">{ex.reps}</p>
                        </div>
                        <div className="text-center px-6 py-3 bg-orange-50 border border-orange-100 rounded-2xl shadow-sm">
                          <p className="text-[9px] font-black text-orange-400 uppercase">Descanso</p>
                          <p className="text-xl font-black text-orange-600">{ex.descanso}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-white rounded-[50px] border border-dashed border-gray-200 flex flex-col items-center justify-center p-20 text-center space-y-4">
              <div className="w-24 h-24 bg-gray-50 rounded-[35px] flex items-center justify-center text-gray-300">
                <Dumbbell size={48} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">Selecciona una Rutina</h3>
                <p className="text-gray-400 font-bold max-w-xs mx-auto">Elige una rutina del historial o genera una nueva con IA para comenzar.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Subida Manual */}
      {isCreating && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[50px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
            <div className="bg-gray-900 p-10 text-white flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black tracking-tight">Personalizar Entrenamiento</h2>
                <p className="opacity-60 text-sm font-bold uppercase tracking-widest mt-1">Crea un plan de ejercicios para el socio</p>
              </div>
              <button onClick={() => setIsCreating(false)} className="p-4 hover:bg-white/10 rounded-3xl transition-all"><X size={32}/></button>
            </div>
            
            <form onSubmit={handleManualSave} className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre de la Rutina</label>
                  <input 
                    type="text" required
                    className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-[20px] focus:border-orange-500 outline-none font-bold"
                    placeholder="Ej: Empuje (Pecho/Tríceps)"
                    value={newRoutine.nombre}
                    onChange={e => setNewRoutine({...newRoutine, nombre: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Objetivo Principal</label>
                  <select 
                    className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-[20px] focus:border-orange-500 outline-none font-bold cursor-pointer"
                    value={newRoutine.objetivo}
                    onChange={e => setNewRoutine({...newRoutine, objetivo: e.target.value})}
                  >
                    <option>Ganancia muscular</option>
                    <option>Pérdida de peso</option>
                    <option>Fuerza Máxima</option>
                    <option>Definición</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Descripción / Recomendaciones</label>
                  <textarea 
                    className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-[20px] focus:border-orange-500 outline-none font-bold min-h-[100px]"
                    placeholder="Detalles sobre el enfoque del entrenamiento..."
                    value={newRoutine.descripcion}
                    onChange={e => setNewRoutine({...newRoutine, descripcion: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Carga Rápida (Plantillas Inteligentes)</label>
                <div className="flex flex-wrap gap-3">
                   {Object.keys(ROUTINE_TEMPLATES).map(temp => (
                     <button 
                       key={temp}
                       type="button"
                       onClick={() => {
                         const t = temp as keyof typeof ROUTINE_TEMPLATES;
                         setNewRoutine({
                           ...newRoutine,
                           nombre: `Sesión de ${temp}`,
                           exercises: JSON.parse(JSON.stringify(ROUTINE_TEMPLATES[t]))
                         });
                       }}
                       className="px-6 py-3 bg-white border-2 border-orange-100 text-orange-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all"
                     >
                       {temp}
                     </button>
                   ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                  <h4 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Lista de Ejercicios</h4>
                  <button 
                    type="button" 
                    onClick={addExercise}
                    className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-gray-900/10"
                  >
                    <Plus size={16} /> Agregar Ejercicio
                  </button>
                </div>
                
                <div className="space-y-4">
                  {newRoutine.exercises.map((ex, idx) => (
                    <div key={idx} className="p-6 bg-gray-50 rounded-[30px] grid grid-cols-1 md:grid-cols-12 gap-4 items-end group">
                      <div className="md:col-span-5 space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Nombre del Ejercicio</label>
                        <div className="relative">
                          <input 
                            type="text" required
                            className="w-full p-3 bg-white border border-gray-100 rounded-xl font-bold text-sm"
                            placeholder="Ej: Press de Banca"
                            value={ex.nombre}
                            list="exercise-list"
                            onChange={e => {
                              const updated = [...newRoutine.exercises];
                              updated[idx].nombre = e.target.value;
                              setNewRoutine({...newRoutine, exercises: updated});
                            }}
                          />
                          <datalist id="exercise-list">
                            {EXERCISE_LIBRARY.map(lib => <option key={lib} value={lib} />)}
                          </datalist>
                        </div>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Series</label>
                        <input 
                          type="number" required
                          className="w-full p-3 bg-white border border-gray-100 rounded-xl font-bold text-sm"
                          value={ex.series}
                          onChange={e => {
                            const updated = [...newRoutine.exercises];
                            updated[idx].series = parseInt(e.target.value);
                            setNewRoutine({...newRoutine, exercises: updated});
                          }}
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Reps</label>
                        <input 
                          type="text" required
                          className="w-full p-3 bg-white border border-gray-100 rounded-xl font-bold text-sm"
                          placeholder="12"
                          value={ex.reps}
                          onChange={e => {
                            const updated = [...newRoutine.exercises];
                            updated[idx].reps = e.target.value;
                            setNewRoutine({...newRoutine, exercises: updated});
                          }}
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Descanso</label>
                        <input 
                          type="text"
                          className="w-full p-3 bg-white border border-gray-100 rounded-xl font-bold text-sm"
                          placeholder="60s"
                          value={ex.descanso}
                          onChange={e => {
                            const updated = [...newRoutine.exercises];
                            updated[idx].descanso = e.target.value;
                            setNewRoutine({...newRoutine, exercises: updated});
                          }}
                        />
                      </div>
                      <div className="md:col-span-1">
                        <button 
                          type="button"
                          onClick={() => {
                            const updated = newRoutine.exercises.filter((_, i) => i !== idx);
                            setNewRoutine({...newRoutine, exercises: updated});
                          }}
                          className="w-full p-3 bg-white text-red-400 hover:text-red-600 border border-gray-100 rounded-xl transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading || newRoutine.exercises.length === 0}
                className="w-full py-6 bg-orange-500 text-white rounded-[30px] font-black text-lg uppercase tracking-widest hover:bg-orange-600 shadow-2xl shadow-orange-500/30 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <><Save size={24}/> Publicar Rutina</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingView;
