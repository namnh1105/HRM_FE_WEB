import { baseApi } from './baseApi';
import {
    ApiResponse,
    PaginatedApiResponse,
    UserResponse,
} from '@/types';

export const userApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        // GET /api/v1/users/all?includeDeleted=true
        getAllUsers: builder.query<ApiResponse<UserResponse[]>, void>({
            query: () => ({ url: 'users/all?includeDeleted=true', method: 'GET' }),
            providesTags: (result) =>
                result?.data
                    ? [
                          ...result.data.map(({ id }) => ({ type: 'User' as const, id })),
                          { type: 'User', id: 'LIST' },
                      ]
                    : [{ type: 'User', id: 'LIST' }],
        }),

        // GET /api/v1/users/me
        getMe: builder.query<ApiResponse<UserResponse>, void>({
            query: () => ({ url: 'users/me', method: 'GET' }),
            providesTags: [{ type: 'User', id: 'ME' }],
        }),

        // GET /api/v1/users/:id
        getUserById: builder.query<ApiResponse<UserResponse>, string>({
            query: (userId) => ({ url: `users/${userId}`, method: 'GET' }),
            providesTags: (_, __, id) => [{ type: 'User', id }],
        }),

        // DELETE /api/v1/users/:id  (soft delete)
        deleteUser: builder.mutation<ApiResponse<null>, string>({
            query: (userId) => ({ url: `users/${userId}`, method: 'DELETE' }),
            invalidatesTags: (_, __, id) => [{ type: 'User', id }, { type: 'User', id: 'LIST' }],
        }),

        // POST /api/v1/users/:id/activate
        activateUser: builder.mutation<ApiResponse<UserResponse>, string>({
            query: (userId) => ({ url: `users/${userId}/activate`, method: 'POST' }),
            invalidatesTags: (_, __, id) => [{ type: 'User', id }, { type: 'User', id: 'LIST' }],
        }),

        // POST /api/v1/users/:id/deactivate
        deactivateUser: builder.mutation<ApiResponse<UserResponse>, string>({
            query: (userId) => ({ url: `users/${userId}/deactivate`, method: 'POST' }),
            invalidatesTags: (_, __, id) => [{ type: 'User', id }, { type: 'User', id: 'LIST' }],
        }),

        // POST /api/v1/users/:id/restore
        restoreUser: builder.mutation<ApiResponse<UserResponse>, string>({
            query: (userId) => ({ url: `users/${userId}/restore`, method: 'POST' }),
            invalidatesTags: (_, __, id) => [{ type: 'User', id }, { type: 'User', id: 'LIST' }],
        }),

        // DELETE /api/v1/users/:id/permanent
        permanentDeleteUser: builder.mutation<ApiResponse<null>, string>({
            query: (userId) => ({ url: `users/${userId}/permanent`, method: 'DELETE' }),
            invalidatesTags: [{ type: 'User', id: 'LIST' }],
        }),

        // GET /api/v1/users/:id/roles
        getUserRoles: builder.query<ApiResponse<import('@/types').UserRoleAssignmentResponse[]>, string>({
            query: (userId) => ({ url: `users/${userId}/roles`, method: 'GET' }),
            providesTags: (_, __, id) => [{ type: 'UserRole', id }],
        }),

        // POST /api/v1/users/:userId/roles/:roleId
        assignRoleToUser: builder.mutation<ApiResponse<null>, { userId: string; roleId: string }>({
            query: ({ userId, roleId }) => ({
                url: `users/${userId}/roles/${roleId}`,
                method: 'POST',
            }),
            invalidatesTags: (_, __, { userId }) => [{ type: 'UserRole', id: userId }, { type: 'User', id: userId }],
        }),

        // DELETE /api/v1/users/:userId/roles/:roleId
        removeRoleFromUser: builder.mutation<ApiResponse<null>, { userId: string; roleId: string }>({
            query: ({ userId, roleId }) => ({
                url: `users/${userId}/roles/${roleId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_, __, { userId }) => [{ type: 'UserRole', id: userId }, { type: 'User', id: userId }],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetAllUsersQuery,
    useGetMeQuery,
    useGetUserByIdQuery,
    useDeleteUserMutation,
    useActivateUserMutation,
    useDeactivateUserMutation,
    useRestoreUserMutation,
    usePermanentDeleteUserMutation,
    useGetUserRolesQuery,
    useAssignRoleToUserMutation,
    useRemoveRoleFromUserMutation,
} = userApi;
