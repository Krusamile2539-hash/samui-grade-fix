import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, User, StudentEntry, FixStatus } from './models';
import { getEntries, saveEntry, updateEntryStatus, getLocalEntries } from './services/storage';
import { USERS } from './users';
import { Dashboard } from './components/Dashboard';
import { StudentList } from './components/StudentList';
import { AddEntryModal } from './components/AddEntryModal';
import { UserListModal } from './components/UserListModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { SettingsModal } from './components/SettingsModal';
import { AnimatedBackground } from './components/AnimatedBackground';
import { LayoutDashboard, GraduationCap, LogOut, PlusCircle, Menu, X, Lock, User as UserIcon, List, Loader2, KeyRound, RefreshCw, Download, Wifi, WifiOff, Settings } from 'lucide-react';

const APP_VERSION = '2.0.0';

// Footer Component
const DeveloperFooter = () => (
  <footer className="py-6 text-center text-gray-500/80 text-sm mt-auto border-t border-white/30 bg-white/40 backdrop-blur-sm w-full">
    <p>ระบบติดตามการแก้ผลการเรียนโรงเรียนเกาะสมุย</p>
    <p className="font-medium text-gray-600 mt-1 flex items-center justify-center gap-2">
      พัฒนาโดย คุณครูภานุวัฒน์ ทองจันทร์ 
      <span className="bg-gray-200 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-md">v{APP_VERSION}</span>
    </p>
  </footer>
);

