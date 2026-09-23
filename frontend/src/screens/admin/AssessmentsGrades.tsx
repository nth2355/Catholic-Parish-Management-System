import { useEffect, useState } from "react";
import {
  Card, Button, Badge, Table, Select, SectionHeader,
  Tabs, Avatar, StatCard, ProgressBar, Toast, AwardIcon, TrendingUpIcon,
  UsersIcon, PlusIcon,
  Dialog, Input,
} from "../../components/ui";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

type Assessment = {
  id: string;
  name: string;
  type: "WRITTEN" | "ORAL" | "PRACTICAL" | "OTHER";
  assessmentDate: string;
  maxScore: string | number;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  class: { id: string; name: string } | null;
  _count: { grades: number };
};
type AcademicYear = { id: string; name: string };
type ClassOption = { id: string; name: string };

type GradeRow = {
  id: string | null;
  studentId?: string;
  score: number | string | null;
  conduct: "EXCELLENT" | "GOOD" | "AVERAGE" | "NEEDS_IMPROVEMENT" | null;
  student: { fullName: string; baptismalName: string | null };
};

function getToken() {
  return localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
}

async function api<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Không thể tải dữ liệu");
  return result.data as T;
}

const conductLabels = {
  EXCELLENT: "Xuất sắc",
  GOOD: "Tốt",
  AVERAGE: "Khá",
  NEEDS_IMPROVEMENT: "Cần cố gắng",
} as const;

function gradeLabel(score: number) {
  if (score >= 9) return { label: "Xuất sắc", variant: "success" as const };
  if (score >= 7) return { label: "Tốt", variant: "navy" as const };
  if (score >= 5) return { label: "Khá", variant: "gold" as const };
  return { label: "Cần cố gắng", variant: "danger" as const };
}

