
import React, { useEffect, useState } from 'react';
import { db, auth } from '../services/firebase.ts';
import { Coupon } from '../types.ts';

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'blocked';
  contact?: string;
  validUntil?: string | null;
  approvedAt?: string | null;
  isPaid?: boolean;
  autoApproved?: boolean;
}

export const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'users' | 'coupons'>('users');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'blocked'>('all');
  
  const [showApprovalModal, setShowApprovalModal] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState('50');
  const [newPlanType, setNewPlanType] = useState<'tactical' | 'strategic' | 'all'>('all');
  const [customDays, setCustomDays] = useState('30');

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const unsubscribeUsers = db.collection('users').onSnapshot((snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminUser)));
      setLoading(false);
    }, (err) => {
      setError("Unauthorized Access Protocol Active.");
      setLoading(false);
    });

    const unsubscribeCoupons = db.collection('coupons').onSnapshot((snapshot) => {
      setCoupons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon)));
    });

    return () => {
      unsubscribeUsers();
      unsubscribeCoupons();
    };
  }, []);

  const getRemainingDays = (expiryStr: string | null | undefined) => {
    if (!expiryStr) return 0;
    const diff = new Date(expiryStr).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getWhatsAppLink = (user: AdminUser) => {
    const phone = user.contact?.replace(/\D/g, '');
    if (!phone) return '#';
    const daysLeft = getRemainingDays(user.validUntil);
    const message = encodeURIComponent(`Greeting from team NextYou21! Your subscription is now active for ${daysLeft} days. Welcome to the elite architecture protocol.`);
    return `https://wa.me/${phone}?text=${message}`;
  };

  const updateStatus = async (userId: string, status: AdminUser['status'], days: number | null = null) => {
    try {
      let validUntil = null;
      let approvedAt = null;
      if (status === 'approved') {
        approvedAt = new Date().toISOString();
        if (days) {
          const expiry = new Date();
          expiry.setDate(expiry.getDate() + days);
          validUntil = expiry.toISOString();
        }
      }
      await db.collection('users').doc(userId).update({ status, validUntil, approvedAt, autoApproved: false });
      setShowApprovalModal(null);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const filteredUsers = users.filter(u => filter === 'all' || u.status === filter);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-20 text-center space-y-8">
        <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-500 text-3xl mx-auto shadow-xl">🛡️</div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">{error}</h2>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12 animate-in fade-in duration-700">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#76C7C0] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Master Fleet Control</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter italic leading-none">Command Center.</h1>
        </div>
        <div className="flex bg-white border border-slate-100 p-1.5 rounded-2xl shadow-sm">
          <button onClick={() => setView('users')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'users' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}>Fleet</button>
          <button onClick={() => setView('coupons')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'coupons' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}>Coupons</button>
        </div>
      </header>

      {view === 'users' ? (
        <>
          <div className="flex bg-white border border-slate-100 p-1.5 rounded-2xl shadow-sm w-fit mb-8">
            {['all', 'pending', 'approved', 'blocked'].map((f) => (
              <button key={f} onClick={() => setFilter(f as any)} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>{f}</button>
            ))}
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Architect</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Intel</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Cycles Rem.</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map((user) => {
                    const daysLeft = getRemainingDays(user.validUntil);
                    return (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setSelectedUser(user)}>
                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-sm uppercase">{user.fullName?.charAt(0)}</div>
                            <div>
                              <div className="font-black text-slate-900 text-sm uppercase tracking-tight">{user.fullName}</div>
                              <div className="text-[10px] font-bold text-slate-400">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <a 
                             href={getWhatsAppLink(user)}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="flex items-center gap-2 text-[11px] font-black text-emerald-600 hover:text-emerald-700 hover:underline uppercase tracking-tight italic transition-all group/wa"
                           >
                              <svg className="w-4 h-4 fill-emerald-500 group-hover/wa:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                              {user.contact || 'N/A'}
                           </a>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={`text-sm font-black italic ${daysLeft <= 7 ? 'text-rose-500' : 'text-slate-900'}`}>
                            {user.validUntil ? `${daysLeft} Days` : 'N/A'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${user.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{user.status}</span>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <div className="flex justify-end gap-2">
                              <button onClick={() => setShowApprovalModal(user.id)} className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 font-bold hover:bg-emerald-500 hover:text-white transition-all">✓</button>
                           </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="py-20 text-center text-slate-400 font-black italic uppercase tracking-widest">Coupons view available in Master Forge</div>
      )}

      {/* Manual Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" onClick={() => setShowApprovalModal(null)} />
          <div className="relative w-full max-w-md bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl animate-in zoom-in">
             <h3 className="text-3xl font-black italic text-slate-900 mb-8 tracking-tighter">Authorize Identity.</h3>
             <div className="grid grid-cols-2 gap-4">
               {[30, 90, 365, 999].map(days => (
                 <button key={days} onClick={() => updateStatus(showApprovalModal, 'approved', days)} className="p-6 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl font-black text-[10px] uppercase transition-all">{days === 999 ? 'LIFETIME' : `${days} DAYS`}</button>
               ))}
             </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl" onClick={() => setSelectedUser(null)} />
          <div className="relative w-full max-w-xl bg-white rounded-[4rem] p-12 shadow-2xl animate-in zoom-in">
             <div className="flex items-center gap-6 mb-12">
                <div className="w-24 h-24 rounded-3xl bg-slate-900 flex items-center justify-center text-white text-4xl font-black uppercase">{selectedUser.fullName?.charAt(0)}</div>
                <div>
                   <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">{selectedUser.fullName}</h2>
                   <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-2">{selectedUser.email}</p>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">Contact Intel</p>
                   <a 
                     href={getWhatsAppLink(selectedUser)}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="text-lg font-black italic text-emerald-600 hover:underline flex items-center gap-2"
                   >
                     {selectedUser.contact || 'N/A'}
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                   </a>
                </div>
                <div className="p-6 bg-slate-900 rounded-3xl text-white">
                   <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1 italic">Cycles Left</p>
                   <p className="text-lg font-black text-[#76C7C0] italic">{getRemainingDays(selectedUser.validUntil)} Remaining</p>
                </div>
             </div>
             <button onClick={() => setSelectedUser(null)} className="w-full mt-10 py-5 bg-slate-100 text-slate-400 rounded-3xl font-black uppercase tracking-[0.4em] text-[10px] hover:text-rose-500 transition-all">Terminate View</button>
          </div>
        </div>
      )}
    </div>
  );
};
