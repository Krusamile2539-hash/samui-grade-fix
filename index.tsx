import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

function App() {

  const saveData = async () => {
    try {
      await addDoc(collection(db, "grade_fix"), {
        studentName: "ทดสอบ",
        subject: "สังคมศึกษา",
        updatedAt: new Date()
      });
      alert("บันทึกข้อมูลสำเร็จ");
    } catch (err) {
      console.error("บันทึกข้อมูลไม่ได้", err);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={saveData}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        บันทึกข้อมูล
      </button>
    </div>
  );
}

export default App;
