/**
 * Web3AuthContext.jsx
 * -------------------
 * Provides a global Web3Auth instance using the Modal SDK.
 * Users log in with Google / Email OTP — no MetaMask needed.
 * The context exposes:
 *   - login()        → opens Web3Auth modal
 *   - logout()       → disconnects wallet
 *   - getProvider()  → returns an ethers-compatible provider
 *   - walletAddress  → the user's auto-generated wallet address
 *   - isConnected    → boolean
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { BrowserProvider } from 'ethers';

// ─── Polygon Amoy Testnet config ──────────────────────────────────────────────
const AMOY_CHAIN_CONFIG = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: '0x13882',                                // 80002 in hex
  rpcTarget: 'https://polygon-amoy-bor-rpc.publicnode.com',
  displayName: 'Polygon Amoy Testnet',
  blockExplorerUrl: 'https://amoy.polygonscan.com',
  ticker: 'MATIC',
  tickerName: 'MATIC',
};

const CLIENT_ID = import.meta.env.VITE_WEB3AUTH_CLIENT_ID || '';

const Web3AuthContext = createContext(null);

export function Web3AuthProvider({ children }) {
  const [web3auth, setWeb3auth]       = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [initError, setInitError]     = useState(null);

  // ── Initialize Web3Auth on mount ──────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      // If no Client ID is configured, skip initialization silently.
      // The app will fall back to MetaMask (window.ethereum) in useEscrow.
      if (!CLIENT_ID) {
        console.info('[Web3Auth] No VITE_WEB3AUTH_CLIENT_ID found — running in MetaMask-only mode.');
        setIsInitialized(true);
        return;
      }

      try {
        const privateKeyProvider = new EthereumPrivateKeyProvider({
          config: { chainConfig: AMOY_CHAIN_CONFIG },
        });

        const instance = new Web3Auth({
          clientId: CLIENT_ID,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          privateKeyProvider,
        });

        await instance.initModal();
        setWeb3auth(instance);

        // Restore previous session if user was already logged in
        if (instance.connected) {
          const provider = new BrowserProvider(instance.provider);
          const signer = await provider.getSigner();
          const addr = await signer.getAddress();
          setWalletAddress(addr);
          setIsConnected(true);
        }
      } catch (err) {
        console.error('[Web3Auth] Initialization failed:', err);
        setInitError(err.message);
      } finally {
        setIsInitialized(true);
      }
    };

    init();
  }, []);

  // ── Login (opens the modal with Google / Email OTP) ───────────────────────
  const login = useCallback(async () => {
    if (!web3auth) {
      if (CLIENT_ID) {
        throw new Error(`Web3Auth failed to initialize. Error: ${initError || 'Unknown config error. Check console and whitelist.'}`);
      }
      
      // Fallback: use MetaMask directly ONLY if CLIENT_ID is not configured
      if (window.ethereum) {
        setIsLoading(true);
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts?.length) {
            setWalletAddress(accounts[0]);
            setIsConnected(true);
            return accounts[0];
          }
        } finally {
          setIsLoading(false);
        }
      }
      throw new Error('Neither Web3Auth nor MetaMask is available.');
    }

    setIsLoading(true);
    try {
      const web3authProvider = await web3auth.connect();
      const provider = new BrowserProvider(web3authProvider);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setWalletAddress(addr);
      setIsConnected(true);
      return addr;
    } finally {
      setIsLoading(false);
    }
  }, [web3auth]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    if (web3auth?.connected) {
      await web3auth.logout();
    }
    setIsConnected(false);
    setWalletAddress(null);
  }, [web3auth]);

  // ── Get ethers-compatible provider ───────────────────────────────────────
  const getProvider = useCallback(async () => {
    if (web3auth?.connected) {
      return new BrowserProvider(web3auth.provider);
    }
    // Fallback to MetaMask
    if (window.ethereum) {
      return new BrowserProvider(window.ethereum);
    }
    throw new Error('No Web3 provider available.');
  }, [web3auth]);

  const value = {
    isInitialized,
    isConnected,
    isLoading,
    walletAddress,
    initError,
    hasClientId: !!CLIENT_ID,
    login,
    logout,
    getProvider,
  };

  return (
    <Web3AuthContext.Provider value={value}>
      {children}
    </Web3AuthContext.Provider>
  );
}

export function useWeb3Auth() {
  const ctx = useContext(Web3AuthContext);
  if (!ctx) throw new Error('useWeb3Auth must be used within a Web3AuthProvider');
  return ctx;
}
