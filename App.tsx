
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  CalendarCheck, 
  Bell, 
  LogOut, 
  Menu,
  ShieldCheck,
  Dumbbell,
  Settings,
  ChevronRight
} from 'lucide-react';
import NotificationDropdown from './components/NotificationDropdown';
import { Apple, User as UserIcon } from 'lucide-react';
import { UserRole, User, Member, MembershipStatus, NotificationLog } from './types';
import { MOCK_MEMBERS, GYM_PLANS } from './constants';
import Dashboard from './components/Dashboard';
import MembersList from './components/MembersList';
import AttendanceTracker from './components/AttendanceTracker';
import FinanceView from './components/FinanceView';
import NotificationsView from './components/NotificationsView';
import SettingsView from './components/SettingsView';
import NutritionView from './components/NutritionView';
import MemberProfile from './components/MemberProfile';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'admin-1',
    nombre: 'Super Admin',
    email: 'admin@gymmaster.com',
    role: UserRole.SUPER_ADMIN,
    foto: 'https://picsum.photos/seed/admin/100/100'
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationLog[]>([
    {
      id: '1',
      memberId: 'm1',
      tipo: 'Membresía por Vencer',
      mensaje: 'El socio Juan Pérez tiene su membresía por vencer en 3 días.',
      timestamp: 'Hace 5 min',
      status: 'sent',
      read: false
    },
    {
      id: '2',
      memberId: 'm2',
      tipo: 'Pago Recibido',
      mensaje: 'Se ha registrado un pago de $500 de Maria García.',
      timestamp: 'Hace 2 horas',
      status: 'sent',
      read: false
    },
    {
      id: '3',
      memberId: 'm3',
      tipo: 'Nueva Cita Nutricional',
      mensaje: 'Carlos Ruiz ha agendado una cita para mañana a las 10:00 AM.',
      timestamp: 'Hace 4 horas',
      status: 'sent',
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleViewAll = () => {
    setActiveTab('notifications');
    setIsNotificationOpen(false);
  };

  // Filter menu items by role
  const menuItems = [
    { id: 'dashboard', label: 'Panel Control', icon: LayoutDashboard, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSTRUCTOR] },
    { id: 'members', label: 'Miembros', icon: Users, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSTRUCTOR] },
    { id: 'attendance', label: 'Asistencia', icon: CalendarCheck, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSTRUCTOR] },
    { id: 'nutrition', label: 'Nutrición', icon: Apple, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.NUTRIOLOGO, UserRole.MIEMBRO] },
    { id: 'profile', label: 'Mi Perfil', icon: UserIcon, roles: [UserRole.MIEMBRO] },
    { id: 'finance', label: 'Pagos / Planes', icon: CreditCard, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
    { id: 'notifications', label: 'Notificaciones', icon: Bell, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MIEMBRO, UserRole.INSTRUCTOR] },
    { id: 'settings', label: 'Configuración', icon: Settings, roles: [UserRole.SUPER_ADMIN] },
  ].filter(item => item.roles.includes(currentUser.role));

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard members={members} currentUser={currentUser} />;
      case 'members': return <MembersList members={members} setMembers={setMembers} />;
      case 'attendance': return <AttendanceTracker members={members} />;
      case 'nutrition': return <NutritionView members={members} currentUser={currentUser} />;
      case 'profile': return <MemberProfile currentUser={currentUser} members={members} />;
      case 'finance': return <FinanceView members={members} />;
      case 'notifications': return <NotificationsView members={members} notifications={notifications} setNotifications={setNotifications} />;
      case 'settings': return <SettingsView currentUser={currentUser} />;
      default: return <Dashboard members={members} currentUser={currentUser} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-gray-900 text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col shadow-2xl z-50`}>
        <div className="p-6 flex items-center gap-3">
          <div className="bg-orange-500 p-2 rounded-xl">
            <Dumbbell size={24} className="text-white" />
          </div>
          {isSidebarOpen && <span className="font-black text-xl tracking-tight">GymMaster<span className="text-orange-500">PRO</span></span>}
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all ${
                activeTab === item.id ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon size={22} />
              {isSidebarOpen && <span className="font-bold text-sm tracking-wide">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Role Switcher (For Demo Purposes) */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/50">
          <div className="mb-4">
             {isSidebarOpen && <p className="text-[10px] text-gray-500 mb-2 px-2 uppercase font-black tracking-widest">Simular Perfil</p>}
             <select 
               className="bg-gray-800 text-white text-[11px] w-full p-2.5 rounded-xl border-none outline-none font-bold cursor-pointer hover:bg-gray-700 transition-colors"
               value={currentUser.role}
               onChange={(e) => {
                 const newRole = e.target.value as UserRole;
                 setCurrentUser({...currentUser, role: newRole});
                 // Reset tab if current not allowed for new role
                 if (newRole === UserRole.MIEMBRO) {
                   setActiveTab('profile');
                 } else if (['finance', 'settings', 'dashboard'].includes(activeTab)) {
                   setActiveTab('dashboard');
                 }
               }}
             >
                <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                <option value={UserRole.ADMIN}>Admin</option>
                <option value={UserRole.INSTRUCTOR}>Instructor</option>
                <option value={UserRole.NUTRIOLOGO}>Nutriólogo</option>
                <option value={UserRole.MIEMBRO}>Miembro</option>
             </select>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-gray-800 cursor-pointer transition-all group">
            <div className="relative">
              <img src={currentUser.foto} alt="profile" className="w-10 h-10 rounded-xl object-cover border-2 border-orange-500 shadow-lg" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
            </div>
            {isSidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="font-bold text-[13px] truncate text-white">{currentUser.nombre}</p>
                <p className="text-[10px] text-orange-500 font-black uppercase tracking-tighter truncate">{currentUser.role.replace('_', ' ')}</p>
              </div>
            )}
            {isSidebarOpen && <LogOut size={18} className="text-gray-500 group-hover:text-red-400 transition-colors" />}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-20 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 text-gray-500 hover:bg-gray-50 rounded-2xl transition-all active:scale-95 border border-transparent hover:border-gray-100">
              <Menu size={22} />
            </button>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
              <ShieldCheck size={18} className="text-green-500" />
              <span className="text-[11px] font-black uppercase tracking-widest text-gray-600">Servidor: Online</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className={`p-3 rounded-2xl transition-all border border-transparent active:scale-95 ${
                  isNotificationOpen ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-gray-50 text-gray-400 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-100'
                }`}
              >
                <Bell size={22} className={unreadCount > 0 && !isNotificationOpen ? 'animate-bounce' : ''} />
              </button>
              
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white">
                  {unreadCount}
                </span>
              )}

              <NotificationDropdown 
                notifications={notifications}
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                onMarkAsRead={handleMarkAsRead}
                onClearAll={handleClearAll}
                onViewAll={handleViewAll}
              />
            </div>
            
            <div className="h-10 w-[1px] bg-gray-100"></div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-gray-900 leading-none">Cerrar Sesión</p>
                <p className="text-[10px] text-gray-400 font-bold mt-1">ID: {currentUser.id}</p>
              </div>
              <button className="p-3 bg-gray-900 text-white rounded-2xl hover:bg-black shadow-lg shadow-gray-900/10 active:scale-95 transition-all">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
