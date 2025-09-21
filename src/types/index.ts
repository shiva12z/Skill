export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  filename: string;
  file_path: string;
  parsed_content: ParsedResume;
  created_at: string;
  updated_at: string;
}

export interface ParsedResume {
  text: string;
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  contact_info: ContactInfo;
}

export interface ExperienceItem {
  title: string;
  company: string;
  duration: string;
  description: string;
  skills: string[];
}

export interface EducationItem {
  degree: string;
  institution: string;
  year: string;
  gpa?: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  linkedin?: string;
  location?: string;
}

export interface JobDescription {
  title: string;
  company: string;
  requirements: string[];
  skills: string[];
  experience_required: string;
  description: string;
}

export interface MatchResult {
  id: string;
  user_id: string;
  resume_id: string;
  job_description: JobDescription;
  compatibility_score: number;
  matched_skills: string[];
  partial_skills: string[];
  missing_skills: string[];
  feedback: MatchFeedback;
  recommendations: string[];
  created_at: string;
}

export interface MatchFeedback {
  strengths: string[];
  weaknesses: string[];
  skill_score: number;
  experience_score: number;
  education_score: number;
  overall_assessment: string;
}

export interface SkillCategory {
  category: string;
  skills: string[];
}