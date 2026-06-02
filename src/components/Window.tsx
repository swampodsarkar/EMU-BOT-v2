import React, { useRef } from 'react';
import { motion, useDragControls } from 'motion/react';
import { useOS } from '../context/OSContext';
import * as Icons from 'lucide-react';
import { WindowState } from '../types';

interface WindowProps {
  window: WindowState;
  children: React.ReactNode;
  defaultWidth?: number;
  defaultHeight?: number;
}

export const Window: React.FC<WindowProps> = ({ window: w, children, defaultWidth = 700, defaultHeight = 500 }) => {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, activeWindowId } = useOS();
  const dragControls = useDragControls();
  
  const [size, setSize] = React.useState({ width: defaultWidth, height: defaultHeight });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Init
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (w.isMinimized) return null;

  const isActive = activeWindowId === w.id;
  const Icon = (Icons as any)[w.icon] || Icons.Box;

  const shouldMaximize = w.isMaximized || isMobile;

  const handleResizePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    const startX = e.pageX;
    const startY = e.pageY;
    const startWidth = size.width;
    const startHeight = size.height;

    const onPointerMove = (moveEvent: PointerEvent) => {
      setSize({
        width: Math.max(320, startWidth + (moveEvent.pageX - startX)),
        height: Math.max(240, startHeight + (moveEvent.pageY - startY))
      });
    };

    const onPointerUp = () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };

  return (
    <motion.div
      drag={!shouldMaximize}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      initial={{ 
        width: defaultWidth, 
        height: defaultHeight,
        x: Math.random() * 50 + 50, 
        y: Math.random() * 50 + 50,
        opacity: 0,
        scale: 0.95
      }}
      animate={{ 
        width: shouldMaximize ? '100%' : size.width,
        height: shouldMaximize ? '100%' : size.height,
        x: shouldMaximize ? 0 : undefined,
        y: shouldMaximize ? 0 : undefined,
        opacity: 1,
        scale: 1
      }}
      className={`absolute flex flex-col overflow-hidden text-slate-100
        ${shouldMaximize ? 'rounded-none border-0' : 'rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/[0.06]'}
        pointer-events-auto
      `}
      style={{ 
        zIndex: w.zIndex, 
        background: '#1a1a2e'
      }}
      onPointerDown={() => focusWindow(w.id)}
    >
      {/* Title Bar */}
      <div 
        className="h-[36px] flex items-center justify-between px-3 shrink-0 select-none cursor-move bg-gradient-to-r from-[#1e1e3a] to-[#2a2a4a] border-b border-white/[0.06]"
        onPointerDown={(e) => { if (!shouldMaximize) dragControls.start(e); }}
        onDoubleClick={() => maximizeWindow(w.id)}
      >
        <div className="flex items-center gap-2 overflow-hidden text-gray-200 text-[13px]">
          <div className="w-6 h-6 rounded-md bg-blue-500/20 flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <span className="font-semibold truncate tracking-tight">{w.title}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0 pointer-events-auto cursor-default h-full" onPointerDown={e => e.stopPropagation()}>
          <button 
            onClick={() => minimizeWindow(w.id)}
            className="w-[34px] h-[24px] flex items-center justify-center rounded-md hover:bg-white/10 transition-all"
          >
            <Icons.Minus className="w-3.5 h-3.5 text-gray-400" />
          </button>
          <button 
            onClick={() => maximizeWindow(w.id)}
            className="w-[34px] h-[24px] flex items-center justify-center rounded-md hover:bg-white/10 transition-all"
          >
            <Icons.Square className="w-3 h-3 text-gray-400" />
          </button>
          <button 
            onClick={() => closeWindow(w.id)}
            className="w-[34px] h-[24px] flex items-center justify-center rounded-md hover:bg-red-500/80 hover:text-white transition-all"
          >
            <Icons.X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto relative bg-[#111]">
        {children}
      </div>

      {/* Resize Handle */}
      {!shouldMaximize && (
        <div 
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50 flex items-center justify-center pointer-events-auto"
          onPointerDown={handleResizePointerDown}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-30">
             <path d="M10 0L0 10H10V0Z" fill="currentColor"/>
          </svg>
        </div>
      )}
    </motion.div>
  );
}
