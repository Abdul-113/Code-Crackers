import { 
  Building2, UploadCloud, Brain, ShieldCheck, 
  Hexagon, Landmark, Key, Banknote, HelpCircle, 
  Cpu, Activity
} from 'lucide-react';

export const KPIS = [
  { label: 'Invoices Uploaded', value: 14, change: '+12%', icon: UploadCloud, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
  { label: 'Invoices Financed', value: 8, change: '+8%', icon: Banknote, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
  { label: 'Pending Approval', value: 4, change: '-2%', icon: ShieldCheck, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
  { label: 'Funds Received', value: '₹18,40,000', change: '+24%', icon: Landmark, color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/20' },
  { label: 'Investor Interest', value: '92%', change: '+5%', icon: Brain, color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/20' },
  { label: 'Avg Processing Time', value: '38h', change: '-4h', icon: Cpu, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/20' }
];

export const INVOICES = [
  { id: 'INV-2026-084', buyer: 'Tata Motors Group', amount: '₹12,40,000', status: 'Funded', risk: 'Low', progress: 100 },
  { id: 'INV-2026-085', buyer: 'Reliance Retail Ltd', amount: '₹8,50,000', status: 'Auction Live', risk: 'Low', progress: 75 },
  { id: 'INV-2026-086', buyer: 'Infosys Tech Corp', amount: '₹14,20,000', status: 'Verified', risk: 'Low', progress: 40 },
  { id: 'INV-2026-087', buyer: 'Wipro Enterprises', amount: '₹6,40,000', status: 'Pending', risk: 'Medium', progress: 10 },
  { id: 'INV-2026-088', buyer: 'V-Guard Industries', amount: '₹9,80,000', status: 'Rejected', risk: 'High', progress: 0 }
];

export const LIQUIDITY_FLOW = [
  { name: 'Jan', available: 1200000, financed: 800000 },
  { name: 'Feb', available: 1600000, financed: 1100000 },
  { name: 'Mar', available: 1500000, financed: 1400000 },
  { name: 'Apr', available: 2100000, financed: 1600000 },
  { name: 'May', available: 2480000, financed: 1840000 }
];

export const RISK_DISTRIBUTION = [
  { name: 'Low Risk', value: 75, color: '#10b981' },
  { name: 'Medium Risk', value: 20, color: '#f59e0b' },
  { name: 'High Risk', value: 5, color: '#ef4444' }
];

export const ACTIVITIES = [
  { id: 1, text: 'Invoice #INV-2026-085 verified & grade score A+ assigned.', time: '5m ago' },
  { id: 2, text: 'AltFin Capital placed a bid of ₹8,20,000 on Reliance invoice.', time: '20m ago' },
  { id: 3, text: 'Invoice Token #847 minted on Polygon network.', time: '1h ago' },
  { id: 4, text: 'Funds of ₹6,20,000 released for invoice #INV-2026-082.', time: '4h ago' }
];

export const UPCOMING_TASKS = [
  { id: 1, text: 'Approve GST data match for Wipro invoice.', action: 'Verify GST' },
  { id: 2, text: 'Review 3 investor bids on Tata Motors invoice.', action: 'Review Bids' },
  { id: 3, text: 'Submit pending purchase order for verification.', action: 'Upload PO' }
];

export const INSIGHTS = [
  { id: 1, text: 'Three of your uploaded invoices are eligible for instant financing at a low yield rate.' },
  { id: 2, text: 'Uploading matching purchase orders can improve Tata Motors invoice score to A+.' },
  { id: 3, text: 'Polygon network gas fees are currently low, making it optimal to tokenize outstanding bills now.' }
];
