import React, { useState, useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '../ui/Button';
import type { ParsedResume } from '../../types';

interface ResumeUploaderProps {
  onResumeUpload: (resume: ParsedResume) => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onResumeUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && isValidFile(file)) {
      processFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidFile(file)) {
      processFile(file);
    }
  };

  const isValidFile = (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF or DOCX file.');
      return false;
    }
    
    if (file.size > maxSize) {
      alert('File size must be less than 10MB.');
      return false;
    }
    
    return true;
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setUploadedFile(file);
    
    try {
      // Simulate file processing and parsing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const parsedResume = await parseResumeFile(file);
      onResumeUpload(parsedResume);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const parseResumeFile = async (file: File): Promise<ParsedResume> => {
    // This is a simplified parser for demo purposes
    // In a real implementation, you would use libraries like pdf-parse or mammoth
    const text = await file.text().catch(() => 'Sample resume content for demo purposes');
    
    // Mock parsing results
    return {
      text: text || 'Sample resume content',
      skills: [
        'JavaScript', 'React', 'Node.js', 'TypeScript', 'Python', 
        'SQL', 'Git', 'AWS', 'Docker', 'REST APIs'
      ],
      experience: [
        {
          title: 'Senior Software Engineer',
          company: 'Tech Corp',
          duration: '2020 - Present',
          description: 'Led development of web applications using React and Node.js',
          skills: ['React', 'Node.js', 'JavaScript', 'TypeScript']
        },
        {
          title: 'Software Engineer',
          company: 'StartupCo',
          duration: '2018 - 2020',
          description: 'Developed full-stack applications and managed databases',
          skills: ['Python', 'SQL', 'Git', 'AWS']
        }
      ],
      education: [
        {
          degree: 'Bachelor of Computer Science',
          institution: 'University of Technology',
          year: '2018',
          gpa: '3.8'
        }
      ],
      contact_info: {
        email: 'john.doe@example.com',
        phone: '(555) 123-4567',
        linkedin: 'linkedin.com/in/johndoe',
        location: 'San Francisco, CA'
      }
    };
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (uploadedFile && !isProcessing) {
    return (
      <div className="border-2 border-emerald-200 rounded-lg p-6 bg-emerald-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-emerald-600 mr-3" />
            <div>
              <p className="font-medium text-emerald-800">{uploadedFile.name}</p>
              <p className="text-sm text-emerald-600">
                {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={removeFile}
            className="text-emerald-600 hover:text-emerald-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragging
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {isProcessing ? (
        <div className="space-y-4">
          <div className="animate-spin mx-auto">
            <Upload className="h-12 w-12 text-blue-600" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">Processing Resume...</p>
            <p className="text-gray-600">Extracting skills, experience, and other details</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Upload className="h-12 w-12 text-gray-400 mx-auto" />
          <div>
            <p className="text-lg font-medium text-gray-900">
              Drop your resume here, or click to browse
            </p>
            <p className="text-gray-600 mt-2">
              Supports PDF and DOCX files up to 10MB
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose File
          </Button>
        </div>
      )}
    </div>
  );
};