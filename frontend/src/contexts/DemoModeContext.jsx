import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const DemoModeContext = createContext(null);

export const useDemoMode = () => useContext(DemoModeContext);

export function DemoModeProvider({ children }) {

  const [demoMode, setDemoMode] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  
  // Custom mock notifications list
  const [notifications, setNotifications] = useState([
    { id: '1', category: 'marketplace', title: 'New Bid Placed', desc: 'Raymond Ltd invoice received a bid of ₹12,40,000.', time: '10m ago', read: false },
    { id: '2', category: 'blockchain', title: 'NFT Minted Successfully', desc: 'Invoice NFT minted on Polygon POS. Block: #41785700', time: '1h ago', read: false },
    { id: '3', category: 'ai', title: 'AI Underwriting Complete', desc: 'Groq AI analysis assigned an A+ Grade to Raymond Ltd.', time: '2h ago', read: true }
  ]);

  // Simulate mock live activities when Demo Mode is active
  useEffect(() => {
    if (!demoMode) return;

    const interval = setInterval(() => {
      const activities = [
        {
          title: 'Investor Bid Received',
          desc: 'Wipro Enterprises invoice received a live bid of ₹8,50,000.',
          category: 'marketplace',
          toastMsg: '⚡ Investor placed a live bid of ₹8,50,000 on Wipro Enterprises!'
        },
        {
          title: 'NFT Minted Successfully',
          desc: 'Raymond Ltd invoice successfully tokenized as ERC-721 on Polygon POS.',
          category: 'blockchain',
          toastMsg: '⛓️ Polygon Transaction Confirmed: NFT Minted successfully!'
        },
        {
          title: 'AI Audit Complete',
          desc: 'Raymond Ltd invoice verification score optimized: 98% confidence.',
          category: 'ai',
          toastMsg: '🤖 AI Copilot finished structured risk assessment check.'
        },
        {
          title: 'Repayment Settled',
          desc: 'Corporate Buyer released escrow funds to the liquidity pool.',
          category: 'funding',
          toastMsg: '💰 Escrow Repayment settled successfully!'
        }
      ];

      const item = activities[Math.floor(Math.random() * activities.length)];
      
      // Toast notification
      toast(item.toastMsg, {
        duration: 5000,
        style: {
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          color: '#1e293b',
          fontSize: '13px',
          fontWeight: 'bold',
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
        }
      });

      // Add to notifications queue
      setNotifications(prev => [
        {
          id: Date.now().toString(),
          category: item.category,
          title: item.title,
          desc: item.desc,
          time: 'Just now',
          read: false
        },
        ...prev
      ]);
    }, 15000); // Trigger every 15s

    return () => clearInterval(interval);
  }, [demoMode]);

  // Command + K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);



  return (
    <DemoModeContext.Provider value={{
      demoMode,
      setDemoMode,
      showCommandPalette,
      setShowCommandPalette,
      showNotificationDrawer,
      setShowNotificationDrawer,
      showSearchOverlay,
      setShowSearchOverlay,
      showHelpCenter,
      setShowHelpCenter,
      notifications,
      setNotifications
    }}>
      {children}
    </DemoModeContext.Provider>
  );
}
