import React, { useState } from 'react';
import { User, Mail, Calendar, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // In a real app, you would update the user profile here
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const mockStats = {
    totalMatches: 12,
    averageScore: 78,
    bestScore: 92,
    resumesUploaded: 3,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account and view your progress</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isEditing ? (
                    <>
                      <Input
                        label="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                      <div className="flex space-x-3">
                        <Button onClick={handleSave} isLoading={isLoading}>
                          Save Changes
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsEditing(false)}
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          <p className="text-gray-900">
                            {user?.user_metadata?.full_name || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <p className="text-gray-900">{user?.email}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Member Since
                        </label>
                        <p className="text-gray-900">
                          {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                        className="mt-4"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Your SkillSyncer Journey</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {mockStats.totalMatches}
                    </div>
                    <div className="text-sm text-blue-800">Total Matches</div>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <div className="text-3xl font-bold text-emerald-600 mb-2">
                      {mockStats.averageScore}%
                    </div>
                    <div className="text-sm text-emerald-800">Average Score</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {mockStats.bestScore}%
                    </div>
                    <div className="text-sm text-orange-800">Best Score</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {mockStats.resumesUploaded}
                    </div>
                    <div className="text-sm text-purple-800">Resumes Uploaded</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" size="sm">
                  Upload New Resume
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  Export Match History
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  Download Resume Tips
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Matched resume with Software Engineer role</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Updated profile information</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Uploaded new resume version</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};