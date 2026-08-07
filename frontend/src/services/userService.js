import { db, isMock } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export const userService = {
  async getUser(uid) {
    if (isMock) {
      const saved = localStorage.getItem('mock_current_user');
      return saved ? JSON.parse(saved) : null;
    }
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (e) {
      console.error("Firestore user fetch error, loading cache:", e);
      return null;
    }
  },

  async createUser(uid, userData) {
    if (isMock) {
      localStorage.setItem('mock_current_user', JSON.stringify({ uid, ...userData }));
      return;
    }
    try {
      await setDoc(doc(db, 'users', uid), userData);
    } catch (e) {
      console.error("Firestore user creation error:", e);
    }
  },

  async updateUser(uid, fields) {
    if (isMock) {
      const saved = localStorage.getItem('mock_current_user');
      if (saved) {
        const user = { ...JSON.parse(saved), ...fields };
        localStorage.setItem('mock_current_user', JSON.stringify(user));
      }
      return;
    }
    try {
      await updateDoc(doc(db, 'users', uid), fields);
    } catch (e) {
      console.error("Firestore user update error:", e);
    }
  }
};
