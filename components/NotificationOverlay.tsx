
import React, { useEffect, useState } from 'react';
import { NotificationType } from '../types';

interface Props {
  message: string;
  type: NotificationType;
  duration: number;
  onClose: () => void;
}

const NotificationOverlay: React.FC<Props> = ({ message, type, duration, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const entryTimer = setTimeout(() => setShowContent(true), 50);

    const closeTimer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(onClose, 500); 
    }, duration);

    return () => {
      clearTimeout(entryTimer);
      clearTimeout(closeTimer);
    };
  }, [duration, onClose]);

  const containerClasses = `absolute inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none transition-all duration-700 ${
    isClosing ? 'opacity-0 backdrop-blur-0' : 'opacity-100 backdrop-blur-xl'
  }`;

  if (type !== 'success') {
    return (
      <div className={containerClasses}>
        <div className="absolute inset-0 bg-black/60 pointer-events-auto" onClick={() => setIsClosing(true)}></div>
        <div className={`relative w-full max-w-[240px] bg-slate-900 border border-slate-700 rounded-[2rem] p-6 shadow-2xl pointer-events-auto text-center transition-all duration-500 ${showContent ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
          <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${type === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-indigo-500/20 text-indigo-400'}`}>
             <i className={`fas ${type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle'} text-xl`}></i>
          </div>
          <h3 className="text-sm font-bold mb-1">{type === 'error' ? 'Transaction Failed' : 'Notification'}</h3>
          <p className="text-slate-400 text-[10px] font-medium leading-relaxed">{message}</p>
        </div>
      </div>
    );
  }

  // Premium Success Screen within the app frame
  return (
    <div className={containerClasses}>
      <div className="absolute inset-0 bg-indigo-950/60 pointer-events-auto" onClick={() => setIsClosing(true)}></div>
      
      <div className={`relative flex flex-col items-center justify-center w-full transition-all duration-500 border-none ${showContent ? 'translate-y-0 scale-100' : 'translate-y-10 scale-90'}`}>
        
        {/* Animated Success Icon Container */}
        <div className="relative w-28 h-28 mb-6 flex items-center justify-center border-none">
          <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping-slow"></div>
          <div className="absolute inset-4 bg-green-500/10 rounded-full animate-ping-slower"></div>
          
          <div className="relative w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.4)]">
            <svg 
              viewBox="0 0 52 52" 
              className="w-12 h-12 text-white fill-none stroke-current"
              style={{ strokeWidth: 5, strokeLinecap: 'round', strokeLinejoin: 'round' }}
            >
              <circle className="opacity-20" cx="26" cy="26" r="23" />
              <path className="tick-draw" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
          </div>
        </div>

        <div className={`text-center space-y-2 transition-all duration-700 delay-300 border-none ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="text-xl font-black tracking-tight text-white uppercase">
            {message.toLowerCase().includes('sync') ? 'Sync Successful' : 'Payment Successful'}
          </h2>
          <div className="h-0.5 w-8 bg-green-500/50 mx-auto rounded-full"></div>
          <p className="text-indigo-100/70 text-xs font-bold px-6 leading-tight">
            {message}
          </p>
        </div>

        <button 
          onClick={() => setIsClosing(true)}
          className={`mt-10 px-6 py-2 bg-white/10 hover:bg-white/20 border-0 rounded-full text-[10px] font-black tracking-widest uppercase transition-all duration-500 pointer-events-auto active:scale-95 ${showContent ? 'opacity-100' : 'opacity-0'}`}
        >
          Done
        </button>
      </div>

      <style>{`
        .tick-draw {
          stroke-dasharray: 50;
          stroke-dashoffset: 50;
          animation: draw-tick 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards 0.4s;
        }
        @keyframes draw-tick {
          to { stroke-dashoffset: 0; }
        }
        .animate-ping-slow { animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-ping-slower { animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default NotificationOverlay;
