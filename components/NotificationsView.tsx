
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, MessageSquare, Send, Calendar, Settings, CheckCircle, 
  AlertCircle, Smartphone, Users, Zap, History, LayoutGrid,
  Filter, Trash2, Copy, Sparkles, Clock, ShieldCheck, ChevronRight,
  RefreshCcw, Play, Loader2
} from 'lucide-react';
import { Member, WahaConfig, NotificationLog, MembershipStatus } from '../types';
import { generateNotificationTemplate } from '../services/geminiService';
import { sendWahaMessage, checkWahaStatus } from '../services/wahaService';

const NotificationsView: React.FC<{ members: Member[] }> = ({ members }) => {
  const [activeTab, setActiveTab] = useState<'send' | 'history' | 'automation'>('send');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [msgType, setMsgType] = useState('Vencimiento');
  const [tone, setTone] = useState('Amigable');
  const [isGenerating, setIsGenerating] = useState(false);
  const [template, setTemplate] = useState('');
  
  // WAHA States
  const [wahaConfig, setWahaConfig] = useState<WahaConfig>({
    apiUrl: 'http://localhost:3000',
    apiKey: '',
    session: 'default'
  });
  const [isWahaOnline, setIsWahaOnline] = useState<boolean | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showWahaSettings, setShowWahaSettings] = useState(false);
  const [sendFeedback, setSendFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [history, setHistory] = useState<NotificationLog[]>([]);

  // Automation States
  const [isSyncing, setIsSyncing] = useState(false);
  const [automationProgress, setAutomationProgress] = useState(0);

  // Filtrar socios que vencen exactamente en 3 días
  const expiringIn3Days = useMemo(() => {
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + 3);
    const targetStr = targetDate.toISOString().split('T')[0];

    return members.filter(m => m.fechaVencimiento === targetStr && m.status === MembershipStatus.ACTIVO);
  }, [members]);

  useEffect(() => {
    const verifyStatus = async () => {
      const online = await checkWahaStatus(wahaConfig);
      setIsWahaOnline(online);
    };
    verifyStatus();
    
    // Simulación de historial inicial
    setHistory([
      { id: '1', memberId: 'm1', timestamp: '2024-05-22 10:30', mensaje: 'Recordatorio de pago enviado.', tipo: 'Vencimiento', status: 'sent' },
      { id: '2', memberId: 'm2', timestamp: '2024-05-22 11:15', mensaje: '¡Feliz cumpleaños Maria!', tipo: 'Cumpleaños', status: 'delivered' },
    ]);
  }, [wahaConfig]);

  const handleGenerate = async () => {
    if (!selectedMember) return;
    setIsGenerating(true);
    setSendFeedback(null);
    const content = await generateNotificationTemplate(msgType, selectedMember.nombre, tone);
    setTemplate(content);
    setIsGenerating(false);
  };

  const handleSendWaha = async (targetMember: Member, customMsg?: string) => {
    const msg = customMsg || template;
    if (!targetMember || !msg || !targetMember.telefono) {
      if (!customMsg) setSendFeedback({ type: 'error', msg: 'Faltan datos del cliente o mensaje.' });
      return false;
    }

    if (!customMsg) setIsSending(true);
    try {
      await sendWahaMessage(wahaConfig, targetMember.telefono, msg);
      if (!customMsg) setSendFeedback({ type: 'success', msg: '¡Mensaje enviado correctamente!' });
      
      const newLog: NotificationLog = {
        id: Date.now().toString(),
        memberId: targetMember.id,
        timestamp: new Date().toLocaleString(),
        mensaje: msg,
        tipo: 'Recordatorio 3 Días',
        status: 'sent'
      };
      setHistory(prev => [newLog, ...prev]);
      return true;
    } catch (error: any) {
      if (!customMsg) setSendFeedback({ type: 'error', msg: error.message || 'Error al conectar con WAHA.' });
      return false;
    } finally {
      if (!customMsg) setIsSending(false);
    }
  };

  const runAutomationLote = async () => {
    if (expiringIn3Days.length === 0) return;
    setIsSyncing(true);
    setAutomationProgress(0);

    for (let i = 0; i < expiringIn3Days.length; i++) {
      const member = expiringIn3Days[i];
      // Generar mensaje específico con IA para el recordatorio de 3 días
      const autoMsg = await generateNotificationTemplate("Recordatorio: Tu membresía vence en solo 3 días", member.nombre, "Motivador");
      await handleSendWaha(member, autoMsg);
      setAutomationProgress(((i + 1) / expiringIn3Days.length) * 100);
      // Pequeña pausa para no saturar
      await new Promise(r => setTimeout(r, 1000));
    }

    setIsSyncing(false);
    alert('Automatización completada con éxito.');
  };

  const tones = ['Amigable', 'Profesional', 'Urgente', 'Motivador'];
  const getMemberName = (id: string) => members.find(m => m.id === id)?.nombre || 'Socio';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      {/* Header & Connectivity */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Hub de Comunicaciones</h1>
          <p className="text-gray-500">Automatización inteligente y mensajería directa.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            isWahaOnline ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            <Smartphone size={16} className={isWahaOnline ? 'animate-bounce' : ''} />
            WAHA: {isWahaOnline ? 'CONECTADO' : 'DESCONECTADO'}
          </div>
          <button 
            onClick={() => setShowWahaSettings(!showWahaSettings)}
            className="p-2.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* WAHA Configuration Panel */}
      {showWahaSettings && (
        <div className="bg-gray-900 p-8 rounded-[40px] shadow-2xl text-white space-y-6 animate-in slide-in-from-top duration-500 border border-white/5">
          <div className="flex justify-between items-center">
             <h3 className="text-xl font-bold flex items-center gap-2"><ShieldCheck size={24} className="text-orange-500" /> Configuración Segura WAHA</h3>
             <button onClick={() => setShowWahaSettings(false)} className="text-gray-500 hover:text-white"><Trash2 size={20}/></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Servidor WAHA (URL)</label>
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                value={wahaConfig.apiUrl}
                onChange={(e) => setWahaConfig({...wahaConfig, apiUrl: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">X-API-KEY</label>
              <input 
                type="password"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-orange-500 outline-none transition-all"
                value={wahaConfig.apiKey}
                onChange={(e) => setWahaConfig({...wahaConfig, apiKey: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Nombre Sesión</label>
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-orange-500 outline-none transition-all"
                value={wahaConfig.session}
                onChange={(e) => setWahaConfig({...wahaConfig, session: e.target.value})}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Tabs */}
      <div className="flex gap-2 bg-gray-200/50 p-1.5 rounded-2xl w-fit">
        {[
          { id: 'send', label: 'Envío Individual', icon: Zap },
          { id: 'automation', label: 'Automatización Smart', icon: Cpu },
          { id: 'history', label: 'Historial', icon: History }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === tab.id ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            {tab.id === 'automation' && expiringIn3Days.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500 text-[8px] text-white items-center justify-center font-bold">
                  {expiringIn3Days.length}
                </span>
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'send' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Member Picker */}
          <div className="lg:col-span-4 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6 max-h-[700px] flex flex-col">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">1. Seleccionar Socio</h3>
              <div className="p-2 bg-gray-50 rounded-xl"><Filter size={16} className="text-gray-400" /></div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {members.map(m => (
                <button 
                  key={m.id}
                  onClick={() => { setSelectedMember(m); setTemplate(''); setSendFeedback(null); }}
                  className={`w-full p-4 flex items-center gap-4 rounded-3xl transition-all border-2 group ${
                    selectedMember?.id === m.id ? 'border-orange-500 bg-orange-50 shadow-md shadow-orange-500/10' : 'border-transparent hover:border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <img src={m.foto} className="w-12 h-12 rounded-2xl object-cover" />
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-bold truncate group-hover:text-gray-900">{m.nombre}</p>
                    <p className="text-[10px] font-medium text-gray-400">{m.telefono || 'Sin WhatsApp'}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Individual Sender Area */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl"><Sparkles size={24} /></div>
                 <div>
                   <h3 className="text-xl font-bold">2. Redacción con IA</h3>
                   <p className="text-sm text-gray-400">Personalización profunda del mensaje.</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Contexto</label>
                  <select 
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    value={msgType}
                    onChange={(e) => setMsgType(e.target.value)}
                  >
                    <option value="Vencimiento">Vencimiento Cercano</option>
                    <option value="Cumpleaños">Felicitaciones</option>
                    <option value="Motivación">Re-enganche</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tono</label>
                  <div className="flex gap-2">
                    {tones.map(t => (
                      <button 
                        key={t}
                        onClick={() => setTone(t)}
                        className={`flex-1 py-4 rounded-2xl text-[10px] font-bold uppercase transition-all ${
                          tone === t ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                disabled={!selectedMember || isGenerating}
                onClick={handleGenerate}
                className="w-full py-5 bg-gray-900 text-white font-black text-lg rounded-3xl flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95 shadow-xl shadow-gray-900/10"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                {isGenerating ? 'IA Generando...' : 'Generar Mensaje'}
              </button>

              {template && (
                <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
                  <textarea 
                    className="w-full p-8 bg-green-50/30 border-2 border-dashed border-green-200 rounded-[40px] text-gray-700 font-medium leading-relaxed resize-none focus:outline-none min-h-[150px]"
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                  />
                  <div className="flex justify-between items-center gap-4">
                     {sendFeedback && (
                       <div className={`px-4 py-2 rounded-xl text-sm font-bold ${sendFeedback.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                         {sendFeedback.msg}
                       </div>
                     )}
                     <button 
                       disabled={isSending || !isWahaOnline}
                       onClick={() => handleSendWaha(selectedMember!)}
                       className="px-12 py-5 bg-green-600 text-white rounded-3xl font-black text-lg flex items-center gap-3 hover:bg-green-700 shadow-2xl shadow-green-500/30 transition-all active:scale-95"
                     >
                       <Send size={24} />
                       {isSending ? 'Enviando...' : 'Enviar WhatsApp'}
                     </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'automation' && (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
           {/* Automation Hero */}
           <div className="bg-gray-900 p-12 rounded-[50px] text-white flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
              <div className="relative z-10 flex-1 space-y-6 text-center md:text-left">
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 text-orange-400 rounded-full text-xs font-black uppercase tracking-widest border border-orange-500/30">
                   <Zap size={14} className="animate-pulse" /> Motor de IA Activo
                 </div>
                 <h2 className="text-4xl font-black tracking-tight leading-none">Recordatorios Automáticos de 3 Días</h2>
                 <p className="text-gray-400 max-w-lg font-medium">
                   Hemos detectado <span className="text-orange-500 font-black">{expiringIn3Days.length} socios</span> cuya membresía vence exactamente en 3 días. Ejecuta el lote para notificarlos a todos con IA.
                 </p>
                 
                 <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
                   <button 
                     disabled={expiringIn3Days.length === 0 || isSyncing || !isWahaOnline}
                     onClick={runAutomationLote}
                     className="px-10 py-5 bg-orange-500 text-white rounded-3xl font-black text-lg flex items-center gap-3 hover:bg-orange-600 shadow-2xl shadow-orange-500/30 transition-all active:scale-95 disabled:opacity-50"
                   >
                     {isSyncing ? <Loader2 className="animate-spin" /> : <Play size={24} />}
                     {isSyncing ? 'Procesando Lote...' : 'Ejecutar Envío Masivo'}
                   </button>
                   <button className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-3xl font-black text-lg hover:bg-white/10 transition-all">
                     Ver Reglas de IA
                   </button>
                 </div>
              </div>
              <div className="relative z-10 w-full max-w-[280px]">
                 <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[40px] space-y-6">
                    <div className="text-center space-y-1">
                       <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Estado Actual</p>
                       <p className="text-3xl font-black text-white">{isSyncing ? `${Math.round(automationProgress)}%` : 'LISTO'}</p>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${automationProgress}%` }} />
                    </div>
                    <p className="text-[10px] text-gray-400 text-center font-bold">Monitorizando membresías cada 24 horas.</p>
                 </div>
              </div>
              <Cpu size={200} className="absolute -bottom-20 -left-10 text-white/5" />
           </div>

           {/* Candidates List */}
           <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                  <Users size={24} className="text-orange-500" />
                  Socios Candidatos ({expiringIn3Days.length})
                </h3>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-4 py-2 rounded-full">Fecha de vencimiento objetivo: {new Date(new Date().setDate(new Date().getDate() + 3)).toLocaleDateString('es-MX')}</span>
             </div>

             {expiringIn3Days.length === 0 ? (
               <div className="bg-white p-20 rounded-[50px] border border-dashed border-gray-200 text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300"><CheckCircle size={32}/></div>
                  <p className="text-gray-400 font-bold">No hay socios que venzan en 3 días por el momento.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {expiringIn3Days.map(m => (
                    <div key={m.id} className="bg-white p-6 rounded-[35px] border border-gray-100 shadow-sm flex items-center gap-4 group">
                       <img src={m.foto} className="w-16 h-16 rounded-2xl object-cover" />
                       <div className="flex-1">
                          <p className="font-black text-gray-900 group-hover:text-orange-500 transition-colors">{m.nombre}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                             <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">3 Días Restantes</span>
                          </div>
                       </div>
                       <button 
                        onClick={() => { setSelectedMember(m); setActiveTab('send'); }}
                        className="p-3 bg-gray-50 text-gray-400 hover:text-orange-500 rounded-2xl transition-all"
                       >
                         <ChevronRight size={20} />
                       </button>
                    </div>
                  ))}
               </div>
             )}
           </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom duration-500">
           <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-xl font-bold">Registro de Comunicaciones</h3>
              <button className="text-sm font-bold text-gray-400 hover:text-red-500">Limpiar historial</button>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <th className="px-8 py-4">Socio</th>
                    <th className="px-8 py-4">Fecha / Hora</th>
                    <th className="px-8 py-4">Tipo</th>
                    <th className="px-8 py-4">Contenido</th>
                    <th className="px-8 py-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {history.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <span className="text-sm font-bold text-gray-900">{getMemberName(log.memberId)}</span>
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-500">{log.timestamp}</td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-[9px] font-black uppercase tracking-wider">{log.tipo}</span>
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-400 truncate max-w-xs">{log.mensaje}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${log.status === 'sent' ? 'bg-green-500 animate-pulse' : 'bg-orange-400'}`}></div>
                           <span className="text-[10px] font-bold uppercase">{log.status}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
           </div>
        </div>
      )}
    </div>
  );
};

const Cpu = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
    <rect x="9" y="9" width="6" height="6"></rect>
    <line x1="9" y1="1" x2="9" y2="4"></line>
    <line x1="15" y1="1" x2="15" y2="4"></line>
    <line x1="9" y1="20" x2="9" y2="23"></line>
    <line x1="15" y1="20" x2="15" y2="23"></line>
    <line x1="20" y1="9" x2="23" y2="9"></line>
    <line x1="20" y1="15" x2="23" y2="15"></line>
    <line x1="1" y1="9" x2="4" y2="9"></line>
    <line x1="1" y1="15" x2="4" y2="15"></line>
  </svg>
);

export default NotificationsView;
