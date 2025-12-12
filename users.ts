import { UserRole } from './models';

export interface UserAccount {
  username: string;
  password: string;
  name: string;
  role: UserRole;
}

// 1. รายชื่อครูที่มีการระบุชื่อจริง (Named Users)
const NAMED_USERS: UserAccount[] = [
  { username: 't11', password: 'password', name: 'สาวนิลดา ชูพันธ์', role: UserRole.TEACHER },
  { username: 't12', password: 'password', name: 'สาวศิวพร รักไทรทอง', role: UserRole.TEACHER },
  { username: 't13', password: 'password', name: 'สาวนาวาล มะ', role: UserRole.TEACHER },
  { username: 't14', password: 'password', name: 'สาวกฤติพร พิชญาพล', role: UserRole.TEACHER },
  { username: 't15', password: 'password', name: 'สาวเอรวรรณ เมืองทอง', role: UserRole.TEACHER },
  { username: 't16', password: 'password', name: 'สาวทิตติยา เฟื่องเกษม', role: UserRole.TEACHER },
  { username: 't17', password: 'password', name: 'สาวธันย์ชนก พลรัฐธนาสิทธิ์', role: UserRole.TEACHER },
  { username: 't18', password: 'password', name: 'สุปรีดา ศรีฟ้า', role: UserRole.TEACHER },
  { username: 't19', password: 'password', name: 'สาวนพมาศ สุขสวัสดิ์', role: UserRole.TEACHER },
  { username: 't110', password: 'password', name: 'สืบสกุล พงษ์จุ้ย', role: UserRole.TEACHER },
  { username: 't21', password: 'password', name: 'ชุติมา สุปันตี', role: UserRole.TEACHER },
  { username: 't22', password: 'password', name: 'สาวณิชารัศมี สุวรรณโณ', role: UserRole.TEACHER },
  { username: 't23', password: 'password', name: 'สาวทิพรัตน์ มณีนิล', role: UserRole.TEACHER },
  { username: 't24', password: 'password', name: 'ธีรพล ใจกว้าง', role: UserRole.TEACHER },
  { username: 't25', password: 'password', name: 'วรวัจน์ สารถวิล', role: UserRole.TEACHER },
  { username: 't26', password: 'password', name: 'สาวอัจฉรา รองเมือง', role: UserRole.TEACHER },
  { username: 't27', password: 'password', name: 'ว่าที่ ร.ต.ภีรวัฒน์ แช่มศรี', role: UserRole.TEACHER },
  { username: 't28', password: 'password', name: 'สาวจิราภรณ์ มูลี', role: UserRole.ADMIN }, // ฝ่ายวัดผล
  { username: 't29', password: 'password', name: 'อรัญญา เกื้อสกุล', role: UserRole.TEACHER },
  { username: 't210', password: 'password', name: 'เบ็ญจวรรณ รอบคอบ', role: UserRole.TEACHER },
  { username: 't31', password: 'password', name: 'ณัฐวรา ยะภักดี', role: UserRole.TEACHER },
  { username: 't32', password: 'password', name: 'ดิฐชัย ทับทิมทอง', role: UserRole.TEACHER },
  { username: 't33', password: 'password', name: 'จตุรพร ศุกรนันทน์', role: UserRole.TEACHER },
  { username: 't34', password: 'password', name: 'ถนัดกิจ ธารารักษ์', role: UserRole.TEACHER },
  { username: 't35', password: 'password', name: 'สาวพัชรินทร์ (คอม) หนูพระอินทร์', role: UserRole.TEACHER },
  { username: 't36', password: 'password', name: 'สาวสุชาดา ใจชื่อ', role: UserRole.TEACHER },
  { username: 't37', password: 'password', name: 'ศุภวัชร สิทธินุ่น', role: UserRole.TEACHER },
  { username: 't38', password: 'password', name: 'ปฐมพร เรืองจันทร์', role: UserRole.TEACHER },
  { username: 't39', password: 'password', name: 'สาวปิตินันท์ ทองนอก', role: UserRole.TEACHER },
  { username: 't41', password: 'password', name: 'สาวจารุวรรณ ศรีสวัสดิ์', role: UserRole.TEACHER },
  { username: 't42', password: 'password', name: 'พราน เพชรไฝ', role: UserRole.TEACHER },
  { username: 't43', password: 'password', name: 'พรรณศิริ เรืองจันทร์', role: UserRole.TEACHER },
  { username: 't44', password: 'password', name: 'สาวซูกี สีทอง', role: UserRole.TEACHER },
  { username: 't45', password: 'password', name: 'สาวกุลสิริ ทองปาน', role: UserRole.TEACHER },
  { username: 't46', password: 'password', name: 'อารีฟีน อับดุลอารี', role: UserRole.TEACHER },
  { username: 't51', password: 'password', name: 'สาวเจนจิรา ยมขรร', role: UserRole.TEACHER },
  { username: 't52', password: 'password', name: 'อดิเทพ เวชกะ', role: UserRole.TEACHER },
  { username: 't53', password: 'password', name: 'สาวมัญซุนารถ รักเงิน', role: UserRole.TEACHER },
  { username: 't54', password: 'password', name: 'สาววรรลภา พรหมทอง', role: UserRole.TEACHER },
  { username: 't55', password: 'password', name: 'สาวมัลลิกา ไชยวิก', role: UserRole.TEACHER },
  { username: 't56', password: 'password', name: 'สาวศิรภัสสร สายะสมิต', role: UserRole.TEACHER },
  { username: 't61', password: 'password', name: 'สาวเพ็ญศรี จันทร์ผ่อง', role: UserRole.TEACHER },
  { username: 't62', password: 'password', name: 'สาวอรวรรยา วรศิริ', role: UserRole.TEACHER },
  { username: 't63', password: 'password', name: 'ธีระพงษ์ สายทองแท้', role: UserRole.TEACHER },
  { username: 't64', password: 'password', name: 'เตชสิทธิ์ ศรีสุเมธารัส', role: UserRole.TEACHER },
  { username: 't65', password: 'password', name: 'เยาวรัตน์ ประสานเชื้อ', role: UserRole.TEACHER },
  { username: 't66', password: 'password', name: 'ปริญญา คานทอง', role: UserRole.TEACHER },
  { username: 'Phanuwat39', password: 'phanuwat39', name: 'ภานุวัฒน์ ทองจันทร์', role: UserRole.ADMIN },
  { username: 't28_user', password: 'password', name: 'สาวจิราภรณ์ มูลี', role: UserRole.TEACHER },
  { username: 'Phanuwat_user', password: 'password', name: 'ภานุวัฒน์ ทองจันทร์', role: UserRole.TEACHER },
];

// 2. ฟังก์ชันสร้าง User อัตโนมัติให้ครอบคลุม t1 - t120 เพื่อรองรับครู 100+ ท่าน
const generateAllUsers = (): UserAccount[] => {
  const users = [...NAMED_USERS];
  const existingUsernames = new Set(users.map(u => u.username));

  // สร้าง t1 ถึง t120
  for (let i = 1; i <= 120; i++) {
    const username = `t${i}`;
    if (!existingUsernames.has(username)) {
      users.push({
        username: username,
        password: 'password',
        name: `ครูรหัส ${username}`, // ชื่อชั่วคราว
        role: UserRole.TEACHER
      });
    }
  }

  // สร้าง teacher1 ถึง teacher30 (Backup)
  for (let i = 1; i <= 30; i++) {
    const username = `teacher${i}`;
    if (!existingUsernames.has(username)) {
      users.push({
        username: username,
        password: 'password',
        name: `ครู ${username}`,
        role: UserRole.TEACHER
      });
    }
  }

  return users;
};

export const USERS: UserAccount[] = generateAllUsers();