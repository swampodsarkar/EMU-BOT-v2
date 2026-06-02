import React from 'react';
import { useOS } from '../context/OSContext';
import * as Icons from 'lucide-react';

export function Settings() {
  const { theme, setTheme, user, login, logout } = useOS();

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Icons.Settings className="w-5 h-5 text-gray-400" />
          System Settings
        </h2>
      </div>

      <div className="p-6 space-y-8">
        
        {/* Theme Settings */}
        <section>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Appearance</h3>
          <div className="space-y-3">
            {[
              { id: 'dark', label: 'Dark Mode', icon: 'Moon' },
              { id: 'neon', label: 'Neon Retro', icon: 'Sparkles' },
              { id: 'light', label: 'Light Mode', icon: 'Sun' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as any)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  theme === t.id 
                    ? 'bg-blue-600/20 border-blue-500 text-blue-100' 
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {React.createElement((Icons as any)[t.icon], { className: 'w-5 h-5' })}
                <span className="font-medium">{t.label}</span>
                {theme === t.id && <Icons.CheckCircle2 className="w-5 h-5 text-blue-400 ml-auto" />}
              </button>
            ))}
          </div>
        </section>

        {/* System Settings */}
        <section>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">System</h3>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-200">Audio (Sound FX)</div>
                <div className="text-xs text-gray-500">Enable OS sound effects</div>
              </div>
              <div className="w-10 h-5 bg-blue-500 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-0.5 w-4 h-4 bg-white rounded-full bg-white shadow" />
              </div>
            </div>
            
            <div className="h-px w-full bg-gray-700" />
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-200">High Performance Mode</div>
                <div className="text-xs text-gray-500">Smoother emulator rendering</div>
              </div>
              <div className="w-10 h-5 bg-blue-500 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-0.5 w-4 h-4 bg-white rounded-full bg-white shadow" />
              </div>
            </div>
          </div>
        </section>

        {/* Account Settings */}
        <section>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Account</h3>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3">
            {user ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 bg-gray-900/50 p-3 rounded border border-gray-700">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full" />
                  ) : (
                    <Icons.UserCircle className="w-10 h-10 text-gray-400" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-white">{user.displayName || 'Connected'}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </div>
                  <div className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">Connected</div>
                </div>
                <button onClick={logout} className="w-full text-center px-4 py-2 border border-red-500/50 text-red-400 rounded hover:bg-red-900/30 transition-colors">
                  Sign Out
                </button>
              </div>
            ) : (
              <button onClick={login} className="w-full text-left px-4 py-2 border border-blue-500/50 rounded flex items-center justify-between hover:bg-blue-900/30 transition-colors">
                <div className="flex items-center gap-2">
                  <Icons.LogIn className="w-4 h-4 text-blue-400" />
                  <span>Connect with Google</span>
                </div>
                <Icons.ExternalLink className="w-4 h-4 text-gray-500" />
              </button>
            )}
            <button className="w-full text-left px-4 py-2 border border-green-500/50 rounded flex items-center justify-between hover:bg-green-900/30">
               <span>Auto-Sync Cloud Saves</span>
               <div className="w-10 h-5 bg-green-500 rounded-full relative cursor-pointer">
                 <div className="absolute right-1 top-0.5 w-4 h-4 bg-white rounded-full shadow" />
               </div>
            </button>
            <div className="text-xs text-yellow-400 pt-2">Warning: Clearing browser cache will delete local saves if cloud sync is disabled.</div>
          </div>
        </section>
        
        <div className="pt-4 text-center text-xs text-gray-600 font-mono">
          RetroOS v1.0.0 (Build 2026.06)
          <br />Engine: React OS Emulator
        </div>
      </div>
    </div>
  );
}
