import { Repository } from 'typeorm';

import { inject, injectable } from 'tsyringe';

import User from '../../../database/models/User';
import AppError from '../../../errors/AppError';
import { JwtSignInterface, TokenPayload } from '../interfaces/JwtSignInterface';
import {
    TokenValidatorInterface,
    TokenValidatorInput,
    TokenValidatorOutput,
} from '../interfaces/ValidateTokenInterface';

/**
 *  Use Case: user has credentials in the database and requests a jwt token.
 *  Email and password are provided to validate credentials.
 */
@injectable()
class ValidateTokenService implements TokenValidatorInterface {
    constructor(
        @inject('UsersRepository') private userRepo: Repository<User>,
        @inject('JwtSecurityService') private security: JwtSignInterface,
    ) { }

    public async execute({ token }: TokenValidatorInput): Promise<TokenValidatorOutput> {
        let decoded;

        try {
            decoded = this.security.decodeJwt(token) as TokenPayload;
        } catch (error) {
            throw new AppError('Invalid token');
        }

        const {
            sub: userId,
            exp: expiresIn,
            iat: issuedAt,
            usage,
        } = decoded;

        if (usage !== 'client') {
            throw new AppError('Invalid token');
        }

        const existingUser = await this.userRepo.findOne({
            id: userId,
        });

        if (!existingUser || this.invalidDate(issuedAt, expiresIn)) {
            throw new AppError('Invalid token');
        }

        const clonedUser = { ...existingUser };
        delete clonedUser.password;

        return { user: clonedUser, token };
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
