
import React, { useState } from 'react';
import { db } from '../services/firebase.ts';
import { Coupon } from '../types.ts';

interface PaymentGateProps {
  onSuccess: () => void;
  userEmail: string;
  userId: string;
}

export const PaymentGate: React.FC<PaymentGateProps> = ({ onSuccess, userEmail, userId }) => {
  const [couponCode, setCouponCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const handleUPIPayment = (amount: number, planName: string) => {
    const finalAmount = calculatePrice(amount, planName.toLowerCase() as any);
    
    // If it's 0 due to 100% coupon, go to clearance directly
    if (parseFloat(finalAmount) === 0) {
      handleCompleteAccess(planName === 'Strategic' ? 365 : 90, true); 
      return;
    }

    const upiId = "kunalsinghrajput2125@okicici";
    const name = "NextYou21";
    const note = encodeURIComponent(`NextYou21 ${planName} Plan - ${userEmail}`);
    const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${finalAmount}&cu=INR&tn=${note}`;
    window.location.href = upiLink;
  };

  const handleCompleteAccess = async (days: number, isAuto: boolean = false) => {
    setLoading(true);
    setError('');
    try {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + days);
      
      await db.collection('users').doc(userId).update({
        isPaid: true,
        status: 'approved',
        validUntil: expiry.toISOString(),
        approvedAt: new Date().toISOString(),
        autoApproved: isAuto // Mark as auto-approved for admin tracking
      });
      onSuccess();
    } catch (err: any) {
      setError("Failed to initialize access. System offline.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setLoading(true);
    setError('');
    try {
      const query = await db.collection('coupons').where('code', '==', couponCode.toUpperCase()).get();
      
      if (query.empty) {
        setError('Invalid Protocol Code. Access Denied.');
        setAppliedCoupon(null);
      } else {
        const data = query.docs[0].data() as Coupon;
        if (!data.active) {
          setError('This protocol code has been deactivated by the system.');
          setAppliedCoupon(null);
        } else {
          setAppliedCoupon(data);
          setError('');
        }
      }
    } catch (err: any) {
      setError('System Error: Coupon verification timed out.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppHelp = () => {
    const phoneNumber = "917218512043";
    const message = encodeURIComponent(`Hello! I'm an architect (${userEmail}) needing assistance with the NextYou21 payment protocol.`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const calculatePrice = (base: number, planKey: 'tactical' | 'strategic') => {
    if (!appliedCoupon) return base.toFixed(0);
    
    const isApplicable = appliedCoupon.planType === 'all' || appliedCoupon.planType === planKey;
    if (!isApplicable) return base.toFixed(0);

    const discounted = base - (base * (appliedCoupon.discount / 100));
    return Math.max(0, discounted).toFixed(0);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFB] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#76C7C0]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px]" />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left Side: context */}
        <div className="lg:col-span-5 space-y-12 animate-in fade-in slide-in-from-left duration-700">
          <div>
            <div className="w-20 h-20 bg-gray-900 rounded-[1.8rem] flex items-center justify-center text-white font-black text-4xl mb-10 shadow-2xl animate-float">N</div>
            <h1 className="text-6xl font-black text-gray-900 tracking-tighter italic leading-none mb-6">Initialize <br/><span className="text-[#76C7C0] not-italic underline decoration-[10px] decoration-slate-100 underline-offset-8">Ledger.</span></h1>
            <p className="text-slate-500 font-medium italic text-lg leading-relaxed max-w-sm">
              Your identity has been verified as <span className="text-slate-900 font-black not-italic">{userEmail}</span>. Choose your operational tier to deploy the 2026 suite.
            </p>
          </div>

          <div className="p-10 bg-white border border-slate-100 rounded-[3.5rem] shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 block italic">Redeem Protocol Code</label>
            <div className="space-y-4 relative">
              <input 
                type="text"
                placeholder="PROMO2026"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border-2 border-slate-100 focus:border-[#76C7C0] focus:bg-white rounded-3xl px-8 py-5 outline-none font-black text-2xl tracking-[0.2em] transition-all uppercase placeholder:text-slate-200"
              />
              {error && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest italic">{error}</p>}
              {appliedCoupon && (
                <div className="flex flex-col gap-1">
                  <p className="text-[12px] font-black text-emerald-500 uppercase tracking-widest italic animate-pulse">✓ {appliedCoupon.discount}% Performance Discount applied</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Applicable to: {appliedCoupon.planType}</p>
                </div>
              )}
              
              <button 
                onClick={handleApplyCoupon}
                disabled={loading || !couponCode}
                className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] hover:bg-[#76C7C0] hover:text-white transition-all shadow-2xl disabled:opacity-30 disabled:grayscale active:scale-95"
              >
                {loading ? 'VERIFYING PROTOCOL...' : 'VERIFY ARCHITECT CODE'}
              </button>
            </div>
          </div>

          {/* WhatsApp Support Section */}
          <div className="flex items-center gap-4 p-6 bg-emerald-50/50 border border-emerald-100 rounded-[2.5rem] animate-in slide-in-from-bottom-4 duration-1000">
             <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
             </div>
             <div>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 italic">Protocol Support</p>
                <button 
                  onClick={handleWhatsAppHelp}
                  className="text-sm font-black text-slate-900 hover:text-emerald-600 transition-colors flex items-center gap-2 group"
                >
                  Help via WhatsApp
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
             </div>
          </div>
        </div>

        {/* Right Side: Plans */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right duration-1000">
          
          {/* Tactical Cycle */}
          <div className="bg-white border border-slate-100 p-12 rounded-[4.5rem] shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group">
             <div className="absolute top-[-5%] right-[-5%] w-32 h-32 bg-slate-50 rounded-full blur-3xl" />
             <h3 className="text-2xl font-black uppercase italic text-slate-900 mb-1">Tactical</h3>
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-10">Monthly Clearance</p>
             
             {/* Price Box - Clickable if amount is 0 */}
             <div 
               onClick={() => calculatePrice(49, 'tactical') === '0' && handleCompleteAccess(90, true)}
               className={`flex items-baseline gap-3 my-12 p-4 rounded-3xl transition-all ${calculatePrice(49, 'tactical') === '0' ? 'cursor-pointer bg-emerald-50 hover:bg-emerald-100 border-2 border-dashed border-emerald-200' : ''}`}
             >
                <span className={`text-6xl font-black italic tracking-tighter ${calculatePrice(49, 'tactical') === '0' ? 'text-emerald-600' : 'text-slate-900'}`}>
                  ₹{calculatePrice(49, 'tactical')}
                </span>
                <span className="text-lg text-slate-300 font-black uppercase tracking-widest">/mo</span>
                {calculatePrice(49, 'tactical') === '0' && (
                  <div className="ml-2 bg-emerald-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded animate-pulse">Unlocked</div>
                )}
             </div>

             <button 
               onClick={() => handleUPIPayment(49, "Tactical")} 
               className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${calculatePrice(49, 'tactical') === '0' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-slate-900 hover:bg-indigo-600 text-white'}`}
             >
               {calculatePrice(49, 'tactical') === '0' ? 'Activate Instant Access' : 'Select Plan'}
             </button>
             
             <div className="mt-8 space-y-3">
                {['Daily Rituals', 'Monthly Targets', 'Cloud Synthesis'].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase italic">
                    <span className="text-[#76C7C0]">✓</span> {f}
                  </div>
                ))}
             </div>
          </div>

          {/* Strategic Vision */}
          <div className="bg-[#111827] p-12 rounded-[4.5rem] text-white border border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] relative overflow-hidden group">
             <div className="absolute top-[-10%] right-[-10%] w-48 h-48 bg-[#76C7C0]/10 rounded-full blur-[80px]" />
             <h3 className="text-2xl font-black uppercase italic text-[#76C7C0] mb-1">Strategic</h3>
             <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-10">Annual Authority</p>
             
             {/* Price Box - Clickable if amount is 0 */}
             <div 
                onClick={() => calculatePrice(299, 'strategic') === '0' && handleCompleteAccess(365, true)}
                className={`flex items-baseline gap-3 my-12 p-4 rounded-3xl transition-all ${calculatePrice(299, 'strategic') === '0' ? 'cursor-pointer bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/10' : ''}`}
             >
                <span className={`text-6xl font-black italic tracking-tighter ${calculatePrice(299, 'strategic') === '0' ? 'text-[#76C7C0]' : 'text-white'}`}>
                  ₹{calculatePrice(299, 'strategic')}
                </span>
                <span className="text-lg text-slate-500 font-black uppercase tracking-widest">/yr</span>
                {calculatePrice(299, 'strategic') === '0' && (
                  <div className="ml-2 bg-[#76C7C0] text-slate-900 text-[8px] font-black uppercase px-2 py-1 rounded animate-pulse">Unlocked</div>
                )}
             </div>

             <button 
               onClick={() => handleUPIPayment(299, "Strategic")} 
               className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all shadow-2xl active:scale-95 ${calculatePrice(299, 'strategic') === '0' ? 'bg-[#76C7C0] text-slate-900 hover:bg-white' : 'bg-[#76C7C0] text-slate-900 hover:bg-white'}`}
             >
               {calculatePrice(299, 'strategic') === '0' ? 'Activate Instant Access' : 'Select Plan'}
             </button>

             <div className="mt-8 space-y-3">
                {['Unlimited Rituals', 'Sprint Board', 'Legacy Visions', 'Architect Ranking'].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase italic">
                    <span className="text-[#76C7C0]">✓</span> {f}
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div> 
  );
};
