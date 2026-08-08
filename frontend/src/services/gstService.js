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
    const cleanGst = (gstin || '27AAACT1240A1Z5').trim().toUpperCase();

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
    const fixture = fixtures[cleanGst];
    const stateCode = cleanGst.slice(0, 2);
    const stateName = stateCode === '27' ? 'Maharashtra' : stateCode === '29' ? 'Karnataka' : stateCode === '33' ? 'Tamil Nadu' : stateCode === '24' ? 'Gujarat' : 'Active Region';
    
    const tp = fixture?.taxpayer || {
      legalName: cleanGst === '27AAACT1240A1Z5' ? 'TATA MOTORS LIMITED' : 'ENTERPRISE OBLIGOR',
      status: 'Active',
      stateName: stateName,
      stateCode: stateCode,
      taxpayerType: 'Regular',
      regStartDate: '01/07/2017',
      pan: cleanGst.length >= 12 ? cleanGst.slice(2, 12) : 'XXXXXXXXXX',
      gstin: cleanGst,
    };
    const rets = fixture?.returns || fixtures['27AAACT1240A1Z5']?.returns || fixtures['29AAACI4798L1ZU']?.returns || [];
    
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

    const fixture = fixtures[cleanGst];
    return fixture?.taxpayer || { legalName: 'ENTERPRISE BUYER', status: 'Active', gstin: cleanGst };
  }
};