// Logo Component - Custom SVG for Samui School with Curved Text
const SchoolLogo = ({ className = "w-20 h-20" }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <path id="topCurve" d="M 25,100 A 75,75 0 0,1 175,100" />
      <path id="bottomCurve" d="M 12,100 A 88,88 0 0,0 188,100" />
    </defs>
    <circle cx="100" cy="100" r="98" fill="white" stroke="#2563EB" strokeWidth="3"/>
    <circle cx="100" cy="100" r="68" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1"/>
    <text fontSize="20" fontWeight="bold" fill="#1e40af" style={{ fontFamily: 'Sarabun, sans-serif' }}>
      <textPath href="#topCurve" startOffset="50%" textAnchor="middle">
        โรงเรียนเกาะสมุย
      </textPath>
    </text>
    <text fontSize="14" fontWeight="bold" fill="#1e40af" style={{ fontFamily: 'Sarabun, sans-serif' }} letterSpacing="0.5">
      <textPath href="#bottomCurve" startOffset="50%" textAnchor="middle">
        ระบบติดตามการแก้ผลการเรียน
      </textPath>
    </text>
    <g transform="translate(70, 60) scale(0.6)">
       <path d="M50 10 L50 85 L10 70 Z" fill="#3B82F6" opacity="0.9"/>
       <path d="M55 5 L55 85 L95 75 Z" fill="#2563EB" />
       <path d="M52 5 L52 90" stroke="#1e40af" strokeWidth="2" />
       <path d="M10 90 L90 90 L80 115 L20 115 Z" fill="#1e3a8a" />
       <path d="M-5 125 Q 25 105 50 125 T 105 125" fill="none" stroke="#60a5fa" strokeWidth="4" strokeLinecap="round" />
       <path d="M10 135 Q 40 120 60 135 T 90 135" fill="none" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round" />
    </g>
     <circle cx="18" cy="100" r="3" fill="#1e3a8a" />
     <circle cx="182" cy="100" r="3" fill="#1e3a8a" />
  </svg>
);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [data, setData] = useState<StudentEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list'>('dashboard');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<StudentEntry | undefined>(undefined);

  const [isUserListOpen, setIsUserListOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Function to fetch data with optional background mode (no full loading spinner)
  const syncData = useCallback(async (isBackground: boolean = false) => {
    if (!isBackground) setIsLoading(true);
    // Optimistically reset error unless we catch one
    setConnectionError(false);
    
    try {
      const entries = await getEntries();
      setData(entries);
      setLastSyncTime(new Date());
    } catch (error) {
      console.warn("Sync failed, falling back to local storage");
      setConnectionError(true);
      // Fallback to local data
      const localData = getLocalEntries();
      if (localData.length > 0) {
        setData(localData);
      }
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  }, []);

  // Effect for Auto-Sync logic
  useEffect(() => {
    // 1. Initial Fetch
    syncData(false);

    // 2. Polling every 30 seconds
    const intervalId = setInterval(() => {
      syncData(true);
    }, 30000);

    // 3. Sync on visibility change (user comes back to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncData(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', () => syncData(true));

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', () => syncData(true));
    };
  }, [syncData]);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleRefreshData = () => {
    syncData(false);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const storedOverrides = localStorage.getItem('grade_fix_password_overrides');
    const overrides = storedOverrides ? JSON.parse(storedOverrides) : {};

    const userAccount = USERS.find(u => u.username === username);

    if (userAccount) {
      const effectivePassword = overrides[username] || userAccount.password;
      
      if (password === effectivePassword) {
        setCurrentUser({
          name: userAccount.name,
          role: userAccount.role,
          username: userAccount.username
        });
        setActiveTab('dashboard');
        setUsername('');
        setPassword('');
        // Sync data on login to ensure freshness
        syncData(false);
      } else {
        setLoginError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } else {
      setLoginError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsMobileMenuOpen(false);
    setUsername('');
    setPassword('');
    setLoginError('');
  };

  const handleChangePassword = (oldPwd: string, newPwd: string) => {
    if (!currentUser) return false;
    const storedOverrides = localStorage.getItem('grade_fix_password_overrides');
    const overrides = storedOverrides ? JSON.parse(storedOverrides) : {};
    const userInDb = USERS.find(u => u.username === currentUser.username);
    const currentActualPassword = overrides[currentUser.username] || userInDb?.password;

    if (oldPwd !== currentActualPassword) {
      return false;
    }

    overrides[currentUser.username] = newPwd;
    localStorage.setItem('grade_fix_password_overrides', JSON.stringify(overrides));
    return true;
  };

  // Add or Edit Entry
  const handleSaveEntry = async (entryData: any) => {
    if (editingEntry) {
       // --- UPDATE EXISTING ---
       const updatedEntry = { ...entryData };
       // Optimistic update
       setData(prev => prev.map(item => item.id === updatedEntry.id ? updatedEntry : item));
       setIsAddModalOpen(false);
       setEditingEntry(undefined);
       // Send to backend (reusing updateEntryStatus which sends partial updates)
       try {
         await updateEntryStatus(updatedEntry.id, updatedEntry);
       } catch(e) {
         setConnectionError(true);
       }
       // Trigger background sync to confirm
       setTimeout(() => syncData(true), 1000);

    } else {
       // --- CREATE NEW ---
       const newEntry: StudentEntry = {
        ...entryData,
        id: Date.now().toString(),
      };
      setData(prev => [newEntry, ...prev]);
      setIsAddModalOpen(false);
      try {
        await saveEntry(newEntry);
      } catch (e) {
        setConnectionError(true);
      }
      // Trigger background sync to confirm
      setTimeout(() => syncData(true), 1000);
    }
  };

  const handleUpdateStatus = async (entry: StudentEntry, newStatus: FixStatus, date?: string, note?: string, newGrade?: string) => {
    const updates: Partial<StudentEntry> = { status: newStatus };
    if (date) updates.resolvedDate = date;
    
    if (newGrade) {
        updates.newGrade = newGrade;
    }
    
    if (note !== undefined) updates.note = note;

    setData(prev => prev.map(item => item.id === entry.id ? { ...item, ...updates } : item));
    try {
      await updateEntryStatus(entry.id, updates);
    } catch (e) {
      setConnectionError(true);
    }
  };

  const handleDeleteEntry = async (entry: StudentEntry) => {
    if (window.confirm(`ยืนยันการลบข้อมูลของ "${entry.studentName}" หรือไม่?`)) {
      // Optimistic delete from UI
      setData(prev => prev.filter(item => item.id !== entry.id));
      // Update status to DELETED
      try {
        await updateEntryStatus(entry.id, { status: FixStatus.DELETED });
      } catch (e) {
        setConnectionError(true);
      }
    }
  };

  const handleEditEntryClick = (entry: StudentEntry) => {
    setEditingEntry(entry);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingEntry(undefined);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <AnimatedBackground />
        
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md z-10">
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl w-full border border-white/50 transition-all duration-300">
            <div className="text-center mb-8">
              <div className="mb-4 drop-shadow-md">
                  <SchoolLogo className="w-28 h-28 mx-auto" />
              </div>
              <h1 className="text-xl font-bold text-gray-800">ระบบติดตามการแก้ผลการเรียน</h1>
              <h2 className="text-lg font-bold text-blue-700">โรงเรียนเกาะสมุย</h2>
              <p className="text-gray-500 mt-2 text-sm">เข้าสู่ระบบเพื่อดำเนินการ</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้งาน</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="text"
                    placeholder="Username (เช่น t11)"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200/80 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white/50 text-gray-800 backdrop-blur-sm"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="password"
                    placeholder="Password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200/80 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white/50 text-gray-800 backdrop-blur-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {loginError && <p className="text-red-500 text-sm text-center font-medium bg-red-50/80 py-2 rounded-lg">{loginError}</p>}

              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 flex items-center justify-center gap-2 mt-4 transform active:scale-[0.98]"
              >
                เข้าสู่ระบบ
              </button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <button 
                onClick={() => setIsUserListOpen(true)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-center gap-1 mx-auto hover:underline"
              >
                <List className="w-4 h-4" /> ดูรายชื่อผู้ใช้งาน
              </button>
            </div>
          </div>
        </div>
        <div className="w-full max-w-md mt-4 z-10 text-center">
           <p className="text-gray-500 text-xs bg-white/40 py-1 px-4 rounded-full backdrop-blur-sm shadow-sm inline-flex items-center gap-2">
             <span>พัฒนาโดย คุณครูภานุวัฒน์ ทองจันทร์</span>
             <span className="bg-blue-100 text-blue-700 px-1 rounded text-[10px] font-bold">v{APP_VERSION}</span>
           </p>
        </div>

        <UserListModal isOpen={isUserListOpen} onClose={() => setIsUserListOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative text-gray-800">
      <AnimatedBackground />

      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-1 drop-shadow-sm">
                 <SchoolLogo className="w-10 h-10" />
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-base sm:text-lg font-bold text-gray-800 leading-tight">ระบบติดตามผลการเรียน</h1>
                <span className="text-xs text-blue-600 font-medium hidden sm:block">โรงเรียนเกาะสมุย</span>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-3">
              {installPrompt && (
                <button 
                  onClick={handleInstallClick}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full hover:bg-blue-100 transition-colors mr-2"
                >
                  <Download className="w-4 h-4" /> ติดตั้งแอป
                </button>
              )}
              
              <div className="flex flex-col items-end mr-2 px-3 border-r border-gray-200/60">
                <div className="flex items-center gap-2">
                  {connectionError ? (
                     <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  ) : (
                     <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></span>
                  )}
                  <p className="text-sm font-semibold text-gray-800">{currentUser.name}</p>
                </div>
                <div className="flex items-center gap-1">
                  <p className="text-xs text-gray-500">
                    {currentUser.role === UserRole.ADMIN ? 'วัดผล' : 'ครูผู้สอน'}
                  </p>
                  {connectionError ? (
                     <span className="text-[10px] text-red-500 ml-1 flex items-center gap-1">
                       <WifiOff className="w-3 h-3" /> Offline
                     </span>
                  ) : lastSyncTime && (
                     <span className="text-[10px] text-gray-400 ml-1">
                       (อัปเดต {lastSyncTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })})
                     </span>
                  )}
                </div>
              </div>
              
              <button 
                onClick={handleRefreshData}
                className={`text-gray-500 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-full ${connectionError ? 'bg-red-50 text-red-500' : ''}`}
                title="รีเฟรชข้อมูลล่าสุด"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
              </button>

              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="text-gray-500 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-full"
                title="ตั้งค่าการเชื่อมต่อ"
              >
                <Settings className="w-5 h-5" />
              </button>

              <button 
                onClick={() => setIsChangePasswordOpen(true)}
                className="text-gray-500 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-full"
                title="เปลี่ยนรหัสผ่าน"
              >
                <KeyRound className="w-5 h-5" />
              </button>

              <button 
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-full"
                title="ออกจากระบบ"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center md:hidden gap-2">
              {connectionError && <WifiOff className="w-4 h-4 text-red-500" />}
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 border-t border-gray-100 p-4 shadow-lg backdrop-blur-md absolute w-full z-50">
             <div className="mb-4 pb-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{currentUser.name}</p>
                    <p className="text-xs text-gray-500 mb-1">
                      {currentUser.role === UserRole.ADMIN ? 'ผู้ดูแลระบบ / ฝ่ายวัดผล' : 'ครูผู้สอน'}
                    </p>
                  </div>
                  {connectionError ? (
                     <div className="text-right text-red-500 text-xs font-medium">
                       <WifiOff className="w-4 h-4 inline mr-1" /> เชื่อมต่อไม่ได้
                     </div>
                  ) : lastSyncTime && (
                    <div className="text-right">
                       <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100 flex items-center gap-1">
                         <Wifi className="w-3 h-3" /> ออนไลน์
                       </span>
                       <p className="text-[10px] text-gray-400 mt-1">อัปเดต {lastSyncTime.toLocaleTimeString('th-TH')}</p>
                    </div>
                  )}
                </div>
             </div>
             
             {installPrompt && (
                <button 
                  onClick={() => { handleInstallClick(); setIsMobileMenuOpen(false); }}
                  className="w-full text-left text-blue-600 py-2 text-sm font-medium flex items-center gap-2 hover:bg-blue-50 rounded-lg px-2 mb-1"
                >
                  <Download className="w-4 h-4" /> ติดตั้งแอปบนมือถือ
                </button>
             )}

            <button 
                onClick={() => { setIsSettingsOpen(true); setIsMobileMenuOpen(false); }}
                className="w-full text-left text-gray-700 py-2 text-sm font-medium flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 mb-1"
             >
               <Settings className="w-4 h-4" /> ตั้งค่าการเชื่อมต่อ (Database)
             </button>

             <button 
                onClick={() => { setIsChangePasswordOpen(true); setIsMobileMenuOpen(false); }}
                className="w-full text-left text-gray-700 py-2 text-sm font-medium flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 mb-1"
             >
               <KeyRound className="w-4 h-4" /> เปลี่ยนรหัสผ่าน
             </button>

             <button onClick={handleLogout} className="w-full text-left text-red-600 py-2 text-sm font-medium flex items-center gap-2 hover:bg-red-50 rounded-lg px-2">
               <LogOut className="w-4 h-4" /> ออกจากระบบ
             </button>
          </div>
        )}
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 z-10">
        
        {connectionError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm">
             <div className="flex items-center gap-3">
               <WifiOff className="w-5 h-5" />
               <span className="text-sm font-medium">ไม่สามารถเชื่อมต่อกับ Database ได้ ข้อมูลที่แสดงอาจไม่เป็นปัจจุบัน</span>
             </div>
             <button 
               onClick={() => setIsSettingsOpen(true)}
               className="text-sm bg-white border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
             >
               ตรวจสอบการตั้งค่า
             </button>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div className="bg-white/80 backdrop-blur-sm p-1 rounded-xl border border-white/50 inline-flex shadow-sm">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'}`}
            >
              <LayoutDashboard className="w-4 h-4" /> ภาพรวม
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'list' ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'}`}
            >
              <GraduationCap className="w-4 h-4" /> 
              {currentUser.role === UserRole.TEACHER ? 'รายการนักเรียนของฉัน' : 'รายการที่ต้องอนุมัติ'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isLoading && activeTab === 'list' && <span className="flex items-center gap-1 text-xs text-blue-600 bg-white/80 px-2 py-1 rounded-full"><Loader2 className="w-3 h-3 animate-spin" /> กำลังซิงค์...</span>}
            {currentUser.role === UserRole.TEACHER && (
              <button
                onClick={() => { setEditingEntry(undefined); setIsAddModalOpen(true); }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-lg shadow-blue-200 text-sm font-medium flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
              >
                <PlusCircle className="w-4 h-4" /> <span className="hidden sm:inline">แจ้งนักเรียนติด 0/ร/มส</span>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {activeTab === 'dashboard' ? (
            <Dashboard 
               data={data} 
               currentUser={currentUser.name}
               role={currentUser.role}
            />
          ) : (
            <StudentList 
              entries={data} 
              role={currentUser.role}
              currentUser={currentUser.name}
              onUpdateStatus={handleUpdateStatus}
              onDeleteEntry={handleDeleteEntry}
              onEditEntry={handleEditEntryClick}
            />
          )}
        </div>
      </main>

      <DeveloperFooter />

      <AddEntryModal 
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEntry}
        currentUser={currentUser.name}
        initialData={editingEntry}
      />
      
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onChangePassword={handleChangePassword}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={() => syncData(false)}
      />
    </div>
  );
};

export default App;