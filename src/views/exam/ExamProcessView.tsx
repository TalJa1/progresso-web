import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getQuestionsWithAnswersByExamId } from "../../apis/lessons/QuestionAnswerAPI";
import type { QuestionModel } from "../../services/apiModel";

const ExamProcessView = () => {
  const { examId } = useParams<{ examId: string }>();
  const [questions, setQuestions] = useState<QuestionModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        if (examId) {
          const data = await getQuestionsWithAnswersByExamId(Number(examId));
          setQuestions(data);
        }
      } catch {
        setError("Failed to load questions.");
      }
      setLoading(false);
    };
    fetchQuestions();
  }, [examId]);

  if (loading) return <div>Loading questions...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <h2>Exam Questions</h2>
      {questions.length === 0 ? (
        <div>No questions found for this exam.</div>
      ) : (
        <ul>
          {questions.map((q) => (
            <li key={q.id}>{q.content}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExamProcessView;
