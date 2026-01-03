import React, { useState } from 'react';

interface LandingPageProps {
  onStart: () => void;
}

type InfoTab = 'Privacy' | 'Security' | 'Infrastructure' | null;

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [activeInfoTab, setActiveInfoTab] = useState<InfoTab>(null);

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
          desc: 'NextYou21 operates on a Zero-Knowledge Architecture. Your rituals, financial ledgers, and personal benchmarks are securely managed within your private session. We never sell or share your identity matrix.',
          stats: ['Zero Knowledge', 'GDPR Compliant', 'No Resale']
        };
      case 'Security':
        return {
          title: 'Security Infrastructure',
          desc: 'Our systems use 256-bit encryption and multi-factor authentication protocols to ensure your architectural data remains isolated from external friction.',
          stats: ['256-bit AES', 'MFA Enabled', 'Encrypted Sync']
        };
      case 'Infrastructure':
        return {
          title: 'High-Fidelity Matrix',
          desc: 'Built on a low-latency global edge network, NextYou21 ensures 99.9% operational uptime for your performance tracking across all geographic zones.',
          stats: ['99.9% Uptime', 'Edge Network', 'Sub-ms Sync']
        };
      default:
        return null;
    }
  };

  const info = getInfoContent();

  return (
    <div className="min-h-screen bg-white selection:bg-indigo-500 selection:text-white overflow-x-hidden scroll-smooth font-['Plus_Jakarta_Sans']">
      
      {/* 1. FLOATING NAVIGATION */}
      <nav className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-6xl px-4 md:px-8 py-3 md:py-4 flex justify-between items-center backdrop-blur-xl border border-white/40 bg-white/60 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2 md:gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-8 h-8 md:w-10 md:h-10 bg-[#111] rounded-lg md:rounded-xl flex items-center justify-center text-white font-black text-lg md:text-xl shadow-lg">N</div>
          <span className="font-black text-xl md:text-2xl tracking-tighter text-[#111]">NextYou21</span>
        </div>
        
        <div className="hidden lg:flex items-center gap-12">
          <button onClick={() => scrollToSection('methodology')} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-colors">Methodology</button>
          <button onClick={() => scrollToSection('architecture')} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-colors">Architecture</button>
          <button onClick={() => scrollToSection('pricing')} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-colors">Pricing</button>
        </div>

        <button 
          onClick={onStart}
          className="bg-[#5A4EF3] text-white px-5 md:px-8 py-2 md:py-3 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-indigo-100"
        >
          Access Console
        </button>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-32 md:pt-48 pb-20 md:pb-32 px-6 md:px-8 max-w-7xl mx-auto overflow-hidden text-slate-900">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="animate-in fade-in slide-in-from-left-12 duration-1000 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 rounded-full mb-6 md:mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500">Strategic Planner 2026</span>
            </div>
            
            <h1 className="text-[3.5rem] sm:text-[5rem] md:text-[8rem] font-black tracking-tighter leading-[0.9] text-[#111] mb-8 md:mb-10 italic">
              Build Your <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5A4EF3] via-[#76C7C0] to-[#34D399] not-italic">
                Legacy.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 mb-10 md:mb-12 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
              The high-fidelity command center for architects of life. Track rituals, calibrate performance, and manifest your elite strategic vision.
            </p>
            
            <button 
              onClick={onStart}
              className="w-full sm:w-auto bg-[#111] text-white px-10 py-5 md:py-6 rounded-2xl md:rounded-3xl text-lg md:text-xl font-black shadow-2xl hover:bg-[#5A4EF3] hover:scale-[1.05] transition-all group flex items-center justify-center gap-4"
            >
              Initialize Console
              <svg className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>

          <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-200 mt-10 lg:mt-0">
            <div className="relative rounded-[3rem] md:rounded-[5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.1)] border-4 md:border-8 border-white">
              <img src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070" className="w-full aspect-[4/5] object-cover" alt="Elite Workspace" />
              
              <div className="absolute bottom-6 md:bottom-10 left-4 md:left-10 right-4 md:right-10 bg-white/90 backdrop-blur-xl p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl flex items-center justify-between gap-4 md:gap-6 border border-white/20">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-14 md:h-14 bg-[#76C7C0]/20 rounded-xl md:rounded-2xl flex items-center justify-center text-[#76C7C0]">
                    <svg className="w-5 h-5 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14H11V21L20 10H13Z"/></svg>
                  </div>
                  <div>
                    <h4 className="text-[8px] md:text-[10px] font-black uppercase text-slate-900 tracking-widest">System Sync</h4>
                    <p className="text-[7px] md:text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 md:mt-1">Efficiency: 99.4%</p>
                  </div>
                </div>
                <div className="flex-1 max-w-[80px] md:max-w-[120px]">
                   <div className="text-[7px] md:text-[8px] font-black text-[#5A4EF3] uppercase mb-1 md:mb-1.5 tracking-widest text-right">Active</div>
                   <div className="w-full h-1 md:h-1.5 bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-[#5A4EF3] w-[80%]" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. METHODOLOGY SECTION */}
      <section id="methodology" className="py-20 md:py-40 px-6 md:px-8 bg-[#FDFDFB] text-slate-900">
        <div className="max-w-7xl mx-auto text-center mb-16 md:mb-24">
          <h2 className="text-[3rem] md:text-[6.5rem] font-black tracking-tighter text-[#111] italic leading-none">
            Strategic <span className="text-[#5A4EF3] not-italic">Methodology</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 font-medium mt-6 md:mt-10 max-w-2xl mx-auto italic px-4">
            A multi-layered execution framework for high-performance architects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[
            { id: '01', title: 'Ritual Design', icon: '💎', desc: 'Identify the critical daily actions that yield the highest strategic ROI for your legacy.', bg: 'bg-indigo-50' },
            { id: '02', title: 'Grid Alignment', icon: '📊', desc: 'Map your daily ritual ticks against weekly sprints to ensure zero tactical drift.', bg: 'bg-emerald-50' },
            { id: '03', title: 'Annual Sync', icon: '🎯', desc: 'Calibrate your performance ledger against long-term vision milestones in real-time.', bg: 'bg-rose-50' }
          ].map((item) => (
            <div key={item.id} className="bg-white p-10 md:p-12 rounded-[3rem] md:rounded-[4rem] shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-50 flex flex-col items-center text-center group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
              <div className={`w-16 h-16 md:w-20 md:h-20 ${item.bg} rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-2xl md:text-3xl mb-8 md:mb-10 transform group-hover:rotate-12 transition-transform`}>
                {item.icon}
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-indigo-600 font-black text-[10px] md:text-xs">{item.id}</span>
                <h3 className="text-xl md:text-2xl font-black text-[#111] tracking-tight">{item.title}</h3>
              </div>
              <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. ARCHITECTURE SECTION */}
      <section id="architecture" className="py-20 md:py-40 px-6 md:px-8 max-w-7xl mx-auto text-slate-900">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20 items-center">
          <div className="lg:col-span-6 text-center lg:text-left">
            <h2 className="text-[3rem] md:text-[6.5rem] font-black tracking-tighter text-[#111] leading-none mb-8 md:mb-10 italic">
              System <br/>
              <span className="text-[#76C7C0] not-italic">Architecture.</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-500 mb-10 md:mb-16 leading-relaxed font-medium">
              Engineered for those who demand absolute precision. Our zero-knowledge infrastructure ensures your strategic plans remain yours alone.
            </p>
            
            <div className="space-y-8 md:space-y-12 text-left">
              {[
                { id: 1, title: 'High-Fidelity Telemetry', desc: 'Real-time performance tracking with sub-millisecond sync across all zones.' },
                { id: 2, title: 'Adaptive Neural Logic', desc: 'System scales with your performance, providing deeper insights as your ledger grows.' },
                { id: 3, title: 'Strategic Synchrony', desc: 'Coherent data alignment across annual, monthly, and daily execution grids.' }
              ].map((point) => (
                <div key={point.id} className="flex gap-4 md:gap-6">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-[#111] rounded-full flex items-center justify-center text-white font-black text-[10px] md:text-xs shrink-0">{point.id}</div>
                  <div>
                    <h4 className="text-xs md:text-sm font-black uppercase tracking-widest text-[#111] mb-1 md:mb-2">{point.title}</h4>
                    <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed italic">{point.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 mt-10 lg:mt-0">
            <div className="bg-[#111] p-8 md:p-16 rounded-[3rem] md:rounded-[5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-4 md:top-0 right-4 md:right-0 p-4 md:p-8 text-[7px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">Validated Operational Standard 2026</div>
              
              <div className="grid grid-cols-2 gap-4 md:gap-8 mt-12 md:mt-10">
                {[
                  { label: 'Uptime Fidelity', val: '99.9%', color: 'text-[#76C7C0]' },
                  { label: 'Bit Precision', val: '256', color: 'text-[#5A4EF3]' },
                  { label: 'Data Friction', val: '0', color: 'text-rose-500' },
                  { label: 'Tier Protocol', val: 'Alpha', color: 'text-amber-400' }
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/5 border border-white/10 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] text-center hover:bg-white/10 transition-colors">
                    <div className={`text-2xl md:text-4xl font-black italic tracking-tighter mb-1 md:mb-2 ${stat.color}`}>{stat.val}</div>
                    <div className="text-[6px] md:text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING SECTION */}
      <section id="pricing" className="py-20 md:py-40 px-6 md:px-8 bg-[#FDFDFB] text-slate-900">
        <div className="max-w-7xl mx-auto text-center mb-16 md:mb-24">
          <h2 className="text-[3rem] md:text-[7rem] font-black tracking-tighter text-[#111] italic leading-none">
            Investment <span className="text-slate-400">in</span> <span className="text-[#76C7C0] not-italic">Results.</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 font-medium mt-6 md:mt-10 max-w-2xl mx-auto italic px-4">
            Select your synchronization tier. Performance architecture for every level of commitment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
          {/* Tactical */}
          <div className="bg-white p-10 md:p-16 rounded-[3rem] md:rounded-[4rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all">
            <h3 className="text-2xl md:text-3xl font-black italic text-[#111] mb-2 uppercase">Tactical Cycle</h3>
            <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-10 md:mb-12">Monthly Sync</p>
            <div className="flex items-baseline gap-2 mb-10 md:mb-12">
              <span className="text-6xl md:text-7xl font-black text-[#111] tracking-tighter">₹49</span>
              <span className="text-sm md:text-lg text-slate-200 line-through font-black">₹199</span>
            </div>
            <ul className="space-y-4 md:space-y-6 mb-12 md:mb-16">
              {['Daily Ritual Matrix', 'Performance Telemetry', 'Cloud Sync Protocol'].map((f) => (
                <li key={f} className="flex items-center gap-3 md:gap-4 text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500">
                  <span className="text-indigo-600">✓</span> {f}
                </li>
              ))}
            </ul>
            <button onClick={onStart} className="w-full py-5 md:py-6 bg-slate-900 text-white rounded-2xl md:rounded-[2rem] font-black uppercase tracking-widest text-[10px] md:text-xs">Deploy Protocol</button>
          </div>

          {/* Strategic */}
          <div className="bg-[#111] p-10 md:p-16 rounded-[3rem] md:rounded-[4rem] text-white shadow-2xl relative overflow-hidden transform lg:-translate-y-10">
            <div className="absolute top-0 right-0 px-6 md:px-8 py-2 md:py-3 bg-[#76C7C0] text-[#111] font-black text-[8px] md:text-[10px] uppercase tracking-[0.2em] rounded-bl-2xl md:rounded-bl-3xl">Strategic Alpha</div>
            <h3 className="text-2xl md:text-3xl font-black italic mb-2 uppercase">Strategic Vision</h3>
            <p className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-widest mb-10 md:mb-12">Annual Bundle</p>
            <div className="flex items-baseline gap-2 mb-10 md:mb-12">
              <span className="text-6xl md:text-7xl font-black text-[#76C7C0] tracking-tighter">₹299</span>
              <span className="text-sm md:text-lg text-slate-700 line-through font-black">₹1999</span>
            </div>
            <ul className="space-y-4 md:space-y-6 mb-12 md:mb-16">
              {['Daily Ritual Matrix', 'Performance Telemetry', 'Cloud Sync Protocol', 'Legacy vision board'].map((f) => (
                <li key={f} className="flex items-center gap-3 md:gap-4 text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400">
                  <span className="text-[#76C7C0]">✓</span> {f}
                </li>
              ))}
            </ul>
            <button onClick={onStart} className="w-full py-5 md:py-6 bg-[#5A4EF3] text-white rounded-2xl md:rounded-[2rem] font-black uppercase tracking-widest text-[10px] md:text-xs">Authorize Now</button>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="py-20 md:py-40 px-6 md:px-8 text-center max-w-4xl mx-auto text-slate-900">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-[#111] rounded-xl md:rounded-[1.5rem] flex items-center justify-center text-white font-black text-2xl md:text-3xl mx-auto mb-12 md:mb-16 shadow-xl animate-float">N</div>
        <h2 className="text-[3rem] md:text-[6.5rem] font-black tracking-tighter text-[#111] italic leading-[1] mb-8 md:mb-10">
          Ready for <br/>Calibration?
        </h2>
        <p className="text-lg md:text-xl text-slate-400 font-medium mb-12 md:mb-16 max-w-lg mx-auto italic">
          Your rituals define your legacy. Deploy your first performance protocol today.
        </p>
        <button 
          onClick={onStart}
          className="w-full sm:w-auto bg-[#5A4EF3] text-white px-10 md:px-16 py-5 md:py-6 rounded-2xl md:rounded-[2rem] text-lg md:text-xl font-black shadow-2xl hover:bg-[#483DD3] transition-all"
        >
          Start Your Ledger
        </button>
      </section>

      {/* 7. MODAL (Pop-up Page) FOR INFO TABS */}
      {activeInfoTab && info && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-white/90 backdrop-blur-3xl animate-in fade-in duration-300" 
            onClick={() => setActiveInfoTab(null)}
          />
          <div className="relative w-full max-w-xl bg-white rounded-[3rem] p-8 md:p-16 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-500 overflow-hidden flex flex-col items-center text-center">
            {/* Modal Navigation inside Modal */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-10 md:mb-12 relative z-10">
              {['Privacy', 'Security', 'Infrastructure'].map((tab) => (
                <button
                  key={tab}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveInfoTab(tab as InfoTab);
                  }}
                  className={`px-6 md:px-8 py-2.5 md:py-3 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all
                    ${activeInfoTab === tab ? 'bg-[#111] text-white shadow-xl' : 'bg-slate-50 border border-slate-200 text-slate-400 hover:text-indigo-600'}
                  `}
                >
                  {tab}
                </button>
              ))}
            </div>

            <h3 className="text-3xl md:text-5xl font-black italic text-slate-900 tracking-tighter mb-6 md:mb-8 leading-none">
              {info.title}
            </h3>
            
            <p className="text-base md:text-lg text-slate-500 font-medium leading-relaxed mb-10 md:mb-12 italic">
              {info.desc}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 w-full">
              {info.stats.map(s => (
                <div key={s} className="px-4 py-3 bg-white border border-slate-100 rounded-2xl text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 shadow-sm flex items-center justify-center">
                  {s}
                </div>
              ))}
            </div>

            <button 
              onClick={() => setActiveInfoTab(null)}
              className="mt-12 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] hover:text-slate-900 transition-colors"
            >
              Close Protocol
            </button>
          </div>
        </div>
      )}

      {/* 8. FOOTER */}
      <footer className="py-12 px-8 bg-white border-t border-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">© 2026 NextYou21 Protocol</p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            <button onClick={() => setActiveInfoTab('Privacy')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#111] transition-colors">Privacy</button>
            <button onClick={() => setActiveInfoTab('Security')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#111] transition-colors">Security</button>
            <button onClick={() => setActiveInfoTab('Infrastructure')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#111] transition-colors">Infrastructure</button>
          </div>
        </div>
      </footer>
    </div>
  );
};