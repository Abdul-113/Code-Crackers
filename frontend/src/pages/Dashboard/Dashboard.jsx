import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, UploadCloud, Brain, ShieldCheck, 
  Hexagon, Landmark, Key, Banknote, HelpCircle, 
  Cpu, Activity, ArrowRight, ArrowUpRight, 
  FileUp, Sparkles, MessageSquare, Plus, ChevronRight, CheckCircle2,
  TrendingUp, BarChart4
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ContentContainer from '@/components/layout/ContentContainer';
import toast from 'react-hot-toast';

import { invoiceService } from '@/services/invoiceService';

import { 
  KPIS, LIQUIDITY_FLOW, 
  RISK_DISTRIBUTION, ACTIVITIES, UPCOMING_TASKS, INSIGHTS 
} from './dashboardData';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [invoicesList, setInvoicesList] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    // Firestore stores invoices with `createdBy` = user UID
    const unsub = invoiceService.subscribeInvoices(currentUser.uid, (data) => {
      setInvoicesList(data);
    });
    return () => unsub();
  }, [currentUser]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };
  const handleUploadClick = () => {
    navigate('/app/msme?action=upload');
  };

  // Firestore invoices use `invoiceStatus` and `invoiceAmount` fields
  const getStatus = (inv) => inv.invoiceStatus || inv.status || '';
  const getAmount = (inv) => Number(inv.invoiceAmount) || Number(inv.amount) || 0;

  const availableCapital = invoicesList
    .filter(i => getStatus(i) === 'Funded')
    .reduce((sum, inv) => sum + getAmount(inv), 0);
  const pendingCapital = invoicesList
    .filter(i => getStatus(i) !== 'Funded')
    .reduce((sum, inv) => sum + getAmount(inv), 0);

  return (
    <ContentContainer>
      
      {/* Premium Dashboard Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Main Content (Left) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. Glassmorphic Hero Liquidity Card */}
          <div className="relative overflow-hidden rounded-3xl border border-white/20 dark:border-white/10 bg-gradient-to-br from-indigo-900 via-primary-800 to-indigo-950 p-8 text-white shadow-2xl backdrop-blur-xl">
            <div className="absolute top-0 right-0 p-32 bg-primary-500/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 p-32 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:justify-between gap-8">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-primary-200">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Available Working Capital</span>
                  </div>
                  <div className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight drop-shadow-sm">
                    {formatCurrency(availableCapital)}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-x-8 gap-y-4 pt-4 border-t border-white/10">
                  <div>
                    <div className="text-[10px] text-primary-200 font-semibold uppercase tracking-wider mb-1">Potential Financing</div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      {formatCurrency(pendingCapital)}
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-primary-200 font-semibold uppercase tracking-wider mb-1">Total Invoices</div>
                    <div className="text-sm font-bold text-emerald-300">{invoicesList.length} Uploaded</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 self-start md:self-center w-full md:w-auto">
                <motion.button
                  onClick={handleUploadClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white text-primary-900 font-bold text-sm shadow-xl hover:shadow-primary-500/20 transition-all"
                >
                  <Plus className="h-5 w-5" />
                  <span>Upload New Invoice</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* 2. Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { title: 'Upload Invoice', desc: 'Secure tokenization', icon: FileUp, action: handleUploadClick, bg: 'bg-primary-50 dark:bg-primary-950/30', color: 'text-primary-600 dark:text-primary-400' },
              { title: 'Verify GST', desc: 'Govt match portal', icon: ShieldCheck, action: () => toast.success('GST sync active'), bg: 'bg-emerald-50 dark:bg-emerald-950/30', color: 'text-emerald-600 dark:text-emerald-400' },
              { title: 'Marketplace', desc: 'Live auction bids', icon: Landmark, action: () => toast('Opening bids portal...'), bg: 'bg-indigo-50 dark:bg-indigo-950/30', color: 'text-indigo-600 dark:text-indigo-400' }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.title}
                  onClick={item.action}
                  whileHover={{ y: -2 }}
                  className="group rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-5 text-left shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className={`h-10 w-10 rounded-xl ${item.bg} flex items-center justify-center ${item.color} mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{item.title}</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">{item.desc}</p>
                </motion.button>
              );
            })}
          </div>

          {/* 3. Monthly Liquidity Area Chart */}
          <div className="rounded-3xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart4 className="h-4 w-4 text-gray-400" />
                Liquidity Flow
              </h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={LIQUIDITY_FLOW}>
                  <defs>
                    <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 100000}L`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="available" stroke="#4f46e5" fillOpacity={1} fill="url(#colorFlow)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. Recent Invoices List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recent Uploads</h3>
              <button className="text-xs font-bold text-primary-600 hover:text-primary-700 transition">View All</button>
            </div>
            
            <div className="space-y-3">
              {invoicesList.map((inv) => (
                <div 
                  key={inv.id}
                  className="rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-dark-bg flex items-center justify-center border border-gray-100 dark:border-dark-border">
                      <FileUp className="h-4 w-4 text-gray-400" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{inv.buyerName || inv.buyer}</div>
                      <div className="text-[11px] font-medium text-gray-400">{inv.invoiceNumber || inv.id}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8">
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {typeof inv.invoiceAmount === 'number' ? formatCurrency(inv.invoiceAmount) : inv.amount}
                      </div>
                      <div className="mt-1">
                        {(getStatus(inv) === 'Funded' || getStatus(inv) === 'Listed') && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success-600 bg-success-50 dark:bg-success-900/20 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3" /> {getStatus(inv) === 'Listed' ? 'Listed in Marketplace' : 'Payout Released'}
                          </span>
                        )}
                        {getStatus(inv) === 'Auction Live' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-full">
                            <Activity className="h-3 w-3 animate-pulse" /> Bidding Live
                          </span>
                        )}
                        {(getStatus(inv) === 'Pending' || getStatus(inv) === 'PENDING') && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                            <ShieldCheck className="h-3 w-3" /> Verification Pending
                          </span>
                        )}
                        {(getStatus(inv) === 'Verified' || getStatus(inv) === 'VERIFIED' || getStatus(inv) === 'BUYER_APPROVED') && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full">
                            <ShieldCheck className="h-3 w-3" /> Verified
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-50 dark:hover:bg-dark-bg text-gray-400 transition">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar (Right) */}
        <div className="space-y-6">
          
          {/* 5. Business Insights (Cleaned Up) */}
          <div className="rounded-3xl border border-primary-100 dark:border-primary-950 bg-gradient-to-b from-primary-50/30 to-white dark:from-primary-950/10 dark:to-dark-card p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 bg-primary-500/10 rounded-full blur-xl pointer-events-none -mr-4 -mt-4" />
            
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-primary-500" />
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Business Insights</h3>
            </div>
            
            <div className="space-y-3">
              {INSIGHTS.map((insight) => (
                <div key={insight.id} className="p-3.5 rounded-2xl border border-gray-100/80 dark:border-white/5 bg-white/80 dark:bg-white/5 text-[11px] font-medium leading-relaxed text-gray-600 dark:text-gray-300 backdrop-blur-sm shadow-sm">
                  {insight.text}
                </div>
              ))}
            </div>
          </div>

          {/* 6. Risk Profile Pie Chart */}
          <div className="rounded-3xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm">
            <h3 className="text-sm font-bold mb-4 text-gray-900 dark:text-white">Risk Profile Distribution</h3>
            <div className="h-40 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={RISK_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {RISK_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }}
                    itemStyle={{ color: '#1f2937' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest pt-2">
              {RISK_DISTRIBUTION.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </ContentContainer>
  );
}
