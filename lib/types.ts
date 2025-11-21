export interface Project {
  id: string;
  projectName: string;
  summary?: string | null;
  status?: string | null;
  plannedStart?: Date | null;
  plannedEnd?: Date | null;
  percentComplete?: string | null;
  createdAt?: Date | null;
}

export interface ProjectWithAssignees extends Project {
  assignees: Array<{
    id: string;
    name: string;
    email: string;
    role: string | null;
  }>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string | null;
}