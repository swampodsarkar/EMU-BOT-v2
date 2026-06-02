import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { WindowState, AppId, Game, OSNotification, FriendProfile } from '../types';
import { auth, db, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut, User, onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, set, update, get, onDisconnect, increment } from 'firebase/database';

// Firebase Realtime DB connection test (write)
fetch('https://free-fire-kingdom-default-rtdb.asia-southeast1.firebasedatabase.app/_test.json', { method: 'PUT', body: '1' })
  .then(r => { if (!r.ok) alert('Firebase DB WRITE failed: HTTP ' + r.status); })
  .catch(e => alert('Firebase DB unreachable: ' + e.message));


const FREE_DAILY_SECONDS = 1800; // 30 min

interface TimePack {
  label: string;
  seconds: number;
  cost: number;
}

const TIME_PACKS: TimePack[] = [
  { label: '30 Min', seconds: 1800, cost: 50 },
  { label: '1 Hour', seconds: 3600, cost: 80 },
  { label: '3 Hours', seconds: 10800, cost: 200 },
  { label: '24 Hours', seconds: 86400, cost: 500 },
];

interface OSState {
  windows: WindowState[];
  activeWindowId: string | null;
  coins: number;
  level: number;
  xp: number;
  totalPlayTime: number;
  unlockedGames: string[];
  theme: 'dark' | 'light' | 'neon';
  notifications: OSNotification[];
  user: User | null;
  games: Game[];
  maintenanceMode: boolean;
  isAdmin: boolean;
  activeUsers: any[];
  totalAdClicks: number;
  recentGames: Game[];
  missions: {
    ads: number;
    playTime: number;
  };
  globalBroadcast: { message: string, timestamp: number } | null;
  playTimeRemaining: number;
  freeDailySeconds: number;
  canClaimFreeTime: boolean;
  timePacks: TimePack[];
  openApp: (appId: AppId, props?: any) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  unlockGame: (gameId: string) => void;
  setTheme: (theme: 'dark' | 'light' | 'neon') => void;
  addNotification: (ntf: Omit<OSNotification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  trackAdClick: () => Promise<void>;
  sendGlobalBroadcast: (message: string) => Promise<void>;
  toggleMaintenanceMode: () => Promise<void>;
  resetGlobalLeaderboard: () => Promise<void>;
  addCustomGame: (game: Game) => Promise<void>;
  deleteCustomGame: (gameId: string) => Promise<void>;
  buyTimePack: (seconds: number, cost: number) => boolean;
  claimDailyFreeTime: () => void;
  isPremium: boolean;
  friends: FriendProfile[];
  installedGames: string[];
  storageUsed: number;
  maxStorage: number;
  installGame: (gameId: string) => void;
  uninstallGame: (gameId: string) => void;
  isBanned: boolean;
  banUser: (uid: string, isGuest?: boolean) => Promise<void>;
  unbanUser: (uid: string, isGuest?: boolean) => Promise<void>;
  updateUserCoins: (uid: string, amount: number, isGuest?: boolean) => Promise<void>;
  setUserPremium: (uid: string, value: boolean, isGuest?: boolean) => Promise<void>;
}

const OSContext = createContext<OSState | undefined>(undefined);

export function OSProvider({ children }: { children: React.ReactNode }) {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Core Data State
  const [coins, setCoins] = useState(100);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [totalPlayTime, setTotalPlayTime] = useState(0);
  const [unlockedGames, setUnlockedGames] = useState<string[]>(['need-for-speed-3-psx']);

  const [theme, setThemeState] = useState<'dark' | 'light' | 'neon'>(() => {
    return (localStorage.getItem('os_theme') as any) || 'dark';
  });

  const [notifications, setNotifications] = useState<OSNotification[]>([]);
  const [customGames, setCustomGames] = useState<Game[]>([]);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [totalAdClicks, setTotalAdClicks] = useState(0);
  const [recentGames, setRecentGames] = useState<Game[]>(() => {
    try {
      const saved = localStorage.getItem('os_recent_games');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [missions, setMissions] = useState({
    ads: parseInt(localStorage.getItem('os_mission_ads') || '0', 10),
    playTime: parseInt(localStorage.getItem('os_mission_playtime') || '0', 10)
  });
  const [globalBroadcast, setGlobalBroadcast] = useState<{ message: string, timestamp: number } | null>(null);

  // Tamper detection
  useEffect(() => {
    if (!import.meta.env.PROD) return;
    const interval = setInterval(() => {
      const start = performance.now();
      (function() { debugger; })();
      if (performance.now() - start > 200) {
        const el = document.createElement('div');
        el.style.cssText = 'position:fixed;inset:0;z-index:999999;background:#000;display:flex;align-items:center;justify-content:center;color:red;font-size:24px;font-family:monospace';
        el.textContent = 'INTEGRITY CHECK FAILED';
        document.body.appendChild(el);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const [playTimeRemaining, setPlayTimeRemaining] = useState(() => {
    try {
      const saved = localStorage.getItem('os_playTime');
      if (saved) {
        const { time, date } = JSON.parse(saved);
        if (date === new Date().toDateString()) return Math.max(0, time);
      }
    } catch {}
    return FREE_DAILY_SECONDS;
  });
  const [lastFreeClaim, setLastFreeClaim] = useState(() => {
    return localStorage.getItem('os_freeTime_claimed') || '';
  });
  const canClaimFreeTime = lastFreeClaim !== new Date().toDateString();
  const timePacks = TIME_PACKS;

  useEffect(() => {
    const isEmulatorOpen = windows.some(w => w.appId === 'emulator' && !w.isMinimized);
    if (!isEmulatorOpen) return;

    const timer = setInterval(() => {
      setPlayTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    const missionTimer = setInterval(() => {
      setMissions(prev => ({ ...prev, playTime: Math.min(30, prev.playTime + 1) }));
      setTotalPlayTime(prev => prev + 1);
    }, 60000);

    return () => {
      clearInterval(timer);
      clearInterval(missionTimer);
    };
  }, [windows]);

  useEffect(() => {
    localStorage.setItem('os_playTime', JSON.stringify({
      time: playTimeRemaining,
      date: new Date().toDateString()
    }));
  }, [playTimeRemaining]);

  const isAdmin = user?.email === 'mdswampodsarkar@gmail.com' || user?.email === 'mdswampodsarkar007@gmail.com';
  const [isPremium, setIsPremium] = useState(false);
  const isPremiumUser = isPremium;
  const games = customGames;
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [installedGames, setInstalledGames] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('os_installed') || '[]'); } catch { return []; }
  });

  const maxStorage = user?.isPremium ? 100000 : 5000;
  const storageUsed = installedGames.reduce((total, id) => {
    const g = games.find(gg => gg.id === id);
    return total + (g?.size || 0);
  }, 0);

  const installGame = (gameId: string) => {
    setInstalledGames(prev => prev.includes(gameId) ? prev : [...prev, gameId]);
  };

  const uninstallGame = (gameId: string) => {
    setInstalledGames(prev => prev.filter(id => id !== gameId));
  };

  const [isBanned, setIsBanned] = useState(false);

  // Ban check on mount
  useEffect(() => {
    const sid = localStorage.getItem('os_session_id');
    if (!sid) return;
    const banRef = ref(db, `system/banned/${user?.uid || sid}`);
    const unsub = onValue(banRef, snap => {
      setIsBanned(snap.val() === true);
    });
    return () => unsub();
  }, [user]);

  // Guest data sync to Firebase
  const guestSyncRef = useRef<any>(null);
  useEffect(() => {
    if (user) return;
    if (!isDataLoaded) return;
    const sid = localStorage.getItem('os_session_id');
    if (!sid) return;
    clearTimeout(guestSyncRef.current);
    guestSyncRef.current = setTimeout(() => {
      update(ref(db, `guestUsers/${sid}`), {
        displayName: 'Guest Player',
        coins,
        level,
        xp,
        totalPlayTime,
        unlockedGames,
        installedGames,
        lastSeen: Date.now()
      }).catch(() => {});
    }, 2000);
    return () => clearTimeout(guestSyncRef.current);
  }, [coins, level, xp, totalPlayTime, unlockedGames, installedGames, user, isDataLoaded]);

  // Load guest data from Firebase on mount
  useEffect(() => {
    if (user || !isDataLoaded) return;
    const sid = localStorage.getItem('os_session_id');
    if (!sid) return;
    get(ref(db, `guestUsers/${sid}`)).then(snap => {
      if (snap.exists()) {
        const gd = snap.val();
        setCoins(gd.coins ?? 100);
        setLevel(gd.level ?? 1);
        setXp(gd.xp ?? 0);
        setTotalPlayTime(gd.totalPlayTime ?? 0);
        setUnlockedGames(gd.unlockedGames ?? ['need-for-speed-3-psx']);
        setInstalledGames(gd.installedGames ?? []);
      }
    }).catch(() => {});
  }, [user, isDataLoaded]);

  // Admin functions
  const banUser = async (uid: string, isGuest?: boolean) => {
    if (!isAdmin) return;
    const path = isGuest ? `system/banned/guest_${uid}` : `system/banned/${uid}`;
    await set(ref(db, path), true);
    addNotification({ title: 'Admin', icon: 'ShieldAlert', message: 'User banned' });
  };
  const unbanUser = async (uid: string, isGuest?: boolean) => {
    if (!isAdmin) return;
    const path = isGuest ? `system/banned/guest_${uid}` : `system/banned/${uid}`;
    await set(ref(db, path), null);
    addNotification({ title: 'Admin', icon: 'ShieldAlert', message: 'User unbanned' });
  };
  const updateUserCoins = async (uid: string, amount: number, isGuest?: boolean) => {
    if (!isAdmin) return;
    const path = isGuest ? `guestUsers/${uid}` : `users/${uid}`;
    await update(ref(db, path), { coins: increment(amount) });
    addNotification({ title: 'Admin', icon: 'Coins', message: `${amount > 0 ? '+' : ''}${amount} coins` });
  };
  const setUserPremium = async (uid: string, value: boolean, isGuest?: boolean) => {
    if (!isAdmin) return;
    const path = isGuest ? `guestUsers/${uid}` : `users/${uid}`;
    await update(ref(db, path), { isPremium: value });
    addNotification({ title: 'Admin', icon: 'Crown', message: `Premium ${value ? 'ON' : 'OFF'}` });
  };

  // Global listeners
  useEffect(() => {
    const maintenanceRef = ref(db, 'system/maintenanceMode');
    const unsubMaintenance = onValue(maintenanceRef, (snap) => {
      setMaintenanceMode((snap.val() || false) === true);
    });

    const gamesRef = ref(db, 'system/customGames');
    const unsubGames = onValue(gamesRef, (snap) => {
      const g = snap.val();
      if (g) {
        setCustomGames(prev => {
          const fbGames = Object.values(g) as Game[];
          const fbIds = new Set(fbGames.map(g => g.id));
          const pending = prev.filter(g => !fbIds.has(g.id));
          return pending.length > 0 ? [...fbGames, ...pending] : fbGames;
        });
      } else {
        setCustomGames(prev => prev.length > 0 ? prev : []);
      }
    });

    const broadcastRef = ref(db, 'system/broadcast');
    const unsubBroadcast = onValue(broadcastRef, (snap) => {
      const b = snap.val();
      setGlobalBroadcast(b || null);
      // Still show a temporary notification if it's new
      if (b && b.timestamp && Date.now() - b.timestamp < 1000 * 10) {
         addNotification({ title: 'System Announcement', message: b.message, icon: 'ShieldAlert' });
      }
    });

    const statsRef = ref(db, 'system/stats');
    const unsubStats = onValue(statsRef, (snap) => {
      const data = snap.val() || {};
      setTotalAdClicks(data.adClicks || 0);
    });
    
    // We can also fetch the raw connections, but they won't trigger notification.
    const activeUsersRef = ref(db, 'system/presence');
    const unsubPresence = onValue(activeUsersRef, (snap) => {
      const data = snap.val() || {};
      setActiveUsers(Object.values(data));
    });

    // Friend list listener
    const friendsRef = ref(db, 'social/friends');
    const unsubFriends = onValue(friendsRef, (snap) => {
      const data = snap.val();
      if (data) {
        const all: FriendProfile[] = [];
        Object.keys(data).forEach(uid => {
          const p = data[uid];
          if (p && p.displayName) {
            all.push({ uid, displayName: p.displayName, photoURL: p.photoURL, status: p.status || 'offline', currentGame: p.currentGame, lastSeen: p.lastSeen, isPremium: p.isPremium });
          }
        });
        setFriends(all);
      }
    });

    // Tracking the current user's presence explicitly!
    let sessionRef: any;
    const connectRef = ref(db, '.info/connected');
    const unsubConnect = onValue(connectRef, (snap) => {
      if (snap.val() === true) {
        // We are connected! Configure presence:
        const sid = localStorage.getItem('os_session_id') || `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('os_session_id', sid);
        
        // Wait, because `user` state might change, we use a separate effect for presence to reflect `user` properly? 
        // No, let's just create an initial guest record. We will update it.
        sessionRef = ref(db, `system/presence/${sid}`);
        onDisconnect(sessionRef).remove();
        
        set(sessionRef, {
           isGuest: true,
           displayName: 'Connecting...',
           email: null,
           timestamp: Date.now()
        });
      }
    });

    return () => {
      unsubMaintenance();
      unsubGames();
      unsubBroadcast();
      unsubStats();
      unsubPresence();
      unsubConnect();
      unsubFriends();
    };
  }, []);

  // Firebase auth & realtime DB sync
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or create user data
        const userRef = ref(db, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setCoins(data.coins ?? 100);
          setLevel(data.level ?? 1);
          setXp(data.xp ?? 0);
          setTotalPlayTime(data.totalPlayTime ?? 0);
          setUnlockedGames(data.unlockedGames ?? ['need-for-speed-3-psx']);
          setIsPremium(data.isPremium === true);
        } else {
          // Initialize new user
          const newData = {
            displayName: currentUser.displayName || 'Guest Player',
            photoURL: currentUser.photoURL || '',
            coins: 100,
            level: 1,
            xp: 0,
            totalPlayTime: 0,
            unlockedGames: ['need-for-speed-3-psx'],
            installedGames: []
          };
          await set(userRef, newData);
          setCoins(100);
          setLevel(1);
          setXp(0);
          setUnlockedGames(['need-for-speed-3-psx']);
          setIsPremium(false);
        }
        setIsDataLoaded(true);
      } else {
        // Offline / Guest fallback
        setIsPremium(false);
        setCoins(parseInt(localStorage.getItem('os_coins') || '100', 10));
        setLevel(1);
        setXp(0);
        setTotalPlayTime(parseInt(localStorage.getItem('os_total_play_time') || '0', 10));
        try {
          setUnlockedGames(JSON.parse(localStorage.getItem('os_unlockedGames') || '["need-for-speed-3-psx"]'));
        } catch {
          setUnlockedGames(['need-for-speed-3-psx']);
        }
      }
      setIsDataLoaded(true);
    });
    return () => unsub();
  }, []);

  // Update cloud when local changes (only if loaded & logged in)
  useEffect(() => {
    if (!isDataLoaded) return; // Wait until initial data is loaded
    
    // Update presence identity
    const sid = localStorage.getItem('os_session_id');
    if (sid) {
       set(ref(db, `system/presence/${sid}`), {
          isGuest: !user,
          uid: user?.uid || sid,
          displayName: user?.displayName || 'Guest Player',
          email: user?.email || null,
          photoURL: user?.photoURL || null,
          timestamp: Date.now()
       });
    }

    if (!user) {
      // Guest mode: save locally ONLY
      localStorage.setItem('os_coins', coins.toString());
      localStorage.setItem('os_total_play_time', totalPlayTime.toString());
      localStorage.setItem('os_unlockedGames', JSON.stringify(unlockedGames));
      return;
    }

    // Authenticated mode: Auto sync with cloud
    const updateTimeout = setTimeout(() => {
      const userRef = ref(db, `users/${user.uid}`);
      update(userRef, { coins, level, xp, totalPlayTime, unlockedGames, installedGames, displayName: user.displayName, photoURL: user.photoURL, lastSeen: Date.now() });
    }, 500); // Debounce
    return () => clearTimeout(updateTimeout);
  }, [coins, level, xp, totalPlayTime, unlockedGames, installedGames, user, isDataLoaded]);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      addNotification({ title: 'Welcome', message: 'Successfully logged in with Google', icon: 'UserCircle' });
    } catch (error) {
      console.error(error);
      addNotification({ title: 'Error', message: 'Login failed', icon: 'X' });
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      addNotification({ title: 'Logged Out', message: 'You are now playing as guest', icon: 'UserCircle' });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    localStorage.setItem('os_theme', theme);
  }, [theme]);


  useEffect(() => {
    localStorage.setItem('os_recent_games', JSON.stringify(recentGames));
  }, [recentGames]);

  useEffect(() => {
    localStorage.setItem('os_installed', JSON.stringify(installedGames));
  }, [installedGames]);

  const openApp = (appId: AppId, props?: any) => {
    if (appId === 'emulator' && props?.game) {
      setRecentGames(prev => {
        const filtered = prev.filter(g => g.id !== props.game.id);
        return [props.game, ...filtered].slice(0, 4);
      });
    }
    const existing = windows.find(w => w.appId === appId && (!props || w.props?.game?.id === props?.game?.id));
    if (existing) {
      if (existing.isMinimized) {
        setWindows(ws => ws.map(w => w.id === existing.id ? { ...w, isMinimized: false } : w));
      }
      focusWindow(existing.id);
      return;
    }

    const id = `${appId}-${Date.now()}`;
    const newWindow: WindowState = {
      id,
      appId,
      title: getAppTitle(appId, props),
      icon: getAppIcon(appId),
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      zIndex: windows.length + 1,
      props
    };

    setWindows([...windows, newWindow]);
    setActiveWindowId(id);
  };

  const closeWindow = (id: string) => {
    setWindows(ws => ws.filter(w => w.id !== id));
    if (activeWindowId === id) {
      setActiveWindowId(windows.length > 1 ? windows[windows.length - 2].id : null);
    }
  };

  const minimizeWindow = (id: string) => {
    setWindows(ws => ws.map(w => w.id === id ? { ...w, isMinimized: true } : w));
    if (activeWindowId === id) setActiveWindowId(null);
  };

  const maximizeWindow = (id: string) => {
    setWindows(ws => ws.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
    focusWindow(id);
  };

  const focusWindow = (id: string) => {
    if (activeWindowId === id) return;
    setWindows(ws => {
      const maxZ = Math.max(...ws.map(w => w.zIndex), 0);
      return ws.map(w => w.id === id ? { ...w, zIndex: maxZ + 1 } : w);
    });
    setActiveWindowId(id);
  };

  const addCoins = (amount: number) => setCoins(c => c + amount);
  
  const spendCoins = (amount: number) => {
    if (coins >= amount) {
      setCoins(c => c - amount);
      return true;
    }
    return false;
  };

  const unlockGame = (gameId: string) => {
    if (!unlockedGames.includes(gameId)) {
      setUnlockedGames([...unlockedGames, gameId]);
    }
  };

  const setTheme = (newTheme: 'dark' | 'light' | 'neon') => setThemeState(newTheme);

  const addNotification = (ntf: Omit<OSNotification, 'id' | 'timestamp'>) => {
    const newNtf: OSNotification = {
      ...ntf,
      id: `ntf-${Date.now()}-${Math.random()}`,
      timestamp: Date.now()
    };
    setNotifications(prev => [...prev, newNtf]);
    setTimeout(() => {
      removeNotification(newNtf.id);
    }, 5000); // Auto remove after 5s
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const sendGlobalBroadcast = async (message: string) => {
    if (!isAdmin) return;
    if (!message) {
      await set(ref(db, 'system/broadcast'), null);
      return;
    }
    await set(ref(db, 'system/broadcast'), { message, timestamp: Date.now() });
  };
  
  const toggleMaintenanceMode = async () => {
    if (!isAdmin) return;
    await set(ref(db, 'system/maintenanceMode'), !maintenanceMode);
  };

  const resetGlobalLeaderboard = async () => {
    if (!isAdmin) return;
    try {
      const usersRef = ref(db, 'users');
      const snap = await get(usersRef);
      if (snap.exists()) {
        const users = snap.val();
        const updates: any = {};
        Object.keys(users).forEach(uid => {
          updates[`users/${uid}/level`] = 1;
          updates[`users/${uid}/xp`] = 0;
          updates[`users/${uid}/coins`] = 100;
        });
        await update(ref(db), updates);
      }
      addNotification({ title: 'Admin', message: 'Leaderboard reset successful', icon: 'ShieldAlert' });
    } catch (e) {
      console.error(e);
      addNotification({ title: 'Error', message: 'Failed to reset leaderboard', icon: 'X' });
    }
  };

  const addCustomGame = async (game: Game) => {
    if (!isAdmin) { addNotification({ title: 'Error', icon: 'X', message: 'Admin access required' }); return; }
    setCustomGames(prev => [...prev, game]);
    addNotification({ title: 'Admin', icon: 'ShieldAlert', message: `${game.title} added!` });
    try {
      const url = `https://free-fire-kingdom-default-rtdb.asia-southeast1.firebasedatabase.app/system/customGames/${game.id}.json`;
      const res = await fetch(url, { method: 'PUT', body: JSON.stringify(game) });
      if (!res.ok) {
        const txt = await res.text();
        addNotification({ title: 'Firebase Error', icon: 'X', message: `HTTP ${res.status}: ${txt.slice(0, 80)}` });
      }
    } catch (e: any) {
      addNotification({ title: 'Firebase Error', icon: 'X', message: e?.message || 'Network error' });
    }
  };

  const deleteCustomGame = async (gameId: string) => {
    if (!isAdmin) return;
    try {
      await set(ref(db, `system/customGames/${gameId}`), null);
      setCustomGames(prev => prev.filter(g => g.id !== gameId));
      addNotification({ title: 'Admin', message: 'Game deleted', icon: 'Trash2' });
    } catch (e) {
      console.error(e);
      addNotification({ title: 'Error', message: 'Failed to delete game', icon: 'X' });
    }
  };

  useEffect(() => {
    localStorage.setItem('os_mission_ads', missions.ads.toString());
    localStorage.setItem('os_mission_playtime', missions.playTime.toString());
  }, [missions]);

  const trackAdClick = async () => {
    try {
      await update(ref(db, 'system/stats'), { adClicks: increment(1) });
      setMissions(prev => ({ ...prev, ads: Math.min(5, prev.ads + 1) }));
      addCoins(50);
      addNotification({ title: 'Ad Reward', message: 'You earned 50 coins!', icon: 'PlaySquare' });
    } catch(e) {
      console.error(e);
    }
  };

  const buyTimePack = (seconds: number, cost: number) => {
    if (spendCoins(cost)) {
      setPlayTimeRemaining(prev => prev + seconds);
      addNotification({ title: 'Time Pack', message: `Added ${Math.floor(seconds / 60)} min play time!`, icon: 'Clock' });
      return true;
    }
    addNotification({ title: 'Error', message: 'Not enough coins! Watch ads to earn more.', icon: 'X' });
    return false;
  };

  const claimDailyFreeTime = () => {
    const today = new Date().toDateString();
    if (lastFreeClaim === today) return;
    setPlayTimeRemaining(prev => prev + FREE_DAILY_SECONDS);
    setLastFreeClaim(today);
    localStorage.setItem('os_freeTime_claimed', today);
    addNotification({ title: 'Free Time', message: `You got ${FREE_DAILY_SECONDS / 60} min free play time!`, icon: 'Clock' });
  };

  return (
    <OSContext.Provider value={{
      windows,
      activeWindowId,
      coins,
      level,
      xp,
      totalPlayTime,
      unlockedGames,
      theme,
      notifications,
      user,
      games,
      maintenanceMode,
      isAdmin,
      activeUsers,
      totalAdClicks,
      recentGames,
      missions,
      globalBroadcast,
      openApp,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      focusWindow,
      addCoins,
      spendCoins,
      unlockGame,
      setTheme,
      addNotification,
      removeNotification,
      login,
      logout,
      trackAdClick,
      sendGlobalBroadcast,
      toggleMaintenanceMode,
      resetGlobalLeaderboard,
      addCustomGame,
      deleteCustomGame,
      playTimeRemaining,
      freeDailySeconds: FREE_DAILY_SECONDS,
      canClaimFreeTime,
      timePacks,
      buyTimePack,
      claimDailyFreeTime,
      isPremium: isPremiumUser,
      friends,
      installedGames,
      storageUsed,
      maxStorage,
      installGame,
      uninstallGame,
      isBanned,
      banUser,
      unbanUser,
      updateUserCoins,
      setUserPremium
    }}>
      {children}
    </OSContext.Provider>
  );
}

export function useOS() {
  const context = useContext(OSContext);
  if (!context) throw new Error('useOS must be used within an OSProvider');
  return context;
}

function getAppTitle(appId: AppId, props?: any) {
  switch (appId) {
    case 'library': return 'Game Library';
    case 'wallet': return 'Wallet';
    case 'ads': return 'Ads Rewards';
    case 'store': return 'Store';
    case 'settings': return 'Settings';
    case 'leaderboard': return 'Leaderboard';
    case 'social': return 'Social Hub';
    case 'voice': return 'Voice Rooms';
    case 'premium': return 'Premium Upgrade';
    case 'profile': return 'Social Profile';
    case 'rewards': return 'Rewards Center';
    case 'emulator': return props?.game?.title ? `Playing: ${props.game.title}` : 'Emulator';
    case 'steamstore': return 'Steam Store';
    case 'epicstore': return 'Epic Games Store';
    case 'thispc': return 'This PC';
    default: return 'App';
  }
}

function getAppIcon(appId: AppId) {
  switch (appId) {
    case 'library': return 'Gamepad2';
    case 'wallet': return 'Coins';
    case 'ads': return 'PlaySquare';
    case 'store': return 'ShoppingCart';
    case 'settings': return 'Settings';
    case 'leaderboard': return 'Trophy';
    case 'social': return 'MessageCircle';
    case 'voice': return 'Headphones';
    case 'premium': return 'Crown';
    case 'profile': return 'UserCircle';
    case 'rewards': return 'Gift';
    case 'emulator': return 'MonitorPlay';
    case 'steamstore': return 'Steam';
    case 'epicstore': return 'Gift';
    case 'thispc': return 'Monitor';
    default: return 'Box';
  }
}
