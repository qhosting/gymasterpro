
import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Target, 
  Zap, 
  Users, 
  Search, 
  Award,
  Crown,
  ChevronUp,
  Flame,
  Star,
  Loader2
} from 'lucide-react';
import { Member } from '../types';
import { fetchRankings } from '../services/apiService';

const CommunityView: React.FC = () => {
  const [rankings, setRankings] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRankings();
  }, []);

  const loadRankings = async () => {
    try {
      const data = await fetchRankings();
      setRankings(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRankings = rankings.filter(r => 
    r.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
            <Trophy className="text-yellow-500" size={36} /> Ranking de Comunidad
          </h1>
          <p className="text-gray-500 font-bold mt-1 uppercase tracking-widest text-[10px]">Los guerreros más constantes del mes</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Buscar por nombre..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-3xl shadow-sm outline-none focus:border-orange-500 font-bold transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="text-orange-500 animate-spin" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Top 3 Podium (Visual) */}
          <div className="xl:col-span-12 px-10 pb-16 pt-10 bg-gray-900 rounded-[60px] shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-end justify-center gap-6 md:gap-12">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-[100px]"></div>
            
            {/* 2nd Place */}
            {rankings[1] && (
              <div className="relative flex flex-col items-center group animate-in slide-in-from-bottom-10 duration-700 delay-100">
                <div className="relative mb-4">
                   <img src={rankings[1].foto} className="w-24 h-24 rounded-full border-4 border-gray-300 shadow-xl group-hover:scale-110 transition-transform" />
                   <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gray-300 rounded-2xl flex items-center justify-center text-gray-800 font-black shadow-lg">2</div>
                </div>
                <div className="text-center">
                  <p className="text-white font-black">{rankings[1].nombre}</p>
                  <p className="text-orange-400 text-sm font-black flex items-center justify-center gap-1"><Zap size={14}/> {rankings[1].rachaDias} días</p>
                </div>
                <div className="w-40 h-32 mt-4 bg-gray-800 rounded-t-3xl border-t border-gray-700 flex items-center justify-center">
                   <Award size={40} className="text-gray-400 opacity-20" />
                </div>
              </div>
            )}

            {/* 1st Place */}
            {rankings[0] && (
              <div className="relative flex flex-col items-center group z-10 animate-in slide-in-from-bottom-20 duration-1000">
                <Crown size={48} className="text-yellow-400 absolute -top-12 animate-bounce" />
                <div className="relative mb-4">
                   <img src={rankings[0].foto} className="w-32 h-32 rounded-full border-4 border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.3)] group-hover:scale-110 transition-transform" />
                   <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-gray-950 font-black shadow-lg">1</div>
                </div>
                <div className="text-center">
                  <p className="text-white text-xl font-black">{rankings[0].nombre}</p>
                  <p className="text-yellow-400 text-lg font-black flex items-center justify-center gap-2"><Flame size={20}/> {rankings[0].rachaDias} días en racha</p>
                </div>
                <div className="w-48 h-48 mt-4 bg-gray-800 rounded-t-[40px] border-t-2 border-yellow-400/50 flex flex-col items-center justify-center shadow-[0_-20px_50px_rgba(250,204,21,0.1)]">
                   <Trophy size={64} className="text-yellow-400" />
                   <p className="text-yellow-400/40 text-[10px] font-black uppercase tracking-[0.3em] mt-4">LEGENDARIO</p>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {rankings[2] && (
              <div className="relative flex flex-col items-center group animate-in slide-in-from-bottom-10 duration-700 delay-200">
                <div className="relative mb-4">
                   <img src={rankings[2].foto} className="w-24 h-24 rounded-full border-4 border-amber-700/50 shadow-xl group-hover:scale-110 transition-transform" />
                   <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-700 rounded-2xl flex items-center justify-center text-white font-black shadow-lg">3</div>
                </div>
                <div className="text-center">
                  <p className="text-white font-black">{rankings[2].nombre}</p>
                  <p className="text-orange-400 text-sm font-black flex items-center justify-center gap-1"><Zap size={14}/> {rankings[2].rachaDias} días</p>
                </div>
                <div className="w-40 h-24 mt-4 bg-gray-800 rounded-t-3xl border-t border-gray-700 flex items-center justify-center">
                   <Star size={32} className="text-amber-700 opacity-20" />
                </div>
              </div>
            )}
          </div>

          {/* Main Table Rankings */}
          <div className="xl:col-span-8 bg-white rounded-[50px] border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-3"><Users size={24} className="text-orange-500"/> Clasificación General</h3>
                <span className="px-4 py-1.5 bg-gray-100 rounded-full text-[10px] font-black uppercase text-gray-500">Actualizado cada 5 min</span>
             </div>

             <div className="divide-y divide-gray-50">
                {filteredRankings.slice(3).map((item, idx) => (
                  <div key={item.id} className="p-6 flex items-center gap-6 hover:bg-gray-50 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center font-black text-sm group-hover:bg-gray-900 group-hover:text-white transition-all">
                      {idx + 4}
                    </div>
                    <div className="relative">
                      <img src={item.foto} className="w-14 h-14 rounded-2xl object-cover shadow-sm group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-gray-900">{item.nombre}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.objetivo || 'Fitness'}</p>
                    </div>
                    <div className="flex items-center gap-8">
                       <div className="text-right">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Racha</p>
                          <div className="flex items-center gap-2">
                             <span className="text-lg font-black text-orange-500">{item.rachaDias}</span>
                             <Flame size={18} className="text-orange-500" />
                          </div>
                       </div>
                       <ChevronUp size={20} className="text-green-500" />
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Side: My Progress / Incentives */}
          <div className="xl:col-span-4 space-y-8">
             <div className="bg-orange-500 p-8 rounded-[40px] text-white shadow-xl shadow-orange-500/20">
                <h3 className="text-xl font-black mb-6">Tu Desafío</h3>
                <div className="space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><Zap size={24}/></div>
                      <div>
                         <p className="text-xs font-black uppercase opacity-70">Racha Actual</p>
                         <p className="text-2xl font-black">12 Días 🔥</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><Target size={24}/></div>
                      <div>
                         <p className="text-xs font-black uppercase opacity-70">Próximo Hito</p>
                         <p className="text-2xl font-black">15 Días</p>
                      </div>
                   </div>
                   <div className="pt-4 border-t border-white/10">
                      <p className="text-sm font-bold opacity-80 italic">"Estás a solo 3 días de subir al nivel Platino. ¡No te rindas ahora!"</p>
                   </div>
                </div>
             </div>

             <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                <h3 className="text-lg font-black text-gray-900 mb-6">Incentivos</h3>
                <div className="space-y-4">
                   {[
                     { label: 'Racha 30 días', reward: 'Suplemento Gratis', icon: Star, color: 'text-yellow-500' },
                     { label: 'Top 3 del mes', reward: '1 Mes Gratis', icon: Trophy, color: 'text-orange-500' },
                     { label: 'Racha 7 días', reward: 'Bebida Energética', icon: Zap, color: 'text-blue-500' },
                   ].map((item, i) => (
                     <div key={i} className="p-4 bg-gray-50 rounded-3xl flex items-center gap-4 border border-transparent hover:border-gray-200 transition-all">
                        <div className={`p-3 rounded-xl bg-white shadow-sm ${item.color}`}><item.icon size={20} /></div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{item.label}</p>
                           <p className="text-sm font-bold text-gray-900">{item.reward}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityView;
