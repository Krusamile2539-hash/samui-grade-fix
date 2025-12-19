import React, { useState, useEffect } from 'react';
import { StudentEntry } from '../models.ts';
import { X, Save, Upload, Edit3, Loader2 } from 'lucide-react';
import * as mammoth from 'mammoth';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, TextRun, AlignmentType } from 'docx';

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  currentUser: string;
  initialData?: StudentEntry; // If provided, we are in Edit mode
}

// Helper to clean text
const cleanText = (text: string) => text?.trim() || '';

export const AddEntryModal: React.FC<AddEntryModalProps> = ({ isOpen, onClose, onSave, currentUser, initialData }) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'import'>('manual');
  
  // Manual Form State
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    subject: '',
    subjectCode: '',
    grade: GradeType.ZERO,
    term: '1',
    academicYear: '2566',
  });

  // Import State
  const [importing, setImporting] = useState(false);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [importError, setImportError] = useState('');

  // Reset or Populated form on open
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Edit Mode
        setFormData({
          studentId: initialData.studentId,
          studentName: initialData.studentName,
          subject: initialData.subject,
          subjectCode: initialData.subjectCode,
          grade: initialData.grade,
          term: initialData.term,
          academicYear: initialData.academicYear,
        });
        setActiveTab('manual'); // Force manual tab for editing
      } else {
        // Add Mode
        resetForm();
        setActiveTab('manual');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) {
      // Edit: pass back updated fields
      onSave({
        ...initialData,
        ...formData,
        // Preserve original fields
      });
    } else {
      // Add: create new structure
      onSave({
        ...formData,
        teacherName: currentUser,
        status: 'PENDING',
        timestamp: new Date().toISOString()
      });
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      studentName: '',
      subject: '',
      subjectCode: '',
      grade: GradeType.ZERO,
      term: '1',
      academicYear: '2566',
    });
    setParsedData([]);
    setImportError('');
  };

  // --- Word Template Generation ---
  const handleDownloadTemplate = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({ text: "แบบฟอร์มแจ้งนักเรียนติด 0, ร, มส", bold: true, size: 32 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          new Paragraph({
             text: "คำแนะนำ: กรุณากรอกข้อมูลลงในตาราง ห้ามลบหัวตาราง",
             spacing: { after: 200 }
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  "ลำดับ", "รหัสนักเรียน", "ชื่อ-สกุล", "วิชา", "รหัสวิชา", "ผลการเรียน (0/ร/มส)", "ภาคเรียน", "ปีการศึกษา"
                ].map(header => 
                  new TableCell({
                    children: [new Paragraph({ text: header, alignment: AlignmentType.CENTER })],
                    width: { size: 100 / 8, type: WidthType.PERCENTAGE },
                    shading: { fill: "EFEFEF" }
                  })
                )
              }),
              new TableRow({
                children: Array(8).fill("").map(() => 
                  new TableCell({ children: [new Paragraph({})] })
                )
              })
            ]
          })
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "แบบฟอร์ม_GradeFix.docx";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // --- Word Parsing Logic ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportError('');
    setParsedData([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const parser = new DOMParser();
      const doc = parser.parseFromString(result.value, 'text/html');
      const table = doc.querySelector('table');

      if (!table) {
        throw new Error('ไม่พบตารางข้อมูลในไฟล์');
      }

      const rows = Array.from(table.querySelectorAll('tr'));
      const entries: any[] = [];

      for (let i = 1; i < rows.length; i++) {
        const cells = Array.from(rows[i].querySelectorAll('td'));
        if (cells.length >= 8) {
          const studentId = cleanText(cells[1].textContent || '');
          const studentName = cleanText(cells[2].textContent || '');
          const subject = cleanText(cells[3].textContent || '');
          const subjectCode = cleanText(cells[4].textContent || '');
          let grade = cleanText(cells[5].textContent || '');
          const term = cleanText(cells[6].textContent || '');
          const academicYear = cleanText(cells[7].textContent || '');

          if (!studentId && !studentName) continue;

          if (grade.includes('0')) grade = GradeType.ZERO;
          else if (grade.includes('ร')) grade = GradeType.R;
          else if (grade.includes('มส')) grade = GradeType.MS;
          else grade = GradeType.ZERO;

          entries.push({
            studentId, studentName, subject, subjectCode, grade, term, academicYear
          });
        }
      }

      if (entries.length === 0) {
        throw new Error('ไม่พบข้อมูลนักเรียนในตาราง');
      }
      setParsedData(entries);

    } catch (err: any) {
      console.error(err);
      setImportError(err.message || 'เกิดข้อผิดพลาดในการอ่านไฟล์');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleSaveImported = () => {
    parsedData.forEach(entry => {
      onSave({
        ...entry,
        teacherName: currentUser,
        status: 'PENDING',
        timestamp: new Date().toISOString()
      });
    });
    onClose();
    resetForm();
  };

  const isEditMode = !!initialData;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-primary px-6 py-4 flex justify-between items-center shrink-0">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            {isEditMode ? <Edit3 className="w-5 h-5" /> : <Upload className="w-5 h-5" />} 
            {isEditMode ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มข้อมูลนักเรียน (0, ร, มส)'}
          </h3>
          <button onClick={onClose} className="text-white/80 hover:bg-white/20 p-1.5 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs - Hide in Edit Mode */}
        {!isEditMode && (
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'manual' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              กรอกข้อมูลเอง
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'import' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              นำเข้าจาก Word
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {activeTab === 'manual' ? (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รหัสนักเรียน</label>
                  <input
                    required
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.studentId}
                    onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-สกุล</label>
                  <input
                    required
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.studentName}
                    onChange={e => setFormData({ ...formData, studentName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">วิชา</label>
                  <input
                    required
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รหัสวิชา</label>
                  <input
                    required
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.subjectCode}
                    onChange={e => setFormData({ ...formData, subjectCode: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ผลการเรียน</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.grade}
                    onChange={e => setFormData({ ...formData, grade: e.target.value as GradeType })}
                  >
                    <option value={GradeType.ZERO}>0</option>
                    <option value={GradeType.R}>ร</option>
                    <option value={GradeType.MS}>มส</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ภาคเรียน</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.term}
                      onChange={e => setFormData({ ...formData, term: e.target.value })}
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ปีการศึกษา</label>
                    <input
                      required
                      type="text"
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.academicYear}
                      onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> {isEditMode ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
               <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                  1. ดาวน์โหลดไฟล์ต้นฉบับ: <button onClick={handleDownloadTemplate} className="underline font-semibold hover:text-blue-900">แบบฟอร์ม_GradeFix.docx</button><br/>
                  2. กรอกข้อมูลในตาราง (ห้ามลบหัวตาราง)<br/>
                  3. อัปโหลดไฟล์กลับเข้ามาที่นี่
               </div>

               <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors relative">
                  <input 
                    type="file" 
                    accept=".docx"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {importing ? (
                    <div className="flex flex-col items-center gap-2 text-blue-600">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span>กำลังอ่านไฟล์...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <Upload className="w-8 h-8 mb-2" />
                      <span className="font-medium">คลิกเพื่ออัปโหลดไฟล์ Word (.docx)</span>
                    </div>
                  )}
               </div>

               {importError && (
                 <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                   {importError}
                 </div>
               )}

               {parsedData.length > 0 && (
                 <div className="space-y-4">
                   <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                     พบข้อมูล {parsedData.length} รายการ
                   </h4>
                   <div className="max-h-60 overflow-y-auto border rounded-lg">
                     <table className="w-full text-sm text-left">
                       <thead className="bg-gray-50 text-gray-600 sticky top-0">
                         <tr>
                           <th className="p-2">รหัส</th>
                           <th className="p-2">ชื่อ</th>
                           <th className="p-2">วิชา</th>
                           <th className="p-2">เกรด</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y">
                         {parsedData.map((row, idx) => (
                           <tr key={idx}>
                             <td className="p-2">{row.studentId}</td>
                             <td className="p-2">{row.studentName}</td>
                             <td className="p-2">{row.subject}</td>
                             <td className="p-2">{row.grade}</td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                   <button 
                     onClick={handleSaveImported}
                     className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium"
                   >
                     ยืนยันนำเข้าข้อมูล
                   </button>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
