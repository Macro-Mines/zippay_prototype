
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { GlobalState } from '../types';

interface Props {
  state: GlobalState;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_ACTIONS = [
  "Should I top up my wallet?",
  "Analyze my spending habits",
  "Explain Emergency ZiP"
];

const AIAssistant: React.FC<Props> = ({ state, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: "Hello! I'm ZiP, your personal finance wingman. I can analyze your spending patterns or help you manage your wallet. What's on your mind?",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSend = async (customMsg?: string) => {
    const textToSend = customMsg || input.trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = { role: 'user', content: textToSend, timestamp: new Date() };
    if (!customMsg) setInput('');
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const statsContext = `
        Current Balance: ₹${state.userWallet.balance}
        Bank Balance: ₹${state.userWallet.phoneBalance}
        History: ${state.userWallet.transactions.length} total txns.
        Recent: ${state.userWallet.transactions.slice(0, 5).map(t => `${t.peer}: ₹${t.amount}`).join(', ')}
        Offline Count: ${state.userWallet.offlineCount}/5
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { role: 'user', parts: [{ text: `CONTEXT:\n${statsContext}\n\nUSER QUESTION: ${textToSend}` }] }
        ],
        config: {
          systemInstruction: "You are ZiP, a sophisticated and friendly FinTech AI for the ZiPPaY app. Use a mix of professionalism and modern wit. Keep advice actionable and under 50 words. If the user asks about spending, analyze their recent context. If they are in debt (negative balance), prioritize advice on clearing it.",
          temperature: 0.8,
        }
      });

      const aiText = response.text || "I'm experiencing a slight glitch in the matrix. Could you try that again?";
      setMessages(prev => [...prev, { role: 'assistant', content: aiText, timestamp: new Date() }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I couldn't reach the servers. Please ensure your API_KEY is correctly configured in the environment settings.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-[110] flex flex-col bg-slate-950 animate-in fade-in zoom-in duration-300">
      {/* Header */}
      <div className="pt-10 pb-4 px-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <i className="fas fa-bolt text-white text-lg"></i>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-slate-950 rounded-full"></span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">ZiP Intelligence</h3>
            <p className="text-[10px] text-slate-500 font-medium">Always active • V3.1</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      {/* Message Area */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent"
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} group animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-sm transition-all ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/10' 
                : 'bg-slate-800/80 backdrop-blur-sm text-slate-200 rounded-tl-none border border-slate-700/50'
            }`}>
              {msg.content}
            </div>
            <span className="text-[8px] text-slate-600 mt-1 px-1 font-bold tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-slate-800/50 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-700/30 flex gap-1.5 items-center">
              <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-slate-900/80 border-t border-slate-800 backdrop-blur-xl">
        {/* Quick Actions - Vertically Aligned and Transparent */}
        <div className="flex flex-col gap-2 mb-4">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action}
              onClick={() => handleSend(action)}
              className="w-full text-left px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300 opacity-70 hover:opacity-100 hover:bg-indigo-600 hover:border-indigo-500 hover:text-white transition-all active:scale-[0.98]"
            >
              {action}
            </button>
          ))}
        </div>

        <div className="relative group">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-slate-700 text-slate-200"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white disabled:opacity-30 disabled:grayscale transition-all hover:bg-indigo-500 active:scale-90 shadow-lg shadow-indigo-600/20"
          >
            <i className="fas fa-arrow-up text-sm"></i>
          </button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default AIAssistant;
