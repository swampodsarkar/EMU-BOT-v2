import React, { useState } from 'react';
import { useOS } from '../context/OSContext';
import { Taskbar } from './Taskbar';
import * as Icons from 'lucide-react';
import { AppId, AppConfig } from '../types';
import { GameLibrary } from '../apps/GameLibrary';
import { Wallet } from '../apps/Wallet';
import { Store } from '../apps/Store';
import { AdsManager } from '../apps/Ads';
import { Settings } from '../apps/Settings';
import { Emulator } from '../apps/Emulator';
import { Leaderboard } from '../apps/Leaderboard';
import { Profile } from '../apps/Profile';
import { Rewards } from '../apps/Rewards';
import { Social } from '../apps/Social';
import { VoiceRoomAgora } from '../apps/VoiceRoomAgora';
import { PremiumPurchase } from '../apps/PremiumPurchase';
import { Window } from './Window';
import { motion, AnimatePresence } from 'motion/react';

const DESKTOP_SHORTCUTS: AppConfig[] = [
  { id: 'library', name: 'My Games', icon: 'Gamepad2' },
  { id: 'store', name: 'Game Store', icon: 'ShoppingCart' },
  { id: 'emulator', name: 'Emulator', icon: 'MonitorPlay' },
  { id: 'wallet', name: 'Wallet', icon: 'Coins' },
  { id: 'ads', name: 'Watch Ads', icon: 'PlaySquare' },
  { id: 'leaderboard', name: 'Leaderboard', icon: 'Trophy' },
  { id: 'profile', name: 'Profile', icon: 'UserCircle' },
  { id: 'rewards', name: 'Rewards', icon: 'Gift' },
  { id: 'social', name: 'Social Hub', icon: 'MessageCircle' },
  { id: 'voice', name: 'Voice Rooms', icon: 'Headphones' },
  { id: 'premium', name: 'Premium', icon: 'Crown' },
  { id: 'settings', name: 'Settings', icon: 'Settings' }
];

