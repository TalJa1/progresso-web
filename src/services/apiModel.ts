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