
import React, { useEffect, useState } from 'react';
import { db, auth } from '../services/firebase.ts';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'blocked'>('all');
  const [showApprovalModal, setShowApprovalModal] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [customDays, setCustomDays] = useState('30');

  useEffect(() => {
    console.log("Admin: Setting up Firestore listener...");
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError("Not Authenticated. Please log in again.");
      setLoading(false);
      return;
    }

    const unsubscribe = db.collection('users').onSnapshot(
      (snapshot) => {
        const userData = snapshot.docs.map(doc => {
          const data = doc.data() as AdminUser;
          const userId = doc.id;

          // Auto-check expiry logic
          if (data.status === 'approved' && data.validUntil && new Date(data.validUntil) < new Date()) {
            db.collection('users').doc(userId).update({ 
              status: 'pending', 
              validUntil: null 
            });
          }

          return {
            id: userId,
            ...data
          };
        });

        setUsers(userData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Admin Error:", err);
        setError(`Access Denied: ${err.message}`);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

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
      
      const updates: any = { status, validUntil };
      if (approvedAt) updates.approvedAt = approvedAt;

      await db.collection('users').doc(userId).update(updates);
      setShowApprovalModal(null);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const calculateDaysSince = (dateStr: string) => {
    if (!dateStr) return 0;
    const start = new Date(dateStr);
    const now = new Date();
    const diff = Math.abs(now.getTime() - start.getTime());
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const getRemainingDays = (expiryStr: string) => {
    if (!expiryStr) return 0;
    const expiry = new Date(expiryStr);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const filteredUsers = users.filter(u => filter === 'all' || u.status === filter);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12 animate-in fade-in duration-700">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#76C7C0] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Ledger Administration</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic leading-none">Fleet <span className="text-[#76C7C0] not-italic">Manifest.</span></h1>
        </div>

        <div className="flex bg-white border border-slate-100 p-1.5 rounded-2xl shadow-sm">
          {['all', 'pending', 'approved', 'blocked'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {error && (
        <div className="mb-10 p-8 bg-rose-50 border-l-8 border-rose-500 rounded-2xl">
          <p className="text-rose-600 font-black text-xs uppercase tracking-widest">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Architect Profile</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Enrollment</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Approved At</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5 cursor-pointer" onClick={() => setSelectedUser(user)}>
                      <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl hover:scale-105 transition-transform">
                        {user.fullName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-black text-slate-900 text-sm uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{user.fullName || 'Unidentified'}</div>
                        <div className="text-[10px] font-bold text-slate-400 lowercase">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="text-sm font-black text-slate-700 italic">{new Date(user.createdAt).toLocaleDateString()}</div>
                    <div className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{calculateDaysSince(user.createdAt)} Days Ago</div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    {user.approvedAt ? (
                      <div className="text-sm font-black text-emerald-600 italic">{new Date(user.approvedAt).toLocaleDateString()}</div>
                    ) : (
                      <div className="text-[10px] font-bold text-slate-300 uppercase italic">Not Authorized</div>
                    )}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      user.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                      user.status === 'blocked' ? 'bg-rose-50 text-rose-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {user.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="inline-flex gap-2">
                      <button onClick={() => setShowApprovalModal(user.id)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-emerald-500 hover:text-white transition-all">✓</button>
                      <button onClick={() => updateStatus(user.id, 'blocked')} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-500 hover:text-white transition-all">×</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* USER PROFILE MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl animate-in fade-in" onClick={() => setSelectedUser(null)} />
          <div className="relative w-full max-w-xl bg-white rounded-[4rem] p-12 shadow-2xl animate-in zoom-in slide-in-from-bottom-10">
            <div className="flex items-center gap-6 mb-12">
               <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-white font-black text-4xl shadow-2xl">
                 {selectedUser.fullName?.charAt(0)}
               </div>
               <div>
                 <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">{selectedUser.fullName}</h2>
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">{selectedUser.email}</p>
                 <div className="mt-3 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${selectedUser.isPaid ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {selectedUser.isPaid ? 'Premium Architecture' : 'Trial Protocol'}
                    </span>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-12">
               <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Enrollment Date</p>
                  <p className="text-lg font-black text-slate-900 italic">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
               </div>
               <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Authorization</p>
                  <p className="text-lg font-black text-slate-900 italic">{selectedUser.approvedAt ? new Date(selectedUser.approvedAt).toLocaleDateString() : 'Pending'}</p>
               </div>
               <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Contact Intelligence</p>
                  <p className="text-lg font-black text-slate-900 italic">{selectedUser.contact || 'Not Found'}</p>
               </div>
               <div className="p-6 bg-slate-900 rounded-3xl text-white">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Access Remaining</p>
                  <p className="text-lg font-black text-[#76C7C0] italic">{selectedUser.validUntil ? `${getRemainingDays(selectedUser.validUntil)} Days` : 'N/A'}</p>
               </div>
            </div>

            <button onClick={() => setSelectedUser(null)} className="w-full py-5 rounded-3xl bg-slate-100 text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] hover:bg-rose-50 hover:text-rose-500 transition-all">Terminate View</button>
          </div>
        </div>
      )}

      {/* APPROVAL CONFIG MODAL */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" onClick={() => setShowApprovalModal(null)} />
          <div className="relative w-full max-w-md bg-white rounded-[3rem] p-12 shadow-2xl animate-in zoom-in">
            <h3 className="text-3xl font-black italic tracking-tighter text-slate-900 mb-2">Assign Lifespan.</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-10">Approval will expire automatically.</p>
            
            <div className="grid grid-cols-2 gap-4 mb-10">
               {[30, 90, 365, 999].map(days => (
                 <button key={days} onClick={() => updateStatus(showApprovalModal, 'approved', days)} className="p-6 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl border border-slate-100 font-black text-[10px] uppercase tracking-widest transition-all">{days === 999 ? 'LIFETIME' : `${days} DAYS`}</button>
               ))}
            </div>

            <div className="flex gap-2">
              <input type="number" value={customDays} onChange={(e) => setCustomDays(e.target.value)} className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none font-black" placeholder="30"/>
              <button onClick={() => updateStatus(showApprovalModal, 'approved', parseInt(customDays) || 30)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">DEPLOY</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
