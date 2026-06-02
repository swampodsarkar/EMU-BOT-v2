import React, { useEffect, useState } from 'react';
import { useOS } from '../context/OSContext';
import * as Icons from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, query, orderByChild, limitToLast, get } from 'firebase/database';

export function Leaderboard() {
  const { user, login, totalPlayTime } = useOS();
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const formatPlayTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  };

  useEffect(() => {
    if (!user) return;
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const usersRef = query(ref(db, 'users'), orderByChild('totalPlayTime'), limitToLast(30));
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const sorted = Object.values(data)
            .sort((a: any, b: any) => (b.totalPlayTime || 0) - (a.totalPlayTime || 0))
            .map((p: any, i) => ({ ...p, rank: i + 1 }));
          setPlayers(sorted);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchLeaderboard();
  }, [user]);

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center">
        <Icons.Lock className="w-16 h-16 text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Leaderboard Locked</h2>
        <p className="text-gray-400 mb-6 max-w-sm">Sign in to compete with other players and climb the global playtime rankings!</p>
        <button onClick={login} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors">
          <Icons.LogIn className="w-5 h-5" /> Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center sticky top-0 z-10 shadow-md">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Icons.Trophy className="w-6 h-6 text-yellow-500" />
          Pro Gamers Ranking
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Current Player Status */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border border-blue-500/30 rounded-2xl p-5 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center font-bold text-xl overflow-hidden shadow-inner">
               {user.photoURL ? <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" /> : user.displayName?.charAt(0) || 'U'}
             </div>
             <div>
               <div className="font-bold text-base text-white">{user.displayName} (You)</div>
               <div className="text-xs text-blue-400 flex items-center gap-1 mt-1 font-semibold uppercase tracking-wider">
                 <Icons.Clock className="w-3 h-3" /> Total Activity
               </div>
             </div>
          </div>
          <div className="text-right">
             <div className="text-2xl font-black text-white leading-none">
               {formatPlayTime(totalPlayTime)}
             </div>
             <div className="text-[10px] text-gray-500 mt-1 uppercase font-bold">Total Playtime</div>
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="bg-gray-800/50 rounded-2xl border border-white/5 overflow-hidden min-h-[200px] relative backdrop-blur-sm">
          {loading ? (
             <div className="absolute inset-0 flex items-center justify-center text-gray-400">
               <Icons.Activity className="w-6 h-6 animate-pulse text-blue-500" />
             </div>
          ) : (
            players.map((player) => (
              <div 
                key={player.uid || player.displayName}
                className={`flex items-center justify-between p-4 group transition-colors hover:bg-white/5 ${player.rank !== players.length ? 'border-b border-white/5' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black font-mono text-lg
                    ${player.rank === 1 ? 'bg-yellow-400/10 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.2)]' : 
                      player.rank === 2 ? 'bg-gray-400/10 text-gray-300' : 
                      player.rank === 3 ? 'bg-amber-600/10 text-amber-500' : 'bg-white/5 text-gray-500'}
                  `}>
                    {player.rank}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-700 overflow-hidden border border-white/10">
                      {player.photoURL ? <img src={player.photoURL} alt="" /> : <Icons.User className="w-full h-full p-2 text-gray-500" />}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-gray-100 group-hover:text-white transition-colors">{player.displayName || 'Unknown Player'}</div>
                      <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Verified Gamer</div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-blue-400 flex items-center gap-1.5 text-sm">
                    {formatPlayTime(player.totalPlayTime || 0)}
                  </div>
                  <div className="text-[9px] text-gray-600 uppercase font-bold">Total Time</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
