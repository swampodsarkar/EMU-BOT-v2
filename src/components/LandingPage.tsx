import React from 'react';
import * as Icons from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col selection:bg-blue-500/30">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen" />
        {/* Grid overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }} />
        {/* Floating glow dots */}
        {Array.from({length: 20}).map((_, i) => (
          <div key={i}
            className="absolute w-[3px] h-[3px] bg-blue-400/40 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out ${Math.random() * 5}s infinite`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <Icons.Gamepad2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">EMU bot</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#systems" className="hover:text-white transition-colors">Supported Systems</a>
          <a href="#community" className="hover:text-white transition-colors">Community</a>
        </nav>
        <button 
          onClick={onEnter}
          className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg text-sm font-bold border border-white/5 backdrop-blur-md transition-all hover:scale-105"
        >
          Launch OS Explorer
        </button>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center max-w-5xl mx-auto py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          EmulatorJS Core Integrated
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
          The Ultimate <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400">
            Web-Based Emulator OS
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Experience your favorite retro consoles directly in your browser. Powered by EmulatorJS and a full-fledged window management system to keep your game library, progress, and community all in one place.
        </p>

        {/* Animated mockup */}
        <div className="relative mb-12 w-full max-w-2xl mx-auto">
          <div className="mx-auto w-[90%] bg-[#0a0a1a] rounded-xl border border-white/[0.06] overflow-hidden shadow-[0_0_60px_rgba(59,130,246,0.1)]">
            {/* Window titlebar mockup */}
            <div className="flex items-center gap-2 px-4 h-[32px] bg-gradient-to-r from-[#1a1a3a] to-[#222244] border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 text-center text-[11px] text-gray-500 font-mono">Emulator - PlayStation</div>
            </div>
            {/* Mockup content */}
            <div className="relative aspect-video bg-gradient-to-br from-[#0d0d24] to-[#1a0a2e] flex items-center justify-center overflow-hidden">
              <div className="text-center">
                <div className="text-6xl mb-4 opacity-30">🎮</div>
                <div className="text-cyan-400/50 text-sm font-mono tracking-widest uppercase">Now Loading...</div>
              </div>
              {/* Scanline effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/[0.03] to-transparent bg-[length:100%_4px] animate-scanline" 
                style={{backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)'}} 
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button 
            onClick={onEnter}
            className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] flex items-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
            <Icons.MonitorPlay className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Start Playing Now</span>
          </button>
          <a 
            href="#systems"
            className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold text-lg transition-all flex items-center gap-3"
          >
            <Icons.List className="w-5 h-5" />
            View Library
          </a>
        </div>
      </main>

      {/* Feature Grid */}
      <section id="systems" className="relative z-10 bg-black/50 border-t border-white/5 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Supported Consoles</h2>
            <p className="text-gray-400 text-lg">Play thousands of classic titles across these legendary systems.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Nintendo NES', desc: 'The 8-bit legend', icon: 'Gamepad2', color: 'bg-red-500/10 text-red-400', border: 'border-red-500/10' },
              { title: 'Super Nintendo', desc: '16-bit perfection', icon: 'Tv', color: 'bg-purple-500/10 text-purple-400', border: 'border-purple-500/10' },
              { title: 'PlayStation 1', desc: 'Early 3D era', icon: 'Disc', color: 'bg-blue-500/10 text-blue-400', border: 'border-blue-500/10' },
              { title: 'SEGA Genesis', desc: 'Blast processing', icon: 'Zap', color: 'bg-yellow-500/10 text-yellow-400', border: 'border-yellow-500/10' }
            ].map((sys, i) => {
              const Icon = (Icons as any)[sys.icon];
              return (
                <div key={i} className={`group bg-gradient-to-br from-[#111] to-[#0a0a15] border ${sys.border} hover:border-white/20 p-6 rounded-2xl transition-all hover:translate-y-[-2px] hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${sys.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white/90">{sys.title}</h3>
                  <p className="text-gray-500 text-sm">{sys.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-white/5 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} EMU bot OS. Powered by React and EmulatorJS.</p>
      </footer>
    </div>
  );
}
