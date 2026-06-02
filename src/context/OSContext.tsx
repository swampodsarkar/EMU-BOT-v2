import React, { createContext, useContext, useState, useEffect } from 'react';
import { WindowState, AppId, Game, OSNotification } from '../types';
import { auth, db, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut, User, onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, set, update, get, onDisconnect, increment } from 'firebase/database';


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
  buyTimePack: (seconds: number, cost: number) => boolean;
  claimDailyFreeTime: () => void;
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
  const games = customGames;

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
        setCustomGames(Object.values(g));
      } else {
        setCustomGames([]);
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
        } else {
          // Initialize new user
          const newData = {
            displayName: currentUser.displayName || 'Guest Player',
            photoURL: currentUser.photoURL || '',
            coins: 100,
            level: 1,
            xp: 0,
            totalPlayTime: 0,
            unlockedGames: ['need-for-speed-3-psx']
          };
          await set(userRef, newData);
          setCoins(100);
          setLevel(1);
          setXp(0);
          setUnlockedGames(['need-for-speed-3-psx']);
        }
      } else {
        // Offline / Guest fallback
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
      update(userRef, { coins, level, xp, totalPlayTime, unlockedGames, displayName: user.displayName, photoURL: user.photoURL });
    }, 500); // Debounce
    return () => clearTimeout(updateTimeout);
  }, [coins, level, xp, totalPlayTime, unlockedGames, user, isDataLoaded]);

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
    if (!isAdmin) return;
    try {
      const newGameRef = ref(db, `system/customGames/${game.id}`);
      await set(newGameRef, game);
      setCustomGames(prev => [...prev, game]);
      addNotification({ title: 'Admin', message: 'Game added successfully', icon: 'ShieldAlert' });
    } catch (e) {
      console.error(e);
      addNotification({ title: 'Error', message: 'Failed to add game', icon: 'X' });
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
      playTimeRemaining,
      freeDailySeconds: FREE_DAILY_SECONDS,
      canClaimFreeTime,
      timePacks,
      buyTimePack,
      claimDailyFreeTime
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
    case 'profile': return 'Social Profile';
    case 'rewards': return 'Rewards Center';
    case 'emulator': return props?.game?.title ? `Playing: ${props.game.title}` : 'Emulator';
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
    case 'profile': return 'UserCircle';
    case 'rewards': return 'Gift';
    case 'emulator': return 'MonitorPlay';
    default: return 'Box';
  }
}
