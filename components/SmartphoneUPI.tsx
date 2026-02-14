
import React, { useState, useEffect } from 'react';
import { GlobalState, NotificationType } from '../types';
import NotificationOverlay from './NotificationOverlay';
import AIAssistant from './AIAssistant';
import { haptics } from '../utils/haptics';

interface Props {
  userWallet: GlobalState['userWallet'];
  connectivity: GlobalState['connectivity'];
  phoneAlert: { message: string; type: NotificationType } | null;
  onLoadMoney: (amount: number) => void;
  onSync: () => void;
  onToggleConnectivity: (type: 'bluetooth' | 'wifi', value: boolean) => void;
  onToggleAutoReload: (enabled: boolean) => void;
  onCloseAlert: () => void;
  fullState: GlobalState;
}

const SmartphoneUPI: React.FC<Props> = ({ 
  userWallet, 
  connectivity, 
  phoneAlert,
  onLoadMoney, 
  onSync, 
  onToggleConnectivity,
  onToggleAutoReload,
  onCloseAlert,
  fullState
}) => {
  const [amount, setAmount] = useState<string>('');
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isWatchLinked = connectivity.isBluetoothOn && userWallet.isActive;
  const isLoadReady = connectivity.isWifiOn && isWatchLinked;

  const frameClasses = "w-full sm:max-w-sm bg-slate-900 sm:border border-slate-800 sm:rounded-[3rem] p-6 sm:p-8 mb-4 sm:mb-20 shadow-2xl relative overflow-hidden flex flex-col h-[640px]";

  if (showFullHistory) {
    return (
      <div className={`${frameClasses} animate-in slide-in-from-right duration-300 mx-auto`}>
        <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-20"></div>
        <div className="mt-8 flex items-center gap-4 mb-6 shrink-0">
           <button onClick={() => { haptics.lightClick(); setShowFullHistory(false); }} className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
             <i className="fas fa-chevron-left text-slate-300"></i>
           </button>
           <h2 className="text-xl font-bold">History</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar pb-10">
          {userWallet.transactions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
               <div className="w-full border-2 border-dashed border-slate-800 rounded-[2rem] py-12 flex items-center justify-center bg-slate-900/20">
                 <p className="text-slate-600 font-bold uppercase tracking-[0.2em] text-[10px]">No Transactions</p>
               </div>
            </div>
          ) : (
            userWallet.transactions.map(tx => (
              <div key={tx.id} className="bg-slate-800/50 p-4 rounded-2xl flex items-center justify-between border border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs ${tx.type === 'CREDIT' ? 'bg-green-500/10 text-green-500' : 'bg-slate-700 text-slate-400'}`}>
                    <i className={`fas ${tx.type === 'CREDIT' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs truncate">{tx.peer}</p>
                    <p className="text-[9px] text-slate-500 font-medium">{new Date(tx.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                  </div>
                </div>
                <p className={`font-black text-sm whitespace-nowrap ${tx.type === 'CREDIT' ? 'text-green-500' : 'text-slate-100'}`}>
                  {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${frameClasses} mx-auto`}>
      {showAI && <AIAssistant state={fullState} onClose={() => setShowAI(false)} />}
      
      <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-20"></div>
      
      <div className="sm:mt-8 flex justify-between items-center mb-6 shrink-0">
        <div className="flex flex-col">
           <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{time}</span>
           <h2 className="text-2xl font-black">Hi, User</h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => { haptics.mediumClick(); setShowAI(true); }}
            className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-lg shadow-indigo-500/10"
          >
            <i className="fas fa-robot"></i>
          </button>
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
            <i className="fas fa-user text-slate-500"></i>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2rem] p-6 mb-4 shadow-xl shadow-indigo-500/20 relative overflow-hidden group shrink-0">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-1">ZiP BALANCE</p>
              <h3 className={`text-4xl font-black ${userWallet.balance < 0 ? 'text-red-400' : 'text-white'}`}>₹{userWallet.balance.toFixed(2)}</h3>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <div className="flex gap-2">
                 <button 
                    onClick={() => onToggleConnectivity('bluetooth', !connectivity.isBluetoothOn)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${connectivity.isBluetoothOn ? 'bg-blue-400/20 text-blue-400' : 'bg-white/10 text-white/30'}`}
                  >
                    <i className="fab fa-bluetooth-b text-xs"></i>
                  </button>
                  <button 
                    onClick={() => onToggleConnectivity('wifi', !connectivity.isWifiOn)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${connectivity.isWifiOn ? 'bg-white/30 text-white' : 'bg-white/10 text-white/30'}`}
                  >
                    <i className="fas fa-wifi text-xs"></i>
                  </button>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-end border-t border-white/10 pt-4 mt-2">
            <div>
              <p className="text-[9px] font-bold text-indigo-200 uppercase mb-1">PRIMARY BANK</p>
              <p className="text-sm font-bold text-white">₹{userWallet.phoneBalance.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-indigo-200 uppercase mb-1">WATCH CONNECTION</p>
              <p className={`text-[10px] font-black flex items-center gap-1.5 ${isWatchLinked ? 'text-green-300' : 'text-indigo-300 opacity-60'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isWatchLinked ? 'bg-green-400 animate-pulse' : 'bg-indigo-400'}`}></span>
                {isWatchLinked ? 'CONNECTED' : 'OFFLINE'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/40 rounded-2xl p-4 mb-6 border border-slate-800/50 flex items-center justify-between transition-all shrink-0">
        <div className="flex-1">
          <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-0.5">Auto-Reload</h4>
          <p className="text-[8px] text-slate-500 font-medium">Auto-fund ₹200 when balance &lt; ₹50</p>
        </div>
        <button 
          onClick={() => { haptics.lightClick(); onToggleAutoReload(!userWallet.isAutoReloadEnabled); }}
          className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${userWallet.isAutoReloadEnabled ? 'bg-indigo-600' : 'bg-slate-700'}`}
        >
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${userWallet.isAutoReloadEnabled ? 'left-7' : 'left-1'}`}></div>
        </button>
      </div>

      <div className="mb-6 shrink-0">
        <div className="flex justify-between items-center mb-3 px-1">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">TOP-UP WALLET</h4>
          <span className="text-[8px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">MICRO-PAY READY</span>
        </div>
        <div className="space-y-3">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">₹</span>
            <input 
              type="number" 
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-8 pr-4 text-sm font-bold focus:outline-none focus:border-indigo-600 transition-all placeholder:text-slate-800 text-white"
            />
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => {
                haptics.mediumClick();
                onLoadMoney(Number(amount));
                setAmount('');
              }}
              disabled={!isLoadReady || !amount}
              className={`flex-1 py-3.5 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${isLoadReady && amount ? 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
            >
              <i className="fas fa-plus-circle"></i> Load
            </button>
            <button 
              onClick={() => { haptics.mediumClick(); onSync(); }}
              disabled={!connectivity.isBluetoothOn}
              className={`flex-1 py-3.5 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${connectivity.isBluetoothOn ? 'bg-slate-800 text-indigo-400 border border-indigo-500/10 hover:border-indigo-500/40 active:scale-95' : 'bg-slate-900/50 text-slate-700 border border-slate-800 cursor-not-allowed'}`}
            >
              <i className="fas fa-sync-alt"></i> Sync
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {/* RECENT ACTIVITY Header Redesign */}
        <div className="flex justify-between items-center mb-4 px-1 shrink-0">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Recent Activity</h4>
          <button 
            onClick={() => { haptics.lightClick(); setShowFullHistory(true); }} 
            className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide hover:underline transition-all"
          >
            See All
          </button>
        </div>
        
        {/* RECENT ACTIVITY List/Empty State Redesign */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar pb-2 snap-y snap-mandatory flex flex-col">
          {userWallet.transactions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center mb-4">
               <div className="w-full border-2 border-dashed border-slate-800/60 rounded-[2rem] py-10 flex items-center justify-center bg-slate-900/10">
                 <p className="text-slate-600 font-bold uppercase tracking-[0.2em] text-[10px] opacity-80">No Transactions</p>
               </div>
            </div>
          ) : (
            userWallet.transactions.slice(0, 3).map(tx => (
              <div key={tx.id} className="bg-slate-800/30 p-3 rounded-2xl flex items-center justify-between border border-slate-800/50 hover:border-slate-700 transition-colors snap-start shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] ${tx.type === 'CREDIT' ? 'bg-green-500/10 text-green-500' : 'bg-slate-700 text-slate-400'}`}>
                    <i className={`fas ${tx.type === 'CREDIT' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate max-w-[120px]">{tx.peer}</p>
                    <p className="text-[8px] text-slate-500 font-medium">{new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <p className={`text-xs font-black ${tx.type === 'CREDIT' ? 'text-green-400' : (tx.peer.includes('Emergency') ? 'text-red-400' : 'text-slate-200')}`}>
                  {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Bottom Home Indicator Pill */}
        <div className="mt-auto pt-2 pb-1 shrink-0">
           <div className="w-16 h-1.5 bg-slate-800/60 rounded-full mx-auto"></div>
        </div>
      </div>

      {phoneAlert && (
        <NotificationOverlay 
          message={phoneAlert.message} 
          type={phoneAlert.type} 
          duration={3500} 
          onClose={onCloseAlert} 
        />
      )}
    </div>
  );
};

export default SmartphoneUPI;
