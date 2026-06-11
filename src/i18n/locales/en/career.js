export const career = {
    career: {
        nav: {
            title: 'Career',
        },
        public: {
            hero: {
                title: 'Get hired at international companies',
                subtitle:
                    'Enter your skills. EduBot will build your English resume, show you remote jobs in the US and Europe, and help you prepare to apply.',
                cta: 'Start — 2 minutes',
            },
            steps: {
                form: 'Fill in your details',
                preview: 'See your resume',
                jobs: 'Find jobs and apply',
                formDescription: 'Name, target role, and skills',
                previewDescription: 'AI builds your English resume',
                jobsDescription: 'Remote US/Europe jobs with USD salary',
            },
            pasteToFill: {
                label: 'Already have a resume? Paste it here and we\'ll fill the form for you.',
                button: 'Paste resume',
            },
            limit: {
                reached: 'One free resume preview is available.',
                signupToSave: 'Create an account to generate more resumes',
            },
        },
        dashboard: {
            title: 'Career Hub',
            welcome: {
                title: 'Welcome to EduBot Career!',
                subtitle:
                    'Build your English resume, find remote jobs in the US and Europe, write cover letters, and track your applications — all in one place.',
            },
            cards: {
                resumeReadiness: 'Resume readiness',
                savedResumes: 'Saved resumes',
                bestMatch: 'Best job match',
                applications: 'Applications',
                aiCredits: 'AI credits',
                nextStep: 'Next step',
            },
            nextSteps: {
                noResume: 'Build your resume — takes 2 minutes',
                noMatches: 'Find matching remote jobs',
                noApplications: 'Ready to apply? Your top match is waiting',
                hasApplications: '{{count}} applications in progress',
            },
            emptyState: {
                resumes: 'No resumes yet',
                resumesSubtitle: 'Build your resume to start your job search.',
                jobs: 'No job matches yet',
                jobsSubtitle: 'Once your resume is ready, we\'ll find matching jobs for you.',
                applications: 'No applications yet',
                applicationsSubtitle: 'When you find a job you like, track your progress here.',
            },
        },
        resume: {
            builder: {
                title: 'Build resume',
                nameLabel: 'Full name',
                roleLabel: 'Target role',
                skillsLabel: 'Skills',
                namePlaceholder: 'Enter your full name',
                rolePlaceholder: 'e.g. Frontend Developer',
                skillsPlaceholder: 'e.g. React, JavaScript, CSS',
                generateButton: 'Generate resume',
                generating: 'Generating...',
                retry: 'Try again',
            },
            preview: {
                title: 'Your resume is ready',
                score: 'Readiness: {{score}}/100',
                save: 'Save',
                download: 'Download PDF',
                improve: 'Improve',
                lockedSave: 'Sign up to save',
                lockedDownload: 'Sign up to download',
            },
            score: {
                strongPoints: 'Strong points',
                missing: 'Missing information',
                atsImprovements: 'ATS improvements',
                recommendations: 'Job-readiness recommendations',
            },
            templates: {
                title: 'Choose a format',
                subtitle: 'All formats are ATS-safe and output in English',
                classic: 'Classic',
                classicDescription: 'Single column. Safest choice for all ATS portals.',
                classicBestFor: 'Any level',
                modern: 'Modern',
                modernDescription: 'Two-column. Great for design-conscious companies.',
                modernBestFor: '1+ years experience',
                projectsFirst: 'Projects First',
                projectsFirstDescription: 'Skills and projects at the top.',
                projectsFirstBestFor: 'Beginners and bootcamp grads',
                minimal: 'Minimal',
                minimalDescription: 'Content first. No decoration.',
                minimalBestFor: '3+ years experience',
                tech: 'Tech / Developer',
                techDescription: 'GitHub and projects front and center.',
                techBestFor: 'Developers with GitHub projects',
            },
        },
        jobs: {
            title: 'Remote jobs',
            subtitle: 'From the US and Europe',
            salary: '${{min}}–${{max}} / month',
            remote: 'Remote',
            hiresInternationally: 'Hires internationally',
            matchScore: '{{score}}% match',
            matchedSkills: 'Matched skills',
            missingSkills: 'Missing skills',
            actions: {
                view: 'View details',
                tailor: 'Tailor resume',
                coverLetter: 'Generate cover letter',
                apply: 'Apply',
                save: 'Save job',
                interviewPrep: 'Get interview plan',
                signupToApply: 'Sign up to apply',
                signupToDownload: 'Sign up to download',
                signupForCoverLetter: 'Sign up for cover letter',
            },
            coverLetter: {
                optional: 'Generate optional cover letter',
            },
            interviewPrep: {
                prompt: 'Want to prepare for this job?',
                description:
                    'EduBot can generate a 7-day interview preparation plan based on this vacancy and your resume.',
                signupCta: 'Sign up to generate interview plan',
                generateCta: 'Generate interview plan',
            },
        },
        signup: {
            prompt: {
                title: 'Your resume is ready!',
                subtitle:
                    'Create an account to save your resume, download a PDF, and apply to jobs. Takes 30 seconds — your draft is waiting.',
                features: {
                    save: 'Save resume',
                    download: 'Download PDF',
                    tailor: 'Tailor for a job',
                    coverLetter: 'Generate cover letter',
                    track: 'Track applications',
                },
                cta: 'Create account',
            },
        },
        usage: {
            title: 'AI usage',
            plan: {
                visitor: 'Visitor',
                free: 'Free',
                careerPlus: 'Career Plus',
            },
            limitReached: {
                title: 'You\'ve used your free AI resume limit for this month.',
                subtitle: 'Upgrade to Career Plus to:',
                features: {
                    moreResumes: 'Generate more resumes',
                    coverLetters: 'Write cover letters',
                    tailored: 'Tailor resumes for jobs',
                    tracking: 'Track applications',
                },
                upgradeCta: 'Upgrade to Career Plus',
            },
            credits: {
                remaining: '{{used}}/{{total}} used',
                unlimited: 'Unlimited',
            },
        },
        errors: {
            generationFailed: 'Failed to generate resume. Please try again.',
            matchFailed: 'Failed to load job matches. Please try again.',
            draftExpired: 'Your resume draft has expired. Please fill in the form again.',
            saveFailed: 'Failed to save. Please try again.',
        },
    },
};
