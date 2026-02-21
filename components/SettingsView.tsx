
import React, { useState, useEffect } from 'react';
import { 
  Settings, Shield, Smartphone, Globe, Clock, Users, 
  Save, Database, Palette, Lock, Bell, Mail, 
  MapPin, Camera, Trash2, Edit3, UserPlus, Key,
  Zap, Info, Cloud, Download, Apple, Layout
} from 'lucide-react';
import { User, UserRole } from '../types';

interface SettingsViewProps {
  currentUser: User;
}

const SettingsView: React.FC<SettingsViewProps> = ({ currentUser }) => {
  const [activeSection, setActiveSection] = useState<'general' | 'personal' | 'integraciones' | 'seguridad' | 'movil'>('general');
  const [gymName, setGymName] = useState('GymMaster Pro');
  const [isSaving, setIsSaving] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Mock staff data
  const [staff, setStaff] = useState([
    { id: 's1', nombre: 'Carlos Entrenador', email: 'carlos@gym.com', role: UserRole.INSTRUCTOR, status: 'Online' },
    { id: 's2', nombre: 'Ana Admin', email: 'ana@gym.com', role: UserRole.ADMIN, status: 'Offline' },
  ]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Configuración guardada exitosamente');
    }, 1500);
  };

  const menuItems = [
    { id: 'general', label: 'Gimnasio & Marca', icon: Globe },
    { id: 'personal', label: 'Personal & Roles', icon: Users },
    { id: 'integraciones', label: 'APIs & Conexiones', icon: Zap },
    { id: 'movil', label: 'Móvil & PWA', icon: Smartphone },
    { id: 'seguridad', label: 'Seguridad & Datos', icon: Lock },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Configuración del Sistema</h1>
          <p className="text-gray-500">Administra las preferencias globales y el control operativo.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50"
        >
          {isSaving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Save size={20} />}
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                activeSection === item.id 
                ? 'bg-white text-orange-600 shadow-md border-l-4 border-orange-500' 
                : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 bg-white rounded-[40px] border border-gray-100 shadow-sm p-10">
          
          {activeSection === 'general' && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
              <div className="flex items-center gap-6 pb-8 border-b border-gray-50">
                <div className="relative group cursor-pointer">
                  <div className="w-24 h-24 rounded-3xl bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 group-hover:border-orange-400 transition-colors overflow-hidden">
                    <Camera className="text-gray-400 group-hover:text-orange-500" size={32} />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-orange-500 p-2 rounded-xl text-white shadow-lg">
                    <Edit3 size={14} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Identidad de Marca</h3>
                  <p className="text-sm text-gray-400">Este logo aparecerá en tickets y mensajes de WhatsApp.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Nombre del Gimnasio</label>
                  <input 
                    className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-orange-500 transition-all font-bold"
                    value={gymName}
                    onChange={(e) => setGymName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Aforo Máximo</label>
                  <input 
                    type="number"
                    className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-orange-500 transition-all font-bold"
                    defaultValue={50}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Dirección Principal</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-orange-500 font-medium" defaultValue="Av. Fitness 123, Ciudad" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Horario de Atención</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-orange-500 font-medium" defaultValue="06:00 AM - 10:00 PM" />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-blue-50 rounded-3xl flex items-start gap-4">
                <div className="p-2 bg-blue-500 text-white rounded-xl"><Info size={20}/></div>
                <div>
                  <h4 className="font-bold text-blue-900">Configuración Regional</h4>
                  <p className="text-sm text-blue-700">El sistema está configurado actualmente en horario (GMT-6) y moneda (MXN).</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'personal' && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Gestión de Staff</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all">
                  <UserPlus size={16} /> Invitar Personal
                </button>
              </div>

              <div className="border border-gray-100 rounded-3xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <th className="px-6 py-4">Usuario</th>
                      <th className="px-6 py-4">Rol</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {staff.map(member => (
                      <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                              {member.nombre.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold">{member.nombre}</p>
                              <p className="text-[10px] text-gray-400">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold uppercase">{member.role}</span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${member.status === 'Online' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="text-xs font-medium">{member.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button className="p-2 text-gray-400 hover:text-orange-500 transition-colors"><Edit3 size={18}/></button>
                          <button className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'integraciones' && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 bg-gray-50 rounded-[40px] border border-gray-200 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="p-3 bg-green-100 text-green-600 rounded-2xl"><Smartphone size={24} /></div>
                    <span className="text-[10px] font-black uppercase text-green-600">Activo</span>
                  </div>
                  <h3 className="text-xl font-bold">WhatsApp WAHA</h3>
                  <p className="text-sm text-gray-500">Conectado para envíos automáticos y notificaciones de pago.</p>
                  <div className="pt-4 flex gap-2">
                    <button className="flex-1 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors">Probar Conexión</button>
                    <button className="p-3 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-orange-500"><Settings size={18}/></button>
                  </div>
                </div>

                <div className="p-8 bg-gray-50 rounded-[40px] border border-gray-200 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl"><Zap size={24} /></div>
                    <span className="text-[10px] font-black uppercase text-purple-600">Premium</span>
                  </div>
                  <h3 className="text-xl font-bold">Gemini AI Engine</h3>
                  <p className="text-sm text-gray-500">Motor de análisis predictivo y redacción de mensajes inteligentes.</p>
                  <div className="pt-4 flex gap-2">
                    <button className="flex-1 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors">Configurar IA</button>
                    <button className="p-3 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-orange-500"><Key size={18}/></button>
                  </div>
                </div>
              </div>

              <div className="bg-orange-500 p-8 rounded-[40px] text-white overflow-hidden relative">
                <div className="relative z-10 space-y-2">
                  <h3 className="text-xl font-black">¿Necesitas una API personalizada?</h3>
                  <p className="text-sm opacity-90 font-medium">Contacta con soporte para integraciones con relojes inteligentes o básculas Bio-impedancia.</p>
                  <button className="mt-4 px-6 py-3 bg-white text-orange-600 rounded-2xl font-black text-sm hover:scale-105 transition-transform">Contactar Soporte</button>
                </div>
                <Cloud size={150} className="absolute -bottom-10 -right-10 text-white/10" />
              </div>
            </div>
          )}

          {activeSection === 'movil' && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
              <div className="bg-gray-900 p-10 rounded-[40px] text-white relative overflow-hidden">
                <div className="relative z-10 space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 text-orange-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-500/30">
                    <Smartphone size={14} /> Experiencia Nativa
                  </div>
                  <h2 className="text-3xl font-black tracking-tight">Lleva tu gimnasio a todas partes</h2>
                  <p className="text-gray-400 max-w-lg font-medium">
                    GymMaster Pro está optimizado para funcionar como una aplicación nativa en Android y iOS. 
                    Instálala ahora para recibir notificaciones push y acceso rápido.
                  </p>
                  
                  <div className="flex flex-wrap gap-4 pt-4">
                    <button 
                      onClick={handleInstall}
                      disabled={!deferredPrompt}
                      className="px-8 py-4 bg-orange-500 text-white rounded-2xl font-black text-sm flex items-center gap-3 hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                    >
                      <Download size={20} />
                      {deferredPrompt ? 'Instalar App' : 'App ya Instalada'}
                    </button>
                    <button className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-sm hover:bg-white/10 transition-all">
                      Configurar Push
                    </button>
                  </div>
                </div>
                <Smartphone size={200} className="absolute -bottom-20 -right-10 text-white/5" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-gray-50 rounded-[40px] border border-gray-200 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><Apple size={24} /></div>
                    <h3 className="text-xl font-bold">iOS / Apple</h3>
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">Para instalar en iPhone o iPad:</p>
                    <ol className="text-xs text-gray-600 space-y-3 list-decimal pl-4 font-medium">
                      <li>Abre esta página en <span className="font-bold text-gray-900">Safari</span>.</li>
                      <li>Toca el botón <span className="font-bold text-gray-900">Compartir</span> (cuadrado con flecha).</li>
                      <li>Selecciona <span className="font-bold text-gray-900">"Añadir a pantalla de inicio"</span>.</li>
                    </ol>
                  </div>
                </div>

                <div className="p-8 bg-gray-50 rounded-[40px] border border-gray-200 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl"><Layout size={24} /></div>
                    <h3 className="text-xl font-bold">Android / Google</h3>
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">Para instalar en dispositivos Android:</p>
                    <ol className="text-xs text-gray-600 space-y-3 list-decimal pl-4 font-medium">
                      <li>Toca el botón <span className="font-bold text-gray-900">"Instalar App"</span> arriba.</li>
                      <li>O ve al menú de Chrome (3 puntos) y selecciona <span className="font-bold text-gray-900">"Instalar aplicación"</span>.</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-orange-50 rounded-[40px] border border-orange-100 flex items-start gap-4">
                <div className="p-2 bg-orange-500 text-white rounded-xl"><Zap size={20}/></div>
                <div>
                  <h4 className="font-bold text-orange-900">Capacitor Native Bridge</h4>
                  <p className="text-sm text-orange-700">
                    El sistema está preparado para ser compilado como binario nativo (.apk / .ipa) usando Capacitor. 
                    Esto permite acceso a Bluetooth para básculas y NFC para control de acceso.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'seguridad' && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-red-100 text-red-600 rounded-2xl"><Shield size={24} /></div>
                   <div>
                     <h3 className="text-xl font-bold">Políticas de Acceso</h3>
                     <p className="text-sm text-gray-400">Controla cómo el personal accede al sistema central.</p>
                   </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl">
                    <div>
                      <h4 className="font-bold">Autenticación de Dos Pasos (2FA)</h4>
                      <p className="text-xs text-gray-500">Añade una capa extra de seguridad para administradores.</p>
                    </div>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-gray-300 transition-colors cursor-pointer">
                      <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl">
                    <div>
                      <h4 className="font-bold">Backup Automático</h4>
                      <p className="text-xs text-gray-500">Respaldo diario de la base de datos en la nube.</p>
                    </div>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-orange-500 transition-colors cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white transition-transform"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100 space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2"><Database size={24} className="text-orange-500" /> Exportación de Datos</h3>
                <div className="flex flex-col md:flex-row gap-4">
                  <button className="flex-1 p-6 bg-white border border-gray-200 rounded-3xl hover:border-orange-500 transition-all flex flex-col items-center gap-3">
                    <Database size={32} className="text-blue-500" />
                    <span className="font-bold text-sm">Base de Datos (SQL)</span>
                  </button>
                  <button className="flex-1 p-6 bg-white border border-gray-200 rounded-3xl hover:border-orange-500 transition-all flex flex-col items-center gap-3">
                    <Globe size={32} className="text-emerald-500" />
                    <span className="font-bold text-sm">Socios (CSV)</span>
                  </button>
                  <button className="flex-1 p-6 bg-white border border-gray-200 rounded-3xl hover:border-orange-500 transition-all flex flex-col items-center gap-3">
                    <Bell size={32} className="text-amber-500" />
                    <span className="font-bold text-sm">Logs de Sistema</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SettingsView;
