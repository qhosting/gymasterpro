
import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  MoreVertical, 
  Users, 
  MapPin, 
  Calendar, 
  ChevronRight,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Edit3,
  CreditCard,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { Business } from '../types';

const BusinessManagement: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentBusiness, setCurrentBusiness] = useState<Partial<Business> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/businesses', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('gym-token')}` }
      });
      const data = await res.json();
      setBusinesses(data);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBusiness?.nombre) return;

    setIsSaving(true);
    try {
      const method = currentBusiness.id ? 'PATCH' : 'POST';
      const url = currentBusiness.id ? `/api/admin/businesses/${currentBusiness.id}` : '/api/admin/businesses';

      const res = await fetch(url, {
        method,
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('gym-token')}`
        },
        body: JSON.stringify(currentBusiness)
      });

      if (res.ok) {
        setShowModal(false);
        fetchBusinesses();
      } else {
        const err = await res.json();
        alert(err.error || 'Error al guardar');
      }
    } catch (error) {
      alert('Error en el servidor');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (business: Business) => {
      const newStatus = business.status === 'ACTIVO' ? 'SUSPENDIDO' : 'ACTIVO';
      if (!confirm(`¿Estás seguro de ${newStatus.toLowerCase()} este negocio?`)) return;

      try {
          const res = await fetch(`/api/admin/businesses/${business.id}`, {
              method: 'PATCH',
              headers: { 
                  'Content-Type': 'application/json', 
                  'Authorization': `Bearer ${localStorage.getItem('gym-token')}`
              },
              body: JSON.stringify({ status: newStatus })
          });
          if (res.ok) fetchBusinesses();
      } catch (error) {
          alert('Error al cambiar estatus');
      }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-10 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-black uppercase tracking-widest text-xs mb-1">
             <ShieldCheck size={14} /> Global Administration
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase italic">
            Gestión de <span className="text-emerald-600">Negocios</span>
          </h1>
          <p className="text-gray-500 font-medium italic">Control de tenants, facturación y estatus de plataforma.</p>
        </div>
        
        <button 
          onClick={() => {
            setCurrentBusiness({ nombre: '', status: 'ACTIVO' });
            setShowModal(true);
          }}
          className="flex items-center gap-3 bg-gray-950 text-white px-8 py-5 rounded-[32px] font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
        >
          <Plus size={20} />
          Nuevo Tenant
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900 p-6 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-5 -bottom-5 text-emerald-500 opacity-10 group-hover:opacity-20 transition-all rotate-12">
               <TrendingUp size={100} />
            </div>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Ingresos Estimados</p>
            <h3 className="text-3xl font-black italic tracking-tighter uppercase">$42,500 <span className="text-xs">MXN</span></h3>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm transition-all hover:shadow-xl">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tenants Activos</p>
            <h3 className="text-3xl font-black text-gray-900 italic tracking-tighter uppercase">{businesses.length} <span className="text-xs">EMPRESAS</span></h3>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm transition-all hover:shadow-xl">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Sucursales Red</p>
            <h3 className="text-3xl font-black text-gray-900 italic tracking-tighter uppercase">{businesses.reduce((acc, b) => acc + (b._count?.gyms || 0), 0)} <span className="text-xs">SEDES</span></h3>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm transition-all hover:shadow-xl">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Usuarios Totales</p>
            <h3 className="text-3xl font-black text-gray-900 italic tracking-tighter uppercase">{businesses.reduce((acc, b) => acc + (b._count?.users || 0), 0)} <span className="text-xs">PAX</span></h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {businesses.map(biz => (
          <div key={biz.id} className="bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all p-8 flex flex-col group relative overflow-hidden">
            <div className={`absolute top-0 right-0 p-6 ${biz.status === 'ACTIVO' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {biz.status === 'ACTIVO' ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
            </div>

            <div className="flex items-center gap-4 mb-8">
               <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                  <Building2 size={32} />
               </div>
               <div>
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic">{biz.nombre}</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">ID: {biz.id.slice(0, 8)}</p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Sucursales</p>
                    <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-emerald-500" />
                        <span className="text-lg font-black text-gray-900">{biz._count?.gyms || 0}</span>
                    </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Usuarios</p>
                    <div className="flex items-center gap-2">
                        <Users size={14} className="text-emerald-500" />
                        <span className="text-lg font-black text-gray-900">{biz._count?.users || 0}</span>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-6 flex gap-3">
                <button 
                  onClick={() => toggleStatus(biz)}
                  className={`flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                    biz.status === 'ACTIVO' ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  }`}
                >
                  {biz.status === 'ACTIVO' ? 'Suspender' : 'Activar'}
                </button>
                <button 
                  onClick={() => {
                      setCurrentBusiness(biz);
                      setShowModal(true);
                  }}
                  className="p-3 bg-gray-50 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all"
                >
                  <Edit3 size={18} />
                </button>
                <button className="p-3 bg-gray-50 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all">
                  <BarChart3 size={18} />
                </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
           <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-10">
                <h3 className="text-2xl font-black text-gray-900 mb-8 uppercase italic italic">
                   {currentBusiness?.id ? 'Editar Negocio' : 'Alta de Nuevo Tenant'}
                </h3>
                
                <form onSubmit={handleSave} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Nombre Comercial</label>
                      <input 
                        required
                        className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
                        value={currentBusiness?.nombre || ''}
                        onChange={e => setCurrentBusiness({...currentBusiness, nombre: e.target.value})}
                        placeholder="Ej: PowerGym S.A."
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Estatus Inicial</label>
                         <select 
                            className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                            value={currentBusiness?.status || 'ACTIVO'}
                            onChange={e => setCurrentBusiness({...currentBusiness, status: e.target.value as any})}
                         >
                            <option value="ACTIVO">ACTIVO</option>
                            <option value="SUSPENDIDO">SUSPENDIDO</option>
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Ciclo Cobro (Día)</label>
                         <input 
                            type="number"
                            className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                            defaultValue={1}
                            min={1} max={31}
                         />
                      </div>
                   </div>

                   <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-start gap-4">
                      <CreditCard className="text-emerald-600 mt-1" size={20} />
                      <div>
                         <p className="text-xs font-bold text-emerald-900">Información de Facturación</p>
                         <p className="text-[10px] text-emerald-600 font-medium leading-tight mt-1">Este negocio será facturado mensualmente basado en el número de sucursales activas.</p>
                      </div>
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
                        {currentBusiness?.id ? 'Guardar Cambios' : 'Crear Negocio'}
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

export default BusinessManagement;
