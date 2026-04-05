import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, Edit2, Trash2, ShieldCheck, 
  UserCircle, Star, Phone, Mail, Filter, X, Save, 
  MapPin, Loader2, Award, Heart, CheckCircle2, Building2
} from 'lucide-react';
import { User, UserRole } from '../types';
import { fetchStaff, createStaff, updateStaff, deleteStaff, uploadFile } from '../services/apiService';

const StaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'todos' | UserRole>('todos');
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    role: UserRole.INSTRUCTOR,
    foto: '',
    password: '',
    isPublic: true,
    especialidad: '',
    biografia: ''
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const data = await fetchStaff();
      setStaff(data);
    } catch (error) {
      console.error("Error loading staff:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member: User) => {
    setIsEditMode(true);
    setSelectedStaff(member);
    setFormData({
        nombre: member.nombre,
        email: member.email,
        telefono: member.telefono || '',
        role: member.role,
        foto: member.foto || '',
        password: '',
        isPublic: member.isPublic ?? true,
        especialidad: member.especialidad || '',
        biografia: member.biografia || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
      if (!window.confirm('¿Estás seguro de eliminar este miembro del personal?')) return;
      try {
          await deleteStaff(id);
          setStaff(staff.filter(s => s.id !== id));
      } catch (error) {
          alert('Error al eliminar');
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      try {
          if (isEditMode && selectedStaff) {
              const updated = await updateStaff(selectedStaff.id, formData);
              setStaff(staff.map(s => s.id === selectedStaff.id ? updated : s));
          } else {
              const created = await createStaff(formData);
              setStaff([...staff.filter(s => s.id !== created.id), created]);
          }
          setIsModalOpen(false);
      } catch (error: any) {
          alert(error.message || 'Error al guardar personal');
      } finally {
          setSaving(false);
      }
  };

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'todos' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
      return (
          <div className="h-96 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="animate-spin text-orange-500" size={48} />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Cargando Personal...</p>
          </div>
      );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Gestión de <span className="text-orange-500">Personal</span></h1>
          <p className="text-gray-400 font-medium">Administra tu equipo de instructores, nutriólogos y coordinadores.</p>
        </div>
        <button 
          onClick={() => {
            setIsEditMode(false);
            setFormData({ 
              nombre: '', email: '', telefono: '', role: UserRole.INSTRUCTOR, 
              foto: '', password: '', isPublic: true, especialidad: '', biografia: '' 
            });
            setIsModalOpen(true);
          }}
          className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black flex items-center gap-3 hover:bg-black transition-all active:scale-95 shadow-xl shadow-gray-900/20"
        >
          <UserPlus size={20} />
          Alta de Personal
        </button>
      </div>

      <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-6 items-center">
        <div className="flex-1 relative w-full group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, email..." 
            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[24px] focus:border-orange-500 focus:bg-white outline-none transition-all text-sm font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-[22px] w-full lg:w-auto overflow-x-auto no-scrollbar">
          {(['todos', UserRole.INSTRUCTOR, UserRole.NUTRIOLOGO, UserRole.ADMIN] as const).map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-6 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                roleFilter === role ? 'bg-white text-orange-600 shadow-lg' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {role === 'todos' ? 'Todo el Equipo' : role}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStaff.map((person) => (
          <div key={person.id} className="bg-white rounded-[40px] p-6 border border-gray-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col items-center">
             <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button onClick={() => handleEdit(person)} className="p-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm text-gray-600 hover:text-orange-500 transition-all active:scale-90 border border-gray-100"><Edit2 size={16}/></button>
                <button onClick={() => handleDelete(person.id)} className="p-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm text-gray-600 hover:text-red-500 transition-all active:scale-90 border border-gray-100"><Trash2 size={16}/></button>
             </div>

             <div className="relative mt-4">
                <div className="w-32 h-32 rounded-[45px] overflow-hidden border-4 border-gray-50 shadow-xl relative transition-transform group-hover:scale-105 duration-500">
                    <img src={person.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.nombre)}&background=random&color=fff`} className="w-full h-full object-cover" alt={person.nombre} />
                </div>
                <div className={`absolute -bottom-2 -right-2 p-2 rounded-xl shadow-lg ${
                    person.role === UserRole.ADMIN ? 'bg-indigo-600' : 
                    person.role === UserRole.INSTRUCTOR ? 'bg-orange-600' : 'bg-emerald-600'
                } text-white`}>
                    {person.role === UserRole.ADMIN ? <ShieldCheck size={20}/> : 
                     person.role === UserRole.INSTRUCTOR ? <Award size={20}/> : <Heart size={20}/>}
                </div>
             </div>

             <div className="mt-6 text-center space-y-1">
                <h3 className="text-xl font-black tracking-tight text-gray-900 leading-tight">{person.nombre}</h3>
                <p className={`text-[10px] font-black uppercase tracking-widest ${
                    person.role === UserRole.ADMIN ? 'text-indigo-600' : 
                    person.role === UserRole.INSTRUCTOR ? 'text-orange-600' : 'text-emerald-600'
                }`}>
                    {person.role.replace('_', ' ')}
                </p>
             </div>

             <div className="mt-6 w-full space-y-2">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <Mail size={14} className="text-gray-400" />
                    <p className="text-xs font-bold text-gray-600 truncate">{person.email}</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <Phone size={14} className="text-gray-400" />
                    <p className="text-xs font-bold text-gray-600">{person.telefono || 'Sin teléfono'}</p>
                </div>
             </div>

             <div className="mt-8 pt-6 border-t border-gray-50 w-full flex justify-center gap-6">
                <div className="text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Activo</p>
                    <CheckCircle2 size={18} className="mx-auto mt-1 text-emerald-500" />
                </div>
             </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300 p-4">
            <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">{isEditMode ? 'Editar Personal' : 'Alta de Personal'}</h2>
                    <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white hover:bg-gray-100 rounded-2xl transition-all shadow-sm"><X size={24}/></button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col items-center space-y-4 mb-4">
                        <div className="w-24 h-24 rounded-[32px] bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-200 relative group cursor-pointer">
                            {formData.foto ? <img src={formData.foto} className="w-full h-full object-cover" /> : <UserCircle size={40} className="text-gray-300" />}
                            <input 
                                type="file" 
                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                onChange={async (e) => {
                                    if(e.target.files?.[0]) {
                                        const file = await uploadFile(e.target.files[0]);
                                        setFormData({...formData, foto: file.url});
                                    }
                                }}
                            />
                        </div>
                        <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Click para subir foto</p>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                                <input 
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-orange-500 focus:bg-white outline-none font-bold transition-all"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                    placeholder="Ej: Coach Alex"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Rol en el Gimnasio</label>
                                <select 
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-orange-500 focus:bg-white outline-none font-bold transition-all"
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                                >
                                    <option value={UserRole.INSTRUCTOR}>Instructor / Coach</option>
                                    <option value={UserRole.NUTRIOLOGO}>Nutriólogo</option>
                                    <option value={UserRole.ADMIN}>Administrador</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                            <input 
                                type="email"
                                className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-orange-500 focus:bg-white outline-none font-bold transition-all"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                placeholder="coach@aurumfit.com"
                                required
                                disabled={isEditMode}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Teléfono</label>
                                <input 
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-orange-500 focus:bg-white outline-none font-bold transition-all"
                                    value={formData.telefono}
                                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                                    placeholder="5212345678"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{isEditMode ? 'Pin de Acceso (Opcional)' : 'Pin de Acceso'}</label>
                                <input 
                                    type="password"
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-orange-500 focus:bg-white outline-none font-bold transition-all"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    placeholder={isEditMode ? '••••••' : 'Min. 6 caracteres'}
                                    required={!isEditMode}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-50">
                        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl">
                           <div>
                              <p className="text-xs font-black text-gray-900 uppercase">Perfil Público</p>
                              <p className="text-[10px] text-gray-400 font-bold">Visible en el buscador global de coaches</p>
                           </div>
                           <label className="relative inline-flex items-center cursor-pointer">
                             <input 
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.isPublic}
                                onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                             />
                             <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                           </label>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Especialidad</label>
                            <input 
                                className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-orange-500 focus:bg-white outline-none font-bold transition-all"
                                value={formData.especialidad}
                                onChange={(e) => setFormData({...formData, especialidad: e.target.value})}
                                placeholder="Ej: Hipertrofia, Yoga Vinyasa..."
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Biografía / Perfil</label>
                            <textarea 
                                className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-orange-500 focus:bg-white outline-none font-bold transition-all min-h-[100px]"
                                value={formData.biografia}
                                onChange={(e) => setFormData({...formData, biografia: e.target.value})}
                                placeholder="Cuenta un poco sobre tu experiencia y certificaciones..."
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={saving}
                        className="w-full py-5 bg-gray-900 text-white rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-gray-900/10 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" /> : <><Save size={20}/> {isEditMode ? 'Guardar Cambios' : 'Confirmar Alta'}</>}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
