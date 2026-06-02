import React from 'react';
import { useOS } from '../context/OSContext';
import * as Icons from 'lucide-react';

export function ThisPC() {
  const { user, installedGames, games, storageUsed, maxStorage } = useOS();
  const pct = maxStorage > 0 ? Math.round((storageUsed / maxStorage) * 100) : 0;

  const myGames = games.filter(g => installedGames.includes(g.id));
  const free = maxStorage - storageUsed;
  const freeGB = (free / 1000).toFixed(1);

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      <div className="p-4 bg-gradient-to-r from-cyan-900/50 to-gray-900 border-b border-gray-700 sticky top-0 z-10">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Icons.Monitor className="w-6 h-6 text-cyan-400" />
          This PC
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {!user && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 text-center mb-6">
            <Icons.User className="w-10 h-10 mx-auto mb-2 text-gray-600" />
            <p className="text-gray-500 text-sm">Sign in for personalized storage</p>
          </div>
        )}

        <div className="space-y-3">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 hover:border-cyan-500/30 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center border border-cyan-500/30">
                <Icons.HardDrive className="w-7 h-7 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base">Local Disk (C:)</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${user?.isPremium ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'}`}>
                    {user?.isPremium ? 'PREMIUM' : 'STANDARD'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">EMU OS Virtual Drive</div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : 'bg-cyan-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 font-mono whitespace-nowrap">{pct}%</span>
                </div>
                <div className="flex justify-between text-[11px] text-gray-500 mt-1">
                  <span>{storageUsed} MB used</span>
                  <span>{freeGB} GB free</span>
                </div>
                <div className="flex gap-4 mt-2 text-[11px] text-gray-500">
                  <span>Total: {maxStorage >= 1000 ? `${(maxStorage / 1000).toFixed(0)} GB` : `${maxStorage} MB`}</span>
                  <span>Available: {free >= 1000 ? `${freeGB} GB` : `${free} MB`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2"><Icons.FolderOpen className="w-4 h-4" /> Installed Games ({myGames.length})</h3>
          <div className="space-y-2">
            {myGames.map(game => (
              <div key={game.id} className="bg-gray-800 rounded-lg border border-gray-700 p-3 flex items-center gap-3 hover:border-cyan-500/30 transition-all">
                <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-gray-500">
                  <Icons.Gamepad2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{game.title}</div>
                  <div className="text-[10px] text-gray-500">{game.size || 0} MB • {game.store === 'epic' ? 'Epic Games' : 'Steam'}</div>
                </div>
                <div className="text-[11px] text-gray-500 font-mono">{game.core}</div>
              </div>
            ))}
            {myGames.length === 0 && (
              <div className="text-center py-10 text-gray-600">
                <Icons.FolderX className="w-10 h-10 mx-auto mb-2" />
                <p className="text-sm">No games installed yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
