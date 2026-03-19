const rawSignupFlag = import.meta.env.VITE_ALLOW_PUBLIC_VIDEO_SIGNUP;

export const isPublicVideoSignupEnabled =
    rawSignupFlag === 'true' || rawSignupFlag === '1';

export function getAuthAcquisitionPath() {
    return isPublicVideoSignupEnabled ? '/register' : '/login';
}
