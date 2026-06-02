import React, { useState, useEffect } from 'react';
import { useOS } from '../context/OSContext';
import * as Icons from 'lucide-react';
import { ref, onValue, update, remove, get, set } from 'firebase/database';
import { db } from '../lib/firebase';

export function Profile() {
  const { user, login, logout, level, xp, totalPlayTime, unlockedGames, maintenanceMode, toggleMaintenanceMode, sendGlobalBroadcast, resetGlobalLeaderboard, addCustomGame, deleteCustomGame, activeUsers, totalAdClicks, games } = useOS();
  const [activeTab, setActiveTab] = useState('profile');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  
  // Custom game form state
  const [showAddGame, setShowAddGame] = useState(false);
  const [priceType, setPriceType] = useState<'free' | 'coins'>('free');
  const [newGame, setNewGame] = useState({
    title: '',
    romUrl: '',
    coverImage: '',
    core: 'nes',
    price: 0,
    store: 'steam' as 'steam' | 'epic',
    size: 100
  });

  const isAdmin = user?.email === 'mdswampodsarkar@gmail.com' || user?.email === 'mdswampodsarkar007@gmail.com';

  const handleBroadcast = () => {
    if (broadcastMessage.trim()) {
      sendGlobalBroadcast(broadcastMessage.trim());
      setBroadcastMessage('');
    }
  };

  const handleAddGame = () => {
    if (!newGame.title || !newGame.romUrl) return;
    
    let processedUrl = newGame.romUrl.trim();
    
    // Dropbox conversion
    if (processedUrl.includes('dropbox.com')) {
      processedUrl = processedUrl
        .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
        .replace(/[?&]dl=[01]/g, '');
    }
    
    // GitHub conversion
    if (processedUrl.includes('github.com') && processedUrl.includes('/blob/')) {
      processedUrl = processedUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    }

    const finalPrice = priceType === 'free' ? 0 : Number(newGame.price);

    addCustomGame({
      id: `custom-${Date.now()}`,
      title: newGame.title,
      romUrl: processedUrl,
      coverImage: newGame.coverImage || 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=300&h=400&fit=crop',
      core: newGame.core as any,
      price: finalPrice,
      store: newGame.store,
      size: Number(newGame.size) || 100
    });
    setShowAddGame(false);
    setNewGame({ title: '', romUrl: '', coverImage: '', core: 'nes', price: 0, store: 'steam', size: 100 });
    setPriceType('free');
  };

  return (
    <div className="h-full flex text-white relative">
      <div className="w-[180px] p-4 flex flex-col gap-1" style={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}>
        <div onClick={() => setActiveTab('profile')} className={`px-3 py-2 rounded-[6px] text-[14px] cursor-pointer flex items-center gap-[10px] ${activeTab === 'profile' ? 'bg-white/10 text-white' : 'text-[#94a3b8] hover:bg-white/5'}`}>
          <Icons.User className="w-4 h-4" /> Profile
        </div>
        <div onClick={() => setActiveTab('friends')} className={`px-3 py-2 rounded-[6px] text-[14px] cursor-pointer flex items-center gap-[10px] ${activeTab === 'friends' ? 'bg-white/10 text-white' : 'text-[#94a3b8] hover:bg-white/5'}`}>
          <Icons.Users className="w-4 h-4" /> Friends
        </div>
        <div onClick={() => setActiveTab('activity')} className={`px-3 py-2 rounded-[6px] text-[14px] cursor-pointer flex items-center gap-[10px] ${activeTab === 'activity' ? 'bg-white/10 text-white' : 'text-[#94a3b8] hover:bg-white/5'}`}>
          <Icons.Activity className="w-4 h-4" /> Activity Feed
        </div>
        <div onClick={() => setActiveTab('badges')} className={`px-3 py-2 rounded-[6px] text-[14px] cursor-pointer flex items-center gap-[10px] ${activeTab === 'badges' ? 'bg-white/10 text-white' : 'text-[#94a3b8] hover:bg-white/5'}`}>
          <Icons.Award className="w-4 h-4" /> Badges
        </div>
        {isAdmin && (
          <div onClick={() => setActiveTab('admin')} className={`px-3 py-2 rounded-[6px] text-[14px] cursor-pointer flex items-center gap-[10px] mt-4 font-bold ${activeTab === 'admin' ? 'bg-red-500/20 text-red-400' : 'text-red-400/70 hover:bg-red-500/10'}`}>
            <Icons.ShieldAlert className="w-4 h-4" /> Admin Panel
          </div>
        )}
      </div>

      <div className="flex-1 p-[20px] overflow-y-auto">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-4xl font-bold shadow-lg overflow-hidden">
                {user?.photoURL ? <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" /> : user?.displayName?.charAt(0) || 'G'}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{user ? user.displayName : 'Guest Player'}</h2>
                <div className="text-[#94a3b8] text-sm">Status: <span className="text-green-400">Online</span></div>
                <div className="mt-2 flex gap-4">
                  <div className="bg-[#1e293b] px-3 py-1.5 rounded text-sm border border-white/5"><span className="text-yellow-400 font-bold">LVL</span> {level}</div>
                  <div className="bg-[#1e293b] px-3 py-1.5 rounded text-sm border border-white/5"><span className="text-blue-400 font-bold">XP</span> {xp}</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#1e293b] p-4 rounded-lg border border-white/5 text-center">
                <div className="text-2xl font-bold">{unlockedGames.length}</div>
                <div className="text-xs text-[#64748b] uppercase">Games Owned</div>
              </div>
              <div className="bg-[#1e293b] p-4 rounded-lg border border-white/5 text-center">
                <div className="text-2xl font-bold">{Math.floor(totalPlayTime / 60)}h {totalPlayTime % 60}m</div>
                <div className="text-xs text-[#64748b] uppercase">Playtime</div>
              </div>
              <div className="bg-[#1e293b] p-4 rounded-lg border border-white/5 text-center">
                <div className="text-2xl font-bold">0</div>
                <div className="text-xs text-[#64748b] uppercase">Friends</div>
              </div>
            </div>
            
            <div className="bg-[#1e293b] p-4 rounded-lg border border-white/5">
              <h3 className="font-bold mb-2">Cloud Save Sync</h3>
              {user ? (
                <>
                  <p className="text-sm text-[#94a3b8] mb-4">Your progress is automatically saved to the cloud.</p>
                  <button onClick={logout} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 transition-colors">
                    <Icons.LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-[#94a3b8] mb-4">Your progress is currently saved locally. Sign in to sync across devices.</p>
                  <button onClick={login} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 transition-colors">
                    <Icons.Cloud className="w-4 h-4" /> Connect to Cloud
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'friends' && (
          <div>
            <h3 className="text-xl font-bold mb-4">Friends List</h3>
            {!user ? (
               <div className="text-[#94a3b8]">Please sign in to add friends.</div>
            ) : (
              <div className="text-[#94a3b8]">No friends added yet.</div>
            )}
          </div>
        )}

        {['activity', 'badges'].includes(activeTab) && (
          <div className="h-full flex items-center justify-center text-[#64748b]">
            <p>Feature under construction</p>
          </div>
        )}

        {activeTab === 'admin' && isAdmin && (
          <div>
            <h3 className="text-xl font-bold mb-4 text-red-400 flex items-center gap-2">
               <Icons.ShieldAlert className="w-6 h-6" /> System Administration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-[#1e293b] p-4 rounded-lg border border-red-500/20 text-center">
                 <h4 className="font-bold text-gray-400 mb-1 flex items-center justify-center gap-2"><Icons.Users className="w-4 h-4" /> Active Connections</h4>
                 <div className="text-3xl font-bold text-blue-400">{activeUsers.length}</div>
                 <div className="text-xs text-gray-500 mt-1">Live Guests & Users</div>
              </div>
              <div className="bg-[#1e293b] p-4 rounded-lg border border-red-500/20 text-center">
                 <h4 className="font-bold text-gray-400 mb-1 flex items-center justify-center gap-2"><Icons.PlaySquare className="w-4 h-4" /> Total Ad Clicks</h4>
                 <div className="text-3xl font-bold text-green-400">{totalAdClicks}</div>
                 <div className="text-xs text-gray-500 mt-1">Ads matched globally</div>
              </div>
            </div>

            <div className="bg-[#1e293b] p-4 rounded-lg border border-red-500/20 mb-4 max-h-60 overflow-y-auto">
               <h4 className="font-bold mb-3 flex items-center gap-2"><Icons.Activity className="w-4 h-4" /> Live Active Sessions ({activeUsers.length})</h4>
               <div className="space-y-2">
                 {activeUsers.map((u: any, i: number) => (
                   <div key={i} className="flex items-center gap-3 bg-black/40 p-2 rounded border border-green-500/20">
                     {u.photoURL ? <img src={u.photoURL} alt="" className="w-7 h-7 rounded-full" /> : <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-[10px] font-bold text-white">{u.displayName?.charAt(0) || 'G'}</div>}
                     <div className="flex-1 min-w-0">
                       <div className="text-sm font-bold text-white truncate">{u.displayName || (u.isGuest ? 'Guest' : 'User')}</div>
                       <div className="text-[10px] text-gray-500 flex items-center gap-2">
                         <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                         Active now
                       </div>
                     </div>
                     {u.isGuest ? (
                       <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded font-bold">GUEST</span>
                     ) : (
                       <span className="text-[10px] bg-blue-900/50 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30 font-bold">USER</span>
                     )}
                   </div>
                 ))}
               </div>
               {activeUsers.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No active users</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#1e293b] p-4 rounded-lg border border-red-500/20">
                 <h4 className="font-bold mb-2 flex items-center justify-between">
                   <span>Broadcast Notice</span>
                   <button 
                     onClick={() => sendGlobalBroadcast('')} 
                     className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded border border-red-500/20"
                   >
                     Clear Active
                   </button>
                 </h4>
                 <div className="flex gap-2">
                   <input 
                     type="text" 
                     placeholder="Message content..." 
                     value={broadcastMessage}
                     onChange={e => setBroadcastMessage(e.target.value)}
                     className="flex-1 bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none focus:border-red-500/50" 
                   />
                   <button onClick={handleBroadcast} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-bold transition-colors">
                     Post
                   </button>
                 </div>
                 <p className="text-[10px] text-gray-500 mt-2 italic">Broadcasts are visible to ALL users (Guest & Authed) in real-time.</p>
              </div>

              <div className="bg-[#1e293b] p-4 rounded-lg border border-red-500/20">
                 <h4 className="font-bold mb-2">System Controls</h4>
                 <div className="space-y-2">
                   <button onClick={toggleMaintenanceMode} className={`${maintenanceMode ? 'bg-yellow-600/50' : 'bg-yellow-600/20'} text-yellow-500 hover:bg-yellow-600/30 border border-yellow-500/30 px-4 py-2 rounded text-sm font-bold w-full text-left transition-colors flex justify-between`}>
                     <span>Toggle Maintenance Mode</span>
                     <span>{maintenanceMode ? 'ON' : 'OFF'}</span>
                   </button>
                   <button onClick={resetGlobalLeaderboard} className="bg-red-600/20 text-red-500 hover:bg-red-600/30 border border-red-500/30 px-4 py-2 rounded text-sm font-bold w-full text-left transition-colors">
                     Reset Global Leaderboard
                   </button>
                 </div>
              </div>

               <div className="bg-[#1e293b] p-4 rounded-lg border border-red-500/20 md:col-span-2">
                  <h4 className="font-bold mb-2">Content Management</h4>

                  {/* Existing Games List */}
                  <div className="mb-4 space-y-2 max-h-48 overflow-y-auto">
                    {games.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-3">No games added yet</p>
                    ) : (
                      games.map(g => (
                        <div key={g.id} className="flex items-center gap-3 bg-black/40 p-2.5 rounded border border-white/5">
                          <div className="w-8 h-8 rounded bg-gray-700 overflow-hidden shrink-0">
                            {g.coverImage ? <img src={g.coverImage} alt="" className="w-full h-full object-cover" /> : <Icons.Gamepad2 className="w-4 h-4 m-2 text-gray-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold truncate">{g.title}</div>
                            <div className="text-[10px] text-gray-500 truncate">{g.core} • {g.price > 0 ? `${g.price} coins` : 'Free'}</div>
                          </div>
                          <button onClick={() => deleteCustomGame(g.id)} className="p-1.5 hover:bg-red-600/20 rounded transition-colors" title="Delete game">
                            <Icons.Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {!showAddGame ? (
                    <button onClick={() => setShowAddGame(true)} className="bg-green-600/20 text-green-500 hover:bg-green-600/30 border border-green-500/30 px-4 py-2 rounded text-sm font-bold flex items-center justify-center gap-2 w-full transition-colors">
                       <Icons.Plus className="w-4 h-4" /> Add New Game
                    </button>
                 ) : (
                   <div className="space-y-3 bg-black/20 p-4 rounded mt-2 border border-green-500/20">
                      <div className="flex gap-2">
                        <input type="text" placeholder="Game Title (e.g., Super Mario)" className="flex-1 bg-black/50 border border-white/10 rounded px-3 py-2 text-sm" value={newGame.title} onChange={e => setNewGame({...newGame, title: e.target.value})} />
                        <select className="w-[110px] bg-black/50 border border-white/10 rounded px-2 py-2 text-sm text-white" value={newGame.store} onChange={e => setNewGame({...newGame, store: e.target.value as any})}>
                          <option value="steam">🟦 Steam</option>
                          <option value="epic">🟪 Epic</option>
                        </select>
                      </div>
                      <input type="text" placeholder="ROM URL (GitHub Raw, Dropbox, or Direct Link)" className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm" value={newGame.romUrl} onChange={e => setNewGame({...newGame, romUrl: e.target.value})} />
                      <div className="flex gap-2">
                        <input type="text" placeholder="Cover Image URL (optional)" className="flex-[3] bg-black/50 border border-white/10 rounded px-3 py-2 text-sm" value={newGame.coverImage} onChange={e => setNewGame({...newGame, coverImage: e.target.value})} />
                        <input type="number" min="1" placeholder="Size MB" className="flex-1 bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" value={newGame.size || ''} onChange={e => setNewGame({...newGame, size: Math.max(1, Number(e.target.value))})} />
                      </div>
                      <div className="flex gap-4">
                       <select className="flex-1 bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" value={newGame.core} onChange={e => setNewGame({...newGame, core: e.target.value})}>
                         <option value="nes">NES</option>
                         <option value="snes">SNES</option>
                         <option value="psx">PSX</option>
                         <option value="sega">SEGA</option>
                         <option value="n64">N64</option>
                         <option value="gba">GBA</option>
                         <option value="mame">MAME</option>
                         <option value="fba">CPS-1</option>
                       </select>
                        <div className="flex-[2] flex flex-col gap-1 text-left">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPriceType('free');
                                setNewGame(prev => ({ ...prev, price: 0 }));
                              }}
                              className={`flex-1 px-3 py-1.5 rounded text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                                priceType === 'free'
                                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 font-bold'
                                  : 'bg-black/40 border-white/10 hover:border-white/20 text-gray-400'
                              }`}
                            >
                              <Icons.Gift className="w-3.5 h-3.5" /> Free (ফ্রি)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPriceType('coins');
                                setNewGame(prev => ({ ...prev, price: 100 }));
                              }}
                              className={`flex-1 px-3 py-1.5 rounded text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                                priceType === 'coins'
                                  ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400 font-bold'
                                  : 'bg-black/40 border-white/10 hover:border-white/20 text-gray-400'
                              }`}
                            >
                              <Icons.Coins className="w-3.5 h-3.5" /> Coins (কয়েন লাগবে)
                            </button>
                          </div>
                          {priceType === 'coins' && (
                            <input 
                              type="number" 
                              min="1"
                              placeholder="Price in Coins (কয়েন সংখ্যা)" 
                              className="w-full bg-black/50 border border-white/10 rounded px-2.5 py-1 text-xs focus:border-yellow-500/50 outline-none mt-1 text-white" 
                              value={newGame.price || ''} 
                              onChange={e => setNewGame({...newGame, price: Math.max(1, Number(e.target.value))})} 
                            />
                          )}
                        </div>
                     </div>
                     <div className="flex gap-2">
                       <button onClick={handleAddGame} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded text-sm">Save Game</button>
                       <button onClick={() => setShowAddGame(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded text-sm">Cancel</button>
                     </div>
                   </div>
                  )}
               </div>
             </div>

            {/* Premium Requests Management */}
            <div className="bg-[#1e293b] p-4 rounded-lg border border-yellow-500/20 mt-4">
               <h4 className="font-bold mb-3 flex items-center gap-2"><Icons.Crown className="w-4 h-4 text-yellow-400" /> Premium Requests <span className="text-xs text-gray-500 font-normal">(499 BDT)</span></h4>
               <PremiumRequestsManager />
            </div>

            {/* User Premium Management */}
            <div className="bg-[#1e293b] p-4 rounded-lg border border-yellow-500/20 mt-4">
               <h4 className="font-bold mb-3 flex items-center gap-2"><Icons.Users className="w-4 h-4 text-yellow-400" /> All Users — Toggle Premium</h4>
               <AllUsersManager activeUsers={activeUsers} />
            </div>
           </div>
         )}
       </div>
     </div>
   );
}

function PremiumRequestsManager() {
  const { addNotification } = useOS();
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    const reqRef = ref(db, 'premium/requests');
    const unsub = onValue(reqRef, snap => {
      const data = snap.val();
      if (data) setRequests(Object.entries(data).map(([uid, v]: any) => ({ uid, ...v })));
      else setRequests([]);
    });
    return () => unsub();
  }, []);

  const handleApprove = async (uid: string) => {
    await update(ref(db, `users/${uid}`), { isPremium: true });
    await remove(ref(db, `premium/requests/${uid}`));
    addNotification({ title: 'Premium', message: `User ${uid} is now premium`, icon: 'Crown' });
  };

  const handleReject = async (uid: string) => {
    await remove(ref(db, `premium/requests/${uid}`));
  };

  if (requests.length === 0) return <p className="text-sm text-gray-500 text-center py-3">No pending premium requests</p>;

  return (
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {requests.map(r => (
        <div key={r.uid} className="flex items-center gap-3 bg-black/40 p-2.5 rounded border border-yellow-500/20">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold truncate">{r.displayName || r.email || r.uid}</div>
            <div className="text-[10px] text-gray-500">{r.method?.toUpperCase()} • Trx: {r.txnId} • {new Date(r.timestamp).toLocaleString()}</div>
          </div>
          <button onClick={() => handleApprove(r.uid)} className="px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded text-xs font-bold"><Icons.Check className="w-3.5 h-3.5" /> Approve</button>
          <button onClick={() => handleReject(r.uid)} className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-xs font-bold">Reject</button>
        </div>
      ))}
    </div>
  );
}

function AllUsersManager({ activeUsers }: { activeUsers: any[] }) {
  const { addNotification } = useOS();
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    const usersRef = ref(db, 'users');
    const unsub = onValue(usersRef, snap => {
      const data = snap.val();
      if (data) setAllUsers(Object.entries(data).map(([uid, v]: any) => ({ uid, ...v })));
      else setAllUsers([]);
    });
    return () => unsub();
  }, []);

  const activeUids = new Set(activeUsers.map((u: any) => u.uid || u.email));

  const togglePremium = async (uid: string, current: boolean) => {
    await update(ref(db, `users/${uid}`), { isPremium: !current });
    addNotification({ title: 'Premium', message: `${!current ? 'Activated' : 'Deactivated'} for user`, icon: 'Crown' });
  };

  return (
    <div className="space-y-2 max-h-60 overflow-y-auto">
      <div className="text-[11px] text-gray-500 mb-2 flex items-center gap-4">
        <span><span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-1" /> Online: {allUsers.filter(u => activeUids.has(u.uid)).length}</span>
        <span><span className="w-2 h-2 rounded-full bg-gray-600 inline-block mr-1" /> Offline: {allUsers.filter(u => !activeUids.has(u.uid)).length}</span>
      </div>
      {allUsers.length === 0 ? <p className="text-sm text-gray-500 text-center py-3">No users yet</p> : allUsers.map(u => {
        const isOnline = activeUids.has(u.uid);
        return (
        <div key={u.uid} className="flex items-center gap-3 bg-black/40 p-2.5 rounded border border-white/5">
          <span className={`relative flex w-2 h-2 shrink-0 ${isOnline ? 'text-green-500' : 'text-gray-600'}`}>
            <span className={`${isOnline ? 'animate-ping bg-green-400' : ''} absolute inline-flex h-full w-full rounded-full opacity-75`} />
            <span className={`relative inline-flex rounded-full w-2 h-2 ${isOnline ? 'bg-green-500' : 'bg-gray-600'}`} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold truncate">{u.displayName || u.email || u.uid}</div>
            <div className="text-[10px] text-gray-500 truncate">{u.email || 'No email'} {isOnline && <span className="text-green-400 font-bold ml-1">● Online</span>}</div>
          </div>
          <button onClick={() => togglePremium(u.uid, u.isPremium === true)} className={`px-3 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap ${u.isPremium ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
            {u.isPremium ? <><Icons.Crown className="w-3 h-3 inline mr-1" /> Premium</> : 'Set Premium'}
          </button>
        </div>
      );})}
    </div>
  );
}
