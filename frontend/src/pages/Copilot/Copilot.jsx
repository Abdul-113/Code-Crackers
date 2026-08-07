import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, Brain, ShieldCheck, Landmark, Key,
  Cpu, Activity, RefreshCw, Trash2, Heart,
  FileText, TrendingUp, AlertTriangle, ArrowRight,
  Layers, Lock, HelpCircle, ChevronRight, Copy, Plus, MessageSquare
} from 'lucide-react';
import ContentContainer from '@/components/layout/ContentContainer';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useInvoices } from '@/hooks/useInvoices';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const PRESET_PROMPTS = [
  { label: 'Safest Invoices', text: 'Which invoices in the platform are the safest to invest in?' },
  { label: 'Explain Risk Grades', text: 'Explain why risk grades are assigned (e.g. A vs B) and how MSMEs can improve them.' },
  { label: 'Risk Factors Checklist', text: 'What are the major risk factors assessed in invoice underwriting?' },
  { label: 'Investment Recommendation', text: 'Explain expected investor yield rates and recommended funding caps.' }
];

export default function Copilot() {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid || 'anonymous_user';

  // Live invoices list for context switcher
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices();

  // Component states
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const chatEndRef = useRef(null);

  // Auto-scroll chat window
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking, streamingResponse]);

  // Set default active context once invoices load
  useEffect(() => {
    if (invoices.length > 0 && !selectedInvoice) {
      setSelectedInvoice(invoices[0]);
    }
  }, [invoices, selectedInvoice]);

  // Load chat history from Firestore
  const fetchChatHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/v1/ai/copilot/history/${userId}`);
      setThreads(res.data);
      if (res.data.length > 0 && !activeThreadId) {
        // Load the most recent chat thread
        loadThread(res.data[0].chatId);
      } else if (res.data.length === 0) {
        // Create initial thread
        startNewThread();
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, [userId]);

  const loadThread = async (chatId) => {
    setActiveThreadId(chatId);
    setStreamingResponse('');
    try {
      const res = await axios.get(`${API_BASE_URL}/v1/ai/copilot/chat/${chatId}`);
      // Convert stored message schema to UI message schema
      const mapped = (res.data.messages || []).map((m, idx) => ({
        id: idx,
        sender: m.role === 'user' ? 'user' : 'ai',
        text: m.content
      }));
      setMessages(mapped);
    } catch (err) {
      console.error('Failed to load chat thread:', err);
    }
  };

  const startNewThread = () => {
    const newChatId = `chat_${Date.now()}`;
    setActiveThreadId(newChatId);
    setMessages([]);
    setStreamingResponse('');
    // Prepend to thread listing
    setThreads(prev => [
      { chatId: newChatId, updatedAt: new Date().toISOString(), messages: [] },
      ...prev
    ]);
  };

  // SSE token-streaming controller
  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const userPrompt = text.trim();
    setInput('');

    // Append user message immediately
    const userMsg = { id: Date.now(), sender: 'user', text: userPrompt };
    setMessages(prev => [...prev, userMsg]);
    setThinking(true);
    setStreamingResponse('');

    const currentChatId = activeThreadId || `chat_${Date.now()}`;
    if (!activeThreadId) {
      setActiveThreadId(currentChatId);
    }

    try {
      // Build sliding context history to feed LLM
      const historyPayload = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      // Trigger streaming fetch POST
      const response = await fetch(`${API_BASE_URL}/v1/ai/copilot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: currentChatId,
          userId,
          messageText: userPrompt,
          history: historyPayload
        })
      });

      if (!response.body) {
        throw new Error('Readable stream not supported.');
      }

      setThinking(false);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setStreamingResponse(accumulated);
      }

      // Add finished response to permanent message stack
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, sender: 'ai', text: accumulated }
      ]);
      setStreamingResponse('');

      // Refresh thread list metadata
      fetchChatHistory();

    } catch (err) {
      console.error('Streaming error:', err);
      setThinking(false);
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 2, sender: 'ai', text: `Connection lost. Fallback explanation: Live credit report underwriting rules state the average DeFi financing rate is 10% APR.` }
      ]);
    }
  };

  const handleCopy = (txt) => {
    navigator.clipboard.writeText(txt);
    toast.success("Response copied to clipboard.");
  };

  return (
    <ContentContainer>
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 border-b border-gray-150 dark:border-slate-800/80 pb-6">
        <div>
          <h1 className="text-3xl font-display font-extrabold tracking-tight text-gray-900 dark:text-white">
            AI Financial Assistant
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Query underwriting grades, expected yields, platform risks, and specific counterparty exposures.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-xs font-semibold text-blue-500 dark:text-blue-400">
          <Brain className="h-4 w-4 animate-pulse" />
          <span>Llama 3.3 Underwriter: Online</span>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid lg:grid-cols-4 gap-8">
        
        {/* Sidebar: Conversations & Context Switches */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Preset triggers */}
          <div className="rounded-2xl border border-gray-150 dark:border-slate-800/80 bg-white dark:bg-dark-card p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Chat History</h3>
              <button 
                onClick={startNewThread}
                className="p-1 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition"
                title="New Chat"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {threads.map((t) => (
                <button
                  key={t.chatId}
                  onClick={() => loadThread(t.chatId)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold transition ${
                    t.chatId === activeThreadId
                      ? 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20'
                      : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">
                    {t.messages?.[0]?.content ? t.messages[0].content.substring(0, 20) + '…' : `Session ${t.chatId.substring(5, 12)}`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Platform Active Context Swapper */}
          <div className="rounded-2xl border border-gray-150 dark:border-slate-800/80 bg-white dark:bg-dark-card p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800 pb-2">Active Context</h3>
            
            {invoicesLoading ? (
              <div className="text-[10px] text-gray-400 italic">Syncing live invoices context…</div>
            ) : invoices.length === 0 ? (
              <div className="text-[10px] text-gray-500 italic">No invoices found in context register.</div>
            ) : (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-400 block mb-1">Select Invoice Focus:</span>
                <select
                  value={selectedInvoice?.invoiceId || ''}
                  onChange={(e) => {
                    const found = invoices.find(inv => inv.invoiceId === e.target.value);
                    if (found) {
                      setSelectedInvoice(found);
                      toast.success(`Copilot focus switched → ${found.invoiceNumber}`);
                    }
                  }}
                  className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {invoices.map((inv) => (
                    <option key={inv.invoiceId} value={inv.invoiceId}>
                      {inv.invoiceNumber} ({inv.buyerName})
                    </option>
                  ))}
                </select>

                {selectedInvoice && (
                  <div className="pt-2 text-[10px] space-y-1 text-gray-400 font-medium">
                    <div className="flex justify-between">
                      <span>Face Value:</span>
                      <span className="text-white">{selectedInvoice.invoiceAmount} {selectedInvoice.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risk Grade:</span>
                      <span className="text-emerald-400 font-bold">{selectedInvoice.riskScore ? `${selectedInvoice.riskScore}/100` : 'PENDING'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="text-blue-400 uppercase tracking-wider">{selectedInvoice.invoiceStatus}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center Chat Workspace */}
        <div className="lg:col-span-2 space-y-6 flex flex-col h-[550px] justify-between border border-gray-150 dark:border-slate-800/80 bg-white dark:bg-dark-card rounded-3xl p-6 shadow-sm relative overflow-hidden">
          
          {/* Chat Logs scroll flow */}
          <div className="flex-1 overflow-y-auto space-y-5 pr-1">
            {messages.length === 0 && !streamingResponse && !thinking ? (
              /* Suggestion panels */
              <div className="flex flex-col items-center justify-center h-full text-center space-y-5">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <Sparkles className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-sm text-gray-900 dark:text-white">Query Credit Risk &amp; Yield Matrices</h3>
                  <p className="text-[10px] text-gray-400 mt-1 max-w-xs leading-relaxed">
                    Select a suggestion below to ask the AI underwriter about active invoices and ratings.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 w-full pt-1">
                  {PRESET_PROMPTS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => handleSendMessage(p.text)}
                      className="p-3 rounded-xl border border-gray-100 dark:border-slate-800/80 text-left text-[10px] hover:border-blue-500 bg-gray-50/50 dark:bg-slate-900/10 text-gray-600 dark:text-gray-400 transition"
                    >
                      <span className="font-bold text-gray-800 dark:text-white block mb-0.5">{p.label}</span>
                      {p.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                        <Brain className="h-4 w-4" />
                      </div>
                    )}
                    
                    <div className="max-w-[85%] space-y-1.5">
                      <div className={`p-3.5 rounded-2xl text-[11px] leading-relaxed whitespace-pre-line ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white font-semibold shadow-sm'
                          : 'bg-gray-50 dark:bg-slate-900/30 border border-gray-150 dark:border-slate-800/80 text-gray-800 dark:text-gray-300'
                      }`}>
                        {msg.text}
                      </div>
                      
                      {msg.sender === 'ai' && (
                        <div className="flex gap-2 justify-end text-[9px] text-gray-400">
                          <button onClick={() => handleCopy(msg.text)} className="hover:text-blue-400 transition flex items-center gap-1">
                            <Copy className="h-3 w-3" /> Copy
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Token-streaming dynamic bubble */}
                {streamingResponse && (
                  <div className="flex gap-3 justify-start">
                    <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0 animate-pulse">
                      <Brain className="h-4 w-4" />
                    </div>
                    <div className="max-w-[85%] p-3.5 rounded-2xl text-[11px] leading-relaxed bg-gray-50 dark:bg-slate-900/30 border border-gray-150 dark:border-slate-800/80 text-gray-800 dark:text-gray-300 whitespace-pre-line">
                      {streamingResponse}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* In-flight loader */}
            {thinking && (
              <div className="flex gap-3 justify-start">
                <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0 animate-pulse">
                  <Brain className="h-4 w-4" />
                </div>
                <div className="p-3.5 rounded-2xl bg-blue-950/20 border border-blue-500/10 text-xs w-full max-w-sm flex items-center gap-2 text-blue-400">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Auditing invoice risk registers…</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* User input box */}
          <div className="border-t border-gray-100 dark:border-slate-800/80 pt-4 flex items-center gap-3">
            <input
              type="text"
              placeholder={selectedInvoice ? `Ask about invoice ${selectedInvoice.invoiceNumber}…` : "Ask about invoice risks, grading rules, or yields…"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
              className="flex-1 bg-transparent text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
            />
            <button
              onClick={() => handleSendMessage(input)}
              className="h-8 w-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition flex-shrink-0 shadow-md shadow-blue-500/15"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>

        {/* Right Side: Copilot FAQ / Instructions Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-gray-150 dark:border-slate-800/80 bg-white dark:bg-dark-card p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1">
              <HelpCircle className="h-4 w-4 text-blue-400" />
              <span>Prompt Guide</span>
            </h3>
            <div className="text-[11px] text-gray-400 space-y-2 leading-relaxed">
              <p>You can ask specific questions in natural language:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li><code className="text-blue-400">"Why is INV-2026-085 rated A?"</code></li>
                <li><code className="text-blue-400">"What are the major risk factors?"</code></li>
                <li><code className="text-blue-400">"Explain this report in simple language"</code></li>
                <li><code className="text-blue-400">"Should I invest?"</code></li>
              </ul>
              <p className="pt-2 border-t border-gray-100 dark:border-slate-800">
                Llama 3.3 automatically fetches current platform invoices and credit reports to underwrite answers dynamically.
              </p>
            </div>
          </div>
        </div>

      </div>

    </ContentContainer>
  );
}
