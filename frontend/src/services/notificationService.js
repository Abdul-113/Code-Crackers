import { db, isMock } from '../firebase/config';
import { collection, doc, getDocs, updateDoc, query, where, onSnapshot } from 'firebase/firestore';

const DEFAULT_NOTIFICATIONS = [
  { id: '1', title: 'Invoice Verification Approved', message: 'Invoice #INV-2026-085 has passed AI Risk Audits.', type: 'info', read: false, createdAt: '5m ago' },
  { id: '2', title: 'New Bid Placed', message: 'AltFin Capital offered ₹8,20,000 on your Tata Motors bill.', type: 'success', read: false, createdAt: '20m ago' }
];

export const notificationService = {
  getMockNotifications() {
    const saved = localStorage.getItem('mock_notifications');
    if (!saved) {
      localStorage.setItem('mock_notifications', JSON.stringify(DEFAULT_NOTIFICATIONS));
      return DEFAULT_NOTIFICATIONS;
    }
    return JSON.parse(saved);
  },

  async getNotifications(userId) {
    if (isMock) {
      return this.getMockNotifications();
    }
    try {
      const q = query(collection(db, 'notifications'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const res = [];
      querySnapshot.forEach(doc => {
        res.push({ docId: doc.id, ...doc.data() });
      });
      return res.length > 0 ? res : this.getMockNotifications();
    } catch (e) {
      console.error("Firestore getNotifications failed:", e);
      return this.getMockNotifications();
    }
  },

  async markAsRead(docId) {
    if (isMock) {
      const list = this.getMockNotifications();
      const updated = list.map(n => n.id === docId ? { ...n, read: true } : n);
      localStorage.setItem('mock_notifications', JSON.stringify(updated));
      return;
    }
    try {
      const docRef = doc(db, 'notifications', docId);
      await updateDoc(docRef, { read: true });
    } catch (e) {
      console.error("Firestore markAsRead failed:", e);
    }
  },

  subscribeNotifications(userId, callback) {
    if (isMock) {
      const interval = setInterval(() => {
        callback(this.getMockNotifications());
      }, 3000);
      return () => clearInterval(interval);
    }
    const q = query(collection(db, 'notifications'), where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      const res = [];
      snapshot.forEach(doc => {
        res.push({ docId: doc.id, ...doc.data() });
      });
      callback(res.length > 0 ? res : this.getMockNotifications());
    });
  }
};