export function Desktop() {
  const { windows, openApp, theme, maintenanceMode, activeUsers, recentGames, isAdmin, addNotification, globalBroadcast, notifications, removeNotification } = useOS();
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);

  React.useEffect(() => {
    if (isAdmin) return;

    const handleKeydown = (e: KeyboardEvent) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        addNotification({
          title: 'System Security',
          message: 'Source inspection is protected for administrators only.',
          icon: 'ShieldOff'
        });
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [isAdmin, addNotification]);

  const renderAppContent = (appId: AppId, props: any) => {
    switch (appId) {
      case 'library': return <GameLibrary />;
      case 'wallet': return <Wallet />;
      case 'store': return <Store />;
      case 'ads': return <AdsManager />;
      case 'settings': return <Settings />;
      case 'leaderboard': return <Leaderboard />;
      case 'profile': return <Profile />;
      case 'rewards': return <Rewards />;
      case 'social': return <Social />;
      case 'voice': return <VoiceRoomAgora roomCode={props?.roomCode} />;
      case 'premium': return <PremiumPurchase />;
      case 'emulator': return <Emulator game={props?.game} />;
      default: return <div className="p-4 text-white">App not found</div>;
    }
  };

  const getWindowDimensions = (appId: AppId) => {
    switch (appId) {
      case 'emulator': return { w: 800, h: 600 };
      case 'store': return { w: 700, h: 500 };
      case 'wallet': return { w: 400, h: 500 };
      case 'ads': return { w: 400, h: 550 };
      case 'settings': return { w: 400, h: 400 };
      case 'leaderboard': return { w: 450, h: 550 };
      case 'profile': return { w: 600, h: 500 };
      case 'social': return { w: 900, h: 600 };
      case 'voice': return { w: 500, h: 600 };
      case 'premium': return { w: 450, h: 650 };
      case 'rewards': return { w: 500, h: 550 };
      default: return { w: 700, h: 500 };
    }
  };

  const getAppIconSvg = (appId: string) => {
    switch (appId) {
      case 'library': return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%23FF9800' d='M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z'/%3E%3Cpath fill='%23FFF' d='M29.5,16c-1.381,0-2.5,1.119-2.5,2.5s1.119,2.5,2.5,2.5s2.5-1.119,2.5-2.5S30.881,16,29.5,16z M18.5,16 c-1.381,0-2.5,1.119-2.5,2.5s1.119,2.5,2.5,2.5s2.5-1.119,2.5-2.5S19.881,16,18.5,16z M24,34c-4.418,0-8-3.582-8-8h16 C32,30.418,28.418,34,24,34z'/%3E%3C/svg%3E";
      case 'store': return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%234CAF50' d='M39,12H9c-1.657,0-3,1.343-3,3v22c0,1.657,1.343,3,3,3h30c1.657,0,3-1.343,3-3V15C42,13.343,40.657,12,39,12z'/%3E%3Cpath fill='%23FFF' d='M16,15V9c0-4.418,3.582-8,8-8s8,3.582,8,8v6H16z'/%3E%3C/svg%3E";
      case 'wallet': return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%23FFC107' d='M4,24c0,11.045,8.955,20,20,20s20-8.955,20-20S35.045,4,24,4S4,12.955,4,24z'/%3E%3Cpath fill='%23FFF' d='M24,10c-7.732,0-14,6.268-14,14s6.268,14,14,14s14-6.268,14-14S31.732,10,24,10z'/%3E%3Ctext x='24' y='32' fill='%23FFC107' font-family='Arial' font-weight='bold' font-size='22' text-anchor='middle'%3E$%3C/text%3E%3C/svg%3E";
      case 'ads': return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%23F44336' d='M42,10H6c-2.2,0-4,1.8-4,4v20c0,2.2,1.8,4,4,4h36c2.2,0,4-1.8,4-4V14C46,11.8,44.2,10,42,10z'/%3E%3Cpath fill='%23FFF' d='M19,30l12-6l-12-6V30z'/%3E%3C/svg%3E";
      case 'leaderboard': return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%23FF9800' d='M24,4L5,13v9c0,12.5,8.1,24.1,19,27c10.9-2.9,19-14.5,19-27v-9L24,4z'/%3E%3Cpath fill='%23FFF' d='M24,10l4.6,9H40l-9.1,6.8L34.1,35L24,28.2L13.9,35l3.2-9.2L8,19h11.4L24,10z'/%3E%3C/svg%3E";
      case 'profile': return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%232196F3' d='M24,4C12.954,4,4,12.954,4,24s8.954,20,20,20s20-8.954,20-20S35.046,4,24,4z'/%3E%3Cpath fill='%23FFF' d='M24,10c-3.866,0-7,3.134-7,7s3.134,7,7,7s7-3.134,7-7S27.866,10,24,10z M36,36c0-4.418-5.373-8-12-8 s-12,3.582-12,8v2h24V36z'/%3E%3C/svg%3E";
      case 'rewards': return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%23E91E63' d='M40,14H8c-2.209,0-4,1.791-4,4v16c0,2.209,1.791,4,4,4h32c2.209,0,4-1.791,4-4V18C44,15.791,42.209,14,40,14z'/%3E%3Cpath fill='%23FFF' d='M24,14v24M16,14v24M32,14v24' stroke='%23FFF' stroke-width='4'/%3E%3Cpath fill='%23FFC107' d='M24,6c-2.2,0-4,1.8-4,4v4h8v-4C28,7.8,26.2,6,24,6z'/%3E%3C/svg%3E";
      case 'social': return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%238B5CF6' d='M24,4C12.954,4,4,12.954,4,24c0,4.5,1.5,8.7,4.1,12.1l-2.7,6.7c-0.3,0.7-0.1,1.5,0.5,2.1s1.4,0.8,2.1,0.5l6.7-2.7C16.9,44,20.4,45,24,45c11.046,0,20-8.954,20-20S35.046,4,24,4z'/%3E%3Cpath fill='%23FFF' d='M16,20c0,2.209-1.791,4-4,4s-4-1.791-4-4s1.791-4,4-4S16,17.791,16,20z M28,20c0,2.209-1.791,4-4,4s-4-1.791-4-4s1.791-4,4-4S28,17.791,28,20z M36,24c2.209,0,4-1.791,4-4s-1.791-4-4-4s-4,1.791-4,4S33.791,24,36,24z M14,32c0,5.523,4.477,10,10,10s10-4.477,10-10H14z'/%3E%3C/svg%3E";
      case 'voice': return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%237C3AED' d='M40,14H8c-2.2,0-4,1.8-4,4v12c0,2.2,1.8,4,4,4h8l4,6l4-6h16c2.2,0,4-1.8,4-4V18C44,15.8,42.2,14,40,14z'/%3E%3Cpath fill='%23FFF' d='M16,22c-1.1,0-2,0.9-2,2s0.9,2,2,2s2-0.9,2-2S17.1,22,16,22z M24,22c-1.1,0-2,0.9-2,2s0.9,2,2,2s2-0.9,2-2S25.1,22,24,22z M32,22c-1.1,0-2,0.9-2,2s0.9,2,2,2s2-0.9,2-2S33.1,22,32,22z'/%3E%3C/svg%3E";
      case 'premium': return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%23F59E0B' d='M24,4l5.5,11.2L42,17.3l-9,8.8l2.1,12.3L24,33.5L12.9,38.4L15,26.1L6,17.3l12.5-2.1L24,4z'/%3E%3Cpath fill='%23FFF' d='M24,8.5l3.8,7.7l0.5,1l1.1,0.2l8.6,1.4l-6.2,6.1l-0.8,0.8l0.2,1.1l1.5,8.5l-7.7-4l-1-0.5l-1,0.5l-7.7,4l1.5-8.5l0.2-1.1l-0.8-0.8L9.9,19l8.6-1.4l1.1-0.2l0.5-1L24,8.5z'/%3E%3C/svg%3E";
      case 'emulator': return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%23673AB7' d='M42,10H6c-2.2,0-4,1.8-4,4v20c0,2.2,1.8,4,4,4h36c2.2,0,4-1.8,4-4V14C46,11.8,44.2,10,42,10z'/%3E%3Cpath fill='%23FFF' d='M12,24h8M16,20v8M30,22a2,2,0,1,0,0,4,2,2,0,1,0,0-4zM36,22a2,2,0,1,0,0,4,2,2,0,1,0,0-4z' stroke='%23FFF' stroke-width='2'/%3E%3C/svg%3E";
      case 'settings': return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%23607D8B' d='M43.6,27.1l-3.3-1c-0.2-0.8-0.6-1.5-1.1-2.2l1.6-3c0.4-0.8,0.3-1.8-0.3-2.5l-2.4-2.4c-0.6-0.6-1.6-0.7-2.5-0.3 l-3,1.6c-0.6-0.4-1.3-0.8-2.1-1.1l-1-3.3c-0.3-0.9-1.1-1.5-2.1-1.5h-3.4c-1,0-1.8,0.6-2.1,1.5l-1,3.3c-0.8,0.3-1.5,0.7-2.2,1.1 l-3-1.6c-0.8-0.4-1.8-0.3-2.5,0.3l-2.4,2.4c-0.6,0.6-0.7,1.6-0.3,2.5l1.6,3c-0.4,0.6-0.8,1.4-1.1,2.2l-3.3,1 c-0.9,0.3-1.5,1.1-1.5,2.1v3.4c0,1,0.6,1.8,1.5,2.1l3.3,1c0.3,0.8,0.6,1.5,1.1,2.2l-1.6,3c-0.4,0.8-0.3,1.8,0.3,2.5l2.4,2.4 c0.6,0.6,1.6,0.7,2.5,0.3l3-1.6c0.6,0.4,1.4,0.8,2.2,1.1l1,3.3c0.3,0.9,1.1,1.5,2.1,1.5h3.4c1,0,1.8-0.6,2.1-1.5l1-3.3 c0.8-0.3,1.5-0.7,2.1-1.1l3,1.6c0.8,0.4,1.8,0.3,2.5-0.3l2.4-2.4c0.6-0.6,0.7-1.6,0.3-2.5l-1.6-3c0.4-0.6,0.8-1.3,1.1-2.2l3.3-1 c0.9-0.3,1.5-1.1,1.5-2.1v-3.4C45.1,28.2,44.5,27.4,43.6,27.1z M24,31c-3.9,0-7-3.1-7-7s3.1-7,7-7s7,3.1,7,7S27.9,31,24,31z'/%3E%3C/svg%3E";
      default: return null;
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      e.preventDefault();
      setContextMenu({ x: e.pageX, y: e.pageY });
    }
  };

  return (
    <div className={`h-screen w-full flex flex-col overflow-hidden theme-${theme}`}
         style={{ background: 'radial-gradient(circle at top left, #0B457F 0%, #021a30 50%, #001224 100%)', backgroundSize: 'cover' }}
         onClick={() => setContextMenu(null)}
         onContextMenu={handleContextMenu}>
      
      {/* Global Broadcast Bar */}
      {globalBroadcast && (
        <div className="w-full bg-red-600/90 backdrop-blur-md text-white py-1.5 px-4 flex items-center justify-between gap-3 z-[100] border-b border-white/10 shadow-lg relative h-10">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-tighter shrink-0">
            <Icons.ShieldAlert className="w-4 h-4 animate-pulse text-yellow-300" />
            LIVE NOTICE:
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="whitespace-nowrap text-sm font-medium animate-[marquee_25s_linear_infinite] hover:pause">
              {globalBroadcast.message} &nbsp; • &nbsp; {globalBroadcast.message} &nbsp; • &nbsp; {globalBroadcast.message} &nbsp; • &nbsp; {globalBroadcast.message}
            </div>
          </div>
          <div className="shrink-0 text-[10px] text-white/60 font-mono hidden md:block">
            {new Date(globalBroadcast.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}

      {/* Animated Background Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Grid Pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
        
        {/* Diagonal grid lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }} />

        {/* Glowing Orbs */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px]"
          animate={{ x: [0, 120, -60, 60, 0], y: [0, -60, 100, -40, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: '5%', left: '15%' }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full bg-purple-500/8 blur-[120px]"
          animate={{ x: [0, -100, 70, -50, 0], y: [0, 70, -50, 90, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: '55%', left: '60%' }}
        />
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full bg-cyan-400/8 blur-[100px]"
          animate={{ x: [0, 50, -70, 30, 0], y: [0, -40, 60, -70, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: '25%', left: '75%' }}
        />

        {/* Floating Data Particles */}
        {Array.from({length: 40}).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[2px] h-[2px] bg-white/30 rounded-full"
            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
            animate={{
              y: [0, -(20 + Math.random() * 40), 0],
              opacity: [0, 0.8 + Math.random() * 0.2, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 6,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Notifications Area */}
      <div className="absolute top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {notifications.map(n => {
            const Icon = (Icons as any)[n.icon || 'Bell'];
            return (
              <motion.div 
                key={n.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="bg-gray-800/95 backdrop-blur border border-gray-700 shadow-2xl rounded-lg p-3 w-72 flex items-start gap-3 pointer-events-auto"
              >
                <div className="mt-1 shrink-0 text-cyan-400">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white mb-0.5">{n.title}</div>
                  <div className="text-xs text-gray-300">{n.message}</div>
                </div>
                <button 
                  onClick={() => removeNotification(n.id)}
                  className="ml-auto shrink-0 text-gray-500 hover:text-white"
                >
                  <Icons.X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="absolute z-[999999] bg-[#2b2b2b] border border-[#444] shadow-2xl rounded py-1 w-48 text-sm text-gray-200"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="w-full text-left px-4 py-1.5 hover:bg-white/10 flex items-center gap-2" onClick={() => { openApp('settings'); setContextMenu(null); }}>
             <Icons.Settings className="w-4 h-4 text-blue-400" /> Personalize
          </button>
          <button className="w-full text-left px-4 py-1.5 hover:bg-white/10 flex items-center gap-2" onClick={() => { window.location.reload(); }}>
             <Icons.RefreshCw className="w-4 h-4 text-blue-400" /> Refresh
          </button>
          <div className="h-px bg-[#444] my-1 mx-2" />
          <button className="w-full text-left px-4 py-1.5 hover:bg-white/10 flex items-center gap-2" onClick={() => { openApp('store'); setContextMenu(null); }}>
             <Icons.ShoppingCart className="w-4 h-4 text-green-400" /> Get More Games
          </button>
        </div>
      )}

      {/* Desktop Area */}
      <div className="flex-1 relative w-full overflow-hidden flex" onContextMenu={(e) => e.stopPropagation()}>
        {/* Main Desktop Space */}
        <div className="flex-1 relative">
          {/* Desktop Icons */}
          <div className="absolute inset-0 p-6 grid grid-rows-[repeat(auto-fill,120px)] grid-flow-col gap-6 justify-start items-start content-start z-0 select-none">
            {DESKTOP_SHORTCUTS.map(shortcut => {
              const Icon = (Icons as any)[shortcut.icon] || Icons.Box;
              const svgUrl = getAppIconSvg(shortcut.id);

              return (
                <div key={shortcut.id} className="relative group">
                  <button
                    className="w-[90px] h-[105px] flex flex-col items-center justify-start py-3 cursor-pointer rounded-xl transition-all bg-white/[0.02] hover:bg-white/[0.08] border border-transparent hover:border-white/20 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] outline-none backdrop-blur-sm"
                    onDoubleClick={() => openApp(shortcut.id)}
                  >
                    <div className="w-[52px] h-[52px] mb-[8px] flex items-center justify-center drop-shadow-md transition-all group-hover:scale-110 group-hover:-translate-y-1">
                      {svgUrl ? (
                        <div className="relative">
                          <img src={svgUrl} className="w-[52px] h-[52px] object-contain drop-shadow-xl" alt={shortcut.name} draggable={false} />
                          {/* Gloss effect on hover */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                        </div>
                      ) : (
                        <Icon className="w-12 h-12 text-white/90" />
                      )}
                    </div>
                    <span className="text-white text-[12px] text-center font-semibold drop-shadow-lg px-1 leading-tight line-clamp-2" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
                      {shortcut.name}
                    </span>
                  </button>
                  
                  {/* Tooltip */}
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 translate-y-full opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 bg-black/80 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded border border-white/10 whitespace-nowrap">
                    Launch {shortcut.name}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Windows container */}
          <div className="absolute inset-0 pointer-events-none z-10 w-full h-full">
            {windows.map(w => {
              const dims = getWindowDimensions(w.appId);
              return (
                <Window key={w.id} window={w} defaultWidth={dims.w} defaultHeight={dims.h}>
                  {renderAppContent(w.appId, w.props)}
                </Window>
              );
            })}
          </div>
        </div>
      </div>

      <Taskbar />

      {/* Maintenance Mode Overlay */}
      {maintenanceMode && !isAdmin && (
        <div className="absolute inset-0 z-[100000] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center text-white" onContextMenu={(e) => e.stopPropagation()}>
           <Icons.Wrench className="w-24 h-24 mb-6 text-yellow-500 animate-pulse" />
           <h1 className="text-4xl font-bold mb-4 tracking-wider">SYSTEM UNDER MAINTENANCE</h1>
           <p className="text-gray-400 text-lg max-w-md text-center">
             We are currently upgrading the servers. Please check back later. Your data is safe.
           </p>
        </div>
      )}
    </div>
  );
}
