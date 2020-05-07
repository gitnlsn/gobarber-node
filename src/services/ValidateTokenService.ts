import { Repository } from 'typeorm';

import { inject, injectable } from 'tsyringe';

import User from '../database/models/User';
import AppError from '../errors/AppError';
import { SecurityProvider } from './container';

interface Input {
    token: string;
}

export interface TokenPayload {
    iat: number;
    exp: number;
    sub: string;
}

interface Returnable {
    user: User;
    token: string;
}

/**
 *  Use Case: user has credentials in the database and requests a jwt token.
 *  Email and password are provided to validate credentials.
 */
@injectable()
class ValidateTokenService {
    constructor(
        @inject('UsersRepository') private userRepo: Repository<User>,
        @inject('SecurityService') private security: SecurityProvider,
    ) { }

    public async execute({ token }: Input): Promise<Returnable> {
        let decoded;

        try {
            decoded = this.security.decodeJwt(token) as TokenPayload;
        } catch (error) {
            throw new AppError('Invalid crendentials');
        }

        const {
            sub: userId,
            exp: expiresIn,
            iat: issuedAt,
        } = decoded;

        const existingUser = await this.userRepo.findOne({
            id: userId,
        });

        if (!existingUser || this.invalidDate(issuedAt, expiresIn)) {
            throw new AppError('Invalid crendentials');
        }

        delete existingUser.password;

        return { user: existingUser, token };
    }

    /* eslint-disable-next-line class-methods-use-this */
    invalidDate(issuedAt: number, expiresIn: number): boolean {
        const now = new Date().getTime();
        const invalidIssueDate = now < issuedAt * 1000;
        const expired = now > expiresIn * 1000;

        return invalidIssueDate || expired;
    }
}

export default ValidateTokenService;
