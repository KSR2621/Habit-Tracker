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
}

export const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'users' | 'coupons'>('users');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'blocked'>('all');
  
  // Modals
  const [showApprovalModal, setShowApprovalModal] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  
  // Coupon Form State
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState('50');
  const [customDays, setCustomDays] = useState('30');

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const unsubscribeUsers = db.collection('users').onSnapshot((snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminUser)));
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

  const createCoupon = async () => {
    if (!newCode) return;
    try {
      await db.collection('coupons').add({
        code: newCode.toUpperCase().trim(),
        discount: parseInt(newDiscount),
        active: true,
        createdAt: new Date().toISOString()
      });
      setNewCode('');
      setShowCouponModal(false);
    } catch (err: any) {
      alert("Forge Failed: " + err.message);
    }
  };

  const deleteCoupon = async (id: string) => {
    if (confirm("Deactivate this protocol code?")) {
      await db.collection('coupons').doc(id).delete();
    }
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
      await db.collection('users').doc(userId).update({ status, validUntil, approvedAt });
      setShowApprovalModal(null);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const getRemainingDays = (expiryStr: string) => {
    if (!expiryStr) return 0;
    const diff = new Date(expiryStr).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const filteredUsers = users.filter(u => filter === 'all' || u.status === filter);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12 animate-in fade-in duration-700">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#76C7C0] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Master Fleet Control</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic leading-none">Command <span className="text-[#76C7C0] not-italic">Center.</span></h1>
        </div>

        <div className="flex gap-4">
          <div className="flex bg-white border border-slate-100 p-1.5 rounded-2xl shadow-sm">
            <button onClick={() => setView('users')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'users' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}>Fleet</button>
            <button onClick={() => setView('coupons')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'coupons' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}>Coupons</button>
          </div>
        </div>
      </header>

      {view === 'users' ? (
        <>
          <div className="flex bg-white border border-slate-100 p-1.5 rounded-2xl shadow-sm w-fit mb-8">
            {['all', 'pending', 'approved', 'blocked'].map((f) => (
              <button key={f} onClick={() => setFilter(f as any)} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>{f}</button>
            ))}
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Architect</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Enrollment</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4 cursor-pointer" onClick={() => setSelectedUser(user)}>
                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black shadow-lg group-hover:scale-110 transition-transform">{user.fullName?.charAt(0)}</div>
                        <div>
                          <div className="font-black text-slate-900 text-sm uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{user.fullName}</div>
                          <div className="text-[10px] font-bold text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center text-sm font-black italic">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${user.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : user.status === 'blocked' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>{user.status}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex justify-end gap-2">
                          <button onClick={() => setShowApprovalModal(user.id)} className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 font-bold hover:bg-emerald-500 hover:text-white transition-all">✓</button>
                          <button onClick={() => updateStatus(user.id, 'blocked')} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 font-bold hover:bg-rose-500 hover:text-white transition-all">×</button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
           <button onClick={() => setShowCouponModal(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-indigo-600 transition-all">+ Forge Protocol Code</button>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map(coupon => (
                <div key={coupon.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg group relative overflow-hidden">
                   <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-3xl font-black italic tracking-tighter text-slate-900 group-hover:text-indigo-600 transition-colors">{coupon.code}</h3>
                        <p className="text-[10px] font-black text-[#76C7C0] uppercase tracking-widest">{coupon.discount}% Performance Offset</p>
                      </div>
                      <button onClick={() => deleteCoupon(coupon.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-2 text-xl font-light">×</button>
                   </div>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${coupon.active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{coupon.active ? 'Operational' : 'Deactivated'}</span>
                      </div>
                      <span className="text-[8px] font-bold text-slate-200 uppercase italic">Created: {new Date(coupon.createdAt).toLocaleDateString()}</span>
                   </div>
                </div>
              ))}
              {coupons.length === 0 && (
                <div className="col-span-full py-20 bg-slate-50 border border-dashed border-slate-200 rounded-[3rem] text-center">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[1em]">No protocol codes forged</p>
                </div>
              )}
           </div>
        </div>
      )}

      {/* Coupon Forge Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl animate-in fade-in" onClick={() => setShowCouponModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[3rem] p-12 shadow-2xl animate-in zoom-in">
             <h3 className="text-3xl font-black italic text-slate-900 mb-8 tracking-tighter">Forge Protocol.</h3>
             <div className="space-y-6">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1 italic">Secret Alpha-Numeric Code</label>
                   <input value={newCode} onChange={e => setNewCode(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 font-black text-xl outline-none focus:border-indigo-500 transition-all uppercase placeholder:text-slate-200" placeholder="ELITE2026" />
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1 italic">Performance Discount Value</label>
                   <select value={newDiscount} onChange={e => setNewDiscount(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 font-black outline-none appearance-none focus:border-indigo-500 transition-all">
                      <option value="10">10% Performance Boost</option>
                      <option value="25">25% Performance Boost</option>
                      <option value="50">50% Performance Boost</option>
                      <option value="75">75% Performance Boost</option>
                      <option value="100">100% (Instant Clearance)</option>
                   </select>
                </div>
                <button onClick={createCoupon} className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-[0.4em] text-xs shadow-2xl hover:bg-[#76C7C0] transition-all">Deploy Code</button>
             </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl animate-in fade-in" onClick={() => setSelectedUser(null)} />
          <div className="relative w-full max-w-xl bg-white rounded-[4rem] p-12 shadow-2xl animate-in zoom-in">
             <div className="flex items-center gap-6 mb-12">
                <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl">{selectedUser.fullName?.charAt(0)}</div>
                <div>
                   <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">{selectedUser.fullName}</h2>
                   <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-2">{selectedUser.email}</p>
                   <span className={`inline-block mt-4 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${selectedUser.isPaid ? 'bg-emerald-500 text-white shadow-emerald-200 shadow-lg' : 'bg-slate-100 text-slate-400'}`}>{selectedUser.isPaid ? 'Premium Verified' : 'Unpaid Protocol'}</span>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">Enrolled On</p>
                   <p className="text-lg font-black italic text-slate-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">Authorized At</p>
                   <p className="text-lg font-black italic text-slate-900">{selectedUser.approvedAt ? new Date(selectedUser.approvedAt).toLocaleDateString() : 'Pending Clearance'}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">Contact Intel</p>
                   <p className="text-lg font-black italic text-slate-900">{selectedUser.contact || 'N/A'}</p>
                </div>
                <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-xl shadow-slate-200">
                   <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1 italic">Access Lifetime</p>
                   <p className="text-lg font-black text-[#76C7C0] italic">{selectedUser.validUntil ? `${getRemainingDays(selectedUser.validUntil)} Cycles Left` : 'EXPIRED'}</p>
                </div>
             </div>
             <button onClick={() => setSelectedUser(null)} className="w-full mt-10 py-5 bg-slate-100 text-slate-400 rounded-3xl font-black uppercase tracking-[0.4em] text-[10px] hover:bg-rose-50 hover:text-rose-500 transition-all">Terminate View</button>
          </div>
        </div>
      )}

      {/* Manual Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl animate-in fade-in" onClick={() => setShowApprovalModal(null)} />
          <div className="relative w-full max-w-md bg-white rounded-[3rem] p-12 shadow-2xl animate-in zoom-in">
             <h3 className="text-3xl font-black italic text-slate-900 mb-8 tracking-tighter">Authorize Identity.</h3>
             <div className="grid grid-cols-2 gap-4 mb-8">
               {[30, 90, 365, 999].map(days => (
                 <button key={days} onClick={() => updateStatus(showApprovalModal, 'approved', days)} className="p-6 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl border-2 border-slate-50 font-black text-[10px] uppercase transition-all shadow-sm active:scale-95">{days === 999 ? 'LIFETIME' : `${days} DAYS`}</button>
               ))}
             </div>
             <div className="flex gap-2">
                <input value={customDays} onChange={e => setCustomDays(e.target.value)} className="flex-1 bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 font-black outline-none focus:border-indigo-500" placeholder="Custom Days" type="number" />
                <button onClick={() => updateStatus(showApprovalModal, 'approved', parseInt(customDays))} className="bg-indigo-600 text-white px-8 rounded-2xl font-black text-xs uppercase shadow-lg shadow-indigo-100 hover:scale-105 transition-all">SET</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};