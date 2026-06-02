/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { OSProvider } from './context/OSContext';
import { Desktop } from './components/Desktop';
import { LandingPage } from './components/LandingPage';
import * as Icons from 'lucide-react';

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [isBooting, setIsBooting] = useState(false);

  const handleEnter = () => {
    setIsBooting(true);
    setTimeout(() => {
      setIsBooting(false);
      setHasEntered(true);
    }, 5000);
  };

  if (isBooting) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] animate-pulse mb-8">
            <Icons.Gamepad2 className="w-10 h-10 text-white" />
        </div>
        <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
           <div className="h-full bg-blue-500" style={{ width: '100%', animation: 'progress 5s linear forwards' }} />
        </div>
        <p className="mt-4 text-blue-400 text-sm font-mono tracking-widest uppercase animate-pulse">Initializing OS...</p>
        <style>{`
          @keyframes progress {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  if (!hasEntered) {
    return <LandingPage onEnter={handleEnter} />;
  }

  return (
    <OSProvider>
      <Desktop />
    </OSProvider>
  );
}

