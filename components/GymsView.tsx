
import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  ChevronRight, 
  Loader2,
  Building2,
  Activity,
  ArrowLeft
} from 'lucide-react';
import { Gym, UserRole, User } from '../types';

interface GymsViewProps {
  currentUser: User;
}

const GymsView: React.FC<GymsViewProps> = ({ currentUser }) => {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentGym, setCurrentGym] = useState<Partial<Gym> | null>(null);

  const isSuperAdmin = currentUser.role === UserRole.SUPER_ADMIN;

  useEffect(() => {
    fetchGyms();
  }, []);

  const fetchGyms = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gyms');
      const data = await res.json();
      setGyms(data);
    } catch (error) {
      console.error('Error fetching gyms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentGym?.nombre) return;
    
    setIsSaving(true);
    try {
      const method = currentGym.id ? 'PATCH' : 'POST';
      const url = currentGym.id ? `/api/gyms/${currentGym.id}` : '/api/gyms';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentGym)
      });

      if (res.ok) {
        setShowModal(false);
        fetchGyms();
      } else {
        const err = await res.json();
        alert(err.error || 'Error al guardar sucursal');
      }
    } catch (error) {
      alert('Error en el servidor');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta sucursal?')) return;
    
    try {
      const res = await fetch(`/api/gyms/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchGyms();
      } else {
        const err = await res.json();
        alert(err.error || 'Error al eliminar');
      }
    } catch (error) {
      alert('Error en el servidor');
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-10 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 uppercase italic">
            AurumFit <span className="text-emerald-600">Sucursales</span>
          </h1>
          <p className="text-gray-500 font-medium italic">Gestión de sedes y política de operación global.</p>
        </div>
        
        {isSuperAdmin && (
          <button 
            onClick={() => {
              setCurrentGym({ nombre: '', direccion: '', cancellationWindow: 2 });
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-gray-950 text-white px-8 py-4 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
          >
            <Plus size={20} />
            Nueva Sede
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {gyms.map(gym => (
          <div key={gym.id} className="group bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all overflow-hidden p-8 relative">
            <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
               <Building2 size={160} />
            </div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                  <Building2 size={24} />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                        setCurrentGym(gym);
                        setShowModal(true);
                    }}
                    className="p-3 bg-gray-50 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(gym.id)}
                    className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase italic tracking-tighter">{gym.nombre}</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-8">
                <MapPin size={14} className="text-emerald-500" /> {gym.direccion || 'Sin dirección registrada'}
              </p>

              <div className="mt-auto grid grid-cols-2 gap-4">
                 <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cancelación</p>
                    <p className="text-lg font-black text-gray-900">{gym.cancellationWindow} <span className="text-xs">HS</span></p>
                 </div>
                 <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex items-center justify-center">
                    <Activity size={24} className="text-emerald-500 animate-pulse" />
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CREAR/EDITAR */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
           <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-10">
                <h3 className="text-2xl font-black text-gray-900 mb-8 uppercase italic italic">
                   {currentGym?.id ? 'Editar Sucursal' : 'Configurar Nueva Sede'}
                </h3>
                
                <form onSubmit={handleSave} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Nombre de la Sede</label>
                      <input 
                        required
                        className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
                        value={currentGym?.nombre || ''}
                        onChange={e => setCurrentGym({...currentGym, nombre: e.target.value})}
                        placeholder="Ej: AurumFit Polanco"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Dirección Completa</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                          value={currentGym?.direccion || ''}
                          onChange={e => setCurrentGym({...currentGym, direccion: e.target.value})}
                          placeholder="Calle, No, Colonia, Ciudad"
                        />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Ventana de Cancelación (Horas)</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="number"
                          required
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-500 font-black text-lg"
                          value={currentGym?.cancellationWindow || 2}
                          onChange={e => setCurrentGym({...currentGym, cancellationWindow: parseInt(e.target.value)})}
                          min="0"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase italic">Tiempo mínimo antes de la clase para cancelar sin penalización.</p>
                   </div>

                   <div className="pt-6 flex gap-4">
                      <button 
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                      >
                         Cancelar
                      </button>
                      <button 
                        disabled={isSaving}
                        className="flex-3 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                      >
                        {isSaving && <Loader2 size={16} className="animate-spin" />}
                        {currentGym?.id ? 'Guardar Cambios' : 'Activar Sede'}
                      </button>
                   </div>
                </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default GymsView;
