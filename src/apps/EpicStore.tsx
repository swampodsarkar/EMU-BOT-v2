import React, { useState, useEffect } from 'react';
import { useOS } from '../context/OSContext';
import * as Icons from 'lucide-react';

export function EpicStore() {
  const { games, addNotification, user, installGame } = useOS();
  const epicGames = games.filter(g => g.store === 'epic');
  const [claimed, setClaimed] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('os_epic_claimed') || '[]'); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem('os_epic_claimed', JSON.stringify(claimed)); }, [claimed]);

  const handleClaim = (gameId: string) => {
    if (!user) { addNotification({ title: 'Sign In', message: 'Sign in to claim free games', icon: 'LogIn' }); return; }
    if (claimed.includes(gameId)) return;
    setClaimed(prev => [...prev, gameId]);
    installGame(gameId);
    addNotification({ title: 'Game Claimed', message: 'Added to your library!', icon: 'Gift' });
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      <div className="p-4 bg-gradient-to-r from-purple-900/50 to-gray-900 border-b border-gray-700 sticky top-0 z-10">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Icons.Gift className="w-6 h-6 text-purple-400" />
          Epic Games Store
        </h2>
        <p className="text-xs text-gray-500 mt-1">Free games — claim yours every week!</p>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {epicGames.map(game => {
            const isClaimed = claimed.includes(game.id);
            return (
              <div key={game.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden group hover:border-purple-500/50 transition-all relative">
                {isClaimed && <div className="absolute top-2 right-2 z-10 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1"><Icons.Check className="w-3 h-3" /> Claimed</div>}
                <div className="h-[140px] bg-gray-700 overflow-hidden relative">
                  {game.coverImage ? <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-gray-600"><Icons.Gift className="w-12 h-12" /></div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                  <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <Icons.Gift className="w-3 h-3" /> FREE
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm truncate">{game.title}</h3>
                  <div className="text-[10px] text-gray-500 uppercase font-mono mt-0.5">{game.core}</div>
                  {game.size && <div className="text-[10px] text-gray-500 mt-0.5">{game.size} MB</div>}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                    <div className="text-green-400 font-bold text-sm flex items-center gap-1"><Icons.Gift className="w-4 h-4" /> Free</div>
                    <button onClick={() => handleClaim(game.id)} disabled={isClaimed} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isClaimed ? 'bg-gray-700 text-gray-500 cursor-default' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}>
                      {isClaimed ? 'Claimed' : 'Claim'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {epicGames.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
              <Icons.Gift className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-bold mb-1">No Free Games Yet</p>
              <p className="text-sm">Only games with <span className="text-purple-400 font-bold">Epic</span> store tag appear here — admin can add from Profile → Admin Panel</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
