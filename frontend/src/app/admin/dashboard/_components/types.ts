export type Role = "Admin" | "Mentor" | "Student" | "Staff";
export type Status = "Active" | "Inactive" | "Pending";

export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  status: Status;
}

export interface RoleChange {
  name: string;
  newRole: Role;
}
