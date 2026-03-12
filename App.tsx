
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
  ChevronRight,
  Loader2,
  WifiOff
} from 'lucide-react';
import NotificationDropdown from './components/NotificationDropdown';
import { Apple, User as UserIcon } from 'lucide-react';
import { UserRole, User, Member, MembershipStatus, NotificationLog } from './types';
import { GYM_PLANS } from './constants';
import Dashboard from './components/Dashboard';
import MembersList from './components/MembersList';
import AttendanceTracker from './components/AttendanceTracker';
import FinanceView from './components/FinanceView';
import NotificationsView from './components/NotificationsView';
import SettingsView from './components/SettingsView';
import NutritionView from './components/NutritionView';
import TrainingView from './components/TrainingView';
import MemberProfile from './components/MemberProfile';
import Login from './components/Login';
import { fetchMembers, getMe, logout, fetchNotifications, fetchSystemSettings } from './services/apiService';
import { SystemSettings as SystemSettingsType } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [members, setMembers] = useState<Member[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [systemSettings, setSystemSettings] = useState<SystemSettingsType | null>(null);

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

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('gym-token');
      if (token) {
        try {
          const user = await getMe();
          setCurrentUser(user);
          setIsAuthenticated(true);
        } catch (error) {
          logout();
        }
      }
      setIsLoadingAuth(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const loadData = async () => {
        try {
          const data = await fetchMembers();
          if (data) {
            setMembers(data);
          }
          const notifs = await fetchNotifications();
          setNotifications(notifs);
        } catch (error) {
          console.error("Error loading data from DB:", error);
        }
      };
      loadData();
    }
  }, [isAuthenticated]);

  const loadSystemSettings = async () => {
    try {
      const data = await fetchSystemSettings();
      if (data) {
        setSystemSettings(data);
        // Apply Theme
        if (data.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        if (data.primaryColor) {
          document.documentElement.style.setProperty('--primary-color', data.primaryColor);
          // Simple logic for hover (darken by 10% approx)
          document.documentElement.style.setProperty('--primary-color-hover', data.primaryColor + 'cc'); 
          document.documentElement.style.setProperty('--primary-color-shadow', data.primaryColor + '33');
        }
      }
    } catch (error) {
      console.error("Error loading system settings:", error);
    }
  };

  useEffect(() => {
    loadSystemSettings();
  }, [isAuthenticated]);

  // Filter menu items by role
  const menuItems = [
    { id: 'dashboard', label: 'Panel Control', icon: LayoutDashboard, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSTRUCTOR] },
    { id: 'members', label: 'Miembros', icon: Users, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSTRUCTOR] },
    { id: 'attendance', label: 'Asistencia', icon: CalendarCheck, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSTRUCTOR] },
    { id: 'training', label: 'Entrenamiento', icon: Dumbbell, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.MIEMBRO] },
    { id: 'nutrition', label: 'Nutrición', icon: Apple, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.NUTRIOLOGO, UserRole.MIEMBRO] },
    { id: 'profile', label: 'Mi Perfil', icon: UserIcon, roles: [UserRole.MIEMBRO] },
    { id: 'finance', label: 'Pagos / Planes', icon: CreditCard, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
    { id: 'notifications', label: 'Notificaciones', icon: Bell, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MIEMBRO, UserRole.INSTRUCTOR] },
    { id: 'settings', label: 'Configuración', icon: Settings, roles: [UserRole.SUPER_ADMIN] },
  ].filter(item => item.roles.includes(currentUser?.role || UserRole.MIEMBRO));

  const renderContent = () => {
    if (!currentUser) return null;
    switch (activeTab) {
      case 'dashboard': return <Dashboard members={members} currentUser={currentUser} />;
      case 'members': return <MembersList members={members} setMembers={setMembers} />;
      case 'attendance': return <AttendanceTracker members={members} />;
      case 'training': return <TrainingView members={members} currentUser={currentUser} />;
      case 'nutrition': return <NutritionView members={members} currentUser={currentUser} />;
      case 'profile': return <MemberProfile currentUser={currentUser} members={members} />;
      case 'finance': return <FinanceView members={members} setMembers={setMembers} />;
      case 'notifications': return <NotificationsView members={members} notifications={notifications} setNotifications={setNotifications} />;
      case 'settings': return <SettingsView currentUser={currentUser} onSettingsUpdate={loadSystemSettings} />;
      default: return <Dashboard members={members} currentUser={currentUser} />;
    }
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleLogoutWrapper = () => {
    handleLogout();
  };

  if (isLoadingAuth) {
    return (
      <div className="h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="text-orange-500 animate-spin" size={48} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={(user) => {
      setCurrentUser(user);
      setIsAuthenticated(true);
    }} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Drawer on mobile, permanent on desktop) */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-[70] 
        bg-gray-900 text-white transition-all duration-500 transform
        ${isSidebarOpen ? 'translate-x-0 w-72 lg:w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'} 
        flex flex-col shadow-2xl
      `}>
        <div className="p-6 flex items-center gap-3">
          <div className="bg-orange-500 w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
            <img src="/pwa-icon.png" alt="Logo" className="w-full h-full object-cover scale-110" />
          </div>
          {isSidebarOpen && <span className="font-black text-xl tracking-tight">GymMaster<span className="text-orange-500">PRO</span></span>}
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2 custom-scrollbar overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                activeTab === item.id ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon size={22} />
              <span className={`font-bold text-sm tracking-wide ${!isSidebarOpen && 'lg:hidden'}`}>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Role Switcher (For Demo Purposes) */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/50">
          <div className="mb-4">
             {isSidebarOpen && <p className="text-[10px] text-gray-500 mb-2 px-2 uppercase font-black tracking-widest">Simular Perfil</p>}
             <select 
               className="bg-gray-800 text-white text-[11px] w-full p-2.5 rounded-xl border-none outline-none font-bold cursor-pointer hover:bg-gray-700 transition-colors"
               value={currentUser?.role || UserRole.MIEMBRO}
               onChange={(e) => {
                 const newRole = e.target.value as UserRole;
                 if (currentUser) {
                   let updatedUser = { ...currentUser, role: newRole };
                   if (newRole === UserRole.MIEMBRO && members.length > 0) {
                     updatedUser.id = members[0].id;
                     updatedUser.nombre = members[0].nombre;
                   }
                   setCurrentUser(updatedUser);
                 }
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


          {isOffline && (
            <div className={`mx-2 mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 animate-pulse ${!isSidebarOpen && 'justify-center'}`}>
              <div className="p-2 bg-rose-500 text-white rounded-xl">
                <WifiOff size={16} />
              </div>
              {isSidebarOpen && (
                <div>
                  <p className="text-[10px] font-black uppercase text-rose-400 tracking-widest">Modo Offline</p>
                  <p className="text-[8px] text-rose-300 font-medium leading-tight">Datos locales activos</p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-gray-800 cursor-pointer transition-all group">
            <div className="relative">
              <img src={currentUser.foto} alt="profile" className="w-10 h-10 rounded-xl object-cover border-2 border-orange-500 shadow-lg" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
            </div>
            {isSidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="font-bold text-[13px] truncate text-white">{currentUser?.nombre}</p>
                <p className="text-[10px] text-orange-500 font-black uppercase tracking-tighter truncate">{currentUser?.role.replace('_', ' ')}</p>
              </div>
            )}
            {isSidebarOpen && <LogOut size={18} onClick={handleLogoutWrapper} className="text-gray-500 group-hover:text-red-400 transition-colors" />}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-20 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 text-gray-500 hover:bg-gray-50 rounded-2xl transition-all active:scale-95 border border-transparent hover:border-gray-100">
              <Menu size={22} />
            </button>
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
              <ShieldCheck size={18} className="text-green-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Servidor Seguro</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-6">
            <button 
               onClick={handleLogoutWrapper}
               className="lg:hidden p-3 text-gray-400 hover:text-red-500 transition-colors"
            >
               <LogOut size={20} />
            </button>
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
                <p className="text-[10px] text-gray-400 font-bold mt-1">ID: {currentUser?.id}</p>
              </div>
              <button 
                onClick={handleLogoutWrapper}
                className="p-3 bg-gray-900 text-white rounded-2xl hover:bg-black shadow-lg shadow-gray-900/10 active:scale-95 transition-all"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar pb-24 lg:pb-10">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>

        {/* Bottom Mobile Navigation */}
        <div className="lg:hidden fixed bottom-6 left-6 right-6 bg-gray-900/95 backdrop-blur-md rounded-[32px] p-2 flex justify-around items-center z-[50] shadow-2xl border border-white/10">
           {menuItems.slice(0, 5).map(item => (
             <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${
                activeTab === item.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-400'
              }`}
             >
               <item.icon size={20} className={activeTab === item.id ? 'scale-110' : ''} />
               <span className="text-[7px] font-black uppercase tracking-widest">{item.label.split(' ')[0]}</span>
             </button>
           ))}
        </div>
      </main>
    </div>
  );
};

export default App;
