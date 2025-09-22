import React from 'react';
import { TrendingUp, CheckCircle, AlertCircle, XCircle, Lightbulb } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { formatScore, getScoreColor, getScoreBgColor } from '../../lib/utils';
import type { MatchResult } from '../../types';
import ClassicPieChart from '../charts/ClassicPieChart';

interface MatchResultsProps {
  result: MatchResult;
}

export const MatchResults: React.FC<MatchResultsProps> = ({ result }) => {
  const score = formatScore(result.compatibility_score);
  const scoreColor = getScoreColor(score);
  const scoreBgColor = getScoreBgColor(score);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
            Match Analysis Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Overall Score */}
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${scoreBgColor} mb-4`}>
                <span className={`text-4xl font-bold ${scoreColor}`}>
                  {score}%
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Compatibility Score
              </h3>
              <p className="text-gray-600">
                {result.feedback.overall_assessment}
              </p>
            </div>

            {/* Score Breakdown */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-gray-900 text-center">Score Breakdown</h4>
              <div className="flex justify-center">
                <ClassicPieChart
                  data={[
                    { label: 'Skills', value: result.feedback.skill_score, color: '#2563EB' },
                    { label: 'Experience', value: result.feedback.experience_score, color: '#059669' },
                    { label: 'Education', value: result.feedback.education_score, color: '#EA580C' },
                  ]}
                  size={220}
                  separatorWidth={2}
                  showLabels={true}
                />
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">Skills Match</span>
                    <span className="text-sm font-medium text-gray-900">
                      {result.feedback.skill_score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${result.feedback.skill_score}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">Experience</span>
                    <span className="text-sm font-medium text-gray-900">
                      {result.feedback.experience_score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-emerald-600 h-2 rounded-full" 
                      style={{ width: `${result.feedback.experience_score}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">Education</span>
                    <span className="text-sm font-medium text-gray-900">
                      {result.feedback.education_score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full" 
                      style={{ width: `${result.feedback.education_score}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Matched Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-emerald-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              Matched Skills ({result.matched_skills.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.matched_skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Partial Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Partial Match ({result.partial_skills.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.partial_skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Missing Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <XCircle className="h-5 w-5 mr-2" />
              Missing Skills ({result.missing_skills.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.missing_skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths & Weaknesses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-emerald-600">Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.feedback.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Areas for Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.feedback.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start">
                  <XCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-blue-600">
            <Lightbulb className="h-5 w-5 mr-2" />
            Recommendations for Improvement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {result.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5 mr-3">
                  <span className="text-blue-600 text-sm font-medium">{index + 1}</span>
                </div>
                <span className="text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};