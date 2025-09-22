import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import ClassicPieChart from '../charts/ClassicPieChart';
import type { ResumeAnalysisResult } from '../../types';
import { formatScore, getScoreBgColor, getScoreColor } from '../../lib/utils';
import { Lightbulb, GraduationCap, BadgeCheck } from 'lucide-react';

interface ResumeInsightsProps {
  analysis: ResumeAnalysisResult;
}

export const ResumeInsights: React.FC<ResumeInsightsProps> = ({ analysis }) => {
  const score = formatScore(analysis.overall_score);
  const scoreColor = getScoreColor(score);
  const scoreBg = getScoreBgColor(score);
  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const pieData = [
    { label: 'Skills', value: analysis.breakdown.skill_score, color: '#2563EB' },
    { label: 'Experience', value: analysis.breakdown.experience_score, color: '#059669' },
    { label: 'Education', value: analysis.breakdown.education_score, color: '#EA580C' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <BadgeCheck className="h-6 w-6 text-emerald-600 mr-2" />
            Resume Fit & Role Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${scoreBg} mb-4`}>
                <span className={`text-4xl font-bold ${scoreColor}`}>{score}%</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Overall Readiness</h3>
              <p className="text-gray-600 mt-1">How ready your resume is for typical roles</p>
            </div>

            <div className="flex justify-center">
              <ClassicPieChart
                data={pieData.map((d) => ({ label: d.label, value: d.value, color: d.color }))}
                size={220}
                separatorWidth={2}
                showLabels={true}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Suggested Roles</h2>
        <button
          className="text-sm text-blue-600 hover:underline"
          onClick={() => setCompareMode((v) => !v)}
        >
          {compareMode ? 'Exit Compare' : 'Compare Roles'}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {analysis.suggested_roles.map((role, idx) => (
          <Card key={`${role.title}-${idx}`}>
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center justify-between">
                <span>{role.title} • {role.match_score}% match</span>
                {compareMode && (
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selected.has(idx)}
                      onChange={(e) => {
                        const next = new Set(selected);
                        if (e.target.checked) next.add(idx); else next.delete(idx);
                        setSelected(next);
                      }}
                    />
                    <span className="text-gray-600">Select</span>
                  </label>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
                {role.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>

              {role.recommended_courses.length > 0 && (
                <div>
                  <div className="flex items-center mb-2 text-emerald-700 font-semibold">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Recommended Courses
                  </div>
                  <ul className="space-y-2">
                    {role.recommended_courses.map((c, i) => (
                      <li key={i} className="text-sm">
                        <a href={c.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">
                          {c.title}
                        </a>
                        <span className="text-gray-500"> • {c.provider} • Improves: {c.skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {compareMode && selected.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from(selected).map((idx) => {
                const role = analysis.suggested_roles[idx];
                if (!role) return null;
                return (
                  <div key={`compare-${idx}`} className="border rounded-lg p-4">
                    <div className="flex items-baseline justify-between">
                      <h4 className="font-semibold text-gray-900">{role.title}</h4>
                      <span className="text-blue-600 font-bold">{role.match_score}%</span>
                    </div>
                    <ul className="mt-2 text-sm text-gray-700 space-y-1 list-disc list-inside">
                      {role.reasons.slice(0, 3).map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                    {role.recommended_courses.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs uppercase text-gray-500 mb-1">Courses</div>
                        <ul className="space-y-1">
                          {role.recommended_courses.slice(0, 3).map((c, i) => (
                            <li key={i} className="text-sm">
                              <a href={c.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                {c.title}
                              </a>
                              <span className="text-gray-500"> • {c.provider}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {(analysis.strengths.length > 0 || analysis.weaknesses.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-blue-600">
              <Lightbulb className="h-5 w-5 mr-2" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-emerald-700 mb-2">Strengths</h4>
                <ul className="space-y-1 text-gray-700 list-disc list-inside">
                  {analysis.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-700 mb-2">Areas to Improve</h4>
                <ul className="space-y-1 text-gray-700 list-disc list-inside">
                  {analysis.weaknesses.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResumeInsights;
