import React, { useState } from 'react';
import { StudentEntry, UserRole, FixStatus } from '../models';
import { StatusBadge } from './StatusBadge';
import { Search, Filter, Edit3, CheckSquare, Calendar, BookOpen, Download, Trash2, Edit, CheckCircle, ArrowRight } from 'lucide-react';

interface StudentListProps {
  entries: StudentEntry[];
  role: UserRole;
  onUpdateStatus: (entry: StudentEntry, newStatus: FixStatus, date?: string, note?: string, newGrade?: string) => void;
  onDeleteEntry?: (entry: StudentEntry) => void;
  onEditEntry?: (entry: StudentEntry) => void;
  currentUser: string;
}

export const StudentList: React.FC<StudentListProps> = ({ entries, role, onUpdateStatus, onDeleteEntry, onEditEntry, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Update form state (for resolving)
  const [resolveDate, setResolveDate] = useState('');
  const [resolveNote, setResolveNote] = useState('');
  const [resolveNewGrade, setResolveNewGrade] = useState('');

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = 
      entry.studentName.includes(searchTerm) || 
      entry.studentId.includes(searchTerm) ||
      entry.subject.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'ALL' || entry.status === filterStatus;
    
    const matchesRole = role === UserRole.ADMIN 
        ? entry.status !== FixStatus.PENDING 
        : entry.teacherName === currentUser;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleResolveClick = (entry: StudentEntry) => {
    setEditingId(entry.id);
    setResolveDate(new Date().toISOString().split('T')[0]); 
    setResolveNote(entry.note || '');
    setResolveNewGrade(entry.newGrade || '');
  };

  const handleSaveResolve = (entry: StudentEntry) => {
    if (role === UserRole.TEACHER) {
      if (!resolveNewGrade) {
        alert('กรุณาระบุเกรดที่ได้ใหม่');
        return;
      }
      onUpdateStatus(entry, FixStatus.TEACHER_RESOLVED, resolveDate, resolveNote, resolveNewGrade);
    } else {
      onUpdateStatus(entry, FixStatus.ADMIN_RECORDED);
    }
    setEditingId(null);
  };

  const handleExportCSV = () => {
    const headers = [
      "Timestamp", "ชื่อครูผู้สอน", "รหัสนักเรียน", "ชื่อ-สกุลนักเรียน", 
      "วิชา", "รหัสวิชา", "ผลการเรียนเดิม", "ภาคเรียน", "ปีการศึกษา", 
      "วันที่แก้", "เกรดใหม่", "สถานะ", "หมายเหตุ"
    ];

    const rows = filteredEntries.map(entry => [
      `"${new Date(entry.timestamp).toLocaleString('th-TH')}"`,
      `"${entry.teacherName}"`,
      `"${entry.studentId}"`,
      `"${entry.studentName}"`,
      `"${entry.subject}"`,
      `"${entry.subjectCode}"`,
      `"${entry.grade}"`,
      `"${entry.term}"`,
      `"${entry.academicYear}"`,
      `"${entry.resolvedDate ? new Date(entry.resolvedDate).toLocaleDateString('th-TH') : '-'}"`,
      `"${entry.newGrade || '-'}"`,
      `"${entry.status}"`,
      `"${entry.note || '-'}"`
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `grade_fix_data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const gradeOptions = ["1", "1.5", "2", "2.5", "3", "3.5", "4"];

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-white/50 overflow-hidden">
      {/* Header & Filters */}
      <div className="p-4 border-b border-gray-100/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          รายชื่อนักเรียน
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, รหัส..."
              className="pl-9 pr-4 py-2 border border-gray-200/80 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 bg-white/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              className="pl-9 pr-8 py-2 border border-gray-200/80 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white/50 w-full sm:w-48"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">ทุกสถานะ</option>
              <option value={FixStatus.PENDING}>รอแก้ไข</option>
              <option value={FixStatus.TEACHER_RESOLVED}>รอวัดผลยืนยัน</option>
              <option value={FixStatus.ADMIN_RECORDED}>บันทึกแล้ว</option>
            </select>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 px-3 py-2 border border-green-600 bg-green-50/80 text-green-700 hover:bg-green-100 rounded-lg text-sm transition-colors font-medium whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 text-gray-600 text-xs uppercase font-semibold">
            <tr>
              <th className="p-4">นักเรียน</th>
              <th className="p-4 hidden md:table-cell">วิชา</th>
              <th className="p-4 text-center">ผลการเรียน</th>
              <th className="p-4 hidden lg:table-cell">ปีการศึกษา</th>
              <th className="p-4 text-center">สถานะ</th>
              <th className="p-4">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/50 text-sm">
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  ไม่พบข้อมูล
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{entry.studentName}</div>
                    <div className="text-gray-500 text-xs">{entry.studentId}</div>
                    <div className="md:hidden text-xs text-gray-500 mt-1">
                      {entry.subject} ({entry.subjectCode})
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="text-gray-800">{entry.subject}</div>
                    <div className="text-gray-500 text-xs">{entry.subjectCode}</div>
                  </td>
                  <td className="p-4 text-center">
                     <div className="flex items-center justify-center gap-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-100 shadow-sm font-bold text-gray-700">
                          {entry.grade}
                        </span>
                        {entry.newGrade && (
                           <>
                              <ArrowRight className="w-4 h-4 text-green-500" />
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 border border-green-200 shadow-sm font-bold text-green-700">
                                {entry.newGrade}
                              </span>
                           </>
                        )}
                     </div>
                  </td>
                  <td className="p-4 hidden lg:table-cell text-gray-600">
                    {entry.term}/{entry.academicYear}
                  </td>
                  <td className="p-4 text-center">
                    <StatusBadge status={entry.status} />
                    {entry.resolvedDate && (
                      <div className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(entry.resolvedDate).toLocaleDateString('th-TH')}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    {editingId === entry.id ? (
                      <div className="flex flex-col gap-2 min-w-[200px] bg-white p-3 rounded-lg shadow-xl border border-blue-100 absolute z-20 right-4 sm:relative sm:right-auto sm:shadow-none sm:border-0 sm:p-0">
                        {role === UserRole.TEACHER && (
                          <>
                            <div>
                               <label className="text-xs text-gray-500 font-medium ml-1">วันที่แก้</label>
                               <input 
                                  type="date" 
                                  className="w-full text-xs p-1.5 border rounded-md"
                                  value={resolveDate}
                                  onChange={e => setResolveDate(e.target.value)}
                                  required
                               />
                            </div>
                            <div>
                               <label className="text-xs text-gray-500 font-medium ml-1">เกรดใหม่ที่ได้</label>
                               <select 
                                  className="w-full text-xs p-1.5 border rounded-md bg-white"
                                  value={resolveNewGrade}
                                  onChange={e => setResolveNewGrade(e.target.value)}
                               >
                                  <option value="">-- เลือกเกรด --</option>
                                  {gradeOptions.map(g => (
                                     <option key={g} value={g}>{g}</option>
                                  ))}
                               </select>
                            </div>
                            <div>
                               <label className="text-xs text-gray-500 font-medium ml-1">หมายเหตุ</label>
                               <input 
                                  type="text" 
                                  placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)" 
                                  className="w-full text-xs p-1.5 border rounded-md"
                                  value={resolveNote}
                                  onChange={e => setResolveNote(e.target.value)}
                               />
                            </div>
                          </>
                        )}
                        <div className="flex gap-2 mt-2">
                          <button 
                            onClick={() => handleSaveResolve(entry)}
                            className="flex-1 bg-green-600 text-white text-xs py-1.5 px-2 rounded-md hover:bg-green-700 font-medium"
                          >
                            ยืนยัน
                          </button>
                          <button 
                            onClick={() => setEditingId(null)}
                            className="flex-1 bg-gray-100 text-gray-700 text-xs py-1.5 px-2 rounded-md hover:bg-gray-200 font-medium"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        {role === UserRole.TEACHER && entry.status === FixStatus.PENDING && (
                           <>
                             <button 
                               onClick={() => handleResolveClick(entry)}
                               title="แก้ผลการเรียน"
                               className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium border border-blue-200 bg-blue-50/50 px-2 py-1.5 rounded-md hover:bg-blue-100 transition-colors"
                             >
                               <Edit3 className="w-3 h-3" /> แก้ผล
                             </button>
                             
                             <div className="w-px h-6 bg-gray-200 mx-1"></div>

                             <button
                               onClick={() => onEditEntry && onEditEntry(entry)}
                               title="แก้ไขข้อมูลนักเรียน"
                               className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                             >
                               <Edit className="w-4 h-4" />
                             </button>
                             <button
                               onClick={() => onDeleteEntry && onDeleteEntry(entry)}
                               title="ลบรายการ"
                               className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </>
                        )}

                        {role === UserRole.ADMIN && entry.status === FixStatus.TEACHER_RESOLVED && (
                           <button 
                             onClick={() => handleSaveResolve(entry)}
                             className="flex items-center gap-1 text-green-600 hover:text-green-800 text-xs font-medium border border-green-200 bg-green-50/50 px-3 py-1.5 rounded-md hover:bg-green-100 transition-colors"
                           >
                             <CheckSquare className="w-3 h-3" /> บันทึกเข้าระบบ
                           </button>
                        )}
                         {role === UserRole.ADMIN && entry.status === FixStatus.ADMIN_RECORDED && (
                           <span className="text-green-600 text-xs flex items-center gap-1">
                             <CheckCircle className="w-4 h-4" /> เรียบร้อย
                           </span>
                        )}
                         {role === UserRole.TEACHER && entry.status !== FixStatus.PENDING && (
                           <span className="text-gray-400 text-xs">ดำเนินการแล้ว</span>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};