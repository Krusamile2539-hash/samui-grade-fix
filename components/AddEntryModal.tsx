import React, { useState } from 'react';
import { GradeType } from '../types';
import { X, Save, Upload, FileText, Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import * as mammoth from 'mammoth';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, TextRun, AlignmentType, BorderStyle } from 'docx';

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  currentUser: string;
}

// Helper to clean text
const cleanText = (text: string) => text?.trim() || '';

export const AddEntryModal: React.FC<AddEntryModalProps> = ({ isOpen, onClose, onSave, currentUser }) => {
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

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      teacherName: currentUser,
      status: 'PENDING',
      timestamp: new Date().toISOString()
    });
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
              // Empty rows for example
              new TableRow({
                children: Array(8).fill("").map(() => 
                  new TableCell({ children: [new Paragraph({})] })
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
      // Use mammoth to convert Docx to HTML, which is easier to parse for tables
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const parser = new DOMParser();
      const doc = parser.parseFromString(result.value, 'text/html');
      const table = doc.querySelector('table');

      if (!table) {
        throw new Error('ไม่พบตารางข้อมูลในไฟล์');
      }

      const rows = Array.from(table.querySelectorAll('tr'));
      const entries: any[] = [];

      // Start from index 1 (skip header)
      for (let i = 1; i < rows.length; i++) {
        const cells = Array.from(rows[i].querySelectorAll('td'));
        // Expecting 8 columns: No, ID, Name, Subject, Code, Grade, Term, Year
        if (cells.length >= 8) {
          const studentId = cleanText(cells[1].textContent || '');
          const studentName = cleanText(cells[2].textContent || '');
          const subject = cleanText(cells[3].textContent || '');
          const subjectCode = cleanText(cells[4].textContent || '');
          let grade = cleanText(cells[5].textContent || '');
          const term = cleanText(cells[6].textContent || '');
          const academicYear = cleanText(cells[7].textContent || '');

          // Skip empty rows
          if (!studentId && !studentName) continue;

          // Normalize Grade
          if (grade.includes('0')) grade = GradeType.ZERO;
          else if (grade.includes('ร')) grade = GradeType.R;
          else if (grade.includes('มส')) grade = GradeType.MS;
          else grade = GradeType.ZERO; // Default fallback

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
      // Reset input
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-primary px-6 py-4 flex justify-between items-center shrink-0">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <Upload className="w-5 h-5" /> เพิ่มข้อมูลนักเรียน (0, ร, มส)
          </h3>
          <button onClick={onClose} className="text-white/80 hover:bg-white/20 p-1.5 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 shrink-0">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'manual' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            กรอกข้อมูลรายคน
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'import' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            นำเข้าจากไฟล์ Word
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {activeTab === 'manual' ? (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รหัสนักเรียน</label>
                  <input 
                    required
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.studentId}
                    onChange={e => setFormData({...formData, studentId: e.target.value})}
                    placeholder="เช่น 12345"
                  />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ปีการศึกษา</label>
                  <input 
                    required
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.academicYear}
                    onChange={e => setFormData({...formData, academicYear: e.target.value})}
                    placeholder="เช่น 2566"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-สกุล</label>
                <input 
                  required
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.studentName}
                  onChange={e => setFormData({...formData, studentName: e.target.value})}
                  placeholder="เช่น เด็กชายรักเรียน เกาะสมุย"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">วิชา</label>
                  <input 
                    required
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    placeholder="เช่น คณิตศาสตร์"
                  />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รหัสวิชา</label>
                  <input 
                    required
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.subjectCode}
                    onChange={e => setFormData({...formData, subjectCode: e.target.value})}
                    placeholder="เช่น ค21101"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ผลการเรียน</label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.grade}
                    onChange={e => setFormData({...formData, grade: e.target.value as GradeType})}
                  >
                    <option value={GradeType.ZERO}>0 (ศูนย์)</option>
                    <option value={GradeType.R}>ร (รอการตัดสิน)</option>
                    <option value={GradeType.MS}>มส (ไม่มีสิทธิ์สอบ)</option>
                  </select>
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ภาคเรียน</label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.term}
                    onChange={e => setFormData({...formData, term: e.target.value})}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="Summer">ซัมเมอร์</option>
                  </select>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Step 1: Download Template */}
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">1. ดาวน์โหลดแบบฟอร์ม</h4>
                  <p className="text-xs text-gray-500 mt-1 mb-3">ดาวน์โหลดไฟล์ Word (.docx) เพื่อนำไปกรอกข้อมูลนักเรียนที่ต้องการแก้ไขผลการเรียน</p>
                  <button 
                    onClick={handleDownloadTemplate}
                    className="text-xs bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-50 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-3 h-3" /> ดาวน์โหลดแบบฟอร์ม
                  </button>
                </div>
              </div>

              {/* Step 2: Upload */}
              <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-6 text-center">
                {importing ? (
                  <div className="flex flex-col items-center py-4">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                    <p className="text-sm text-gray-600">กำลังอ่านข้อมูลจากไฟล์...</p>
                  </div>
                ) : (
                  <>
                    <h4 className="font-semibold text-gray-800 text-sm mb-2">2. อัปโหลดไฟล์ที่กรอกแล้ว</h4>
                    <p className="text-xs text-gray-500 mb-4">รองรับเฉพาะไฟล์ .docx เท่านั้น</p>
                    <label className="cursor-pointer inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                      <Upload className="w-4 h-4" /> เลือกไฟล์ Word
                      <input 
                        type="file" 
                        accept=".docx"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </>
                )}
              </div>

              {/* Error Message */}
              {importError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {importError}
                </div>
              )}

              {/* Step 3: Preview */}
              {parsedData.length > 0 && (
                <div className="space-y-3 animate-fade-in-up">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      พบข้อมูล {parsedData.length} รายการ
                    </h4>
                  </div>
                  <div className="border border-gray-200 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0">
                        <tr>
                          <th className="px-3 py-2">รหัส</th>
                          <th className="px-3 py-2">ชื่อ-สกุล</th>
                          <th className="px-3 py-2">วิชา</th>
                          <th className="px-3 py-2">เกรด</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {parsedData.map((d, i) => (
                          <tr key={i} className="bg-white">
                            <td className="px-3 py-2 text-gray-600">{d.studentId}</td>
                            <td className="px-3 py-2 text-gray-800">{d.studentName}</td>
                            <td className="px-3 py-2 text-gray-500">{d.subjectCode}</td>
                            <td className="px-3 py-2">
                              <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                {d.grade}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
          >
            ยกเลิก
          </button>
          
          {activeTab === 'manual' ? (
            <button 
              onClick={handleManualSubmit}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" /> บันทึกข้อมูล
            </button>
          ) : (
            <button 
              onClick={handleSaveImported}
              disabled={parsedData.length === 0}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors ${
                parsedData.length > 0 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" /> ยืนยันนำเข้าข้อมูล
            </button>
          )}
        </div>
      </div>
    </div>
  );
};