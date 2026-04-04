
import React, { useState } from 'react';
import { Dumbbell, Lock, Mail, ChevronRight, Loader2, AlertCircle, Smartphone } from 'lucide-react';
import { login } from '../services/apiService';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await login({ email, password });
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top duration-700">
          <div className="inline-flex p-1 bg-gradient-to-br from-emerald-500 to-emerald-800 rounded-[32px] shadow-2xl shadow-emerald-900/40 mb-6 active:scale-95 transition-transform overflow-hidden w-28 h-28 items-center justify-center border border-white/10">
            <img src="/pwa-icon.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2 italic">
            AURUM<span className="text-emerald-500">FIT</span>
          </h1>
          <p className="text-emerald-500/80 font-bold uppercase tracking-[0.2em] text-[10px]">Elite Fitness Management</p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[48px] shadow-2xl animate-in fade-in zoom-in duration-500">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Email o Teléfono</label>
              <div className="relative group">
                {email.includes('@') ? (
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                ) : (
                  <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                )}
                <input 
                  type="text" 
                  required
                  placeholder="admin@aurumfit.mx o 442..."
                  className="w-full pl-14 pr-6 py-5 bg-white/5 border-2 border-transparent rounded-[24px] text-white font-bold outline-none focus:border-emerald-500 focus:bg-white/10 transition-all placeholder:text-gray-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full pl-14 pr-6 py-5 bg-white/5 border-2 border-transparent rounded-[24px] text-white font-bold outline-none focus:border-emerald-500 focus:bg-white/10 transition-all placeholder:text-gray-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 animate-in shake duration-300">
                <AlertCircle size={20} />
                <p className="text-xs font-bold">{error}</p>
              </div>
            )}

            <button 
              disabled={isLoading}
              className="w-full py-5 bg-emerald-600 text-white rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-700 shadow-xl shadow-emerald-900/40 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 border border-white/5"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>Acceder al Panel <ChevronRight size={20} /></>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-[11px] text-gray-500 font-medium tracking-wide">
            ¿Olvidaste tu acceso?{' '}
            <a 
              href="https://wa.me/524424000742" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-emerald-500 cursor-pointer hover:underline font-black"
            >
              Contactar soporte
            </a>
          </p>
        </div>
        
        <div className="mt-10 text-center">
          <a 
            href="https://aurumcapital.mx" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] hover:text-emerald-500 transition-colors cursor-pointer"
          >
            v3.2.0 • ELITE EDITION • POWERED BY AURUM CAPITAL
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
