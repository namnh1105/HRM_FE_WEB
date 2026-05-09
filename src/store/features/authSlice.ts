import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState } from '@/types/store';
import { UserInfo } from '@/types/user';

const initialState: AuthState = {
    accessToken: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
    roles: [],
    permissions: [],
};

export const mapToUserInfo = (raw: any): UserInfo => ({
    id: raw.id,
    email: raw.email ?? raw.username,
    username: raw.username ?? raw.email,
    givenName: raw.givenName ?? raw.given_name,
    familyName: raw.familyName ?? raw.family_name,
    avatarUrl: raw.avatarUrl ?? raw.avatar_url ?? null,
    employee: raw.employee ?? null,
    roles: raw.roles ?? raw.role_codes ?? [],
    permissions: raw.permissions ?? raw.permission_codes ?? [],
    isActive: raw.isActive ?? raw.is_active,
    isDeleted: raw.isDeleted ?? raw.is_deleted,
    createdAt: raw.createdAt ?? raw.created_at,
    updatedAt: raw.updatedAt ?? raw.updated_at,
    createdBy: raw.createdBy ?? raw.created_by,
    updatedBy: raw.updatedBy ?? raw.updated_by,
    deletedAt: raw.deletedAt ?? raw.deleted_at,
    deletedBy: raw.deletedBy ?? raw.deleted_by,
    storeId: raw.storeId ?? raw.store_id ?? raw.employee?.storeId ?? raw.employee?.store_id,
});

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ accessToken: string; refreshToken?: string | null; user: UserInfo }>
        ) => {
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken ?? state.refreshToken;
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.roles = action.payload.user.roles || [];
            state.permissions = action.payload.user.permissions || [];
        },
        setAccessTokenInStore: (state, action: PayloadAction<string>) => {
            state.accessToken = action.payload;
        },
        restoreAuth: (
            state,
            action: PayloadAction<{ accessToken: string; refreshToken?: string | null; user: UserInfo }>
        ) => {
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken ?? state.refreshToken;
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.roles = action.payload.user.roles || [];
            state.permissions = action.payload.user.permissions || [];
        },
        logout: (state) => {
            state.accessToken = null;
            state.refreshToken = null;
            state.user = null;
            state.isAuthenticated = false;
            state.roles = [];
            state.permissions = [];
        },
    },
});

export const { setCredentials, setAccessTokenInStore, restoreAuth, logout } = authSlice.actions;

export default authSlice.reducer;
