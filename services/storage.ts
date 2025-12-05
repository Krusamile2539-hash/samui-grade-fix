import { StudentEntry } from '../types';

// Google Apps Script Web App URL provided by the user
const API_URL = 'https://script.google.com/macros/s/AKfycbw8S_I4f7t83NanwKm79OnIJLnS4dirb_44O0egNch5mxxlsnXhoR0OOUoAYSEvuGuw/exec';
const LOCAL_STORAGE_KEY = 'grade_fix_data_cache';

export const getEntries = async (): Promise<StudentEntry[]> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Update local cache on successful fetch
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    return data;
  } catch (error) {
    // Log as info instead of warning to reduce console noise during development/offline usage
    console.info("Info: Google Sheets API unreachable or not configured, using local offline data.");
    
    // Fallback to local storage if API fails (e.g., offline or CORS error)
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    return cached ? JSON.parse(cached) : [];
  }
};

export const saveEntry = async (entry: StudentEntry): Promise<void> => {
  // 1. Optimistic Update: Save to local cache immediately
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  const currentEntries = cached ? JSON.parse(cached) : [];
  const updatedEntries = [entry, ...currentEntries];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedEntries));

  try {
    // Google Apps Script requires 'no-cors' for POST from browser
    // Using 'text/plain' content type avoids CORS preflight OPTIONS request issues
    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(entry),
    });
  } catch (error) {
    // Silently fail for API in demo mode, data is already saved locally
    console.info("Info: Could not sync to Google Sheets (Offline mode)");
  }
};

export const updateEntryStatus = async (id: string, updates: Partial<StudentEntry>): Promise<void> => {
  // 1. Optimistic Update: Update local cache
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) {
    const entries = JSON.parse(cached) as StudentEntry[];
    const updatedEntries = entries.map(e => e.id === id ? { ...e, ...updates } : e);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedEntries));
  }

  try {
    const payload = { id, ...updates };
    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.info("Info: Could not sync update to Google Sheets (Offline mode)");
  }
};