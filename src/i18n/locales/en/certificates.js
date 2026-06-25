export const certificates = {
    certificates: {
        download: {
            eyebrow: "Certificate PDF",
            title: "Certificate is downloading",
            description: "We are preparing the PDF file. If the browser blocks the download, you can try again from this page.",
            status: {
                failed: "Download failed",
                ready: "Download started",
                preparing: "PDF is being prepared"
            },
            messages: {
                failedTitle: "We could not download the certificate right now",
                readyTitle: "The file should download through your browser",
                preparingTitle: "Certificate file is being prepared",
                readyDescription: "If the file is not visible, check your browser downloads or try downloading again.",
                preparingDescription: "This usually takes only a few seconds. Keep this page open."
            },
            errors: {
                missingId: "Certificate identifier was not found.",
                downloadFailed: "PDF did not download. The browser may have blocked the download or the certificate is unavailable right now."
            },
            actions: {
                preparing: "Preparing",
                retry: "Download again",
                openVerification: "Open verification page",
                home: "Back to home"
            },
            labels: {
                certificateId: "Certificate ID"
            }
        },
        verification: {
            hero: {
                eyebrow: "EduBot Learning registry",
                title: "Certificate verification",
                description: "This page explains the current status of a certificate in the EduBot Learning registry for external verification."
            },
            loading: "Loading verification information...",
            status: {
                issued: {
                    label: "Verified",
                    description: "This certificate is active and valid in the EduBot Learning registry.",
                    guidance: "A third party can use this record to confirm that the student successfully completed the course."
                },
                pending: {
                    label: "Pending",
                    description: "A certificate record exists, but final approval is not complete yet.",
                    guidance: "Do not use this state as final official proof. Check again later or contact EduBot support."
                },
                revoked: {
                    label: "Revoked",
                    description: "This certificate was previously issued, but it is no longer valid.",
                    guidance: "A revoked certificate should not be accepted as proof of completion."
                },
                rejected: {
                    label: "Rejected",
                    description: "This certificate request was rejected and was not issued as a valid certificate.",
                    guidance: "This record is not an official certificate. Contact EduBot support if the information looks incorrect."
                }
            },
            error: {
                title: "Certificate could not be verified",
                description: "Check the link again. If this should be an official certificate, contact EduBot Learning support."
            },
            errors: {
                missingId: "Certificate identifier was not found.",
                notFound: "Certificate was not found or cannot be verified through this link."
            },
            labels: {
                certificateId: "Certificate ID",
                partner: "Partner",
                student: "Student",
                course: "Course",
                issuedAt: "Issued date",
                signer: "Signer",
                verificationLink: "Verification link",
                registryOwner: "Registry owner",
                registryOwnerHelper: "The primary party that issued and verifies this certificate."
            },
            official: {
                title: "Official verification",
                registry: "EduBot Learning registry",
                description: "This record relies on the EduBot Learning verification registry, not a QR code or third-party service."
            },
            actions: {
                contactSupport: "Contact support",
                home: "Back to home",
                copyLink: "Copy link",
                copied: "Copied",
                open: "Open"
            },
            copy: {
                missing: "The verification link is not shown right now.",
                unsupported: "This browser does not support automatic copying. Copy the link manually below.",
                failed: "Could not copy the link. Copy the text below manually."
            },
            fallbacks: {
                notSpecified: "Not specified",
                certificate: "Certificate",
                noLink: "Link not shown"
            },
            revokedAt: "Revoked on {{date}}."
        }
    },
    adminCertificates: {
        errors: {
            courseNotAssigned: "This course is not assigned to you.",
            loadStudentCourses: "Could not load the student course list.",
            loadStudents: "Could not load course students.",
            exactPreviewLoad: "Certificate preview did not load."
        },
        previewCanvas: {
            mainTitle: "CERTIFICATE OF COMPLETION",
            supportingText: "has successfully completed the course",
            issuedLabel: "Issued",
            verificationLabel: "Verification ID preview",
            fallbackTitle: "Certificate of Achievement",
            partnershipLabel: "In partnership with",
            certifiesLabel: "This certifies that",
            secondaryBrandLogoAlt: "Secondary brand logo preview",
            signatureAlt: "Signature preview",
            adminIssuerTitle: "Admin",
            instructorIssuerTitle: "Instructor",
            sampleStudentName: "Aigerim Sadykova",
            sampleCourseTitle: "Selected Course",
            sampleIssuerName: "Instructor Name"
        },
        page: {
            hero: {
                eyebrow: "Certificate workspace",
                title: "Certificates",
                adminDescription: "Select a course and manage certificate rules, branding, signer details, and certificates issued to students here.",
                instructorDescription: "Select a course and manage certificate language, your signature image, and certificates issued to students here."
            },
            actions: {
                refresh: "Refresh",
                createCourse: "Create course",
                backToCourses: "Back to courses",
                saveRequirements: "Save requirements"
            },
            metrics: {
                totalStudents: "Total students",
                courses: "Courses",
                courseCertificates: "Certificates in this course",
                averageProgress: "Average progress",
                courseStudents: "Students in this course",
                lessons: "Lessons",
                completed: "Completed",
                registryCertificates: "Registry certificates"
            },
            selection: {
                title: "Selection",
                description: "Select a course to manage certificates. You can also choose a specific student inside that course.",
                loadingCourses: "Loading courses...",
                courseLabel: "Course",
                selectCourse: "Select course",
                studentLabel: "Student",
                allStudents: "All students",
                visibilityLabel: "View",
                specificStudentSelected: "Specific student selected",
                studentsVisible: "{{count}} student shown",
                studentsVisible_plural: "{{count}} students shown",
                noCourseSelected: "Select a course first",
                noCoursesTitle: "No courses yet",
                noCoursesSubtitle: "Create a course first, then certificates will be managed here.",
                noCoursePanelTitle: "No course selected",
                noCoursePanelDescription: "This tab is for certificate work. Select a course above to continue.",
                noCoursePanelBody: "After selecting a course, template, registry, and student certificate actions open here."
            },
            courseWorkspace: {
                fallbackTitle: "Certificates",
                description: "After a course is selected, template, registry, and certificate issuing actions run in this block."
            },
            filters: {
                title: "Selection and filters",
                description: "Filter course students to find a specific student or quickly separate students with enough progress.",
                studentSearch: "Search student",
                searchPlaceholder: "Name, email, or phone",
                studentSelector: "Student selector",
                progressMin: "Progress at least",
                progressMax: "Progress up to",
                pageSize: "Students per page",
                pageSizeOption: "{{count}} / page",
                clear: "Clear filters",
                selectedStudentOffPage: "Selected student is not on this page",
                summaryRange: "Showing {{start}}-{{end}} of {{total}} students",
                summarySingle: "Showing the selected student",
                summaryPage: "Page {{page}} of {{total}}"
            },
            rule: {
                title: "Certificate rule",
                description: "Choose whether a certificate is issued immediately after course completion or approved by an instructor.",
                current: "Current:",
                approvalModeInstructor: "Instructor approves",
                approvalModeAutomatic: "Issued immediately",
                switchToAutomatic: "Switch to immediate issue",
                switchToInstructorApproval: "Enable approval mode"
            },
            requirements: {
                title: "Completion requirements",
                description: "Video courses are calculated from lesson progress. Offline and live courses create auto-certificates when these requirements are met.",
                attendance: {
                    title: "Attendance",
                    description: "Sessions must be completed, and attendance percentage must meet the threshold."
                },
                homework: {
                    title: "Homework",
                    description: "Published tasks assigned to the student must be approved."
                },
                activities: {
                    title: "Class activities",
                    description: "Passed quizzes and approved exercises or group work count toward this requirement."
                },
                minimumPercent: "Minimum %"
            },
            template: {
                title: "Certificate template",
                adminDescription: "EduBot Learning remains the primary brand. Configure course-level template rules here.",
                instructorDescription: "View the course certificate design and issued certificates here.",
                editMode: "Edit mode",
                viewMode: "View mode",
                editModeDescription: "Change and save the template rules stored for this course.",
                viewModeDescription: "Template rules are in view mode. Turn on edit mode to make changes.",
                saving: "Saving...",
                saveRules: "Save rules",
                replace: "Replace",
                upload: "Upload",
                notProvided: "Not provided",
                languageOptions: {
                    en: "English",
                    ru: "Русский",
                    ky: "Кыргызча"
                },
                orientationOptions: {
                    landscape: "Landscape",
                    portrait: "Portrait"
                },
                branding: {
                    title: "Branding",
                    description: "Update the certificate title, partner brand, and logo here.",
                    primaryBrandBadge: "EduBot primary brand",
                    certificateTitle: "Certificate title",
                    secondaryBrand: "Secondary brand",
                    secondaryBrandPlaceholder: "Company or partner name",
                    secondaryLogo: "Secondary brand logo",
                    logoFormats: "PNG, JPG, or WEBP",
                    secondaryLogoAlt: "Secondary brand logo preview",
                    logoEmpty: "The logo will appear here after upload.",
                    logoUploading: "Uploading logo...",
                    logoReady: "Logo is ready. You can replace it if needed.",
                    logoOptional: "Leave this field empty if a partner logo is not needed."
                },
                signer: {
                    title: "Signer",
                    description: "This information is used when issuing the certificate. Name, role, and signature image are not saved as course rules.",
                    certificateLanguage: "Certificate language",
                    signerName: "Signer",
                    signerNamePlaceholder: "Instructor name",
                    signerRole: "Signer role",
                    signerRolePlaceholder: "Instructor",
                    certificateFormat: "Certificate format",
                    signature: "Signature",
                    signatureDescription: "Draw and save the signature in a separate window.",
                    updateSignature: "Update signature",
                    drawSignature: "Draw signature",
                    signatureAlt: "Signature preview",
                    signatureEmpty: "The signature image will appear here after upload.",
                    signatureSaving: "Saving signature...",
                    signatureReady: "Signature is ready. It automatically updates the line on the certificate.",
                    signatureHelp: "After drawing and saving the signature, it will appear here."
                },
                appearance: {
                    title: "Appearance",
                    description: "Choose page orientation, primary color, and accent color.",
                    resetDefaults: "Reset defaults",
                    pageOrientation: "Page orientation",
                    primaryColor: "Primary color",
                    accentColor: "Accent color",
                    presets: "Ready themes",
                    presetsDescription: "Switch color pairs with one click"
                },
                preview: {
                    livePreview: "Live preview",
                    fullPreview: "Full preview",
                    exactLoading: "Certificate preview is loading...",
                    exactFrameTitle: "Certificate preview",
                    unsavedChanges: "Changes are not saved yet",
                    templateSaved: "Template saved",
                    unavailable: "Preview is unavailable."
                },
                footer: {
                    primaryBrand: "Primary brand:",
                    secondaryBrandSummary: " · Secondary: {{brand}}",
                    unsavedChanges: "There are unsaved changes",
                    allChangesSaved: "All changes are saved",
                    regenerating: "Regenerating...",
                    regeneratePdf: "Regenerate PDF",
                    regenerateHelp: "Recreates previously generated certificate files",
                    saveTemplate: "Save template",
                    saveTemplateHelp: "Saves template settings. PDF files are regenerated separately",
                    regenerateNote: "`Regenerate PDF` recreates previously generated certificate files.",
                    saveTemplateNote: "`Save template` stores settings but does not automatically recreate PDF files."
                }
            },
            registry: {
                title: "Certificate registry",
                description: "Latest status of certificates created for this course.",
                metrics: {
                    issued: "Issued",
                    pending: "Pending",
                    revoked: "Revoked",
                    rejected: "Rejected"
                },
                studentFallback: "Student #{{id}}",
                empty: "No certificates have been created for this course yet."
            },
            students: {
                title: "Students",
                loadingDescription: "The list is loading.",
                issueTitle: "Issue certificates to students",
                issueDescription: "Course and student selection are combined here: find a student and issue or approve based on certificate status.",
                selectedNotFoundDescription: "The selected student was not found with this filter.",
                emptyDescription: "This course list is empty for now.",
                selectedNotFoundTitle: "This student does not match the current filter",
                emptyTitle: "This course has no students yet",
                selectedNotFoundSubtitle: "Choose another student or clear the selector.",
                emptySubtitle: "Try another course or wait for enrollments.",
                eligibility: {
                    attendance: "Attendance:",
                    homework: "Homework:",
                    activities: "Activities:"
                }
            },
            pagination: {
                previous: "Previous",
                next: "Next",
                page: "Page {{page}} / {{total}}"
            },
            signatureModal: {
                title: "Draw signature",
                description: "Save after drawing. The updated signature is applied to the certificate immediately."
            }
        },
        signaturePad: {
            title: "Or sign here",
            description: "The drawn signature is saved as a transparent PNG.",
            clear: "Clear",
            save: "Save signature"
        },
        status: {
            issued: "Certificate issued",
            pending_approval: "Certificate pending review",
            rejected: "Certificate rejected",
            revoked: "Certificate revoked",
            none: "No certificate"
        },
        actions: {
            issue: "Issue",
            issuing: "Issuing...",
            reissue: "Reissue",
            approve: "Approve",
            approving: "Approving...",
            reject: "Reject",
            sending: "Sending...",
            revoke: "Revoke",
            revoking: "Revoking...",
            downloadPdf: "Download PDF",
            pdf: "PDF",
            verify: "Verify"
        },
        eligibilityReasons: {
            sessionsMissing: "sessions are not created",
            sessionsIncomplete: "sessions are not complete",
            attendanceBelowThreshold: "attendance is below threshold",
            homeworkBelowThreshold: "homework is below threshold",
            activitiesBelowThreshold: "class activities are below threshold",
            lessonProgressIncomplete: "lesson progress is incomplete"
        },
        state: {
            issued: {
                button: "Issued",
                helper: "Certificate is active. You can use the PDF or verification link."
            },
            pending: {
                button: "In review",
                helper: "The request already exists. It now needs approval or rejection."
            },
            incomplete: {
                requirementsButton: "Requirements incomplete",
                manualWithMissing: "Auto-issue requirements are incomplete: {{missing}}. You can still issue the certificate manually.",
                manualWithProgress: "The course is not fully complete. Current progress: {{progress}}%. You can still issue the certificate now.",
                blockedWithMissing: "Certificate requirements are incomplete: {{missing}}.",
                blockedWithProgress: "The course is not fully complete. Current progress: {{progress}}%."
            },
            rejected: {
                manualHelper: "The previous certificate was rejected. The course is complete, so it can be reissued.",
                helper: "The previous certificate was rejected."
            },
            revoked: {
                manualHelper: "The previous certificate was revoked. You can issue a new one if needed.",
                helper: "The previous certificate was revoked."
            },
            ready: {
                button: "Ready",
                manualHelper: "The student completed the course. The certificate can be issued now.",
                helper: "The student completed the course. The certificate is issued by automation or admin rules."
            }
        },
        studentCard: {
            enrolledAt: "Enrolled",
            completion: "Completion"
        },
        toasts: {
            featureDisabled: "Certificates are disabled for this tenant.",
            ruleUpdated: "Certificate rule updated.",
            ruleUpdateError: "Could not update certificate rule.",
            templateSaved: "Certificate template saved.",
            templateSaveError: "Could not save certificate template.",
            regenerated: "{{count}} certificate regenerated.",
            noneRegenerated: "No certificates found to regenerate.",
            regenerateError: "Could not regenerate certificate PDF files.",
            signatureSaved: "Signature saved.",
            secondaryLogoUploaded: "Secondary brand logo uploaded.",
            signatureSaveError: "Could not save signature.",
            assetUploadError: "Could not upload certificate asset.",
            certificateUpdated: "Certificate updated.",
            certificateActionError: "Could not complete certificate action."
        }
    }
};
