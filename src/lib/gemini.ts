import type { ParsedResume, JobDescription, MatchResult } from '../types';

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
