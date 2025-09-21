import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { JobDescription } from '../../types';

interface JobDescriptionFormProps {
  onSubmit: (jobDescription: JobDescription) => void;
}

export const JobDescriptionForm: React.FC<JobDescriptionFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !company.trim() || !description.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const parsedJobDescription = parseJobDescription(title, company, description);
      onSubmit(parsedJobDescription);
    } catch (error) {
      console.error('Error processing job description:', error);
      alert('Error processing job description. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const parseJobDescription = (title: string, company: string, description: string): JobDescription => {
    // Simple keyword extraction for demo purposes
    const skillKeywords = [
      'javascript', 'react', 'node', 'python', 'java', 'sql', 'git', 'aws', 'docker',
      'typescript', 'angular', 'vue', 'express', 'mongodb', 'postgresql', 'redis',
      'kubernetes', 'jenkins', 'terraform', 'graphql', 'rest api', 'microservices',
      'agile', 'scrum', 'ci/cd', 'devops', 'machine learning', 'ai', 'data science'
    ];

    const lowerDescription = description.toLowerCase();
    const foundSkills = skillKeywords.filter(skill => 
      lowerDescription.includes(skill)
    );

    // Extract requirements (simplified)
    const requirements = description
      .split(/[.!?]/)
      .filter(sentence => 
        sentence.toLowerCase().includes('require') || 
        sentence.toLowerCase().includes('must have') ||
        sentence.toLowerCase().includes('need')
      )
      .slice(0, 5);

    // Extract experience requirement
    const experienceMatch = description.match(/(\d+)\s*\+?\s*years?\s*(of\s+)?experience/i);
    const experienceRequired = experienceMatch ? `${experienceMatch[1]}+ years` : 'Not specified';

    return {
      title,
      company,
      description,
      requirements,
      skills: foundSkills,
      experience_required: experienceRequired,
    };
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Job Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Senior Frontend Developer"
        required
      />
      
      <Input
        label="Company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        placeholder="e.g. Google"
        required
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Job Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={8}
          placeholder="Paste the full job description here..."
          required
        />
      </div>
      
      <Button
        type="submit"
        isLoading={isProcessing}
        className="w-full"
      >
        {isProcessing ? 'Analyzing Description...' : 'Analyze Job Description'}
      </Button>
    </form>
  );
};