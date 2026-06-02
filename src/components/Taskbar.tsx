import React, { useState, useEffect } from 'react';
import { useOS } from '../context/OSContext';
import * as Icons from 'lucide-react';
import { AppId, AppConfig } from '../types';

const APPS: AppConfig[] = [
  { id: 'library', name: 'Games', icon: 'Gamepad2' },
  { id: 'store', name: 'Store', icon: 'ShoppingCart' },
  { id: 'wallet', name: 'Wallet', icon: 'Coins' },
  { id: 'ads', name: 'Get Coins', icon: 'PlaySquare' },
  { id: 'rewards', name: 'Rewards', icon: 'Gift' },
  { id: 'leaderboard', name: 'Leaderboard', icon: 'Trophy' },
  { id: 'profile', name: 'Profile', icon: 'UserCircle' },
  { id: 'settings', name: 'Settings', icon: 'Settings' }
];

export function Taskbar() {
  const { windows, activeWindowId, openApp, minimizeWindow, focusWindow } = useOS();
  const [time, setTime] = useState(new Date());
  const [startOpen, setStartOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleWindowClick = (id: string, isMinimized: boolean) => {
    if (activeWindowId === id && !isMinimized) {
      minimizeWindow(id);
    } else {
      if (isMinimized) {
        openApp(windows.find(w => w.id === id)!.appId, windows.find(w => w.id === id)!.props);
      }
      focusWindow(id);
    }
  };

  const handleStartIconClick = (appId: AppId) => {
    openApp(appId);
    setStartOpen(false);
  };

  return (
    <div className="px-3 pb-2 w-full relative z-[99999]">
      <div className="h-[52px] w-full flex items-center px-1 justify-between relative bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
        {/* Start Menu */}
        {startOpen && (
          <div className="absolute bottom-full left-0 mb-3 ml-0 w-72 bg-gray-900/90 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 flex flex-col gap-1 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 border-b border-white/5">Applications</div>
            {APPS.map(app => {
              const Icon = (Icons as any)[app.icon];
              return (
                <button
                  key={app.id}
                  className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-left text-white transition-all hover:translate-x-1 active:scale-95 group"
                  onClick={() => handleStartIconClick(app.id)}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <Icon className="w-4 h-4 text-gray-300" />
                  </div>
                  <span className="font-semibold text-sm">{app.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Left side */}
        <div className="flex items-center gap-1.5 flex-1 overflow-hidden h-full">
          <button
            onClick={() => setStartOpen(!startOpen)}
            className="w-[48px] h-full flex items-center justify-center hover:bg-white/5 transition-colors group"
          >
            <Icons.LayoutGrid className="w-5 h-5 text-blue-400 transition-transform group-hover:rotate-90 duration-300" />
          </button>

          {/* Windows list */}
          <div className="flex gap-2 flex-1 overflow-x-auto min-w-0 items-center h-full px-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {windows.map(w => {
              const Icon = (Icons as any)[w.icon] || Icons.Box;
              const isActive = activeWindowId === w.id && !w.isMinimized;
              return (
                <button
                  key={w.id}
                  onClick={() => handleWindowClick(w.id, w.isMinimized)}
                  className={`flex items-center gap-2 px-4 h-[70%] rounded-xl min-w-min max-w-[200px] truncate transition-all text-[13px] font-medium
                    ${isActive 
                      ? 'bg-white/10 text-white border border-white/10 shadow-lg' 
                      : 'bg-transparent text-gray-400 border border-transparent hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-gray-500'}`} />
                  <span className="truncate">{w.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right side tray */}
        <div className="flex items-center gap-[15px] text-white text-[14px] shrink-0 px-4 h-full cursor-default hover:bg-white/5 transition-all rounded-r-2xl">
          <Icons.Volume2 className="w-4 h-4 cursor-pointer text-gray-400 hover:text-white transition-colors" />
          <Icons.Wifi className="w-4 h-4 cursor-pointer text-gray-400 hover:text-white transition-colors" />
          <div className="text-right leading-[1.1] select-none text-[12px] ml-2 font-mono tabular-nums">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            <br/>
            <span className="text-[10px] text-gray-500">
              {time.toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
