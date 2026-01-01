
import React, { useState } from 'react';

interface PaymentGateProps {
  onSuccess: () => void;
  userEmail: string;
}

export const PaymentGate: React.FC<PaymentGateProps> = ({ onSuccess, userEmail }) => {
  const [coupon, setCoupon] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectToWhatsApp = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/918789548725?text=${encodedMessage}`, '_blank');
  };

  const handleApplyCoupon = () => {
    if (coupon.toUpperCase() === 'FREE21') {
      setLoading(true);
      // Simulate verification
      setTimeout(() => {
        setLoading(false);
        onSuccess();
      }, 1500);
    } else {
      setError('Invalid Protocol Code. Verification failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFB] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#E8F5F4] rounded-full blur-[150px] -z-10 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[120px] -z-10" />

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center animate-in fade-in zoom-in duration-700">
        <div className="lg:col-span-5 space-y-10">
          <div>
            <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-black text-3xl mb-8 shadow-xl">N</div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter italic leading-none mb-6">Initialize <br/><span className="text-[#76C7C0] not-italic">Ledger.</span></h1>
            <p className="text-gray-500 font-medium leading-relaxed italic">
              Access to the NextYou21 architecture requires an active performance subscription. Authenticated as: <br/>
              <span className="text-gray-900 font-black not-italic text-sm">{userEmail}</span>
            </p>
          </div>

          <div className="p-8 bg-white border border-gray-100 rounded-[3rem] shadow-sm relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#76C7C0]/5 rounded-full blur-2xl -z-10" />
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4 block">Redeem Protocol Code</label>
            <div className="space-y-4">
              <input 
                type="text"
                placeholder="FREE21"
                value={coupon}
                onChange={(e) => { setCoupon(e.target.value); setError(''); }}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#76C7C0] focus:bg-white rounded-2xl px-6 py-4 outline-none font-black text-lg tracking-widest transition-all placeholder:text-gray-200"
              />
              {error && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest animate-shake">{error}</p>}
              <button 
                onClick={handleApplyCoupon}
                disabled={loading || !coupon}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-black transition-all shadow-xl disabled:opacity-30 flex items-center justify-center gap-3"
              >
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {loading ? 'VERIFYING...' : 'APPLY ARCHITECT CODE'}
              </button>
            </div>
            <p className="text-[9px] font-bold text-gray-400 mt-6 uppercase tracking-widest text-center leading-relaxed">
              * Use code <span className="text-[#76C7C0] font-black">FREE21</span> for 100% complimentary architectural access for 3 months.
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly */}
          <div className="bg-white border-2 border-gray-100 p-10 rounded-[4rem] shadow-sm relative group hover:border-[#76C7C0]/30 transition-all duration-500">
             <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight italic mb-1">Tactical</h3>
             <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-8">Monthly Sync</p>
             <div className="flex items-baseline gap-3 mb-10">
                <span className="text-5xl font-black text-gray-900 italic tracking-tighter">$4</span>
                <span className="text-xl font-black text-gray-200 line-through decoration-red-400 decoration-2">$9</span>
             </div>
             <ul className="space-y-4 mb-10">
                {['Ritual Matrix', 'AI Insights', 'Cloud Sync'].map((f, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <div className="w-4 h-4 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{f}</span>
                  </li>
                ))}
             </ul>
             <button 
                onClick={() => redirectToWhatsApp(`Hello! I am ${userEmail} and I want to initialize the Tactical (Monthly) Ledger. Please help me with the setup.`)}
                className="w-full py-4 bg-white border-2 border-gray-900 text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all"
              >
                Initialize
              </button>
          </div>

          {/* Yearly */}
          <div className="bg-[#111827] p-10 rounded-[4rem] shadow-2xl relative group border border-white/5">
             <div className="absolute top-0 right-0 px-6 py-2 bg-[#76C7C0] text-gray-900 font-black text-[8px] uppercase tracking-[0.3em] rounded-bl-[2rem]">Best Vision</div>
             <h3 className="text-xl font-black text-white uppercase tracking-tight italic mb-1">Strategic</h3>
             <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-8">Annual Ledger</p>
             <div className="flex items-baseline gap-3 mb-10">
                <span className="text-5xl font-black text-[#76C7C0] italic tracking-tighter">$29</span>
                <span className="text-xl font-black text-white/10 line-through decoration-[#76C7C0]/30 decoration-2">$50</span>
             </div>
             <ul className="space-y-4 mb-10">
                {['Vision Board', 'Priority AI', 'All Tiers'].map((f, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <div className="w-4 h-4 bg-[#76C7C0]/10 rounded-full flex items-center justify-center text-[#76C7C0]">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{f}</span>
                  </li>
                ))}
             </ul>
             <button 
                onClick={() => redirectToWhatsApp(`Hello! I am ${userEmail} and I want to access the Strategic (Annual) Ledger Stack. Please help me with the setup.`)}
                className="w-full py-4 bg-[#76C7C0] text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#76C7C0]/10"
              >
                Access Stack
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};
