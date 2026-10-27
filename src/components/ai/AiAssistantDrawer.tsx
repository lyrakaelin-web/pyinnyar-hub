import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { t } from '../../utils/translations';
import { apiUrl } from '../../utils/api';
import {
  Sparkles,
  X,
  Send,
  BookOpen,
  HelpCircle,
  FileText,
  MapPin,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';

export const AiAssistantDrawer: React.FC = () => {
  const { isAiAssistantOpen, openAiAssistant, language, courses, selectedCourseId, getAuthHeaders } = useApp();

  const [prompt, setPrompt] = useState('');
  const [action, setAction] = useState<'explain' | 'summarize' | 'practice_questions' | 'learning_path' | 'general'>('explain');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const activeCourse = courses.find((c) => c.id === selectedCourseId);

  const [conversation, setConversation] = useState<{
    sender: 'user' | 'assistant';
    text: string;
    actionType?: string;
  }[]>([
    {
      sender: 'assistant',
      text: language === 'my'
        ? 'မင်္ဂလာပါ! ကျွန်တော်သည် PYINNYAR AI ဖြစ်ပါသည်။ ခက်ခဲသော ဘာသာရပ်ဆိုင်ရာ သဘောတရားများ ရှင်းလင်းခြင်း၊ စာမေးပွဲ မေးခွန်းများ ထုတ်ပေးခြင်းနှင့် သင်ယူမှု လမ်းညွှန်များ ဆွဲပေးခြင်းတို့ကို ကူညီပေးနိုင်ပါသည်။ မည်သည့်အရာကို ဆွေးနွေးလိုပါသလဲ?'
        : 'Mingalarpar! I am Pyinnyar AI, your dedicated academic study companion. I can help simplify complex theories, summarize course modules, generate practice quizzes, and design customized study roadmaps in English or Myanmar.',
    },
  ]);

  const quickPrompts = [
    {
      label: language === 'my' ? 'React Hooks ကို ရှင်းပြပါ' : 'Explain React State & Hooks simply',
      text: 'Can you explain React State and Hooks in simple terms with everyday analogies?',
      type: 'explain' as const,
    },
    {
      label: language === 'my' ? 'ဘဏ္ဍာရေး အနှစ်ချုပ်' : 'Summarize Startup Cash Runway',
      text: 'Provide a concise summary of cash flow runway and burn rate for early-stage founders.',
      type: 'summarize' as const,
    },
    {
      label: language === 'my' ? 'လေ့ကျင့်ခန်း မေးခွန်းထုတ်ရန်' : 'Generate 3 Quiz Practice Questions',
      text: 'Generate 3 practice questions on RESTful API design with answers and explanations.',
      type: 'practice_questions' as const,
    },
    {
      label: language === 'my' ? '၄ ပတ်တာ လေ့လာမှုလမ်းညွှန်' : '4-Week Full-Stack Roadmap',
      text: 'Suggest a practical 4-week study roadmap to become job-ready in web engineering.',
      type: 'learning_path' as const,
    },
  ];

  if (!isAiAssistantOpen) return null;

  const handleSend = async (userText: string = prompt, actionType = action) => {
    const textToSend = userText.trim();
    if (!textToSend || isLoading) return;

    setConversation((prev) => [...prev, { sender: 'user', text: textToSend, actionType }]);
    setPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch(apiUrl('/api/ai/assistant'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          prompt: textToSend,
          action: actionType,
          courseContext: activeCourse ? `${activeCourse.title} (${activeCourse.level})` : undefined,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Server returned an error');
      }

      const data = await response.json();
      setConversation((prev) => [
        ...prev,
        { sender: 'assistant', text: data.reply || 'No response generated.', actionType },
      ]);
    } catch (err) {
      console.error('Failed to communicate with AI endpoint:', err);
      // Helpful fallback
      setConversation((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: language === 'my'
            ? 'တောင်းပန်ပါသည်။ ဆက်သွယ်မှု နှောင့်နှေးမှု ဖြစ်ပေါ်နေပါသည်။ သင်ရိုးပါ ဗီဒီယိုမှတ်စုများနှင့် မေးခွန်းများကို ပြန်လည်စစ်ဆေးနိုင်ပြီး သင်တန်းဆရာနှင့် Discussion Forum တွင် ဆက်လက်ဆွေးနွေးနိုင်ပါသည်။'
            : 'We encountered a momentary network delay. You can review the downloadable course summary notes, or post your query directly to the student discussion circle.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full sm:max-w-md md:max-w-lg bg-[#F5F0E6] h-full shadow-2xl flex flex-col relative animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="bg-[#14243A] text-white p-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C7A66A] flex items-center justify-center text-[#14243A]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-tight">Pyinnyar AI Assistant</h3>
                <span className="text-[10px] font-mono text-[#C7A66A] bg-white/10 px-1.5 py-0.5 rounded">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-xs text-white/70">
                {activeCourse ? activeCourse.title : (language === 'my' ? 'သင်ကြားရေး အကူအညီ' : 'Academic Study Companion')}
              </p>
            </div>
          </div>
          <button
            onClick={() => openAiAssistant(false)}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Mode Selector */}
        <div className="px-4 py-2 bg-white border-b border-stone-200 flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
          <button
            onClick={() => setAction('explain')}
            className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap flex items-center gap-1 transition-colors ${
              action === 'explain' ? 'bg-[#14243A] text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{language === 'my' ? 'ရှင်းပြပါ' : 'Explain'}</span>
          </button>
          <button
            onClick={() => setAction('summarize')}
            className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap flex items-center gap-1 transition-colors ${
              action === 'summarize' ? 'bg-[#14243A] text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{language === 'my' ? 'အနှစ်ချုပ်' : 'Summarize'}</span>
          </button>
          <button
            onClick={() => setAction('practice_questions')}
            className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap flex items-center gap-1 transition-colors ${
              action === 'practice_questions' ? 'bg-[#14243A] text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{language === 'my' ? 'မေးခွန်းများ' : 'Questions'}</span>
          </button>
          <button
            onClick={() => setAction('learning_path')}
            className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap flex items-center gap-1 transition-colors ${
              action === 'learning_path' ? 'bg-[#14243A] text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{language === 'my' ? 'လမ်းညွှန်' : 'Roadmap'}</span>
          </button>
        </div>

        {/* Conversation Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {conversation.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-[#14243A] text-white rounded-br-xs'
                    : 'bg-white text-stone-900 border border-stone-200/80 shadow-xs rounded-bl-xs'
                }`}
              >
                {msg.text}
              </div>
              {msg.sender === 'assistant' && (
                <div className="flex items-center gap-2 mt-1 px-1 text-[11px] text-stone-500">
                  <button
                    onClick={() => copyToClipboard(msg.text, idx)}
                    className="flex items-center gap-1 hover:text-stone-800 transition-colors"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 p-3 bg-white/80 rounded-xl text-xs text-stone-600 border border-stone-200 w-fit">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C7A66A]" />
              <span>{language === 'my' ? 'AI မှ စဉ်းစားတွေးခေါ် ရှင်းလင်းနေပါသည်...' : 'Pyinnyar AI is generating study insights...'}</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 bg-stone-100/80 border-t border-stone-200 flex gap-2 overflow-x-auto text-[11px] shrink-0">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp.text, qp.type)}
              className="px-2.5 py-1.5 rounded-full bg-white text-stone-700 border border-stone-200 hover:border-[#C7A66A] hover:text-[#14243A] whitespace-nowrap transition-colors"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-stone-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                language === 'my'
                  ? 'သင်ကြားရေးဆိုင်ရာ မေးခွန်းများကို မေးမြန်းပါ...'
                  : 'Ask about concepts, codes, theories, or exam prep...'
              }
              className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C7A66A] focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-[#14243A] text-white flex items-center justify-center hover:bg-[#1E3452] disabled:opacity-40 transition-colors shrink-0"
            >
              <Send className="w-4 h-4 text-[#C7A66A]" />
            </button>
          </form>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-stone-500 px-1">
            <span>{language === 'my' ? 'ဘာသာစကား ၂ မျိုးလုံး မေးမြန်းနိုင်ပါသည်' : 'Supports English & Myanmar'}</span>
            <span className="text-stone-400">PYINNYAR HUB AI</span>
          </div>
        </div>
      </div>
    </div>
  );
};
