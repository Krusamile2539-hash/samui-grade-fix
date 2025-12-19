// src/users.ts

import { UserRole } from './models';

export const USERS = [
  {
    name: 'ฝ่ายวัดผล',
    username: 'admin',
    password: 'admin123',
    role: UserRole.ADMIN
  },
  {
    name: 'ครูตัวอย่าง',
    username: 'teacher',
    password: 'teacher123',
    role: UserRole.TEACHER
  }
];
