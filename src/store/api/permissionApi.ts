import { baseApi } from './baseApi';
import {
    ApiResponse,
    PaginatedApiResponse,
    PermissionResponse,
    CreatePermissionRequest,
    UpdatePermissionRequest,
} from '@/types';

export const permissionApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        // GET /api/v1/permissions?page=&size=
        getAllPermissions: builder.query<PaginatedApiResponse<PermissionResponse>, { page?: number; size?: number }>({
            query: ({ page = 0, size = 50 } = {}) => ({
                url: `permissions?page=${page}&size=${size}`,
                method: 'GET',
            }),
            providesTags: [{ type: 'Permission', id: 'LIST' }],
        }),

        // GET /api/v1/permissions/active
        getActivePermissions: builder.query<ApiResponse<PermissionResponse[]>, void>({
            query: () => ({ url: 'permissions/active', method: 'GET' }),
            providesTags: [{ type: 'Permission', id: 'ACTIVE' }],
        }),

        // GET /api/v1/permissions/:permissionId
        getPermissionById: builder.query<ApiResponse<PermissionResponse>, string>({
            query: (permissionId) => ({ url: `permissions/${permissionId}`, method: 'GET' }),
            providesTags: (_, __, id) => [{ type: 'Permission', id }],
        }),

        // GET /api/v1/permissions/resource/:resource
        getPermissionsByResource: builder.query<ApiResponse<PermissionResponse[]>, string>({
            query: (resource) => ({ url: `permissions/resource/${resource}`, method: 'GET' }),
            providesTags: (_, __, resource) => [{ type: 'Permission', id: `RES_${resource}` }],
        }),

        // GET /api/v1/permissions/search?query=
        searchPermissions: builder.query<ApiResponse<PermissionResponse[]>, string>({
            query: (query) => ({
                url: `permissions/search?query=${encodeURIComponent(query)}`,
                method: 'GET',
            }),
            providesTags: [{ type: 'Permission', id: 'SEARCH' }],
        }),

        // GET /api/v1/permissions/user/:userId
        getPermissionsByUser: builder.query<ApiResponse<PermissionResponse[]>, string>({
            query: (userId) => ({ url: `permissions/user/${userId}`, method: 'GET' }),
            providesTags: (_, __, userId) => [{ type: 'Permission', id: `USER_${userId}` }],
        }),

        // POST /api/v1/permissions
        createPermission: builder.mutation<ApiResponse<PermissionResponse>, CreatePermissionRequest>({
            query: (body) => ({ url: 'permissions', method: 'POST', body }),
            invalidatesTags: [{ type: 'Permission', id: 'LIST' }, { type: 'Permission', id: 'ACTIVE' }],
        }),

        // PUT /api/v1/permissions/:permissionId
        updatePermission: builder.mutation<
            ApiResponse<PermissionResponse>,
            { permissionId: string; body: UpdatePermissionRequest }
        >({
            query: ({ permissionId, body }) => ({
                url: `permissions/${permissionId}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: (_, __, { permissionId }) => [
                { type: 'Permission', id: permissionId },
                { type: 'Permission', id: 'LIST' },
            ],
        }),

        // DELETE /api/v1/permissions/:permissionId
        deletePermission: builder.mutation<ApiResponse<null>, string>({
            query: (permissionId) => ({ url: `permissions/${permissionId}`, method: 'DELETE' }),
            invalidatesTags: [{ type: 'Permission', id: 'LIST' }],
        }),

        // POST /api/v1/permissions/:permissionId/activate
        activatePermission: builder.mutation<ApiResponse<null>, string>({
            query: (permissionId) => ({ url: `permissions/${permissionId}/activate`, method: 'POST' }),
            invalidatesTags: (_, __, id) => [{ type: 'Permission', id }, { type: 'Permission', id: 'LIST' }],
        }),

        // POST /api/v1/permissions/:permissionId/deactivate
        deactivatePermission: builder.mutation<ApiResponse<null>, string>({
            query: (permissionId) => ({ url: `permissions/${permissionId}/deactivate`, method: 'POST' }),
            invalidatesTags: (_, __, id) => [{ type: 'Permission', id }, { type: 'Permission', id: 'LIST' }],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetAllPermissionsQuery,
    useGetActivePermissionsQuery,
    useGetPermissionByIdQuery,
    useGetPermissionsByResourceQuery,
    useSearchPermissionsQuery,
    useGetPermissionsByUserQuery,
    useCreatePermissionMutation,
    useUpdatePermissionMutation,
    useDeletePermissionMutation,
    useActivatePermissionMutation,
    useDeactivatePermissionMutation,
} = permissionApi;
