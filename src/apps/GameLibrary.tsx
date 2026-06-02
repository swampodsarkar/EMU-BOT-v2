import React, { useState } from 'react';
import { useOS } from '../context/OSContext';
import { ALL_GAMES } from '../data/games';
import * as Icons from 'lucide-react';

const SvgIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'nes':
      return (
        <svg viewBox="0 0 100 50" className="w-[18px] h-[18px] shrink-0" drop-shadow="true">
          <rect x="5" y="10" width="90" height="30" rx="3" fill="#D3D3D3" />
          <rect x="10" y="15" width="80" height="20" rx="1" fill="#111" />
          <path d="M 18 20 h 4 v -4 h 4 v 4 h 4 v 4 h -4 v 4 h -4 v -4 h -4 z" fill="#E0E0E0" />
          <rect x="42" y="26" width="8" height="3" rx="1.5" fill="#E0E0E0" />
          <rect x="54" y="26" width="8" height="3" rx="1.5" fill="#E0E0E0" />
          <circle cx="75" cy="25" r="4.5" fill="#E52521" />
          <circle cx="87" cy="25" r="4.5" fill="#E52521" />
        </svg>
      );
    case 'snes':
      return (
        <svg viewBox="0 0 100 50" className="w-[18px] h-[18px] shrink-0">
          <path d="M 25 10 h 50 a 15 15 0 0 1 15 15 v 0 a 15 15 0 0 1 -15 15 h -50 a 15 15 0 0 1 -15 -15 v 0 a 15 15 0 0 1 15 -15 z" fill="#C0C0C0" stroke="#999" strokeWidth="2" />
          <circle cx="25" cy="25" r="10" fill="#A0A0A0" />
          <circle cx="75" cy="25" r="10" fill="#A0A0A0" />
          <path d="M 21 23 h 3 v -3 h 3 v 3 h 3 v 3 h -3 v 3 h -3 v -3 h -3 z" fill="#222" />
          <rect x="44" y="26" width="6" height="2.5" transform="rotate(-30 47 27)" rx="1.2" fill="#444" />
          <rect x="52" y="26" width="6" height="2.5" transform="rotate(-30 55 27)" rx="1.2" fill="#444" />
          <circle cx="70" cy="25" r="2.5" fill="#400080" />
          <circle cx="75" cy="20" r="2.5" fill="#A080D0" />
          <circle cx="75" cy="30" r="2.5" fill="#400080" />
          <circle cx="80" cy="25" r="2.5" fill="#A080D0" />
        </svg>
      );
    case 'psx':
      return (
        <svg viewBox="0 0 100 60" className="w-[18px] h-[18px] shrink-0">
          <path d="M 15 35 Q 10 15, 30 15 L 70 15 Q 90 15, 85 35 L 80 50 Q 75 55, 70 40 L 65 30 L 35 30 L 30 40 Q 25 55, 20 50 Z" fill="#999" />
          <path d="M 22 25 h 3 v -3 h 3 v 3 h 3 v 3 h -3 v 3 h -3 v -3 h -3 z" fill="#222" />
          <circle cx="70" cy="22" r="2" fill="#222" />
          <circle cx="77" cy="27" r="2" fill="#222" />
          <circle cx="70" cy="32" r="2" fill="#222" />
          <circle cx="63" cy="27" r="2" fill="#222" />
        </svg>
      );
    case 'sega':
      return (
        <svg viewBox="0 0 100 50" className="w-[18px] h-[18px] shrink-0">
          <path d="M 25 10 h 50 a 15 20 0 0 1 15 20 v 0 a 15 10 0 0 1 -15 10 h -50 a 15 10 0 0 1 -15 -10 v 0 a 15 20 0 0 1 15 -20 z" fill="#111" />
          <circle cx="28" cy="25" r="12" fill="#222" />
          <path d="M 25 23 h 2 v -2 h 2 v 2 h 2 v 2 h -2 v 2 h -2 v -2 h -2 z" fill="#555" />
          <circle cx="68" cy="28" r="3" fill="#A00" />
          <circle cx="76" cy="25" r="3" fill="#A00" />
          <circle cx="84" cy="22" r="3" fill="#A00" />
        </svg>
      );
    case 'all':
      return (
        <svg viewBox="0 0 48 48" className="w-[18px] h-[18px] shrink-0">
          <rect x="6" y="6" width="14" height="14" rx="2" fill="#3B82F6" />
          <rect x="28" y="6" width="14" height="14" rx="2" fill="#10B981" />
          <rect x="6" y="28" width="14" height="14" rx="2" fill="#F59E0B" />
          <rect x="28" y="28" width="14" height="14" rx="2" fill="#EF4444" />
        </svg>
      );
    default:
      return <Icons.Gamepad2 className="w-[18px] h-[18px] shrink-0" />;
  }
};

