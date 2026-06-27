// ─── Enums ───────────────────────────────────────────────────────────────────

export type Plan = 'FREE' | 'SOLO' | 'PRO' | 'AGENCY' | 'ENTERPRISE';

export type OrgRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'EDITOR' | 'VIEWER';

export type SocialPlatform =
  | 'FACEBOOK'
  | 'INSTAGRAM'
  | 'TWITTER'
  | 'LINKEDIN'
  | 'TIKTOK'
  | 'YOUTUBE'
  | 'PINTEREST'
  | 'THREADS'
  | 'GOOGLE_BUSINESS';

export type PostStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'PUBLISHING'
  | 'PUBLISHED'
  | 'FAILED'
  | 'CANCELLED';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';

// ─── Entities ────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  plan: Plan;
  timezone: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workspace {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialAccount {
  id: string;
  workspaceId: string;
  platform: SocialPlatform;
  platformId: string;
  name: string;
  username: string | null;
  avatar: string | null;
  profileUrl: string | null;
  followerCount: number | null;
  followingCount: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  workspaceId: string;
  authorId: string;
  body: string;
  mediaUrls: string[];
  hashtags: string[];
  linkUrl: string | null;
  status: PostStatus;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  aiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── API Response shapes ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Platform character limits ────────────────────────────────────────────────

export const PLATFORM_CHAR_LIMITS: Record<SocialPlatform, number> = {
  FACEBOOK: 63206,
  INSTAGRAM: 2200,
  TWITTER: 280,
  LINKEDIN: 3000,
  TIKTOK: 2200,
  YOUTUBE: 5000,
  PINTEREST: 500,
  THREADS: 500,
  GOOGLE_BUSINESS: 1500,
};

export const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
  TWITTER: 'X (Twitter)',
  LINKEDIN: 'LinkedIn',
  TIKTOK: 'TikTok',
  YOUTUBE: 'YouTube',
  PINTEREST: 'Pinterest',
  THREADS: 'Threads',
  GOOGLE_BUSINESS: 'Google Business',
};
