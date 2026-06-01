export const shared = {
    common: {
        appName: "EduBot Learning",
        language: "Language",
        openMenu: "Open menu",
        openSearch: "Open search",
        search: "Search",
        searchCourses: "Search courses",
        searching: "Searching...",
        loading: "Loading",
        loadingEllipsis: "Loading...",
        refresh: "Refresh",
        clearFilters: "Clear filters",
        all: "All",
        copy: "Copy",
        progress: "Progress",
        empty: "No items yet.",
        searchUnavailable: "Search is unavailable right now.",
        noResults: "No results",
        close: "Close",
        closeEsc: "Close (ESC)",
        cancel: "Cancel",
        done: "Done",
        login: "Log in",
        logout: "Log out",
        signup: "Sign up",
        closeMenu: "Close menu",
        userMenu: "User menu",
        userFallback: "User",
        identified: "Identified",
        activeAccount: "Active account",
        favourites: "Favourites",
        cart: "Cart",
        enums: {
            courseTypes: {
                video: "Video course",
                offline: "Offline",
                onlineLive: "Online live"
            },
            deliveryModes: {
                group: "Group",
                individual: "Individual"
            },
            certificateStatuses: {
                issued: "Issued",
                pendingApproval: "Pending approval",
                pending: "Pending",
                rejected: "Rejected",
                revoked: "Revoked",
                none: "No certificate"
            },
            pageOrientations: {
                landscape: "Landscape",
                portrait: "Portrait"
            }
        }
    },
    videoPlayer: {
        play: "Play",
        pause: "Pause",
        rewind15: "Rewind 15 seconds",
        forward15: "Forward 15 seconds",
        volume: "Volume",
        quality: "Quality",
        autoQuality: "Auto",
        fullscreen: "Fullscreen",
        exitFullscreen: "Exit fullscreen"
    },
    cartProvider: {
        messages: {
            videoOnly: "Self-service LMS purchase is available only for video courses.",
            alreadyInCart: "Course is already in the cart.",
            addFailed: "Could not add course to cart.",
            added: "Course added to cart."
        }
    },
    confirmationModal: {
        confirm: "Confirm",
        cancel: "Cancel",
        defaultBody: "If you continue, the change will be applied immediately."
    },
    formControls: {
        phonePlaceholder: "Phone number",
        clearSearch: "Clear search",
        showPassword: "Show password",
        hidePassword: "Hide password"
    },
    supportContact: {
        addressShort: "Bishkek, Akhunbaeva 129B",
        addressFull: "Akhunbaeva 129B, Bishkek, Kyrgyzstan",
        workingHours: "Monday - Friday, 9:00 - 21:00"
    },
    chatWorkspace: {
        sidebarTitle: "Conversations",
        searchPlaceholder: "Search chats",
        composerPlaceholder: "Write a message...",
        selectChatTitle: "Select a chat",
        backToChats: "Back to chats",
        messagesLog: "Chat messages",
        emptyMessages: {
            title: "Start the conversation",
            subtitle: "Write the first message in this chat."
        },
        messageOwners: {
            me: "Your",
            them: "Their"
        },
        messageAria: "{{owner}} message: {{content}}",
        fileFallback: "File",
        imageAlt: "Chat image",
        addAttachment: "Add attachment",
        attachmentFile: "File",
        attachmentImage: "Image",
        composerAria: "Message input",
        sendMessage: "Send message",
        selectFile: "Select file",
        selectImage: "Select image"
    },
    timeUtils: {
        minutesSecondsShort: "{{minutes}} min {{seconds}} sec",
        hoursMinutesShort: "{{hours}} hr {{minutes}} min",
        hoursShort: "{{count}} hr",
        minutesShort: "{{count}} min"
    },
    quizUtils: {
        validation: {
            missingQuiz: "Quiz data was not found.",
            addQuestion: "Add at least one question.",
            questionPromptRequired: "Question {{number}} needs text.",
            questionNeedsOptions: "Question {{number}} must have at least 2 options.",
            questionNeedsCorrectAnswer: "Mark the correct answer for question {{number}}.",
            questionOptionsRequired: "Fill in all options for question {{number}}."
        }
    },
    challengeUtils: {
        defaults: {
            testTitle: "Test {{number}}",
            starterCode: "// Write your code here\n"
        },
        labels: {
            testArgs: "Test {{number}} arguments",
            testExpected: "Test {{number}} expected result"
        },
        errors: {
            invalidJson: "{{label}} must be valid JSON.",
            missingChallenge: "Code challenge data is missing.",
            missingInstructions: "Write code challenge instructions.",
            addTest: "Add at least one test.",
            testTitleRequired: "Write a title for test {{number}}."
        }
    },
    lessonUtils: {
        readTime: "{{count}} min read"
    },
    relativeTime: {
        now: "now",
        minutesAgo: "{{count}} minutes ago",
        hoursAgo: "{{count}} hours ago",
        daysAgo: "{{count}} days ago"
    },
    stickyButton: {
        whatsappAria: "Contact us on WhatsApp: {{phone}}"
    },
    sidebarOverlay: {
        label: "Sidebar"
    },
    nav: {
        courses: "Courses",
        about: "About",
        contact: "Contact",
        dashboard: "Dashboard",
        myCourses: "My courses",
        attendance: "Attendance",
        notifications: "Notifications",
        chat: "Chat",
        primaryNavigation: "Primary navigation",
        mobilePrimaryNavigation: "Mobile primary navigation",
        accountMenu: "Account menu",
        guestMenu: "Guest menu"
    },
    footer: {
        navigation: "Navigation",
        contact: "Contact",
        address: "Our address",
        openWebsite: "Open {{brand}} website",
        qrAlt: "QR code for {{brand}} website",
        copyright: "© {{year}} EduBot Learning. All rights reserved."
    },
    chatRedirect: {
        title: "Chat section was not found",
        description: "A direct chat route is not configured for this account. Return to your dashboard and choose an available messages or support section.",
        actions: {
            dashboard: "Return to dashboard",
            support: "Support"
        }
    },
    unauthorized: {
        eyebrow: "Access restricted",
        title: "You do not have permission to open this page",
        signedInAs: "You are currently signed in as {{role}}.",
        signInPrompt: "Sign in to continue or choose the correct account.",
        reasons: {
            role: "This section may be available only for another role.",
            enrollment: "Your access to this course or organization may not be active yet.",
            session: "If your session expired, sign in again.",
            default: "The section you tried to open is closed for your current account."
        },
        roles: {
            student: "student",
            instructor: "instructor",
            assistant: "assistant",
            admin: "administrator",
            superadmin: "super admin",
            account: "account"
        },
        actions: {
            dashboard: "Return to dashboard",
            login: "Log in",
            courses: "View courses",
            back: "Go back",
            support: "Contact support"
        },
        guidance: {
            title: "What can you do?",
            role: {
                title: "Check your role",
                description: "This section may be open only to one of the student, instructor, assistant, or admin roles."
            },
            account: {
                title: "Switch account",
                description: "If you use another account, log out and sign in again with the correct account."
            },
            access: {
                title: "Request access",
                description: "If you need course, company, or admin-panel access, contact an administrator or support team."
            }
        }
    },
    errors: {
        generic: "A server error occurred.",
        CSRF_TOKEN_INVALID: "Session security was refreshed. Try again.",
        AUTHENTICATION_REQUIRED: "Sign in and try again.",
        AUTH_TOKEN_INVALID: "Your session has expired. Sign in again.",
        AUTH_CREDENTIALS_INVALID: "Email or password is incorrect.",
        COMPANY_LOCALE_UNSUPPORTED: "The company language is not supported.",
        TENANT_CONTEXT_MISMATCH: "This action is not available for the selected tenant.",
        CHAT_NOT_FOUND: "Chat was not found.",
        INSTRUCTOR_CHAT_NOT_FOUND: "Chat was not found.",
        categories: {
            ai: "AI assistant request could not be completed.",
            attendance: "Attendance request could not be completed.",
            auth: "Authentication request could not be completed.",
            cart: "Cart request could not be completed.",
            certificate: "Certificate request could not be completed.",
            company: "Company request could not be completed.",
            course: "Course request could not be completed.",
            enrollment: "Enrollment request could not be completed.",
            favorite: "Favourite request could not be completed.",
            group: "Group request could not be completed.",
            homework: "Homework request could not be completed.",
            integration: "Integration request could not be completed.",
            leaderboard: "Leaderboard request could not be completed.",
            lesson: "Lesson request could not be completed.",
            media: "Media request could not be completed.",
            meeting: "Meeting request could not be completed.",
            notification: "Notification request could not be completed.",
            offering: "Offering request could not be completed.",
            session: "Session request could not be completed.",
            skill: "Skill request could not be completed.",
            student: "Student request could not be completed.",
            tenant: "Tenant request could not be completed.",
            user: "User request could not be completed."
        }
    },
    notifications: {
        widget: {
            title: "Notifications",
            description: "News and alerts",
            latest: "Latest updates"
        },
        center: {
            eyebrow: "Notifications center",
            title: "Notifications",
            description: "Latest activity, alerts, and unread updates are collected here."
        },
        metrics: {
            total: "All notifications",
            unread: "Unread",
            loadedPage: "Loaded page"
        },
        feed: {
            title: "Notification feed",
            description: "New alerts appear first, and older items are grouped by day."
        },
        actions: {
            markAllRead: "Mark all as read",
            markRead: "Mark read",
            review: "Review",
            loadMore: "Load more notifications",
            viewAll: "View all"
        },
        empty: {
            widgetTitle: "No notifications yet",
            widgetSubtitle: "New events will appear here when they happen.",
            feedTitle: "No notifications",
            feedSubtitle: "New events or updates will appear here."
        },
        unreadBadge: "{{count}} new",
        fallbackTitle: "Notification"
    },
    analytics: {
        common: {
            chartLoadError: "Unable to load chart",
            chartDataLoadError: "Failed to load chart data",
            dataLoadError: "Error loading data",
            tableLoadError: "Unable to load table data. Please try again.",
            tryAgain: "Please try again",
            noData: "No data available",
            mobileLoading: "Loading for mobile...",
            datasetLabel: "Dataset {{number}}",
            paginationSummary: "Showing {{start}} to {{end}} of {{total}} results",
            previous: "Previous",
            next: "Next",
            sectionLoadError: "Error loading section",
            sectionLoadErrorDescription: "Unable to load data. Please try again.",
            retry: "Retry",
            refresh: "Refresh",
            filter: "Filter",
            export: "Export",
            share: "Share",
            quickActions: "Quick actions"
        }
    },
    ratings: {
        card: {
            fallbackInstructor: "Instructor",
            fallbackTitle: "Instructor",
            fallbackSpecialty: "Practical lessons",
            newRating: "New rating",
            topInstructor: "Top instructor",
            ratingAria: "Rating {{rating}}",
            reviews: "Reviews",
            students: "Students"
        },
        comment: {
            toasts: {
                courseMissing: "Course was not found.",
                ratingRequired: "Choose a rating first.",
                commentTooShort: "Review must be at least 5 characters.",
                submitted: "Review submitted successfully.",
                submitError: "Could not submit the review. Try again."
            },
            starAria: "{{count}} stars",
            success: {
                title: "Thank you for your review.",
                description: "Your feedback helps other students choose a course and helps us improve our courses.",
                yourRating: "Your rating:"
            },
            form: {
                title: "How was the course? Leave a review",
                descriptionLine1: "Your feedback helps other students choose a course.",
                descriptionLine2: "Your opinion is very valuable to us.",
                placeholder: "Write about your experience...",
                minimum: "Minimum: 5 characters. You wrote: {{count}}.",
                rating: "Rating: {{rating}} / 5"
            },
            actions: {
                sending: "Sending...",
                submit: "Submit"
            }
        }
    },
    setupAccount: {
        imageAlt: "Account setup",
        title: "Set up your account",
        description: "Create a one-time password. You will use your email and this password for future sign-ins.",
        fields: {
            newPassword: "New password",
            confirmPassword: "Repeat password"
        },
        passwordRules: {
            title: "Password rules",
            length: "At least 8 characters",
            match: "Repeat password matches"
        },
        missingToken: {
            title: "Account setup link is missing.",
            description: "This page works with a one-time invitation link. Ask the CRM manager for a new invitation or return to the login page."
        },
        actions: {
            goToLogin: "Go to login",
            askForHelp: "Ask for help",
            activate: "Activate account",
            activating: "Setting up..."
        },
        errors: {
            missingToken: "Account setup link was not found.",
            passwordTooShort: "Password must be at least 8 characters.",
            passwordMismatch: "Passwords do not match.",
            passwordMismatchLive: "Passwords do not match yet.",
            invalidOrExpired: "The link is invalid or expired. Request a new link.",
            requestNewInvite: "If the link has expired, ask the CRM manager for a new invitation."
        },
        success: {
            redirecting: "Your account is ready. Redirecting to LMS.",
            ready: "Your account is ready. You can now sign in to LMS."
        },
        footer: {
            prefix: "If the link stops working, ask the CRM manager for a new one or",
            loginLink: "go to the login page"
        }
    },
    ai: {
        answerKey: "Answer key",
        cancelDraft: "Cancel draft",
        copyDraft: "Copy draft",
        copyWorksheetText: "Copy worksheet text",
        courseDraft: "AI course draft",
        courseDraftAccepted: "AI course draft copied into the builder.",
        courseDraftFailed: "Could not generate an AI course draft.",
        courseDraftHelp: "Generate an editable course outline. Nothing is saved until you save the course and curriculum.",
        courseDraftReady: "AI course draft is ready.",
        courseDraftRejected: "AI course draft was cancelled.",
        courseDraftTopicRequired: "Add a course title before requesting an AI draft.",
        feedbackDraft: "AI feedback draft",
        feedbackDraftAccepted: "AI draft copied into the review.",
        feedbackDraftActionFailed: "Could not update the AI draft status.",
        feedbackDraftFailed: "Could not generate an AI feedback draft.",
        feedbackDraftReady: "AI feedback draft is ready.",
        feedbackDraftRejected: "AI draft was cancelled.",
        generating: "Generating...",
        openGenerator: "Open AI generator",
        openPreview: "Open AI preview",
        panelEyebrow: "AI draft",
        homeworkDraft: "AI homework draft",
        homeworkDraftAccepted: "AI homework draft copied into the form.",
        homeworkDraftFailed: "Could not generate an AI homework draft.",
        homeworkDraftReady: "AI homework draft is ready.",
        homeworkDraftRejected: "AI homework draft was cancelled.",
        manualMode: "Manual",
        aiDraftMode: "AI draft",
        regenerateDraft: "Regenerate",
        useInManualForm: "Use in manual form",
        homeworkBrief: {
            collapsedHelp: "Open the AI brief only when you want a guided draft. Existing title text is reused as the topic.",
            openBrief: "Generate with AI",
            hideBrief: "Hide AI brief",
            topic: "What should the homework assess?",
            topicPlaceholder: "Example: practice linear equations with real-world word problems",
            instructions: "Instructions",
            instructionsPlaceholder: "Example: create 5 tasks, include 2 word problems and one challenge question",
            difficulty: "Difficulty",
            difficultyAuto: "Use course level",
            difficultyBeginner: "Beginner",
            difficultyIntermediate: "Intermediate",
            difficultyAdvanced: "Advanced",
            maxScore: "Max score",
            maxScorePlaceholder: "Example: 100",
            includeRubric: "Include rubric",
            help: "Add the assignment goal before generating so the AI call uses the right context and fewer retries.",
            topicIssues: {
                required: "Enter a topic or goal before generating.",
                tooShort: "Make the topic more specific.",
                meaningless: "Use a meaningful homework topic.",
                generic: "Add the skill or concept students should practice."
            }
        },
        lessonDraftRequiresSavedLesson: "Save this lesson before requesting an AI draft.",
        lessonKitDraft: "AI lesson kit draft",
        lessonKitDraftAccepted: "AI lesson kit copied into the lesson editor.",
        lessonKitDraftFailed: "Could not generate an AI lesson kit draft.",
        lessonKitDraftHelp: "Generate editable article content from a lesson summary, objectives, examples, and homework idea.",
        lessonKitDraftInvalid: "AI lesson kit draft did not include usable content.",
        lessonKitDraftReady: "AI lesson kit draft is ready.",
        lessonKitDraftRejected: "AI lesson kit draft was cancelled.",
        lessonKitExamples: "Examples",
        lessonKitHomeworkIdea: "Homework idea",
        lessonKitObjectives: "Objectives",
        lessonKitVocabulary: "Vocabulary",
        lessonCount: "{{count}} lessons",
        questionCount: "{{count}} questions",
        quizDraft: "AI quiz draft",
        quizDraftCorrect: "Correct:",
        quizDraftAccepted: "AI quiz draft copied into the editor.",
        quizDraftFailed: "Could not generate an AI quiz draft.",
        quizDraftHelp: "Generate editable quiz questions. Nothing is saved until you save the curriculum.",
        quizDraftFlow: {
            createsLabel: "Creates",
            creates: "A quiz title, description, questions, choices, and correct answers.",
            appliesLabel: "Goes into",
            applies: "This activity editor after you click Use draft.",
            nextLabel: "Next",
            next: "Review each question, then save the activity."
        },
        quizDraftInvalid: "AI quiz draft did not include usable questions.",
        quizDraftReady: "AI quiz draft is ready.",
        quizDraftRejected: "AI quiz draft was cancelled.",
        quizBrief: {
            topicPlaceholder: "Topic or skill to test",
            questionCount: "Number of questions",
            difficultyAuto: "Use course level",
            modeMixed: "Mixed question types",
            includeExplanations: "Include explanations"
        },
        requestId: "Request ID: {{requestId}}",
        rubric: "Rubric",
        suggestFeedback: "Suggest feedback with AI",
        suggestCourse: "Suggest course with AI",
        suggestHomework: "Suggest homework with AI",
        suggestLessonKit: "Suggest lesson kit with AI",
        suggestQuiz: "Suggest quiz with AI",
        suggestWorksheet: "Draft worksheet text with AI",
        worksheetDraft: "AI worksheet text draft",
        worksheetDraftAccepted: "AI worksheet draft marked as used.",
        worksheetDraftPreview: "Editable worksheet text",
        worksheetDraftCopied: "AI worksheet draft copied to clipboard.",
        worksheetDraftFailed: "Could not generate an AI worksheet draft.",
        worksheetDraftStatusUpdateFailed: "Material was saved, but the AI draft status could not be updated.",
        worksheetDraftFlow: {
            createsLabel: "Creates",
            creates: "Printable worksheet text with instructions, sections, tasks, and answer key.",
            appliesLabel: "Goes into",
            applies: "The editable preview first, so you can review before saving.",
            nextLabel: "Next",
            next: "Edit the preview, then save it as a PDF or DOCX material."
        },
        worksheetDraftHelp: "Generate editable worksheet text, review it, then save it as a PDF or DOCX material.",
        worksheetDraftNextStep: "Review and edit this text before saving it as a student-facing material.",
        worksheetMaterialCreateFailed: "Could not create the material file.",
        createMaterialFile: "Create material file",
        createPdfMaterial: "Save as PDF",
        createDocxMaterial: "Save as DOCX",
        worksheetBrief: {
            topicPlaceholder: "Topic or skill to practice",
            formatPractice: "Practice worksheet",
            formatHandout: "Class handout",
            formatDiscussion: "Discussion guide",
            formatRecap: "Recap notes",
            activityCount: "Number of activities",
            includeAnswerKey: "Include answer key"
        },
        useDraft: "Use draft"
    },
    media: {
        video: {
            ariaLabel: "Course video",
            playbackError: "Video playback encountered an error.",
            playbackFailed: "Sorry, the video could not be played.",
            hlsUnsupported: "This browser does not support HLS. Please use the MP4 version of the video.",
            notFound: "Video not found",
            loadFailed: "Video failed to load.",
            retry: "Try again"
        }
    },
    a11y: {
        skipNavigation: {
            label: "Skip navigation links",
            main: "Skip to main content",
            mainWithShortcut: "Skip to main content (Alt + M)",
            navigation: "Skip to navigation",
            navigationWithShortcut: "Skip to navigation (Alt + N)",
            search: "Skip to search",
            searchWithShortcut: "Skip to search (Alt + S)"
        }
    }
};
