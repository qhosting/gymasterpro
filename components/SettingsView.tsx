
import React, { useState, useEffect } from 'react';
import { 
  Settings, Shield, Smartphone, Globe, Clock, Users, 
  Save, Database, Palette, Lock, Bell, Mail, 
  MapPin, Camera, Trash2, Edit3, UserPlus, Key, CreditCard,
  Zap, Info, Cloud, Download, Apple, Layout, MessageSquare
} from 'lucide-react';
import { User, UserRole } from '../types';
import { fetchSystemSettings, updateSystemSettings, fetchStaff } from '../services/apiService';

interface SettingsViewProps {
  currentUser: User;
  onSettingsUpdate?: () => void | Promise<void>;
}

const SettingsView: React.FC<SettingsViewProps> = ({ currentUser, onSettingsUpdate }) => {
  const [activeSection, setActiveSection] = useState<'general' | 'personal' | 'integraciones' | 'seguridad' | 'movil'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [settings, setSettings] = useState({
    gymName: 'GymMaster Pro',
    aforoMaximo: 50,
    direccion: '',
    horario: '',
    wahaUrl: '',
    wahaKey: '',
    geminiKey: '',
    ycloudKey: '',
    openpayMerchantId: '',
    openpayPublicKey: '',
    openpayPrivateKey: '',
    openpaySandbox: true,
    pushEnabled: true,
    backupEnabled: true,
    primaryColor: '#f97316',
    darkMode: false
  });

  useEffect(() => {
    loadSettings();
    loadStaff();
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const loadSettings = async () => {
    try {
      const data = await fetchSystemSettings();
      if (data) setSettings(data);
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const [staff, setStaff] = useState<any[]>([]);

  const loadStaff = async () => {
    try {
      const data = await fetchStaff();
      setStaff(data);
    } catch (error) {
      console.error("Error loading staff:", error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSystemSettings(settings);
      if (onSettingsUpdate) onSettingsUpdate();
      alert('Configuración guardada exitosamente');
    } catch (error) {
      alert('Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
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
                    value={settings.gymName}
                    onChange={(e) => setSettings({ ...settings, gymName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Aforo Máximo</label>
                  <input 
                    type="number"
                    className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-orange-500 transition-all font-bold"
                    value={settings.aforoMaximo}
                    onChange={(e) => setSettings({ ...settings, aforoMaximo: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Dirección Principal</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-orange-500 font-medium" 
                      value={settings.direccion}
                      onChange={(e) => setSettings({ ...settings, direccion: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Horario de Atención</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-orange-500 font-medium" 
                      value={settings.horario}
                      onChange={(e) => setSettings({ ...settings, horario: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-50">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Palette size={20} className="text-orange-500" />
                    <h3 className="text-lg font-bold">Personalización Visual</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Color de Marca (Botones y Acentos)</label>
                       <div className="flex gap-4 items-center">
                         <input 
                           type="color"
                           className="w-12 h-12 rounded-xl border-none p-1 bg-gray-50 cursor-pointer"
                           value={settings.primaryColor}
                           onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                         />
                         <input 
                            className="flex-1 p-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm uppercase"
                            value={settings.primaryColor}
                            onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                         />
                       </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        {settings.darkMode ? <Zap className="text-yellow-500" /> : <Clock className="text-gray-400" />}
                        <div>
                          <p className="font-bold text-sm">Modo Oscuro Permanente</p>
                          <p className="text-[10px] text-gray-400">Aplica una estética nocturna a toda la interfaz.</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={settings.darkMode}
                          onChange={(e) => setSettings({...settings, darkMode: e.target.checked})}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Vista Previa de Marca</label>
                  <div className="p-8 rounded-[30px] border border-gray-100 bg-white shadow-inner flex flex-col items-center justify-center gap-4">
                     <div 
                       className="w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-lg animate-pulse"
                       style={{ backgroundColor: settings.primaryColor }}
                     >
                       <Layout size={32} />
                     </div>
                     <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Color Actual: {settings.primaryColor}</p>
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
                    <span className="text-[10px] font-black uppercase text-green-600">Base</span>
                  </div>
                  <h3 className="text-xl font-bold">WhatsApp WAHA</h3>
                  <div className="space-y-3">
                    <input 
                      placeholder="URL de API (ej: http://localhost:3000)"
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-500"
                      value={settings.wahaUrl}
                      onChange={(e) => setSettings({ ...settings, wahaUrl: e.target.value })}
                    />
                    <input 
                      type="password"
                      placeholder="WAHA API Key"
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-500"
                      value={settings.wahaKey}
                      onChange={(e) => setSettings({ ...settings, wahaKey: e.target.value })}
                    />
                  </div>
                </div>

                <div className="p-8 bg-gray-50 rounded-[40px] border border-gray-200 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl"><Zap size={24} /></div>
                    <span className="text-[10px] font-black uppercase text-purple-600">AI</span>
                  </div>
                  <h3 className="text-xl font-bold">Gemini AI Engine</h3>
                  <div className="space-y-3">
                    <input 
                      type="password"
                      placeholder="Google Gemini API Key"
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-500"
                      value={settings.geminiKey}
                      onChange={(e) => setSettings({ ...settings, geminiKey: e.target.value })}
                    />
                  </div>
                </div>

                <div className="p-8 bg-gray-50 rounded-[40px] border border-gray-200 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><CreditCard size={24} /></div>
                    <span className="text-[10px] font-black uppercase text-blue-600">Pagos Online</span>
                  </div>
                  <h2 className="text-xl font-bold">Openpay Gateway</h2>
                  <div className="space-y-3">
                    <input 
                      placeholder="Merchant ID"
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                      value={settings.openpayMerchantId}
                      onChange={(e) => setSettings({ ...settings, openpayMerchantId: e.target.value })}
                    />
                    <input 
                      placeholder="Public Key"
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                      value={settings.openpayPublicKey}
                      onChange={(e) => setSettings({ ...settings, openpayPublicKey: e.target.value })}
                    />
                    <input 
                      type="password"
                      placeholder="Private Key"
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                      value={settings.openpayPrivateKey}
                      onChange={(e) => setSettings({ ...settings, openpayPrivateKey: e.target.value })}
                    />
                    <div className="flex items-center gap-2 pt-2">
                       <input 
                         type="checkbox" 
                         id="sandbox"
                         checked={settings.openpaySandbox}
                         onChange={(e) => setSettings({...settings, openpaySandbox: e.target.checked})}
                       />
                       <label htmlFor="sandbox" className="text-xs font-bold text-gray-500">Modo Sandbox (Pruebas)</label>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-orange-50 rounded-[40px] border border-orange-100 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl"><MessageSquare size={24} /></div>
                      <span className="text-[10px] font-black uppercase text-orange-600">Soporte</span>
                    </div>
                    <h3 className="text-xl font-bold">¿Necesitas una API personalizada?</h3>
                    <p className="text-sm text-gray-500">Contacta con los expertos de Aurum Capital para integraciones a medida.</p>
                  </div>
                  <button 
                    onClick={() => window.open('https://wa.me/524424000742', '_blank')}
                    className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-green-500/20"
                  >
                    <Smartphone size={18} />
                    WhatsApp Aurum
                  </button>
                </div>
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

              <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <Bell className="text-orange-500" /> Configuración de Notificaciones Push
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[30px]">
                    <div>
                      <h4 className="font-bold">Recordatorios de Pago</h4>
                      <p className="text-xs text-gray-500">Avisar 3 días antes del vencimiento.</p>
                    </div>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-orange-500 transition-colors cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white transition-transform"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[30px]">
                    <div>
                      <h4 className="font-bold">Anuncios de Comunidad</h4>
                      <p className="text-xs text-gray-500">Nuevas rutinas, retos y eventos del gym.</p>
                    </div>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-gray-300 transition-colors cursor-pointer">
                      <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform"></div>
                    </div>
                  </div>
                </div>
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
