import React from 'react';
import { Shield, Brain, Hexagon, CheckCircle2, FileCode, Lock } from 'lucide-react';

const INDICATORS = [
  { label: 'AES-256 Encryption', icon: Lock },
  { label: 'AI Risk Engine',     icon: Brain },
  { label: 'Polygon Blockchain', icon: Hexagon },
  { label: 'GST Verification',   icon: CheckCircle2 },
  { label: 'Smart Contracts',    icon: FileCode },
  { label: 'Firestore Security',  icon: Shield }
];

export default function TrustIndicators() {
  return (
    <div className="pt-6 mt-6 border-t border-gray-100 dark:border-slate-800/80">
      <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center mb-3.5">
        Platform Security &amp; Compliance
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        {INDICATORS.map((ind) => {
          const Icon = ind.icon;
          return (
            <div key={ind.label} className="flex items-center gap-2 text-[10px] font-semibold text-gray-500 dark:text-gray-400">
              <Icon className="h-3.5 w-3.5 text-primary-500 dark:text-primary-400 flex-shrink-0" />
              <span className="truncate">{ind.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
