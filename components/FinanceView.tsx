
import React, { useState } from 'react';
import { 
  CreditCard, Download, ArrowUpRight, ArrowDownRight, DollarSign, 
  Plus, Search, Filter, Calendar, Tag, User, Receipt, 
  Trash2, Edit3, CheckCircle, Clock, X, Wallet, ChevronRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Member, MembershipStatus, Plan, Transaction, NutritionAppointment } from '../types';
import { GYM_PLANS } from '../constants';
import { recordTransaction, fetchTransactions, fetchPlans, createPlan, updatePlan, deletePlan, fetchSystemSettings, processOpenpayPayment } from '../services/apiService';
import { generateReceiptPDF, generateFinanceReportPDF } from '../utils/pdfGenerator';
import { Loader2 } from 'lucide-react';

interface FinanceViewProps {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
}

const FinanceView: React.FC<FinanceViewProps> = ({ members, setMembers }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'plans'>('overview');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planForm, setPlanForm] = useState<Partial<Plan>>({
    nombre: '',
    costo: 0,
    duracionMeses: 1,
    beneficios: [],
    color: 'bg-orange-500'
  });

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [txData, plansData] = await Promise.all([
        fetchTransactions(),
        fetchPlans()
      ]);
      setTransactions(txData);
      setPlans(plansData);
    } catch (error) {
      console.error("Error loading finance data:", error);
    }
  };
  
  // Payment Form State
  const [paymentData, setPaymentData] = useState({
    memberId: '',
    amount: 0,
    method: 'Efectivo' as Transaction['metodo'],
    type: 'Mensualidad' as Transaction['tipo'],
    scheduleNutrition: false,
    nutritionDate: '',
    nutritionTime: ''
  });

  const [cardData, setCardData] = useState({
    holder: '',
    number: '',
    expiry: '',
    cvv: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const totalRecaudado = transactions
    .filter(t => t.status === 'Completado')
    .reduce((acc, t) => acc + t.monto, 0);
  
  const totalPendiente = members.reduce((acc, m) => acc + m.deuda, 0);

  const getMonthlyRevenue = () => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentMonth = new Date().getMonth();
    const data = [];
    
    // Last 5 months
    for (let i = 4; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        const monthName = months[monthIndex];
        const monthTotal = transactions
            .filter(t => {
                const tDate = new Date(t.fecha);
                return tDate.getMonth() === monthIndex && t.status === 'Completado';
            })
            .reduce((acc, t) => acc + t.monto, 0);
            
        data.push({ name: monthName, income: monthTotal });
    }
    return data;
  };

  const revenueData = getMonthlyRevenue();

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      
      let finalTx;

      if (paymentData.method === 'Openpay') {
        // Openpay Tokenization
        const settings = await fetchSystemSettings();
        if (!settings.openpayMerchantId || !settings.openpayPublicKey) {
          throw new Error('Openpay no está configurado en los ajustes del sistema.');
        }

        // @ts-ignore
        Openpay.setId(settings.openpayMerchantId);
        // @ts-ignore
        Openpay.setApiKey(settings.openpayPublicKey);
        // @ts-ignore
        Openpay.setSandboxMode(settings.openpaySandbox);

        const exp = cardData.expiry.split('/');
        const tokenRequest = {
          card_number: cardData.number.replace(/\s/g, ''),
          holder_name: cardData.holder,
          expiration_year: exp[1].length === 2 ? `20${exp[1]}` : exp[1],
          expiration_month: exp[0],
          cvv2: cardData.cvv
        };

        const tokenPromise = new Promise((resolve, reject) => {
          // @ts-ignore
          Openpay.token.create(tokenRequest, (res) => resolve(res.data.id), (err) => reject(new Error(err.data.description)));
        });

        const token = await tokenPromise;
        // @ts-ignore
        const deviceSessionId = Openpay.deviceData.setup();

        const openpayResponse = await processOpenpayPayment({
          token,
          deviceSessionId,
          amount: paymentData.amount,
          memberId: paymentData.memberId,
          description: `Pago de ${paymentData.type} - AurumFit`
        });

        finalTx = openpayResponse.transaction;
      } else {
        const transactionData = {
          memberId: paymentData.memberId,
          monto: paymentData.amount,
          metodo: paymentData.method,
          tipo: paymentData.type,
          status: 'Completado'
        };
        finalTx = await recordTransaction(transactionData);
      }

      setTransactions([finalTx, ...transactions]);
      
      // Update member debt locally
      if (paymentData.type === 'Mensualidad' || paymentData.type === 'Otro') {
        setMembers(members.map(m => 
          m.id === paymentData.memberId 
            ? { ...m, deuda: Math.max(0, m.deuda - paymentData.amount) } 
            : m
        ));
      }

      setIsPaymentModalOpen(false);
      alert('Pago procesado exitosamente');
    } catch (error: any) {
      console.error("Error processing payment:", error);
      alert('Error: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        const updated = await updatePlan(editingPlan.id, planForm);
        setPlans(plans.map(p => p.id === editingPlan.id ? updated : p));
      } else {
        const created = await createPlan(planForm);
        setPlans([...plans, created]);
      }
      setIsPlanModalOpen(false);
      setEditingPlan(null);
      setPlanForm({ nombre: '', costo: 0, duracionMeses: 1, beneficios: [], color: 'bg-orange-500' });
    } catch (error) {
      console.error("Error saving plan:", error);
      alert("Error al guardar el plan.");
    }
  };

  const handleDeletePlanLocal = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este plan?")) return;
    try {
      await deletePlan(id);
      setPlans(plans.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting plan:", error);
      alert("Error al eliminar el plan.");
    }
  };

  const getMemberName = (id: string) => members.find(m => m.id === id)?.nombre || 'Socio Externo';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header & Quick Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Finanzas <span className="text-orange-500">AurumFit</span></h1>
            <p className="text-gray-500 font-medium italic">Gestión de ingresos, planes de membresía y facturación.</p>
          </div>
        <div className="flex gap-3">
          <button 
            onClick={() => generateFinanceReportPDF(transactions, { totalIngresos: totalRecaudado })}
            className="bg-white border border-gray-200 text-gray-700 px-6 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
          >
            <Download size={20} /> Reporte PDF
          </button>
          <button 
            onClick={() => setIsPaymentModalOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-orange-500/20"
          >
            <Wallet size={20} />
            Cobro Rápido (TPV)
          </button>
        </div>
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
                       <button 
                        onClick={() => {
                          const member = members.find(m => m.id === tx.memberId);
                          if (member) generateReceiptPDF(tx, member);
                        }}
                        className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
                       >
                        <Receipt size={18}/>
                       </button>
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
            <button 
              onClick={() => { setEditingPlan(null); setPlanForm({ nombre: '', costo: 0, duracionMeses: 1, beneficios: [], color: 'bg-orange-500' }); setIsPlanModalOpen(true); }}
              className="text-orange-500 font-bold text-sm flex items-center gap-1 hover:underline"
            >
               <Plus size={16}/> Crear Nuevo Plan
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map(plan => (
              <div key={plan.id} className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col group hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className={`absolute top-0 right-0 w-24 h-24 ${plan.color || 'bg-orange-500'} opacity-10 rounded-bl-[80px]`}></div>
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
                  <button 
                    onClick={() => { setEditingPlan(plan); setPlanForm(plan); setIsPlanModalOpen(true); }}
                    className="flex-1 py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-colors"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDeletePlanLocal(plan.id)}
                    className="p-3 border border-gray-200 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={20}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plan Modal */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
              <div className="p-8 border-b flex justify-between items-center">
                 <h2 className="text-2xl font-black text-gray-900">{editingPlan ? 'Editar Plan' : 'Nuevo Plan'}</h2>
                 <button onClick={() => setIsPlanModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24}/></button>
              </div>
              <form onSubmit={handleSavePlan} className="p-8 space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre del Plan</label>
                    <input 
                      required
                      className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-bold focus:ring-2 focus:ring-orange-500"
                      value={planForm.nombre}
                      onChange={(e) => setPlanForm({...planForm, nombre: e.target.value})}
                      placeholder="Ej: Plan VIP Anual"
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Costo ($)</label>
                        <input 
                          type="number" required
                          className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-bold focus:ring-2 focus:ring-orange-500"
                          value={planForm.costo}
                          onChange={(e) => setPlanForm({...planForm, costo: Number(e.target.value)})}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duración (Meses)</label>
                        <input 
                          type="number" required
                          className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-bold focus:ring-2 focus:ring-orange-500"
                          value={planForm.duracionMeses}
                          onChange={(e) => setPlanForm({...planForm, duracionMeses: Number(e.target.value)})}
                        />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Color del Plan</label>
                    <div className="flex gap-2">
                       {['bg-orange-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500'].map(c => (
                         <button 
                           key={c} type="button"
                           onClick={() => setPlanForm({...planForm, color: c})}
                           className={`w-8 h-8 rounded-full ${c} ${planForm.color === c ? 'ring-4 ring-offset-2 ring-gray-900 transition-all' : ''}`}
                         />
                       ))}
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Beneficios (Uno por línea)</label>
                    <textarea 
                      rows={4}
                      className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-bold focus:ring-2 focus:ring-orange-500 text-sm"
                      value={planForm.beneficios?.join('\n')}
                      onChange={(e) => setPlanForm({...planForm, beneficios: e.target.value.split('\n').filter(b => b.trim() !== '')})}
                      placeholder="Acceso 24/7&#10;Área de Sauna&#10;Entrenador Personal"
                    />
                 </div>
                 <button type="submit" className="w-full py-5 bg-orange-500 text-white rounded-3xl font-black text-lg hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20">
                    Guardar Plan
                 </button>
              </form>
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
                      <option>Openpay</option>
                    </select>
                  </div>

                {paymentData.method === 'Openpay' && (
                  <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Detalles de Tarjeta (Seguro vía Openpay)</p>
                    <div className="space-y-3">
                       <input 
                         placeholder="Nombre en la tarjeta"
                         className="w-full p-4 bg-white border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                         value={cardData.holder}
                         onChange={(e) => setCardData({...cardData, holder: e.target.value})}
                       />
                       <input 
                         placeholder="Número de tarjeta"
                         maxLength={16}
                         className="w-full p-4 bg-white border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                         value={cardData.number}
                         onChange={(e) => setCardData({...cardData, number: e.target.value.replace(/\D/g, '')})}
                       />
                       <div className="grid grid-cols-2 gap-4">
                          <input 
                           placeholder="MM/YY"
                           maxLength={5}
                           className="w-full p-4 bg-white border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                           value={cardData.expiry}
                           onChange={(e) => {
                             let v = e.target.value;
                             if (v.length === 2 && !v.includes('/')) v += '/';
                             setCardData({...cardData, expiry: v});
                           }}
                         />
                          <input 
                           placeholder="CVV"
                           maxLength={4}
                           className="w-full p-4 bg-white border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                           value={cardData.cvv}
                           onChange={(e) => setCardData({...cardData, cvv: e.target.value.replace(/\D/g, '')})}
                         />
                       </div>
                    </div>
                  </div>
                )}
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

                {/* Nutrition Appointment Option */}
                {paymentData.type === 'Mensualidad' && (
                  <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500 text-white rounded-xl">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900">Cita con Nutriólogo</p>
                          <p className="text-[10px] text-orange-600 font-bold uppercase">Incluido en tu mensualidad</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={paymentData.scheduleNutrition}
                          onChange={(e) => setPaymentData({...paymentData, scheduleNutrition: e.target.checked})}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                      </label>
                    </div>

                    {paymentData.scheduleNutrition && (
                      <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha</label>
                          <input 
                            type="date"
                            required={paymentData.scheduleNutrition}
                            className="w-full p-3 bg-white border-none rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-sm"
                            value={paymentData.nutritionDate}
                            onChange={(e) => setPaymentData({...paymentData, nutritionDate: e.target.value})}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hora</label>
                          <input 
                            type="time"
                            required={paymentData.scheduleNutrition}
                            className="w-full p-3 bg-white border-none rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-sm"
                            value={paymentData.nutritionTime}
                            onChange={(e) => setPaymentData({...paymentData, nutritionTime: e.target.value})}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button 
                type="submit"
                disabled={isProcessing}
                className="w-full py-5 bg-orange-500 text-white rounded-3xl font-black text-lg hover:bg-orange-600 shadow-2xl shadow-orange-500/30 transition-all transform active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle size={24} />}
                {isProcessing ? 'Procesando...' : 'Confirmar Pago y Generar Recibo'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceView;
