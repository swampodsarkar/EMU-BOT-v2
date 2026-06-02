import React, { useState, useEffect, useRef, useCallback } from 'react';
import AgoraRTC, { IAgoraRTCClient, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { useOS } from '../context/OSContext';
import * as Icons from 'lucide-react';

const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID || '78e0fd577ac24263a2dcb2d9397c8bba';

interface RoomUser {
  uid: number;
  name: string;
  micOn: boolean;
  speaking: boolean;
}

export function VoiceRoomAgora({ roomCode: initialCode }: { roomCode?: string }) {
  const { user, addNotification, isPremium } = useOS();
  const [roomCode, setRoomCode] = useState(initialCode || '');
  const [inputCode, setInputCode] = useState('');
  const [inRoom, setInRoom] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [users, setUsers] = useState<RoomUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localTrackRef = useRef<IMicrophoneAudioTrack | null>(null);

  const handleCreateRoom = useCallback(async () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);
    navigator.clipboard?.writeText(code);
    addNotification({ title: 'Room Created', message: `Code: ${code} (copied to clipboard)`, icon: 'Headphones' });
  }, [addNotification]);

  const handleJoinRoom = useCallback(async (code?: string) => {
    const joinCode = code || inputCode.trim().toUpperCase();
    if (!joinCode || joinCode.length < 4) {
      addNotification({ title: 'Error', message: 'Enter a valid room code (4+ characters)', icon: 'X' });
      return;
    }
    if (!AGORA_APP_ID) {
      addNotification({ title: 'Agora Not Configured', message: 'Set VITE_AGORA_APP_ID in .env', icon: 'X' });
      return;
    }

    setIsLoading(true);
    try {
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;

      await client.join(AGORA_APP_ID, joinCode, null, null);

      const localTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localTrackRef.current = localTrack;
      await client.publish(localTrack);

      const localUid = client.uid !== null ? (typeof client.uid === 'number' ? client.uid : parseInt(client.uid as string) || Math.floor(Math.random() * 10000)) : Math.floor(Math.random() * 10000);

      setUsers(prev => [...prev.filter(u => u.uid !== localUid), { uid: localUid as number, name: user?.displayName || 'You', micOn: true, speaking: false }]);
      setMicEnabled(true);
      setRoomCode(joinCode);
      setInRoom(true);

      client.on('user-published', async (remoteUser, mediaType) => {
        await client.subscribe(remoteUser, mediaType);
        if (mediaType === 'audio') {
          remoteUser.audioTrack?.play();
          setUsers(prev => {
            if (prev.find(u => u.uid === remoteUser.uid)) return prev;
            return [...prev, { uid: remoteUser.uid as number, name: `User-${String(remoteUser.uid).slice(0, 4)}`, micOn: true, speaking: false }];
          });
        }
      });

      client.on('user-left', (remoteUser) => {
        setUsers(prev => prev.filter(u => u.uid !== remoteUser.uid));
      });

      client.on('volume-indicator', (volumes) => {
        setUsers(prev => prev.map(u => ({ ...u, speaking: volumes.some(v => v.uid === u.uid && v.level > 30) })));
      });

    } catch (e: any) {
      addNotification({ title: 'Join Failed', message: e.message || 'Could not join room', icon: 'X' });
    }
    setIsLoading(false);
  }, [inputCode, user, addNotification]);

  const handleLeaveRoom = useCallback(async () => {
    localTrackRef.current?.close();
    await clientRef.current?.leave();
    clientRef.current = null;
    localTrackRef.current = null;
    setInRoom(false);
    setRoomCode('');
    setUsers([]);
  }, []);

  const toggleMic = useCallback(async () => {
    if (localTrackRef.current) {
      if (micEnabled) {
        await localTrackRef.current.setEnabled(false);
      } else {
        await localTrackRef.current.setEnabled(true);
      }
      setMicEnabled(!micEnabled);
    }
  }, [micEnabled]);

  useEffect(() => {
    return () => { handleLeaveRoom(); };
  }, [handleLeaveRoom]);

  if (!isPremium) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-900 text-white p-8">
        <Icons.Crown className="w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Premium Voice Chat</h2>
        <p className="text-gray-400 text-sm text-center mb-6">Agora-powered real-time voice rooms. Upgrade to Premium for 499 BDT to unlock!</p>
        <button onClick={() => useOS().openApp('premium')} className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-lg font-bold">Get Premium</button>
      </div>
    );
  }

  if (!inRoom) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-900 text-white p-8 space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.Headphones className="w-10 h-10 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Voice Rooms</h2>
          <p className="text-gray-400 text-sm">Powered by Agora.io — crystal clear voice</p>
        </div>

        <button onClick={handleCreateRoom} className="w-full max-w-xs px-6 py-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all">
          <Icons.Plus className="w-5 h-5" /> Create Room
        </button>

        <div className="w-full max-w-xs">
          <div className="text-center text-sm text-gray-500 mb-3">— or join existing —</div>
          <div className="flex gap-2">
            <input value={inputCode} onChange={e => setInputCode(e.target.value.toUpperCase())} placeholder="ROOM CODE" className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm font-bold tracking-widest text-center outline-none focus:border-purple-500 uppercase" maxLength={8} onKeyDown={e => e.key === 'Enter' && handleJoinRoom()} />
            <button onClick={() => handleJoinRoom()} disabled={isLoading} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-sm disabled:opacity-50">
              {isLoading ? <Icons.Loader2 className="w-5 h-5 animate-spin" /> : <Icons.LogIn className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Room Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-purple-900/30 to-gray-900">
        <div className="flex items-center gap-3">
          <Icons.Headphones className="w-5 h-5 text-purple-400" />
          <div>
            <div className="font-bold text-sm">Room: {roomCode}</div>
            <div className="text-xs text-gray-500">{users.length} connected</div>
          </div>
        </div>
        <button onClick={handleLeaveRoom} className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-sm font-bold transition-all flex items-center gap-2">
          <Icons.LogOut className="w-4 h-4" /> Leave
        </button>
      </div>

      {/* Participants */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {users.map(u => (
          <div key={u.uid} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${u.speaking ? 'bg-purple-900/30 border-purple-500/50 shadow-[0_0_20px_rgba(147,51,234,0.15)]' : 'bg-gray-800/50 border-gray-700'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all ${u.speaking ? 'bg-purple-500 text-white ring-2 ring-purple-300' : 'bg-gray-700 text-gray-300'}`}>
              {u.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">{u.name} {u.uid === (clientRef.current?.uid as number) && <span className="text-[10px] text-gray-500">(you)</span>}</div>
              <div className="flex items-center gap-2 mt-1">
                {u.micOn ? (
                  <span className="text-[10px] text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Mic On</span>
                ) : (
                  <span className="text-[10px] text-red-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Muted</span>
                )}
                {u.speaking && <span className="text-[10px] text-purple-400 font-bold animate-pulse">Speaking...</span>}
              </div>
            </div>
            {u.uid === (clientRef.current?.uid as number) && (
              <button onClick={toggleMic} className={`p-3 rounded-full transition-all ${micEnabled ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30' : 'bg-red-600/20 text-red-400 hover:bg-red-600/30'}`}>
                {micEnabled ? <Icons.Mic className="w-5 h-5" /> : <Icons.MicOff className="w-5 h-5" />}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Controls */}
      <div className="p-4 border-t border-gray-800 flex justify-center gap-4">
        <button onClick={toggleMic} className={`p-4 rounded-full transition-all ${micEnabled ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {micEnabled ? <Icons.Mic className="w-6 h-6" /> : <Icons.MicOff className="w-6 h-6" />}
        </button>
        <button onClick={handleLeaveRoom} className="p-4 rounded-full bg-red-600 text-white hover:bg-red-500 transition-all">
          <Icons.PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
