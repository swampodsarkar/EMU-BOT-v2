import React from 'react';
import { useOS } from '../context/OSContext';
import * as Icons from 'lucide-react';

export function Store() {
  const { coins, timePacks, buyTimePack, playTimeRemaining, claimDailyFreeTime, canClaimFreeTime, openApp, addCoins, games } = useOS();

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center sticky top-0 z-10 shadow-md">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Icons.ShoppingCart className="w-6 h-6 text-cyan-400" />
          Time Shop
        </h2>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/50">
          <Icons.Coins className="w-4 h-4" />
          <span className="font-bold">{coins}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Current Time Balance */}
        <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Icons.Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Play Time Balance</div>
                <div className="text-2xl font-bold">{formatTime(playTimeRemaining)}</div>
              </div>
            </div>
            {canClaimFreeTime && (
              <button
                onClick={claimDailyFreeTime}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
              >
                <Icons.Gift className="w-4 h-4" />
                Claim Free 30m
              </button>
            )}
          </div>
        </div>

        {/* Time Packs */}
        <div>
          <h3 className="text-lg font-bold text-gray-300 mb-4 uppercase tracking-wider flex items-center gap-2">
            <Icons.Zap className="w-5 h-5 text-yellow-500" />
            Buy Time Packs
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {timePacks.map((pack, i) => (
              <div
                key={i}
                className="bg-gray-800 rounded-xl border border-gray-700 p-5 flex flex-col hover:border-cyan-500/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <Icons.Clock className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-black text-cyan-400">{pack.label}</div>
                </div>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-700">
                  <div className="flex items-center gap-1 text-yellow-400 font-bold">
                    <Icons.Coins className="w-4 h-4" />
                    {pack.cost}
                  </div>
                  <button
                    onClick={() => buyTimePack(pack.seconds, pack.cost)}
                    disabled={coins < pack.cost}
                    className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${
                      coins >= pack.cost
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Buy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Catalog - Admin Added */}
        <div>
          <h3 className="text-lg font-bold text-gray-300 mb-4 uppercase tracking-wider flex items-center gap-2">
            <Icons.Gamepad2 className="w-5 h-5 text-purple-500" />
            Available Games
          </h3>
          {games.length === 0 ? (
            <div className="bg-gray-800/50 rounded-xl border border-dashed border-gray-700 p-8 text-center text-gray-500">
              <Icons.Gamepad2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No games available yet. Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {games.map(game => (
                <div
                  key={game.id}
                  className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex hover:border-purple-500/50 transition-all group"
                >
                  <div className="w-[100px] shrink-0 bg-gray-700 overflow-hidden relative">
                    {game.coverImage ? (
                      <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl opacity-30"><Icons.Gamepad2 className="w-8 h-8" /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-800/80" />
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm truncate">{game.title}</h4>
                      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-mono">{game.core}</span>
                    </div>
                    <button
                      onClick={() => openApp('emulator', { game })}
                      className="mt-3 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 w-fit group-hover:shadow-[0_0_15px_rgba(147,51,234,0.3)]"
                    >
                      <Icons.Play className="w-3.5 h-3.5" /> PLAY
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Earn Coins */}
        <div className="bg-[#1e293b] rounded-xl border border-dashed border-yellow-500/30 p-5">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-yellow-400">
            <Icons.Coins className="w-5 h-5" />
            Need More Coins?
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Watch ads to earn coins, then use coins to buy time packs.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => openApp('ads')}
              className="flex-1 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/30 text-yellow-400 px-4 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Icons.PlaySquare className="w-5 h-5" />
              Watch Ads
            </button>
            <button
              onClick={() => openApp('rewards')}
              className="flex-1 bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/30 text-pink-400 px-4 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Icons.Gift className="w-5 h-5" />
              Daily Rewards
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
