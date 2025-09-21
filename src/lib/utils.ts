import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatScore(score: number) {
  return Math.round(score);
}

export function getScoreColor(score: number) {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

export function getScoreBgColor(score: number) {
  if (score >= 80) return 'bg-emerald-100';
  if (score >= 60) return 'bg-yellow-100';
  return 'bg-red-100';
}