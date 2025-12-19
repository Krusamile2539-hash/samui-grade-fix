import React from 'react';
import { FixStatus } from '../models';

export const StatusBadge: React.FC<{ status: FixStatus }> = ({ status }) => {
  switch (status) {
    case FixStatus.PENDING:
      return <span className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">รอแก้ไข</span>;
    case FixStatus.TEACHER_RESOLVED:
      return <span className="px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">รอวัดผลยืนยัน</span>;
    case FixStatus.ADMIN_RECORDED:
      return <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">บันทึกแล้ว</span>;
    default:
      return null;
  }
};
