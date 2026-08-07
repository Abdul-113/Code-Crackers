import React, { useState } from 'react';
import { Wallet, ShieldCheck, ArrowRight, Loader2, CheckCircle2, Mail, Chrome, Sparkles, AlertCircle } from 'lucide-react';
import { useWeb3Auth } from '@/contexts/Web3AuthContext';
import { ethers } from 'ethers';

export default function WalletConnectStep({ onNext, profileData, setProfileData }) {
  const { login, isLoading, isConnected, walletAddress, hasClientId } = useWeb3Auth();
  const [errorMsg, setErrorMsg] = useState('');
  const [generatingDemo, setGeneratingDemo] = useState(false);

  const handleConnect = async () => {
    setErrorMsg('');
    try {
      const addr = await login();
      if (addr) {
        setProfileData({ ...profileData, walletAddress: addr });
      }
    } catch (err) {
      console.error('[WalletConnectStep] Login failed:', err);
      const isWhitelistError = err.message?.toLowerCase().includes('whitelist') || err.message?.toLowerCase().includes('redirect');
      if (isWhitelistError) {
        setErrorMsg('Domain whitelist pending in Web3Auth Dashboard. You can use the "Generate Instant Demo Wallet" option below to proceed immediately!');
      } else {
        setErrorMsg(err.message || 'Failed to connect wallet');
      }
    }
  };

  const handleGenerateInstantWallet = () => {
    setGeneratingDemo(true);
    try {
      // Generate a cryptographic EVM wallet on Polygon Amoy
      const randomWallet = ethers.Wallet.createRandom();
      const addr = randomWallet.address;
      localStorage.setItem('demo_wallet_address', addr);
      localStorage.setItem('demo_wallet_pk', randomWallet.privateKey);
      setProfileData({ ...profileData, walletAddress: addr });
      setErrorMsg('');
    } catch (err) {
      console.error('Failed to generate demo wallet:', err);
      setErrorMsg('Failed to generate test wallet.');
    } finally {
      setGeneratingDemo(false);
    }
  };

  // Sync walletAddress from context or profileData
  const displayAddress = profileData.walletAddress || walletAddress || localStorage.getItem('demo_wallet_address');
  const connected = isConnected || !!displayAddress;

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-violet-200 dark:border-violet-800">
          <Wallet className="h-8 w-8 text-violet-600 dark:text-violet-400" />
        </div>
        <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-3">
          Set Up Your Wallet
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
          Sign in with Google / Email or generate an instant Polygon testnet wallet to interact with smart contract escrows.
        </p>
      </div>

      <div className="space-y-4">
        {connected ? (
          /* ── Connected State ─────────────────────────────────────────── */
          <div className="p-6 rounded-2xl border border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 flex flex-col items-center text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-3" />
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Wallet Ready!</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Your Polygon Amoy address:</p>
            <p className="text-xs text-gray-700 dark:text-gray-300 font-mono bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg break-all">
              {displayAddress}
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('demo_wallet_address');
                setProfileData({ ...profileData, walletAddress: '' });
              }}
              className="mt-4 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 underline"
            >
              Disconnect / Switch Wallet
            </button>
          </div>
        ) : (
          /* ── Web3Auth & Alternative Options ─────────────────────────── */
          <div className="p-6 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-dark-card">
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mb-4 font-semibold uppercase tracking-wider">
              Choose your wallet option
            </p>
            
            <div className="space-y-3">
              {hasClientId && (
                <>
                  <button
                    onClick={handleConnect}
                    disabled={isLoading || generatingDemo}
                    className="w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white font-semibold text-sm flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Chrome className="h-5 w-5 text-blue-500" />
                    )}
                    Continue with Google (Web3Auth)
                  </button>

                  <button
                    onClick={handleConnect}
                    disabled={isLoading || generatingDemo}
                    className="w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white font-semibold text-sm flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition disabled:opacity-50"
                  >
                    <Mail className="h-5 w-5 text-violet-500" />
                    Continue with Email OTP
                  </button>
                </>
              )}

              {/* Instant Testnet Demo Wallet Generator */}
              <button
                onClick={handleGenerateInstantWallet}
                disabled={generatingDemo || isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2.5 hover:from-primary-700 hover:to-indigo-700 shadow-md shadow-primary-500/20 transition"
              >
                {generatingDemo ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 text-amber-300" />
                )}
                Generate Instant Polygon Demo Wallet
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-medium flex items-start gap-2 text-left">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 p-4 rounded-xl bg-violet-50/50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900/30 text-xs text-violet-800 dark:text-violet-300">
          <ShieldCheck className="h-6 w-6 flex-shrink-0 text-violet-600 dark:text-violet-400" />
          <p>Your wallet is used for transparent escrow and settlement on Polygon Amoy. No crypto expertise required.</p>
        </div>
      </div>

      <div className="mt-10 flex justify-between">
        <button
          onClick={onNext}
          className="text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm font-semibold transition px-4 py-2"
        >
          Skip for now
        </button>
        <button
          onClick={onNext}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition shadow-lg ${
            connected
              ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/20'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-slate-800 dark:text-gray-600'
          }`}
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
