import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

function App() {

  const saveFixGrade = async () => {
    try {
      await addDoc(collection(db, "gradeFix"), {
        studentName: "ทดสอบ",
        subject: "สังคมศึกษา",
        createdAt: new Date()
      });
      alert("บันทึกข้อมูลสำเร็จ");
    } catch (err) {
      console.error("บันทึกไม่สำเร็จ", err);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={saveFixGrade}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        บันทึกข้อมูล
      </button>
    </div>
  );
}

export default App;
