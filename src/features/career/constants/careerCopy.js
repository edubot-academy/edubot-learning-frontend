export const BEGINNER_CHIPS = [
    { id: 'beginner',         label: 'I am a beginner' },
    { id: 'no_experience',    label: 'No work experience' },
    { id: 'has_projects',     label: 'I have personal projects' },
    { id: 'want_remote',      label: 'Want remote job' },
    { id: 'open_to_internship', label: 'Open to internship' },
    { id: 'open_to_contract', label: 'Open to contract' },
];

// Maps a keyword found in the target role field → suggested skill chips
const ROLE_SKILLS = {
    frontend:  ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML', 'Git', 'Next.js', 'Tailwind CSS', 'REST API'],
    react:     ['React', 'JavaScript', 'TypeScript', 'Redux', 'Next.js', 'CSS', 'Git'],
    vue:       ['Vue.js', 'JavaScript', 'TypeScript', 'CSS', 'Pinia', 'Vite', 'Git'],
    angular:   ['Angular', 'TypeScript', 'RxJS', 'CSS', 'HTML', 'Git', 'REST API'],
    backend:   ['Node.js', 'Python', 'PostgreSQL', 'REST API', 'Docker', 'Git', 'Express.js', 'MongoDB'],
    node:      ['Node.js', 'TypeScript', 'Express.js', 'PostgreSQL', 'REST API', 'Docker', 'Git'],
    fullstack: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'REST API', 'Git', 'Docker'],
    python:    ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'Docker', 'Git', 'REST API'],
    java:      ['Java', 'Spring Boot', 'PostgreSQL', 'REST API', 'Docker', 'Git', 'Maven'],
    kotlin:    ['Kotlin', 'Spring Boot', 'PostgreSQL', 'Docker', 'Git', 'REST API'],
    golang:    ['Go', 'PostgreSQL', 'Docker', 'REST API', 'Git', 'gRPC'],
    ios:       ['Swift', 'SwiftUI', 'UIKit', 'Xcode', 'Git', 'REST API'],
    android:   ['Kotlin', 'Android Studio', 'Jetpack Compose', 'REST API', 'Git'],
    mobile:    ['React Native', 'Flutter', 'Kotlin', 'Swift', 'REST API', 'Git'],
    flutter:   ['Flutter', 'Dart', 'Firebase', 'REST API', 'Git'],
    devops:    ['Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Git', 'Terraform', 'AWS'],
    cloud:     ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux', 'Git'],
    data:      ['Python', 'SQL', 'Pandas', 'NumPy', 'Machine Learning', 'Jupyter', 'Git'],
    ml:        ['Python', 'TensorFlow', 'PyTorch', 'Pandas', 'SQL', 'Git'],
    design:    ['Figma', 'UI/UX Design', 'Prototyping', 'User Research', 'Design Systems', 'Adobe XD'],
    qa:        ['Manual Testing', 'Selenium', 'Pytest', 'Postman', 'SQL', 'Git', 'JIRA'],
};

export const getSkillSuggestions = (targetRole) => {
    if (!targetRole?.trim()) return [];
    const lower = targetRole.toLowerCase();
    for (const [key, skills] of Object.entries(ROLE_SKILLS)) {
        if (lower.includes(key)) return skills;
    }
    return [];
};

export const TEMPLATES = [
    {
        id: 'classic',
        labelKey: 'career.resume.templates.classic',
        bestForKey: 'career.resume.templates.classicBestFor',
        isDefault: true,
    },
    {
        id: 'modern',
        labelKey: 'career.resume.templates.modern',
        bestForKey: 'career.resume.templates.modernBestFor',
    },
    {
        id: 'projects_first',
        labelKey: 'career.resume.templates.projectsFirst',
        bestForKey: 'career.resume.templates.projectsFirstBestFor',
    },
    {
        id: 'minimal',
        labelKey: 'career.resume.templates.minimal',
        bestForKey: 'career.resume.templates.minimalBestFor',
    },
    {
        id: 'tech',
        labelKey: 'career.resume.templates.tech',
        bestForKey: 'career.resume.templates.techBestFor',
    },
];

export const DEFAULT_TEMPLATE_ID = 'classic';
