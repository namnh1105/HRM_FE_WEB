import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { AppDispatch } from './index';

// We define StoreState here to avoid circular imports
export type StoreState = {
    auth?: {
        accessToken: string | null;
        refreshToken: string | null;
        user: any | null;
        isAuthenticated: boolean;
    };
    [key: string]: any;
};

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<StoreState> = useSelector;

