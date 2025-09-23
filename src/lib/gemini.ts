import type { ParsedResume, JobDescription, MatchResult, ResumeAnalysisResult, SuggestedRole, CourseRecommendation } from '../types';
import { getCoursesForSkills } from './courses';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-1.5-flash-latest';

export const isGeminiConfigured = () => Boolean(GEMINI_API_KEY);

function buildPrompt(resume: ParsedResume, jd: JobDescription) {
  return `You are an expert ATS (Applicant Tracking System) analyzer.
Analyze the given RESUME against the JOB_DESCRIPTION and produce a strict JSON response that follows this TypeScript type exactly:

interface Output {
  compatibility_score: number; // 0-100 integer
  matched_skills: string[]; // exact or near-exact overlaps
  partial_skills: string[]; // related or partially matching skills
  missing_skills: string[]; // skills from JD missing in resume
  feedback: {
    strengths: string[];
    weaknesses: string[];
    skill_score: number; // 0-100 integer
    experience_score: number; // 0-100 integer
    education_score: number; // 0-100 integer
    overall_assessment: string; // 1-2 sentences
  };
  recommendations: string[]; // actionable, specific
}

Rules:
- Only output valid JSON, no markdown fences, no commentary.
- compatibility_score is your ATS-style overall score considering skills, experience, and education.
- Ensure all arrays exist (can be empty) and numbers are integers 0-100.

RESUME:
${JSON.stringify(resume, null, 2)}

JOB_DESCRIPTION:
${JSON.stringify(jd, null, 2)}
`;
}

function buildResumePrompt(resume: ParsedResume, industry?: string) {
  return `You are a career coach and ATS expert.
Analyze the given RESUME and produce a strict JSON response following this exact TypeScript type:

interface Output {
  overall_score: number; // 0-100 integer composite fitness for common roles derived from resume
  breakdown: {
    skill_score: number; // 0-100
    experience_score: number; // 0-100
    education_score: number; // 0-100
  };
  strengths: string[];
  weaknesses: string[];
  suggested_roles: Array<{
    title: string; // e.g., Frontend Developer
    match_score: number; // 0-100 integer
    reasons: string[]; // 1-3 bullet reasons referencing resume evidence
    recommended_courses: Array<{
      title: string;
      provider: string; // e.g., Coursera, Udemy, edX
      url: string;
      skill: string; // skill addressed by the course
    }>;
  }>;
}

Rules:
- Only output valid JSON, no markdown fences or commentary.
- All numeric fields must be integers between 0 and 100.
- If uncertain, make reasonable defaults but keep the structure intact.

Industry context (prioritize roles and courses relevant to this industry): ${industry || 'general'}

RESUME:
${JSON.stringify(resume, null, 2)}
`;
}

export async function analyzeResumeWithGemini(
  resume: ParsedResume,
  userId: string | undefined,
  industry?: string
): Promise<ResumeAnalysisResult> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in .env');
  }

  const prompt = buildResumePrompt(resume, industry);
  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    throw new Error(`Gemini API error: ${resp.status} ${resp.statusText} ${errText}`);
  }

  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  if (!text) {
    throw new Error('Gemini API returned no content');
  }

  const parsed = extractJson(text);

  const toInt = (n: any) => {
    const x = Math.round(Number(n));
    return Number.isFinite(x) ? Math.max(0, Math.min(100, x)) : 0;
  };

  const sanitizeCourses = (arr: any[]): CourseRecommendation[] =>
    Array.isArray(arr)
      ? arr.map((c) => ({
          title: String(c?.title || ''),
          provider: String(c?.provider || ''),
          url: String(c?.url || ''),
          skill: String(c?.skill || ''),
        }))
      : [];

  const sanitizeRoles = (arr: any[]): SuggestedRole[] =>
    Array.isArray(arr)
      ? arr.map((r) => ({
          title: String(r?.title || ''),
          match_score: toInt(r?.match_score),
          reasons: Array.isArray(r?.reasons) ? r.reasons.map(String) : [],
          recommended_courses: sanitizeCourses(r?.recommended_courses || []),
        }))
      : [];

  const result: ResumeAnalysisResult = {
    id: Date.now().toString(),
    user_id: userId || '',
    overall_score: toInt(parsed?.overall_score),
    breakdown: {
      skill_score: toInt(parsed?.breakdown?.skill_score),
      experience_score: toInt(parsed?.breakdown?.experience_score),
      education_score: toInt(parsed?.breakdown?.education_score),
    },
    strengths: Array.isArray(parsed?.strengths) ? parsed.strengths.map(String) : [],
    weaknesses: Array.isArray(parsed?.weaknesses) ? parsed.weaknesses.map(String) : [],
    suggested_roles: sanitizeRoles(parsed?.suggested_roles || []).sort((a, b) => b.match_score - a.match_score),
    created_at: new Date().toISOString(),
  };

  return result;
}

