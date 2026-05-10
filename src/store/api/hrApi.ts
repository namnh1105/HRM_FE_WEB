import { baseApi } from './baseApi';
import type {
    CreateContractRequest,
    CreateEmployeeRequest,
    CreateWorkShiftRequest,
    UpdateContractRequest,
    UpdateEmployeeRequest,
    UpdateWorkShiftRequest,
} from '@/types/hr';

export const hrApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getEmployees: builder.query<unknown, { page?: number; size?: number }>({
            query: ({ page = 0, size = 10 } = {}) => ({
                url: `employees?page=${page}&size=${size}`,
                method: 'GET',
            }),
            providesTags: [{ type: 'Employee', id: 'LIST' }],
        }),
        getEmployeeStats: builder.query<unknown, void>({
            query: () => ({ url: 'employees/stats', method: 'GET' }),
            providesTags: [{ type: 'Employee', id: 'STATS' }],
        }),
        getEmployeeById: builder.query<unknown, string>({
            query: (employeeId) => ({
                url: `employees/${employeeId}`,
                method: 'GET',
            }),
            providesTags: (_, __, id) => [{ type: 'Employee', id }],
        }),
        createEmployee: builder.mutation<unknown, CreateEmployeeRequest>({
            query: (body) => ({
                url: `employees`,
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'Employee', id: 'LIST' }, { type: 'Employee', id: 'STATS' }],
        }),
        updateEmployee: builder.mutation<unknown, { id: string; body: UpdateEmployeeRequest }>({
            query: ({ id, body }) => ({
                url: `employees/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: (_, __, { id }) => [
                { type: 'Employee', id: 'LIST' },
                { type: 'Employee', id },
                { type: 'Employee', id: 'STATS' },
            ],
        }),
        getMyAttendanceHistory: builder.query<unknown, { startDate?: string; endDate?: string; page?: number; size?: number }>({
            query: ({ startDate, endDate, page = 0, size = 10 } = {}) => ({
                url: `attendances/me/history?${[
                    startDate ? `startDate=${encodeURIComponent(startDate)}` : null,
                    endDate ? `endDate=${encodeURIComponent(endDate)}` : null,
                    `page=${page}`,
                    `size=${size}`,
                ].filter(Boolean).join('&')}`,
                method: 'GET',
            }),
        }),
        getMyAttendanceToday: builder.query<unknown, void>({
            query: () => ({
                url: `attendances/me/today`,
                method: 'GET',
            }),
        }),
        getAttendanceStats: builder.query<unknown, void>({
            query: () => ({ url: 'attendances/stats', method: 'GET' }),
            providesTags: [{ type: 'Attendance', id: 'STATS' }],
        }),
        checkIn: builder.mutation<unknown, { workShiftId?: string } | void>({
            query: (body) => ({
                url: `attendances/check-in`,
                method: 'POST',
                body: body ?? {},
            }),
            invalidatesTags: [{ type: 'Attendance', id: 'STATS' }],
        }),
        checkOut: builder.mutation<unknown, { workShiftId?: string } | void>({
            query: (body) => ({
                url: `attendances/check-out`,
                method: 'POST',
                body: body ?? {},
            }),
            invalidatesTags: [{ type: 'Attendance', id: 'STATS' }],
        }),
        getWorkShifts: builder.query<unknown, { page?: number; size?: number }>({
            query: ({ page = 0, size = 10 } = {}) => ({
                url: `work-shifts?page=${page}&size=${size}`,
                method: 'GET',
            }),
            providesTags: [{ type: 'WorkShift', id: 'LIST' }],
        }),
        getEnabledWorkShifts: builder.query<unknown, void>({
            query: () => ({
                url: `work-shifts/enabled`,
                method: 'GET',
            }),
        }),
        createWorkShift: builder.mutation<unknown, CreateWorkShiftRequest>({
            query: (body) => ({
                url: `work-shifts`,
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'WorkShift', id: 'LIST' }],
        }),
        updateWorkShift: builder.mutation<unknown, { id: string; body: UpdateWorkShiftRequest }>({
            query: ({ id, body }) => ({
                url: `work-shifts/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: [{ type: 'WorkShift', id: 'LIST' }],
        }),
        deleteWorkShift: builder.mutation<unknown, string>({
            query: (id) => ({
                url: `work-shifts/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'WorkShift', id: 'LIST' }],
        }),
        getMyLeaveRequests: builder.query<unknown, { page?: number; size?: number }>({
            query: ({ page = 0, size = 10 } = {}) => ({
                url: `leave-requests/me?page=${page}&size=${size}`,
                method: 'GET',
            }),
        }),
        getLeaveRequests: builder.query<unknown, { page?: number; size?: number }>({
            query: ({ page = 0, size = 10 } = {}) => ({
                url: `leave-requests?page=${page}&size=${size}`,
                method: 'GET',
            }),
            providesTags: [{ type: 'LeaveRequest', id: 'LIST' }],
        }),
        getLeaveRequestStats: builder.query<unknown, void>({
            query: () => ({ url: 'leave-requests/stats', method: 'GET' }),
            providesTags: [{ type: 'LeaveRequest', id: 'STATS' }],
        }),
        getPendingLeaveRequests: builder.query<unknown, { page?: number; size?: number }>({
            query: ({ page = 0, size = 10 } = {}) => ({
                url: `leave-requests/pending?page=${page}&size=${size}`,
                method: 'GET',
            }),
            providesTags: [{ type: 'LeaveRequest', id: 'PENDING' }],
        }),
        approveLeaveRequest: builder.mutation<unknown, string>({
            query: (id) => ({
                url: `leave-requests/${id}/approve`,
                method: 'POST',
            }),
            invalidatesTags: [
                { type: 'LeaveRequest', id: 'LIST' },
                { type: 'LeaveRequest', id: 'PENDING' },
                { type: 'LeaveRequest', id: 'STATS' },
            ],
        }),
        cancelLeaveRequest: builder.mutation<unknown, string>({
            query: (id) => ({
                url: `leave-requests/${id}/cancel`,
                method: 'POST',
            }),
            invalidatesTags: [
                { type: 'LeaveRequest', id: 'LIST' },
                { type: 'LeaveRequest', id: 'PENDING' },
                { type: 'LeaveRequest', id: 'STATS' },
            ],
        }),
        getContracts: builder.query<unknown, { page?: number; size?: number }>({
            query: ({ page = 0, size = 10 } = {}) => ({
                url: `contracts?page=${page}&size=${size}`,
                method: 'GET',
            }),
            providesTags: [{ type: 'Contract', id: 'LIST' }],
        }),
        getContractStats: builder.query<unknown, void>({
            query: () => ({ url: 'contracts/stats', method: 'GET' }),
            providesTags: [{ type: 'Contract', id: 'STATS' }],
        }),
        getActiveContracts: builder.query<unknown, { page?: number; size?: number }>({
            query: ({ page = 0, size = 10 } = {}) => ({
                url: `contracts/active?page=${page}&size=${size}`,
                method: 'GET',
            }),
        }),
        createContract: builder.mutation<unknown, CreateContractRequest>({
            query: (body) => ({
                url: `contracts`,
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'Contract', id: 'LIST' }, { type: 'Contract', id: 'STATS' }],
        }),
        updateContract: builder.mutation<unknown, { id: string; body: UpdateContractRequest }>({
            query: ({ id, body }) => ({
                url: `contracts/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: [{ type: 'Contract', id: 'LIST' }, { type: 'Contract', id: 'STATS' }],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetEmployeesQuery,
    useGetEmployeeByIdQuery,
    useCreateEmployeeMutation,
    useUpdateEmployeeMutation,
    useGetMyAttendanceHistoryQuery,
    useGetMyAttendanceTodayQuery,
    useCheckInMutation,
    useCheckOutMutation,
    useGetWorkShiftsQuery,
    useGetEnabledWorkShiftsQuery,
    useCreateWorkShiftMutation,
    useUpdateWorkShiftMutation,
    useDeleteWorkShiftMutation,
    useGetMyLeaveRequestsQuery,
    useGetLeaveRequestsQuery,
    useGetPendingLeaveRequestsQuery,
    useApproveLeaveRequestMutation,
    useCancelLeaveRequestMutation,
    useGetContractsQuery,
    useGetActiveContractsQuery,
    useCreateContractMutation,
    useUpdateContractMutation,
    useGetEmployeeStatsQuery,
    useGetContractStatsQuery,
    useGetLeaveRequestStatsQuery,
    useGetAttendanceStatsQuery,
} = hrApi;
