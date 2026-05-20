export const integrations = {
    integrationTab: {
        toasts: {
            loadFailed: "Could not load integration data.",
            detailLoadFailed: "Could not load event details.",
            copied: "{{label}} copied.",
            copyFailed: "Could not copy {{label}}."
        },
        hero: {
            eyebrow: "CRM and LMS sync",
            title: "CRM-LMS integration",
            description: "Webhook health, risk summary, and enrollment status events."
        },
        filters: {
            severity: "Severity",
            issueType: "Risk type",
            enrollmentStatus: "Enrollment status",
            from: "From",
            to: "To"
        },
        metrics: {
            riskToday: "Risk alerts today",
            criticalAlerts: "Critical alerts",
            enrollmentEvents: "Enrollment events",
            pendingWebhook: "Pending webhooks",
            failedWebhook: "Failed webhooks",
            lastSent: "Last sent",
            pendingCrmEnrollments: "Pending CRM enrollments",
            dispatchErrors: "Enrollment dispatch errors",
            lastPendingEnrollment: "Last pending enrollment"
        },
        quickViews: {
            pending: "Pending",
            active: "Active",
            failedDispatch: "Failed dispatch"
        },
        sections: {
            pending: {
                title: "Pending CRM enrollments",
                description: "Enrollment events currently pending in the LMS and sent to CRM."
            },
            risk: {
                title: "Recent critical risk alerts",
                description: "Major sync issues between LMS and CRM."
            },
            events: {
                title: "Enrollment status events",
                description: "Enrollment status history received through webhooks."
            }
        },
        table: {
            time: "Time",
            enrollment: "Enrollment",
            student: "Student",
            crmLead: "CRM lead",
            access: "Access",
            dispatch: "Dispatch",
            note: "Note",
            severity: "Severity",
            lmsStudent: "LMS student",
            summary: "Summary",
            eventId: "Event ID",
            enrollmentStatus: "Enrollment status",
            error: "Error"
        },
        empty: {
            pending: {
                title: "No pending CRM enrollments found",
                subtitle: "There are no pending enrollments currently visible from CRM."
            },
            risk: {
                title: "No critical risk alerts found",
                subtitle: "No major alerts match the current filters."
            },
            events: {
                title: "No enrollment events found",
                subtitle: "No enrollment events match the current filters."
            }
        },
        detail: {
            title: "Enrollment event details",
            eventTime: "Event time",
            lmsEnrollment: "LMS enrollment",
            lmsEnrollmentId: "LMS enrollment ID",
            studentName: "Student name",
            lmsStudentId: "LMS student ID",
            crmLeadId: "CRM lead ID",
            dispatchStatus: "Dispatch status",
            loadingPayload: "Loading full payload...",
            webhookPayload: "Webhook payload"
        },
        actions: {
            viewDetails: "View details",
            openUserCard: "Open user card",
            openWithFilter: "Open with matching filter"
        },
        fallbacks: {
            unknownName: "Unknown name"
        },
        riskSeverity: {
            critical: "Critical",
            high: "High",
            medium: "Medium",
            low: "Low"
        },
        riskIssueType: {
            low_attendance: "Low attendance",
            inactive_student: "Inactive student",
            low_homework_completion: "Low homework completion",
            low_quiz_participation: "Low quiz participation",
            payment_risk: "Payment risk",
            missing_attendance: "Missing attendance",
            attendance_drop: "Attendance drop",
            missing_homework: "Missing homework",
            payment_overdue: "Payment overdue",
            no_access: "No access"
        },
        enrollmentStatus: {
            pending: "Pending",
            active: "Active",
            cancelled: "Cancelled",
            completed: "Completed"
        },
        accessStatus: {
            active: "Active",
            locked: "Locked",
            pending: "Pending",
            revoked: "Revoked"
        },
        dispatchStatus: {
            sent: "Sent",
            failed: "Failed",
            pending: "Pending"
        }
    },
    company: {
        fields: {
            name: "Company name",
            about: "Description",
            logo: "Logo",
            website: "Website",
            email: "Email",
            phone: "Phone",
            contactName: "Contact person",
            contactEmail: "Contact email",
            contactPhone: "Contact phone",
            address: "Address",
            city: "City",
            country: "Country",
            telegram: "Telegram",
            whatsapp: "WhatsApp",
            instagram: "Instagram",
            taxId: "Tax ID",
            notes: "Internal notes"
        },
        list: {
            title: "Tenant companies",
            subtitle: "Manage tenant workspaces, review company operations, and create new tenants with clear ownership.",
            results: "Results",
            searchLabel: "Search companies",
            searchPlaceholder: "Search by company name",
            clear: "Clear",
            searchHint: "Search is saved in the URL so this filtered view can be reopened.",
            createTitle: "Create tenant",
            createHint: "Create the company first, then configure contacts, members, courses, and CRM links inside the workspace.",
            creating: "Creating...",
            createAction: "Create company",
            directoryTitle: "Company directory",
            filteredBy: "Filtered by \"{{query}}\".",
            directorySubtitle: "All tenant workspaces available to your role.",
            pageOf: "Page {{page}} of {{totalPages}}",
            loadErrorTitle: "Companies could not be loaded",
            loadErrorSubtitle: "The tenant directory is unavailable. Retry the request before creating or opening tenants.",
            retry: "Retry",
            noDescription: "No description yet.",
            openWorkspace: "Open workspace",
            emptySearchTitle: "No companies match this search",
            emptyTitle: "No companies yet",
            emptySearchSubtitle: "Clear the search or try a different company name.",
            emptySubtitle: "Create the first tenant company to start assigning members and courses.",
            clearSearch: "Clear search",
            paginationLabel: "Company pages",
            previous: "Previous",
            next: "Next",
            toasts: {
                loadError: "Could not load companies.",
                nameRequired: "Company name is required.",
                created: "Company created.",
                createError: "Could not create company."
            }
        },
        detail: {
            subtitle: "Manage this tenant profile, users, and course availability from one workspace.",
            notSet: "Not set",
            loadErrorTitle: "Company could not be loaded",
            loadErrorSubtitle: "The tenant may be unavailable or you may not have access. Try loading it again.",
            retry: "Retry",
            backToCompanies: "Back to companies",
            managementAccess: "Management access",
            readOnlyAccess: "Read-only access",
            tabsLabel: "Company workspace sections",
            summary: {
                role: "Role",
                email: "Email",
                phone: "Phone",
                city: "City"
            },
            tabs: {
                settings: {
                    label: "Company profile",
                    description: "Brand, contacts, address, and legal information"
                },
                members: {
                    label: "Members",
                    description: "Roles, invites, and workspace access"
                },
                courses: {
                    label: "Courses",
                    description: "Course assignments for this tenant"
                }
            },
            toasts: {
                loadError: "Could not load company details."
            }
        },
        platformTenant: {
            adminFallback: "Admin",
            tenant: "Tenant",
            logoAlt: "{{name}} logo",
            uploadingLogo: "Uploading...",
            headerSubtitle: "Manage platform tenant profile, domain, plan, and integrations.",
            hideMenu: "Hide menu",
            showMenu: "Show menu",
            tenantRegistry: "Tenant registry",
            notFoundTitle: "Tenant not found",
            notFoundSubtitle: "Return to the platform tenant registry.",
            eyebrow: "Platform tenant",
            tenants: "Tenants",
            confirmAction: "Confirm action",
            confirm: "Confirm",
            notConfigured: "Not configured",
            notLinked: "Not linked",
            values: {
                enabled: "Enabled",
                disabled: "Disabled"
            },
            fields: {
                subdomain: "Subdomain",
                customDomain: "Custom domain",
                effectiveDomain: "Effective domain",
                timezone: "Timezone",
                locale: "Locale",
                status: "Status",
                plan: "Plan",
                billingStatus: "Billing status",
                crmTenantId: "CRM tenant ID",
                crmSlug: "CRM slug",
                crmPrimaryDomain: "CRM primary domain"
            },
            tabs: {
                overview: "Overview",
                profile: "Profile",
                domain: "Domain",
                billing: "Plan and billing",
                crm: "CRM link",
                members: "Owners and admins",
                courses: "Courses",
                branding: "Branding",
                settings: "Settings",
                flags: "Feature flags",
                activity: "Activity"
            },
            status: {
                trial: "Trial",
                active: "Active",
                inactive: "Inactive",
                suspended: "Suspended",
                archived: "Archived"
            },
            metrics: {
                status: "Status",
                plan: "Plan",
                owners: "Owners",
                admins: "Admins",
                courses: "Courses",
                students: "Students",
                flags: "Flags",
                crm: "CRM"
            },
            courseVisibility: {
                PUBLIC: "Public",
                PRIVATE: "Private",
                TENANT_ONLY: "Tenant only"
            },
            snapshot: {
                title: "Tenant snapshot",
                name: "Name",
                locale: "Locale",
                timezone: "Timezone",
                billing: "Billing",
                subdomain: "Subdomain",
                customDomain: "Custom domain",
                crmTenantId: "CRM tenant ID",
                crmPrimaryDomain: "CRM primary domain",
                domain: "Domain",
                ownerAdminRows: "Owner and admin rows"
            },
            lifecycle: {
                title: "Lifecycle",
                description: "Use status changes for tenant access control before considering destructive cleanup.",
                current: "Current: {{status}}",
                activate: "Activate",
                suspend: "Suspend",
                archive: "Archive",
                changeTitle: "Change tenant status",
                changeMessage: "Change tenant status to {{status}}?",
                changeConfirm: "Change status"
            },
            branding: {
                displayName: "Display name",
                certificateLogoUrl: "Certificate logo URL",
                primaryColor: "Primary color",
                secondaryColor: "Secondary color",
                accentColor: "Accent color"
            },
            settings: {
                supportEmail: "Support email",
                defaultCourseVisibility: "Default course visibility",
                allowSelfEnrollment: "Allow self-enrollment",
                requireEnrollmentApproval: "Require enrollment approval"
            },
            featureFlags: {
                customFlags: "Custom flags",
                addCustomFlag: "Add custom flag",
                flagKey: "Flag key",
                value: "Value",
                customFeatureFlag: "Custom feature flag",
                removeFeatureFlag: "Remove feature flag",
                noCustomFlags: "No custom flags configured.",
                video: {
                    label: "Video course creation",
                    description: "Allow this tenant to create private video courses."
                },
                offline: {
                    label: "Offline courses",
                    description: "Allow this tenant to run in-person courses."
                },
                onlineLive: {
                    label: "Online live courses",
                    description: "Allow this tenant to run scheduled live online courses."
                },
                certificates: {
                    label: "Certificates",
                    description: "Enable certificate issuing and certificate configuration."
                },
                attendance: {
                    label: "Attendance",
                    description: "Enable attendance workflows for live or offline sessions."
                },
                homework: {
                    label: "Homework",
                    description: "Enable homework and submission workflows."
                },
                crmSync: {
                    label: "CRM sync",
                    description: "Enable LMS tenant sync with a linked CRM tenant."
                },
                aiAssistant: {
                    label: "AI assistant",
                    description: "Enable AI chat and course assistant features."
                }
            },
            activity: {
                description: "Recent tenant changes recorded by the server.",
                loading: "Loading activity...",
                empty: "No tenant activity recorded yet.",
                roleSummary: "Role: {{role}}",
                userNumber: "User #{{id}}",
                target: "target",
                targetNumber: "{{type}} #{{id}}",
                noDetails: "No details",
                system: "System",
                table: {
                    action: "Action",
                    details: "Details",
                    actor: "Actor",
                    time: "Time"
                },
                actions: {
                    tenantCreated: "Tenant created",
                    tenantUpdated: "Tenant updated",
                    logoUpdated: "Logo updated",
                    roleAdded: "Role added",
                    roleRemoved: "Role removed",
                    memberRemoved: "Member removed",
                    roleChanged: "Role changed",
                    courseAttached: "Course attached",
                    courseRemoved: "Course removed"
                }
            },
            toasts: {
                loadError: "Could not load tenant.",
                activityLoadError: "Could not load tenant activity.",
                saved: "Tenant updated.",
                saveError: "Could not update tenant."
            }
        },
        members: {
            title: "Tenant members",
            description: "Manage tenant roles. Owner is platform-managed and only visible to platform admins.",
            platformTitle: "Owners & Admins",
            platformDescription: "Manage only tenant owner and admin permissions from the platform tenant detail view.",
            searchHelp: "Search an existing user and assign the role they should hold in this tenant.",
            inviteAction: "Invite or create member",
            searchExistingUsers: "Search existing users",
            searchPlaceholder: "Search by name or email...",
            searchResultsLabel: "User search results",
            noMatchingUsers: "No matching users.",
            tenantRole: "Tenant role",
            adding: "Adding...",
            addMember: "Add member",
            sending: "Sending...",
            resendInvite: "Resend invite",
            removing: "Removing...",
            remove: "Remove",
            empty: "No tenant members found.",
            table: {
                user: "User",
                email: "Email",
                role: "Role",
                actions: "Actions"
            },
            roles: {
                fallbackDescription: "Tenant workspace access.",
                owner: {
                    label: "Owner",
                    description: "Platform-managed tenant owner with full ownership visibility."
                },
                company_admin: {
                    label: "Tenant admin",
                    description: "Manages tenant users, courses, and workspace settings."
                },
                instructor: {
                    label: "Instructor",
                    description: "Runs courses, sessions, homework, certificates, and student learning work."
                },
                assistant: {
                    label: "Assistant",
                    description: "Supports attendance, enrollment, and day-to-day tenant operations."
                },
                student: {
                    label: "Student",
                    description: "Learns inside assigned courses and receives onboarding setup links."
                }
            },
            inviteModal: {
                title: "Invite or create member",
                subtitle: "Create a platform user if needed, then attach the tenant role.",
                fullName: "Full name",
                email: "Email",
                sendSetupEmail: "Send setup email",
                setupLink: "Setup link",
                copyLink: "Copy link",
                close: "Close",
                saving: "Saving...",
                createInvite: "Create or invite"
            },
            inviteLinkModal: {
                title: "Invite setup link",
                subtitle: "Copy and share this link if the user did not receive the setup email.",
                emailSent: "Email sent. ",
                expires: "Expires: {{value}}.",
                soon: "soon",
                noSetupLink: "No setup link is available for this member. The account may already be active."
            },
            removeModal: {
                title: "Remove member",
                message: "Remove {{name}} from this tenant?",
                thisMember: "this member"
            },
            toasts: {
                loadError: "Could not load tenant members.",
                selectUser: "Select a user first.",
                added: "Member added.",
                addError: "Could not add member.",
                removed: "Member removed.",
                removeError: "Could not remove member.",
                roleUpdated: "Role updated.",
                roleUpdateError: "Could not update role.",
                userCreated: "User created and added.",
                userAdded: "User added to tenant.",
                inviteError: "Invite or create failed.",
                linkCopied: "Setup link copied.",
                copyError: "Could not copy setup link.",
                inviteResent: "Invite resent.",
                linkRegenerated: "Invite link regenerated.",
                resendError: "Could not resend invite."
            }
        },
        courses: {
            title: "Tenant courses",
            description: "Review assigned courses first. Open add mode only when you need to attach another course to this tenant.",
            assignedCount: "Assigned courses: {{count}}",
            filterHelp: "Search below filters courses already attached to this tenant.",
            filterLabel: "Filter assigned courses",
            filterPlaceholder: "Filter assigned courses",
            closeAddMode: "Close add panel",
            addCourse: "Add course",
            attachTitle: "Attach a new course",
            attachSubtitle: "This search finds courses that are not already attached to this tenant.",
            attachSearchLabel: "Search course to attach",
            attachSearchPlaceholder: "Search course title to attach",
            showingLimit: "Showing up to {{count}} matching courses. Narrow the search for more precise assignment.",
            resultCount: "{{count}} results",
            searchFailedTitle: "Course search failed",
            searchFailedSubtitle: "Try the search again or refresh the tenant course list.",
            retrySearch: "Retry search",
            noCoursesFoundTitle: "No courses found",
            noCoursesFoundSubtitle: "Try a different search term.",
            searchToAttach: "Search for a course title to attach it to this tenant.",
            loadErrorTitle: "Could not load tenant courses",
            loadErrorSubtitle: "The assignments list is unavailable. Retry before changing course links.",
            retry: "Retry",
            attach: "Attach",
            view: "View",
            detaching: "Detaching...",
            detach: "Detach",
            emptyTitle: "No linked courses",
            emptyManageSubtitle: "Attach a course to make it available for this tenant.",
            emptyReadOnlySubtitle: "No courses are linked to this tenant yet.",
            paginationLabel: "Tenant course pages",
            table: {
                course: "Course",
                instructor: "Instructor",
                type: "Type",
                status: "Status",
                action: "Action",
                actions: "Actions"
            },
            types: {
                video: "Video",
                online_live: "Online live",
                offline: "Offline",
                course: "Course"
            },
            status: {
                published: "Published",
                draft: "Draft",
                approved: "Approved",
                pending_approval: "Pending approval",
                in_review: "In review",
                rejected: "Rejected",
                archived: "Archived",
                unknown: "Status unknown"
            },
            price: {
                free: "Free",
                notSet: "Price not set",
                kgs: "{{amount}} KGS"
            },
            disabled: {
                badge: "Disabled for tenant",
                action: "Disabled",
                offline: "Offline courses are disabled for this tenant.",
                onlineLive: "Online live courses are disabled for this tenant.",
                generic: "This course type is disabled for this tenant."
            },
            detachModal: {
                title: "Detach course",
                message: "Detach this course from the tenant? Current students may lose tenant-level access depending on server policy."
            },
            platform: {
                title: "Courses",
                description: "Attach existing courses to this tenant and remove tenant links when needed.",
                searchTenantCourses: "Search tenant courses",
                attachPlaceholder: "Search existing course",
                attaching: "Attaching...",
                courseNumber: "Course #{{id}}",
                noInstructor: "No instructor",
                disabledByFeatureFlags: "disabled by feature flags",
                noMatchingCourses: "No matching courses found.",
                loadingCourses: "Loading courses...",
                remove: "Remove",
                empty: "No courses attached to this tenant."
            },
            toasts: {
                loadError: "Could not load tenant courses.",
                detached: "Course detached from tenant.",
                detachError: "Could not detach course.",
                attached: "Course attached to tenant.",
                attachError: "Could not attach course."
            }
        },
        adminCompanies: {
            headerEyebrow: "Tenant workspace",
            title: "Platform tenants",
            description: "Manage LMS tenants, domains, plan state, and CRM links from one platform-admin surface.",
            createTenant: "Create tenant",
            billingStatuses: {
                trial: "Trial",
                active: "Active",
                pastDue: "Past due",
                cancelled: "Cancelled"
            },
            metrics: {
                tenants: "Tenants",
                active: "Active",
                domains: "Domains",
                crmLinked: "CRM linked"
            },
            registry: {
                title: "Tenant registry",
                description: "Use the registry for quick governance edits. Open tenant detail for deeper profile, CRM, member, and course workspace management.",
                searchPlaceholder: "Search tenants",
                coursesLinked: "Courses linked: {{count}}",
                tenantWorkspace: "Tenant workspace",
                emptyTitle: "No tenants found",
                emptySubtitle: "Create a tenant or adjust the search filter."
            },
            courseLinks: {
                title: "Course links",
                description: "Attach existing courses to tenants while runtime tenant routing remains unchanged.",
                searchPlaceholder: "Search courses or tenant names",
                showing: "Showing {{visible}} of {{total}} courses",
                currentTenant: "Current tenant",
                notSelected: "Not selected",
                selectTenant: "Select tenant",
                noMatchingTitle: "No matching courses",
                noMatchingSubtitle: "Try a different course or tenant search.",
                showMore: "Show more courses",
                emptyTitle: "No courses found",
                emptySubtitle: "There are no courses available for tenant linking yet."
            },
            createModal: {
                title: "Create tenant",
                subtitle: "Create the LMS tenant first. Owner and member cleanup is handled from tenant detail.",
                ownerSearchPlaceholder: "Search existing user by name or email",
                noMatchingOwners: "No matching users found.",
                clearOwner: "Clear owner"
            },
            confirm: {
                clearCourseTitle: "Clear company links",
                clearCourseMessage: "Clear all company assignments for this course?",
                clearCourseConfirm: "Clear links"
            },
            toasts: {
                created: "Tenant created.",
                updated: "Tenant updated.",
                courseLinksCleared: "Course company assignments cleared.",
                courseLinksClearError: "Could not clear company assignments.",
                selectFile: "Select a file."
            }
        },
        settings: {
            title: "Company profile",
            subtitle: "Keep tenant identity, contact, address, and legal details grouped by purpose.",
            cancel: "Cancel",
            saving: "Saving...",
            saveChanges: "Save changes",
            editProfile: "Edit profile",
            logoAlt: "Logo",
            logoPreviewAlt: "Company logo preview",
            noLogo: "No logo",
            uploadLogoFile: "Upload logo file",
            pasteLogoUrl: "Or paste logo URL",
            dangerTitle: "Danger zone",
            dangerSubtitle: "Delete this company only when the tenant should be removed from the platform. This action requires confirmation.",
            deleting: "Deleting...",
            deleteCompany: "Delete company",
            deleteTitle: "Delete company",
            deleteMessage: "Delete \"{{name}}\"? This removes the company workspace from the platform.",
            validation: {
                nameRequired: "Company name is required.",
                email: "Enter a valid email address.",
                website: "Enter a valid website URL."
            },
            toasts: {
                reviewFields: "Review the highlighted fields.",
                saved: "Company profile saved.",
                saveError: "Could not save company profile.",
                deleted: "Company deleted.",
                deleteError: "Could not delete company.",
                logoUploaded: "Logo uploaded.",
                logoUploadFailed: "Logo upload failed.",
                logoUploadError: "Could not upload logo.",
                logoUploadMissingUrl: "Logo uploaded, but no logo URL was returned."
            },
            sections: {
                brand: {
                    title: "Brand profile",
                    description: "Core tenant identity shown across management screens."
                },
                contact: {
                    title: "Contact",
                    description: "Primary support and responsible contact details."
                },
                location: {
                    title: "Location",
                    description: "Address information used for tenant records and communication."
                },
                channels: {
                    title: "Channels",
                    description: "Public social and messaging channels."
                },
                legal: {
                    title: "Legal and notes",
                    description: "Internal legal identifiers and admin notes."
                }
            }
        }
    }
};
