import React, { useState, useEffect } from 'react';
import { X, Database, Save, Check, ExternalLink, Flame } from 'lucide-react';
import { getStoredConfig, saveConfig, clearConfig } from '../services/firebase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) => {
  const [configInput, setConfigInput] = useState('');
  const [hasConfig, setHasConfig] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredConfig();
      if (stored) {
        setConfigInput(JSON.stringify(stored, null, 2));
        setHasConfig(true);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // พยายามทำความสะอาด input (เผื่อ user ก๊อปปี้มาทั้ง const firebaseConfig = ...)
      let cleanedInput = configInput.trim();
      
      // ลบตัวแปรนำหน้าถ้ามี
      if (cleanedInput.includes('=')) {
        cleanedInput = cleanedInput.split('=')[1];
      }
      // ลบ semicolon ท้ายถ้ามี
      if (cleanedInput.endsWith(';')) {
        cleanedInput = cleanedInput.slice(0, -1);
      }

      // แปลง key ที่ไม่มี quote ให้มี quote (แบบง่ายๆ)
      cleanedInput = cleanedInput.replace(/(\w+):/g, '"$1":').replace(/'/g, '"');

      const configObj = JSON.parse(cleanedInput);

      if (!configObj.apiKey || !configObj.projectId) {
        throw new Error("ข้อมูลไม่ครบถ้วน (ต้องมี apiKey และ projectId)");
      }

      saveConfig(configObj);
      onSave();
      onClose();
    } catch (err: any) {
      setError('รูปแบบข้อมูลไม่ถูกต้อง: ' + err.message);
    }
  };

  const handleClear = () => {
    if(confirm('คุณต้องการลบการเชื่อมต่อ Firebase หรือไม่?')) {
        clearConfig();
        setConfigInput('');
        setHasConfig(false);
        onSave();
        onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-orange-600 px-6 py-4 flex justify-between items-center shrink-0">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <Flame className="w-5 h-5" /> ตั้งค่าฐานข้อมูล (Firebase)
          </h3>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Instructions */}
          <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-orange-800">วิธีการเชื่อมต่อ</h4>
            <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1 ml-1">
                <li>ไปที่ <a href="https://console.firebase.google.com/" target="_blank" className="text-blue-600 hover:underline">Firebase Console</a> และสร้างโปรเจกต์ใหม่</li>
                <li>สร้าง <b>Firestore Database</b> (เลือก start in production mode)</li>
                <li>ไปที่ <b>Project Settings</b> {'>'} เลื่อนลงมาที่ <b>Your apps</b></li>
                <li>เลือก Web app ({'</>'}) และคัดลอกส่วนที่เป็น <code>const firebaseConfig = {'{...}'};</code></li>
                <li>นำเฉพาะส่วนในวงเล็บปีกกา <code>{'{...}'}</code> มาวางในช่องด้านล่าง</li>
            </ol>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Firebase Config (JSON)</label>
                <textarea
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs font-mono h-48 focus:ring-2 focus:ring-orange-500 outline-none text-gray-600"
                    value={configInput}
                    onChange={e => setConfigInput(e.target.value)}
                    placeholder={`{
  "apiKey": "AIzaSy...",
  "authDomain": "project-id.firebaseapp.com",
  "projectId": "project-id",
  "storageBucket": "project-id.firebasestorage.app",
  "messagingSenderId": "...",
  "appId": "..."
}`}
                />
                {error && <p className="text-xs text-red-500 mt-2 font-medium bg-red-50 p-2 rounded">{error}</p>}
            </div>
            
            <div className="pt-4 flex justify-between items-center">
                 {hasConfig ? (
                    <button 
                        type="button"
                        onClick={handleClear}
                        className="text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1 rounded hover:bg-red-50"
                    >
                        ล้างการเชื่อมต่อ
                    </button>
                 ) : <div></div>}

                <div className="flex gap-3">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium"
                    >
                        ยกเลิก
                    </button>
                    <button 
                        type="submit" 
                        className="px-6 py-2 bg-orange-600 text-white hover:bg-orange-700 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm"
                    >
                        <Save className="w-4 h-4" /> บันทึกการเชื่อมต่อ
                    </button>
                </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};