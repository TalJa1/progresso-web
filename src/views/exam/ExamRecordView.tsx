import { useParams, useLocation } from "react-router-dom";

const ExamRecordView = () => {
  const params = useParams();
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const queryParams: Record<string, string> = {};
  search.forEach((value, key) => {
    queryParams[key] = value;
  });

  const submissionId = params.submissionId ?? null;
  const examId = params.examId ?? null;
  const submissionIdNum = submissionId ? Number(submissionId) : null;
  const examIdNum = examId ? Number(examId) : null;

  return (
    <div style={{ padding: 20 }}>
      <h2>Exam Record</h2>
      <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {JSON.stringify({ submissionId, examId, submissionIdNum, examIdNum, queryParams }, null, 2)}
      </pre>
    </div>
  );
};

export default ExamRecordView;
