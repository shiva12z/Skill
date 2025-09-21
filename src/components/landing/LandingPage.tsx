import React from 'react';
import { FileText, Target, TrendingUp, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const features = [
    {
      icon: Target,
      title: 'Intelligent Matching',
      description: 'Our AI analyzes your resume against job descriptions using advanced NLP and semantic understanding.',
    },
    {
      icon: TrendingUp,
      title: 'Dynamic Scoring',
      description: 'Get detailed compatibility scores with breakdowns of skills, experience, and qualifications.',
    },
    {
      icon: FileText,
      title: 'Actionable Insights',
      description: 'Receive personalized recommendations to improve your resume for specific job applications.',
    },
    {
      icon: Users,
      title: 'Career Growth',
      description: 'Track your progress and see how your profile matches evolve over time.',
    },
  ];

  const benefits = [
    'Upload resumes in PDF or DOCX format',
    'Analyze job descriptions from any source',
    'Get instant compatibility scores',
    'Receive skill gap analysis',
    'Access personalized recommendations',
    'Track your matching history',
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-emerald-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <FileText className="h-16 w-16" />
            </div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Match Your Resume to <br />
              <span className="text-emerald-300">Any Job Description</span>
            </h1>
            <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
              SkillSyncer uses advanced AI to analyze your resume against job requirements, 
              providing instant compatibility scores and actionable feedback to help you land your dream job.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={onGetStarted}
                className="bg-white text-blue-600 hover:bg-gray-50 shadow-lg"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white/10"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose SkillSyncer?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our intelligent platform goes beyond simple keyword matching to provide deep insights 
              into your resume's compatibility with any job description.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} hover className="text-center h-full">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <feature.icon className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Everything you need to optimize your job search
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                SkillSyncer provides comprehensive analysis and actionable insights 
                to help you stand out in today's competitive job market.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-2xl p-8">
              <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Compatibility Score</h4>
                  <span className="text-2xl font-bold text-emerald-600">87%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-3 rounded-full" style={{ width: '87%' }}></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Skills Match</span>
                  <span className="text-sm font-medium text-emerald-600">92%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Experience</span>
                  <span className="text-sm font-medium text-blue-600">85%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Education</span>
                  <span className="text-sm font-medium text-yellow-600">78%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">
            Ready to optimize your job search?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of professionals who have improved their job search success with SkillSyncer.
          </p>
          <Button 
            size="lg" 
            onClick={onGetStarted}
            className="bg-white text-blue-600 hover:bg-gray-50 shadow-lg"
          >
            Start Matching Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};