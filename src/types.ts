// FeeZero Platform Type Definitions

export type Language = 'ko' | 'en' | 'zh' | 'ja' | 'vi' | 'th' | 'es' | 'de';
export type UserType = 'client' | 'freelancer' | 'both';
export type MembershipType = 'free' | 'premium';
export type ProjectStatus = 'open' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
export type BidStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type ContractStatus = 'active' | 'completed' | 'cancelled' | 'disputed';
export type PaymentStatus = 'pending' | 'escrowed' | 'released' | 'refunded';

export interface Bindings {
  DB: D1Database;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  nickname: string;
  phone_number: string;
  country: string;
  user_type: UserType;
  membership_type: MembershipType;
  membership_expires_at?: string;
  profile_photo_url?: string;
  preferred_language: Language;
  usdt_wallet_address?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FreelancerProfile {
  id: number;
  user_id: number;
  title?: string;
  bio?: string;
  hourly_rate?: number;
  project_rate?: number;
  availability?: 'available' | 'busy' | 'unavailable';
  total_projects: number;
  completed_projects: number;
  success_rate: number;
  average_rating: number;
  total_reviews: number;
  response_time_hours: number;
  languages?: string; // JSON string
  certifications?: string; // JSON string
  work_hours?: string; // JSON string
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  parent_id?: number;
  slug: string;
  icon?: string;
  display_order: number;
  is_active: boolean;
  translations?: CategoryTranslation[];
}

export interface CategoryTranslation {
  category_id: number;
  language: Language;
  name: string;
  description?: string;
}

export interface Project {
  id: number;
  client_id: number;
  category_id?: number;
  title: string;
  description: string;
  budget_min?: number;
  budget_max?: number;
  budget_type?: 'fixed' | 'hourly';
  duration_days?: number;
  required_skills?: string; // JSON string
  project_files?: string; // JSON string
  status: ProjectStatus;
  visibility: 'public' | 'private' | 'invited';
  is_urgent: boolean;
  deadline?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectBid {
  id: number;
  project_id: number;
  freelancer_id: number;
  bid_amount: number;
  estimated_days: number;
  proposal_text: string;
  attachment_urls?: string; // JSON string
  status: BidStatus;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: number;
  project_id: number;
  bid_id: number;
  client_id: number;
  freelancer_id: number;
  contract_amount: number;
  platform_fee: number;
  start_date: string;
  end_date?: string;
  status: ContractStatus;
  payment_status: PaymentStatus;
  escrow_txn_hash?: string;
  release_txn_hash?: string;
  contract_terms?: string; // JSON string
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  conversation_id: string;
  sender_id: number;
  receiver_id: number;
  message_type: 'text' | 'file' | 'voice' | 'system';
  message_content: string;
  file_url?: string;
  is_read: boolean;
  third_party_message_id?: string;
  created_at: string;
}

export interface Review {
  id: number;
  contract_id: number;
  reviewer_id: number;
  reviewee_id: number;
  rating: number;
  review_text?: string;
  response_text?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  contract_id?: number;
  user_id: number;
  payment_type: 'deposit' | 'withdrawal' | 'escrow' | 'release' | 'refund' | 'membership';
  amount: number;
  fee_amount: number;
  net_amount: number;
  currency: string;
  txn_hash?: string;
  wallet_from?: string;
  wallet_to?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  third_party_payment_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: number;
  slug: string;
  category_id?: number;
  translations?: SkillTranslation[];
}

export interface SkillTranslation {
  skill_id: number;
  language: Language;
  name: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Translation utilities
export interface Translations {
  [key: string]: {
    [lang in Language]?: string;
  };
}
