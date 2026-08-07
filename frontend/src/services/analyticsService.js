import { db, isMock } from '../firebase/config';
import { collection, doc, getDocs, getDoc } from 'firebase/firestore';

const DEFAULT_METRICS = {
  fundingVolume: 1840000,
  averageRisk: 'A+',
  averageYield: 8.65,
  invoicesUploaded: 14,
  invoicesFunded: 8,
  investorCount: 92
};

export const analyticsService = {
  async getMetrics() {
    if (isMock) {
      return DEFAULT_METRICS;
    }
    try {
      const docRef = doc(db, 'analytics', 'dashboard_metrics');
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : DEFAULT_METRICS;
    } catch (e) {
      console.error("Firestore getMetrics failed, loading fallback:", e);
      return DEFAULT_METRICS;
    }
  }
};
