import {
  Brain, Shield, Zap, Eye, Store, Users,
  Upload, CheckCircle, BarChart3, Hexagon, Landmark, Banknote,
  Clock, TrendingDown, AlertTriangle, Lock,
  ChevronDown,
} from 'lucide-react';

// ─── Navigation ───────────────────────────────────────────────────────────────
export const NAV_LINKS = [
  { label: 'Home',       href: '#hero' },
  { label: 'How It Works', href: '#solution' },
  { label: 'Features',  href: '#features' },
  { label: 'Technology', href: '#technology' },
  { label: 'FAQ',        href: '#faq' },
  { label: 'Contact',    href: '#footer' },
];

// ─── Statistics ───────────────────────────────────────────────────────────────
export const STATS = [
  { value: 100, suffix: 'Cr+', prefix: '₹', label: 'Potential Financing Volume' },
  { value: 90,  suffix: '%',   prefix: '',  label: 'Faster Liquidity'           },
  { value: 100, suffix: '%',   prefix: '',  label: 'Invoice Transparency'       },
  { value: 4,   suffix: '',    prefix: '',  label: 'Stakeholder Ecosystem'      },
];

// ─── Problems ─────────────────────────────────────────────────────────────────
export const PROBLEMS = [
  {
    icon:        Clock,
    title:       'Delayed Payments',
    description: 'Large enterprises delay invoice payments by 90–120 days, starving MSMEs of critical cash flow needed to operate.',
    color:       'text-red-500',
    bg:          'bg-red-50 dark:bg-red-950/20',
    border:      'border-red-100 dark:border-red-900/30',
  },
  {
    icon:        TrendingDown,
    title:       'Working Capital Crisis',
    description: 'Without timely payments, MSMEs struggle to pay salaries, buy inventory, and fund day-to-day operations.',
    color:       'text-orange-500',
    bg:          'bg-orange-50 dark:bg-orange-950/20',
    border:      'border-orange-100 dark:border-orange-900/30',
  },
  {
    icon:        AlertTriangle,
    title:       'Limited Financing Options',
    description: 'Traditional banks require collateral and lengthy approval processes that most MSMEs simply cannot meet.',
    color:       'text-amber-500',
    bg:          'bg-amber-50 dark:bg-amber-950/20',
    border:      'border-amber-100 dark:border-amber-900/30',
  },
  {
    icon:        Lock,
    title:       'Growth Constraints',
    description: 'Cash flow gaps prevent MSMEs from taking new orders, hiring talent, and scaling their business sustainably.',
    color:       'text-rose-500',
    bg:          'bg-rose-50 dark:bg-rose-950/20',
    border:      'border-rose-100 dark:border-rose-900/30',
  },
];

// ─── Solution Steps ───────────────────────────────────────────────────────────
export const SOLUTION_STEPS = [
  {
    number: '01',
    icon:   Upload,
    title:  'Upload Invoice',
    description: 'MSME uploads PDF or image invoices directly through the secure platform portal.',
    color:  'from-blue-500 to-blue-600',
    glow:   'shadow-glow-blue',
  },
  {
    number: '02',
    icon:   CheckCircle,
    title:  'Verify Invoice',
    description: 'GST verification and buyer confirmation validates invoice authenticity in real-time.',
    color:  'from-cyan-500 to-cyan-600',
    glow:   'shadow-glow-cyan',
  },
  {
    number: '03',
    icon:   Brain,
    title:  'AI Risk Analysis',
    description: 'Groq-powered LLM analyzes invoice data, detects duplicates, and assigns a credit risk grade.',
    color:  'from-violet-500 to-purple-600',
    glow:   'shadow-glow-purple',
  },
  {
    number: '04',
    icon:   Hexagon,
    title:  'NFT Tokenization',
    description: 'Verified invoices are minted as ERC-721 NFTs on Polygon, creating immutable on-chain records.',
    color:  'from-purple-500 to-secondary-700',
    glow:   'shadow-glow-purple',
  },
  {
    number: '05',
    icon:   Store,
    title:  'Investor Marketplace',
    description: 'Invoice NFTs are listed for investors to bid on, creating a transparent and competitive auction.',
    color:  'from-emerald-500 to-teal-600',
    glow:   '',
  },
  {
    number: '06',
    icon:   Banknote,
    title:  'Instant Liquidity',
    description: 'Smart contract escrow releases funds to the MSME instantly upon successful auction completion.',
    color:  'from-primary-500 to-primary-700',
    glow:   'shadow-glow-blue',
  },
];

