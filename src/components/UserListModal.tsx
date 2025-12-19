import React from 'react';
import { X, User, Shield, GraduationCap, Users } from 'lucide-react';
import { USERS, UserAccount } from '../users.ts';
import { UserRole } from '../models.ts';

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserListModal: React.FC<UserListModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Categorize users logic
  const systemAdmins = USERS.filter(u => u.username === 'Phanuwat39');
  const academicAdmins = USERS.filter(u => u.username === 't28');
  // Teachers are everyone else (role TEACHER or other ADMINs not caught above if any, though in this specific case structure is clear)
  const teachers = USERS.filter(u => u.role === UserRole.TEACHER).sort((a, b) => {
    // Sort logic: t-codes first, then teacher-codes, then named users
    const aIsT = a.username.startsWith('t') && !a.username.startsWith('teacher');
    const bIsT = b.username.startsWith('t') && !b.username.startsWith('teacher');
    if (aIsT && !bIsT) return -1;
    if (!aIsT && bIsT) return 1;
    return a.username.localeCompare(b.username, undefined, { numeric: true });
  });

  const UserTable = ({ users, colorClass }: { users: UserAccount[], colorClass: string }) => (
    <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className={`bg-gray-50 ${colorClass} bg-opacity-10`}>
          <tr>
            <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-1/3 border-r border-gray-200">Username</th>
            <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">ชื่อ-สกุล</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {users.map((user) => (
            <tr key={user.username} className="hover:bg-gray-50">
              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-100 font-mono">
                {user.username}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                {user.name}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center shrink-0">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Users className="w-5 h-5" /> รายชื่อผู้ใช้งานในระบบ
          </h3>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-8 bg-gray-50/50">
          
          {/* 3. System Admin */}
          <section>
            <h4 className="flex items-center gap-2 font-bold text-gray-800 mb-3 border-l-4 border-purple-600 pl-3">
              <Shield className="w-5 h-5 text-purple-600" /> 
              3. แอดมินผู้ดูแลระบบ (System Admin)
            </h4>
            <UserTable users={systemAdmins} colorClass="bg-purple-600" />
          </section>

          {/* 2. Academic Admin */}
          <section>
            <h4 className="flex items-center gap-2 font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3">
              <GraduationCap className="w-5 h-5 text-orange-500" /> 
              2. ครูฝ่ายวัดผล (Academic Admin)
            </h4>
            <UserTable users={academicAdmins} colorClass="bg-orange-500" />
          </section>

          {/* 1. Teachers */}
          <section>
            <h4 className="flex items-center gap-2 font-bold text-gray-800 mb-3 border-l-4 border-blue-600 pl-3">
              <User className="w-5 h-5 text-blue-600" /> 
              1. ครูผู้ใช้งานทั่วไป (Teachers)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Split list into two columns for better display on large screens */}
               <UserTable users={teachers.slice(0, Math.ceil(teachers.length / 2))} colorClass="bg-blue-600" />
               <UserTable users={teachers.slice(Math.ceil(teachers.length / 2))} colorClass="bg-blue-600" />
            </div>
          </section>

        </div>
        
        {/* Footer */}
        <div className="bg-gray-100 px-6 py-3 text-xs text-gray-500 text-center shrink-0 border-t border-gray-200">
          รหัสผ่านเริ่มต้นสำหรับทุกบัญชีคือ <b>password</b> (ยกเว้น Admin ที่มีการตั้งค่าเฉพาะ)
        </div>
      </div>
    </div>
  );
};
