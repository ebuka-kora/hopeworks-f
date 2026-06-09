export type UserRole = 'entrepreneur' | 'volunteer' | 'donor' | 'project_manager' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
  bio?: string;
  location?: string;
  website?: string;
  skills?: string[];
  sdgInterests?: number[]; // indices 1-17
  isVerified: boolean;
  govIdUrl?: string; // base64 or placeholder
  verificationStatus: 'none' | 'pending' | 'approved' | 'rejected';
  avatarUrl?: string;
  createdAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  cost: number;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
  evidenceUrls: string[];
  evidenceDescription?: string;
  feedback?: string;
  approvedAt?: string;
}

export interface Project {
  id: string;
  title: string;
  summary: string;
  description: string;
  ownerId: string;
  ownerName: string;
  category: string;
  sdgs: number[]; // UN SDGs numbers 1 to 17
  fundingTarget: number;
  fundingRaised: number;
  coverUrl: string;
  status: 'pending' | 'active' | 'completed' | 'rejected';
  volunteerSlots: number;
  volunteersFilled: number;
  volunteerCompensation: 'unpaid' | 'paid';
  volunteerSkills: string[];
  volunteerDates: string[]; // e.g., ["2026-06-10", "2026-06-11"]
  milestones: Milestone[];
  createdAt: string;
}

export interface Donation {
  id: string;
  projectId: string;
  projectName: string;
  donorId: string;
  donorName: string;
  amount: number;
  isAnonymous: boolean;
  message?: string;
  createdAt: string;
}

export interface VolunteerApplication {
  id: string;
  projectId: string;
  projectName: string;
  volunteerId: string;
  volunteerName: string;
  skills: string[];
  reason: string;
  dates: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'donation' | 'milestone_status' | 'application' | 'verification' | 'assignment' | 'campaign_status';
  projectId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ProjectAssignment {
  id: string;
  projectId: string;
  projectName: string;
  pmId: string;
  pmName: string;
  assignedAt: string;
}

export interface VolunteerAvailability {
  id: string;
  projectId: string;
  volunteerId: string;
  volunteerName: string;
  availableDates: string[];
  notes?: string;
  updatedAt: string;
}
