import React, { useState, useEffect } from 'react';
import { useOS } from '../context/OSContext';
import * as Icons from 'lucide-react';

const COOLDOWN_TIME = 300; // 5 minutes in seconds
const REWARD_AMOUNT = 50;

export function AdsManager() {
  const { addCoins, addNotification, trackAdClick } = useOS();
  const [cooldown, setCooldown] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [adProgress, setAdProgress] = useState(0);

  // Sync cooldown with localStorage
  useEffect(() => {
    const saved = localStorage.getItem('os_ad_cooldown');
    if (saved) {
      const remaining = parseInt(saved, 10) - Math.floor(Date.now() / 1000);
      if (remaining > 0) {
        setCooldown(remaining);
      }
    }
  }, []);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown(c => {
          if (c <= 1) {
            clearInterval(timer);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleWatchAd = () => {
    if (cooldown > 0 || isPlaying) return;
    
    setIsPlaying(true);
    setAdProgress(0);

    // Simulate watching a 5-second ad
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2; // 2% every 100ms = 5 seconds
      setAdProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          finishAd();
        }, 500);
      }
    }, 100);
  };

  const finishAd = () => {
    setIsPlaying(false);
    addCoins(REWARD_AMOUNT);
    trackAdClick();
    
    const nextAvailable = Math.floor(Date.now() / 1000) + COOLDOWN_TIME;
    localStorage.setItem('os_ad_cooldown', nextAvailable.toString());
    setCooldown(COOLDOWN_TIME);
    
    addNotification({
      title: 'Ad Reward',
      message: `You earned ${REWARD_AMOUNT} RC!`,
      icon: 'PlaySquare'
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white p-6 justify-center items-center">
      
      <div className="w-full max-w-sm bg-gray-800 border border-gray-700 rounded-xl p-6 text-center shadow-2xl relative overflow-hidden">
        
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
            <Icons.MonitorPlay className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Watch & Earn</h2>
          <p className="text-gray-400 text-sm">
            Watch a short video sponsor to earn <strong className="text-yellow-400">+{REWARD_AMOUNT} Coins</strong>.
          </p>
        </div>

        {isPlaying ? (
          <div className="space-y-4">
            <div className="h-32 bg-black rounded-lg border border-gray-700 flex items-center justify-center relative overflow-hidden">
               <span className="text-gray-500 text-sm font-bold uppercase tracking-widest z-10">Advertisement</span>
               <div className="absolute inset-0 bg-blue-500/10" style={{ width: `${adProgress}%` }} />
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-500 transition-all duration-100 ease-linear"
                style={{ width: `${adProgress}%` }}
              />
            </div>
            <p className="text-xs text-cyan-400 font-bold animate-pulse">Playing... Do not close window.</p>
          </div>
        ) : cooldown > 0 ? (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <Icons.Clock className="w-8 h-8 text-gray-500 mx-auto mb-3" />
            <h3 className="font-bold text-gray-300 mb-1">Cooldown Active</h3>
            <p className="text-gray-400 text-sm mb-4">New ads available in:</p>
            <div className="text-3xl font-mono font-bold text-cyan-400">
              {formatTime(cooldown)}
            </div>
          </div>
        ) : (
          <button 
            onClick={handleWatchAd}
            className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-lg shadow-lg shadow-cyan-900/50 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Icons.Play className="w-6 h-6 fill-current" />
            Watch Ad Now
          </button>
        )}

      </div>
      
    </div>
  );
}
