import React, { useState, useRef, useEffect } from 'react';
import {
  Stethoscope,
  Send,
  Sparkles,
  Bot,
  User,
  Volume2,
  VolumeX,
  HelpCircle,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import { speakText, stopSpeech } from '../utils/speech';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface PlantDoctorChatProps {
  initialPlantName?: string;
  language: 'gu' | 'en';
}

export const PlantDoctorChat: React.FC<PlantDoctorChatProps> = ({
  initialPlantName = '',
  language,
}) => {
  const isGu = language === 'gu';
  const [plantSubject, setPlantSubject] = useState(initialPlantName);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: isGu
        ? `નમસ્તે! હું તમારો AI પ્લાન્ટ ડૉક્ટર છું. તમારા છોડમાં કોઈ રોગ, પીળા પાંદડા, કીટકો કે ખાતર-વાતાવરણને લગતો પ્રશ્ન હોય તો મને પૂછો!`
        : `Hello! I am your AI Plant Doctor. Ask me anything about plant diseases, yellow leaves, pests, organic fertilizers, or climate care!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickPromptsGu = [
    'પીળા પડી ગયેલા પાંદડા કેવી રીતે સાજા કરવા?',
    'વધારે ફૂલો મેળવવા કયું દેશી ખાતર આપવું?',
    'લીમડાના તેલનો જંતુનાશક સ્પ્રે કેવી રીતે બનાવવો?',
    'ઉનાળાના આકરા તડકા અને લૂથી છોડને કેવી રીતે બચાવવો?',
    'કૂંડાની માટીમાં ફૂગ કે કીડીઓ માટે ઘરગથ્થુ ઉપાય?',
  ];

  const quickPromptsEn = [
    'How to fix yellowing leaves on my plant?',
    'What organic fertilizer boosts heavy flowering?',
    'How do I make a neem oil pesticide spray at home?',
    'How to protect potted plants from extreme summer heat?',
    'Home remedies for soil fungus and ants?',
  ];

  const quickPrompts = isGu ? quickPromptsGu : quickPromptsEn;

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/plant-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plantName: plantSubject,
          userMessage: trimmed,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
          language: isGu ? 'gu' : 'en',
        }),
      });

      const data = await res.json();
      if (data.reply) {
        const modelMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, modelMsg]);
      } else {
        throw new Error(data.error || 'No reply');
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: isGu
          ? 'માફ કરશો, હાલમાં જવાબ મેળવવામાં ક્ષતિ આવી છે. કૃપા કરીને થોડીવાર પછી પ્રયાસ કરો.'
          : 'Sorry, could not fetch an answer right now. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakMessage = async (msgId: string, text: string) => {
    if (activeSpeechId === msgId) {
      stopSpeech();
      setActiveSpeechId(null);
    } else {
      setActiveSpeechId(msgId);
      await speakText(text, isGu ? 'gu' : 'en');
      setActiveSpeechId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span>{isGu ? 'AI પ્લાન્ટ ડૉક્ટર' : 'AI Plant Doctor'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30">
                Live
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              {isGu
                ? 'છોડના કોઈપણ રોગ, માવજત અને દેશી આયુર્વેદિક ઉપાયો વિશે પૂછો'
                : 'Ask anything regarding plant diseases, pest remedies, and seasonal care'}
            </p>
          </div>
        </div>

        {/* Selected Plant context */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={plantSubject}
            onChange={(e) => setPlantSubject(e.target.value)}
            placeholder={isGu ? 'છોડનું નામ (દા.ત. તુલસી, ગુલાબ)' : 'Plant name (e.g. Tulsi, Rose)'}
            className="w-full sm:w-48 bg-slate-850 border border-slate-750 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isSpeakingThis = activeSpeechId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isUser
                      ? 'bg-emerald-600 text-white'
                      : 'bg-teal-950 text-teal-300 border border-teal-700/50'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div
                  className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-slate-850 text-slate-200 border border-slate-750 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  <div className="flex items-center justify-between gap-3 mt-2 pt-1 border-t border-slate-750/50 text-[10px] text-slate-400">
                    <span>{msg.timestamp}</span>

                    {!isUser && (
                      <button
                        onClick={() => handleSpeakMessage(msg.id, msg.text)}
                        className="flex items-center gap-1 hover:text-white transition-colors"
                        title={isGu ? 'સાંભળો' : 'Listen'}
                      >
                        {isSpeakingThis ? (
                          <>
                            <VolumeX className="w-3 h-3 text-amber-400" />
                            <span className="text-amber-400">{isGu ? 'અટકાવો' : 'Stop'}</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3 text-emerald-400" />
                            <span>{isGu ? 'સાંભળો' : 'Listen'}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-[75%] mr-auto items-center">
              <div className="w-8 h-8 rounded-full bg-teal-950 text-teal-300 border border-teal-700/50 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-750 text-xs text-slate-400 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-400" />
                <span>{isGu ? 'પ્લાન્ટ ડૉક્ટર વિચારી રહ્યા છે...' : 'Plant Doctor is formulating advice...'}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-850 border-t border-slate-800 overflow-x-auto flex gap-2 no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 shrink-0">
            <Lightbulb className="w-3 h-3 text-amber-400" />
            <span>{isGu ? 'ઝડપી પ્રશ્નો:' : 'Quick Questions:'}</span>
          </span>
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-emerald-300 border border-slate-700 text-[11px] font-medium transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-850 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isGu
                  ? 'છોડની તકલીફ અથવા ઉપાય વિશે અહીં લખો...'
                  : 'Ask about leaves, disease, weather, or fertilizer...'
              }
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-emerald-700/20 flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">{isGu ? 'પૂછો' : 'Send'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