export default function AssessmentsGrades() {
  const [tab, setTab] = useState("grades");
  const [classFilter, setClassFilter] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
  const [grades, setGrades] = useState<GradeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingGrades, setSavingGrades] = useState(false);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newAssessment, setNewAssessment] = useState({ name: "", assessmentDate: "", maxScore: "10", classId: "" });

  useEffect(() => {
    Promise.all([
      api<Assessment[]>("/assessments"),
      api<AcademicYear[]>("/classes/academic-years"),
      api<ClassOption[]>("/classes?status=ACTIVE"),
    ])
      .then(([data, years, classOptions]) => {
        setAssessments(data);
        setSelectedAssessmentId(data[0]?.id || "");
        setAcademicYears(years);
        setClasses(classOptions);
      })
      .catch((error) => showToast(error.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedAssessmentId) {
      setGrades([]);
      return;
    }
    api<{ grades: GradeRow[] }>(`/assessments/${selectedAssessmentId}/grades`)
      .then((data) => setGrades(data.grades))
      .catch((error) => showToast(error.message));
  }, [selectedAssessmentId]);

  const selectedAssessment = assessments.find((assessment) => assessment.id === selectedAssessmentId);
  const filtered = grades.filter((grade) => !classFilter || selectedAssessment?.class?.name === classFilter);
  const numericScores = filtered.flatMap((grade) => grade.score === null ? [] : [Number(grade.score)]);
  const avg = numericScores.length
    ? (numericScores.reduce((sum, score) => sum + score, 0) / numericScores.length).toFixed(1)
    : "—";

  const updateGrade = (index: number, changes: Partial<GradeRow>) => {
    setGrades((current) => current.map((grade, gradeIndex) => (
      gradeIndex === index ? { ...grade, ...changes } : grade
    )));
  };

  const saveGrades = async () => {
    if (!selectedAssessmentId) return;
    setSavingGrades(true);
    try {
      const response = await fetch(`${API_BASE_URL}/assessments/${selectedAssessmentId}/grades`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          grades: grades.map((grade) => ({
            studentId: grade.student.id,
            score: grade.score === "" ? null : grade.score === null ? null : Number(grade.score),
            conduct: grade.conduct,
            comment: grade.comment,
          })),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Không thể lưu điểm");
      setGrades(result.data.grades);
      showToast("Đã lưu điểm số");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể lưu điểm");
    } finally {
      setSavingGrades(false);
    }
  };

  const assignClass = async (classId: string) => {
    if (!selectedAssessmentId || !classId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/assessments/${selectedAssessmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ classId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Không thể gán lớp");
      setAssessments((current) => current.map((assessment) => (
        assessment.id === selectedAssessmentId ? result.data : assessment
      )));
      showToast("Đã gán lớp cho bài đánh giá");
      const data = await api<{ grades: GradeRow[] }>(`/assessments/${selectedAssessmentId}/grades`);
      setGrades(data.grades);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể gán lớp");
    }
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };
  const createAssessment = async () => {
    if (!newAssessment.name || !newAssessment.assessmentDate || !newAssessment.classId || !academicYears[0]) {
      showToast("Vui lòng nhập đủ thông tin, chọn lớp và tạo năm học trước");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/assessments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          academicYearId: academicYears[0].id,
          name: newAssessment.name,
          classId: newAssessment.classId,
          type: "WRITTEN",
          assessmentDate: newAssessment.assessmentDate,
          maxScore: Number(newAssessment.maxScore),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Không thể tạo bài đánh giá");
      setAssessments((current) => [result.data, ...current]);
      setSelectedAssessmentId(result.data.id);
      setShowCreate(false);
      setNewAssessment({ name: "", assessmentDate: "", maxScore: "10", classId: "" });
      showToast("Đã tạo bài đánh giá");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể tạo bài đánh giá");
    }
  };

  const exportGrades = () => {
    const rows = [
      ["Học sinh", "Lớp", "Điểm", "Hạnh kiểm", "Xếp loại"],
      ...filtered.map((grade) => [
        grade.student.fullName,
        selectedAssessment?.class?.name || "Tất cả lớp",
        grade.score === null ? "" : String(grade.score),
        grade.conduct ? conductLabels[grade.conduct] : "",
        grade.score === null ? "" : gradeLabel(Number(grade.score)).label,
      ]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${selectedAssessment?.name || "bang-diem"}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      <SectionHeader
        title="Đánh giá & điểm số"
        subtitle={selectedAssessment?.class?.name || "Dữ liệu từ hệ thống"}
        action={
          <Button variant="primary" onClick={() => setShowCreate(true)}>
            <PlusIcon size={14} /> Tạo bài đánh giá
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Điểm TB giữa kỳ" value={avg} sub="Học kỳ 1" color="navy" icon={<AwardIcon size={18} />} />
        <StatCard label="Xuất sắc (≥9)" value={numericScores.filter((score) => score >= 9).length} sub="học sinh" color="green" icon={<TrendingUpIcon size={18} />} />
        <StatCard label="Cần hỗ trợ (<5)" value={numericScores.filter((score) => score < 5).length} sub="học sinh" color="red" icon={<UsersIcon size={18} />} />
        <StatCard label="Chưa có điểm" value={grades.filter((grade) => grade.score === null).length} color="gold" icon={<AwardIcon size={18} />} />
      </div>

      <Card>
        <div className="p-4 border-b border-warm-100 flex items-center justify-between flex-wrap gap-3">
          <Tabs
            tabs={[
              { id: "grades", label: "Điểm số" },
              { id: "assessments", label: "Bài đánh giá" },
              { id: "overview", label: "Tổng quan" },
            ]}
            active={tab}
            onChange={setTab}
          />
          <div className="flex gap-2 items-center">
            <Select
              value={classFilter}
              onChange={setClassFilter}
              placeholder="Tất cả lớp"
              options={classes.map((classOption) => ({ value: classOption.name, label: classOption.name }))}
              className="w-44"
            />
            <Select
              value={selectedAssessmentId}
              onChange={setSelectedAssessmentId}
              placeholder="Chọn bài đánh giá"
              options={assessments.map((assessment) => ({ value: assessment.id, label: assessment.name }))}
              className="w-52"
            />
            {selectedAssessment && !selectedAssessment.class && (
              <Select
                value=""
                onChange={(value) => void assignClass(value)}
                placeholder="Gán lớp cho bài đánh giá"
                options={classes.map((classOption) => ({ value: classOption.id, label: classOption.name }))}
                className="w-52"
              />
            )}
            <Button variant="secondary" size="sm" onClick={exportGrades} disabled={!grades.length}>
              Xuất CSV
            </Button>
            {tab === "grades" && selectedAssessmentId && (
              <Button variant="primary" size="sm" onClick={() => void saveGrades()} disabled={savingGrades}>
                {savingGrades ? "Đang lưu..." : "Lưu điểm"}
              </Button>
            )}
          </div>
        </div>

        {tab === "grades" && !loading && (
          <Table
            headers={["Học sinh", "Lớp", "Điểm", "Điểm danh", "Hạnh kiểm", "Xếp loại"]}
            rows={filtered.map((g) => {
              const index = grades.indexOf(g);
              return [
              <div className="flex items-center gap-2">
                <Avatar name={g.student.fullName} size="sm" />
                <div>
                  <p className="text-sm font-medium text-warm-900">{g.student.fullName}</p>
                  <p className="text-xs text-warm-400">{g.student.baptismalName || "—"}</p>
                </div>
              </div>,
              <span className="text-warm-600 text-sm">{selectedAssessment?.class?.name || "Tất cả lớp"}</span>,
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={g.score === null ? "" : String(g.score)}
                  onChange={(value) => updateGrade(index, { score: value })}
                  className="w-20"
                />
                <span className="text-warm-300 text-xs">/{selectedAssessment?.maxScore || 10}</span>
              </div>,
              <span className="text-xs text-warm-400">—</span>,
              <Select
                value={g.conduct || ""}
                onChange={(value) => updateGrade(index, { conduct: value as GradeRow["conduct"] })}
                placeholder="Chọn"
                options={Object.entries(conductLabels).map(([value, label]) => ({ value, label }))}
                className="w-32"
              />,
              <Badge variant={g.score === null ? "muted" : gradeLabel(Number(g.score)).variant}>{g.score === null ? "Chưa có điểm" : gradeLabel(Number(g.score)).label}</Badge>,
            ];
            })}
          />
        )}

        {tab === "assessments" && (
          <div className="p-4 space-y-3">
            {assessments.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-4 rounded-xl border border-warm-200 hover:border-navy-200 hover:bg-navy-50/30">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-navy-50 rounded-lg flex items-center justify-center">
                    <AwardIcon size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-warm-900 text-sm" style={{ fontFamily: "var(--font-display)" }}>{a.name}</p>
                    <p className="text-xs text-warm-400">{a.class?.name || "Tất cả lớp"} · {a.type} · {new Date(a.assessmentDate).toLocaleDateString("vi-VN")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={a.status === "COMPLETED" ? "success" : a.status === "IN_PROGRESS" ? "navy" : "muted"}>
                    {a.status}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedAssessmentId(a.id); setTab("grades"); }}>Chi tiết</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "overview" && (
          <div className="p-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <h3 className="text-sm font-semibold text-warm-700 mb-4" style={{ fontFamily: "var(--font-display)" }}>
                  Phân bố điểm số
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Xuất sắc (9–10)", count: numericScores.filter((score) => score >= 9).length, total: numericScores.length, color: "green" as const },
                    { label: "Tốt (7–8.9)", count: numericScores.filter((score) => score >= 7 && score < 9).length, total: numericScores.length, color: "navy" as const },
                    { label: "Khá (5–6.9)", count: numericScores.filter((score) => score >= 5 && score < 7).length, total: numericScores.length, color: "gold" as const },
                    { label: "Cần cố gắng (<5)", count: numericScores.filter((score) => score < 5).length, total: numericScores.length, color: "red" as const },
                  ].map((r, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-warm-600">{r.label}</span>
                        <span className="text-warm-700 font-medium">{r.count} học sinh</span>
                      </div>
                      <ProgressBar value={r.count} max={r.total} color={r.color} showPercent />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-warm-700 mb-4" style={{ fontFamily: "var(--font-display)" }}>
                  Điểm TB theo lớp
                </h3>
                <div className="space-y-3">
                  {[
                    ...assessments
                      .filter((assessment) => assessment.class)
                      .map((assessment) => ({ class: assessment.class!.name, avg: selectedAssessment?.class?.name === assessment.class!.name ? Number(avg) || 0 : 0 })),
                  ].map((c, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-warm-600 w-36">{c.class}</span>
                      <div className="flex-1">
                        <ProgressBar value={c.avg} max={10} color={c.avg >= 8 ? "green" : c.avg >= 6 ? "navy" : "red"} />
                      </div>
                      <span className="text-sm font-bold text-warm-800 w-8">{c.avg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {toast && <Toast message={toast} type="success" onClose={() => setToast(null)} />}
      <Dialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Tạo bài đánh giá"
        footer={<><Button variant="secondary" onClick={() => setShowCreate(false)}>Hủy</Button><Button variant="primary" onClick={() => void createAssessment()}>Lưu</Button></>}
      >
        <div className="space-y-3">
          <Input label="Tên bài đánh giá" value={newAssessment.name} onChange={(value) => setNewAssessment({ ...newAssessment, name: value })} placeholder="Ví dụ: Kiểm tra giữa kỳ 1" />
          <Input label="Ngày đánh giá" type="date" value={newAssessment.assessmentDate} onChange={(value) => setNewAssessment({ ...newAssessment, assessmentDate: value })} />
          <Input label="Điểm tối đa" type="number" min="1" max="100" value={newAssessment.maxScore} onChange={(value) => setNewAssessment({ ...newAssessment, maxScore: value })} />
          <Select
            value={newAssessment.classId}
            onChange={(value) => setNewAssessment({ ...newAssessment, classId: value })}
            placeholder="Chọn lớp"
            options={classes.map((classOption) => ({ value: classOption.id, label: classOption.name }))}
          />
          <p className="text-xs text-warm-400">Năm học: {academicYears[0]?.name || "Chưa có năm học"}</p>
        </div>
      </Dialog>
    </div>
  );
}
