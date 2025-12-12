export enum UserRole {
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}

export enum GradeType {
  ZERO = '0',
  R = 'ร',
  MS = 'มส'
}

export enum FixStatus {
  PENDING = 'PENDING',            // รอแก้ไข
  TEACHER_RESOLVED = 'RESOLVED',  // ดำเนินการแก้แล้ว (ครูแจ้ง)
  ADMIN_RECORDED = 'RECORDED',     // บันทึกเข้าระบบแล้ว (วัดผลยืนยัน)
  DELETED = 'DELETED'             // ถูกลบ
}

export interface StudentEntry {
  id: string;
  timestamp: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  subject: string;
  subjectCode: string;
  grade: GradeType;
  term: string;
  academicYear: string;
  resolvedDate?: string; // วันที่แก้
  newGrade?: string;     // เกรดใหม่ที่ได้จากการแก้
  status: FixStatus;
  note?: string; // หมายเหตุ
}

export interface User {
  username: string;
  name: string;
  role: UserRole;
}

export interface Stats {
  total: number;
  pending: number;
  resolved: number;
  recorded: number;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}