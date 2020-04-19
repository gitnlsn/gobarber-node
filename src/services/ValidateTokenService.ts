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
            return null;
        }

        const {
            sub: userId,
            exp: expiresIn,
            iat: issuedAt,
        } = decoded;

        if (this.invalidUser(userId) || this.invalidDate(issuedAt, expiresIn)) {
            return null;
        }

        return userId;
    }

    invalidUser(userId: string): boolean {
        const existingUser = this.userRepo.findOne({
            id: userId,
        });
        return !existingUser;
    }

    /* eslint-disable-next-line class-methods-use-this */
    invalidDate(issuedAt: number, expiresIn: number): boolean {
        const now = new Date().getTime();
        const invalidIssueDate = now < issuedAt;
        const expired = now > expiresIn;

        return invalidIssueDate || expired;
    }
}

export default ValidateTokenService;
