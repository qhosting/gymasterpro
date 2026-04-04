
import React from 'react';
import { 
  User, 
  QrCode, 
  ShieldCheck, 
  Calendar, 
  Zap, 
  Award, 
  CreditCard, 
  Phone, 
  Mail,
  ChevronRight,
  Info,
  Download,
  Heart,
  X,
  CreditCard as CardIcon,
  Loader2
} from 'lucide-react';
import QRCode from 'qrcode';
import { Member, User as UserType } from '../types';
import { fetchFullProfile, fetchPlans, processOpenpayPayment, fetchSystemSettings } from '../services/apiService';
import { Plan } from '../types';

interface MemberProfileProps {
  currentUser: UserType;
  members: Member[];
}

const MemberProfile: React.FC<MemberProfileProps> = ({ currentUser }) => {
  const [profile, setProfile] = React.useState<any>(null);
  const [qrUrl, setQrUrl] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [isRenewalModalOpen, setIsRenewalModalOpen] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<Plan | null>(null);
  const [cardData, setCardData] = React.useState({ holder: '', number: '', expiry: '', cvv: '' });

  React.useEffect(() => {
    loadProfile();
    loadPlans();
  }, [currentUser.id]);

  const loadPlans = async () => {
    try {
      const data = await fetchPlans();
      setPlans(data);
      if (data.length > 0) setSelectedPlan(data[0]);
    } catch (err) {
      console.error(err);
    }
  };

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

  const handleProcessRenewal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !profile) return;
    
    try {
      setIsProcessing(true);
      const settings = await fetchSystemSettings();
      
      const paymentPayload = {
        memberId: profile.id,
        amount: selectedPlan.costo,
        method: 'Openpay',
        tipo: 'Mensualidad',
        card: {
            holder_name: cardData.holder,
            card_number: cardData.number.replace(/\s/g, ''),
            expiration_month: cardData.expiry.split('/')[0],
            expiration_year: cardData.expiry.split('/')[1],
            cvv2: cardData.cvv
        },
        deviceSessionId: "xyz123", 
        description: `Renovación Plan ${selectedPlan.nombre} - ${profile.nombre}`
      };

      await processOpenpayPayment(paymentPayload);
      alert('¡Membresía renovada con éxito!');
      setIsRenewalModalOpen(false);
      loadProfile(); 
    } catch (error: any) {
      console.error(error);
      alert('Error al procesar el pago: ' + (error.message || 'Error desconocido'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse">Sincronizando perfil...</div>;
  if (!profile) return (
    <div className="p-20 text-center space-y-4">
      <div className="text-gray-400 font-bold">No se pudo cargar el perfil detallado.</div>
      <p className="text-sm text-gray-500 max-w-md mx-auto">
        Si estás usando el simulador, asegúrate de seleccionar un rol que tenga un registro de socio vinculado.
      </p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Profile */}
      <div className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="relative">
            <img 
              src={profile?.foto || 'https://via.placeholder.com/150'} 
              className="w-48 h-48 rounded-[60px] object-cover border-8 border-gray-50 shadow-2xl" 
              alt={profile?.nombre} 
            />
            <div className="absolute -bottom-4 -right-4 bg-green-500 text-white p-4 rounded-3xl shadow-xl border-4 border-white">
              <ShieldCheck size={28} />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">AurumFit <span className="text-orange-500">Member Card</span></h3>
              <p className="text-orange-500 font-black uppercase tracking-widest text-sm mt-1">Socio Elite • ID: {profile?.id || '---'}</p>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="px-4 py-2 bg-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Calendar size={14} /> Miembro desde {profile?.fechaRegistro ? new Date(profile.fechaRegistro).toLocaleDateString() : '--/--/----'}
              </span>
              <span className="px-4 py-2 bg-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                <Zap size={14} className="fill-emerald-600" /> Racha: {profile?.rachaDias || 0} Días
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-3 text-gray-500">
                <Mail size={18} className="text-gray-400" />
                <span className="text-sm font-bold">{profile?.email || 'Sin correo'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500">
                <Phone size={18} className="text-gray-400" />
                <span className="text-sm font-bold">{profile?.telefono || 'Sin teléfono'}</span>
              </div>
            </div>
          </div>

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
                    download={`QR-GymMaster-${profile?.id || 'temp'}.png`}
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
        <div className="lg:col-span-8 space-y-8">
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
                <h4 className="text-2xl font-black text-gray-900">
                  {profile?.fechaVencimiento ? profile.fechaVencimiento.split('-').reverse().join('/') : '--/--/----'}
                </h4>
                <p className="text-sm text-gray-500 font-medium mt-1">Faltan 14 días para renovar</p>
                <button 
                  onClick={() => setIsRenewalModalOpen(true)}
                  className="mt-6 w-full py-3 bg-white border border-gray-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all"
                >
                  Renovar Ahora
                </button>
              </div>
            </div>
          </div>

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
        </div>

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
        </div>
      </div>

      {isRenewalModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-4">
          <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" onClick={() => setIsRenewalModalOpen(false)}></div>
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300">
             <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-orange-500 rounded-xl text-white shadow-lg shadow-orange-500/20">
                      <CreditCard size={20} />
                   </div>
                   <h2 className="text-xl font-black text-gray-900">Renovación de Membresía</h2>
                </div>
                <button onClick={() => setIsRenewalModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
                   <X size={20} className="text-gray-400" />
                </button>
             </div>

             <form onSubmit={handleProcessRenewal} className="p-8 space-y-6">
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Selecciona tu Plan</label>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {plans.map(plan => (
                        <div 
                          key={plan.id}
                          onClick={() => setSelectedPlan(plan)}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                            selectedPlan?.id === plan.id ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-gray-200'
                          }`}
                        >
                           <p className="font-black text-sm">{plan.nombre}</p>
                           <p className="text-orange-500 font-bold text-xs">${plan.costo} MXN</p>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100">
                   <div className="flex items-center gap-2 mb-2">
                      <CardIcon size={16} className="text-orange-500" />
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pago con Tarjeta (Openpay)</span>
                   </div>
                   
                   <div className="grid grid-cols-1 gap-4">
                      <input 
                        type="text" 
                        placeholder="Nombre en la Tarjeta" 
                        required
                        className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm outline-none focus:border-orange-500 transition-all"
                        value={cardData.holder}
                        onChange={(e) => setCardData({...cardData, holder: e.target.value})}
                      />
                      <input 
                        type="text" 
                        placeholder="0000 0000 0000 0000" 
                        required
                        maxLength={19}
                        className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm outline-none focus:border-orange-500 transition-all font-mono"
                        value={cardData.number}
                        onChange={(e) => setCardData({...cardData, number: e.target.value})}
                      />
                      <div className="grid grid-cols-2 gap-4">
                         <input 
                           type="text" 
                           placeholder="MM/YY" 
                           required
                           maxLength={5}
                           className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm outline-none focus:border-orange-500 transition-all"
                           value={cardData.expiry}
                           onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                         />
                         <input 
                           type="password" 
                           placeholder="CVV" 
                           required
                           maxLength={4}
                           className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm outline-none focus:border-orange-500 transition-all"
                           value={cardData.cvv}
                           onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                         />
                      </div>
                   </div>
                </div>

                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 bg-orange-500 text-white rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>Proceder con el Pago <ChevronRight size={20} /></>
                  )}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberProfile;
