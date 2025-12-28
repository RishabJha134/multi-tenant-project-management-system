export interface User {
  id: string;
  email: string;
  clientId: string;
  role: string;
  client?: {
    id: string;
    name: string;
  };
}

export interface Client {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  clientId: string;
  createdAt: string;
  updatedAt: string;
  projectUsers?: ProjectUser[];
}

export interface ProjectUser {
  id: string;
  projectId: string;
  userId: string;
  role: 'owner' | 'developer' | 'viewer';
  createdAt: string;
  user?: User;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterDto {
  email: string;
  password: string;
  clientId: string;
  role?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
}

export interface AssignUserDto {
  userId: string;
  role: 'owner' | 'developer' | 'viewer';
}
