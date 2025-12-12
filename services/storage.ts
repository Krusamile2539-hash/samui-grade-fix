import { StudentEntry, FixStatus } from '../models';
import { db } from './firebase';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';

const COLLECTION_NAME = 'student_entries';
const LOCAL_STORAGE_KEY = 'grade_fix_data_cache';

// Helper to check if configured
export const isConfigured = (): boolean => {
  return !!db;
};

export const getLocalEntries = (): StudentEntry[] => {
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  return cached ? JSON.parse(cached) : [];
};

export const getEntries = async (): Promise<StudentEntry[]> => {
  if (!db) {
     throw new Error("Firebase configuration missing");
  }

  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const data: StudentEntry[] = [];
    
    querySnapshot.forEach((doc) => {
      const entryData = doc.data() as StudentEntry;
      // กรองข้อมูลที่ถูกลบ
      if (entryData.status !== FixStatus.DELETED) {
        // ใช้ ID จากเอกสารหรือจากข้อมูลภายใน (Priority: ข้อมูลภายใน)
        data.push({ ...entryData, id: entryData.id || doc.id });
      }
    });
    
    // Sort by timestamp desc (newest first)
    data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Update local cache
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    return data;
  } catch (error) {
    console.warn("Firestore Sync Failed:", error);
    throw error;
  }
};

export const saveEntry = async (entry: StudentEntry): Promise<void> => {
  // 1. Optimistic Update
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  const currentEntries = cached ? JSON.parse(cached) : [];
  const updatedEntries = [entry, ...currentEntries];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedEntries));

  if (!db) throw new Error("Firebase configuration missing");

  try {
    // ใช้ entry.id เป็น Document ID เพื่อความแน่นอน
    await setDoc(doc(db, COLLECTION_NAME, entry.id), entry);
  } catch (error) {
    console.error("Save Entry Failed:", error);
    throw error;
  }
};

export const updateEntryStatus = async (id: string, updates: Partial<StudentEntry>): Promise<void> => {
  // 1. Optimistic Update
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) {
    const entries = JSON.parse(cached) as StudentEntry[];
    let updatedEntries;
    if (updates.status === FixStatus.DELETED) {
       updatedEntries = entries.filter(e => e.id !== id);
    } else {
       updatedEntries = entries.map(e => e.id === id ? { ...e, ...updates } : e);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedEntries));
  }

  if (!db) throw new Error("Firebase configuration missing");

  try {
    await updateDoc(doc(db, COLLECTION_NAME, id), updates);
  } catch (error) {
    console.error("Update Entry Failed:", error);
    throw error;
  }
};