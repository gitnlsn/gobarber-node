import { verify } from 'jsonwebtoken';
import { Repository } from 'typeorm';

import AppError from '../errors/AppError';
import Users from '../models/Users';

interface Input {
    token: string;
}
interface TokenPayload {
    iat: number;
    exp: number;
    sub: string;
}

interface Returnable {
    userId: string;
}

/**
 *  Use Case: user has credentials in the database and requests a jwt token.
 *  Email and password are provided to validate credentials.
 */
class ValidateTokenService {
    private userRepo: Repository<Users>;

    private signKey: string;

    constructor(repo: Repository<Users>, signKey: string) {
        this.userRepo = repo;
        this.signKey = signKey;
    }

    public async execute({
        token,
    }: Input): Promise<string | null> {
        let decoded;

        try {
            decoded = verify(token, this.signKey) as TokenPayload;
        } catch (error) {
            throw new AppError('Invalid crendentials');
        }

        const {
            sub: userId,
            exp: expiresIn,
            iat: issuedAt,
        } = decoded;

        if (await this.invalidUser(userId) || this.invalidDate(issuedAt, expiresIn)) {
            throw new AppError('Invalid crendentials');
        }

        return userId;
    }

    async invalidUser(userId: string): Promise<boolean> {
        const existingUser = await this.userRepo.findOne({
            id: userId,
        });
        return !existingUser;
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
