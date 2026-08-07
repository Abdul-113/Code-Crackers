import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Shield, Wallet, Bell, Settings2, Activity,
  Download, Copy, ExternalLink, Lock, Smartphone,
  Monitor, Key, FileText, LogOut, Trash2, Sun, Moon,
  BadgeCheck, Building2, Landmark, CheckSquare, ShieldCheck,
  AlertTriangle, ChevronRight, Zap, Mail, Phone,
  Calendar, CreditCard, Globe, Check
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useInvoices } from '@/hooks/useInvoices';
import { useWeb3Auth } from '@/contexts/Web3AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import toast from 'react-hot-toast';

/* ─── ROLE CONFIG ─────────────────────────────────────────────────────────── */
const ROLE_META = {
  msme:     { label: 'MSME Owner',             icon: Building2,   from: '#3B82F6', to: '#6366F1' },
  investor: { label: 'Verified Investor',      icon: Landmark,    from: '#8B5CF6', to: '#A855F7' },
  buyer:    { label: 'Corporate Buyer',        icon: CheckSquare, from: '#10B981', to: '#0D9488' },
  admin:    { label: 'Platform Administrator', icon: ShieldCheck, from: '#F43F5E', to: '#EC4899' },
};
const ROLE_STATS = {
  msme:     [{ l: 'Health Score', v: '94/100' }, { l: 'Invoices Filed', v: '28' }, { l: 'Active Funding', v: '3' }, { l: 'AI Grade', v: 'A+' }],
  investor: [{ l: 'Portfolio Value', v: '₹48.5L' }, { l: 'Avg Yield', v: '8.65%' }, { l: 'Active Deals', v: '8' }, { l: 'Total ROI', v: '+12.4%' }],
  buyer:    [{ l: 'Credit Rating', v: 'AAA' }, { l: 'Pending', v: '2' }, { l: 'Monthly Paid', v: '₹18.4L' }, { l: 'Trust Score', v: '98%' }],
  admin:    [{ l: 'System Health', v: '99.9%' }, { l: 'Total Users', v: '184' }, { l: 'Fraud Flagged', v: '0' }, { l: 'AI Calls', v: '1,248' }],
};

