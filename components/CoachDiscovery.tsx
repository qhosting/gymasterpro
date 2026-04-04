
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Star, 
  MapPin, 
  MessageCircle, 
  Calendar,
  Search,
  Filter,
  Loader2,
  Award,
  ChevronRight
} from 'lucide-react';
import { User, UserRole } from '../types';

interface CoachDiscoveryProps {
  currentUser: User;
}

const CoachDiscovery: React.FC<CoachDiscoveryProps> = ({ currentUser }) => {
  const [coaches, setCoaches] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/staff', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('gym-token')}` }
      });
      const data = await res.json();
      // Filtrar solo los instructores
      setCoaches(data.filter((u: any) => u.role === UserRole.INSTRUCTOR));
    } catch (error) {
      console.error('Error fetching coaches:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCoaches = coaches.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase italic">
            Descubre a tu <span className="text-emerald-600">Coach</span>
          </h1>
          <p className="text-gray-500 font-medium italic">Encuentra al profesional ideal para tus metas de alto rendimiento.</p>
        </div>
        
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Buscar por nombre o especialidad..."
            className="w-full pl-12 pr-4 py-4 bg-white rounded-[24px] border border-gray-100 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCoaches.map(coach => (
          <div key={coach.id} className="group bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all overflow-hidden flex flex-col p-8 relative">
            <div className="flex items-start gap-6 mb-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-gray-50 group-hover:border-emerald-100 transition-all shadow-xl">
                    <img 
                      src={coach.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(coach.nombre)}&background=00695c&color=fff&size=200`} 
                      alt={coach.nombre}
                      className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl shadow-lg">
                    <Award size={16} />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                   <h3 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter leading-tight">{coach.nombre}</h3>
                </div>
                <div className="flex items-center gap-1 mt-1">
                    {[1,2,3,4,5].map(s => <Star key={s} size={12} className="fill-emerald-500 text-emerald-500" />)}
                    <span className="text-[10px] font-black text-gray-400 ml-1">5.0 (42)</span>
                </div>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-2">Personal Trainer • Funcional</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
               <div className="flex items-center gap-3 text-gray-500 bg-gray-50 p-4 rounded-3xl">
                  <MapPin size={18} className="text-emerald-500" />
                  <span className="text-xs font-bold uppercase italic">Sucursal Polanco</span>
               </div>
               <div className="flex items-center gap-3 text-gray-500 bg-gray-50 p-4 rounded-3xl">
                  <Calendar size={18} className="text-emerald-500" />
                  <span className="text-xs font-bold uppercase italic">Lunes a Viernes • 07:00 - 15:00</span>
               </div>
            </div>

            <div className="mt-auto flex gap-3">
               <button className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]">
                  Ver Clase <ChevronRight size={16} />
               </button>
               <button className="p-4 bg-gray-50 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all">
                  <MessageCircle size={20} />
               </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCoaches.length === 0 && (
         <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
            <Users size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-xl font-black text-gray-900 uppercase italic">No encontramos coaches</h3>
            <p className="text-gray-400 font-medium">Prueba con otro término de búsqueda.</p>
         </div>
      )}
    </div>
  );
};

export default CoachDiscovery;
