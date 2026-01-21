import { AuthResponseDTO } from './auth';

export interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    user: AuthResponseDTO['user'] | null;
    isAuthenticated: boolean;
}

export interface RootState {
    auth?: AuthState;
}
