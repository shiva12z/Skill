import React, { useState, useRef } from 'react';
import { Upload, FileText, Briefcase, BarChart3 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { ResumeUploader } from './ResumeUploader';
import { JobDescriptionForm } from './JobDescriptionForm';
import { MatchResults } from './MatchResults';
import { MatchHistory } from './MatchHistory';
import type { ParsedResume, JobDescription, MatchResult } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const [currentResume, setCurrentResume] = useState<ParsedResume | null>(null);
  const [currentJobDescription, setCurrentJobDescription] = useState<JobDescription | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchHistory, setMatchHistory] = useState<MatchResult[]>([]);
  const { user } = useAuth();

  const handleResumeUpload = async (resume: ParsedResume) => {
    setCurrentResume(resume);
    setMatchResult(null);
  };

  const handleJobDescriptionSubmit = (jobDescription: JobDescription) => {
    setCurrentJobDescription(jobDescription);
    setMatchResult(null);
  };

  const handleAnalyze = async () => {
    if (!currentResume || !currentJobDescription) return;

    setIsAnalyzing(true);
    
    try {
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const result = await analyzeMatch(currentResume, currentJobDescription);
      setMatchResult(result);
      
      // Add to history
      setMatchHistory(prev => [result, ...prev]);
      
    } catch (error) {
      console.error('Error analyzing match:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeMatch = async (resume: ParsedResume, jobDescription: JobDescription): Promise<MatchResult> => {
    // Simulate AI analysis with realistic scoring
    const resumeSkills = resume.skills.map(s => s.toLowerCase());
    const jobSkills = jobDescription.skills.map(s => s.toLowerCase());
    
    const matchedSkills = resumeSkills.filter(skill => 
      jobSkills.some(jobSkill => 
        jobSkill.includes(skill) || skill.includes(jobSkill)
      )
    );
    
    const partialSkills = resumeSkills.filter(skill => 
      jobSkills.some(jobSkill => 
        calculateSimilarity(skill, jobSkill) > 0.6 && calculateSimilarity(skill, jobSkill) < 1
      )
    );
    
    const missingSkills = jobSkills.filter(jobSkill => 
      !resumeSkills.some(skill => 
        jobSkill.includes(skill) || skill.includes(jobSkill)
      )
    );

    const skillScore = Math.min((matchedSkills.length + partialSkills.length * 0.5) / jobSkills.length * 100, 100);
    const experienceScore = Math.random() * 30 + 70; // Simulate experience analysis
    const educationScore = Math.random() * 20 + 80; // Simulate education analysis
    
    const compatibilityScore = Math.round(skillScore * 0.5 + experienceScore * 0.3 + educationScore * 0.2);

    return {
      id: Date.now().toString(),
      user_id: user?.id || '',
      resume_id: 'current-resume',
      job_description: jobDescription,
      compatibility_score: compatibilityScore,
      matched_skills: matchedSkills,
      partial_skills: partialSkills,
      missing_skills: missingSkills,
      feedback: {
        strengths: generateStrengths(matchedSkills, compatibilityScore),
        weaknesses: generateWeaknesses(missingSkills),
        skill_score: Math.round(skillScore),
        experience_score: Math.round(experienceScore),
        education_score: Math.round(educationScore),
        overall_assessment: generateOverallAssessment(compatibilityScore),
      },
      recommendations: generateRecommendations(missingSkills, compatibilityScore),
      created_at: new Date().toISOString(),
    };
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = getEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const getEditDistance = (str1: string, str2: string): number => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const generateStrengths = (matchedSkills: string[], score: number): string[] => {
    const strengths = [];
    
    if (matchedSkills.length > 0) {
      strengths.push(`Strong alignment with ${matchedSkills.length} required skills`);
    }
    
    if (score >= 80) {
      strengths.push('Excellent overall compatibility with job requirements');
    } else if (score >= 60) {
      strengths.push('Good foundation matching job requirements');
    }
    
    strengths.push('Well-structured resume with clear experience progression');
    
    return strengths;
  };

  const generateWeaknesses = (missingSkills: string[]): string[] => {
    const weaknesses = [];
    
    if (missingSkills.length > 0) {
      weaknesses.push(`Missing ${missingSkills.length} key skills mentioned in job description`);
    }
    
    if (missingSkills.length > 5) {
      weaknesses.push('Significant skill gaps that may need addressing');
    }
    
    return weaknesses;
  };

  const generateOverallAssessment = (score: number): string => {
    if (score >= 80) {
      return 'Excellent match! Your resume strongly aligns with the job requirements.';
    } else if (score >= 60) {
      return 'Good match with room for improvement. Consider addressing the missing skills.';
    } else {
      return 'Moderate match. Focus on developing the missing skills and highlighting relevant experience.';
    }
  };

  const generateRecommendations = (missingSkills: string[], score: number): string[] => {
    const recommendations = [];
    
    if (missingSkills.length > 0) {
      recommendations.push(`Consider adding these skills to your resume: ${missingSkills.slice(0, 3).join(', ')}`);
    }
    
    if (score < 70) {
      recommendations.push('Tailor your resume to better highlight relevant experience');
      recommendations.push('Use keywords from the job description in your resume');
    }
    
    recommendations.push('Quantify your achievements with specific metrics and results');
    
    return recommendations;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Upload your resume and analyze it against job descriptions</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Resume Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Resume Upload
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResumeUploader onResumeUpload={handleResumeUpload} />
              {currentResume && (
                <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-emerald-800 font-medium">✓ Resume uploaded successfully</p>
                  <p className="text-emerald-600 text-sm mt-1">
                    Found {currentResume.skills.length} skills and {currentResume.experience.length} experience entries
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-emerald-600" />
                Job Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <JobDescriptionForm onSubmit={handleJobDescriptionSubmit} />
              {currentJobDescription && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-800 font-medium">✓ Job description analyzed</p>
                  <p className="text-blue-600 text-sm mt-1">
                    {currentJobDescription.title} at {currentJobDescription.company}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Analyze Button */}
        {currentResume && currentJobDescription && (
          <div className="mb-8 text-center">
            <Button
              size="lg"
              onClick={handleAnalyze}
              isLoading={isAnalyzing}
              className="px-8"
            >
              <BarChart3 className="h-5 w-5 mr-2" />
              {isAnalyzing ? 'Analyzing Match...' : 'Analyze Compatibility'}
            </Button>
          </div>
        )}

        {/* Results */}
        {matchResult && (
          <div className="mb-8">
            <MatchResults result={matchResult} />
          </div>
        )}

        {/* Match History */}
        {matchHistory.length > 0 && (
          <MatchHistory matches={matchHistory} />
        )}
      </div>
    </div>
  );
};