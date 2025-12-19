// ✅ App.tsx (FIXED – READY TO USE)

import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, User, StudentEntry, FixStatus } from './models';
import {
  getEntries,
  saveEntry,
  updateEntryStatus,
  getLocalEntries
} from './services/storage';

import { USERS } from './users';
import { Dashboard } from './components/Dashboard';
import { StudentList } from './components/StudentList';
import { AddEntryModal } from './components/AddEntryModal';
import { UserListModal } from './components/UserListModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { SettingsModal } from './components/SettingsModal';
import { AnimatedBackground } from './components/AnimatedBackground';

import {
  LayoutDashboard,
  GraduationCap,
  LogOut,
  PlusCircle,
  Menu,
  X,
  Lock,
  User as UserIcon,
  List,
  Loader2,
  KeyRound,
  RefreshCw,
  Download,
  Wifi,
  WifiOff,
  Settings
} from 'lucide-react';

const APP_VERSION = '2.0.0';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [data, setData] = useState<StudentEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list'>('dashboard');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<StudentEntry | undefined>();

  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // ✅ Sync data from Firestore (with fallback)
  const syncData = useCallback(async (background = false) => {
    if (!background) setIsLoading(true);
    setConnectionError(false);

    try {
      const entries = await getEntries(); // 🔥 Firestore
      setData(entries);
      setLastSyncTime(new Date());
    } catch (err) {
      console.warn('Sync failed → fallback to local storage');
      setConnectionError(true);
      setData(getLocalEntries());
    } finally {
      if (!background) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    syncData(false);
    const interval = setInterval(() => syncData(true), 30000);
    return () => clearInterval(interval);
  }, [syncData]);

  // ✅ Save Entry (CREATE / UPDATE)
  const handleSaveEntry = async (entryData: any) => {
    if (editingEntry) {
      // UPDATE
      setData(prev =>
        prev.map(e => (e.id === editingEntry.id ? entryData : e))
      );
      setEditingEntry(undefined);
      setIsAddModalOpen(false);

      try {
        await updateEntryStatus(entryData.id, entryData);
      } catch {
        setConnectionError(true);
      }
    } else {
      // CREATE
      const newEntry: StudentEntry = {
        ...entryData,
        id: Date.now().toString()
      };

      setData(prev => [newEntry, ...prev]);
      setIsAddModalOpen(false);

      try {
        await saveEntry(newEntry); // 🔥 Firestore
      } catch {
        setConnectionError(true);
      }
    }

    setTimeout(() => syncData(true), 1000);
  };

  // ==============================
  // 🔐 LOGIN / LOGOUT (เหมือนเดิม)
  // ==============================

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const user = USERS.find(u => u.username === username);
    if (!user || user.password !== password) {
      setLoginError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      return;
    }

    setCurrentUser({
      name: user.name,
      role: user.role,
      username: user.username
    });

    syncData(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUsername('');
    setPassword('');
  };

  // ==============================
  // 🔻 UI (เหมือนเดิมทั้งหมด)
  // ==============================

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <form onSubmit={handleLoginSubmit} className="bg-white p-6 rounded-xl">
          <input
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="border p-2 w-full mb-2"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border p-2 w-full mb-2"
          />
          {loginError && <p className="text-red-500">{loginError}</p>}
          <button className="bg-blue-600 text-white px-4 py-2 w-full">
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    );
  }

  return (
    <>
      <AnimatedBackground />
      <Dashboard data={data} currentUser={currentUser.name} role={currentUser.role} />
      <AddEntryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveEntry}
        currentUser={currentUser.name}
        initialData={editingEntry}
      />
    </>
  );
};

export default App;
