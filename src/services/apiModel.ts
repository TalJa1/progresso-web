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
  id: number
  name: string
  description: string
}