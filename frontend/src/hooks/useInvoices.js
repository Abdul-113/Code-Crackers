import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

/**
 * Fetch all invoices, optionally filtered by user UID.
 */
export function useInvoices(createdBy = null) {
  return useQuery({
    queryKey: ['invoices', { createdBy }],
    queryFn: async () => {
      if (!navigator.onLine) throw new Error('You are offline. Please check your internet connection.');
      const params = {};
      if (createdBy) params.createdBy = createdBy;
      const response = await apiClient.get('/v1/invoices', { params });
      return response.data;
    },
    staleTime: 1000 * 15,
    retry: 2,
  });
}

/**
 * Fetch a single invoice by document ID.
 */
export function useInvoice(invoiceId) {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      if (!invoiceId) return null;
      if (!navigator.onLine) throw new Error('You are offline.');
      const response = await apiClient.get(`/v1/invoices/${invoiceId}`);
      return response.data;
    },
    enabled: !!invoiceId,
    retry: 1,
  });
}

/**
 * Stage-1: Extract invoice fields from a PDF (no DB write).
 * Returns ExtractionResult with per-field confidence scores.
 * Call this immediately on file selection; the full upload follows.
 *
 * OCR-ready: swap the backend extractor without changing this hook.
 */
export function useExtractInvoice() {
  return useMutation({
    mutationFn: async ({ file }) => {
      if (!navigator.onLine) throw new Error('You are offline.');
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post('/v1/invoices/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });
      return response.data;
    },
    onError: (err) => {
      const msg = err.response?.data?.detail || err.message || 'Extraction failed.';
      if (!msg.toLowerCase().includes('scanned')) {
        toast.error(`Extraction: ${msg}`);
      }
    },
  });
}

/**
 * Stage-2: Upload invoice PDF + confirmed metadata to the backend.
 * Shows real upload progress via onUploadProgress callback.
 */
export function useUploadInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, metadata, onProgress }) => {
      if (!navigator.onLine) throw new Error('You are offline.');
      const formData = new FormData();
      formData.append('file', file);
      Object.keys(metadata).forEach(k => formData.append(k, metadata[k]));

      const response = await apiClient.post('/v1/invoices/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (ev) => {
          if (ev.total && onProgress) {
            onProgress(Math.round((ev.loaded * 100) / ev.total));
          }
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Invoice uploaded and processed successfully!');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (err) => {
      let msg = 'Upload failed.';
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          msg = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          msg = err.response.data.detail.map(d => `${d.loc[d.loc.length - 1]}: ${d.msg}`).join(', ');
        } else {
          msg = JSON.stringify(err.response.data.detail);
        }
      } else {
        msg = err.message || msg;
      }
      toast.error(`Upload failed: ${msg}`);
    },
  });
}

/**
 * Fetch cached AI Credit Report for an invoice.
 * Returns 404/error state if not analyzed yet.
 */
export function useAIReport(invoiceId) {
  return useQuery({
    queryKey: ['aiReport', invoiceId],
    queryFn: async () => {
      if (!invoiceId) return null;
      if (!navigator.onLine) throw new Error('You are offline.');
      try {
        const response = await apiClient.get(`/v1/ai/report/${invoiceId}`);
        return response.data;
      } catch (err) {
        if (err.response?.status === 404) {
          return null; // Not analyzed yet
        }
        throw err;
      }
    },
    enabled: !!invoiceId,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

/**
 * Trigger AI Underwriting analysis (Stage-3).
 * Mutates and invalidates both 'invoice' and 'aiReport' query keys.
 */
export function useAnalyzeInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ invoiceId }) => {
      if (!invoiceId) throw new Error('Invoice ID is required.');
      if (!navigator.onLine) throw new Error('You are offline.');
      const response = await apiClient.post(`/v1/ai/analyze/${invoiceId}`);
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success('AI credit intelligence report generated!');
      queryClient.invalidateQueries({ queryKey: ['aiReport', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (err) => {
      const msg = err.response?.data?.detail || err.message || 'Analysis failed.';
      toast.error(`AI Analysis failed: ${msg}`);
    },
  });
}

/**
 * Fetch cached Verification Report for an invoice.
 * Returns null if not verified yet.
 */
export function useVerificationReport(invoiceId) {
  return useQuery({
    queryKey: ['verificationReport', invoiceId],
    queryFn: async () => {
      if (!invoiceId) return null;
      if (!navigator.onLine) throw new Error('You are offline.');
      try {
        const response = await apiClient.get(`/v1/verification/${invoiceId}`);
        return response.data;
      } catch (err) {
        if (err.response?.status === 404) {
          return null; // Not verified yet
        }
        throw err;
      }
    },
    enabled: !!invoiceId,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Trigger hybrid verification logic (Stage-4).
 * Enforces business rules and calculates marketplace readiness score.
 */
export function useVerifyInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ invoiceId }) => {
      if (!invoiceId) throw new Error('Invoice ID is required.');
      if (!navigator.onLine) throw new Error('You are offline.');
      const response = await apiClient.post(`/v1/verification/${invoiceId}`);
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success('Invoice verification pipeline completed!');
      queryClient.invalidateQueries({ queryKey: ['verificationReport', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (err) => {
      const msg = err.response?.data?.detail || err.message || 'Verification failed.';
      toast.error(`Verification failed: ${msg}`);
    },
  });
}

/**
 * Trigger Marketplace Listing (Stage-5).
 * Validates verification status and creates a listing entry.
 */
export function useListInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ invoiceId }) => {
      if (!invoiceId) throw new Error('Invoice ID is required.');
      if (!navigator.onLine) throw new Error('You are offline.');
      const response = await apiClient.post(`/v1/marketplace/list/${invoiceId}`);
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success('Invoice listed on the marketplace successfully!');
      queryClient.invalidateQueries({ queryKey: ['verificationReport', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (err) => {
      const msg = err.response?.data?.detail || err.message || 'Listing failed.';
      toast.error(`Listing failed: ${msg}`);
    },
  });
}

/**
 * Trigger NFT Minting on Polygon Amoy.
 * Signs transaction via backend and updates blockchainStatus.
 */
export function useMintNFT() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ invoiceId }) => {
      if (!invoiceId) throw new Error('Invoice ID is required.');
      if (!navigator.onLine) throw new Error('You are offline.');
      const response = await apiClient.post(`/v1/invoices/${invoiceId}/mint`);
      return response.data;
    },
    onSuccess: (data, variables) => {
      if (data.status === 'already_minted') {
        toast.success(`Invoice is already minted on blockchain.`);
      } else {
        toast.success('NFT successfully minted on Polygon Amoy!');
      }
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (err) => {
      const msg = err.response?.data?.detail || err.message || 'Minting failed.';
      toast.error(`Mint failed: ${msg}`);
    },
  });
}
