export const PLATFORM_ADMIN_ROLES = ['admin', 'superadmin'];

export const isPlatformAdmin = (userOrRole) => {
    const role = typeof userOrRole === 'string' ? userOrRole : userOrRole?.role;
    return PLATFORM_ADMIN_ROLES.includes(role);
};

export const hasAllowedRole = (user, allowedRoles) => {
    if (!allowedRoles) return true;
    if (allowedRoles.includes(user?.role)) return true;
    return user?.role === 'superadmin' && allowedRoles.includes('admin');
};
