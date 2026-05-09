import { baseApi } from './baseApi';
import {
    ApiResponse,
    PaginatedApiResponse,
    RoleResponse,
    CreateRoleRequest,
    UpdateRoleRequest,
} from '@/types';

export const roleApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        // GET /api/v1/roles?page=&size=&includeDeleted=
        getAllRoles: builder.query<PaginatedApiResponse<RoleResponse>, { page?: number; size?: number; includeDeleted?: boolean }>({
            query: ({ page = 0, size = 20, includeDeleted = false } = {}) => ({
                url: `roles?page=${page}&size=${size}&includeDeleted=${includeDeleted}`,
                method: 'GET',
            }),
            providesTags: [{ type: 'Role', id: 'LIST' }],
        }),

        // GET /api/v1/roles/active
        getActiveRoles: builder.query<ApiResponse<RoleResponse[]>, void>({
            query: () => ({ url: 'roles/active', method: 'GET' }),
            providesTags: [{ type: 'Role', id: 'ACTIVE' }],
        }),

        // GET /api/v1/roles/:roleId
        getRoleById: builder.query<ApiResponse<RoleResponse>, string>({
            query: (roleId) => ({ url: `roles/${roleId}`, method: 'GET' }),
            providesTags: (_, __, id) => [{ type: 'Role', id }],
        }),

        // GET /api/v1/roles/search?query=
        searchRoles: builder.query<ApiResponse<RoleResponse[]>, string>({
            query: (query) => ({ url: `roles/search?query=${encodeURIComponent(query)}`, method: 'GET' }),
            providesTags: [{ type: 'Role', id: 'SEARCH' }],
        }),

        // POST /api/v1/roles
        createRole: builder.mutation<ApiResponse<RoleResponse>, CreateRoleRequest>({
            query: (body) => ({ url: 'roles', method: 'POST', body }),
            invalidatesTags: [{ type: 'Role', id: 'LIST' }, { type: 'Role', id: 'ACTIVE' }],
        }),

        // PUT /api/v1/roles/:roleId
        updateRole: builder.mutation<ApiResponse<RoleResponse>, { roleId: string; body: UpdateRoleRequest }>({
            query: ({ roleId, body }) => ({ url: `roles/${roleId}`, method: 'PUT', body }),
            invalidatesTags: (_, __, { roleId }) => [
                { type: 'Role', id: roleId },
                { type: 'Role', id: 'LIST' },
                { type: 'Role', id: 'ACTIVE' },
            ],
        }),

        // DELETE /api/v1/roles/:roleId
        deleteRole: builder.mutation<ApiResponse<null>, string>({
            query: (roleId) => ({ url: `roles/${roleId}`, method: 'DELETE' }),
            invalidatesTags: [{ type: 'Role', id: 'LIST' }, { type: 'Role', id: 'ACTIVE' }],
        }),

        // POST /api/v1/roles/:roleId/activate
        activateRole: builder.mutation<ApiResponse<null>, string>({
            query: (roleId) => ({ url: `roles/${roleId}/activate`, method: 'POST' }),
            invalidatesTags: (_, __, roleId) => [{ type: 'Role', id: roleId }, { type: 'Role', id: 'LIST' }],
        }),

        // POST /api/v1/roles/:roleId/deactivate
        deactivateRole: builder.mutation<ApiResponse<null>, string>({
            query: (roleId) => ({ url: `roles/${roleId}/deactivate`, method: 'POST' }),
            invalidatesTags: (_, __, roleId) => [{ type: 'Role', id: roleId }, { type: 'Role', id: 'LIST' }],
        }),

        // POST /api/v1/roles/:roleId/permissions
        assignPermissionsToRole: builder.mutation<ApiResponse<null>, { roleId: string; permissionIds: string[] }>({
            query: ({ roleId, permissionIds }) => ({
                url: `roles/${roleId}/permissions`,
                method: 'POST',
                body: { roleId, permissionIds },
            }),
            invalidatesTags: (_, __, { roleId }) => [{ type: 'Role', id: roleId }],
        }),

        // DELETE /api/v1/roles/:roleId/permissions
        removePermissionsFromRole: builder.mutation<ApiResponse<null>, { roleId: string; permissionIds: string[] }>({
            query: ({ roleId, permissionIds }) => ({
                url: `roles/${roleId}/permissions`,
                method: 'DELETE',
                body: permissionIds,
            }),
            invalidatesTags: (_, __, { roleId }) => [{ type: 'Role', id: roleId }],
        }),
        
        // PUT /api/v1/roles/:roleId/permissions
        getRolePermissions: builder.query<ApiResponse<PermissionResponse[]>, string>({
            query: (roleId) => ({ url: `roles/${roleId}/permissions`, method: 'GET' }),
            providesTags: (_, __, id) => [{ type: 'Role', id: `PERMS-${id}` }],
        }),

        syncPermissionsToRole: builder.mutation<ApiResponse<null>, { roleId: string; permissionIds: string[] }>({
            query: ({ roleId, permissionIds }) => ({
                url: `roles/${roleId}/permissions`,
                method: 'PUT',
                body: { roleId, permissionIds },
            }),
            invalidatesTags: (_, __, { roleId }) => [
                { type: 'Role', id: roleId }, 
                { type: 'Role', id: 'LIST' },
                { type: 'Role', id: `PERMS-${roleId}` }
            ],
        }),

        // POST /api/v1/roles/:roleId/restore
        restoreRole: builder.mutation<ApiResponse<null>, string>({
            query: (roleId) => ({ url: `roles/${roleId}/restore`, method: 'POST' }),
            invalidatesTags: (_, __, roleId) => [{ type: 'Role', id: roleId }, { type: 'Role', id: 'LIST' }],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetAllRolesQuery,
    useGetActiveRolesQuery,
    useGetRoleByIdQuery,
    useSearchRolesQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation,
    useActivateRoleMutation,
    useDeactivateRoleMutation,
    useRestoreRoleMutation,
    useAssignPermissionsToRoleMutation,
    useRemovePermissionsFromRoleMutation,
    useGetRolePermissionsQuery,
    useSyncPermissionsToRoleMutation,
} = roleApi;
