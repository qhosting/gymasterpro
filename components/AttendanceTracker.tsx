
import React, { useState, useRef, useEffect } from 'react';
import { 
  QrCode, LogIn, LogOut, CheckCircle, XCircle, Users, 
  Clock, Zap, Cake, AlertTriangle, Maximize, Minimize,
  Search, Camera, Trash2, Award, History, Info, Plus, 
  Edit3, Save, X, ChevronRight, MapPin, Smile, ArrowLeft,
  Dumbbell, Scan, Cpu, ShieldCheck
} from 'lucide-react';
import { Member, MembershipStatus } from '../types';
import { identifyMemberByFace } from '../services/geminiService';

interface DetailedAttendanceRecord {
  id: string;
  memberId: string;
  entrada: string; 
  salida?: string;
}

interface AttendanceTrackerProps {
  members: Member[];
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ members }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isKioskMode, setIsKioskMode] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isFaceMode, setIsFaceMode] = useState(false);
  const [isAnalyzingFace, setIsAnalyzingFace] = useState(false);
  
  const [activeAttendance, setActiveAttendance] = useState<DetailedAttendanceRecord[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<DetailedAttendanceRecord[]>([]);
  const [lastAlert, setLastAlert] = useState<{ member: Member, types: string[] } | null>(null);
  
  const [kioskStatus, setKioskStatus] = useState<'idle' | 'success' | 'warning' | 'error' | 'analyzing'>('idle');
  const [kioskMember, setKioskMember] = useState<Member | null>(null);

  // Fix: Added missing state for manual registration form to resolve "Cannot find name 'manualRecord'" errors
  const [manualRecord, setManualRecord] = useState({
    memberId: '',
    entradaTime: '',
    salidaTime: '',
    isCompleted: false
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const kioskTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const faceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const CAPACIDAD_MAXIMA = 50;

  useEffect(() => {
    if (activeAttendance.length === 0 && attendanceHistory.length === 0) {
      setActiveAttendance([
        { id: '1', memberId: 'm1', entrada: new Date(Date.now() - 45 * 60000).toISOString() },
        { id: '2', memberId: 'm2', entrada: new Date(Date.now() - 15 * 60000).toISOString() },
      ]);
      setAttendanceHistory([
        { id: '3', memberId: 'm3', entrada: new Date(Date.now() - 120 * 60000).toISOString(), salida: new Date(Date.now() - 60 * 60000).toISOString() }
      ]);
    }
  }, []);

  useEffect(() => {
    if (isKioskMode) {
      startCamera();
    } else {
      stopCamera();
      if (faceIntervalRef.current) clearInterval(faceIntervalRef.current);
    }
  }, [isKioskMode]);

  // Manejar el auto-escaneo facial cuando FaceMode está activo
  useEffect(() => {
    if (isKioskMode && isFaceMode && kioskStatus === 'idle' && !isAnalyzingFace) {
      faceIntervalRef.current = setInterval(() => {
        captureAndAnalyzeFace();
      }, 5000); // Intenta reconocer cada 5 segundos si está en reposo
    } else {
      if (faceIntervalRef.current) clearInterval(faceIntervalRef.current);
    }
    return () => { if (faceIntervalRef.current) clearInterval(faceIntervalRef.current); };
  }, [isKioskMode, isFaceMode, kioskStatus, isAnalyzingFace]);

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Error cámara:", err);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setIsCameraActive(false);
  };

  const captureAndAnalyzeFace = async () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzingFace || kioskStatus !== 'idle') return;

    setIsAnalyzingFace(true);
    setKioskStatus('analyzing');

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const base64Image = canvas.toDataURL('image/jpeg', 0.8);
      
      const memberId = await identifyMemberByFace(base64Image, members);
      
      if (memberId && memberId !== "UNKNOWN") {
        handleCheckIn(memberId);
      } else {
        // No reconocido, volver a idle tras un momento
        setTimeout(() => {
          setKioskStatus('idle');
          setIsAnalyzingFace(false);
        }, 2000);
      }
    }
    setIsAnalyzingFace(false);
  };

  const handleCheckIn = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const alerts = [];
    const today = new Date().toISOString().split('T')[0].slice(5);
    const bday = member.fechaNacimiento?.slice(5);
    if (today === bday) alerts.push('Cumpleaños');
    if (member.status === MembershipStatus.VENCIDO) alerts.push('Membresía Vencida');
    if (member.deuda > 0) alerts.push('Pago Pendiente');
    
    const vencimientoDate = new Date(member.fechaVencimiento);
    const diffDays = Math.ceil((vencimientoDate.getTime() - Date.now()) / (1000 * 3600 * 24));
    if (diffDays <= 5 && diffDays > 0) alerts.push(`Vence en ${diffDays} días`);

    if (isKioskMode) {
      setKioskMember(member);
      if (member.status === MembershipStatus.VENCIDO || member.deuda > 0) {
        setKioskStatus('warning');
      } else {
        setKioskStatus('success');
      }

      if (!activeAttendance.some(a => a.memberId === memberId)) {
        setActiveAttendance([{ id: `at-${Date.now()}`, memberId, entrada: new Date().toISOString() }, ...activeAttendance]);
      } else {
        handleCheckOut(memberId);
      }

      if (kioskTimeoutRef.current) clearTimeout(kioskTimeoutRef.current);
      kioskTimeoutRef.current = setTimeout(() => {
        setKioskStatus('idle');
        setKioskMember(null);
        setSearchTerm('');
        setIsAnalyzingFace(false);
      }, 4000);

    } else {
      if (activeAttendance.some(a => a.memberId === memberId)) {
        handleCheckOut(memberId);
        return;
      }
      setLastAlert({ member, types: alerts });
      setActiveAttendance([{ id: `at-${Date.now()}`, memberId, entrada: new Date().toISOString() }, ...activeAttendance]);
      setSearchTerm('');
      setTimeout(() => setLastAlert(null), 5000);
    }
  };

  const handleCheckOut = (memberId: string) => {
    const record = activeAttendance.find(a => a.memberId === memberId);
    if (record) {
      const completedRecord = { ...record, salida: new Date().toISOString() };
      setAttendanceHistory([completedRecord, ...attendanceHistory]);
      setActiveAttendance(prev => prev.filter(a => a.memberId !== memberId));
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualRecord.memberId) return;

    const baseDate = new Date().toISOString().split('T')[0];
    const entradaISO = new Date(`${baseDate}T${manualRecord.entradaTime}`).toISOString();
    
    const newRecord: DetailedAttendanceRecord = {
      id: `manual-${Date.now()}`,
      memberId: manualRecord.memberId,
      entrada: entradaISO,
    };

    if (manualRecord.isCompleted && manualRecord.salidaTime) {
      newRecord.salida = new Date(`${baseDate}T${manualRecord.salidaTime}`).toISOString();
      setAttendanceHistory([newRecord, ...attendanceHistory]);
    } else {
      setActiveAttendance([newRecord, ...activeAttendance]);
    }

    setIsManualModalOpen(false);
    setManualRecord({ memberId: '', entradaTime: '', salidaTime: '', isCompleted: false });
  };

  const deleteHistoryRecord = (id: string, isFromActive: boolean) => {
    if (isFromActive) {
      setActiveAttendance(prev => prev.filter(r => r.id !== id));
    } else {
      setAttendanceHistory(prev => prev.filter(r => r.id !== id));
    }
  };

  const getMemberById = (id: string) => members.find(m => m.id === id);

  const calculateDuration = (start: string, end?: string) => {
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : new Date().getTime();
    return Math.floor((endTime - startTime) / 60000);
  };

  const aforoPorcentaje = Math.min((activeAttendance.length / CAPACIDAD_MAXIMA) * 100, 100);

  if (isKioskMode) {
    return (
      <div className="fixed inset-0 bg-black z-[100] flex flex-col overflow-hidden text-white animate-in fade-in duration-500 font-mono">
        {/* Kiosk Header */}
        <div className="p-8 flex items-center justify-between border-b border-white/5 bg-gray-900/50 backdrop-blur-xl">
           <div className="flex items-center gap-4">
             <div className="bg-orange-500 p-3 rounded-2xl shadow-lg shadow-orange-500/20">
                <Cpu className="text-white" size={32} />
             </div>
             <div>
               <h1 className="text-2xl font-black tracking-tighter uppercase">Bio-Access System v2.0</h1>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                 <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Seguridad Biométrica • Aforo: {activeAttendance.length}/{CAPACIDAD_MAXIMA}</span>
               </div>
             </div>
           </div>
           
           <div className="flex gap-4">
              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                <button 
                  onClick={() => setIsFaceMode(false)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isFaceMode ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-white'}`}
                >
                  QR SCAN
                </button>
                <button 
                  onClick={() => setIsFaceMode(true)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isFaceMode ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-white'}`}
                >
                  FACE ID
                </button>
              </div>
              <button 
                onClick={() => setIsKioskMode(false)}
                className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10"
              >
                <ArrowLeft size={20} /> <span className="text-xs font-black uppercase tracking-widest">Panel Staff</span>
              </button>
           </div>
        </div>

        {/* Main Interface */}
        <div className="flex-1 relative flex flex-col items-center justify-center">
          
          {/* Continuous Camera Feed */}
          <div className="absolute inset-0 z-0">
             <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover transition-all duration-1000 ${isFaceMode ? 'opacity-80' : 'opacity-30 grayscale'}`} />
             <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90"></div>
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* HUD & Scan Overlay for Face ID */}
          {isFaceMode && kioskStatus === 'idle' && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
               <div className="w-[450px] h-[550px] border-2 border-white/10 rounded-[120px] relative">
                  {/* Focus Oval */}
                  <div className="absolute inset-4 border-[6px] border-orange-500/20 rounded-[100px] flex items-center justify-center">
                    <div className="w-full h-1 bg-orange-500/40 animate-scan absolute top-0 shadow-[0_0_30px_rgba(249,115,22,0.5)]"></div>
                  </div>
                  
                  {/* Corner Nodes */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 border-t-4 border-l-4 border-orange-500 rounded-tl-2xl"></div>
                  <div className="absolute -top-4 -right-4 w-12 h-12 border-t-4 border-r-4 border-orange-500 rounded-tr-2xl"></div>
                  <div className="absolute -bottom-4 -left-4 w-12 h-12 border-b-4 border-l-4 border-orange-500 rounded-bl-2xl"></div>
                  <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-4 border-r-4 border-orange-500 rounded-br-2xl"></div>

                  {/* Biometric Stats HUD */}
                  <div className="absolute -left-48 top-20 space-y-4">
                     <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/5 w-40">
                        <p className="text-[8px] text-gray-400 uppercase tracking-widest mb-2">Iris Scanner</p>
                        <div className="flex gap-1">
                           {[1,2,3,4,5,6].map(i => <div key={i} className="h-1 flex-1 bg-orange-500/20 rounded-full overflow-hidden"><div className="h-full bg-orange-500 animate-pulse" style={{animationDelay: `${i*100}ms`}}></div></div>)}
                        </div>
                     </div>
                     <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/5 w-40">
                        <p className="text-[8px] text-gray-400 uppercase tracking-widest mb-2">Face Vector</p>
                        <p className="text-[10px] text-white font-black truncate">#8X99-A122-F3</p>
                     </div>
                  </div>

                  <div className="absolute -right-48 bottom-20 space-y-4">
                     <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/5 w-40">
                        <p className="text-[8px] text-gray-400 uppercase tracking-widest mb-2">Access Type</p>
                        <p className="text-[10px] text-orange-500 font-black">BIOMETRIC_ID</p>
                     </div>
                     <div className="bg-orange-500/20 backdrop-blur-md p-4 rounded-2xl border border-orange-500/50 w-40 flex items-center gap-2">
                        <ShieldCheck size={14} className="text-orange-500" />
                        <p className="text-[8px] text-white font-black uppercase tracking-widest">Auth Active</p>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* Idle View (QR) */}
          {kioskStatus === 'idle' && !isFaceMode && (
            <div className="relative z-10 w-full max-w-2xl px-10 text-center space-y-12 animate-in zoom-in-95 duration-500">
               <div className="space-y-4">
                 <h2 className="text-6xl font-black tracking-tighter leading-none italic uppercase">Escanea tu QR</h2>
                 <p className="text-gray-400 text-xl font-medium">O ingresa tu nombre para registrar entrada</p>
               </div>

               <div className="relative group">
                 <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-orange-500" size={32} />
                 <input 
                   type="text"
                   autoFocus
                   placeholder="Escribe tu nombre aquí..."
                   className="w-full py-10 pl-24 pr-10 bg-white/5 border-4 border-white/10 rounded-[40px] text-3xl font-black outline-none focus:border-orange-500 focus:bg-white/10 transition-all placeholder:text-white/20 font-sans"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
                 
                 {searchTerm && (
                   <div className="absolute top-full left-0 w-full mt-4 bg-gray-900/95 backdrop-blur-2xl rounded-[40px] border-4 border-white/10 overflow-hidden shadow-2xl z-50 font-sans">
                      {members.filter(m => m.nombre.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5).map(m => (
                        <button 
                          key={m.id}
                          onClick={() => handleCheckIn(m.id)}
                          className="w-full p-8 flex items-center justify-between border-b border-white/5 hover:bg-orange-500 transition-all text-left"
                        >
                          <div className="flex items-center gap-6">
                            <img src={m.foto} className="w-20 h-20 rounded-3xl object-cover border-4 border-white/10" />
                            <div>
                               <p className="text-3xl font-black">{m.nombre}</p>
                               <p className="text-sm font-bold text-white/40 uppercase tracking-widest">ID: {m.id}</p>
                            </div>
                          </div>
                          <ChevronRight size={40} className="text-white/20" />
                        </button>
                      ))}
                   </div>
                 )}
               </div>
            </div>
          )}

          {/* Analyzing Face Feedback */}
          {kioskStatus === 'analyzing' && (
            <div className="relative z-10 text-center space-y-8 animate-in fade-in zoom-in duration-300">
               <div className="w-32 h-32 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto flex items-center justify-center">
                  <Scan className="text-orange-500" size={48} />
               </div>
               <div>
                  <h3 className="text-4xl font-black tracking-widest uppercase italic text-orange-500 animate-pulse">Analizando Perfil...</h3>
                  <p className="text-gray-400 mt-2 text-sm font-bold tracking-[0.3em] uppercase">IA Biometric Engine - Gemini Pro</p>
               </div>
            </div>
          )}

          {/* Success / Warning Overlay */}
          {(kioskStatus === 'success' || kioskStatus === 'warning') && kioskMember && (
            <div className={`absolute inset-0 z-50 flex items-center justify-center p-10 animate-in fade-in zoom-in-110 duration-300 ${
              kioskStatus === 'success' ? 'bg-green-600/95' : 'bg-orange-600/95'
            }`}>
              <div className="text-center space-y-10 max-w-4xl font-sans">
                 <div className="relative inline-block">
                    <img src={kioskMember.foto} className="w-72 h-72 rounded-[60px] object-cover border-[12px] border-white shadow-2xl mx-auto" />
                    <div className="absolute -bottom-6 -right-6 bg-white text-green-600 p-6 rounded-[30px] shadow-2xl">
                       {kioskStatus === 'success' ? <CheckCircle size={60} /> : <AlertTriangle size={60} className="text-orange-600" />}
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                   <h3 className="text-8xl font-black tracking-tighter leading-none uppercase">
                     {kioskStatus === 'success' ? '¡Hola, ' : '¡Atención, '}{kioskMember.nombre.split(' ')[0]}!
                   </h3>
                   <p className="text-3xl font-bold text-white/90">
                     {kioskStatus === 'success' ? 'Identidad validada. Bienvenido.' : 'Por favor, pasa a recepción para regularizar tu cuenta.'}
                   </p>
                 </div>

                 {kioskStatus === 'success' && (
                   <div className="flex justify-center gap-6">
                      <div className="bg-black/20 backdrop-blur-md px-10 py-6 rounded-[30px] border border-white/10">
                         <p className="text-sm font-black text-white/60 uppercase tracking-widest mb-2">Vencimiento</p>
                         <p className="text-2xl font-black">{kioskMember.fechaVencimiento.split('-').reverse().join('/')}</p>
                      </div>
                      <div className="bg-black/20 backdrop-blur-md px-10 py-6 rounded-[30px] border border-white/10">
                         <p className="text-sm font-black text-white/60 uppercase tracking-widest mb-2">Racha</p>
                         <p className="text-2xl font-black flex items-center gap-2"><Zap size={24} className="text-yellow-400 fill-yellow-400"/> 12 Días</p>
                      </div>
                   </div>
                 )}

                 <div className="pt-10">
                   <div className="inline-flex items-center gap-3 px-8 py-4 bg-black/30 rounded-full font-mono">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      <span className="text-xs font-black uppercase tracking-widest">Reiniciando sistema en segundos...</span>
                   </div>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standard Dashboard Layout
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Asistencia Inteligente</h1>
          <p className="text-gray-500 font-medium">Control de aforo, validación biográfica y registros manuales.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm"
          >
            <Plus size={20} className="text-orange-500" />
            Registro Manual
          </button>
          <button 
            onClick={() => { setIsKioskMode(true); setIsFaceMode(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold transition-all shadow-lg active:scale-95"
          >
            <Scan size={20} />
            Entrar Modo Face ID
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Scanner & Search */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border-gray-100 p-8 rounded-[40px] border shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-gray-900">Validar Acceso</h3>
                <Zap className="text-orange-500 animate-pulse" />
              </div>

              <div className="relative aspect-square rounded-[40px] bg-black overflow-hidden border-8 border-gray-50/5 group shadow-inner">
                {isCameraActive ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" />
                    <div className="absolute inset-0 border-[60px] border-black/40 pointer-events-none"></div>
                    <div className="absolute top-1/2 left-0 w-full h-1.5 bg-orange-500 animate-scan shadow-[0_0_30px_rgba(249,115,22,1)]"></div>
                    <button 
                      onClick={stopCamera}
                      className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-red-500/80 backdrop-blur-md text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all"
                    >
                      Desactivar
                    </button>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-gray-900">
                    <QrCode size={100} className="text-white/5" />
                    <button 
                      onClick={startCamera}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl shadow-orange-500/30 active:scale-95"
                    >
                      Iniciar Escáner
                    </button>
                  </div>
                )}
              </div>

              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Buscar socio por nombre..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none border-2 bg-gray-50 border-transparent focus:border-orange-500 focus:bg-white focus:shadow-lg transition-all font-bold text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                {searchTerm && (
                  <div className="absolute top-full left-0 w-full mt-2 rounded-[30px] shadow-2xl border z-50 overflow-hidden max-h-72 overflow-y-auto animate-in slide-in-from-top-2 duration-300 bg-white border-gray-100">
                    {members.filter(m => m.nombre.toLowerCase().includes(searchTerm.toLowerCase())).map(m => (
                      <button 
                        key={m.id}
                        onClick={() => handleCheckIn(m.id)}
                        className="w-full p-5 flex items-center justify-between transition-colors border-b last:border-0 hover:bg-gray-50 border-gray-50"
                      >
                        <div className="flex items-center gap-4">
                          <img src={m.foto} className="w-10 h-10 rounded-xl object-cover" />
                          <div className="text-left">
                            <p className="text-sm font-black">{m.nombre}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">ID: {m.id}</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          m.status === MembershipStatus.ACTIVO ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>{m.status}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border-gray-100 p-8 rounded-[40px] border shadow-sm">
            <div className="flex justify-between items-center mb-6">
               <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Aforo en Tiempo Real</h4>
               <span className="text-sm font-black text-orange-500">{activeAttendance.length} / {CAPACIDAD_MAXIMA}</span>
            </div>
            <div className="h-5 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner p-1">
               <div 
                 className={`h-full rounded-full transition-all duration-1000 ${
                   aforoPorcentaje > 90 ? 'bg-red-500' : aforoPorcentaje > 70 ? 'bg-orange-500' : 'bg-green-500'
                 }`}
                 style={{ width: `${aforoPorcentaje}%` }}
               />
            </div>
          </div>
        </div>

        {/* Right Columns: Attendance Hub */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Active Members Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black flex items-center gap-3">
                <div className="p-2 bg-green-100 text-green-600 rounded-xl"><Users size={20} /></div>
                SOCIOS EN SALA ({activeAttendance.length})
              </h2>
              <div className="flex gap-2 text-[10px] font-black bg-gray-900 text-white px-4 py-2 rounded-full uppercase tracking-widest shadow-lg shadow-gray-900/10">
                <Clock size={14} className="text-orange-500" /> Promedio: 54 Min
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeAttendance.length === 0 ? (
                <div className="col-span-2 p-16 text-center border-4 border-dashed border-gray-100 rounded-[50px] space-y-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300"><Users size={32}/></div>
                  <p className="text-gray-400 font-bold">No hay actividad registrada en este momento.</p>
                </div>
              ) : (
                activeAttendance.map((record) => {
                  const member = getMemberById(record.memberId);
                  if (!member) return null;
                  const duration = calculateDuration(record.entrada);
                  
                  return (
                    <div key={record.id} className="bg-white border-gray-100 p-5 rounded-[30px] border shadow-sm flex items-center gap-4 group hover:shadow-xl hover:-translate-y-1 transition-all">
                      <div className="relative">
                        <img src={member.foto} className="w-16 h-16 rounded-2xl object-cover shadow-md" />
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-white animate-pulse"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-gray-900 truncate text-sm uppercase">{member.nombre}</h4>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-[10px] font-black text-gray-400 flex items-center gap-1 uppercase">
                            <LogIn size={12} className="text-green-500" /> {new Date(record.entrada).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 ${duration > 90 ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                            <Clock size={12} /> {duration}m
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                           onClick={() => handleCheckOut(member.id)}
                           className="p-3 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg shadow-gray-900/20"
                         >
                           <LogOut size={18} />
                         </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* History / Logs Section */}
          <section className="space-y-6 pt-6 border-t border-gray-100">
            <h2 className="text-xl font-black flex items-center gap-3 text-gray-900">
               <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><History size={20} /></div>
               SESIONES FINALIZADAS HOY
            </h2>
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
               <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <th className="px-8 py-4">Socio</th>
                      <th className="px-8 py-4">Entrada</th>
                      <th className="px-8 py-4">Salida</th>
                      <th className="px-8 py-4">Total</th>
                      <th className="px-8 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {attendanceHistory.map(record => {
                      const member = getMemberById(record.memberId);
                      return (
                        <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-3">
                               <img src={member?.foto} className="w-8 h-8 rounded-lg object-cover" />
                               <span className="text-sm font-black text-gray-900">{member?.nombre}</span>
                            </div>
                          </td>
                          <td className="px-8 py-4 text-xs font-bold text-gray-500">
                            {new Date(record.entrada).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </td>
                          <td className="px-8 py-4 text-xs font-bold text-gray-500">
                            {record.salida ? new Date(record.salida).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                          </td>
                          <td className="px-8 py-4">
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase">
                              {record.salida ? `${calculateDuration(record.entrada, record.salida)} min` : '-'}
                            </span>
                          </td>
                          <td className="px-8 py-4 text-right">
                             <button onClick={() => deleteHistoryRecord(record.id, false)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
               </table>
            </div>
          </section>
        </div>
      </div>

      {/* Manual Registration Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[50px] shadow-2xl overflow-hidden flex flex-col">
             <div className="bg-gray-900 p-10 text-white flex justify-between items-center relative overflow-hidden">
                <div className="relative z-10">
                   <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                     <Plus className="text-orange-500" size={32} /> Registro Manual
                   </h2>
                   <p className="text-gray-400 text-sm mt-1 font-medium">Añade o corrige una sesión de entrenamiento.</p>
                </div>
                <button onClick={() => setIsManualModalOpen(false)} className="relative z-10 p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all">
                  <X size={24}/>
                </button>
             </div>

             <form onSubmit={handleManualSubmit} className="p-10 space-y-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">1. Seleccionar Socio</label>
                   <select 
                      required
                      className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-orange-500 rounded-3xl outline-none font-black text-gray-900"
                      value={manualRecord.memberId}
                      onChange={(e) => setManualRecord({...manualRecord, memberId: e.target.value})}
                    >
                      <option value="">Elegir de la lista...</option>
                      {members.map(m => (
                        <option key={m.id} value={m.id}>{m.nombre}</option>
                      ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">2. Hora de Entrada</label>
                      <input 
                        type="time" required
                        className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-orange-500 rounded-3xl outline-none font-black text-gray-900"
                        value={manualRecord.entradaTime}
                        onChange={(e) => setManualRecord({...manualRecord, entradaTime: e.target.value})}
                      />
                   </div>
                   <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">3. Hora de Salida</label>
                        <input 
                          type="checkbox" 
                          checked={manualRecord.isCompleted}
                          onChange={(e) => setManualRecord({...manualRecord, isCompleted: e.target.checked})}
                        />
                      </div>
                      <input 
                        type="time" 
                        disabled={!manualRecord.isCompleted}
                        className={`w-full p-5 bg-gray-50 border-2 border-transparent focus:border-orange-500 rounded-3xl outline-none font-black text-gray-900 ${!manualRecord.isCompleted ? 'opacity-30' : ''}`}
                        value={manualRecord.salidaTime}
                        onChange={(e) => setManualRecord({...manualRecord, salidaTime: e.target.value})}
                      />
                   </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-6 bg-orange-500 text-white rounded-[30px] font-black text-lg uppercase tracking-widest shadow-2xl shadow-orange-500/30 hover:bg-orange-600 transition-all active:scale-95 flex items-center justify-center gap-4"
                >
                  Confirmar Registro <ChevronRight size={24} />
                </button>
             </form>
          </div>
        </div>
      )}

      {/* Pop-up Alert (Common with previous version) */}
      {lastAlert && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] w-full max-w-lg p-8 rounded-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] bg-gray-900 border border-white/10 text-white flex items-center gap-8 animate-in slide-in-from-top duration-500">
          <div className="relative">
            <img src={lastAlert.member.foto} className="w-24 h-24 rounded-[30px] object-cover ring-4 ring-orange-500 shadow-2xl" />
            <div className="absolute -top-3 -right-3 bg-orange-500 p-2.5 rounded-2xl shadow-lg">
               <CheckCircle size={24} />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-black mb-1">¡Acceso Correcto!</h3>
            <p className="text-orange-400 font-black text-sm uppercase tracking-wider">{lastAlert.member.nombre}</p>
            
            {lastAlert.types.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {lastAlert.types.map(t => (
                  <span key={t} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    t.includes('Cumpleaños') ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                  }`}>
                    {t.includes('Cumpleaños') ? <Cake size={12} /> : <AlertTriangle size={12} />}
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTracker;