// ─── Features ─────────────────────────────────────────────────────────────────
export const FEATURES = [
  {
    icon:        Brain,
    title:       'AI-Powered Invoice Intelligence',
    description: 'Groq LLM performs deep invoice analysis — extracting structured data, detecting duplicates, and generating credit risk grades in seconds.',
    gradient:    'from-blue-500 to-cyan-500',
    tag:         'AI',
  },
  {
    icon:        Shield,
    title:       'Blockchain Transparency',
    description: 'Every invoice is recorded on Polygon blockchain as an NFT, creating an immutable audit trail that all stakeholders can verify.',
    gradient:    'from-violet-500 to-purple-600',
    tag:         'Blockchain',
  },
  {
    icon:        Landmark,
    title:       'Smart Contract Escrow',
    description: 'Automated Solidity escrow contracts hold investor funds securely and release capital only when predefined conditions are verified.',
    gradient:    'from-emerald-500 to-teal-500',
    tag:         'DeFi',
  },
  {
    icon:        Eye,
    title:       'Fraud Prevention',
    description: 'Multi-layer fraud detection combines AI pattern recognition with on-chain duplicate hash validation to eliminate invoice fraud.',
    gradient:    'from-rose-500 to-pink-500',
    tag:         'Security',
  },
  {
    icon:        Store,
    title:       'Investor Marketplace',
    description: 'A curated DeFi marketplace where investors can discover, evaluate, and bid on tokenized invoices with AI-generated risk grades.',
    gradient:    'from-amber-500 to-orange-500',
    tag:         'Marketplace',
  },
  {
    icon:        Users,
    title:       'Role-Based Platform',
    description: 'Distinct secure portals for MSMEs, Investors, Buyers, and Administrators — each with purpose-built workflows and dashboards.',
    gradient:    'from-primary-500 to-secondary-600',
    tag:         'Platform',
  },
];