export function GameLibrary() {
  const { openApp, games, playTimeRemaining } = useOS();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  
  let filtered = games.filter(g => g.title.toLowerCase().includes(search.toLowerCase()));
  if (filter !== 'all') {
    filtered = filtered.filter(g => g.core === filter);
  }

  return (
    <div className="h-full flex text-white relative">
      {/* Sidebar */}
      <div className="w-[180px] p-4 flex flex-col gap-1" style={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}>
        <div 
          onClick={() => setFilter('all')}
          className={`px-3 py-2 rounded-[6px] text-[14px] cursor-pointer flex items-center gap-[10px] ${filter === 'all' ? 'bg-white/10 text-white' : 'text-[#94a3b8] hover:bg-white/5'}`}
        >
          <SvgIcon type="all" /> All Games
        </div>
        <div 
          onClick={() => setFilter('nes')}
          className={`px-3 py-2 rounded-[6px] text-[14px] cursor-pointer flex items-center gap-[10px] ${filter === 'nes' ? 'bg-white/10 text-white' : 'text-[#94a3b8] hover:bg-white/5'}`}
        >
          <SvgIcon type="nes" /> NES Classics
        </div>
        <div 
          onClick={() => setFilter('snes')}
          className={`px-3 py-2 rounded-[6px] text-[14px] cursor-pointer flex items-center gap-[10px] ${filter === 'snes' ? 'bg-white/10 text-white' : 'text-[#94a3b8] hover:bg-white/5'}`}
        >
          <SvgIcon type="snes" /> SNES Hits
        </div>
        <div 
          onClick={() => setFilter('psx')}
          className={`px-3 py-2 rounded-[6px] text-[14px] cursor-pointer flex items-center gap-[10px] ${filter === 'psx' ? 'bg-white/10 text-white' : 'text-[#94a3b8] hover:bg-white/5'}`}
        >
          <SvgIcon type="psx" /> PS1 Originals
        </div>
        <div 
          onClick={() => setFilter('sega')}
          className={`px-3 py-2 rounded-[6px] text-[14px] cursor-pointer flex items-center gap-[10px] ${filter === 'sega' ? 'bg-white/10 text-white' : 'text-[#94a3b8] hover:bg-white/5'}`}
        >
          <SvgIcon type="sega" /> SEGA Genesis
        </div>
        
        <div 
          onClick={() => openApp('store')}
          className="mt-auto px-3 py-2 text-[#94a3b8] hover:bg-white/5 hover:text-white rounded-[6px] text-[14px] cursor-pointer flex items-center gap-[10px]"
        >
          <Icons.Clock className="w-[18px] h-[18px] shrink-0 text-cyan-400" /> Time Shop
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-[20px] overflow-y-auto w-full">
        <div className="flex justify-between items-center mb-[20px]">
          <div className="text-white text-[24px] font-bold flex items-center gap-3">
            Game Collection
            <span className={`text-[11px] font-mono font-bold px-2 py-1 rounded ${playTimeRemaining > 300 ? 'bg-green-900/50 text-green-400' : playTimeRemaining > 60 ? 'bg-yellow-900/50 text-yellow-400' : 'bg-red-900/50 text-red-400'}`}>
              <Icons.Clock className="w-3 h-3 inline mr-1" />
              {Math.floor(playTimeRemaining / 60)}:{String(playTimeRemaining % 60).padStart(2, '0')}
            </span>
          </div>
          <div className="relative">
            <Icons.Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-[#64748b]" />
            <input 
              type="text" 
              placeholder="Search games..." 
              className="bg-[#1e293b] text-[#64748b] text-[13px] rounded-[4px] pl-8 pr-3 py-1.5 focus:outline-none focus:text-white transition-colors"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-[#64748b]">
            <Icons.Gamepad2 className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-[14px] font-medium">No games found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-[20px]">
            {filtered.map(game => (
              <div 
                key={game.id} 
                className="bg-[#1e293b] rounded-[6px] overflow-hidden transition-transform hover:scale-105"
                style={{ border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="h-[120px] relative flex flex-col">
                  <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
                <div className="p-[12px]">
                  <div className="text-white text-[14px] font-semibold mb-1 truncate">{game.title}</div>
                  <div className="text-[#64748b] text-[11px] flex justify-between items-center uppercase mt-2">
                    <span className="flex items-center gap-1.5 font-bold">
                       <SvgIcon type={game.core === 'sega' ? 'sega' : game.core === 'psx' ? 'psx' : game.core === 'snes' ? 'snes' : 'nes'} />
                       {game.core === 'psx' ? 'PS1' : game.core === 'sega' ? 'GENESIS' : game.core}
                    </span>
                    <button 
                      className="bg-[#3b82f6] hover:bg-[#2563eb] text-white border-none px-3 py-1 rounded-[4px] text-[12px] font-semibold cursor-pointer transition-colors"
                      onClick={() => openApp('emulator', { game })}
                    >
                      PLAY
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
