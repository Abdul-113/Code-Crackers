/**
 * useEscrow.js
 * -----------
 * React hook for interacting with InvoiceEscrow smart contracts.
 * Uses Web3Auth provider (Google / Email login) when configured,
 * falls back to MetaMask (window.ethereum) transparently.
 *
 * Usage:
 *   const { fundInvoice, txStatus } = useEscrow();
 *   await fundInvoice(escrowAddress, amountInWei);
 *
 * txStatus transitions: idle → awaiting_wallet → pending → confirmed | failed
 */
import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3Auth } from '../contexts/Web3AuthContext';

// Minimal ABI — only what the Investor UI needs
const INVOICE_ESCROW_ABI = [
  {
    "inputs": [],
    "name": "fundInvoice",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "invoiceAmount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getState",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "investor",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "investor", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount",   "type": "uint256" }
    ],
    "name": "Funded",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "releasePayment",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "signAssignment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "buyerAssigned",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isAssigned",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "investorFund",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "buyerPay",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "buyer", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "AssignmentSigned",
    "type": "event"
  }
];

const INVOICE_REGISTRY_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "msme", "type": "address" }],
    "name": "getReputationScore",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

// Polygon Amoy testnet chain ID
const AMOY_CHAIN_ID = 80002;

export function useEscrow() {
  const { getProvider, login, isConnected } = useWeb3Auth();
  const [txStatus, setTxStatus] = useState('idle');       // idle | awaiting_wallet | pending | confirmed | failed
  const [txHash,   setTxHash]   = useState(null);
  const [txError,  setTxError]  = useState(null);

  // Internal helper — returns a signer, connecting via Web3Auth or MetaMask
  const getSigner = useCallback(async () => {
    setTxStatus('awaiting_wallet');

    // Connect if not already connected (opens Web3Auth modal or MetaMask popup)
    if (!isConnected) {
      await login();
    }

    const provider = await getProvider();
    const network = await provider.getNetwork();

    // Auto-switch to Amoy if needed (only works for MetaMask fallback)
    if (Number(network.chainId) !== AMOY_CHAIN_ID) {
      try {
        if (window.ethereum) {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${AMOY_CHAIN_ID.toString(16)}` }],
          });
        }
      } catch (switchErr) {
        if (switchErr.code === 4902 && window.ethereum) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${AMOY_CHAIN_ID.toString(16)}`,
              chainName: 'Polygon Amoy Testnet',
              nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
              rpcUrls: ['https://rpc-amoy.polygon.technology'],
              blockExplorerUrls: ['https://amoy.polygonscan.com'],
            }],
          });
        } else {
          throw switchErr;
        }
      }
      // Re-create provider after network switch
      const freshProvider = await getProvider();
      return await freshProvider.getSigner();
    }

    return await provider.getSigner();
  }, [getProvider, login, isConnected]);

  /**
   * Fund an InvoiceEscrow contract from the investor's wallet (Web3Auth or MetaMask).
   * @param {string} escrowAddress - The deployed InvoiceEscrow contract address
   * @param {string|bigint} amountWei - Amount in wei (must match invoiceAmount exactly)
   */
  const fundInvoice = useCallback(async (escrowAddress, amountWei) => {
    setTxStatus('idle');
    setTxHash(null);
    setTxError(null);

    try {
      const signer = await getSigner();
      const escrow = new ethers.Contract(escrowAddress, INVOICE_ESCROW_ABI, signer);
      const tx = await escrow.fundInvoice({ value: BigInt(amountWei) });

      setTxHash(tx.hash);
      setTxStatus('pending');

      const receipt = await tx.wait(1);
      setTxStatus('confirmed');
      return { txHash: tx.hash, receipt };

    } catch (err) {
      const message = err?.reason || err?.message || 'Transaction failed.';
      setTxError(message);
      setTxStatus('failed');
      throw err;
    }
  }, [getSigner]);

  /**
   * Buyer releases payment to the investor (Web3Auth or MetaMask).
   * @param {string} escrowAddress - The deployed InvoiceEscrow contract address
   * @param {string|bigint} amountWei - Amount in wei (must match invoiceAmount exactly)
   */
  const releasePayment = useCallback(async (escrowAddress, amountWei) => {
    setTxStatus('idle');
    setTxHash(null);
    setTxError(null);

    try {
      const signer = await getSigner();
      const escrow = new ethers.Contract(escrowAddress, INVOICE_ESCROW_ABI, signer);
      const tx = await escrow.releasePayment({ value: BigInt(amountWei) });

      setTxHash(tx.hash);
      setTxStatus('pending');

      const receipt = await tx.wait(1);
      setTxStatus('confirmed');
      return { txHash: tx.hash, receipt };

    } catch (err) {
      const message = err?.reason || err?.message || 'Transaction failed.';
      setTxError(message);
      setTxStatus('failed');
      throw err;
    }
  }, [getSigner]);

  /**
   * Buyer signs the Assignment of Receivable on-chain.
   * This is the legal consent step — buyer acknowledges paying the escrow contract.
   * @param {string} escrowAddress - The deployed InvoiceEscrow contract address
   */
  const signAssignment = useCallback(async (escrowAddress) => {
    setTxStatus('idle');
    setTxHash(null);
    setTxError(null);

    try {
      const signer = await getSigner();
      const escrow = new ethers.Contract(escrowAddress, INVOICE_ESCROW_ABI, signer);
      const tx = await escrow.signAssignment();

      setTxHash(tx.hash);
      setTxStatus('pending');

      const receipt = await tx.wait(1);
      setTxStatus('confirmed');
      return { txHash: tx.hash, receipt };

    } catch (err) {
      const message = err?.reason || err?.message || 'Transaction failed.';
      setTxError(message);
      setTxStatus('failed');
      throw err;
    }
  }, [getSigner]);

  /**
   * Read current escrow state from chain (no wallet needed).
   * Returns: 0=OPEN, 1=FUNDED, 2=REPAID, 3=DEFAULTED
   */
  const readEscrowState = useCallback(async (escrowAddress) => {
    if (!escrowAddress || !window.ethereum) return null;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const escrow = new ethers.Contract(escrowAddress, INVOICE_ESCROW_ABI, provider);
      return Number(await escrow.getState());
    } catch {
      return null;
    }
  }, []);

  /**
   * Read MSME reputation score from registry
   */
  const getReputationScore = useCallback(async (registryAddress, msmeAddress) => {
    if (!registryAddress || !msmeAddress || registryAddress === '0x...' || !window.ethereum) return null;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const registry = new ethers.Contract(registryAddress, INVOICE_REGISTRY_ABI, provider);
      return Number(await registry.getReputationScore(msmeAddress));
    } catch {
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setTxStatus('idle');
    setTxHash(null);
    setTxError(null);
  }, []);

  return { fundInvoice, releasePayment, signAssignment, readEscrowState, getReputationScore, txStatus, txHash, txError, reset };
}

