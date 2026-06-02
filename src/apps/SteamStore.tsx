import React from 'react';
import { useOS } from '../context/OSContext';
import * as Icons from 'lucide-react';

export function SteamStore() {
  const { games, coins, openApp, addNotification, installGame, spendCoins } = useOS();
  const steamGames = games.filter(g => g.store === 'steam' || !g.store);

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      <div className="p-4 bg-gradient-to-r from-blue-900/50 to-gray-900 border-b border-gray-700 flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Icons.Gamepad2 className="w-6 h-6 text-blue-400" />
          Steam Store
        </h2>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/50">
          <Icons.Coins className="w-4 h-4" />
          <span className="font-bold">{coins}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {steamGames.map(game => (
            <div key={game.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden group hover:border-blue-500/50 transition-all">
              <div className="h-[140px] bg-gray-700 overflow-hidden relative">
                {game.coverImage ? <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-gray-600"><Icons.Gamepad2 className="w-12 h-12" /></div>}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <Icons.Gamepad2 className="w-3 h-3" /> Steam
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-sm truncate">{game.title}</h3>
                <div className="text-[10px] text-gray-500 uppercase font-mono mt-0.5">{game.core}</div>
                {game.size && <div className="text-[10px] text-gray-500 mt-0.5">{game.size} MB</div>}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                  <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                    <Icons.Coins className="w-4 h-4" /> {game.price}
                  </div>
                  <button onClick={() => {
                    if (spendCoins(game.price)) {
                      installGame(game.id);
                      addNotification({ title: 'Purchased', message: `${game.title} added to library`, icon: 'CheckCircle' });
                    } else {
                      addNotification({ title: 'Error', message: 'Not enough coins!', icon: 'X' });
                    }
                  }} disabled={coins < game.price} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${coins >= game.price ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}>
                    Buy
                  </button>
                </div>
              </div>
            </div>
          ))}
          {steamGames.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
              <Icons.Gamepad2 className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-bold mb-1">Steam Store Empty</p>
              <p className="text-sm">Admin hasn't added Steam games yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
