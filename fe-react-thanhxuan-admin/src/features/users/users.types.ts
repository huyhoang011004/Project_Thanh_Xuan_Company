export interface UserAccount {
  _id: string;
  username: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface UserAccountPayload {
  username: string;
  password?: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
}