/* ─── TABS ─────────────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'overview',      label: 'Overview',       icon: User          },
  { id: 'security',      label: 'Security',        icon: Shield        },
  { id: 'wallet',        label: 'Wallet',          icon: Wallet        },
  { id: 'notifications', label: 'Notifications',   icon: Bell          },
  { id: 'preferences',   label: 'Preferences',     icon: Settings2     },
  { id: 'activity',      label: 'Activity',        icon: Activity      },
  { id: 'danger',        label: 'Danger Zone',     icon: AlertTriangle },
];

/* ─── ATOMS ────────────────────────────────────────────────────────────────── */
function SettingRow({ icon: Icon, title, description, action, onAction, danger = false, children }) {
  return (
    <div className="flex items-center gap-4 py-5 border-b border-gray-100 dark:border-white/5 last:border-0">
      {Icon && (
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${danger ? 'bg-red-50 dark:bg-red-950/40' : 'bg-gray-50 dark:bg-white/5'}`}>
          <Icon className={`w-5 h-5 ${danger ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-[15px] font-semibold ${danger ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>{title}</p>
        {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{description}</p>}
      </div>
      {children}
      {action && (
        <button
          onClick={onAction}
          className={`flex-shrink-0 text-sm font-bold px-4 py-2 rounded-xl transition ${
            danger
              ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/60'
              : 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/30 hover:bg-primary-100 dark:hover:bg-primary-950/50'
          }`}
        >
          {action}
        </button>
      )}
    </div>
  );
}

function SwitchToggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-primary-600' : 'bg-gray-200 dark:bg-white/10'}`}
    >
      <span className={`absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-gray-100 dark:border-white/8 shadow-sm overflow-hidden">
      {title && (
        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/8">
          <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
      )}
      <div className="px-6">{children}</div>
    </div>
  );
}

/* ─── OVERVIEW ─────────────────────────────────────────────────────────────── */
function OverviewPanel({ role, name, email, memberSince, currentUser }) {
  const { data: dbInvoices } = useInvoices();
  
  let dynamicStats = ROLE_STATS[role] ?? ROLE_STATS.msme;
  
  if (dbInvoices) {
    if (role === 'msme') {
      const msmeInvoices = dbInvoices.filter(i => i.sellerId === currentUser?.uid || i.sellerName === name);
      const active = msmeInvoices.filter(i => ['FUNDED','ESCROWED','Funded'].includes(i.blockchainStatus || i.invoiceStatus));
      dynamicStats = [
        { l: 'Health Score', v: '94/100' }, 
        { l: 'Invoices Filed', v: msmeInvoices.length.toString() }, 
        { l: 'Active Funding', v: active.length.toString() }, 
        { l: 'AI Grade', v: 'A+' }
      ];
    } else if (role === 'buyer') {
      const buyerInvoices = dbInvoices.filter(i => i.buyerId === currentUser?.uid || (i.buyerCompany||'').includes(name) || (i.buyerName||'').includes(name));
      const pending = buyerInvoices.filter(i => !i.buyerApproved);
      const paid = buyerInvoices.filter(i => ['REPAID','Settled'].includes(i.blockchainStatus || i.invoiceStatus));
      const totalPaid = paid.reduce((acc, i) => acc + Number(i.invoiceAmount || i.amount || 0), 0);
      const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
      dynamicStats = [
        { l: 'Credit Rating', v: 'AAA' }, 
        { l: 'Pending Approval', v: pending.length.toString() }, 
        { l: 'Total Settled', v: fmt(totalPaid) }, 
        { l: 'Trust Score', v: '98%' }
      ];
    } else if (role === 'investor') {
      const investorInvoices = dbInvoices.filter(i => (i.investorAddress && currentUser?.walletAddress && i.investorAddress.toLowerCase() === currentUser.walletAddress.toLowerCase()));
      const activeDeals = investorInvoices.length;
      const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
      const totalVal = investorInvoices.reduce((acc, i) => acc + Number(i.invoiceAmount || i.amount || 0), 0);
      dynamicStats = [
        { l: 'Portfolio Value', v: fmt(totalVal) }, 
        { l: 'Avg Yield', v: '8.65%' }, 
        { l: 'Active Deals', v: activeDeals.toString() }, 
        { l: 'Total ROI', v: '+12.4%' }
      ];
    }
  }

  // Personal Info Dynamic
  const phone = currentUser?.profile?.phone || currentUser?.phoneNumber || '+91 98765 43210';
  const gst = currentUser?.profile?.gst || currentUser?.gst || '29ABCDE1234F1Z5';
  const pan = currentUser?.profile?.pan || currentUser?.pan || 'ABCDE1234F';

  // Profile completion calc
  const isWalletConnected = !!currentUser?.walletAddress;
  const isKycComplete = !!currentUser?.profile?.gst;
  const completionScore = 60 + (isWalletConnected ? 20 : 0) + (isKycComplete ? 20 : 0);
  const completionColor = completionScore >= 100 ? 'from-emerald-500 to-teal-500' : 'from-primary-500 to-indigo-500';

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {dynamicStats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-gray-100 dark:border-white/8 p-5 shadow-sm text-center">
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{s.v}</p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Identity */}
      <Section title="Personal Information">
        <SettingRow icon={User}       title="Full Name"    description={name} />
        <SettingRow icon={Mail}       title="Email"        description={email} />
        <SettingRow icon={Phone}      title="Phone"        description={phone}   action="Update" onAction={() => toast.success('Phone update')} />
        <SettingRow icon={CreditCard} title="GST Number"   description={gst} />
        <SettingRow icon={Shield}     title="PAN"          description={pan} />
        <SettingRow icon={Calendar}   title="Member Since" description={memberSince} />
      </Section>

      {/* Profile completion */}
      <Section>
        <div className="py-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[15px] font-bold text-gray-900 dark:text-white">Profile Completion</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {completionScore === 100 ? 'Your profile is 100% complete!' : 'Add missing details to reach 100%'}
              </p>
            </div>
            <span className={`text-2xl font-extrabold ${completionScore === 100 ? 'text-emerald-500' : 'text-primary-600 dark:text-primary-400'}`}>
              {completionScore}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 dark:bg-white/8 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionScore}%` }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              className={`h-full rounded-full bg-gradient-to-r ${completionColor}`}
            />
          </div>
        </div>
      </Section>
    </div>
  );
}

/* ─── SECURITY ─────────────────────────────────────────────────────────────── */
function SecurityPanel({ currentUser }) {
  const lastSignIn = currentUser?.metadata?.lastSignInTime 
    ? new Date(currentUser.metadata.lastSignInTime).toLocaleString() 
    : 'Active Now';

  return (
    <div className="space-y-4">
      {/* Score card */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-black">A+</span>
          </div>
          <div>
            <p className="text-xl font-extrabold">Security Score: 94 / 100</p>
            <p className="text-emerald-100 text-sm mt-1">2FA active · Strong password · 2 trusted devices</p>
          </div>
        </div>
      </div>

      <Section title="Authentication">
        <SettingRow icon={Lock}       title="Password"             description="Protected by Firebase Auth"       action="Change" onAction={() => toast.success('Check email to reset password')} />
        <SettingRow icon={Smartphone} title="Two-Factor Auth"     description="Available via Identity Provider"  action="Manage" onAction={() => toast.success('Manage 2FA')} />
        <SettingRow icon={Monitor}    title="Active Sessions"     description="Currently logged in on this browser" action="Review" onAction={() => toast.success('Review sessions')} />
      </Section>

      <Section title="Login History">
        {[
          { device: 'Current Browser Session', location: 'Local Network', time: lastSignIn },
          { device: 'Previous Session',        location: 'Unknown',       time: 'Recently' },
        ].map((d, i) => (
          <div key={i} className="flex items-center gap-4 py-4 border-b border-gray-100 dark:border-white/5 last:border-0">
            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center">
              <Monitor className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-gray-900 dark:text-white">{d.device}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{d.location} · {d.time}</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full">Trusted</span>
          </div>
        ))}
      </Section>
    </div>
  );
}

/* ─── WALLET ───────────────────────────────────────────────────────────────── */
function WalletPanel() {
  const { walletAddress, isConnected, login, logout, isLoading, getProvider } = useWeb3Auth();
  const [balance, setBalance] = useState('0.0000');

  React.useEffect(() => {
    const fetchBalance = async () => {
      if (isConnected && walletAddress) {
        try {
          const provider = await getProvider();
          const bal = await provider.getBalance(walletAddress);
          // format balance (wei to ETH/MATIC)
          const matic = Number(bal) / 1e18;
          setBalance(matic.toFixed(4));
        } catch (e) {
          console.error("Failed to fetch balance", e);
        }
      } else {
        setBalance('0.0000');
      }
    };
    fetchBalance();
  }, [isConnected, walletAddress, getProvider]);

  const copy = (v) => { navigator.clipboard.writeText(v); toast.success('Copied!'); };
  
  const fmtAddr = walletAddress ? `${walletAddress.substring(0, 6)}…${walletAddress.substring(38)}` : '0x000...000';
  
  return (
    <div className="space-y-4">
      <Section>
        <div className="py-5">
          {/* Wallet header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-md">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-gray-900 dark:text-white">MetaMask</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Polygon Amoy Testnet</p>
              </div>
            </div>
            {isConnected ? (
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">● Connected</span>
            ) : (
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800">Disconnected</span>
            )}
          </div>

          {/* Balance info */}
          <div className="rounded-xl bg-gray-50 dark:bg-white/5 p-4 space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Wallet Address</span>
              <button disabled={!isConnected} onClick={() => copy(walletAddress)} className="flex items-center gap-1.5 text-sm font-mono font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition disabled:opacity-50">
                {isConnected ? fmtAddr : 'Not Connected'} {isConnected && <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="h-px bg-gray-200 dark:bg-white/8" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">MATIC Balance</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{isConnected ? `${balance} MATIC` : '-'}</span>
            </div>
            <div className="h-px bg-gray-200 dark:bg-white/8" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Invoice NFTs</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{isConnected ? '0 NFTs minted' : '-'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {isConnected ? (
              <>
                <button onClick={() => window.open(`https://amoy.polygonscan.com/address/${walletAddress}`, '_blank')} className="py-3 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center justify-center gap-2 transition">
                  <ExternalLink className="w-4 h-4" /> Explorer
                </button>
                <button onClick={logout} className="py-3 rounded-xl border border-red-200 dark:border-red-800 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition">
                  Disconnect
                </button>
              </>
            ) : (
              <button onClick={login} disabled={isLoading} className="col-span-2 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition disabled:opacity-50">
                {isLoading ? 'Connecting...' : 'Connect MetaMask'}
              </button>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}

/* ─── NOTIFICATIONS ────────────────────────────────────────────────────────── */
function NotificationsPanel() {
  const ITEMS = [
    { key: 'email',     label: 'Email Notifications',  desc: 'Receive invoice and account updates via email',        on: true  },
    { key: 'push',      label: 'Push Notifications',   desc: 'Browser and mobile push alerts',                       on: true  },
    { key: 'market',    label: 'Marketplace Updates',  desc: 'New invoices and funding opportunities',               on: true  },
    { key: 'funding',   label: 'Funding Alerts',       desc: 'When your invoice gets funded by an investor',         on: true  },
    { key: 'security',  label: 'Security Alerts',      desc: 'Login attempts and account security events',           on: true  },
    { key: 'blockchain',label: 'Blockchain Events',    desc: 'Smart contract and escrow transaction updates',        on: false },
    { key: 'ai',        label: 'AI Insights',          desc: 'Weekly AI-generated financial health reports',         on: false },
    { key: 'sms',       label: 'SMS Alerts',           desc: 'Critical and time-sensitive alerts via SMS',           on: false },
  ];
  const [notifs, setNotifs] = useState(() => {
    const saved = localStorage.getItem('notification_prefs');
    return saved ? JSON.parse(saved) : Object.fromEntries(ITEMS.map(i => [i.key, i.on]));
  });

  React.useEffect(() => {
    localStorage.setItem('notification_prefs', JSON.stringify(notifs));
  }, [notifs]);
  return (
    <Section title="Notification Preferences">
      {ITEMS.map(item => (
        <SettingRow key={item.key} title={item.label} description={item.desc}>
          <SwitchToggle checked={notifs[item.key]} onChange={(v) => setNotifs(p => ({ ...p, [item.key]: v }))} />
        </SettingRow>
      ))}
    </Section>
  );
}

/* ─── PREFERENCES ──────────────────────────────────────────────────────────── */
function PreferencesPanel() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');
  const [animations, setAnimations] = useState(() => localStorage.getItem('animations') !== 'false');
  const [compact, setCompact] = useState(() => localStorage.getItem('compact') === 'true');

  React.useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  React.useEffect(() => { localStorage.setItem('animations', animations); }, [animations]);
  React.useEffect(() => { localStorage.setItem('compact', compact); }, [compact]);

  return (
    <div className="space-y-4">
      <Section title="Appearance">
        <div className="py-4 grid grid-cols-3 gap-3">
          {[{ k: 'light', icon: Sun, l: 'Light' }, { k: 'dark', icon: Moon, l: 'Dark' }, { k: 'system', icon: Monitor, l: 'System' }].map(({ k, icon: Icon, l }) => (
            <button key={k} onClick={() => setTheme(k)} className={`py-5 rounded-xl text-sm font-bold flex flex-col items-center gap-2.5 border-2 transition ${theme === k ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/25 text-primary-600 dark:text-primary-400' : 'border-gray-100 dark:border-white/8 text-gray-400 hover:border-gray-200'}`}>
              <Icon className="w-6 h-6" />{l}
            </button>
          ))}
        </div>
      </Section>
      <Section title="Interface">
        <SettingRow title="Motion & Animations" description="Smooth transitions and micro-interactions throughout the UI">
          <SwitchToggle checked={animations} onChange={setAnimations} />
        </SettingRow>
        <SettingRow title="Compact Mode" description="Reduce spacing for a denser information layout">
          <SwitchToggle checked={compact} onChange={setCompact} />
        </SettingRow>
      </Section>
      <Section title="Locale & Region">
        <SettingRow icon={Globe}      title="Language" description="English (India)" />
        <SettingRow icon={CreditCard} title="Currency" description="Indian Rupee — INR (₹)" />
        <SettingRow icon={Calendar}   title="Timezone" description="IST (UTC +5:30)" />
      </Section>
    </div>
  );
}

/* ─── ACTIVITY ─────────────────────────────────────────────────────────────── */
function ActivityPanel() {
  const { notifications } = useNotifications();
  const events = (notifications || []).slice(0, 10).map(n => ({
    icon: n.title.includes('Invoice') ? FileText : n.title.includes('Wallet') ? Wallet : Bell,
    label: n.title,
    sub: n.message,
    time: n.time || 'Recent',
    color: 'bg-primary-50 dark:bg-primary-950/40 text-primary-500'
  }));

  if (events.length === 0) {
    events.push({ icon: ShieldCheck, label: 'Account Secured', sub: 'No recent alerts', time: 'Now', color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500' });
  }

  return (
    <Section title="Recent Activity">
      <div className="relative">
        <div className="absolute left-5 top-6 bottom-6 w-px bg-gray-100 dark:bg-white/8" />
        {events.map((e, i) => (
          <div key={i} className="flex items-start gap-4 py-4 border-b border-gray-100 dark:border-white/5 last:border-0">
            <div className={`relative z-10 w-10 h-10 rounded-xl ${e.color} flex items-center justify-center flex-shrink-0`}>
              <e.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 pt-1.5">
              <p className="text-[15px] font-semibold text-gray-900 dark:text-white">{e.label}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{e.sub}</p>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500 pt-2 flex-shrink-0">{e.time}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─── DANGER ───────────────────────────────────────────────────────────────── */
function DangerPanel() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-950/25 border border-red-100 dark:border-red-900/50">
        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
          <strong>These actions are permanent.</strong> Once completed, they cannot be undone. Proceed only if you are absolutely certain.
        </p>
      </div>
      <Section>
        <SettingRow icon={LogOut}   title="Log Out Everywhere"  description="Immediately signs you out of all active devices and sessions."  action="Log Out"    onAction={() => toast.success('Logged out everywhere')}       />
        <SettingRow icon={Download} title="Export My Data"      description="Download a complete ZIP archive of your account data."          action="Export"     onAction={() => toast.success('Export initiated')}            />
        <SettingRow icon={Monitor}  title="Deactivate Account"  description="Temporarily suspend your access. Can be reactivated anytime."   action="Deactivate" onAction={() => toast.error('Email verification required')} danger />
        <SettingRow icon={Trash2}   title="Delete Account"      description="Permanently delete your account and all associated data."       action="Delete"     onAction={() => toast.error('Email verification required')} danger />
      </Section>
    </div>
  );
}

/* ─── MAIN ─────────────────────────────────────────────────────────────────── */
export default function Profile() {
  const { currentUser } = useAuth();
  const role     = currentUser?.role ?? 'msme';
  const meta     = ROLE_META[role] ?? ROLE_META.msme;
  const RoleIcon = meta.icon;
  const stats    = ROLE_STATS[role] ?? ROLE_STATS.msme;

  const name        = currentUser?.displayName || currentUser?.profile?.companyName || 'User';
  const email       = currentUser?.email || 'user@invoice2credit.ai';
  const initials    = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const memberSince = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'July 2026';

  const [activeTab, setActiveTab] = useState('overview');

  const panels = {
    overview:      <OverviewPanel role={role} name={name} email={email} memberSince={memberSince} currentUser={currentUser} />,
    security:      <SecurityPanel currentUser={currentUser} />,
    wallet:        <WalletPanel />,
    notifications: <NotificationsPanel />,
    preferences:   <PreferencesPanel />,
    activity:      <ActivityPanel />,
    danger:        <DangerPanel />,
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-5">

      {/* ── PROFILE HERO ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl"
        style={{ background: `linear-gradient(135deg, ${meta.from}, ${meta.to})` }}
      >
        {/* Background texture */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[size:24px_24px]" />
        <div className="absolute right-0 top-0 w-72 h-72 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4" />

        <div className="relative z-10 p-7 flex flex-col sm:flex-row items-start sm:items-center gap-6">

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/15 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-xl">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tighter">{initials}</span>
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-lg">
              <BadgeCheck className="w-4 h-4 text-emerald-500" />
            </div>
          </div>

          {/* Name + role */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">{name}</h1>
            <p className="text-white/65 text-sm mt-1 mb-3">{email}</p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-white border border-white/20">
                <RoleIcon className="w-3.5 h-3.5" /> {meta.label}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500/30 text-white border border-white/20">
                <BadgeCheck className="w-3.5 h-3.5" /> KYC Verified
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── TAB BAR ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-white dark:bg-[#1a1d27] rounded-2xl border border-gray-100 dark:border-white/8 p-1.5 shadow-sm overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
              activeTab === id
                ? 'bg-primary-600 text-white shadow-md'
                : id === 'danger'
                  ? 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {/* ── PANEL ──────────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {panels[activeTab]}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
