import { SignOptions } from 'jsonwebtoken';

export interface TokenPayload {
    iat: number;
    exp: number;
    sub: string;
    usage: 'client' | 'resetPassword';
}

/**
 * Encapsulates sign and decode methods. Exposes signed data only.
 */
export interface JwtSignInterface {
    signJwt(
        subject: string,
        expiration?: SignOptions['expiresIn'],
        payload?: Record<string, string>,
    ): string;

    decodeJwt(token: string): TokenPayload;
}
