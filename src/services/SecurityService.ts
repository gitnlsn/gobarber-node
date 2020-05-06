import { sign, SignOptions, verify } from 'jsonwebtoken';
import { inject, singleton } from 'tsyringe';

import { randomBytes } from 'crypto';
import { SecurityProvider } from './container';
import { TokenPayload } from './ValidateTokenService';

export const newBytesWord: (
    size: number
) => string = (
    size,
) => randomBytes(size).toString('base64');


@singleton()
class SecurityService implements SecurityProvider {
    constructor(@inject('jwtSignKey') private jwtSignKey: string) {}

    public signJwt(
        subject: string,
        expiration: SignOptions['expiresIn'] = '1d',
        payload: Record<string, string> = {},
    ): string {
        return sign(
            payload,
            this.jwtSignKey,
            {
                subject,
                expiresIn: expiration,
            },
        );
    }

    public decodeJwt(token: string): TokenPayload {
        return verify(token, this.jwtSignKey) as TokenPayload;
    }
}

export default SecurityService;
