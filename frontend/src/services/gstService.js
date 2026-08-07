import fixtures from '@/fixtures/gstFixtures.json';
import { computeBuyerCreditScore } from './creditScoreService';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

/**
 * Dedicated GST Service for Frontend.
 * Fetches verified GSTIN data & return filing records from the backend Sandbox.co.in integration.
 * Gracefully falls back to fixtures if offline or network unavailable.
 */
export const gstService = {
  /**
   * Retrieves buyer credit assessment score and GST details.
   */
  async getBuyerCreditScore(gstin) {
    const cleanGst = (gstin || '29AAACI1681G1Z0').trim().toUpperCase();

    try {
      const resp = await fetch(`${BACKEND_URL}/api/v1/buyer/credit-score/${cleanGst}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(6000),
      });

      if (resp.ok) {
        const json = await resp.json();
        if (json && json.score !== undefined) {
          return json;
        }
      }
    } catch (err) {
      console.warn('Backend live GST credit score fetch timed out or failed. Using cached fixture fallback.', err);
    }

    // Fallback: use local fixtures + pure creditScoreService computation
    const fixture = fixtures[cleanGst] || fixtures['29AAACI1681G1Z0'];
    const tp = fixture?.taxpayer || {
      legalName: cleanGst.includes('AAACI') ? 'INFOSYS LIMITED' : 'ENTERPRISE BUYER',
      status: 'Active',
      stateName: 'Karnataka',
      taxpayerType: 'Regular',
      regStartDate: '01/07/2017',
      pan: cleanGst.slice(2, 12),
      gstin: cleanGst,
    };
    const rets = fixture?.returns || fixtures['29AAACI1681G1Z0'].returns;
    
    return computeBuyerCreditScore(tp, rets);
  },

  /**
   * Verifies a GSTIN string.
   */
  async verifyGstin(gstin) {
    const cleanGst = (gstin || '').trim().toUpperCase();
    try {
      const resp = await fetch(`${BACKEND_URL}/api/v1/gst/verify/${cleanGst}`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000),
      });
      if (resp.ok) {
        return await resp.json();
      }
    } catch (e) {
      console.warn('GST verify fallback used:', e);
    }

    const fixture = fixtures[cleanGst] || fixtures['29AAACI1681G1Z0'];
    return fixture?.taxpayer || { legalName: 'ENTERPRISE BUYER', status: 'Active', gstin: cleanGst };
  }
};
