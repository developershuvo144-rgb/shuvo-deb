export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  image?: string;
  gallery?: string[];
  features?: string[];
  githubUrl?: string;
  liveUrl?: string;
  category: 'VBA' | 'Bot' | 'ERP' | 'Web';
  tags?: string[];
  technologies?: string[];
  createdAt?: any;
}

export interface Profile {
  fullName: string;
  tagline: string;
  bio: string;
  aboutMe: string;
  address: string;
  email: string;
  phone?: string;
  cvUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  profileImage?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  category?: string;
  icon?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  period: string;
  description: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar?: string;
}

export interface Stat {
  id: string;
  label: string;
  value: string;
  icon: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface Announcement {
  text: string;
  isActive: boolean;
  link?: string;
}

export interface SiteSettings {
  accentColor: string;
  showTerminal: boolean;
  showChatBot: boolean;
  showStats: boolean;
  showTestimonials: boolean;
  showFAQ: boolean;
  enableCustomCursor: boolean;
  enableNoiseEffect: boolean;
  visitorCount: number;
  isMaintenanceMode: boolean;
  defaultLanguage: 'en' | 'bn';
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}
