import React from 'react';
import { Clock, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { formatDate, formatScore, getScoreColor } from '../../lib/utils';
import type { MatchResult } from '../../types';

interface MatchHistoryProps {
  matches: MatchResult[];
}

export const MatchHistory: React.FC<MatchHistoryProps> = ({ matches }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2 text-gray-600" />
          Recent Matches ({matches.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {match.job_description.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {match.job_description.company}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getScoreColor(match.compatibility_score)}`}>
                    {formatScore(match.compatibility_score)}%
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatDate(match.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <div className="flex items-center text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                  <span className="font-medium">{match.matched_skills.length}</span>
                  <span className="ml-1">matched</span>
                </div>
                <div className="flex items-center text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                  <span className="font-medium">{match.partial_skills.length}</span>
                  <span className="ml-1">partial</span>
                </div>
                <div className="flex items-center text-xs text-red-700 bg-red-100 px-2 py-1 rounded">
                  <span className="font-medium">{match.missing_skills.length}</span>
                  <span className="ml-1">missing</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 truncate flex-1 mr-4">
                  {match.feedback.overall_assessment}
                </p>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                  View Details
                  <ExternalLink className="h-3 w-3 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};