
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { GlobalState } from '../types';

interface Props {
  state: GlobalState;
  onClose: () => void;
}

const AIAssistant: React.FC<Props> = ({ state, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Hi! I'm your ZiP Assistant. Ask me about your spending or if you should top up your wallet!" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const context = `
        User Current Wallet Balance: ₹${state.userWallet.balance}
        User Phone Bank Balance: ₹${state.userWallet.phoneBalance}
        Recent Transactions: ${JSON.stringify(state.userWallet.transactions.slice(0, 10))}
        Auto-Reload is: ${state.userWallet.isAutoReloadEnabled ? 'ON' : 'OFF'}
        
        Rules:
        - Be concise and helpful.
        - You are a financial assistant for ZiPPaY, a smartwatch micro-payment app.
        - Max amount per transaction is ₹200. Max wallet limit is ₹500.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { role: 'user', parts: [{ text: `${context}\n\nUser Question: ${userMsg}` }] }
        ],
        config: {
          systemInstruction: "You are a witty, helpful FinTech AI assistant for the ZiPPaY app. Keep responses under 60 words.",
          temperature: 0.7,
        }
      });

      const aiText = response.text || "I'm having trouble connecting right now. Try again later!";
      setMessages(prev => [...prev, { role: 'assistant', content: aiText }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Oops! Make sure your API_KEY is set in the environment variables." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute inset-x-0 bottom-0 top-12 bg-slate-900/95 backdrop-blur-xl z-[110] flex flex-col animate-in slide-in-from-bottom duration-300 rounded-t-[2.5rem] border-t border-slate-700">
      <div className="flex justify-between items-center p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <i className="fas fa-robot text-white text-sm"></i>
          </div>
          <h3 className="font-bold">ZiP Assistant</h3>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white p-2">
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700 flex gap-1">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-950/50">
        <div className="relative">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-4 pr-12 text-xs focus:outline-none focus:border-indigo-600 transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white disabled:opacity-50"
          >
            <i className="fas fa-paper-plane text-[10px]"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
