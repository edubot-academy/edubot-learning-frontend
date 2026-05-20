export const dashboard = {
    dashboardSidebar: {
        collapse: "Collapse menu",
        expand: "Menu",
        navigationMenu: "Dashboard navigation menu",
        sections: "Dashboard sections",
        categories: {
            primary: "Primary functions",
            secondary: "Learning management",
            progress: "Learning progress",
            personal: "Personal management",
            content: "Content management",
            users: "User management",
            analytics: "Analytics and statistics",
            admin: "System management",
            other: "Other"
        }
    },
    dashboardLayout: {
        contentAria: "{{role}} dashboard content"
    },
    dashboardTabs: {
        sections: "Dashboard sections",
        more: "More",
        moreOptions: "More options",
        labels: {
            overview: "Home",
            courses: "Courses",
            "my-courses": "My",
            resources: "Files",
            students: "Students",
            enrollments: "Enroll",
            analytics: "Analytics",
            ai: "AI",
            attendance: "Attend",
            homework: "Homework",
            profile: "Profile",
            schedule: "Schedule",
            tasks: "Tasks",
            progress: "Progress",
            notifications: "Alerts",
            chat: "Chat",
            leaderboard: "Ranking",
            sessions: "Sessions",
            offerings: "Offerings",
            certificates: "Certs",
            groups: "Groups",
            stats: "Stats",
            users: "Users",
            companies: "Companies",
            contacts: "Contacts",
            "ai-prompts": "AI",
            integration: "Integration",
            domain: "Domain",
            billing: "Billing",
            crm: "CRM",
            members: "Members",
            branding: "Brand",
            settings: "Settings",
            flags: "Flags",
            activity: "Activity"
        }
    },
    dashboardErrorStates: {
        actions: {
            retry: "Try again",
            home: "Home",
            back: "Go back",
            contactAdmin: "Contact administrator",
            report: "Report error",
            refreshPage: "Refresh page"
        },
        general: {
            title: "Something went wrong",
            message: "There was an error loading data. Try again.",
            unknown: "Unknown error occurred"
        },
        network: {
            title: "Connection error",
            message: "There is no internet connection or the server cannot be reached. Check your connection and try again."
        },
        permission: {
            title: "Access denied",
            message: "You do not have enough permissions to open this section.",
            roleRequired: "The \"{{role}}\" role is required to open this section.",
            contactAdmin: "Contact an administrator."
        },
        notFound: {
            resource: "Data",
            title: "{{resource}} not found",
            message: "The {{resource}} you are looking for does not exist in the system or was deleted. Check your search criteria or go to another section."
        },
        server: {
            title: "Server error",
            message: "An unexpected server error occurred. We know about this issue and are working to resolve it. Try again later."
        },
        boundary: {
            title: "Application error",
            message: "An unexpected application error occurred. Try refreshing the page.",
            details: "Error details (development mode only)"
        }
    },
    dashboardLoaders: {
        imageLoading: "Image is loading",
        progress: "Loading progress"
    },
    dashboardHeader: {
        roles: {
            instructor: "Instructor panel",
            student: "Student panel",
            admin: "Admin panel",
            assistant: "Assistant panel",
            default: "Dashboard"
        },
        descriptions: {
            instructor: "Manage courses, sessions, and student activity in one place.",
            student: "Track your learning progress and return quickly to important tasks.",
            admin: "Monitor platform activity and key management tasks.",
            assistant: "Support instructors and speed up daily operations.",
            default: "Dashboard features"
        },
        chips: {
            workspace: "EduBot Workspace",
            liveShell: "Live dashboard"
        }
    },
    floatingActionButton: {
        menu: "Quick actions menu",
        quickActions: "Quick actions",
        toggle: "Open or close quick actions menu",
        actions: {
            createCourse: "New course",
            addStudent: "Add student",
            createSession: "Live session",
            joinCourse: "Join course",
            askQuestion: "Ask a question",
            addUser: "Add user",
            createCompany: "Create company",
            viewAnalytics: "Analytics"
        }
    },
    studentAccessFallback: {
        title: "Learning access is not active",
        description: "You do not have an active enrollment yet. Contact your manager or administrator.",
        latestEnrollment: "Latest enrollment: {{course}} · {{status}}",
        courseFallback: "Course",
        actions: {
            viewCourses: "View courses",
            loginOther: "Log in with another account"
        }
    },
    assistantCompanyState: {
        eyebrow: "Assistant access",
        noCompany: {
            title: "No tenant assigned",
            description: "Your assistant account is not connected to a tenant yet. Ask a platform admin or tenant admin to add you before working with students and courses.",
            emptyTitle: "Tenant access is required",
            emptySubtitle: "Assistant tools are tenant-scoped so student, course, and attendance actions stay inside the right company dashboard."
        },
        select: {
            title: "Choose a tenant dashboard",
            description: "You are connected to multiple tenants. Select the company context before reviewing students, attendance, or enrollments.",
            label: "Tenant dashboard",
            placeholder: "Select a tenant"
        },
        context: {
            roster: {
                title: "Student roster",
                text: "Student search, enrollment actions, and attendance context are scoped to the selected tenant."
            },
            courses: {
                title: "Course access",
                text: "Course load and assignment tools use the tenant selection to avoid cross-company changes."
            },
            operations: {
                title: "Daily operations",
                text: "Pick the tenant you are helping today before changing enrollments or checking attendance."
            }
        }
    },
    assistantDashboard: {
        nav: {
            overview: "Overview",
            enrollments: "Students",
            courses: "Courses",
            attendance: "Attendance"
        },
        workspaceGroups: {
            dailyActions: "Daily actions",
            referenceViews: "Reference views"
        },
        header: {
            userFallback: "Assistant",
            hideMenu: "Hide menu",
            showMenu: "Show menu",
            companySubtitle: "As an assistant, you are viewing courses for {{company}}.",
            defaultSubtitle: "Support instructors with daily student and course operations."
        },
        metrics: {
            totalStudents: "Total students",
            enrolledStudents: "Enrolled students",
            publishedCourses: "Published courses",
            courses: "Courses"
        },
        toasts: {
            loadFailed: "Could not load dashboard data.",
            companiesLoadFailed: "Could not load companies."
        },
        pagination: {
            previous: "Previous",
            next: "Next"
        },
        overview: {
            eyebrow: "Assistant overview",
            title: "Assistant overview",
            description: "Signals for daily student enrollment and course load decisions.",
            metrics: {
                studentsWithoutCourse: "Need a course",
                emptyCourses: "Empty courses",
                highLoadCourses: "High-load courses"
            },
            workflow: {
                title: "Work queue",
                description: "Main tasks and current company context."
            },
            company: {
                label: "Company",
                fallback: "Selected company",
                description: "You are managing student and course operations for this company as an assistant."
            },
            signal: {
                label: "Decision signal",
                studentsNeedCourse: "{{count}} student needs a course",
                highLoadCourses: "{{count}} course has high load",
                emptyCourses: "{{count}} empty course",
                description: "This signal is calculated from the currently open student list and course load on this page."
            },
            nextSteps: {
                title: "Next step",
                description: "Fast direction for daily work.",
                students: {
                    title: "1. Check students",
                    text: "Review students waiting for enrollment in the Students tab."
                },
                courses: {
                    title: "2. Compare courses",
                    text: "Use the Courses tab to review load by course."
                },
                attendance: {
                    title: "3. Update attendance",
                    text: "When class starts, use the Attendance tab for daily marks."
                }
            }
        },
        attendance: {
            title: "Attendance workspace",
            description: "Attendance remains in the shared attendance domain; this tab gives assistants the right context.",
            decisionReason: "Assistant attendance stays inside the shared attendance area and is separated only if assistants need a dedicated attendance process."
        },
        courses: {
            eyebrow: "Assistant courses",
            title: "Course information",
            description: "Published company courses and student load."
        },
        courseStats: {
            title: "Course load",
            description: "Student distribution across company courses.",
            fallbackDescription: "Active company course",
            studentCount: "{{count}} student",
            empty: {
                title: "No course found",
                subtitle: "Published courses available to the company will appear here."
            },
            signals: {
                empty: {
                    label: "Needs enrollment",
                    hint: "This course is empty. Start enrollment from the Students tab."
                },
                highLoad: {
                    label: "High load",
                    hint: "Many students are enrolled. Watch group and attendance operations closely."
                },
                active: {
                    label: "Active",
                    hint: "This course has enrolled students."
                }
            },
            courseTypes: {
                offline: "Offline",
                onlineLive: "Online live",
                video: "Video course"
            }
        },
        students: {
            hero: {
                eyebrow: "Assistant workspace",
                title: "Student enrollment workflow",
                description: "Review company students and quickly enroll or remove them from available courses."
            },
            searchPlaceholder: "Search student name or email...",
            searchTooShortHelp: "Enter at least 3 characters to search.",
            list: {
                title: "Student list",
                description: "Review active courses per student, choose a new course, and run enrollment actions."
            },
            empty: {
                searchTooShort: {
                    title: "Not enough search input",
                    subtitle: "Enter at least 3 characters to show results."
                },
                noSearchResults: {
                    title: "No matching student found",
                    subtitle: "Try changing the name, email address, or filter context."
                },
                noCourses: {
                    title: "No published course for enrollment",
                    subtitle: "After courses are published, assistants can enroll students here."
                },
                noStudents: {
                    title: "No assigned students",
                    subtitle: "Students assigned to the company will appear here."
                }
            },
            unenrollAria: "Remove {{student}} from {{course}}",
            unenrollTitle: "Remove from course",
            unenrolling: "Removing...",
            unenroll: "Remove",
            noEnrolledCourse: "No enrolled course",
            courseSelectLabel: "Course to enroll",
            courseSelectPlaceholder: "-- Select --",
            selectedCourse: "Selected: {{course}}",
            allCoursesEnrolled: "Enrolled in all courses",
            enrolling: "Enrolling...",
            enroll: "Enroll"
        },
        enrollment: {
            confirmAction: "Yes",
            courseFallback: "course",
            confirmEnroll: "Enroll <strong>{{student}}</strong> in <strong>{{course}}</strong>?",
            enrollPending: "Enrolling {{student}} in \"{{course}}\".",
            enrollSuccessToast: "<strong>{{student}}</strong> enrolled successfully.",
            enrollSuccessFeedback: "{{student}} enrolled in \"{{course}}\".",
            enrollErrorToast: "Could not enroll in course.",
            enrollErrorFeedback: "Could not enroll {{student}} in \"{{course}}\".",
            confirmUnenroll: "Remove <strong>{{student}}</strong> from <strong>{{course}}</strong>?",
            unenrollPending: "Removing {{student}} from \"{{course}}\".",
            unenrollSuccessToast: "<strong>{{student}}</strong> removed from the course.",
            unenrollSuccessFeedback: "{{student}} removed from \"{{course}}\".",
            unenrollErrorToast: "Could not remove from course.",
            unenrollErrorFeedback: "Could not remove {{student}} from \"{{course}}\"."
        }
    },
    assistantPanel: {
        empty: {
            noQuestions: "No questions in this chat yet. Write the first question."
        },
        toasts: {
            messagesLoadFailed: "Could not load messages.",
            chatCreated: "New chat created.",
            chatCreateFailed: "Could not create chat.",
            chatsLoadFailed: "Could not load chats.",
            chatDeleted: "Chat deleted.",
            chatDeleteFailed: "Could not delete chat.",
            sendFailed: "Could not send the question."
        },
        actions: {
            openMenu: "Open chat menu",
            newChat: "New chat",
            deleteChat: "Delete chat"
        },
        hero: {
            eyebrow: "EDU",
            brand: "EDU",
            titleSuffix: "AI Assistant",
            description: "Our AI assistant helps you find answers faster, learn more effectively, and improve every day."
        },
        chat: {
            label: "Chat: {{title}}",
            untitled: "Untitled",
            greeting: "Hello. How can I help?"
        },
        prompts: {
            title: "Quick prompts"
        },
        input: {
            placeholder: "Write your question here...",
            attachFile: "Attach file",
            voiceInputSoon: "Voice input (soon)",
            sending: "Sending...",
            send: "Send"
        },
        deleteModal: {
            title: "Delete chat",
            message: "Are you sure you want to delete the current chat?",
            confirm: "Delete"
        }
    }
};
