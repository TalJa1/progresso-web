export interface UserModel {
  class_: string;
  avatar_url: string;
  email: string;
  id: number;
  full_name: string;
  school: string;
  self_description: string;
}

export interface UserModelCreate {
  email: string;
  full_name: string;
  avatar_url: string;
  class_: string;
  school: string;
  self_description: string;
}

export interface LessonModel {
  content: string;
  id: number;
  video_url: string;
  topic_id: number;
  title: string;
  short_describe: string;
}

export interface TopicModel {
  id: number;
  name: string;
  description: string;
}

export interface LessonCompletionCreateModel {
  user_id: number;
  lesson_id: number;
  completed_at: string;
}

export interface ScheduleCreateModel {
  user_id: number;
  title: string;
  description: string;
  type: string;
  event_date: string;
  start_time: string;
}

export interface ScheduleIconModel {
  url: string;
}

export interface ScheduleModel {
  description: string;
  id: number;
  type: string;
  start_time: string;
  user_id: number;
  title: string;
  event_date: string;
}

export interface QuizletModel {
  answer: string
  lesson_id: number
  id: number
  question: string
}

export interface ExamModel {
  name: string
  year: number
  province: string
  topic_id: number
  rating: number
  student_attempt: number
  correct_attempt: number
  added_on: string
  id: number
}

export interface QuestionModel {
  id: number
  content: string
  type: string
  answers: AnswerModel[]
}

export interface AnswerModel {
  id: number
  content: string
  is_correct: boolean
}

export interface SubmissionModel {
  id: number
  user_id: number
  exam_id: number
  upload_time: string
  grade: number
  feedback: string
}

export interface SubmissionModelCreate {
  user_id: number
  exam_id: number
  grade: number
  feedback: string
}

export interface SubmissionRecordModelCreate {
  submission_id: number
  user_id: number
  question_id: number
  chosen_answer_id: number
}

export interface SubmissionRecordModel {
  id: number
  submission_id: number
  user_id: number
  question_id: number
  chosen_answer_id: number
}