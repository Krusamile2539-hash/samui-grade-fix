import React, { useState, useEffect } from 'react';
import { X, Database, Save, Check, ExternalLink, Flame, ClipboardPaste } from 'lucide-react';
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
      const text = configInput.trim();
      const configObj: any = {};
      let foundKeys = 0;

      // วิธีที่ 1: ดึงข้อมูลด้วย Regex (รองรับทั้ง key: "value" และ "key": "value")
      // วิธีนี้ยืดหยุ่นที่สุดสำหรับโค้ด JS object ที่ก๊อปปี้มา และไม่พังเพราะเครื่องหมายลูกน้ำ
      const keyValRegex = /['"]?([a-zA-Z0-9_]+)['"]?\s*:\s*['"]([^'"]*)['"]/g;
      let match;
      
      while ((match = keyValRegex.exec(text)) !== null) {
        const key = match[1];
        const value = match[2];
        // กรองเฉพาะ key ที่เป็นของ Firebase config เพื่อความปลอดภัย
        if (['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId', 'measurementId'].includes(key)) {
            configObj[key] = value;
            foundKeys++;
        }
      }

      // วิธีที่ 2: ถ้า Regex ไม่เจอข้อมูล (เผื่อกรณี Format แปลกมากๆ) ให้ลอง Parse แบบ JSON/JS ปกติ
      if (foundKeys < 3) {
        try {
            let jsonText = text;
            // ลบ const ... = 
            if (jsonText.includes('=')) jsonText = jsonText.substring(jsonText.indexOf('=') + 1);
            // ลบ ; ท้ายสุด
            if (jsonText.trim().endsWith(';')) jsonText = jsonText.trim().slice(0, -1);
            
            // แปลง ' เป็น "
            jsonText = jsonText.replace(/'/g, '"');
            // ใส่ quote ให้ key
            jsonText = jsonText.replace(/(\s*?)(['"])?([a-zA-Z0-9_]+)(['"])?(\s*):/g, '$1"$3"$5:');
            // ลบ trailing comma
            jsonText = jsonText.replace(/,(\s*})/g, '$1');
            
            const parsed = JSON.parse(jsonText);
            Object.assign(configObj, parsed);
        } catch (jsonErr) {
            console.warn("JSON Parse failed, relying on Regex result", jsonErr);
        }
      }

      // ตรวจสอบความถูกต้องของข้อมูล
      if (!configObj.apiKey || !configObj.projectId) {
         // ถ้ายังไม่เจอข้อมูลอีก แสดงว่า Input ผิดรูปแบบจริงๆ
         throw new Error("ไม่พบข้อมูล apiKey หรือ projectId ในข้อความที่ระบุ กรุณาลองใหม่");
      }

      saveConfig(configObj);
      onSave();
      onClose();
    } catch (err: any) {
      console.error("Config Parsing Error:", err);
      setError('เกิดข้อผิดพลาด: ' + err.message + '\n(แนะนำ: ให้คัดลอกเฉพาะส่วนในปีกกา { ... } มาวาง)');
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

  const handlePasteSample = () => {
      setConfigInput(`const firebaseConfig = {
  apiKey: "วางรหัส apiKey ตรงนี้",
  authDomain: "project-id.firebaseapp.com",
  projectId: "project-id",
  storageBucket: "project-id.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4 flex justify-between items-center shrink-0">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <Flame className="w-5 h-5" /> ตั้งค่าฐานข้อมูล (Firebase)
          </h3>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 bg-gray-50/50">
          
          {/* Instructions */}
          <div className="bg-white border border-orange-100 rounded-lg p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-orange-800 flex items-center gap-2">
                <Database className="w-4 h-4" /> วิธีการเชื่อมต่อ
            </h4>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2 ml-1">
                <li>ไปที่ <a href="https://console.firebase.google.com/" target="_blank" className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1">Firebase Console <ExternalLink className="w-3 h-3"/></a> สร้างโปรเจกต์และ Firestore Database</li>
                <li>ไปที่ <b>Project Settings</b> {'>'} เลื่อนลงมาที่ <b>Your apps</b> {'>'} เลือก Web app</li>
                <li>
                    คัดลอก Code ในกรอบ <code>const firebaseConfig = {'{ ... }'};</code> มาวางในช่องด้านล่างได้เลย
                    <span className="text-xs text-orange-600 block mt-1 ml-4">(วางทั้ง const ก็ได้ ระบบจะดึงเฉพาะข้อมูลที่จำเป็นให้อัตโนมัติ)</span>
                </li>
            </ol>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="relative">
                <div className="flex justify-between items-end mb-2">
                    <label className="block text-sm font-bold text-gray-700">วาง Config Code ที่นี่</label>
                    {!configInput && (
                        <button 
                            type="button" 
                            onClick={handlePasteSample}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                        >
                            <ClipboardPaste className="w-3 h-3" /> ดูตัวอย่าง
                        </button>
                    )}
                </div>
                <textarea
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-xs font-mono h-48 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-600 shadow-inner bg-white"
                    value={configInput}
                    onChange={e => setConfigInput(e.target.value)}
                    placeholder={`const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "...",
  projectId: "...",
  ...
};`}
                />
                {error && (
                    <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3 items-start animate-pulse">
                        <div className="mt-0.5 text-red-500"><X className="w-4 h-4"/></div>
                        <p className="text-xs text-red-600 font-medium whitespace-pre-wrap">{error}</p>
                    </div>
                )}
            </div>
            
            <div className="pt-4 flex justify-between items-center border-t border-gray-200 mt-6">
                 {hasConfig ? (
                    <button 
                        type="button"
                        onClick={handleClear}
                        className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        ล้างการเชื่อมต่อ
                    </button>
                 ) : <div></div>}

                <div className="flex gap-3">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow"
                    >
                        ยกเลิก
                    </button>
                    <button 
                        type="submit" 
                        className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all transform active:scale-95"
                    >
                        <Save className="w-4 h-4" /> บันทึกและเชื่อมต่อ
                    </button>
                </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
