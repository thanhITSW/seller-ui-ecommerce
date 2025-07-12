export interface LoginInformation {
  email: string;
  password: string;
  id?: number;
}

export interface UserInformation {
  name: string;
  email: string;
}

export interface User {
  id: string;
  email: string;
  fullname: string;
  phone: string;
  avatar: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  access_status?: 'active' | 'inactive';
  access_id?: string;
}

export interface UserFormData {
  email: string;
  fullname: string;
  phone: string;
  status: 'active' | 'inactive';
}
