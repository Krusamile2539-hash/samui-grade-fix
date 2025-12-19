// src/models.ts

export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER'
}

export enum FixStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DELETED = 'DELETED'
}

export interface User {
  name: string;
  username: string;
  role: UserRole;
}

export interface StudentEntry {
  id: string;
  studentName: string;
  subject: string;
  status: FixStatus;
  teacherName?: string;
  resolvedDate?: string;
  note?: string;
  newGrade?: string;
}
