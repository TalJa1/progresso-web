export interface UserModel {
  class_: string;
  avatar_url: string;
  email: string;
  id: number;
  full_name: string;
  school: string;
}

export interface UserModelCreate {
  email: string;
  full_name: string;
  avatar_url: string;
  class_: string;
  school: string;
}
