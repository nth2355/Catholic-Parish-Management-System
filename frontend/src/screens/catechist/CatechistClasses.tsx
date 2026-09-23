import { useEffect, useState } from "react";
import { Badge, ProgressBar, SearchInput } from "../../components/ui";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
type ClassRecord = { id: string; name: string; room: string | null; capacity: number; _count: { enrollments: number } };
type Student = { id: string; fullName: string; baptismalName: string | null };

function getToken() { return localStorage.getItem("authToken") || sessionStorage.getItem("authToken"); }

async function load<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { headers: { Authorization: `Bearer ${getToken()}` } });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Không thể tải dữ liệu lớp học");
  return result.data;
}

export default function CatechistClasses() {
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    load<ClassRecord[]>("/classes")
      .then((data) => {
        setClasses(data);
        setSelectedClassId(data[0]?.id || "");
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Không thể tải lớp học"));
  }, []);

  useEffect(() => {
    if (!selectedClassId) return;
    load<{ student: Student }[]>(`/classes/${selectedClassId}/students`)
      .then((data) => setStudents(data.map((enrollment) => enrollment.student)))
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Không thể tải học sinh"));
  }, [selectedClassId]);

  const selectedClass = classes.find((classRecord) => classRecord.id === selectedClassId);
  const filteredStudents = students.filter((student) => `${student.fullName} ${student.baptismalName || ""}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="bg-navy-950 px-4 pt-12 pb-5">
        <p className="text-white/50 text-xs mb-2">Lớp được phân công</p>
        <select value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)} className="w-full bg-white/10 text-white rounded-lg px-3 py-2 text-base font-bold outline-none">
          {classes.map((classRecord) => <option key={classRecord.id} value={classRecord.id} className="text-warm-900">{classRecord.name}</option>)}
        </select>
        <p className="text-white/50 text-xs mt-2">{selectedClass?.room || "Chưa xếp phòng"} · {selectedClass?.capacity || 0} chỗ</p>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/10 rounded-xl p-3 text-center"><p className="text-xl font-bold text-white">{students.length}</p><p className="text-white/50 text-xs">Học sinh</p></div>
          <div className="bg-white/10 rounded-xl p-3 text-center"><p className="text-xl font-bold text-white">{selectedClass?.capacity ? Math.round((students.length / selectedClass.capacity) * 100) : 0}%</p><p className="text-white/50 text-xs">Sĩ số lớp</p></div>
        </div>
      </div>

      <div className="px-4 pt-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Tìm học sinh..." />
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-3 space-y-2 pb-4">
          {filteredStudents.map((student, index) => (
            <div key={student.id} className="bg-white rounded-2xl border border-warm-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-navy-100 text-navy-800 flex items-center justify-center text-sm font-bold">{index + 1}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-warm-900">{student.fullName}</p>
                <p className="text-xs text-warm-400">{student.baptismalName || "Chưa có tên thánh"}</p>
                <ProgressBar value={students.length} max={selectedClass?.capacity || students.length || 1} color="navy" className="mt-2" />
              </div>
              <Badge variant="success">Đang học</Badge>
            </div>
          ))}
          {!error && !filteredStudents.length && <p className="py-8 text-center text-sm text-warm-400">Chưa có học sinh trong lớp.</p>}
        </div>
      </div>
    </div>
  );
}
