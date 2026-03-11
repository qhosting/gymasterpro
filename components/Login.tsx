
import React, { useState } from 'react';
import { Dumbbell, Lock, Mail, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
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
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top duration-700">
          <div className="inline-flex p-4 bg-orange-500 rounded-[24px] shadow-2xl shadow-orange-500/20 mb-6 active:scale-95 transition-transform">
            <Dumbbell size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
            GymMaster<span className="text-orange-500">PRO</span>
          </h1>
          <p className="text-gray-400 font-medium">Gestión inteligente para tu gimnasio</p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[48px] shadow-2xl animate-in fade-in zoom-in duration-500">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Email Corporativo</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input 
                  type="email" 
                  required
                  placeholder="admin@gymmaster.com"
                  className="w-full pl-14 pr-6 py-5 bg-white/5 border-2 border-transparent rounded-[24px] text-white font-bold outline-none focus:border-orange-500 focus:bg-white/10 transition-all placeholder:text-gray-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full pl-14 pr-6 py-5 bg-white/5 border-2 border-transparent rounded-[24px] text-white font-bold outline-none focus:border-orange-500 focus:bg-white/10 transition-all placeholder:text-gray-600"
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
              className="w-full py-5 bg-orange-500 text-white rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-orange-600 shadow-xl shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>Acceder al Panel <ChevronRight size={20} /></>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-[11px] text-gray-500 font-medium">
            ¿Olvidaste tu acceso? <span className="text-orange-500 cursor-pointer hover:underline">Contactar soporte</span>
          </p>
        </div>
        
        <div className="mt-10 text-center">
          <a 
            href="https://aurumcapital.mx" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] hover:text-orange-500 transition-colors cursor-pointer"
          >
            v3.0.1 ALPHA • POWERED BY AURUM CAPITAL
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