// Heuristic fallback if Gemini is not configured
export function analyzeResumeHeuristic(resume: ParsedResume, userId?: string, industry?: string): ResumeAnalysisResult {
  // Normalize skills from resume top-level and experience items
  const norm = (s: string) => s.trim().toLowerCase();
  const baseSkills = (resume.skills || []).map(norm);
  const expSkills = (resume.experience || []).flatMap((e) => (e.skills || []).map(norm));
  const allSkills = Array.from(new Set<string>([...baseSkills, ...expSkills]));
  const has = (kw: string | RegExp) =>
    allSkills.some((s) => (kw instanceof RegExp ? kw.test(s) : s.includes(kw)));

  type RoleDef = {
    title: string;
    required: string[]; // core skills
    niceToHave: string[]; // bonus
    industry?: 'general' | 'cloud' | 'mobile' | 'data';
  };

  const catalog: RoleDef[] = [
    { title: 'Frontend Developer', required: ['react', 'javascript', 'html', 'css'], niceToHave: ['typescript', 'next.js', 'redux'], industry: 'general' },
    { title: 'Backend Developer', required: ['node', 'api', 'rest'], niceToHave: ['express', 'postgres', 'mongodb', 'docker'], industry: 'general' },
    { title: 'Full Stack Developer', required: ['react', 'node'], niceToHave: ['typescript', 'next.js', 'postgres', 'mongodb'], industry: 'general' },
    { title: 'Cloud/DevOps Engineer', required: ['docker', 'kubernetes'], niceToHave: ['aws', 'azure', 'gcp', 'ci/cd', 'terraform'], industry: 'cloud' },
    { title: 'Data Scientist', required: ['python', 'ml', 'pandas'], niceToHave: ['numpy', 'scikit', 'tensorflow', 'pytorch', 'sql'], industry: 'data' },
    { title: 'Data Engineer', required: ['sql'], niceToHave: ['spark', 'airflow', 'kafka', 'aws', 'gcp', 'azure'], industry: 'data' },
    { title: 'Data Analyst', required: ['sql'], niceToHave: ['excel', 'tableau', 'power bi', 'python', 'pandas'], industry: 'data' },
    { title: 'Mobile Developer', required: ['react native'], niceToHave: ['android', 'kotlin', 'swift', 'ios'], industry: 'mobile' },
    { title: 'Software Engineer', required: ['git'], niceToHave: ['algorithms', 'data structures', 'system design'], industry: 'general' },
  ];

  const scored: SuggestedRole[] = catalog.map((role) => {
    // Compute coverage of required and nice-to-have using substring match
    const presentReq = role.required.filter((k) => has(k));
    const missingReq = role.required.filter((k) => !has(k));
    const presentNice = role.niceToHave.filter((k) => has(k));

    // Required contributes 70% of score, nice-to-have contributes 30%
    const reqScore = role.required.length > 0 ? (presentReq.length / role.required.length) * 70 : 0;
    const niceScore = role.niceToHave.length > 0 ? (presentNice.length / role.niceToHave.length) * 30 : 0;
    let match = Math.round(Math.min(100, reqScore + niceScore));

    // Industry alignment small boost
    if (industry && role.industry && industry === role.industry) {
      match = Math.min(100, match + 5);
    }

    const reasons: string[] = [];
    if (presentReq.length > 0) {
      reasons.push(`Core strengths: ${presentReq.slice(0, 3).join(', ')}`);
    }
    if (presentNice.length > 0) {
      reasons.push(`Bonus skills: ${presentNice.slice(0, 3).join(', ')}`);
    }
    if (missingReq.length > 0) {
      reasons.push(`Missing key skills: ${missingReq.slice(0, 2).join(', ')}`);
    }

    // Courses based on missing required skills primarily
    const courses = getCoursesForSkills(missingReq.length > 0 ? missingReq : role.niceToHave.filter((k) => !presentNice.includes(k)).slice(0, 2), industry, 2);

    const suggested: SuggestedRole = {
      title: role.title,
      match_score: match,
      reasons,
      recommended_courses: courses,
    };
    return suggested;
  });

  // Filter out very low scores and sort
  let roleCandidates = scored
    .filter((r) => r.match_score >= 40)
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 5);

  if (roleCandidates.length === 0) {
    roleCandidates = scored.sort((a, b) => b.match_score - a.match_score).slice(0, 3);
  }

  // Compute breakdown heuristics
  const uniqueSkillCount = allSkills.length;
  const topScore = roleCandidates[0]?.match_score ?? 50;
  const avgRoleScore = Math.round(
    roleCandidates.reduce((acc, r) => acc + r.match_score, 0) / (roleCandidates.length || 1)
  );
  const skillScore = Math.min(95, 20 + uniqueSkillCount * 5); // saturates at 95
  const experienceScore = Math.min(90, 50 + (resume.experience?.length || 0) * 10);
  const educationScore = 75; // simple heuristic baseline
  const overall = Math.round(skillScore * 0.4 + avgRoleScore * 0.4 + educationScore * 0.2);

  const strengths: string[] = [];
  if (topScore >= 70) strengths.push('Strong fit for at least one role based on skill coverage');
  if (uniqueSkillCount >= 6) strengths.push('Broad set of relevant skills');

  const weaknesses: string[] = [];
  if (avgRoleScore < 65) weaknesses.push('Some key skills for target roles are missing');

  return {
    id: Date.now().toString(),
    user_id: userId || '',
    overall_score: overall,
    breakdown: {
      skill_score: Math.round(skillScore),
      experience_score: Math.round(experienceScore),
      education_score: Math.round(educationScore),
    },
    strengths,
    weaknesses,
    suggested_roles: roleCandidates,
    created_at: new Date().toISOString(),
  };
}

function extractJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch (_) {
    // Try to extract JSON between first { and last }
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      const candidate = text.slice(start, end + 1);
      return JSON.parse(candidate);
    }
    throw new Error('Failed to parse JSON from model response');
  }
}

export async function analyzeMatchWithGemini(
  resume: ParsedResume,
  jobDescription: JobDescription,
  userId: string | undefined
): Promise<MatchResult> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in .env');
  }

  const prompt = buildPrompt(resume, jobDescription);

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    throw new Error(`Gemini API error: ${resp.status} ${resp.statusText} ${errText}`);
  }

  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  if (!text) {
    throw new Error('Gemini API returned no content');
  }

  const parsed = extractJson(text);

  // Coerce and validate outputs
  const toInt = (n: any) => {
    const x = Math.round(Number(n));
    return Number.isFinite(x) ? Math.max(0, Math.min(100, x)) : 0;
  };

  const result: MatchResult = {
    id: Date.now().toString(),
    user_id: userId || '',
    resume_id: 'current-resume',
    job_description: jobDescription,
    compatibility_score: toInt(parsed.compatibility_score),
    matched_skills: Array.isArray(parsed.matched_skills) ? parsed.matched_skills.map(String) : [],
    partial_skills: Array.isArray(parsed.partial_skills) ? parsed.partial_skills.map(String) : [],
    missing_skills: Array.isArray(parsed.missing_skills) ? parsed.missing_skills.map(String) : [],
    feedback: {
      strengths: Array.isArray(parsed?.feedback?.strengths) ? parsed.feedback.strengths.map(String) : [],
      weaknesses: Array.isArray(parsed?.feedback?.weaknesses) ? parsed.feedback.weaknesses.map(String) : [],
      skill_score: toInt(parsed?.feedback?.skill_score),
      experience_score: toInt(parsed?.feedback?.experience_score),
      education_score: toInt(parsed?.feedback?.education_score),
      overall_assessment: String(parsed?.feedback?.overall_assessment || ''),
    },
    recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.map(String) : [],
    created_at: new Date().toISOString(),
  };

  return result;
}
