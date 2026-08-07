import { db, isMock } from '../firebase/config';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';

// Initial Mock data list in case mock mode is triggered
const INITIAL_MOCK_INVOICES = [
  { id: 'INV-2026-084', buyer: 'Tata Motors Group', amount: '₹12,40,000', status: 'Funded', risk: 'Low', progress: 100 },
  { id: 'INV-2026-085', buyer: 'Reliance Retail Ltd', amount: '₹8,50,000', status: 'Auction Live', risk: 'Low', progress: 75 },
  { id: 'INV-2026-086', buyer: 'Infosys Tech Corp', amount: '₹14,20,000', status: 'Verified', risk: 'Low', progress: 40 },
  { id: 'INV-2026-087', buyer: 'Wipro Enterprises', amount: '₹6,40,000', status: 'Pending', risk: 'Medium', progress: 10 },
  { id: 'INV-2026-088', buyer: 'V-Guard Industries', amount: '₹9,80,000', status: 'Rejected', risk: 'High', progress: 0 }
];

export const invoiceService = {
  getMockInvoices() {
    const saved = localStorage.getItem('mock_invoices');
    if (!saved) {
      localStorage.setItem('mock_invoices', JSON.stringify(INITIAL_MOCK_INVOICES));
      return INITIAL_MOCK_INVOICES;
    }
    return JSON.parse(saved);
  },

  async getInvoices(ownerId) {
    if (isMock) {
      return this.getMockInvoices();
    }
    try {
      const q = query(collection(db, 'invoices'), where('ownerId', '==', ownerId));
      const querySnapshot = await getDocs(q);
      const res = [];
      querySnapshot.forEach(doc => {
        res.push({ docId: doc.id, ...doc.data() });
      });
      return res;
    } catch (e) {
      console.error("Firestore getInvoices error, loading mock fallback:", e);
      return this.getMockInvoices();
    }
  },

  async addInvoice(invoiceData) {
    if (isMock) {
      const list = this.getMockInvoices();
      const newInv = { id: `INV-2026-0${list.length + 84}`, ...invoiceData, progress: 10 };
      const updated = [newInv, ...list];
      localStorage.setItem('mock_invoices', JSON.stringify(updated));
      return newInv;
    }
    try {
      const docRef = await addDoc(collection(db, 'invoices'), invoiceData);
      return { docId: docRef.id, ...invoiceData };
    } catch (e) {
      console.error("Firestore addInvoice error:", e);
      throw e;
    }
  },

  async updateInvoice(docId, fields) {
    if (isMock) {
      const list = this.getMockInvoices();
      const updated = list.map(inv => inv.id === docId ? { ...inv, ...fields } : inv);
      localStorage.setItem('mock_invoices', JSON.stringify(updated));
      return;
    }
    try {
      const docRef = doc(db, 'invoices', docId);
      await updateDoc(docRef, fields);
    } catch (e) {
      console.error("Firestore updateInvoice error:", e);
    }
  },

  async deleteInvoice(docId) {
    if (isMock) {
      const list = this.getMockInvoices();
      const updated = list.filter(inv => inv.id !== docId);
      localStorage.setItem('mock_invoices', JSON.stringify(updated));
      return;
    }
    try {
      const docRef = doc(db, 'invoices', docId);
      await deleteDoc(docRef);
    } catch (e) {
      console.error("Firestore deleteInvoice error:", e);
    }
  },

  subscribeInvoices(ownerId, callback) {
    if (isMock) {
      // Return simple polling simulation
      const interval = setInterval(() => {
        callback(this.getMockInvoices());
      }, 3000);
      return () => clearInterval(interval);
    }
    const q = query(collection(db, 'invoices'), where('ownerId', '==', ownerId));
    return onSnapshot(q, (snapshot) => {
      const res = [];
      snapshot.forEach(doc => {
        res.push({ docId: doc.id, ...doc.data() });
      });
      callback(res);
    }, (err) => {
      console.error("Invoices real-time snap failed, fallback offline:", err);
    });
  }
};
