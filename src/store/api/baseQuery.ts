import {
    fetchBaseQuery,
    type BaseQueryFn,
    type FetchArgs,
    type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens, setStoredUser } from '@/utils/tokenStorage';
import { logout, setAccessTokenInStore, setCredentials, mapToUserInfo } from '@/store/features/authSlice';

const rawBaseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: (headers) => {
        const token = getAccessToken();
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

let refreshPromise: Promise<string | null> | null = null;

const performRefresh = async (
    api: any,
    extraOptions: any
): Promise<string | null> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    const refreshResult = await rawBaseQuery(
        {
            url: 'auth/refresh-token',
            method: 'POST',
            body: { refreshToken },
        },
        api,
        extraOptions
    );

    if (refreshResult.data) {
        const data = refreshResult.data as {
            success: boolean;
            data?: { accessToken: string; refreshToken?: string; user?: any };
        };

        if (data.success && data.data?.accessToken) {
            const accessToken = data.data.accessToken;
            saveTokens(accessToken, refreshToken);
            api.dispatch(setAccessTokenInStore(accessToken));

            if (data.data.user) {
                const freshUser = mapToUserInfo(data.data.user);
                api.dispatch(setCredentials({ accessToken, refreshToken, user: freshUser }));
                setStoredUser(freshUser);
            }

            return accessToken;
        }
    }

    clearTokens();
    api.dispatch(logout());
    return null;
};

export const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions
) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        if (!refreshPromise) {
            refreshPromise = performRefresh(api, extraOptions).finally(() => {
                refreshPromise = null;
            });
        }

        const newToken = await refreshPromise;
        if (newToken) {
            result = await rawBaseQuery(args, api, extraOptions);
        }
    }

    return result;
};
