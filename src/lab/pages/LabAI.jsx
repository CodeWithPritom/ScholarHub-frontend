import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLab } from '../context/LabContext';
import { labApi } from '../utils/labApi';
import { 
  Sparkles, 
  Send, 
  Activity, 
  ShieldCheck, 
  Bot, 
  Coins, 
  AlertCircle,
  Loader2,
  Server,
  Zap,
  Cpu,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

export default function LabAI() {
  const { labId } = useParams();
  const { can, quota, refreshQuota, currentLab } = useLab();

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chat Interface State
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Welcome to your Autonomous Lab AI Research Copilot. All AI inference is provisioned directly through ScholarHub\'s institutional compute mesh (Groq, OpenRouter, Gemini) and draws from your lab\'s shared quota pool. How can I assist your laboratory today?'
    }
  ]);
  const [promptInput, setPromptInput] = useState('');
  const [chatting, setChatting] = useState(false);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const res = await labApi.listAIProviders(labId);
      setProviders(res.providers || []);
    } catch (e) {
      toast.error('Failed to load lab AI compute mesh status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, [labId]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const prompt = promptInput.trim();
    if (!prompt || chatting) return;

    const userMsg = { role: 'user', content: prompt };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setPromptInput('');
    setChatting(true);

    try {
      const res = await labApi.chatAI(labId, {
        messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        max_tokens: 1400
      });

      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: res.text || 'Inference completed without text response.',
          provider: res.provider,
          model: res.model,
          tokens: res.tokens_used
        }
      ]);
      await refreshQuota();
      toast.success(`Consumed ${res.tokens_used || 240} Lab Tokens`);
    } catch (err) {
      toast.error(err.message || 'AI inference request failed');
      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: `⚠️ Notice: ${err.message || 'Inference engine busy'}. If your token balance is depleted, please request a quota top-up from your platform administrator.`
        }
      ]);
    } finally {
      setChatting(false);
    }
  };

  const handleQuickPrompt = (text) => {
    setPromptInput(text);
  };

  const percentUsed = quota.allocated > 0
    ? Math.min(100, Math.round((quota.consumed / quota.allocated) * 100))
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#171717]">Institutional AI Copilot & Compute Gateway</h2>
          <p className="text-xs text-[#737373] mt-0.5">
            High-throughput academic neural inference mesh provisioned, monitored, and maintained by Platform Administration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadProviders}
            className="p-2 bg-white hover:bg-[#F4F4F0] text-[#737373] border border-[#E5E5DF] rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors"
            title="Refresh Compute Gateway Status"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Mesh Active & Operational</span>
          </div>
        </div>
      </div>

      {/* Admin Provisioning Notice Card */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
            <ShieldCheck size={15} />
            <span>Centrally Managed Infrastructure</span>
          </div>
          <h3 className="text-base font-bold text-white">
            Lab API & Neural Infrastructure are Admin-Provided
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Your laboratory operates on dedicated institutional compute keys managed securely by the platform administrator via the ScholarHub Admin Panel. Researchers do not need to register personal API keys or contact external third-party dealers.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 shrink-0">
          <Link
            to={`/lab/${labId}/billing`}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/10 backdrop-blur-xs inline-flex items-center gap-1.5 transition-colors"
          >
            <Coins size={14} className="text-amber-400" />
            <span>Manage Token Budget</span>
          </Link>
          <span className="text-[11px] text-slate-400">
            {quota.available?.toLocaleString() || 0} Tokens Available
          </span>
        </div>
      </div>

      {/* Institutional Compute Mesh Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider flex items-center gap-2">
          <Cpu size={14} className="text-indigo-600" />
          <span>Active Institutional Neural Models</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {providers.map((p, idx) => (
            <div key={p.id || idx} className="bg-white border border-[#E5E5DF] rounded-2xl p-4 shadow-xs space-y-3 hover:border-slate-400 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-800 uppercase">
                    {p.provider?.substring(0, 2) || 'AI'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#171717] capitalize">{p.provider} Mesh</h4>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold">
                      Admin Provisioned
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-full">
                  Tier {p.priority || idx + 1}
                </span>
              </div>

              <div className="bg-[#FAFAF8] rounded-xl p-2.5 border border-[#F4F4F0] space-y-1">
                <span className="text-[10px] text-[#A3A3A3] font-semibold uppercase tracking-wider block">Model Target</span>
                <span className="text-xs font-bold text-[#171717] font-mono block truncate" title={p.model}>
                  {p.model}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#737373] pt-1 border-t border-[#F4F4F0]">
                <span className="flex items-center gap-1">
                  <Activity size={12} className="text-indigo-600" />
                  Rate: {p.rpm_limit || 60} RPM
                </span>
                <span className="font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  Zero-Data Retention
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive AI Research Assistant Chat */}
      <div className="bg-white border border-[#E5E5DF] rounded-2xl shadow-xs overflow-hidden flex flex-col h-[560px]">
        {/* Chat Header */}
        <div className="px-5 py-3 border-b border-[#E5E5DF] bg-[#FAFAF8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#171717]">Autonomous Lab Research Copilot</h3>
              <p className="text-[10px] text-[#737373]">
                Drawing from {currentLab?.name || 'Laboratory'} shared token quota
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1.5">
              <Coins size={12} className="text-amber-600" />
              {quota.available?.toLocaleString() || 0} Tokens Remaining
            </span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 leading-relaxed shadow-xs ${
                  m.role === 'user'
                    ? 'bg-[#0F172A] text-white rounded-br-xs'
                    : 'bg-[#FAFAF8] text-[#171717] border border-[#E5E5DF] rounded-bl-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.tokens && (
                  <div className="mt-2.5 pt-2 border-t border-[#E5E5DF] text-[10px] text-[#737373] flex items-center justify-between">
                    <span>Engine: {m.provider} ({m.model})</span>
                    <span>{m.tokens} tokens debited</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {chatting && (
            <div className="flex items-center gap-2.5 text-xs text-[#737373] p-3 bg-slate-50 border border-slate-200 rounded-xl max-w-sm">
              <Loader2 size={16} className="animate-spin text-[#0F172A]" />
              <span>Querying institutional model mesh & synthesizing literature...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestions */}
        <div className="px-4 py-2 border-t border-[#F4F4F0] bg-white flex items-center gap-2 overflow-x-auto text-[11px] text-[#525252]">
          <span className="text-[10px] font-bold text-[#A3A3A3] uppercase shrink-0">Quick Queries:</span>
          <button 
            type="button" 
            onClick={() => handleQuickPrompt("Summarize state-of-the-art methodology for single-cell RNA sequencing.")}
            className="px-2.5 py-1 bg-[#FAFAF8] hover:bg-[#F4F4F0] border border-[#E5E5DF] rounded-lg shrink-0 cursor-pointer transition-colors"
          >
            RNA-Seq Methodology
          </button>
          <button 
            type="button" 
            onClick={() => handleQuickPrompt("Draft a formal CRediT authorship statement for our upcoming manuscript.")}
            className="px-2.5 py-1 bg-[#FAFAF8] hover:bg-[#F4F4F0] border border-[#E5E5DF] rounded-lg shrink-0 cursor-pointer transition-colors"
          >
            CRediT Statement
          </button>
          <button 
            type="button" 
            onClick={() => handleQuickPrompt("Review experimental protocol and highlight potential confounding variables.")}
            className="px-2.5 py-1 bg-[#FAFAF8] hover:bg-[#F4F4F0] border border-[#E5E5DF] rounded-lg shrink-0 cursor-pointer transition-colors"
          >
            Protocol Review
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-[#E5E5DF] bg-[#FAFAF8] flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask research questions, synthesize papers, or request bioinformatics pipelines..."
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            disabled={chatting}
            className="flex-1 px-4 py-2.5 bg-white border border-[#E5E5DF] rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#0F172A]"
          />
          <button
            type="submit"
            disabled={chatting || !promptInput.trim()}
            className="px-4 py-2.5 bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer font-bold text-xs"
          >
            <Send size={14} />
            <span>Run</span>
          </button>
        </form>
      </div>
    </div>
  );
}
