export type RoleCode = string;

export const normalizeRoleCode = (role: unknown): string =>
    (typeof role === 'string' ? role : '').trim().toUpperCase();

export const getRoleCodes = (roles: unknown): string[] => {
    if (!Array.isArray(roles)) return [];
    const codes = roles.map(normalizeRoleCode).filter(Boolean);
    return Array.from(new Set(codes));
};

export const hasRole = (roles: unknown, required: string): boolean => {
    const requiredCode = normalizeRoleCode(required);
    if (!requiredCode) return false;
    return getRoleCodes(roles).includes(requiredCode);
};

