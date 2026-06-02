import React, { useState, useRef, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { Game } from '../types';
import { useOS } from '../context/OSContext';

interface EmulatorProps {
  game?: Game;
}

export function Emulator({ game }: EmulatorProps) {
  const { playTimeRemaining, buyTimePack, coins, openApp } = useOS();
  const [core, setCore] = useState(game?.core || 'nes');
  const [localRomUrl, setLocalRomUrl] = useState<string | null>(null);
  const [localRomName, setLocalRomName] = useState<string | null>(null);
  const [emulatorSrc, setEmulatorSrc] = useState<string | null>(null);
  const prevKeyRef = useRef<string>('');

  useEffect(() => {
    if (game) {
       setCore(game.core);
       setLocalRomUrl(null);
       setLocalRomName(null);
    }
  }, [game]);

  const handleLocalRomSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (localRomUrl) {
         try { URL.revokeObjectURL(localRomUrl.split('#')[0]) } catch(e) {}
      }
      const url = URL.createObjectURL(file);
      setLocalRomUrl(url + '#' + encodeURIComponent(file.name));
      setLocalRomName(file.name);
    }
  };

  const currentRomUrl = localRomUrl || game?.romUrl;
  const currentRomName = localRomName || game?.title || "Custom ROM";
  const hasRom = currentRomUrl || game;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const timeColor = playTimeRemaining > 300 ? 'text-green-400' :
    playTimeRemaining > 60 ? 'text-yellow-400' : 'text-red-400 animate-pulse';

  const generateEmulatorHTML = () => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <style>body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; }</style>
    </head>
    <body>
      <div style="width:100%;height:100%;">
          <div id="game"></div>
      </div>
      <script>
          window.EJS_player = '#game';
          window.EJS_core = '${core === 'psx' ? 'psx' : core}';
          window.EJS_gameName = '${currentRomName.replace(/'/g, "\\'")}';
          ${currentRomUrl ?
            (currentRomUrl.startsWith('blob:')
              ? "window.EJS_gameUrl = '" + currentRomUrl.split('#')[0] + "';"
              : "window.EJS_gameUrl = '" + currentRomUrl + "';")
            : ''}
          window.EJS_color = '#3b82f6';
          window.EJS_startOnLoaded = false;
          window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
          window.EJS_forceLegacyCores = true;
      </script>
      <script src="https://cdn.emulatorjs.org/stable/data/loader.js"></script>
    </body>
    </html>
  `;

  const key = (currentRomUrl || 'no-rom') + '-' + core;

  useEffect(() => {
    if (!hasRom) return;
    if (key === prevKeyRef.current) return;
    prevKeyRef.current = key;

    const oldSrc = emulatorSrc;
    const blob = new Blob([generateEmulatorHTML()], { type: 'text/html; charset=UTF-8' });
    const url = URL.createObjectURL(blob);
    setEmulatorSrc(url);
    return () => {
      URL.revokeObjectURL(url);
      if (oldSrc && oldSrc !== url) URL.revokeObjectURL(oldSrc);
    };
  }, [key]);

  return (
    <div className="h-full flex flex-col bg-black">
      <div className="bg-[#1c1c1c] border-b border-[#333] p-1.5 flex items-center justify-between text-gray-300 text-xs select-none shadow">
        <div className="flex gap-4 px-2 items-center object-contain">
          <div className="font-bold text-blue-400">EmulatorJS</div>
          {!game && (
            <select
              value={core}
              onChange={e => setCore(e.target.value)}
              className="bg-black border border-gray-700 text-xs text-white rounded px-1 py-0.5 outline-none"
            >
              <option value="nes">NES</option>
              <option value="snes">SNES</option>
              <option value="psx">PS1</option>
              <option value="sega">SEGA</option>
              <option value="gba">GBA</option>
              <option value="gbc">GBC</option>
              <option value="n64">N64</option>
              <option value="psp">PSP</option>
              <option value="mame">MAME (Arcade)</option>
              <option value="fba">CPS-1 (Arcade)</option>
            </select>
          )}
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-2 py-0.5 rounded text-[10px] uppercase font-bold flex items-center gap-1 transition-colors">
            <Icons.Upload className="w-3 h-3" />
            Load Local ROM
            <input type="file" className="hidden" onChange={handleLocalRomSelect} accept=".zip,.iso,.bin,.cue,.nes,.smc,.sfc,.z64,.v64,.n64,.gba,.gbc,.gb" />
          </label>
        </div>
        <div className="px-2 flex items-center gap-3">
          <span className={`font-mono font-bold ${timeColor}`}>
            <Icons.Clock className="w-3 h-3 inline mr-1" />
            {formatTime(playTimeRemaining)}
          </span>
          {game && <span className="text-gray-500">| {game.core.toUpperCase()}</span>}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center bg-black overflow-hidden relative">
        {!hasRom ? (
           <div className="text-gray-500 flex flex-col items-center gap-4 p-8 text-center max-w-sm">
             <Icons.Gamepad2 className="w-16 h-16 text-gray-700" />
             <p>No ROM loaded. Please upload a local ROM file or select a game from the library.</p>
             <p className="text-sm text-gray-600">Local files are processed completely within your browser and never uploaded to any server.</p>
           </div>
        ) : playTimeRemaining <= 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 p-8 text-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
              <Icons.Clock className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-3xl font-black text-white">Time's Up!</h2>
            <p className="text-gray-400 max-w-xs">Your play time has run out. Buy more time to keep playing.</p>
            <div className="flex gap-3">
              <button
                onClick={() => buyTimePack(1800, 50)}
                disabled={coins < 50}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                  coins >= 50
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Icons.Clock className="w-4 h-4" />
                30 Min (50 coins)
              </button>
              <button
                onClick={() => buyTimePack(3600, 80)}
                disabled={coins < 80}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                  coins >= 80
                    ? 'bg-purple-600 hover:bg-purple-500 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Icons.Clock className="w-4 h-4" />
                1 Hour (80 coins)
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => openApp('ads')}
                className="px-4 py-2 bg-yellow-600/20 border border-yellow-500/30 text-yellow-400 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-yellow-600/30 transition-colors"
              >
                <Icons.PlaySquare className="w-4 h-4" />
                Watch Ads for Coins
              </button>
              <button
                onClick={() => openApp('store')}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold text-xs flex items-center gap-2 transition-colors"
              >
                <Icons.ShoppingCart className="w-4 h-4" />
                Time Shop
              </button>
            </div>
          </div>
        ) : emulatorSrc ? (
          <iframe
            key={key + '-blob'}
            src={emulatorSrc}
            className="w-full h-full border-none"
            title="Real EmulatorJS Core"
            allow="gamepad; autoplay"
          />
        ) : (
          <div className="text-gray-500 flex items-center gap-2">
            <Icons.Loader className="w-5 h-5 animate-spin" />
            <span>Initializing emulator...</span>
          </div>
        )}
      </div>
    </div>
  );
}
