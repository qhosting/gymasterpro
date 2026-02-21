
import React, { useState, useRef } from 'react';
import { 
  Search, Filter, Plus, Edit2, Trash2, Camera, X, Check, 
  Phone, Download, Calendar, User, ShieldAlert,
  ChevronRight, RefreshCw, Eye, Tag, CreditCard, SlidersHorizontal,
  Dumbbell, Apple, Clock, Save
} from 'lucide-react';
import { Member, MembershipStatus, UserRole, NutritionAppointment } from '../types';
import { MOCK_APPOINTMENTS } from '../constants';

interface MembersListProps {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
}

const MembersList: React.FC<MembersListProps> = ({ members, setMembers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | MembershipStatus | 'deudores'>('todos');
  const [planFilter, setPlanFilter] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<NutritionAppointment[]>(MOCK_APPOINTMENTS);
  const [editingAppointment, setEditingAppointment] = useState<string | null>(null);
  const [editAppForm, setEditAppForm] = useState({ fecha: '', hora: '' });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [newMember, setNewMember] = useState({
    nombre: '',
    email: '',
    telefono: '',
    plan: '1',
    objetivo: 'Pérdida de peso',
    contactoEmergencia: '',
    telefonoEmergencia: ''
  });

  // Advanced Filtering Logic
  const filteredMembers = members.filter(m => {
    // 1. Text Search Indexing (Name, Email, Phone)
    const searchString = `${m.nombre} ${m.email} ${m.telefono}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    
    // 2. Status Filter
    let matchesStatus = true;
    if (statusFilter === 'deudores') {
      matchesStatus = m.deuda > 0;
    } else if (statusFilter !== 'todos') {
      matchesStatus = m.status === statusFilter;
    }

    // 3. Plan Filter
    let matchesPlan = true;
    if (planFilter !== 'todos') {
      matchesPlan = m.planId === planFilter;
    }

    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Camera Logic
  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/png');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const memberToAdd: Member = {
      id: `m${Date.now()}`,
      nombre: newMember.nombre,
      email: newMember.email,
      telefono: newMember.telefono,
      role: UserRole.MIEMBRO,
      fechaRegistro: new Date().toISOString().split('T')[0],
      fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      planId: newMember.plan,
      status: MembershipStatus.ACTIVO,
      deuda: 0,
      foto: capturedImage || `https://picsum.photos/seed/${newMember.nombre}/100/100`,
      objetivo: newMember.objetivo,
      contactoEmergencia: newMember.contactoEmergencia,
      telefonoEmergencia: newMember.telefonoEmergencia
    };
    setMembers([memberToAdd, ...members]);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewMember({ nombre: '', email: '', telefono: '', plan: '1', objetivo: 'Pérdida de peso', contactoEmergencia: '', telefonoEmergencia: '' });
    setCapturedImage(null);
  };

  const handleUpdateAppointment = (id: string) => {
    setAppointments(appointments.map(a => 
      a.id === id ? { ...a, fecha: editAppForm.fecha, hora: editAppForm.hora } : a
    ));
    setEditingAppointment(null);
  };

  const memberAppointments = selectedMember 
    ? appointments.filter(a => a.memberId === selectedMember.id)
    : [];

  const handleRenovacionExpress = (id: string) => {
    setMembers(members.map(m => {
      if (m.id === id) {
        const nextMonth = new Date(m.fechaVencimiento);
        nextMonth.setDate(nextMonth.getDate() + 30);
        return { ...m, status: MembershipStatus.ACTIVO, fechaVencimiento: nextMonth.toISOString().split('T')[0], deuda: 0 };
      }
      return m;
    }));
  };

  const exportToCSV = () => {
    const headers = ['Nombre', 'Email', 'Teléfono', 'Estado', 'Vencimiento', 'Deuda'];
    const rows = filteredMembers.map(m => [m.nombre, m.email, m.telefono, m.status, m.fechaVencimiento, m.deuda]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `miembros_gym_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500 relative min-h-full pb-20">
      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gestión de Socios</h1>
          <p className="text-gray-500 font-medium">Visualiza y administra el expediente completo de tu comunidad.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToCSV}
            className="p-4 bg-white border border-gray-200 rounded-2xl text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
            title="Exportar a CSV"
          >
            <Download size={20} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-orange-500/20"
          >
            <Plus size={20} />
            Nuevo Registro
          </button>
        </div>
      </div>

      {/* Advanced Search & Filtering Bar */}
      <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Global Search Input */}
          <div className="flex-1 relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nombre, WhatsApp, email..." 
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all text-sm font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Quick Status Filters */}
          <div className="flex bg-gray-100 p-1.5 rounded-2xl w-full lg:w-auto">
            {(['todos', MembershipStatus.ACTIVO, MembershipStatus.VENCIDO, 'deudores'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setStatusFilter(type)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  statusFilter === type ? 'bg-white text-orange-600 shadow-md' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {type === 'deudores' ? 'Con Deuda' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filters */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-50">
           <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">
             <SlidersHorizontal size={14}/> Filtros Avanzados:
           </div>
           
           {/* Plan Filter Dropdown */}
           <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
             <Tag size={14} className="text-gray-400" />
             <select 
               className="bg-transparent border-none text-[11px] font-bold text-gray-600 outline-none cursor-pointer"
               value={planFilter}
               onChange={(e) => setPlanFilter(e.target.value)}
             >
               <option value="todos">Todos los Planes</option>
               <option value="1">Plan Básico</option>
               <option value="2">Plan Premium</option>
               <option value="3">Plan Anual</option>
             </select>
           </div>

           {/* Results Counter */}
           <div className="ml-auto text-[11px] font-bold text-gray-400">
             Mostrando <span className="text-orange-500">{filteredMembers.length}</span> resultados
           </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <div className="py-20 text-center space-y-4">
           <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-300">
             <Search size={40} />
           </div>
           <p className="text-gray-500 font-bold">No encontramos socios con esos criterios.</p>
           <button onClick={() => {setSearchTerm(''); setStatusFilter('todos'); setPlanFilter('todos');}} className="text-orange-500 font-black text-sm hover:underline">Limpiar todos los filtros</button>
        </div>
      )}

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMembers.map((member) => (
          <div 
            key={member.id} 
            className="bg-white p-6 rounded-[35px] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group relative overflow-hidden"
          >
            {/* Status Badge */}
            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest z-10 shadow-sm ${
              member.status === MembershipStatus.ACTIVO ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
              {member.status}
            </div>

            <div className="flex flex-col items-center text-center space-y-4 mb-6">
              <div className="relative">
                <img src={member.foto} className="w-24 h-24 rounded-[30px] object-cover border-4 border-gray-50 shadow-md transition-transform group-hover:scale-105" />
                {member.deuda > 0 && (
                  <div className="absolute -top-2 -left-2 bg-red-100 text-red-600 p-2 rounded-xl border border-red-200 shadow-sm">
                    <CreditCard size={14} />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-lg leading-tight group-hover:text-orange-500 transition-colors">{member.nombre}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">{member.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-6">
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest mb-1">WhatsApp</p>
                <p className="text-xs font-black text-gray-700 truncate">{member.telefono || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest mb-1">Vencimiento</p>
                <p className={`text-xs font-black ${member.status === MembershipStatus.VENCIDO ? 'text-red-500' : 'text-gray-700'}`}>
                  {member.fechaVencimiento.split('-').reverse().join('/')}
                </p>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="flex gap-2 pt-4 border-t border-gray-50">
              <button 
                onClick={() => setSelectedMember(member)}
                className="flex-1 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-gray-900/10"
              >
                <Eye size={14} /> Expediente
              </button>
              <button 
                onClick={() => handleRenovacionExpress(member.id)}
                className="p-3 bg-orange-50 text-orange-600 rounded-2xl hover:bg-orange-500 hover:text-white transition-all border border-orange-100"
                title="Renovación Express"
              >
                <RefreshCw size={18} />
              </button>
              <a 
                href={`https://wa.me/${member.telefono}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-500 hover:text-white transition-all border border-green-100"
                title="Enviar WhatsApp"
              >
                <Phone size={18} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Expediente Drawer (Side Panel) */}
      {selectedMember && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity" onClick={() => setSelectedMember(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-[110] shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col rounded-l-[50px]">
            <div className="p-10 border-b border-gray-50 flex items-center justify-between bg-gray-50/50 rounded-tl-[50px]">
              <h2 className="text-2xl font-black flex items-center gap-3 tracking-tight"><User size={28} className="text-orange-500"/> Expediente Socio</h2>
              <button onClick={() => setSelectedMember(null)} className="p-3 bg-white hover:bg-gray-100 rounded-2xl transition-all shadow-sm"><X size={24}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
               {/* Header Info */}
               <div className="flex flex-col items-center text-center space-y-4">
                 <div className="relative">
                   <img src={selectedMember.foto} className="w-40 h-40 rounded-[45px] object-cover shadow-2xl border-4 border-white" />
                   <div className={`absolute -bottom-2 -right-2 p-3 rounded-2xl shadow-xl ${
                     selectedMember.status === 'ACTIVO' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                   }`}>
                     <Check size={20} />
                   </div>
                 </div>
                 <div>
                   <h3 className="text-3xl font-black tracking-tight">{selectedMember.nombre}</h3>
                   <div className="flex gap-2 justify-center mt-3">
                     <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-orange-100 text-orange-600">ID: {selectedMember.id}</span>
                     <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                       selectedMember.status === 'ACTIVO' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                     }`}>{selectedMember.status}</span>
                   </div>
                 </div>
               </div>

               {/* Detalle Grid */}
               <div className="grid grid-cols-2 gap-6 bg-gray-50 p-8 rounded-[40px] border border-gray-100">
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">WhatsApp Directo</p>
                    <p className="text-sm font-bold text-gray-800">{selectedMember.telefono || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Miembro desde</p>
                    <p className="text-sm font-bold text-gray-800">{selectedMember.fechaRegistro}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Objetivo Fit</p>
                    <p className="text-sm font-black text-orange-600 uppercase italic">{selectedMember.objetivo || 'General'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Último Check-in</p>
                    <p className="text-sm font-bold text-gray-800">{selectedMember.ultimaAsistencia || 'Hoy'}</p>
                  </div>
               </div>

               {/* Emergencia Section */}
               <div className="bg-red-50 p-8 rounded-[40px] border border-red-100 relative overflow-hidden group">
                  <div className="relative z-10">
                    <h4 className="text-[10px] font-black text-red-600 uppercase mb-4 flex items-center gap-2 tracking-widest">
                      <ShieldAlert size={16}/> Protocolo de Emergencia
                    </h4>
                    <p className="text-xl font-black text-gray-900">{selectedMember.contactoEmergencia || 'Sin asignar'}</p>
                    <div className="flex items-center gap-2 text-red-600 font-bold mt-2">
                       <Phone size={14} />
                       <p className="text-sm">{selectedMember.telefonoEmergencia || 'Pendiente'}</p>
                    </div>
                  </div>
                  <ShieldAlert size={120} className="absolute -bottom-10 -right-10 text-red-100 group-hover:rotate-12 transition-transform duration-500" />
               </div>

               {/* Nutrition Appointments Section */}
               <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                    <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                      <Apple size={18} className="text-emerald-500" /> Citas Nutricionales
                    </h4>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black">
                      {memberAppointments.length} Registradas
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {memberAppointments.length === 0 ? (
                      <div className="p-8 bg-gray-50 rounded-[30px] border border-dashed border-gray-200 text-center">
                        <p className="text-xs font-bold text-gray-400">No hay citas agendadas para este socio.</p>
                      </div>
                    ) : (
                      memberAppointments.map(app => (
                        <div key={app.id} className="p-6 bg-white border border-gray-100 rounded-[30px] shadow-sm hover:shadow-md transition-all">
                          {editingAppointment === app.id ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Nueva Fecha</label>
                                  <input 
                                    type="date" 
                                    className="w-full p-2 bg-gray-50 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-orange-500"
                                    value={editAppForm.fecha}
                                    onChange={(e) => setEditAppForm({...editAppForm, fecha: e.target.value})}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Nueva Hora</label>
                                  <input 
                                    type="time" 
                                    className="w-full p-2 bg-gray-50 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-orange-500"
                                    value={editAppForm.hora}
                                    onChange={(e) => setEditAppForm({...editAppForm, hora: e.target.value})}
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleUpdateAppointment(app.id)}
                                  className="flex-1 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2"
                                >
                                  <Save size={14} /> Guardar
                                </button>
                                <button 
                                  onClick={() => setEditingAppointment(null)}
                                  className="px-4 py-2 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                                  <Calendar size={24} />
                                </div>
                                <div>
                                  <p className="text-sm font-black text-gray-900">
                                    {new Date(app.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                                  </p>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                    <Clock size={10} /> {app.hora} HS • {app.status}
                                  </p>
                                </div>
                              </div>
                              <button 
                                onClick={() => {
                                  setEditingAppointment(app.id);
                                  setEditAppForm({ fecha: app.fecha, hora: app.hora });
                                }}
                                className="p-3 bg-gray-50 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-2xl transition-all"
                              >
                                <Edit2 size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
               </div>

               {/* Activity Logs */}
               <div className="space-y-6">
                 <h4 className="text-sm font-black uppercase tracking-widest border-b border-gray-50 pb-4">Historial de Accesos</h4>
                 <div className="space-y-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-orange-50 transition-colors cursor-pointer border border-transparent hover:border-orange-100">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-orange-500 shadow-sm">
                               <RefreshCw size={18} />
                            </div>
                            <div>
                               <p className="text-xs font-black text-gray-900">Entrada Gimnasio</p>
                               <p className="text-[10px] text-gray-400 font-medium">Sede Principal - Turno Mañana</p>
                            </div>
                         </div>
                         <span className="text-[10px] font-black text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm">May {28 - i}, 08:30</span>
                      </div>
                    ))}
                 </div>
               </div>
            </div>

            <div className="p-10 bg-gray-50 border-t flex gap-4 rounded-bl-[50px]">
              <button className="flex-1 py-5 bg-orange-500 text-white rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-orange-600 shadow-xl shadow-orange-500/30 transition-all active:scale-95">
                <Edit2 size={18}/> Editar Socio
              </button>
              <button className="p-5 bg-white border border-gray-200 rounded-3xl text-red-500 hover:bg-red-50 transition-all shadow-sm">
                <Trash2 size={24}/>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-lg animate-in fade-in duration-300 p-4">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[50px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col md:flex-row border border-white/20">
            {/* Camera / Photo Section */}
            <div className="md:w-5/12 bg-gray-900 p-12 flex flex-col items-center justify-center space-y-10 relative">
               <div className="text-center">
                 <h3 className="text-2xl font-black text-white tracking-tight">Registro Facial</h3>
                 <p className="text-gray-500 text-sm mt-2">Captura la identidad del nuevo socio.</p>
               </div>
               
               <div className="relative w-full aspect-square bg-gray-800 rounded-[60px] overflow-hidden border-8 border-white/5 shadow-2xl flex items-center justify-center group">
                  {isCameraActive ? (
                    <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" />
                  ) : capturedImage ? (
                    <img src={capturedImage} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <User size={80} className="text-gray-700 group-hover:text-gray-600 transition-colors" />
                  )}
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {isCameraActive && (
                    <div className="absolute inset-0 border-[30px] border-black/20 pointer-events-none">
                       <div className="absolute top-1/2 left-0 w-full h-1 bg-orange-500 animate-scan shadow-[0_0_20px_rgba(249,115,22,1)]" />
                    </div>
                  )}
               </div>

               <div className="flex gap-4 w-full">
                  {!isCameraActive ? (
                    <button 
                      onClick={startCamera}
                      className="flex-1 py-5 bg-white/5 text-white border border-white/10 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
                    >
                      <Camera size={22} /> {capturedImage ? 'Recapturar' : 'Iniciar Cámara'}
                    </button>
                  ) : (
                    <button 
                      onClick={capturePhoto}
                      className="flex-1 py-5 bg-orange-500 text-white rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-orange-500/40 hover:bg-orange-600 transition-all active:scale-95"
                    >
                      <Check size={22} /> Validar Identidad
                    </button>
                  )}
               </div>
               
               <Dumbbell size={150} className="absolute -bottom-10 -left-10 text-white/5 -rotate-12" />
            </div>

            {/* Form Section */}
            <div className="md:w-7/12 p-12 overflow-y-auto bg-white custom-scrollbar">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Ficha de Inscripción</h2>
                <button onClick={() => { setIsModalOpen(false); stopCamera(); resetForm(); }} className="p-4 hover:bg-gray-100 rounded-3xl transition-all"><X size={28}/></button>
              </div>
              
              <form onSubmit={handleAddMember} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre del Socio</label>
                    <input 
                      type="text" required
                      className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-orange-500 outline-none font-bold transition-all"
                      value={newMember.nombre}
                      onChange={(e) => setNewMember({...newMember, nombre: e.target.value})}
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Correo Electrónico</label>
                    <input 
                      type="email" required
                      className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-orange-500 outline-none font-bold transition-all"
                      value={newMember.email}
                      onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                      placeholder="email@ejemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">WhatsApp (Con Lada)</label>
                    <input 
                      type="text"
                      className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-orange-500 outline-none font-bold transition-all"
                      value={newMember.telefono}
                      onChange={(e) => setNewMember({...newMember, telefono: e.target.value})}
                      placeholder="52155..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selección de Plan</label>
                    <select 
                      className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-orange-500 outline-none font-bold transition-all cursor-pointer"
                      value={newMember.plan}
                      onChange={(e) => setNewMember({...newMember, plan: e.target.value})}
                    >
                      <option value="1">Plan Básico (Mensual)</option>
                      <option value="2">Plan Premium (Trimestral)</option>
                      <option value="3">Plan Anual (VIP)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Meta de Entrenamiento</label>
                  <select 
                    className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-orange-500 outline-none font-bold transition-all"
                    value={newMember.objetivo}
                    onChange={(e) => setNewMember({...newMember, objetivo: e.target.value})}
                  >
                    <option>Pérdida de peso</option>
                    <option>Ganancia muscular</option>
                    <option>Resistencia / Cardio</option>
                    <option>Mantenimiento</option>
                    <option>Preparación Competencia</option>
                  </select>
                </div>

                <div className="p-8 bg-orange-50 rounded-[40px] border border-orange-100 space-y-6">
                   <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-2">
                     <ShieldAlert size={16}/> Información de Respaldo
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <input 
                        placeholder="Nombre de contacto"
                        className="w-full p-4 bg-white border-none rounded-2xl outline-none font-bold shadow-sm"
                        value={newMember.contactoEmergencia}
                        onChange={(e) => setNewMember({...newMember, contactoEmergencia: e.target.value})}
                      />
                      <input 
                        placeholder="Teléfono de contacto"
                        className="w-full p-4 bg-white border-none rounded-2xl outline-none font-bold shadow-sm"
                        value={newMember.telefonoEmergencia}
                        onChange={(e) => setNewMember({...newMember, telefonoEmergencia: e.target.value})}
                      />
                   </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-6 bg-gray-900 text-white rounded-3xl font-black text-lg uppercase tracking-widest hover:bg-black shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] transition-all transform active:scale-95 flex items-center justify-center gap-4"
                >
                  Finalizar Alta de Socio <ChevronRight size={24}/>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersList;