// ─── Technologies ─────────────────────────────────────────────────────────────
export const TECHNOLOGIES = [
  { name: 'React',         color: '#61DAFB', bg: '#0d1f2d', category: 'Frontend'    },
  { name: 'FastAPI',       color: '#009688', bg: '#0a1a18', category: 'Backend'     },
  { name: 'Firebase',      color: '#FFCA28', bg: '#1a1600', category: 'Database'    },
  { name: 'Groq AI',       color: '#F97316', bg: '#1a0d00', category: 'AI'          },
  { name: 'Polygon',       color: '#8247E5', bg: '#130c1e', category: 'Blockchain'  },
  { name: 'Solidity',      color: '#363636', bg: '#1a1a1a', category: 'Smart Contract' },
  { name: 'Firestore',     color: '#FFA000', bg: '#1a1100', category: 'Database'    },
  { name: 'Tailwind CSS',  color: '#06B6D4', bg: '#001a1e', category: 'Styling'     },
  { name: 'Framer Motion', color: '#BB5CF0', bg: '#15001f', category: 'Animation'   },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────
export const TESTIMONIALS = [
  {
    name:    'Priya Sharma',
    role:    'Founder, TextilePro India',
    quote:   'Invoice2Credit AI transformed our cash flow. We received working capital within 48 hours instead of waiting 3 months. It\'s a game-changer for small manufacturers like us.',
    initials:'PS',
    gradient:'from-blue-500 to-cyan-500',
    rating:  5,
  },
  {
    name:    'Arjun Mehta',
    role:    'CFO, Meridian Components',
    quote:   'The transparency is what sets this apart. Every transaction is on-chain, and the AI risk analysis gives investors genuine confidence. We\'ve never seen this level of institutional trust.',
    initials:'AM',
    gradient:'from-violet-500 to-purple-600',
    rating:  5,
  },
  {
    name:    'Sneha Reddy',
    role:    'Investment Director, AltFin Capital',
    quote:   'As an investor, the AI-graded invoice NFTs give me a clear risk profile before I commit capital. The smart contract escrow eliminates counterparty risk entirely. Exceptional product.',
    initials:'SR',
    gradient:'from-emerald-500 to-teal-500',
    rating:  5,
  },
];

// ─── FAQ ──────────────────────────────────────────────────────────────────────
export const FAQ_ITEMS = [
  {
    question: 'What types of invoices does Invoice2Credit AI support?',
    answer:   'Invoice2Credit AI supports GST-compliant invoices from verified MSMEs in B2B transactions with large enterprises. Invoices can be uploaded as PDF or image files and must contain standard invoice fields — vendor details, GST number, invoice amount, and payment terms.',
  },
  {
    question: 'How does the AI risk analysis work?',
    answer:   'Our Groq-powered LLM extracts structured data from uploaded invoices, cross-references it with GST database records, checks for duplicate submissions using blockchain hash verification, and generates a credit risk score from A+ to D based on buyer payment history, invoice amount, and business profile.',
  },
  {
    question: 'What is invoice tokenization and why does it matter?',
    answer:   'Invoice tokenization converts a verified invoice into an ERC-721 NFT on the Polygon blockchain. This creates an immutable, transparent, tradeable representation of the receivable. It prevents double-financing, enables fractionalization, and provides a permanent on-chain audit trail.',
  },
  {
    question: 'How quickly can MSMEs receive funds?',
    answer:   'Once an invoice is verified, AI-analyzed, and listed on the marketplace, MSMEs typically receive liquidity within 24–72 hours depending on investor activity. The smart contract escrow releases funds automatically upon auction completion, eliminating manual processing delays.',
  },
  {
    question: 'Is my financial data secure on this platform?',
    answer:   'Absolutely. Invoice data is stored in encrypted Firebase Firestore with role-based access controls. Sensitive financial data never touches the public blockchain — only cryptographic hashes are recorded on-chain. Firebase Authentication secures all user sessions.',
  },
  {
    question: 'What blockchain does Invoice2Credit AI use?',
    answer:   'Invoice2Credit AI operates on the Polygon Amoy testnet, chosen for its low transaction fees, fast finality, and Ethereum compatibility. Polygon\'s proof-of-stake consensus provides both environmental sustainability and enterprise-grade security.',
  },
];

// ─── Demo Workflow Steps ──────────────────────────────────────────────────────
export const DEMO_STEPS = [
  { id: 1, label: 'Upload',       description: 'MSME uploads invoice PDF',         icon: Upload,      color: 'bg-blue-500'   },
  { id: 2, label: 'Verify',       description: 'GST & buyer verification',          icon: CheckCircle, color: 'bg-cyan-500'   },
  { id: 3, label: 'AI Analysis',  description: 'Risk grade assigned by AI',         icon: Brain,       color: 'bg-violet-500' },
  { id: 4, label: 'Mint NFT',     description: 'Invoice tokenized on Polygon',      icon: Hexagon,     color: 'bg-purple-500' },
  { id: 5, label: 'Auction',      description: 'Investors bid on marketplace',      icon: BarChart3,   color: 'bg-emerald-500'},
  { id: 6, label: 'Cash Released',description: 'Funds released by smart contract', icon: Banknote,    color: 'bg-primary-500'},
];
