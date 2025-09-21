export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          filename: string;
          file_path: string;
          parsed_content: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          filename: string;
          file_path: string;
          parsed_content: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          filename?: string;
          file_path?: string;
          parsed_content?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      matches: {
        Row: {
          id: string;
          user_id: string;
          resume_id: string;
          job_description: any;
          compatibility_score: number;
          matched_skills: string[];
          partial_skills: string[];
          missing_skills: string[];
          feedback: any;
          recommendations: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          resume_id: string;
          job_description: any;
          compatibility_score: number;
          matched_skills: string[];
          partial_skills: string[];
          missing_skills: string[];
          feedback: any;
          recommendations: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          resume_id?: string;
          job_description?: any;
          compatibility_score?: number;
          matched_skills?: string[];
          partial_skills?: string[];
          missing_skills?: string[];
          feedback?: any;
          recommendations?: string[];
          created_at?: string;
        };
      };
    };
  };
}