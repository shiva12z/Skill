import type { ParsedResume, JobDescription, MatchResult, ResumeAnalysisResult, SuggestedRole, CourseRecommendation } from '../types';

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
  const skills = resume.skills.map((s) => s.toLowerCase());
  const has = (k: string) => skills.some((s) => s.includes(k));

  const roleCandidates: SuggestedRole[] = [];

  if (industry === 'mobile') {
    if (has('react native') || has('android') || has('kotlin') || has('swift') || has('ios')) {
      roleCandidates.push({
        title: 'Mobile Developer',
        match_score: 78,
        reasons: ['Mobile stack skills detected', 'Experience building mobile apps'],
        recommended_courses: [
          { title: 'Android with Kotlin', provider: 'Udemy', url: 'https://www.udemy.com', skill: 'Android/Kotlin' },
          { title: 'iOS Development with Swift', provider: 'Coursera', url: 'https://www.coursera.org', skill: 'iOS/Swift' },
        ],
      });
    }
  }

  if (industry === 'cloud') {
    if (has('aws') || has('gcp') || has('azure') || has('docker') || has('kubernetes') || has('devops')) {
      roleCandidates.push({
        title: 'Cloud/DevOps Engineer',
        match_score: 79,
        reasons: ['Cloud platform experience present', 'CI/CD and containerization experience'],
        recommended_courses: [
          { title: 'AWS Solutions Architect', provider: 'Coursera', url: 'https://www.coursera.org', skill: 'AWS' },
          { title: 'Kubernetes Fundamentals', provider: 'edX', url: 'https://www.edx.org', skill: 'Kubernetes' },
        ],
      });
    }
  }

  if (industry === 'data') {
    if (has('python') || has('pandas') || has('numpy') || has('sql') || has('ml') || has('machine learning')) {
      roleCandidates.push({
        title: 'Data Scientist',
        match_score: 75,
        reasons: ['Python/ML stack present', 'Analytical projects or experience'],
        recommended_courses: [
          { title: 'Machine Learning', provider: 'Coursera', url: 'https://www.coursera.org', skill: 'ML' },
          { title: 'Data Science with Python', provider: 'edX', url: 'https://www.edx.org', skill: 'Data Science' },
        ],
      });
      roleCandidates.push({
        title: 'Data Engineer',
        match_score: 72,
        reasons: ['SQL/ETL experience', 'Cloud or big data tools likely relevant'],
        recommended_courses: [
          { title: 'Data Engineering on Google Cloud', provider: 'Coursera', url: 'https://www.coursera.org', skill: 'Data Engineering' },
        ],
      });
    }
  }

  if (has('react') || has('frontend')) {
    roleCandidates.push({
      title: 'Frontend Developer',
      match_score: 80,
      reasons: ['Experience with React and modern JS', 'Strong UI skills indicated in resume'],
      recommended_courses: [
        { title: 'Advanced React', provider: 'Coursera', url: 'https://www.coursera.org', skill: 'React' },
        { title: 'TypeScript Fundamentals', provider: 'Udemy', url: 'https://www.udemy.com', skill: 'TypeScript' },
      ],
    });
  }

  if (has('node') || has('backend')) {
    roleCandidates.push({
      title: 'Backend Developer',
      match_score: 72,
      reasons: ['Node.js experience present', 'REST APIs development experience'],
      recommended_courses: [
        { title: 'Node.js Microservices', provider: 'Udemy', url: 'https://www.udemy.com', skill: 'Node.js' },
        { title: 'Designing RESTful APIs', provider: 'edX', url: 'https://www.edx.org', skill: 'APIs' },
      ],
    });
  }

  if (has('python') || has('ml') || has('data')) {
    roleCandidates.push({
      title: 'Data Analyst',
      match_score: 68,
      reasons: ['Python/SQL mentioned', 'Analytical experience inferred from resume'],
      recommended_courses: [
        { title: 'SQL for Data Analysis', provider: 'Coursera', url: 'https://www.coursera.org', skill: 'SQL' },
        { title: 'Python Data Analysis', provider: 'edX', url: 'https://www.edx.org', skill: 'Python' },
      ],
    });
  }

  if (roleCandidates.length === 0) {
    roleCandidates.push({
      title: 'Software Engineer',
      match_score: 60,
      reasons: ['General software skills present'],
      recommended_courses: [
        { title: 'System Design Basics', provider: 'Udemy', url: 'https://www.udemy.com', skill: 'System Design' },
      ],
    });
  }

  const skillScore = Math.min(100, skills.length * 8);
  const experienceScore = 70; // heuristic
  const educationScore = 80; // heuristic
  const overall = Math.round(skillScore * 0.5 + experienceScore * 0.3 + educationScore * 0.2);

  return {
    id: Date.now().toString(),
    user_id: userId || '',
    overall_score: overall,
    breakdown: {
      skill_score: Math.round(skillScore),
      experience_score: Math.round(experienceScore),
      education_score: Math.round(educationScore),
    },
    strengths: ['Solid foundation of core skills', 'Relevant experience highlighted'],
    weaknesses: ['Some advanced skills may be missing compared to role expectations'],
    suggested_roles: roleCandidates.sort((a, b) => b.match_score - a.match_score),
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
