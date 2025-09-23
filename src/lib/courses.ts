import type { CourseRecommendation } from '../types';

// Basic curated mapping from skills to reputable course links
// Keep keys lowercase for matching
const COURSE_MAP: Record<string, CourseRecommendation[]> = {
  'react': [
    { title: 'React - The Complete Guide', provider: 'Udemy', url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/', skill: 'React' },
    { title: 'Advanced React', provider: 'Coursera', url: 'https://www.coursera.org/specializations/advanced-react', skill: 'React' },
  ],
  'next.js': [
    { title: 'Next.js by Vercel - Learn', provider: 'Vercel', url: 'https://nextjs.org/learn', skill: 'Next.js' },
    { title: 'Full-Stack Web Development with Next.js', provider: 'Udemy', url: 'https://www.udemy.com/topic/nextjs/', skill: 'Next.js' },
  ],
  'typescript': [
    { title: 'TypeScript for Professionals', provider: 'Frontend Masters', url: 'https://frontendmasters.com/courses/typescript/', skill: 'TypeScript' },
    { title: 'TypeScript Fundamentals', provider: 'Pluralsight', url: 'https://www.pluralsight.com/courses/typescript', skill: 'TypeScript' },
  ],
  'javascript': [
    { title: 'JavaScript Algorithms and Data Structures', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', skill: 'JavaScript' },
    { title: 'Modern JavaScript', provider: 'Udemy', url: 'https://www.udemy.com/topic/modern-javascript/', skill: 'JavaScript' },
  ],
  'node': [
    { title: 'Node.js, Express, MongoDB & More: The Complete Bootcamp', provider: 'Udemy', url: 'https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/', skill: 'Node.js' },
    { title: 'Server-side Development with NodeJS', provider: 'Coursera', url: 'https://www.coursera.org/learn/server-side-nodejs', skill: 'Node.js' },
  ],
  'node.js': [
    { title: 'Node.js, Express, MongoDB & More: The Complete Bootcamp', provider: 'Udemy', url: 'https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/', skill: 'Node.js' },
  ],
  'python': [
    { title: 'Python for Everybody', provider: 'Coursera', url: 'https://www.coursera.org/specializations/python', skill: 'Python' },
    { title: 'Complete Python Developer in 2023', provider: 'Udemy', url: 'https://www.udemy.com/course/complete-python-developer-zero-to-mastery/', skill: 'Python' },
  ],
  'sql': [
    { title: 'SQL for Data Science', provider: 'Coursera', url: 'https://www.coursera.org/learn/sql-for-data-science', skill: 'SQL' },
    { title: 'The Complete SQL Bootcamp', provider: 'Udemy', url: 'https://www.udemy.com/course/the-complete-sql-bootcamp/', skill: 'SQL' },
  ],
  'aws': [
    { title: 'AWS Certified Solutions Architect – Associate', provider: 'Coursera', url: 'https://www.coursera.org/specializations/aws-solutions-architect-associate', skill: 'AWS' },
    { title: 'AWS Cloud Practitioner Essentials', provider: 'AWS', url: 'https://www.aws.training/Details/Curriculum?id=20685', skill: 'AWS' },
  ],
  'docker': [
    { title: 'Docker for the Absolute Beginner', provider: 'Udemy', url: 'https://www.udemy.com/course/learn-docker/', skill: 'Docker' },
    { title: 'Introduction to Containers, Kubernetes, and OpenShift', provider: 'Coursera', url: 'https://www.coursera.org/learn/introduction-to-containers-kubernetes-openshift', skill: 'Docker' },
  ],
  'kubernetes': [
    { title: 'Kubernetes for the Absolute Beginners', provider: 'Udemy', url: 'https://www.udemy.com/course/learn-kubernetes/', skill: 'Kubernetes' },
    { title: 'Architecting with Kubernetes Engine', provider: 'Coursera', url: 'https://www.coursera.org/specializations/gcp-architecture', skill: 'Kubernetes' },
  ],
  'machine learning': [
    { title: 'Machine Learning by Andrew Ng', provider: 'Coursera', url: 'https://www.coursera.org/learn/machine-learning', skill: 'Machine Learning' },
    { title: 'Deep Learning Specialization', provider: 'Coursera', url: 'https://www.coursera.org/specializations/deep-learning', skill: 'Deep Learning' },
  ],
  'ml': [
    { title: 'Machine Learning by Andrew Ng', provider: 'Coursera', url: 'https://www.coursera.org/learn/machine-learning', skill: 'ML' },
  ],
  'data structures': [
    { title: 'Data Structures and Algorithms', provider: 'Coursera', url: 'https://www.coursera.org/specializations/data-structures-algorithms', skill: 'Data Structures & Algorithms' },
  ],
  'algorithms': [
    { title: 'Algorithms Specialization', provider: 'Coursera', url: 'https://www.coursera.org/specializations/algorithms', skill: 'Algorithms' },
  ],
  'system design': [
    { title: 'Grokking Modern System Design', provider: 'Educative', url: 'https://www.educative.io/courses/grokking-modern-system-design-interview-for-engineers-managers', skill: 'System Design' },
  ],
  'java': [
    { title: 'Java Programming and Software Engineering Fundamentals', provider: 'Coursera', url: 'https://www.coursera.org/specializations/java-programming', skill: 'Java' },
  ],
  'spring': [
    { title: 'Spring Framework 6 & Spring Boot 3', provider: 'Udemy', url: 'https://www.udemy.com/course/spring-hibernate-tutorial/', skill: 'Spring' },
  ],
  'angular': [
    { title: 'Angular - The Complete Guide', provider: 'Udemy', url: 'https://www.udemy.com/course/the-complete-guide-to-angular-2/', skill: 'Angular' },
  ],
  'devops': [
    { title: 'DevOps on AWS', provider: 'Coursera', url: 'https://www.coursera.org/specializations/devops-aws', skill: 'DevOps' },
  ],
  'git': [
    { title: 'Version Control with Git', provider: 'Coursera', url: 'https://www.coursera.org/learn/version-control-with-git', skill: 'Git' },
  ],
  'django': [
    { title: 'Django for Everybody', provider: 'Coursera', url: 'https://www.coursera.org/specializations/django', skill: 'Django' },
  ],
  'flask': [
    { title: 'REST APIs with Flask and Python', provider: 'Udemy', url: 'https://www.udemy.com/course/rest-api-flask-and-python/', skill: 'Flask' },
  ],
  'mongodb': [
    { title: 'MongoDB Basics', provider: 'MongoDB University', url: 'https://learn.mongodb.com/learning-paths/learn', skill: 'MongoDB' },
  ],
  'postgres': [
    { title: 'PostgreSQL for Everybody', provider: 'Coursera', url: 'https://www.coursera.org/specializations/postgresql-for-everybody', skill: 'PostgreSQL' },
  ],
  'postgresql': [
    { title: 'PostgreSQL for Everybody', provider: 'Coursera', url: 'https://www.coursera.org/specializations/postgresql-for-everybody', skill: 'PostgreSQL' },
  ],
  'azure': [
    { title: 'Microsoft Azure Fundamentals AZ-900', provider: 'Microsoft Learn', url: 'https://learn.microsoft.com/training/paths/azure-fundamentals/', skill: 'Azure' },
  ],
  'gcp': [
    { title: 'Google Cloud Digital Leader', provider: 'Coursera', url: 'https://www.coursera.org/professional-certificates/cloud-digital-leader-training', skill: 'GCP' },
  ],
};

function normalizeSkill(s: string): string {
  return s.trim().toLowerCase();
}

export function getCoursesForSkills(skills: string[], industry?: string, perSkill: number = 2): CourseRecommendation[] {
  const seen = new Set<string>();
  const results: CourseRecommendation[] = [];
  const normSkills = skills.map(normalizeSkill);

  for (const skill of normSkills) {
    // try exact
    let candidates = COURSE_MAP[skill];
    // try partial keys
    if (!candidates) {
      const key = Object.keys(COURSE_MAP).find((k) => skill.includes(k) || k.includes(skill));
      if (key) candidates = COURSE_MAP[key];
    }
    if (!candidates) continue;

    for (const c of candidates.slice(0, perSkill)) {
      if (seen.has(c.url)) continue;
      seen.add(c.url);
      results.push({ ...c, skill });
    }
  }

  // Optionally, if industry is provided, we could add one generic foundational course
  if (results.length === 0 && industry) {
    const generic: Record<string, CourseRecommendation> = {
      cloud: { title: 'Cloud Computing Basics', provider: 'Coursera', url: 'https://www.coursera.org/learn/cloud-computing-basics', skill: 'Cloud' },
      data: { title: 'Data Science Foundations', provider: 'Coursera', url: 'https://www.coursera.org/specializations/ibm-data-science', skill: 'Data' },
      mobile: { title: 'Mobile App Development with React Native', provider: 'Coursera', url: 'https://www.coursera.org/learn/react-native', skill: 'Mobile' },
      general: { title: 'Programming Foundations', provider: 'Coursera', url: 'https://www.coursera.org/specializations/java-programming', skill: 'Programming' },
    };
    const fallback = generic[industry] || generic['general'];
    results.push(fallback);
  }

  return results;
}
