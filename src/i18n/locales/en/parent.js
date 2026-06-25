export const parent = {
    parent: {
        dashboard: {
            title: 'Parent Portal',
            welcome: 'Welcome, {{name}}',
            children: 'Your children',
            noChildren: 'No children linked to your account yet.',
            consentRequired: 'Action required: consent pending',
            consentRequiredDesc: 'Review and grant consent below to receive updates about your child.',
            consentNotice: "Please grant consent to allow this platform to share your child's progress updates with you.",
            revokedNotice: "Consent has been revoked. Grant it again to receive your child's progress updates.",
            badge: {
                granted: 'Granted',
                pending: 'Pending',
                revoked: 'Revoked',
            },
            btn: {
                grantConsent: 'Grant consent',
                revoke: 'Revoke',
            },
            toast: {
                consentGranted: 'Consent granted.',
                consentRevoked: 'Consent revoked.',
                consentError: 'Failed to update consent. Please try again.',
                profileError: 'Failed to load profile.',
            },
        },
    },
};
