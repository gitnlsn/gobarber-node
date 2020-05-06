import { container } from 'tsyringe';
import { SignOptions } from 'jsonwebtoken';
import SecurityService, { newBytesWord } from './SecurityService';
import { TokenPayload } from './ValidateTokenService';

export interface SecurityProvider {
    signJwt(
        subject: string,
        expiration?: SignOptions['expiresIn'],
        payload?: Record<string, string>,
    ): string;

    decodeJwt(token: string): TokenPayload;
}

const register: () => void = () => {
    /* Security service into container as singleton */
    container.register<SecurityProvider>(
        'SecurityService',
        SecurityService,
    );

    container.register<string>(
        'jwtSignKey',
        { useValue: newBytesWord(512) },
    );
};


export default register;
