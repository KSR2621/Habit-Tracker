
import React, { useState } from 'react';

interface LandingPageProps {
  onStart: () => void;
}

type InfoTab = 'Privacy' | 'Security' | 'Infrastructure' | null;

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [activeInfoTab, setActiveInfoTab] = useState<InfoTab>(null);

  const redirectToWhatsApp = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/918789548725?text=${encodedMessage}`, '_blank');
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getInfoContent = () => {
    switch (activeInfoTab) {
      case 'Privacy':
        return {
          title: 'Data Privacy Protocol',
          desc: 'NextYou21 operates on a Zero-Knowledge Architecture. Your rituals, financial ledgers, and personal benchmarks are encrypted end-to-end. We do not monetize behavioral data; your progress is your own capital.',
          stats: ['256-bit Encryption', 'Zero Data Resale', 'GDPR Compliant']
        };
      case 'Security':
        return {
          title: 'System Security Standards',
          desc: 'Our infrastructure is hardened against external friction. Multi-factor authentication is standard for all architects. Periodic system audits ensure that your strategic data remains isolated from unauthorized access.',
          stats: ['MFA Ready', 'Automated Audits', 'Isolated Storage']
        };
      case 'Infrastructure':
        return {
          title: 'Strategic Infrastructure',
          desc: 'Built on a high-velocity cloud matrix, NextYou21 ensures 99.9% uptime for your performance tracking. Our servers are optimized for low-latency synchronization across all your tactical devices.',
          stats: ['99.9% Uptime', 'Cloud Sync', 'Low-Latency']
        };
      default:
        return null;
    }
  };

  const info = getInfoContent();

  return (
    <div className="min-h-screen bg-[#FDFDFB] selection:bg-[#76C7C0] selection:text-white overflow-hidden scroll-smooth text-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-8 py-6 flex justify-between items-center backdrop-blur-md border-b border-gray-100 bg-white/70">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-black text-lg">N</div>
          <span className="font-black text-xl tracking-tighter">NextYou21</span>
        </div>
        <div className="hidden md:flex items-center gap-10">
          <button onClick={() => scrollToSection('methodology')} className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-gray-900 transition-colors">Methodology</button>
          <button onClick={() => scrollToSection('architecture')} className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-gray-900 transition-colors">Architecture</button>
          <button onClick={() => scrollToSection('pricing')} className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-gray-900 transition-colors">Pricing</button>
          <button 
            onClick={onStart}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-200"
          >
            Access Protocol
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-8">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#E8F5F4] rounded-full blur-[150px] -z-10 animate-pulse" />
        <div className="absolute bottom-0 right-[-10%] w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[120px] -z-10" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="animate-in fade-in slide-in-from-left-12 duration-1000">
            <div className="inline-flex items-center gap-2 bg-white border border-gray-100 px-4 py-1.5 rounded-full shadow-sm mb-10">
              <span className="flex h-2 w-2 rounded-full bg-[#76C7C0] animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">2026 Strategic Ledger Ready</span>
            </div>
            
            <h1 className="text-[5rem] lg:text-[7rem] font-black tracking-tight leading-[0.85] text-gray-900 mb-10 italic">
              Build Your <br/> <span className="text-[#76C7C0] not-italic">Legacy.</span>
            </h1>
            
            <p className="text-xl text-gray-500 mb-12 max-w-lg leading-relaxed font-medium">
              NextYou21 is the elite dashboard for architectural life design. Track rituals, calibrate financial performance, and master your biological clock.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <button 
                onClick={onStart}
                className="bg-gray-900 text-white px-10 py-5 rounded-2xl text-xl font-black shadow-2xl shadow-gray-300 hover:scale-[1.02] active:scale-95 transition-all group flex items-center justify-center gap-4"
              >
                Initialize Console
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right-12 duration-1000 delay-300">
            <div className="relative glass p-4 rounded-[4rem] border-4 border-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop" 
                alt="Workspace" 
                className="w-full aspect-[4/5] font-black object-cover rounded-[3rem] grayscale-[0.5] hover:grayscale-0 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" />
              
              <div className="absolute bottom-10 left-10 right-10 flex flex-col gap-4">
                 <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl flex items-center justify-between border border-white/50 animate-float">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#76C7C0] rounded-2xl flex items-center justify-center text-white text-xl">⚡</div>
                      <div>
                        <div className="text-sm font-black text-gray-900">System Sync</div>
                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Efficiency: 98%</div>
                      </div>
                    </div>
                    <div className="text-right">
                       <div className="text-xs font-black text-gray-900">MARCH 2026</div>
                       <div className="w-16 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                         <div className="w-3/4 h-full bg-[#76C7C0]" />
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section id="methodology" className="py-40 px-8 bg-white border-t border-gray-100 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-[3rem] lg:text-[4rem] font-black tracking-tighter text-gray-900 mb-6 italic">The NextYou21 <span className="text-[#76C7C0] not-italic underline decoration-8">Methodology</span></h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">A systematic approach to behavioral engineering based on high-performance frameworks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-12">
              {[
                { step: "01", title: "Ritual Identification", desc: "Isolate the key behaviors that drive 80% of your results using our classification system." },
                { step: "02", title: "Grid Alignment", desc: "Map daily rituals against weekly sprints to ensure macro-level progress." },
                { step: "03", title: "Fidelity Tracking", desc: "Maintain high-resolution records of execution to identify performance friction." }
              ].map((m, i) => (
                <div key={i} className="flex gap-8 group">
                  <span className="text-4xl font-black text-[#76C7C0]/30 group-hover:text-[#76C7C0] transition-colors">{m.step}</span>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">{m.title}</h3>
                    <p className="text-gray-500 font-medium leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-12 bg-gray-50 rounded-[4rem] border border-gray-100">
               <img 
                src="https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=2014&auto=format&fit=crop" 
                className="w-full rounded-[3rem] shadow-xl grayscale-[0.2]" 
                alt="Methodology Visual" 
               />
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="py-40 px-8 bg-gray-900 text-white relative overflow-hidden scroll-mt-24">
        <div className="absolute top-0 right-0 p-20 opacity-10">
           <svg className="w-[800px] h-[800px] text-[#76C7C0]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl mb-24">
            <h2 className="text-[3.5rem] lg:text-[4.5rem] font-black tracking-tight leading-none mb-8 italic">
              A Higher Form <br/> of <span className="text-[#76C7C0] not-italic underline decoration-4">Discipline.</span>
            </h2>
            <p className="text-xl text-gray-400 font-medium leading-relaxed">
              Ditch the simple checklist. NextYou21 utilizes a spreadsheet-inspired matrix to ensure your daily actions align with your 2026 strategic vision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Strategic Logic", icon: "💎", desc: "Designed for high-impact decision makers to analyze behavioral friction.", accent: "bg-[#76C7C0]/10 border-[#76C7C0]/20" },
              { title: "Grid Fidelity", icon: "📊", desc: "A robust high-resolution matrix inspired by professional management tools.", accent: "bg-white/5 border-white/10" },
              { title: "Vision Sync", icon: "🎯", desc: "Real-time mapping between small daily rituals and massive annual targets.", accent: "bg-white/5 border-white/10" }
            ].map((f, i) => (
              <div key={i} className={`p-10 rounded-[3rem] border ${f.accent} group hover:border-[#76C7C0] transition-all duration-500`}>
                <div className="text-5xl mb-8 group-hover:scale-110 transition-transform duration-500">{f.icon}</div>
                <h3 className="text-2xl font-black mb-4 tracking-tight">{f.title}</h3>
                <p className="text-gray-400 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-40 px-8 bg-white scroll-mt-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-1 bg-gradient-to-r from-transparent via-gray-100 to-transparent" />
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <div className="inline-block px-6 py-2 bg-[#F1F5F9] rounded-full mb-6">
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#76C7C0]">Deployment Tiers</span>
            </div>
            <h2 className="text-[4rem] lg:text-[5.5rem] font-black tracking-tighter text-gray-900 mb-6 italic leading-none">Investment in <span className="text-[#76C7C0] not-italic">Execution.</span></h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">Select your synchronization tier. Performance architecture for every level of commitment.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Monthly Plan */}
            <div className="bg-white border-2 border-gray-100 p-12 rounded-[4rem] shadow-[0_30px_60px_rgba(0,0,0,0.02)] relative group hover:border-[#76C7C0]/30 transition-all duration-700">
              <div className="mb-10">
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight italic mb-2">Tactical Cycle</h3>
                <p className="text-sm font-medium text-gray-400">Monthly Performance Sync</p>
              </div>
              <div className="flex items-baseline gap-4 mb-10">
                <span className="text-6xl font-black text-gray-900 italic tracking-tighter">$4</span>
                <span className="text-2xl font-black text-gray-300 line-through decoration-red-400 decoration-4">$9</span>
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest italic">/ Month</span>
              </div>
              <ul className="space-y-6 mb-12">
                {['Daily Ritual Matrix', 'Monthly Target Architecture', 'Gemini AI Insights', 'Cross-Device Sync'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <div className="w-5 h-5 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-[13px] font-bold text-gray-600">{feat}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => redirectToWhatsApp("Hello! I am interested in the Tactical Cycle (Monthly) plan for NextYou21. Please help me with the setup.")}
                className="w-full py-5 bg-white border-2 border-gray-900 text-gray-900 rounded-2xl font-black text-lg hover:bg-gray-900 hover:text-white transition-all shadow-lg active:scale-95"
              >
                Start Trial
              </button>
            </div>

            {/* Yearly Plan */}
            <div className="bg-[#111827] p-12 rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.2)] relative group border border-white/5 overflow-hidden">
              <div className="absolute top-0 right-0 px-8 py-3 bg-[#76C7C0] text-gray-900 font-black text-[10px] uppercase tracking-[0.3em] rounded-bl-[2rem]">Most Strategic</div>
              <div className="mb-10">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight italic mb-2">Strategic Vision</h3>
                <p className="text-sm font-medium text-gray-500">Annual Architecture Bundle</p>
              </div>
              <div className="flex items-baseline gap-4 mb-10">
                <span className="text-6xl font-black text-[#76C7C0] italic tracking-tighter">$29</span>
                <span className="text-2xl font-black text-white/20 line-through decoration-[#76C7C0]/50 decoration-4">$50</span>
                <span className="text-[11px] font-black text-white/40 uppercase tracking-widest italic">/ Year</span>
              </div>
              <ul className="space-y-6 mb-12">
                {['Everything in Monthly', 'Annual Vision Board', 'Priority AI Processing', 'Beta Feature Access'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <div className="w-5 h-5 bg-[#76C7C0]/10 rounded-full flex items-center justify-center text-[#76C7C0]">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-[13px] font-bold text-white/80">{feat}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => redirectToWhatsApp("Hello! I am interested in the Strategic Vision (Annual) plan for NextYou21. Please help me with the setup.")}
                className="w-full py-5 bg-[#76C7C0] text-gray-900 rounded-2xl font-black text-lg hover:scale-[1.02] transition-all shadow-xl shadow-[#76C7C0]/10 active:scale-95"
              >
                Access Full Stack
              </button>
            </div>
          </div>

          <div className="mt-20 text-center">
            <div className="inline-flex flex-col items-center p-10 bg-gray-50 rounded-[3rem] border border-gray-100 max-w-2xl mx-auto shadow-sm">
              <span className="text-[11px] font-black uppercase tracking-[0.6em] text-gray-400 mb-4 italic underline decoration-gray-200 decoration-2">Legacy Protocol Access</span>
              <p className="text-2xl font-black text-gray-900 italic tracking-tight mb-6">
                Redeem Architect Coupon: <span className="text-[#76C7C0] px-4 py-1.5 bg-white border border-gray-100 rounded-xl shadow-inner not-italic">FREE21</span>
              </p>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                * SYSTEM NOTICE: Use the code above for 100% complimentary architectural access for 3 months.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Blueprint Section */}
      <section id="blueprint" className="py-40 px-8 bg-[#FDFDFB] scroll-mt-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="relative order-2 lg:order-1">
             <div className="absolute -inset-10 bg-gradient-to-tr from-[#76C7C0]/20 via-sky-50 to-indigo-50 blur-[100px] rounded-full opacity-60" />
             <div className="relative bg-white border border-gray-100 p-10 md:p-14 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[4rem] -z-10" />
                
                <div className="space-y-8">
                  <div className="flex justify-between items-center pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#76C7C0] rounded-full" />
                      <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">Strategic Ledger V.2026.04</span>
                    </div>
                  </div>

                  <div className="space-y-12">
                    {[
                      { tier: "Tier 04", label: "Empire Vision", val: "Multinational Asset Acquisition & Generational Wealth", color: "bg-indigo-600", desc: "Macro-level legacy objective" },
                      { tier: "Tier 03", label: "Tactical Expansion", val: "Deploy $50k into High-Yield Portfolio Tiers", color: "bg-emerald-600", desc: "Active monthly growth target" },
                      { tier: "Tier 02", label: "Operational Sprint", val: "Analyze 10 Emerging Venture Opportunities", color: "bg-sky-600", desc: "Weekly performance cycle" },
                      { tier: "Tier 01", label: "Atomic Ritual", val: "Market Calibration & Capital Flow Audit", color: "bg-amber-600", desc: "Daily recurring execution" }
                    ].map((item, i) => (
                      <div key={i} className="flex gap-8 group cursor-default">
                        <div className="flex flex-col items-center">
                          <div className={`w-4 h-4 rounded-full ${item.color} shadow-lg ring-4 ring-gray-50`} />
                          {i !== 3 && <div className="w-[2px] h-full bg-gray-100 mt-2" />}
                        </div>
                        <div className="pb-2">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{item.tier}</span>
                            <span className="text-[10px] font-black text-[#76C7C0] uppercase tracking-widest">{item.label}</span>
                          </div>
                          <div className="text-xl font-black text-gray-900 tracking-tight group-hover:text-black transition-colors">{item.val}</div>
                          <div className="text-[10px] font-medium text-gray-400 mt-1 italic">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
             </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-3 mb-8">
              <span className="w-12 h-[2px] bg-gray-900" />
              <span className="text-xs font-black text-gray-900 uppercase tracking-[0.4em]">The Blueprint</span>
            </div>
            <h2 className="text-[4rem] lg:text-[5.5rem] font-black tracking-tight text-gray-900 mb-8 italic leading-[0.85]">
              High Fidelity <br/> <span className="text-[#76C7C0] not-italic">Execution.</span>
            </h2>
            <p className="text-xl text-gray-500 font-medium leading-relaxed mb-12 max-w-lg">
              NextYou21 bridges the gap between your highest aspirations and your lowest-level actions. Our unique Execution Hierarchy ensures every capital allocation and ritual tick is a direct step toward your legacy.
            </p>
            <button 
              onClick={() => redirectToWhatsApp("Hello! I'm interested in the NextYou21 Blueprint for life architecture. Can you help me get started?")}
              className="px-12 py-6 bg-gray-900 text-white rounded-2xl font-black text-xl hover:bg-black transition-all shadow-2xl hover:scale-[1.02] active:scale-95"
            >
              Initialize My Architecture
            </button>
          </div>
        </div>
      </section>

      {/* Info Modal */}
      {activeInfoTab && info && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setActiveInfoTab(null)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[4rem] p-12 shadow-2xl animate-in zoom-in slide-in-from-bottom-8 duration-500">
             <button 
              onClick={() => setActiveInfoTab(null)}
              className="absolute top-8 right-12 text-gray-400 hover:text-gray-900 text-3xl font-light transition-colors"
             >
              ✕
             </button>
             
             <div className="mb-10">
                <span className="text-[#76C7C0] text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">System Protocol</span>
                <h3 className="text-4xl font-black italic tracking-tighter text-gray-900">{info.title}</h3>
             </div>
             
             <p className="text-xl text-gray-500 font-medium leading-relaxed mb-12 italic">
               "{info.desc}"
             </p>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {info.stats.map((stat, i) => (
                 <div key={i} className="bg-gray-50 border border-gray-100 p-6 rounded-3xl flex items-center justify-center text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">{stat}</span>
                 </div>
               ))}
             </div>

             <div className="mt-12 pt-10 border-t border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">NextYou21 Core Secured</span>
                </div>
                <button 
                  onClick={() => setActiveInfoTab(null)}
                  className="bg-gray-900 text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                >
                  Dismiss
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-20 px-8 bg-[#F9FAFB] border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <h2 className="text-5xl font-black text-gray-900 mb-6 italic tracking-tighter">Ready for Calibration?</h2>
          <p className="text-gray-400 mb-10 max-w-md font-medium">Your rituals define your future. Start tracking with high-resolution today.</p>
          <button 
            onClick={onStart}
            className="bg-gray-900 text-white px-12 py-5 rounded-2xl text-xl font-black hover:bg-black transition-all mb-20 shadow-2xl shadow-gray-200"
          >
            Start Your Ledger
          </button>
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-gray-200">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">© 2026 NextYou21 Protocol</p>
             <div className="flex gap-8">
               {['Privacy', 'Security', 'Infrastructure'].map(item => (
                 <button 
                  key={item} 
                  onClick={() => setActiveInfoTab(item as InfoTab)} 
                  className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
                 >
                   {item}
                 </button>
               ))}
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
