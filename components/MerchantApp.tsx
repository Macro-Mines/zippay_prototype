
import React, { useState } from 'react';
import { GlobalState, NotificationType } from '../types';
import NotificationOverlay from './NotificationOverlay';
import { haptics } from '../utils/haptics';

interface Props {
  wallet: GlobalState['merchantWallet'];
  phoneAlert: { message: string; type: NotificationType } | null;
  onRequestPayment: (amount: number) => void;
  onToggleActive: () => void;
  onWithdraw: () => void;
  onCloseAlert: () => void;
}

const MerchantApp: React.FC<Props> = ({ 
  wallet, 
  phoneAlert,
  onRequestPayment, 
  onToggleActive, 
  onWithdraw,
  onCloseAlert
}) => {
  const [requestAmt, setRequestAmt] = useState<string>('');

  const handleKeypad = (val: string) => {
    haptics.lightClick();
    if (val === 'C') return setRequestAmt('');
    if (requestAmt.length >= 4) return;
    setRequestAmt(prev => prev + val);
  };

  return (
    <div className="w-full sm:max-w-sm bg-slate-900 sm:border border-slate-800 sm:rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col h-[640px] mb-20 mx-auto">
      
      {/* Top Bar with Blinking Active Status */}
      <div className="flex justify-between items-start mb-4 shrink-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <button 
              onClick={onToggleActive}
              className={`w-3 h-3 rounded-full ${wallet.isActive ? 'blinking-green bg-green-500' : 'blinking-red bg-red-500'}`}
            ></button>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              {wallet.isActive ? 'Terminal Active' : 'Offline'}
            </span>
          </div>
          <h2 className="text-xl font-bold mt-0.5">Merchant Hub</h2>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tight">Balance</p>
          <p className="text-lg font-black text-green-400">₹{wallet.balance.toFixed(2)}</p>
        </div>
      </div>

      {/* Input Display */}
      <div className="bg-slate-950 rounded-2xl p-4 mb-4 flex flex-col items-center justify-center border border-slate-800 shadow-inner shrink-0">
        <p className="text-[10px] text-slate-600 mb-1 uppercase font-bold tracking-widest">Request Amount</p>
        <div className="text-5xl font-mono text-indigo-400 font-bold">
          ₹{requestAmt || '0'}
        </div>
        <p className="text-[9px] text-slate-700 mt-2 font-medium">Max transaction limit: ₹200</p>
      </div>

      {/* Keypad - Tightened margin below grid */}
      <div className="grid grid-cols-3 gap-2 mb-1 shrink-0">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', 'C'].map(key => (
          <button
            key={key}
            onClick={() => handleKeypad(key)}
            className="h-11 bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all rounded-xl font-bold text-lg flex items-center justify-center border border-slate-700/30"
          >
            {key}
          </button>
        ))}
      </div>

      {/* Main Actions - Reduced gap to keypad by removing mt-auto and using mt-3 */}
      <div className="mt-3 space-y-2 shrink-0">
        <button 
          onClick={() => {
            const amt = Number(requestAmt);
            if (amt > 0) {
              onRequestPayment(amt);
              setRequestAmt('');
            }
          }}
          disabled={!wallet.isActive || !requestAmt}
          className={`w-full py-4 rounded-xl font-bold text-base shadow-lg flex items-center justify-center gap-3 transition-all ${wallet.isActive && requestAmt ? 'bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98]' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
        >
          <i className="fas fa-hand-holding-usd text-sm"></i> Request Payment
        </button>

        <div className="flex gap-2">
          <button 
            onClick={() => { haptics.lightClick(); onWithdraw(); }}
            className="flex-1 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <i className="fas fa-university"></i> Settle
          </button>
          <div className="flex-[0.8] bg-slate-950 rounded-xl px-3 flex flex-col justify-center border border-slate-800">
             <span className="text-[7px] text-slate-500 uppercase font-black">Bank Ledger</span>
             <span className="text-[11px] font-black text-slate-300 truncate tracking-tight">₹{wallet.bankBalance.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Local Terminal Notification */}
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

export default MerchantApp;
