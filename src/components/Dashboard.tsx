import React, { useMemo, useState } from 'react';
import { StudentEntry, FixStatus, GradeType, UserRole } from '../models';
import { StatsCard } from './StatsCard';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Users, AlertCircle, CheckCircle, FileCheck, User } from 'lucide-react';

interface DashboardProps {
  data: StudentEntry[];
  currentUser: string;
  role: UserRole;
}

const COLORS = ['#EF4444', '#F59E0B', '#10B981'];

export const Dashboard: React.FC<DashboardProps> = ({ data, currentUser, role }) => {
  // Default to 'MINE' if teacher, 'ALL' if admin
  const [viewScope, setViewScope] = useState<'ALL' | 'MINE'>('ALL');

  // Filter data based on scope
  const scopedData = useMemo(() => {
    if (viewScope === 'MINE') {
      return data.filter(d => d.teacherName === currentUser);
    }
    return data;
  }, [data, viewScope, currentUser]);

  const stats = useMemo(() => {
    return {
      total: scopedData.length,
      pending: scopedData.filter(d => d.status === FixStatus.PENDING).length,
      resolved: scopedData.filter(d => d.status === FixStatus.TEACHER_RESOLVED).length,
      recorded: scopedData.filter(d => d.status === FixStatus.ADMIN_RECORDED).length,
    };
  }, [scopedData]);

  const gradeDistribution = useMemo(() => {
    const counts = { [GradeType.ZERO]: 0, [GradeType.R]: 0, [GradeType.MS]: 0 };
    scopedData.forEach(d => {
      if (counts[d.grade] !== undefined) counts[d.grade]++;
    });
    return Object.keys(counts).map(key => ({
      name: `ติด ${key}`,
      value: counts[key as GradeType]
    }));
  }, [scopedData]);

  const statusDistribution = [
    { name: 'รอแก้ไข', value: stats.pending, fill: '#EF4444' },
    { name: 'รอวัดผล', value: stats.resolved, fill: '#F59E0B' },
    { name: 'เสร็จสิ้น', value: stats.recorded, fill: '#10B981' },
  ];

  return (
    <div className="space-y-6">
      {/* View Scope Toggles */}
      <div className="flex justify-center md:justify-start">
        <div className="bg-gray-200/50 p-1 rounded-lg inline-flex">
          <button
            onClick={() => setViewScope('ALL')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
              viewScope === 'ALL' 
                ? 'bg-white text-blue-700 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4" /> ภาพรวมทั้งโรงเรียน
          </button>
          {role !== UserRole.ADMIN && (
             <button
              onClick={() => setViewScope('MINE')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                viewScope === 'MINE' 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="w-4 h-4" /> ข้อมูลของฉัน
            </button>
          )}
        </div>
      </div>

      {scopedData.length === 0 && viewScope === 'MINE' ? (
        <div className="bg-white/60 rounded-xl p-8 text-center border border-dashed border-gray-300">
           <p className="text-gray-500">คุณยังไม่มีรายการแจ้งผลการเรียน 0, ร, มส ในระบบ</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard 
              title={viewScope === 'MINE' ? "นักเรียนของฉัน" : "นักเรียนทั้งหมด"}
              value={stats.total} 
              icon={<Users className="w-6 h-6 text-blue-600" />} 
              colorClass="bg-blue-600"
            />
            <StatsCard 
              title="ค้างดำเนินการ" 
              value={stats.pending} 
              icon={<AlertCircle className="w-6 h-6 text-red-600" />} 
              colorClass="bg-red-600"
            />
            <StatsCard 
              title="แจ้งแก้แล้ว" 
              value={stats.resolved} 
              icon={<FileCheck className="w-6 h-6 text-yellow-600" />} 
              colorClass="bg-yellow-600"
            />
            <StatsCard 
              title="บันทึกเข้าระบบ" 
              value={stats.recorded} 
              icon={<CheckCircle className="w-6 h-6 text-green-600" />} 
              colorClass="bg-green-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Grade Distribution Chart */}
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-sm border border-white/50">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">สัดส่วนผลการเรียน (0, ร, มส)</h3>
              <div className="h-64 w-full" style={{ minHeight: '16rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gradeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {gradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#EF4444', '#3B82F6', '#8B5CF6'][index % 3]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Chart */}
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-sm border border-white/50">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">สถานะการดำเนินการ</h3>
              <div className="h-64 w-full" style={{ minHeight: '16rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusDistribution} layout="vertical">
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="name" type="category" width={80} tick={{fill: '#4b5563'}} />
                    <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
