import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '../context/OSContext';
import { ref, onValue, push, set, remove, get, update, query, orderByChild, limitToLast } from 'firebase/database';
import { db } from '../lib/firebase';
import { FriendProfile, ChatMessage } from '../types';
import * as Icons from 'lucide-react';

type SocialTab = 'friends' | 'requests' | 'voice';

export function Social() {
  const { user, addNotification, openApp, isPremium, friends } = useOS();
  const [tab, setTab] = useState<SocialTab>('friends');
  const [addFriendUid, setAddFriendUid] = useState('');
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [chatWith, setChatWith] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const reqRef = ref(db, `social/friendRequests/${user.uid}`);
    const unsub = onValue(reqRef, snap => {
      const data = snap.val();
      if (data) setPendingRequests(Object.values(data));
      else setPendingRequests([]);
    });
    const sentRef = ref(db, `social/sentRequests/${user.uid}`);
    const unsub2 = onValue(sentRef, snap => {
      const data = snap.val();
      if (data) setSentRequests(Object.values(data));
      else setSentRequests([]);
    });
    return () => { unsub(); unsub2(); };
  }, [user]);

  useEffect(() => { chatEndRef.current?.scrollIntoView(); }, [chatMessages]);

  useEffect(() => {
    if (!chatWith) return;
    const chatId = [user!.uid, chatWith].sort().join('_');
    const msgRef = query(ref(db, `social/chats/${chatId}/messages`), orderByChild('timestamp'), limitToLast(50));
    const unsub = onValue(msgRef, snap => {
      const data = snap.val();
      if (data) setChatMessages(Object.values(data).reverse());
      else setChatMessages([]);
    });
    return () => unsub();
  }, [chatWith, user]);

  const handleSendRequest = async () => {
    if (!addFriendUid.trim() || !user) return;
    const targetUid = addFriendUid.trim();
    if (targetUid === user.uid) { addNotification({ title: 'Error', message: 'Cannot add yourself', icon: 'X' }); return; }
    await set(ref(db, `social/sentRequests/${user.uid}/${targetUid}`), { uid: targetUid, displayName: targetUid, timestamp: Date.now() });
    await set(ref(db, `social/friendRequests/${targetUid}/${user.uid}`), { uid: user.uid, displayName: user.displayName || 'User', photoURL: user.photoURL, timestamp: Date.now() });
    setAddFriendUid('');
    addNotification({ title: 'Request Sent', message: `Friend request sent`, icon: 'UserPlus' });
  };

  const handleAccept = async (reqUid: string, reqName: string, reqPhoto?: string) => {
    if (!user) return;
    await set(ref(db, `social/friends/${user.uid}/${reqUid}`), { uid: reqUid, displayName: reqName, photoURL: reqPhoto, status: 'online', timestamp: Date.now() });
    await set(ref(db, `social/friends/${reqUid}/${user.uid}`), { uid: user.uid, displayName: user.displayName || 'User', photoURL: user.photoURL, status: 'online', timestamp: Date.now() });
    await remove(ref(db, `social/friendRequests/${user.uid}/${reqUid}`));
    await remove(ref(db, `social/sentRequests/${reqUid}/${user.uid}`));
    addNotification({ title: 'Friend Added', message: `${reqName} is now your friend`, icon: 'UserCheck' });
  };

  const handleRemoveFriend = async (friendUid: string) => {
    if (!user) return;
    await remove(ref(db, `social/friends/${user.uid}/${friendUid}`));
    await remove(ref(db, `social/friends/${friendUid}/${user.uid}`));
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !chatWith || !user) return;
    const chatId = [user.uid, chatWith].sort().join('_');
    const msgRef = ref(db, `social/chats/${chatId}/messages`);
    await push(msgRef, { from: user.uid, text: chatInput.trim(), timestamp: Date.now() });
    await update(ref(db, `social/chats/${chatId}/info`), { lastMessage: chatInput.trim(), lastTimestamp: Date.now(), lastFrom: user.displayName || 'User' });
    setChatInput('');
  };

  const onlineFriends = friends.filter(f => f.status === 'online');
  const offlineFriends = friends.filter(f => f.status === 'offline');

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-900 text-white p-8">
        <Icons.MessageCircle className="w-16 h-16 text-gray-600 mb-4" />
        <h2 className="text-xl font-bold mb-2">Sign in Required</h2>
        <p className="text-gray-400 text-sm text-center mb-6">Connect with Google to use Social features — add friends, chat, and voice hangout!</p>
        <button onClick={() => useOS().login()} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold flex items-center gap-2">
          <Icons.LogIn className="w-5 h-5" /> Sign in with Google
        </button>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-900 text-white p-8">
        <Icons.Crown className="w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Premium Feature</h2>
        <p className="text-gray-400 text-sm text-center mb-6">Social Hub (friends, chat, voice) is exclusive for premium users. Upgrade now!</p>
        <button onClick={() => openApp('store')} className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-lg font-bold">Upgrade to Premium</button>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-gray-900 text-white">
      {/* Left Sidebar */}
      <div className="w-[240px] bg-gray-950 border-r border-gray-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-800">
          <h2 className="font-bold text-sm uppercase tracking-wider text-gray-400">Social Hub</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <button onClick={() => setTab('friends')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${tab === 'friends' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800'}`}>
            <Icons.Users className="w-4 h-4" /> Friends <span className="ml-auto text-xs bg-blue-600/30 text-blue-300 px-1.5 py-0.5 rounded">{onlineFriends.length}</span>
          </button>
          <button onClick={() => setTab('requests')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${tab === 'requests' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800'}`}>
            <Icons.UserPlus className="w-4 h-4" /> Requests {pendingRequests.length > 0 && <span className="ml-auto text-xs bg-red-600/30 text-red-300 px-1.5 py-0.5 rounded">{pendingRequests.length}</span>}
          </button>
          <button onClick={() => setTab('voice')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${tab === 'voice' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800'}`}>
            <Icons.Headphones className="w-4 h-4" /> Voice Rooms
          </button>
          <div className="h-px bg-gray-800 my-3" />
          <div className="text-xs text-gray-600 px-3 uppercase font-bold tracking-wider mb-2">Online — {onlineFriends.length}</div>
          {onlineFriends.map(f => (
            <button key={f.uid} onClick={() => setChatWith(f.uid)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 text-sm transition-all">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
              <span className="truncate">{f.displayName}</span>
              {f.currentGame && <span className="ml-auto text-[10px] text-gray-500 truncate max-w-[80px]">{f.currentGame}</span>}
            </button>
          ))}
          {onlineFriends.length === 0 && <p className="text-xs text-gray-600 px-3">No friends online</p>}
          <div className="text-xs text-gray-600 px-3 uppercase font-bold tracking-wider mt-3 mb-2">Offline — {offlineFriends.length}</div>
          {offlineFriends.slice(0, 5).map(f => (
            <button key={f.uid} onClick={() => setChatWith(f.uid)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 text-sm transition-all">
              <span className="w-2 h-2 rounded-full bg-gray-600" />
              <span className="truncate">{f.displayName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {tab === 'friends' && !chatWith && (
          <div className="flex-1 flex flex-col p-6">
            <h3 className="text-lg font-bold mb-4">Add Friend</h3>
            <div className="flex gap-2 mb-6">
              <input value={addFriendUid} onChange={e => setAddFriendUid(e.target.value)} placeholder="Enter friend's User ID or Email..." className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500" onKeyDown={e => e.key === 'Enter' && handleSendRequest()} />
              <button onClick={handleSendRequest} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-sm flex items-center gap-2"><Icons.UserPlus className="w-4 h-4" /> Send Request</button>
            </div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">All Friends ({friends.length})</h3>
            <div className="flex-1 overflow-y-auto space-y-2">
              {onlineFriends.concat(offlineFriends).map(f => (
                <div key={f.uid} className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold">{f.displayName.charAt(0)}</div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900 ${f.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{f.displayName}</div>
                    <div className="text-xs text-gray-500">{f.status === 'online' ? (f.currentGame ? `Playing ${f.currentGame}` : 'Online') : 'Offline'}</div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setChatWith(f.uid)} className="p-2 hover:bg-gray-700 rounded-lg transition-colors" title="Chat"><Icons.MessageSquare className="w-4 h-4 text-blue-400" /></button>
                    <button onClick={() => handleRemoveFriend(f.uid)} className="p-2 hover:bg-red-900/30 rounded-lg transition-colors" title="Remove"><Icons.UserMinus className="w-4 h-4 text-red-400" /></button>
                  </div>
                </div>
              ))}
              {friends.length === 0 && <p className="text-gray-500 text-center py-8 text-sm">No friends added yet. Add friends above!</p>}
            </div>
          </div>
        )}

        {tab === 'requests' && (
          <div className="flex-1 p-6 overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Friend Requests</h3>
            {pendingRequests.length === 0 ? <p className="text-gray-500 text-sm">No pending requests</p> : (
              <div className="space-y-2">
                {pendingRequests.map((req: any, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-sm font-bold">{req.displayName?.charAt(0) || '?'}</div>
                    <div className="flex-1"><div className="font-medium text-sm">{req.displayName || req.uid}</div><div className="text-xs text-gray-500">Wants to be your friend</div></div>
                    <button onClick={() => handleAccept(req.uid, req.displayName, req.photoURL)} className="px-4 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-bold"><Icons.UserCheck className="w-3.5 h-3.5 inline mr-1" /> Accept</button>
                    <button onClick={() => remove(ref(db, `social/friendRequests/${user!.uid}/${req.uid}`))} className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-bold">Ignore</button>
                  </div>
                ))}
              </div>
            )}
            <h3 className="text-lg font-bold mt-8 mb-4">Sent Requests</h3>
            {sentRequests.length === 0 ? <p className="text-gray-500 text-sm">No sent requests</p> : (
              <div className="space-y-2">
                {sentRequests.map((req: any, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-sm font-bold">{req.displayName?.charAt(0) || '?'}</div>
                    <div className="flex-1"><div className="font-medium text-sm">{req.displayName || req.uid}</div><div className="text-xs text-gray-500">Request pending</div></div>
                    <button onClick={() => { remove(ref(db, `social/sentRequests/${user!.uid}/${req.uid}`)); remove(ref(db, `social/friendRequests/${req.uid}/${user!.uid}`)); }} className="px-4 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-xs font-bold">Cancel</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'voice' && (
          <div className="flex-1 p-6 overflow-y-auto">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Icons.Headphones className="w-5 h-5 text-purple-400" /> Voice Rooms</h3>
            <p className="text-gray-400 text-sm mb-4">Powered by Agora.io — crystal clear voice chat with friends while gaming!</p>
            <div className="bg-gray-800/50 border border-purple-500/20 rounded-xl p-6 text-center">
              <Icons.Headphones className="w-12 h-12 text-purple-500 mx-auto mb-3" />
              <h4 className="font-bold text-lg mb-1">Agora Voice Rooms</h4>
              <p className="text-gray-400 text-sm mb-4">Create a room, share the code with friends, and start talking!</p>
              <button onClick={() => openApp('voice')} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold"><Icons.ExternalLink className="w-4 h-4 inline mr-2" /> Open Voice Rooms</button>
            </div>
          </div>
        )}

        {chatWith && (
          <div className="flex-1 flex flex-col">
            <div className="p-3 border-b border-gray-800 flex items-center gap-3 bg-gray-900/50">
              <button onClick={() => setChatWith(null)} className="p-1 hover:bg-gray-800 rounded"><Icons.ArrowLeft className="w-5 h-5 text-gray-400" /></button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                {friends.find(f => f.uid === chatWith)?.displayName?.charAt(0) || '?'}
              </div>
              <span className="font-medium text-sm">{friends.find(f => f.uid === chatWith)?.displayName || 'User'}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, i) => {
                const isMe = msg.from === user!.uid;
                const friend = friends.find(f => f.uid === msg.from);
                return (
                  <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-md' : 'bg-gray-800 text-gray-200 rounded-bl-md'}`}>
                      {!isMe && <div className="text-[10px] text-blue-400 font-bold mb-0.5">{friend?.displayName || 'User'}</div>}
                      {msg.text}
                      <div className={`text-[9px] mt-1 ${isMe ? 'text-blue-200' : 'text-gray-500'}`}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 border-t border-gray-800">
              <div className="flex gap-2">
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message..." className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500" onKeyDown={e => e.key === 'Enter' && handleSendMessage()} />
                <button onClick={handleSendMessage} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg"><Icons.Send className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
