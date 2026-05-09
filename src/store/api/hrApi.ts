import { baseApi } from './baseApi';

export const hrApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getEmployees: builder.query<unknown, { page?: number; size?: number }>({
            query: ({ page = 0, size = 10 } = {}) => ({
                url: `employees?page=${page}&size=${size}`,
                method: 'GET',
            }),
        }),
        getEmployeeById: builder.query<unknown, string>({
            query: (employeeId) => ({
                url: `employees/${employeeId}`,
                method: 'GET',
            }),
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
        checkIn: builder.mutation<unknown, { workShiftId?: string } | void>({
            query: (body) => ({
                url: `attendances/check-in`,
                method: 'POST',
                body: body ?? {},
            }),
        }),
        checkOut: builder.mutation<unknown, { workShiftId?: string } | void>({
            query: (body) => ({
                url: `attendances/check-out`,
                method: 'POST',
                body: body ?? {},
            }),
        }),
        getWorkShifts: builder.query<unknown, { page?: number; size?: number }>({
            query: ({ page = 0, size = 10 } = {}) => ({
                url: `work-shifts?page=${page}&size=${size}`,
                method: 'GET',
            }),
        }),
        getEnabledWorkShifts: builder.query<unknown, void>({
            query: () => ({
                url: `work-shifts/enabled`,
                method: 'GET',
            }),
        }),
        getMyLeaveRequests: builder.query<unknown, { page?: number; size?: number }>({
            query: ({ page = 0, size = 10 } = {}) => ({
                url: `leave-requests/me?page=${page}&size=${size}`,
                method: 'GET',
            }),
        }),
        getPendingLeaveRequests: builder.query<unknown, { page?: number; size?: number }>({
            query: ({ page = 0, size = 10 } = {}) => ({
                url: `leave-requests/pending?page=${page}&size=${size}`,
                method: 'GET',
            }),
        }),
        approveLeaveRequest: builder.mutation<unknown, string>({
            query: (id) => ({
                url: `leave-requests/${id}/approve`,
                method: 'POST',
            }),
        }),
        cancelLeaveRequest: builder.mutation<unknown, string>({
            query: (id) => ({
                url: `leave-requests/${id}/cancel`,
                method: 'POST',
            }),
        }),
        getContracts: builder.query<unknown, { page?: number; size?: number }>({
            query: ({ page = 0, size = 10 } = {}) => ({
                url: `contracts?page=${page}&size=${size}`,
                method: 'GET',
            }),
        }),
        getActiveContracts: builder.query<unknown, { page?: number; size?: number }>({
            query: ({ page = 0, size = 10 } = {}) => ({
                url: `contracts/active?page=${page}&size=${size}`,
                method: 'GET',
            }),
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetEmployeesQuery,
    useGetEmployeeByIdQuery,
    useGetMyAttendanceHistoryQuery,
    useGetMyAttendanceTodayQuery,
    useCheckInMutation,
    useCheckOutMutation,
    useGetWorkShiftsQuery,
    useGetEnabledWorkShiftsQuery,
    useGetMyLeaveRequestsQuery,
    useGetPendingLeaveRequestsQuery,
    useApproveLeaveRequestMutation,
    useCancelLeaveRequestMutation,
    useGetContractsQuery,
    useGetActiveContractsQuery,
} = hrApi;
