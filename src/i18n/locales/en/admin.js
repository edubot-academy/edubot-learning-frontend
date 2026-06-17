export const admin = {
    adminPanel: {
        subtitle: "Manage and monitor the platform",
        hideMenu: "Hide menu",
        showMenu: "Show menu",
        workspaceSection: "Admin section",
        workspaceGroups: {
            governance: "Platform governance",
            contentOperations: "Content operations",
            technicalOperations: "Technical operations"
        },
        tabs: {
            stats: "Statistics",
            courses: "Courses and categories",
            pending: "Approve new courses",
            certificates: "Certificates",
            users: "Users",
            companies: "Companies",
            contacts: "Contacts",
            analytics: "Analytics",
            aiPrompts: "AI prompts",
            aiLms: "AI LMS settings",
            skills: "Skills",
            notifications: "Notifications",
            integration: "Integrations",
            attendance: "Attendance",
            externalResources: "Free resources"
        },
        status: {
            statsUpdating: "Statistics are updating",
            aiPromptsLoading: "AI prompts are loading",
            transcodeRunning: "Transcoding is running",
            sectionOpened: "{{section}} opened",
            sectionFallback: "Section"
        },
        notifications: {
            markReadSuccess: "Notification marked as read.",
            markReadError: "Could not mark notification as read.",
            deleteTitle: "Delete notification",
            deleteMessage: "Delete this notification?",
            deleteConfirm: "Delete",
            deleteSuccess: "Notification deleted.",
            deleteError: "Could not delete notification."
        }
    },
    adminAnalytics: {
        hero: {
            eyebrow: "Analytics overview",
            title: "Administrative analytics",
            description: "Platform overview with user metrics, course performance, and revenue data."
        },
        actions: {
            refresh: "Refresh",
            loading: "Loading..."
        },
        toasts: {
            loadError: "Could not load analytics."
        },
        metrics: {
            totalUsers: "Total users",
            students: "Students",
            courses: "Courses",
            enrollments: "Enrollments"
        },
        filters: {
            from: "From",
            to: "To",
            status: "Filter status",
            rangeSelected: "Date range selected",
            allTime: "All time"
        },
        courseAnalytics: {
            title: "Course analytics",
            description: "Compare the strongest courses and courses that need attention in one compact panel.",
            metrics: {
                topCourses: "Top courses",
                riskCourses: "At-risk courses"
            },
            topCourses: {
                title: "Top courses",
                subtitle: "Courses with the highest student participation"
            },
            lowPerforming: {
                title: "Courses needing attention",
                subtitle: "Courses with lower completion and average progress"
            }
        },
        trends: {
            title: "Trend report",
            description: "Review enrollment and revenue dynamics over time.",
            metrics: {
                enrollmentPoints: "Enrollment points",
                revenuePoints: "Revenue points"
            },
            enrollments: {
                title: "Enrollment trends",
                subtitle: "Student enrollments over time"
            },
            revenue: {
                title: "Revenue trends",
                subtitle: "Platform revenue over time"
            }
        },
        columns: {
            course: "Course",
            enrollments: "Enrollments",
            completionRate: "Completion rate",
            averageProgress: "Average progress"
        },
        fallbacks: {
            courseWithId: "Course #{{id}}"
        }
    },
    adminContacts: {
        eyebrow: "Inbox",
        title: "Contacts",
        description: "Review user contact messages and mark them as handled.",
        metrics: {
            total: "All messages",
            unread: "Unread",
            withMessage: "With full message"
        },
        inbox: {
            title: "Incoming messages",
            description: "Questions received through forms and contact channels."
        },
        status: {
            read: "Read",
            new: "New"
        },
        actions: {
            markRead: "Mark as read",
            delete: "Delete"
        },
        empty: {
            title: "No contacts found",
            subtitle: "There are no contact messages yet."
        },
        toasts: {
            loadError: "Could not load contact messages."
        }
    },
    adminStats: {
        currency: {
            kgs: "{{amount}} KGS"
        },
        hero: {
            eyebrow: "Last 7 days",
            title: "Platform statistics",
            description: "Overall metrics, activity, revenue, and growth trends."
        },
        actions: {
            refresh: "Refresh"
        },
        metrics: {
            students: "Students",
            courses: "Courses",
            publishedCourses: "Published courses",
            totalEnrollments: "Total enrollments",
            activeEnrollments: "Active enrollments",
            totalRevenue: "Total revenue",
            last30Days: "Last 30 days",
            last7Days: "Last 7 days",
            courseCompletion: "Course completion",
            activeStudents: "Active students"
        },
        trends: {
            eyebrow: "Trend snapshot",
            title: "Trends",
            description: "Short-term growth and engagement changes.",
            dailySignups: "Daily signups (students)",
            dailyEnrollments: "Daily enrollments",
            period7d: "7 days"
        },
        topCourses: {
            eyebrow: "Course ranking",
            title: "Most active and profitable courses",
            table: {
                course: "Course",
                enrollments: "Enrollments",
                active7d: "Active (7d)",
                completion: "Completion",
                revenue: "Revenue"
            },
            empty: "No top courses yet."
        },
        toasts: {
            loadError: "Could not load statistics."
        }
    },
    adminSkills: {
        eyebrow: "Skills catalog",
        title: "Skills",
        description: "Manage skills used in course and talent data.",
        metrics: {
            total: "All skills",
            initials: "Grouped initials",
            editMode: "In edit mode"
        },
        create: {
            title: "New skill",
            description: "Use a short, standardized name.",
            placeholder: "New skill name"
        },
        list: {
            title: "Skill list",
            description: "All active skills."
        },
        actions: {
            add: "Add",
            delete: "Delete"
        },
        empty: {
            title: "No skills",
            subtitle: "The skills catalog is empty."
        },
        confirm: {
            deleteTitle: "Delete skill",
            deleteMessage: "Delete this skill?"
        },
        toasts: {
            loadError: "Could not load skills.",
            created: "Skill created.",
            createError: "Could not create skill.",
            updated: "Skill updated.",
            updateError: "Could not update skill.",
            deleted: "Skill deleted.",
            deleteError: "Could not delete skill."
        }
    },
    adminPendingCourses: {
        eyebrow: "Approval queue",
        title: "Pending courses",
        description: "Review new courses submitted by instructors and approve or reject them.",
        metrics: {
            pending: "Pending courses",
            instructors: "Instructors",
            paid: "Paid",
            newest: "Newest: {{date}}"
        },
        queue: {
            title: "Approval list",
            description: "Check each course type, price, instructor, and preview link."
        },
        courseTypes: {
            offline: "Offline",
            onlineLive: "Live online",
            video: "Video"
        },
        status: {
            pending: "Pending",
            pendingApproval: "Pending approval"
        },
        actions: {
            details: "Details",
            preview: "Preview",
            approve: "Approve",
            reject: "Reject"
        },
        fields: {
            price: "Price",
            createdAt: "Created",
            status: "Status"
        },
        empty: {
            title: "No pending courses",
            subtitle: "There are no courses waiting for approval right now."
        },
        confirm: {
            approveTitle: "Approve course",
            approveMessage: "Approve \"{{title}}\"? After approval, the course may become available to students and catalog flows.",
            rejectTitle: "Reject course",
            rejectMessage: "Reject \"{{title}}\"? The instructor will need to revise and resubmit the course."
        },
        toasts: {
            loadError: "Could not load pending courses.",
            approved: "Course approved.",
            approveError: "Could not approve course.",
            rejected: "Course moved to rejected.",
            rejectError: "Could not reject course."
        },
        courseFallback: "Course #{{id}}",
        uncategorized: "Uncategorized",
        instructor: "Instructor",
        currency: {
            kgs: "{{amount}} KGS"
        },
        free: "Free"
    },
    adminDeliveryCourseDetails: {
        title: "Delivery course details",
        subtitle: "This course belongs to internal management flows, not the public video page.",
        close: "Close",
        fields: {
            category: "Category",
            note: "Note"
        },
        note: "Detailed management for delivery courses happens through the group, session, and enrollment tabs."
    },
    adminAiLms: {
        eyebrow: "AI LMS",
        title: "AI LMS settings",
        description: "Enable structured AI LMS draft tools and usage limits for tenants or independent instructors.",
        metrics: {
            scope: "Scope",
            enabledFeatures: "Enabled features",
            limits: "Configured limits"
        },
        scope: {
            title: "Rollout scope",
            description: "Choose the tenant or independent instructor that should see AI LMS controls.",
            tenant: "Tenant",
            independentInstructor: "Independent instructor",
            userId: "Instructor user ID",
            selectInstructor: "Select instructor",
            loadingInstructors: "Loading instructors..."
        },
        settings: {
            title: "Feature settings",
            description: "The frontend only shows AI controls when this scope is enabled and the feature is selected.",
            enabled: "Enable AI LMS for this scope"
        },
        limits: {
            title: "Feature limits",
            description: "Set conservative limits before enabling a feature in production.",
            enabled: "Enabled",
            daily: "Daily",
            monthly: "Monthly"
        },
        features: {
            feedback_draft: "Feedback draft",
            lesson_quiz_draft: "Quiz draft",
            homework_draft: "Homework draft",
            lesson_kit: "Lesson kit",
            worksheet_draft: "Worksheet draft",
            course_draft: "Course draft",
            message_draft: "Student message draft"
        },
        actions: {
            reload: "Reload",
            loading: "Loading...",
            saving: "Saving...",
            saved: "Saved",
            saveSettings: "Save settings",
            saveLimit: "Save limit"
        },
        toasts: {
            loadError: "Could not load AI LMS settings.",
            settingsSaved: "AI LMS settings saved.",
            settingsSaveError: "Could not save AI LMS settings.",
            limitSaved: "AI LMS feature limit saved.",
            limitSaveError: "Could not save AI LMS feature limit.",
            instructorsLoadError: "Could not load instructors."
        },
        usage: {
            title: "Usage stats",
            description: "Token and request usage per scope, feature, and period.",
            filters: {
                feature: "Feature",
                status: "Status",
                allFeatures: "All features",
                allStatuses: "All statuses"
            },
            table: {
                id: "ID",
                scope: "Scope",
                feature: "Feature",
                status: "Status",
                period: "Period",
                daily: "Daily",
                tokens: "Tokens"
            },
            empty: "No usage records match the current filters.",
            load: "Load usage",
            toasts: { error: "Could not load usage stats." }
        },
        audit: {
            title: "Audit log",
            description: "Generation events and feature activity across all scopes.",
            filters: {
                feature: "Feature",
                action: "Action",
                allFeatures: "All features",
                allActions: "All actions"
            },
            table: {
                id: "ID",
                action: "Action",
                feature: "Feature",
                generation: "Generation",
                scope: "Scope",
                user: "User ID",
                date: "Date"
            },
            empty: "No audit log entries match the current filters.",
            load: "Load audit log",
            viewGeneration: "View",
            toasts: { error: "Could not load audit logs." }
        },
        generation: {
            title: "Generation detail",
            close: "Close",
            notFound: "Generation not found.",
            fields: {
                id: "ID",
                feature: "Feature",
                status: "Status",
                model: "Model",
                tokens: "Total tokens",
                createdAt: "Created"
            },
            outputLabel: "Output (JSON)",
            toasts: { error: "Could not load generation details." }
        }
    },
    adminAiPrompts: {
        eyebrow: "AI prompts",
        title: "AI prompts",
        description: "Manage system prompts provided to the course assistant.",
        metrics: {
            total: "All prompts",
            active: "Active",
            selectedCourse: "Selected course"
        },
        create: {
            title: "Course and new prompt",
            description: "Select a course first, then add a new prompt.",
            selectCourse: "Select course",
            promptPlaceholder: "Enter prompt text",
            editPlaceholder: "Prompt text"
        },
        list: {
            title: "Prompt list",
            description: "Current prompts for the selected course."
        },
        languages: {
            ky: "Kyrgyz",
            ru: "Russian",
            en: "English"
        },
        order: {
            "0": "Top",
            "1": "Middle",
            "2": "End"
        },
        status: {
            active: "Active",
            inactive: "Inactive"
        },
        actions: {
            add: "Add prompt",
            save: "Save",
            cancel: "Cancel",
            edit: "Edit",
            delete: "Delete"
        },
        promptMeta: "Language: {{language}} · Order: {{order}} · {{status}}",
        empty: {
            title: "No AI prompts found",
            subtitle: "No prompts have been added for this course yet."
        },
        confirm: {
            deleteTitle: "Delete AI prompt",
            deleteMessage: "Are you sure you want to delete this AI prompt?"
        },
        toasts: {
            loadError: "Could not load AI prompts.",
            selectCourse: "Select a course before adding an AI prompt.",
            created: "AI prompt created.",
            createError: "Could not create AI prompt.",
            updated: "AI prompt updated.",
            updateError: "Could not update AI prompt.",
            deleted: "AI prompt deleted.",
            deleteError: "Could not delete AI prompt."
        }
    },
    adminUsers: {
        eyebrow: "People and access",
        title: "Users",
        description: "Search users, change roles, and manage accounts.",
        metrics: {
            currentPage: "On this page",
            total: "Total users",
            instructors: "Instructors",
            admins: "Admins"
        },
        roles: {
            student: "Student",
            instructor: "Instructor",
            assistant: "Assistant",
            admin: "Admin",
            superadmin: "Super Admin",
            unknown: "unknown"
        },
        filters: {
            title: "Filters",
            description: "Refine the list by search and role.",
            searchPlaceholder: "Search by name or email",
            allRoles: "All roles"
        },
        list: {
            title: "User list"
        },
        fallbacks: {
            noName: "No name",
            noEmail: "no email"
        },
        actions: {
            delete: "Delete",
            changeRole: "Change role",
            changeRoleAria: "Change role for {{user}}",
            deleteSelfTitle: "You cannot delete your own account"
        },
        empty: {
            title: "No users found",
            subtitle: "Change filters or wait for new users."
        },
        pagination: {
            summary: "Page {{page}} / {{totalPages}} · Total: {{total}}",
            previous: "Previous",
            next: "Next"
        },
        confirm: {
            deleteTitle: "Delete user",
            deleteMessage: "Are you sure you want to delete {{user}}? This action will stop account access.",
            roleTitle: "Change role",
            roleMessage: "Change {{user}} role from \"{{currentRole}}\" to \"{{newRole}}\"? This immediately affects access permissions."
        },
        toasts: {
            loadError: "Could not load users.",
            loadStudentsError: "Could not load students.",
            deleted: "User deleted.",
            deleteError: "Could not delete user.",
            roleChanged: "Role changed.",
            roleError: "Could not change role.",
            selectGroup: "Select a group first for a delivery course.",
            enrolled: "Student enrolled in course.",
            enrollError: "Could not enroll student."
        }
    },
    adminCourses: {
        eyebrow: "Catalog operations",
        title: "Courses and categories",
        description: "Manage courses, categories, and technical course operations.",
        operations: "Course operations",
        metrics: {
            courses: "Courses",
            published: "Published",
            categories: "Categories",
            delivery: "Delivery courses"
        },
        workflows: {
            catalog: {
                label: "Catalog",
                description: "Manage courses and categories."
            },
            enrollment: {
                label: "Enrollment",
                description: "Add users to video courses or offline/live groups."
            },
            media: {
                label: "Media operations",
                description: "HLS transcoding and technical video actions."
            }
        },
        catalog: {
            title: "Courses",
            description: "Review course cards, preview courses, and clean up the catalog."
        },
        enrollment: {
            title: "Course enrollment",
            description: "Add students to the correct course or delivery group context.",
            selectGroup: "Select group",
            enrollInGroup: "Enroll user in group",
            enrollInCourse: "Enroll user in course",
            selectGroupFirst: "Select a group first",
            selectUser: "Select user"
        },
        categories: {
            title: "Categories",
            description: "Add, rename, and clean up categories.",
            placeholder: "New category name"
        },
        status: {
            published: "Published",
            draft: "Draft"
        },
        deliveryModes: {
            individual: "Individual",
            group: "Group"
        },
        actions: {
            add: "Add",
            view: "View",
            edit: "Edit",
            save: "Save",
            cancel: "Cancel",
            delete: "Delete"
        },
        empty: {
            title: "No courses in the system",
            subtitle: "No courses have been added to the platform."
        },
        fallback: {
            course: "Course #{{id}}",
            category: "Category #{{id}}",
            group: "Group #{{id}}",
            section: "Section #{{id}}",
            lesson: "Lesson #{{id}}",
            courseGeneric: "Course",
            sectionGeneric: "Section",
            unknownError: "Unknown error"
        },
        confirm: {
            deleteCourseTitle: "Delete course",
            deleteCourseMessage: "Are you sure you want to delete \"{{title}}\"? This may remove the course from the catalog and student learning flows.",
            deleteCategoryTitle: "Delete category",
            deleteCategoryMessage: "Are you sure you want to delete \"{{name}}\"? Courses linked to this category may need review."
        },
        toasts: {
            loadError: "Could not load courses and categories.",
            courseDeleted: "Course deleted.",
            courseDeleteError: "Could not delete course.",
            categoryCreated: "Category created.",
            categoryCreateError: "Could not create category.",
            categoryUpdated: "Category updated.",
            categoryUpdateError: "Could not update category.",
            categoryDeleted: "Category deleted.",
            categoryDeleteError: "Could not delete category."
        },
        transcode: {
            title: "HLS transcoding",
            description: "Videos are now automatically transcoded to HLS. Use this only for failed or older videos.",
            autoNotice: "Auto-transcoding is enabled: new video uploads are converted to HLS automatically.",
            labels: {
                course: "Course",
                section: "Section",
                lesson: "Lesson"
            },
            selectCourse: "Select course",
            selectSection: "Select section",
            selectLesson: "Select lesson (or leave empty for all)",
            allVideoLessons: "All video lessons",
            processingSuffix: "(transcoding)",
            lessonIdsLabel: "Or enter lesson IDs (separator: 61,62,63)",
            lessonIdsPlaceholder: "Lesson IDs (for bulk)",
            alreadySingle: "\"{{title}}\" has already been transcoded to HLS.",
            alreadyBulk: "All video lessons have already been transcoded to HLS.",
            help: "Course and section are required. Ready HLS videos are skipped; transcoding may take several minutes.",
            statusLabel: "Transcoding status",
            bulkStatusLabel: "Bulk transcoding status",
            statusAria: "Video transcoding status: {{status}}",
            statusAriaWithError: "Video transcoding status: {{status}}. {{error}}",
            status: {
                missing: "No video",
                uploaded: "Ready to transcode",
                stuck: "Stuck: force retry needed",
                starting: "Starting transcode...",
                processing: "Transcoding in progress",
                ready: "Ready to play",
                failed: "Transcode failed"
            },
            errorTitle: "Transcoding error",
            errors: {
                statusFetchFailed: "Could not refresh transcoding status.",
                playbackFailed: "Video transcoding failed. Try retrying the transcode."
            },
            readyMessage: "Transcoding completed successfully. Video is ready to play.",
            processingMessage: "Waiting for the video to convert to HLS...",
            bulkProcessingMessage: "All videos in this section are being converted to HLS. This may take several minutes. Reload the section to view status.",
            actions: {
                retry: "Retranscode",
                bulk: "Bulk transcode",
                refreshStatus: "Recheck transcode status"
            },
            retry: {
                title: "Retry the video transcoding process",
                button: "Retry transcoding",
                loading: "Retrying...",
                aria: "Retry video transcoding",
                shortTitle: "Retry transcoding",
                shortButton: "Retry",
                forceAria: "Force retry stuck transcoding",
                forceTitle: "Force restart stuck transcoding",
                forceButton: "Force retry",
                errors: {
                    missingIds: "Missing course, section, or lesson ID required for retry.",
                    missingHandler: "Retry function is not available.",
                    failed: "Failed to retry transcoding. Please try again."
                }
            },
            history: {
                title: "Latest transcode actions",
                singleStartFailed: "Single lesson transcode did not start",
                bulkStartFailed: "Bulk transcode did not start",
                completed: "Transcoding completed",
                skipped: "Transcoding skipped",
                bulkSkipped: "Bulk transcoding skipped",
                allReady: "All videos in this section are ready.",
                bulkStarted: "Bulk transcoding started",
                videoLessonCount: "{{count}} video lesson"
            },
            toasts: {
                fillAllIds: "Fill in all IDs.",
                started: "Transcoding started.",
                startError: "Could not start transcoding.",
                fillCourseSection: "Fill in Course and Section ID.",
                bulkStarted: "Bulk transcoding started: {{started}}/{{total}}",
                bulkError: "Could not start bulk transcoding.",
                lessonComplete: "Lesson {{id}} transcode complete",
                lessonFailed: "Lesson {{id}} transcode failed"
            }
        }
    },
    adminExtResources: {
        eyebrow: "Content management",
        title: "Free external resources",
        description: "Create, publish, and link external resources to courses.",
        metrics: {
            total: "Total resources",
            published: "Published",
            featured: "Featured"
        },
        workflows: {
            catalog: "Catalog",
            linking: "Link to course"
        },
        status: {
            published: "Published",
            draft: "Draft",
            featured: "Featured",
            paidOnly: "Paid only"
        },
        create: {
            title: "Add a new resource",
            description: "Fill in the key fields for a new free external resource."
        },
        list: {
            title: "All resources",
            description: "Published and draft resources."
        },
        fields: {
            slug: "Slug (URL)",
            title: "Title",
            provider: "Provider",
            providerKey: "Provider key",
            url: "Official URL",
            category: "Category",
            level: "Level",
            priceLabel: "Price",
            durationLabel: "Duration",
            certificateLabel: "Certificate label",
            certificateCost: "Certificate cost",
            canAuditFree: "Free to audit (no certificate)",
            coverImageUrl: "Cover image URL",
            language: "Language",
            sortOrder: "Sort order",
            isPublished: "Published",
            isFeatured: "Featured",
            shortDescription: "Short description",
            shortDescriptionPlaceholder: "Brief overview of the course...",
            whatYouWillLearn: "What you'll learn",
            whoIsItFor: "Who is it for",
            whyRecommended: "Why recommended",
            whyRecommendedPlaceholder: "Why EduBot recommends this course...",
            difficultyNotes: "Difficulty notes",
            listHint: "One item per line"
        },
        tabs: {
            basic: "Basic info",
            description: "Description",
            curriculum: "Curriculum"
        },
        curriculum: {
            week: "Week",
            weekTitle: "Title",
            weekDescription: "Description",
            addWeek: "Add week",
            remove: "Remove",
            empty: "No weeks added yet. Click \"Add week\" to start building the curriculum.",
            weeksCount: "{{n}} weeks",
            noWeeks: "No curriculum"
        },
        actions: {
            addNew: "Add resource",
            create: "Create",
            save: "Save",
            edit: "Edit",
            cancel: "Cancel",
            delete: "Delete",
            publish: "Publish",
            unpublish: "Unpublish",
            feature: "Feature",
            unfeature: "Unfeature",
            link: "Link",
            unlink: "Unlink"
        },
        linking: {
            title: "Link to course",
            description: "Associate resources with EduBot courses.",
            selectCourse: "Select a course",
            chooseCourse: "Choose a course...",
            resourcesLabel: "Resources",
            linked: "linked"
        },
        empty: {
            title: "No resources",
            subtitle: "Add the first resource."
        },
        autofill: {
            title: "AI Autofill — paste a course URL to generate all fields",
            placeholder: "https://coursera.org/professional-certificates/google-it-support",
            generate: "Generate",
            loading: "Generating...",
            error: "AI could not generate content. Check the URL and try again.",
            modeUrl: "AI Autofill (URL)",
            modePaste: "Paste JSON"
        },
        paste: {
            title: "Paste AI-generated JSON to fill all fields",
            placeholder: "Paste the JSON generated from the prompt template here...",
            fill: "Fill Form",
            errorInvalidJson: "Invalid JSON — paste a valid JSON object generated from the template."
        },
        confirmDelete: "Delete \"{{title}}\"?",
        created: "Resource created.",
        saved: "Saved.",
        deleted: "Resource deleted.",
        linked: "Linked.",
        unlinked: "Unlinked.",
        errors: {
            loadFailed: "Failed to load resources.",
            saveFailed: "Failed to save.",
            deleteFailed: "Failed to delete.",
            linkFailed: "Failed to update link."
        }
    }
};
