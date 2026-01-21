import {UserResponseDTO} from './user'

export type LoginDTO = {
    username : string;
    password : string;
}

export type RefreshTokenDTO = {
    refreshToken : string;
}

export type RegisterDTO = {
    username : string;
    givenName : string;
    familyName : string;
    password : string;
}

export type AuthResponseDTO = {
    accessToken: string;
    refreshToken: string;
    user: UserResponseDTO;
}

