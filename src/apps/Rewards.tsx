import React, { useState } from 'react';
import { useOS } from '../context/OSContext';
import * as Icons from 'lucide-react';
import { motion } from 'motion/react';

export function Rewards() {
  const { addCoins, addNotification } = useOS();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    const newRot = rotation + 360 * 5 + Math.floor(Math.random() * 360);
    setRotation(newRot);
    
    setTimeout(() => {
      setSpinning(false);
      addCoins(250);
      addNotification({
        title: 'Lucky Spin!',
        message: 'You won 250 RC.',
        icon: 'Gift'
      });
    }, 3000);
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-pink-500">
          <Icons.Gift className="w-6 h-6" /> Rewards Center
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lucky Spin */}
        <div className="bg-[#1e293b] p-6 rounded-xl border border-white/10 flex flex-col items-center">
          <h3 className="font-bold text-lg mb-4 text-yellow-400">Lucky Spin</h3>
          <div className="relative mb-6">
            <div 
              className="w-32 h-32 rounded-full border-4 border-yellow-500 bg-gradient-to-tr from-yellow-600 to-red-500 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.5)] transition-transform duration-[3000ms] ease-out"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">🎁</span>
              </div>
              <div className="absolute top-0 w-1 h-full bg-yellow-300 opacity-50" />
              <div className="absolute left-0 w-full h-1 bg-yellow-300 opacity-50" />
            </div>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-6 bg-white clip-polygon-[50%_100%,0_0,100%_0] z-10" />
          </div>
          <button 
            onClick={handleSpin}
            disabled={spinning}
            className={`px-6 py-2 rounded font-bold transition-all ${spinning ? 'bg-gray-600' : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:scale-105'}`}
          >
            {spinning ? 'Spinning...' : 'Spin Now (Free)'}
          </button>
        </div>

        {/* Daily Missions */}
        <div className="flex flex-col gap-3">
          <h3 className="font-bold text-lg mb-2 text-blue-400 flex items-center gap-2">
            <Icons.Zap className="w-5 h-5 text-yellow-500" /> Daily Missions
          </h3>
          
          <div className="bg-[#1e293b] p-4 rounded-xl border border-white/5 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold">Watch 5 Sponsored Ads</span>
                <span className="text-gray-400">{useOS().missions.ads} / 5</span>
              </div>
              <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(useOS().missions.ads / 5) * 100}%` }}
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold">Play Emulator Games</span>
                <span className="text-gray-400">{useOS().missions.playTime} / 30m</span>
              </div>
              <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(useOS().missions.playTime / 30) * 100}%` }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                />
              </div>
            </div>

            {(useOS().missions.ads >= 5 && useOS().missions.playTime >= 30) ? (
              <button 
                onClick={() => {
                  addCoins(500);
                  addNotification({ title: 'Success', message: 'Daily Bonus 500 RC Claimed!', icon: 'CheckCircle' });
                }}
                className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition-colors shadow-lg shadow-green-900/20"
              >
                Claim Grand Reward (500 RC)
              </button>
            ) : (
              <div className="text-center py-2 bg-white/5 rounded-lg text-xs text-gray-500 border border-dashed border-white/10">
                Complete all missions to unlock rewards
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
