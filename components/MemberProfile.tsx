
import React from 'react';
import { 
  User, 
  QrCode, 
  ShieldCheck, 
  Calendar, 
  Zap, 
  Award, 
  CreditCard, 
  MapPin, 
  Phone, 
  Mail,
  ChevronRight,
  Info,
  Download,
  Activity,
  Heart
} from 'lucide-react';
import QRCode from 'qrcode';
import { Member, User as UserType } from '../types';
import { fetchFullProfile, updateMemberSettings } from '../services/apiService';

interface MemberProfileProps {
  currentUser: UserType;
  members: Member[];
}

const MemberProfile: React.FC<MemberProfileProps> = ({ currentUser }) => {
  const [profile, setProfile] = React.useState<any>(null);
  const [qrUrl, setQrUrl] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadProfile();
  }, [currentUser.id]);

  const loadProfile = async () => {
    try {
      const data = await fetchFullProfile(currentUser.id);
      setProfile(data);
      if (data.id) {
        const url = await QRCode.toDataURL(data.id, {
          width: 400,
          margin: 2,
          color: { dark: '#111827', light: '#ffffff' },
        });
        setQrUrl(url);
      }
    } catch (error) {
       console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWearable = async (type: 'apple' | 'google') => {
    if (!profile) return;
    try {
      const updates = {
        conectadoApple: type === 'apple' ? !profile.conectadoApple : profile.conectadoApple,
        conectadoGoogle: type === 'google' ? !profile.conectadoGoogle : profile.conectadoGoogle,
      };
      await updateMemberSettings(profile.id, updates);
      setProfile({ ...profile, ...updates });
    } catch (error) {
      alert("Error al conectar wearable");
    }
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse">Sincronizando perfil...</div>;
  if (!profile) return <div className="p-20 text-center font-bold text-gray-400">No se pudo cargar el perfil.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Profile */}
      <div className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="relative">
            <img 
              src={profile.foto} 
              className="w-48 h-48 rounded-[60px] object-cover border-8 border-gray-50 shadow-2xl" 
              alt={profile.nombre} 
            />
            <div className="absolute -bottom-4 -right-4 bg-green-500 text-white p-4 rounded-3xl shadow-xl border-4 border-white">
              <ShieldCheck size={28} />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter">{profile.nombre}</h1>
              <p className="text-orange-500 font-black uppercase tracking-widest text-sm mt-1">Socio Elite • ID: {profile.id}</p>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="px-4 py-2 bg-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Calendar size={14} /> Miembro desde {new Date(profile.fechaRegistro).toLocaleDateString()}
              </span>
              <span className="px-4 py-2 bg-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                <Zap size={14} className="fill-emerald-600" /> Racha: {profile.rachaDias} Días
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-3 text-gray-500">
                <Mail size={18} className="text-gray-400" />
                <span className="text-sm font-bold">{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500">
                <Phone size={18} className="text-gray-400" />
                <span className="text-sm font-bold">{profile.telefono}</span>
              </div>
            </div>
          </div>

          {/* QR Access Card */}
          <div className="bg-gray-900 p-8 rounded-[40px] text-white shadow-2xl flex flex-col items-center space-y-4 group hover:scale-105 transition-transform duration-500">
            <div className="bg-white p-2 rounded-3xl shadow-inner overflow-hidden flex items-center justify-center">
              {qrUrl ? (
                <img src={qrUrl} alt="Acceso QR" className="w-[120px] h-[120px] object-contain" />
              ) : (
                <div className="w-[120px] h-[120px] flex items-center justify-center">
                  <QrCode size={40} className="text-gray-200 animate-pulse" />
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pase Digital</p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <p className="text-xs font-bold text-orange-500">Escanea para entrar</p>
                {qrUrl && (
                  <a 
                    href={qrUrl} 
                    download={`QR-GymMaster-${profile.id}.png`}
                    className="p-1 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors"
                    title="Descargar QR"
                  >
                    <Download size={14} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Membership Status */}
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <CreditCard className="text-orange-500" /> Estado de Membresía
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-gray-50 rounded-[35px] border border-gray-100 relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Plan Actual</p>
                  <h4 className="text-2xl font-black text-gray-900">Plan Premium</h4>
                  <p className="text-sm text-gray-500 font-medium mt-1">Acceso total + Nutrición</p>
                  <div className="mt-6 flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest">
                    <ShieldCheck size={16} /> Membresía Activa
                  </div>
                </div>
                <Award size={100} className="absolute -bottom-6 -right-6 text-gray-100 group-hover:text-orange-100 transition-colors duration-500" />
              </div>

              <div className="p-8 bg-gray-50 rounded-[35px] border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Próximo Vencimiento</p>
                <h4 className="text-2xl font-black text-gray-900">{profile.fechaVencimiento.split('-').reverse().join('/')}</h4>
                <p className="text-sm text-gray-500 font-medium mt-1">Faltan 14 días para renovar</p>
                <button className="mt-6 w-full py-3 bg-white border border-gray-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all">
                  Renovar Ahora
                </button>
              </div>
            </div>
          </div>

          {/* Achievements / Gamification */}
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <Award className="text-orange-500" /> Mis Logros
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Madrugador', icon: Zap, color: 'bg-yellow-100 text-yellow-600' },
                { label: 'Constante', icon: ShieldCheck, color: 'bg-blue-100 text-blue-600' },
                { label: 'Fuerza', icon: Award, color: 'bg-purple-100 text-purple-600' },
                { label: 'Hidratado', icon: Info, color: 'bg-emerald-100 text-emerald-600' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center p-6 bg-gray-50 rounded-[30px] border border-gray-100 group hover:bg-white hover:shadow-xl transition-all">
                  <div className={`p-4 rounded-2xl mb-3 ${item.color} group-hover:scale-110 transition-transform`}>
                    <item.icon size={24} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Wearables Connection Mockup */}
          <div className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
             <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                <div className="space-y-4 text-center md:text-left">
                   <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center justify-center md:justify-start gap-3">
                      <Heart className="text-red-500 fill-red-500" /> Salud & Wearables
                   </h3>
                   <p className="text-sm font-medium text-gray-400 max-w-sm">
                      Sincroniza tus pasos, frecuencia cardíaca y sueño para un seguimiento integral 360°.
                   </p>
                </div>
                <div className="flex gap-4">
                   <button 
                    onClick={() => toggleWearable('apple')}
                    className={`px-8 py-5 rounded-[30px] font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl ${
                      profile.conectadoApple ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-black text-white'
                    }`}
                   >
                      <Activity size={20} className={profile.conectadoApple ? 'text-white' : 'text-blue-400'} /> 
                      {profile.conectadoApple ? 'Conectado' : 'Apple Health'}
                   </button>
                   <button 
                    onClick={() => toggleWearable('google')}
                    className={`px-8 py-5 border-2 rounded-[30px] font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all ${
                      profile.conectadoGoogle ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white border-gray-100 hover:border-blue-500'
                    }`}
                   >
                      {profile.conectadoGoogle ? 'Conectado Go' : 'Google Fit'}
                   </button>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-orange-500 p-8 rounded-[40px] text-white shadow-xl shadow-orange-500/20">
            <h3 className="text-lg font-black mb-4">Tips del Día</h3>
            <p className="text-sm font-medium leading-relaxed opacity-90 italic">
              "Recuerda que la hidratación es clave para tu recuperación. Intenta beber al menos 500ml de agua durante tu entrenamiento de hoy."
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Award size={20} />
              </div>
              <p className="text-xs font-black uppercase tracking-widest">Coach GymMaster</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 mb-6">Ubicación de Sede</h3>
            <div className="aspect-video bg-gray-100 rounded-3xl mb-4 flex items-center justify-center overflow-hidden relative">
               <img src="https://picsum.photos/seed/map/400/200" className="w-full h-full object-cover opacity-50" alt="map" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <MapPin size={40} className="text-orange-500 animate-bounce" />
               </div>
            </div>
            <p className="text-xs font-bold text-gray-500 flex items-center gap-2">
              <MapPin size={14} /> Av. Principal #123, Ciudad Fit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;
