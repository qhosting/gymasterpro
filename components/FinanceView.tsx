
import React, { useState } from 'react';
import { 
  CreditCard, Download, ArrowUpRight, ArrowDownRight, DollarSign, 
  Plus, Search, Filter, Calendar, Tag, User, Receipt, 
  Trash2, Edit3, CheckCircle, Clock, X, Wallet, ChevronRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Member, MembershipStatus, Plan, Transaction } from '../types';
import { GYM_PLANS, MOCK_TRANSACTIONS } from '../constants';

interface FinanceViewProps {
  members: Member[];
}

const FinanceView: React.FC<FinanceViewProps> = ({ members }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'plans'>('overview');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [plans, setPlans] = useState<Plan[]>(GYM_PLANS);
  
  // Payment Form State
  const [paymentData, setPaymentData] = useState({
    memberId: '',
    amount: 0,
    method: 'Efectivo' as Transaction['metodo'],
    type: 'Mensualidad' as Transaction['tipo']
  });

  const totalRecaudado = transactions
    .filter(t => t.status === 'Completado')
    .reduce((acc, t) => acc + t.monto, 0);
  
  const totalPendiente = members.reduce((acc, m) => acc + m.deuda, 0);

  const revenueData = [
    { name: 'Ene', income: 12500 },
    { name: 'Feb', income: 15800 },
    { name: 'Mar', income: 14200 },
    { name: 'Abr', income: 19500 },
    { name: 'May', income: totalRecaudado },
  ];

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const newTx: Transaction = {
      id: `t${Date.now()}`,
      memberId: paymentData.memberId,
      monto: paymentData.amount,
      fecha: new Date().toISOString().split('T')[0],
      metodo: paymentData.method,
      tipo: paymentData.type,
      status: 'Completado'
    };
    setTransactions([newTx, ...transactions]);
    setIsPaymentModalOpen(false);
    // Reset form
    setPaymentData({ memberId: '', amount: 0, method: 'Efectivo', type: 'Mensualidad' });
  };

  const getMemberName = (id: string) => members.find(m => m.id === id)?.nombre || 'Socio Externo';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header & Quick Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Finanzas & Membresías</h1>
          <p className="text-gray-500">Control total de ingresos, planes y flujo de caja.</p>
        </div>
        <button 
          onClick={() => setIsPaymentModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-orange-500/20"
        >
          <Wallet size={20} />
          Cobro Rápido (TPV)
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-1 bg-gray-100 p-1.5 rounded-2xl w-fit">
        {(['overview', 'transactions', 'plans'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === tab ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab === 'overview' ? 'Resumen' : tab === 'transactions' ? 'Transacciones' : 'Planes de Socios'}
          </button>
        ))}
      </div>

      {/* Main View: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm group hover:border-orange-200 transition-all">
               <div className="flex justify-between items-start mb-4">
                  <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600"><ArrowUpRight size={24}/></div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12% vs mes anterior</span>
               </div>
               <p className="text-sm font-medium text-gray-400">Ingresos Totales (May)</p>
               <h3 className="text-3xl font-black text-gray-900">${totalRecaudado.toLocaleString()}</h3>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
               <div className="flex justify-between items-start mb-4">
                  <div className="bg-rose-100 p-3 rounded-2xl text-rose-600"><ArrowDownRight size={24}/></div>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full">Requiere atención</span>
               </div>
               <p className="text-sm font-medium text-gray-400">Deuda por Cobrar</p>
               <h3 className="text-3xl font-black text-gray-900">${totalPendiente.toLocaleString()}</h3>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
               <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-100 p-3 rounded-2xl text-blue-600"><DollarSign size={24}/></div>
               </div>
               <p className="text-sm font-medium text-gray-400">Ticket Promedio</p>
               <h3 className="text-3xl font-black text-gray-900">$485.50</h3>
            </div>

            <div className="bg-gray-900 p-6 rounded-3xl shadow-xl text-white overflow-hidden relative">
               <div className="relative z-10">
                 <p className="text-sm font-medium text-gray-400">MRR Proyectado</p>
                 <h3 className="text-3xl font-black text-orange-500">$24,900</h3>
                 <p className="text-[10px] text-gray-500 mt-2">Basado en 42 socios activos</p>
               </div>
               <CreditCard size={100} className="absolute -bottom-6 -right-6 text-white/5 rotate-12" />
            </div>
          </div>

          {/* Chart & Recent */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold">Histórico de Ingresos</h3>
                <select className="bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none">
                  <option>Últimos 6 meses</option>
                  <option>Año 2024</option>
                </select>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                    />
                    <Area type="monotone" dataKey="income" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#colorIncome)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Últimos Pagos</h3>
                <button className="text-orange-500 hover:bg-orange-50 p-2 rounded-xl transition-colors"><ChevronRight/></button>
              </div>
              <div className="space-y-4">
                {transactions.slice(0, 5).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-100 p-2 rounded-xl text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                        <Tag size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold truncate max-w-[120px]">{getMemberName(tx.memberId)}</p>
                        <p className="text-[10px] text-gray-400">{tx.metodo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-green-600">+${tx.monto}</p>
                      <p className="text-[9px] text-gray-400">{tx.fecha}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main View: Transactions */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom duration-500">
          <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="relative flex-1 max-w-md">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
               <input 
                 type="text" 
                 placeholder="Buscar por socio, ID o método..."
                 className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500"
               />
             </div>
             <div className="flex gap-2">
               <button className="flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-bold hover:bg-gray-50">
                 <Filter size={16} /> Filtros
               </button>
               <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black">
                 <Download size={16} /> Exportar
               </button>
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <th className="px-8 py-4">Socio / ID</th>
                  <th className="px-8 py-4">Monto</th>
                  <th className="px-8 py-4">Fecha</th>
                  <th className="px-8 py-4">Método</th>
                  <th className="px-8 py-4">Tipo</th>
                  <th className="px-8 py-4">Estado</th>
                  <th className="px-8 py-4">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold">
                          {getMemberName(tx.memberId).charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{getMemberName(tx.memberId)}</p>
                          <p className="text-[10px] text-gray-400">#TX-{tx.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-black text-gray-900">${tx.monto}</td>
                    <td className="px-8 py-5 text-sm text-gray-500">{tx.fecha}</td>
                    <td className="px-8 py-5 text-sm text-gray-500">{tx.metodo}</td>
                    <td className="px-8 py-5 text-sm font-medium">{tx.tipo}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        tx.status === 'Completado' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                      }`}>{tx.status}</span>
                    </td>
                    <td className="px-8 py-5">
                       <button className="p-2 text-gray-400 hover:text-orange-500 transition-colors"><Receipt size={18}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main View: Plans */}
      {activeTab === 'plans' && (
        <div className="space-y-6 animate-in zoom-in-95 duration-500">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Catálogo de Planes</h3>
            <button className="text-orange-500 font-bold text-sm flex items-center gap-1 hover:underline">
               <Plus size={16}/> Crear Nuevo Plan
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map(plan => (
              <div key={plan.id} className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col group hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className={`absolute top-0 right-0 w-24 h-24 ${plan.color} opacity-10 rounded-bl-[80px]`}></div>
                <div className="mb-8">
                   <h4 className="text-2xl font-black text-gray-900 mb-2">{plan.nombre}</h4>
                   <div className="flex items-baseline gap-1">
                     <span className="text-4xl font-black text-orange-500">${plan.costo}</span>
                     <span className="text-gray-400 text-sm font-bold">/ {plan.duracionMeses} mes(es)</span>
                   </div>
                </div>
                <div className="flex-1 space-y-4 mb-8">
                  {plan.beneficios?.map((b, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                       <CheckCircle size={18} className="text-green-500" /> {b}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-colors">Editar</button>
                  <button className="p-3 border border-gray-200 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50"><Trash2 size={20}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Terminal Modal (TPV) */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="bg-orange-500 p-8 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black">Cobro Express</h2>
                <p className="opacity-80 text-sm font-medium">Registra un pago instantáneo de un socio.</p>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleProcessPayment} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Seleccionar Socio</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select 
                      required
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                      value={paymentData.memberId}
                      onChange={(e) => setPaymentData({...paymentData, memberId: e.target.value})}
                    >
                      <option value="">Buscar socio...</option>
                      {members.map(m => (
                        <option key={m.id} value={m.id}>{m.nombre} (Deuda: ${m.deuda})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Monto a Cobrar</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="number" required
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-black text-xl"
                        placeholder="0.00"
                        value={paymentData.amount || ''}
                        onChange={(e) => setPaymentData({...paymentData, amount: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Método</label>
                    <select 
                      className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                      value={paymentData.method}
                      onChange={(e) => setPaymentData({...paymentData, method: e.target.value as Transaction['metodo']})}
                    >
                      <option>Efectivo</option>
                      <option>Tarjeta</option>
                      <option>Transferencia</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Concepto</label>
                  <select 
                    className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                    value={paymentData.type}
                    onChange={(e) => setPaymentData({...paymentData, type: e.target.value as Transaction['tipo']})}
                  >
                    <option>Mensualidad</option>
                    <option>Inscripción</option>
                    <option>Producto</option>
                    <option>Otro</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-orange-500 text-white rounded-3xl font-black text-lg hover:bg-orange-600 shadow-2xl shadow-orange-500/30 transition-all transform active:scale-95 flex items-center justify-center gap-3"
              >
                <CheckCircle size={24} /> Confirmar Pago y Generar Recibo
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceView;
