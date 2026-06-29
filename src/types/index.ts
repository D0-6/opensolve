export interface Problem {
  problemId: string;
  title: string;
  description: string;
  prizeAmount: number;
  tags: string[];
  postedAt: string;
  postedByOrgId: string;
  verified: boolean;
  status: "OPEN" | "PENDING_ESCROW" | "CLOSED" | "EVALUATING";
  paymentStatus?: "UNFUNDED" | "FUNDED" | "RELEASED" | "NA";
  escrowSessionId?: string;
  resourceLinks?: string[];
  requiredSkills?: string[];
  allowedCountries?: string[];
  notificationSent?: boolean;
  sourceUrl?: string;
  communityUrl?: string;
  judgingCriteria?: string;
  prizeBreakdown?: { place: string; amount: number }[];
  source?: string;
  domain?: string;
  deadline?: string;
  prizeType?: string;
  scoutId?: string;
  scoutName?: string;
  scoutBountyPercent?: number;
  maxTeamSize?: number;
  requirements?: string;
  announcements?: Announcement[];
}

export interface Announcement {
  id: string;
  body: string;
  postedAt: string;
}

export interface TeamMember {
  userId: string;
  name: string;
}

export interface Evaluation {
  submissionKey: string;
  evaluatorId: string;
  scores: {
    innovation: number;
    technical: number;
    design: number;
  };
  comments?: string;
  evaluatedAt: string;
}

export interface Submission {
  problemId: string;
  rankKey: string;
  userId: string;
  repoUrl: string;
  demoUrl?: string;
  notes?: string;
  submittedAt: string;
  teamMembers?: TeamMember[];
  score?: number;
  writeup?: string;
  githubUrl?: string;
  studentName?: string;
  techStack?: string[];
  evaluationStatus?: string;
  repoName?: string;
  evaluations?: Evaluation[];
  meanScore?: number;
}

export interface Application {
  problemId: string;
  userId: string;
  appliedAt: string;
  resumeUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  notes?: string;
  teamMembers?: TeamMember[];
}

export interface Profile {
  userId: string;
  githubUrl?: string;
  linkedinUrl?: string;
  skills?: string[];
}

export interface Organization {
  orgId: string;
  name: string;
  website?: string;
  logoUrl?: string;
}
