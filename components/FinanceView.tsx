
import React, { useState, useMemo } from 'react';
import { Transaction, BudgetLimit } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, AreaChart, Area, ComposedChart, Line, Cell
} from 'recharts';
import { MONTHS_LIST } from '../constants';

interface FinanceViewProps {
  transactions: Transaction[];
  budgetLimits: BudgetLimit[];
  categories: {
    income: string[];
    expense: string[];
  };
  onUpdateCategories: (newCats: { income: string[]; expense: string[] }) => void;
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onUpdateTransaction: (id: string, updates: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
  onUpdateBudget: (category: string, limit: number) => void;
}

const REALISTIC_SUGGESTIONS = [
  "Client Retainer: Q1 Alpha",
  "AWS Infrastructure Protocol",
  "Executive Office Lease",
  "SaaS Subscription Revenue",
  "Dividends: Tech Portfolio",
  "Strategic Networking Dinner",
  "Bio-Hacking Supplements",
  "Elite Fitness Membership",
  "Vercel Deployment Yield",
  "Consulting Yield: Growth Ops",
  "Starlink Connectivity Protocol",
  "Personal Loan: Rahul",
  "Borrowed from Team Fund"
];

export const FinanceView: React.FC<FinanceViewProps> = ({
  transactions,
  budgetLimits,
  categories,
  onUpdateCategories,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onUpdateBudget
}) => {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense' | 'borrow' | 'lend'>('expense');
  const [category, setCategory] = useState(categories.expense[0] || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [thresholdSearch, setThresholdSearch] = useState('');
  
  const [viewType, setViewType] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS_LIST[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState<string>('2026');

  const [showCatManager, setShowCatManager] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Transaction>>({});

  const stats = useMemo(() => {
    const temporalFiltered = transactions.filter(t => {
      const d = new Date(t.date);
      const mMatch = viewType === 'Yearly' || MONTHS_LIST[d.getMonth()] === selectedMonth;
      const yMatch = d.getFullYear().toString() === selectedYear;
      return mMatch && yMatch;
    });

    const searchFiltered = temporalFiltered.filter(t => 
      t.desc.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const income = temporalFiltered.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = temporalFiltered.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    
    const borrow = temporalFiltered.filter(t => t.type === 'borrow' && t.status !== 'settled').reduce((acc, t) => acc + t.amount, 0);
    const lend = temporalFiltered.filter(t => t.type === 'lend' && t.status !== 'settled').reduce((acc, t) => acc + t.amount, 0);
    
    const delta = (income + borrow) - (expense + lend);
    const savingsRate = (income > 0) ? Math.round(((income - expense) / income) * 100) : 0;

    let trendData: any[] = [];
    if (viewType === 'Yearly') {
      let cumulativeBalance = 0;
      trendData = MONTHS_LIST.map((m, idx) => {
        const monthTrans = transactions.filter(t => {
          const d = new Date(t.date);
          return d.getMonth() === idx && d.getFullYear().toString() === selectedYear;
        });
        const mInc = monthTrans.filter(t => t.type === 'income' || (t.type === 'borrow' && t.status !== 'settled')).reduce((acc, t) => acc + t.amount, 0);
        const mExp = monthTrans.filter(t => t.type === 'expense' || (t.type === 'lend' && t.status !== 'settled')).reduce((acc, t) => acc + t.amount, 0);
        cumulativeBalance += (mInc - mExp);
        return { label: m.slice(0, 3), income: mInc, expense: mExp, balance: cumulativeBalance };
      });
    } else {
      const daysInMonth = new Date(parseInt(selectedYear), MONTHS_LIST.indexOf(selectedMonth) + 1, 0).getDate();
      trendData = Array.from({ length: daysInMonth }, (_, i) => {
        const dayNum = i + 1;
        const dayTrans = temporalFiltered.filter(t => new Date(t.date).getDate() === dayNum);
        return { 
          label: dayNum.toString(), 
          income: dayTrans.filter(t => t.type === 'income' || (t.type === 'borrow' && t.status !== 'settled')).reduce((acc, t) => acc + t.amount, 0), 
          expense: dayTrans.filter(t => t.type === 'expense' || (t.type === 'lend' && t.status !== 'settled')).reduce((acc, t) => acc + t.amount, 0) 
        };
      });
    }

    const entityAgg: Record<string, { name: string, borrow: number, lend: number, net: number }> = {};
    temporalFiltered.forEach(t => {
      if ((t.type === 'borrow' || t.type === 'lend') && t.status !== 'settled') {
        const normalizedName = t.desc.split(':')[0].trim();
        if (!entityAgg[normalizedName]) entityAgg[normalizedName] = { name: normalizedName, borrow: 0, lend: 0, net: 0 };
        if (t.type === 'borrow') entityAgg[normalizedName].borrow += t.amount;
        else entityAgg[normalizedName].lend += t.amount;
        entityAgg[normalizedName].net = entityAgg[normalizedName].lend - entityAgg[normalizedName].borrow;
      }
    });

    return { 
      income, expense, borrow, lend, delta, savingsRate, trendData, 
      filtered: searchFiltered, rawTemporal: temporalFiltered, 
      entityAgg: Object.values(entityAgg).sort((a, b) => Math.abs(b.net) - Math.abs(a.net))
    };
  }, [transactions, selectedMonth, selectedYear, viewType, categories, searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;
    const now = new Date();
    const fullDate = new Date(
      parseInt(selectedYear), 
      MONTHS_LIST.indexOf(selectedMonth), 
      now.getDate(), 
      now.getHours(), 
      now.getMinutes(), 
      now.getSeconds()
    );
    
    onAddTransaction({
      date: fullDate.toISOString(),
      desc, amount: parseFloat(amount), type, 
      category: (type === 'borrow' || type === 'lend') ? 'Credit/Debt' : category,
      status: 'pending'
    });
    setDesc(''); setAmount('');
  };

  const handleToggleSettled = (id: string) => {
    const t = transactions.find(x => x.id === id);
    if (!t || t.status === 'settled') return; 
    onUpdateTransaction(id, { 
      status: 'settled', 
      settledAt: new Date().toISOString() 
    });
  };

  const handleStartEdit = (t: Transaction) => { setEditingId(t.id); setEditForm(t); };
  const handleSaveEdit = () => {
    if (!editingId) return;
    onUpdateTransaction(editingId, editForm);
    setEditingId(null);
  };

  const handleAddCategory = () => {
    if (!newCatName) return;
    const newCats = { ...categories };
    const targetType = (type === 'borrow' || type === 'lend') ? 'expense' : type as 'income' | 'expense';
    if (!newCats[targetType].includes(newCatName)) {
      newCats[targetType] = [...newCats[targetType], newCatName];
      onUpdateCategories(newCats);
      setCategory(newCatName);
    }
    setNewCatName('');
  };

  const handleDeleteCategory = (cat: string, catType: 'income' | 'expense') => {
    const newCats = { ...categories };
    newCats[catType] = newCats[catType].filter(c => c !== cat);
    onUpdateCategories(newCats);
  };

  const filteredThresholds = categories.expense.filter(cat => 
    cat.toLowerCase().includes(thresholdSearch.toLowerCase())
  );

  const formatDateTime = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleString('en-GB', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  return (
    <div className="max-w-[1100px] mx-auto px-3 py-2 space-y-5 animate-in fade-in duration-500 pb-24">
      
      {/* 1. CONTROL HUB */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex flex-col gap-1.5">
           <h2 className="text-sm font-black italic uppercase text-slate-900 tracking-tighter">Wealth.Arch</h2>
           <div className="flex gap-1.5">
              <button onClick={() => setViewType('Monthly')} className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${viewType === 'Monthly' ? 'bg-[#111827] text-white' : 'bg-slate-50 text-slate-400'}`}>Daily</button>
              <button onClick={() => setViewType('Yearly')} className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${viewType === 'Yearly' ? 'bg-[#111827] text-white' : 'bg-slate-50 text-slate-400'}`}>Yearly</button>
              <button onClick={() => setShowCatManager(!showCatManager)} className="px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-500 border border-indigo-100">Zones</button>
           </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
           {viewType === 'Monthly' && (
             <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="flex-1 md:w-28 bg-slate-50 border border-slate-100 px-2 py-1.5 rounded-lg text-[9px] font-black uppercase outline-none appearance-none cursor-pointer">
                {MONTHS_LIST.map(m => <option key={m} value={m}>{m}</option>)}
             </select>
           )}
           <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="flex-1 md:w-20 bg-slate-50 border border-slate-100 px-2 py-1.5 rounded-lg text-[9px] font-black uppercase outline-none appearance-none cursor-pointer">
              {['2024', '2025', '2026', '2027'].map(y => <option key={y} value={y}>{y}</option>)}
           </select>
        </div>
      </section>

      {showCatManager && (
        <section className="bg-slate-900 p-4 rounded-xl text-white animate-in slide-in-from-top duration-300 ring-1 ring-white/10 shadow-xl">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['income', 'expense'].map((t) => (
                <div key={t} className="space-y-2">
                   <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">{t} clusters</p>
                   <div className="flex flex-wrap gap-1.5">
                      {categories[t as 'income' | 'expense'].map(c => (
                        <div key={c} className="px-2 py-1 bg-white/5 border border-white/10 rounded-md flex items-center gap-2 group">
                           <span className="text-[9px] font-bold uppercase text-slate-300">{c}</span>
                           <button onClick={() => handleDeleteCategory(c, t as any)} className="text-rose-500 text-[12px] hover:scale-125">×</button>
                        </div>
                      ))}
                   </div>
                   <div className="flex gap-2">
                      <input value={t === type ? newCatName : ''} onChange={e => { setType(t as any); setNewCatName(e.target.value); }} className="flex-1 bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-[10px] outline-none placeholder:text-slate-700" placeholder={`New ${t}...`} />
                      <button onClick={handleAddCategory} className="bg-[#76C7C0] text-slate-900 px-4 py-2 rounded-lg text-[8px] font-black uppercase shadow-lg">Add</button>
                   </div>
                </div>
              ))}
           </div>
        </section>
      )}

      {/* 2. TELEMETRY TABS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-[#111827] p-4 rounded-xl border border-white/5 shadow-md group">
          <p className="text-[8px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-1 italic opacity-80">Net Liquidity</p>
          <div className="flex items-baseline gap-2">
             <p className="text-2xl font-black text-white italic tracking-tighter">₹{stats.delta.toLocaleString()}</p>
             <span className="text-[8px] font-black text-slate-500 uppercase tracking-tight">{stats.savingsRate}% Yield</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5 italic">Capital Inflow (Active)</p>
          <p className="text-xl font-black text-slate-900 italic tracking-tighter">₹{(stats.income + stats.borrow).toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="text-[8px] font-black text-rose-300 uppercase tracking-widest mb-0.5 italic">Operating Burn (Active)</p>
          <p className="text-xl font-black text-slate-900 italic tracking-tighter">₹{(stats.expense + stats.lend).toLocaleString()}</p>
        </div>
      </section>

      {/* 3. TRANSACTION DEPLOYMENT (ENTRY FORM) - NOW AT TOP */}
      <section className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <div className="flex flex-col">
                <h3 className="text-[10px] font-black uppercase text-slate-500 italic tracking-[0.1em]">Deployment Hub</h3>
                <p className="text-[8px] text-slate-400 font-bold uppercase">Initialize Financial Node • {selectedMonth}</p>
             </div>
             
             <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
                <button onClick={() => { setType('income'); setCategory(categories.income[0]); }} className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${type === 'income' ? 'bg-[#76C7C0] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>In</button>
                <button onClick={() => { setType('expense'); setCategory(categories.expense[0]); }} className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${type === 'expense' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Out</button>
                <button onClick={() => { setType('borrow'); setCategory('Credit/Debt'); }} className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${type === 'borrow' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Borrow</button>
                <button onClick={() => { setType('lend'); setCategory('Credit/Debt'); }} className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${type === 'lend' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Lend</button>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
             <div className="md:col-span-1">
                <input list="sug-v5" placeholder="Label Node..." value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-[11px] font-bold outline-none focus:border-[#76C7C0] transition-all shadow-sm" />
                <datalist id="sug-v5">{REALISTIC_SUGGESTIONS.map(s => <option key={s} value={s} />)}</datalist>
             </div>
             <input type="number" placeholder="Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} className="bg-white border border-slate-100 rounded-xl px-4 py-3 text-[11px] font-black outline-none focus:border-[#76C7C0] transition-all shadow-sm" />
             
             <select 
               value={category} 
               onChange={e => setCategory(e.target.value)} 
               disabled={type === 'borrow' || type === 'lend'}
               className="bg-white border border-slate-100 rounded-xl px-3 py-3 text-[9px] font-black uppercase outline-none disabled:opacity-50 shadow-sm"
             >
               {(type === 'borrow' || type === 'lend') ? (
                 <option value="Credit/Debt">Credit/Debt</option>
               ) : (
                 categories[type === 'income' ? 'income' : 'expense'].map(c => <option key={c} value={c}>{c}</option>)
               )}
             </select>
             
             <button type="submit" className={`rounded-xl text-[10px] font-black uppercase tracking-[0.2em] py-3 shadow-lg transition-all active:scale-[0.98] text-white ${type === 'income' ? 'bg-emerald-500 shadow-emerald-200' : type === 'expense' ? 'bg-[#111827] shadow-slate-300' : type === 'borrow' ? 'bg-amber-500 shadow-amber-200' : 'bg-indigo-600 shadow-indigo-200'}`}>
               Deploy {type}
             </button>
          </form>
      </section>

      {/* 4. CHARTING */}
      <section className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
         <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
               {viewType === 'Yearly' ? (
                 <ComposedChart data={stats.trendData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 8, fontWeight: 800, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '9px', fontWeight: '900' }} />
                    <Bar dataKey="income" fill="#76C7C0" radius={[2, 2, 0, 0]} barSize={10} />
                    <Bar dataKey="expense" fill="#F43F5E" radius={[2, 2, 0, 0]} barSize={10} />
                    <Line type="monotone" dataKey="balance" stroke="#4F46E5" strokeWidth={1.5} dot={false} />
                 </ComposedChart>
               ) : (
                 <AreaChart data={stats.trendData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 800, fill: '#94a3b8' }} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '9px', fontWeight: '900' }} />
                    <Area type="monotone" dataKey="income" stroke="#76C7C0" fill="#76C7C0" fillOpacity={0.08} strokeWidth={1.5} />
                    <Area type="monotone" dataKey="expense" stroke="#F43F5E" fill="#F43F5E" fillOpacity={0.08} strokeWidth={1.5} />
                 </AreaChart>
               )}
            </ResponsiveContainer>
         </div>
      </section>

      {/* 5. SECTOR THRESHOLDS */}
      <section className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-100 flex flex-col gap-3 shadow-inner">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-2">
            <h3 className="text-[10px] font-black uppercase text-slate-400 italic tracking-[0.2em]">Sector Thresholds</h3>
            <div className="relative w-full sm:w-48">
               <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
               <input 
                 type="text" 
                 placeholder="Search Sectors..." 
                 value={thresholdSearch}
                 onChange={(e) => setThresholdSearch(e.target.value)}
                 className="w-full bg-white border border-slate-100 rounded-full px-8 py-1.5 text-[9px] font-black uppercase outline-none focus:border-[#76C7C0] transition-all shadow-sm"
               />
            </div>
         </div>
         
         <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2 scroll-smooth">
            {filteredThresholds.map(cat => {
               const limit = budgetLimits.find(l => l.category === cat)?.limit || 0;
               const spent = stats.rawTemporal.filter(t => t.type === 'expense' && t.category === cat).reduce((acc, t) => acc + t.amount, 0);
               const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
               const isOver = spent > limit && limit > 0;
               return (
                  <div key={cat} className="flex-shrink-0 w-full sm:w-[calc(20%-12px)] bg-white p-3 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-[#76C7C0]/50 hover:shadow-md">
                     <div className="flex justify-between items-center mb-3">
                        <span className="text-[9px] font-black text-slate-800 uppercase tracking-tight truncate pr-1">{cat}</span>
                        <input 
                          type="number" 
                          value={limit || ''} 
                          onChange={(e) => onUpdateBudget(cat, parseFloat(e.target.value) || 0)} 
                          className="w-14 text-right bg-slate-50 border border-slate-100 rounded px-1 py-0.5 text-[10px] font-black outline-none focus:border-[#76C7C0]" 
                          placeholder="Limit" 
                        />
                     </div>
                     <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mb-2">
                        <div className={`h-full rounded-full transition-all duration-700 ${isOver ? 'bg-rose-500' : 'bg-[#76C7C0]'}`} style={{ width: `${Math.min(100, percent)}%` }} />
                     </div>
                     <div className="flex justify-between items-center text-[8px] font-black">
                        <span className={isOver ? 'text-rose-500' : 'text-slate-400'}>₹{spent.toLocaleString()}</span>
                        <span className={isOver ? 'text-rose-500' : 'text-[#76C7C0]'}>{percent}%</span>
                     </div>
                  </div>
               );
            })}
            {filteredThresholds.length === 0 && <p className="text-[9px] font-black text-slate-300 uppercase italic py-4 w-full text-center">No sectors found</p>}
         </div>
      </section>

      {/* 5. CREDIT/DEBT MATRIX */}
      <section className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-6">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-50 pb-2 gap-4">
            <div className="flex flex-col">
               <h3 className="text-[10px] font-black uppercase text-slate-400 italic tracking-[0.1em]">Credit/Debt Matrix</h3>
               <p className="text-[8px] text-slate-300 font-bold uppercase">Outstanding Entity Summary</p>
            </div>
            
            <div className="flex gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
               {stats.entityAgg.length === 0 ? (
                 <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic py-2">No active debt entities</span>
               ) : (
                 stats.entityAgg.map(entity => (
                   <div key={entity.name} className={`flex-shrink-0 px-3 py-1.5 rounded-lg border flex flex-col min-w-[110px] ${entity.net >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                      <span className="text-[8px] font-black uppercase text-slate-500 leading-none mb-1">{entity.name}</span>
                      <span className={`text-[10px] font-black italic leading-none ${entity.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                         {entity.net >= 0 ? `To Receive ₹${entity.net.toLocaleString()}` : `To Return ₹${Math.abs(entity.net).toLocaleString()}`}
                      </span>
                   </div>
                 ))
               )}
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['borrow', 'lend'].map((cdType) => (
               <div key={cdType} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className={`text-[9px] font-black uppercase tracking-widest italic ${cdType === 'borrow' ? 'text-amber-500' : 'text-indigo-500'}`}>
                       {cdType === 'borrow' ? 'Liability Sector (Borrow)' : 'Asset Sector (Lend)'}
                    </h4>
                    <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                       {cdType === 'borrow' ? `Active Debt: ₹${stats.borrow.toLocaleString()}` : `Active Credit: ₹${stats.lend.toLocaleString()}`}
                    </span>
                  </div>
                  
                  <div className="max-h-[350px] overflow-y-auto no-scrollbar space-y-2 px-1">
                     {stats.rawTemporal.filter(t => t.type === cdType).length === 0 ? (
                        <p className="text-[8px] text-slate-300 uppercase italic font-black text-center py-10">All nodes settled</p>
                     ) : (
                        stats.rawTemporal.filter(t => t.type === cdType).map(t => (
                           <div key={t.id} className={`flex justify-between items-center p-3.5 rounded-xl border transition-all group ${t.status === 'settled' ? 'bg-slate-50/50 border-slate-100 opacity-60 grayscale' : 'bg-white border-slate-100 shadow-sm hover:border-slate-200'}`}>
                              <div className="flex items-center gap-3">
                                 <div className="relative group/toggle">
                                   <button 
                                     onClick={() => handleToggleSettled(t.id)}
                                     disabled={t.status === 'settled'}
                                     className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all 
                                       ${t.status === 'settled' ? 'bg-emerald-500 border-emerald-500 cursor-default shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-white border-slate-100 hover:border-emerald-300 cursor-pointer'}`}
                                   >
                                      {t.status === 'settled' && <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
                                   </button>
                                   {t.status !== 'settled' && (
                                     <div className="absolute top-full left-0 mt-1 hidden group-hover/toggle:block z-20 whitespace-nowrap bg-slate-900 text-white text-[7px] font-black uppercase px-2 py-1 rounded shadow-lg">
                                        {cdType === 'borrow' ? 'Mark Returned' : 'Mark Received'}
                                     </div>
                                   )}
                                 </div>
                                 <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                       <span className={`text-[10px] font-black text-slate-800 uppercase leading-none truncate max-w-[120px] ${t.status === 'settled' ? 'line-through text-slate-400 decoration-2' : ''}`}>
                                          {t.desc}
                                       </span>
                                       {t.status === 'settled' && <span className="text-[7px] font-black text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded tracking-tighter shadow-sm">FINALIZED</span>}
                                    </div>
                                    <div className="flex flex-col mt-2 space-y-1.5">
                                       <div className="flex items-center gap-2">
                                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                                          <span className="text-[8px] font-black text-slate-400 leading-none uppercase tracking-tighter italic">Initiated: {formatDateTime(t.date)}</span>
                                       </div>
                                       {t.status === 'settled' && t.settledAt && (
                                          <div className="flex items-center gap-2">
                                             <span className="w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]" />
                                             <span className="text-[8px] font-black text-emerald-600 leading-none uppercase tracking-tighter italic">
                                                {cdType === 'borrow' ? 'Returned' : 'Received'}: {formatDateTime(t.settledAt)}
                                             </span>
                                          </div>
                                       )}
                                       <div className="pt-0.5">
                                          <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${t.status === 'settled' ? 'bg-slate-100 text-slate-400' : 'bg-amber-50 text-amber-600'}`}>
                                             {t.status === 'settled' ? (cdType === 'borrow' ? 'DEBT CLEARED' : 'ASSET REALIZED') : 'WAITING PROTOCOL'}
                                          </span>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3">
                                 <span className={`text-[13px] font-black italic tracking-tighter ${t.status === 'settled' ? 'text-slate-300 line-through decoration-slate-300' : 'text-slate-900'}`}>
                                    ₹{t.amount.toLocaleString()}
                                 </span>
                                 <button onClick={() => onDeleteTransaction(t.id)} className="text-slate-200 hover:text-rose-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               </div>
            ))}
         </div>
      </section>

      {/* 6. STRATEGY LEDGER ENTRIES LIST - NOW AT BOTTOM */}
      <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-50 pb-4 gap-4">
              <div className="flex flex-col">
                 <h3 className="text-[10px] font-black uppercase text-slate-500 italic tracking-[0.1em]">Strategy Ledger History</h3>
                 <p className="text-[8px] text-slate-400 font-bold uppercase">{stats.filtered.length} nodes active • {selectedMonth}</p>
              </div>
              
              <div className="relative w-full sm:w-auto">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input 
                  type="text" 
                  placeholder="Filter Historical Ledger..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-56 bg-slate-50 border border-slate-100 rounded-xl px-10 py-2.5 text-[10px] font-bold outline-none focus:border-[#76C7C0] transition-all shadow-inner"
                />
              </div>
           </div>

           <div className="max-h-[450px] overflow-y-auto no-scrollbar space-y-2 scroll-smooth pr-1">
              {[...stats.filtered].reverse().map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl hover:bg-white border border-transparent hover:border-slate-100 transition-all group/item shadow-sm">
                  {editingId === t.id ? (
                    <div className="flex-1 grid grid-cols-4 gap-2 items-center">
                       <input value={editForm.desc} onChange={e => setEditForm({...editForm, desc: e.target.value})} className="bg-white border px-2 py-2 rounded-lg text-[10px] font-bold col-span-2 md:col-span-1" />
                       <input type="number" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: parseFloat(e.target.value)})} className="bg-white border px-2 py-2 rounded-lg text-[10px] font-black" />
                       <div className="flex gap-1.5 col-span-2">
                          <button onClick={handleSaveEdit} className="flex-1 bg-[#76C7C0] text-[9px] font-black uppercase rounded-lg py-2 shadow-sm text-white">Save</button>
                          <button onClick={() => setEditingId(null)} className="px-4 bg-slate-200 rounded-lg text-[10px] text-slate-600 hover:bg-slate-300">×</button>
                       </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                         <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black shadow-inner 
                           ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 
                             t.type === 'expense' ? 'bg-rose-100 text-rose-600' : 
                             t.type === 'borrow' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                           {t.type === 'income' ? '↑' : t.type === 'expense' ? '↓' : t.type === 'borrow' ? '🤝' : '💸'}
                         </div>
                         <div className="flex flex-col overflow-hidden">
                            <p className="text-[10px] font-black text-slate-800 uppercase tracking-tighter truncate max-w-[180px] leading-tight">{t.desc}</p>
                            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                              {t.type.toUpperCase()} • {t.category} • {new Date(t.date).toLocaleDateString('en-GB', {day:'2-digit', month:'short'})}
                            </p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className={`text-[12px] font-black italic tracking-tighter 
                           ${(t.type === 'income' || t.type === 'borrow') ? 'text-emerald-600' : 'text-slate-900'}`}>
                           ₹{t.amount.toLocaleString()}
                         </span>
                         <div className="flex opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <button onClick={() => handleStartEdit(t)} className="text-[10px] text-indigo-400 p-2 hover:text-indigo-600 hover:scale-110 transition-transform">✎</button>
                            <button onClick={() => onDeleteTransaction(t.id)} className="text-[10px] text-slate-300 hover:text-rose-500 p-2 hover:scale-110 transition-transform">×</button>
                         </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {stats.filtered.length === 0 && <p className="text-center py-16 text-[9px] font-black text-slate-300 uppercase italic tracking-[0.2em]">Archival Sector Empty for {selectedMonth}</p>}
           </div>
      </section>
    </div>
  );
};
