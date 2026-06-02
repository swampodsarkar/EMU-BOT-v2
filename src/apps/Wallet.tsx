import React, { useState, useEffect } from 'react';
import { useOS } from '../context/OSContext';
import * as Icons from 'lucide-react';

export function Wallet() {
  const { coins, openApp, addCoins, addNotification, playTimeRemaining } = useOS();
  const [canClaimDaily, setCanClaimDaily] = useState(false);

  useEffect(() => {
    const lastClaim = localStorage.getItem('os_daily_bonus');
    if (!lastClaim) {
      setCanClaimDaily(true);
    } else {
      const lastClaimDate = new Date(parseInt(lastClaim, 10));
      const today = new Date();
      if (lastClaimDate.getDate() !== today.getDate() || lastClaimDate.getMonth() !== today.getMonth() || lastClaimDate.getFullYear() !== today.getFullYear()) {
        setCanClaimDaily(true);
      }
    }
  }, []);

  const handleClaimDaily = () => {
    if (!canClaimDaily) return;
    
    addCoins(100);
    localStorage.setItem('os_daily_bonus', Date.now().toString());
    setCanClaimDaily(false);
    
    addNotification({
      title: 'Daily Bonus',
      message: 'You claimed 100 RC!',
      icon: 'Gift'
    });
  };

  return (
    <div className="h-full flex flex-col p-[20px] text-white">
      <div 
        className="mx-auto w-full max-w-[300px] flex flex-col items-center mt-10 rounded-[12px] p-[24px]"
        style={{ background: 'rgba(30,41,59,0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="text-[11px] uppercase tracking-[1px] text-[#94a3b8] mb-[8px] w-full">Current Balance</div>
        <div className="text-[36px] font-[700] text-[#fbbf24] flex items-center gap-[8px] w-full">
          {coins.toLocaleString()} <span className="text-[16px] text-[#94a3b8]">RC</span>
        </div>

        <div className="w-full mt-3 bg-[#1e293b] rounded-lg p-3 border border-white/5">
          <div className="text-[10px] uppercase tracking-[1px] text-[#94a3b8] mb-1">Play Time Remaining</div>
          <div className="text-[24px] font-[700] text-[#3b82f6]">
            {Math.floor(playTimeRemaining / 60)}:{String(playTimeRemaining % 60).padStart(2, '0')}
          </div>
        </div>
        
        {canClaimDaily ? (
          <button 
             onClick={handleClaimDaily}
             className="w-full mt-[16px] rounded-[8px] p-[10px] text-center text-[13px] font-bold cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-105"
             style={{ background: 'linear-gradient(45deg, #fbbf24, #f59e0b)', color: '#000', border: 'none' }}
          >
             <Icons.Gift className="w-5 h-5" />
             Claim Daily Bonus (100 RC)
          </button>
        ) : (
          <div className="text-[11px] text-[#10b981] mt-[8px] w-full font-bold">Daily Bonus Claimed!</div>
        )}

        <div 
          onClick={() => openApp('ads')}
          className="mt-[24px] w-full rounded-[8px] p-[12px] text-center text-[13px] cursor-pointer transition-colors hover:bg-[#fbbf24]/20"
          style={{ background: 'rgba(251,191,36,0.1)', border: '1px dashed #fbbf24', color: '#fbbf24' }}
        >
          📺 Watch Ad for Coins
        </div>

        <div 
          onClick={() => openApp('store')}
          className="mt-[12px] w-full rounded-[8px] p-[12px] text-center text-[13px] cursor-pointer transition-colors hover:bg-[#3b82f6]/20"
          style={{ background: 'rgba(59,130,246,0.1)', border: '1px dashed #3b82f6', color: '#3b82f6' }}
        >
          🕒 Buy Time Packs
        </div>
      </div>
      
      <div className="overflow-y-auto mt-6" style={{ maxHeight: '200px' }}>
        <h3 className="text-[13px] font-bold text-[#94a3b8] mb-3 uppercase">Transaction Log</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center bg-[#1e293b] p-3 rounded border border-white/5">
            <div className="flex items-center gap-3">
              <Icons.Gift className="w-4 h-4 text-yellow-400" />
              <div className="text-sm">Daily Bonus</div>
            </div>
            <div className="text-green-400 font-bold">+100 RC</div>
          </div>
          <div className="flex justify-between items-center bg-[#1e293b] p-3 rounded border border-white/5">
            <div className="flex items-center gap-3">
              <Icons.PlaySquare className="w-4 h-4 text-blue-400" />
              <div className="text-sm">Ad Reward</div>
            </div>
            <div className="text-green-400 font-bold">+50 RC</div>
          </div>
          <div className="flex justify-between items-center bg-[#1e293b] p-3 rounded border border-white/5">
            <div className="flex items-center gap-3">
              <Icons.UserPlus className="w-4 h-4 text-purple-400" />
              <div className="text-sm">Referral Bonus</div>
            </div>
            <div className="text-green-400 font-bold">+500 RC</div>
          </div>
        </div>
      </div>
      
      <div className="mt-auto pt-6 text-center text-[11px] text-[#64748b]">
        Coins are stored locally. Clearing your browser data may reset your balance.
      </div>
    </div>
  );
}
