export interface User {
  _id: string;
  name:string;
  email: string;
  avatar?: string;
  phone?: string;
  address?: string;
  isVerified?: boolean;
  isActive?: boolean;
  role?: 'user' | 'admin';
  loyaltyPoints?: number;
  lastLogin?: string | null;
  __v?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponseData {
  user: User;
  token: string;
}