
import React from 'react';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Trash2, 
  ChevronRight,
  MessageSquare,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NotificationLog } from '../types';

interface NotificationDropdownProps {
  notifications: NotificationLog[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onViewAll: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ 
  notifications, 
  onMarkAsRead, 
  onClearAll, 
  onViewAll,
  isOpen,
  onClose
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop to close */}
          <div className="fixed inset-0 z-[60]" onClick={onClose} />
          
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-4 w-[400px] bg-white rounded-[32px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-[70]"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500 text-white rounded-xl">
                  <Bell size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Notificaciones</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {unreadCount} sin leer
                  </p>
                </div>
              </div>
              <button 
                onClick={onClearAll}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Limpiar todo"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-12 text-center space-y-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                    <CheckCircle size={24} />
                  </div>
                  <p className="text-gray-400 text-xs font-bold">Todo al día. No hay notificaciones.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => onMarkAsRead(n.id)}
                      className={`p-5 flex gap-4 hover:bg-gray-50 transition-colors cursor-pointer relative group ${!n.read ? 'bg-orange-50/30' : ''}`}
                    >
                      {!n.read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" />
                      )}
                      
                      <div className={`mt-1 p-2 rounded-xl shrink-0 ${
                        n.status === 'sent' ? 'bg-green-100 text-green-600' :
                        n.status === 'failed' ? 'bg-red-100 text-red-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {n.status === 'sent' ? <CheckCircle size={16} /> :
                         n.status === 'failed' ? <Zap size={16} /> :
                         <MessageSquare size={16} />}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className={`text-xs font-black ${!n.read ? 'text-gray-900' : 'text-gray-500'}`}>
                            {n.tipo}
                          </h4>
                          <span className="text-[9px] font-bold text-gray-400 flex items-center gap-1">
                            <Clock size={10} /> {n.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">
                          {n.mensaje}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <button 
              onClick={onViewAll}
              className="w-full p-4 bg-gray-50 hover:bg-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center justify-center gap-2 transition-all"
            >
              Ver todas las notificaciones <ChevronRight size={14} />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;
