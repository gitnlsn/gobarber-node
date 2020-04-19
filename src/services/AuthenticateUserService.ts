import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';

import { Repository } from 'typeorm';
import Users from '../models/Users';
import AppError from '../errors/AppError';


interface UserProps {
    email: string;
    password: string;
}

/**
 *  Use Case: user has credentials in the database and requests a jwt token.
 *  Email and password are provided to validate credentials.
 *  Returns token if credentials matches, otherwise null.
 */
class AuthenticateUserService {
    private userRepo: Repository<Users>;

    private signKey: string;

    constructor(repo: Repository<Users>, signKey: string) {
        this.userRepo = repo;
        this.signKey = signKey;
    }

    public async execute(userProps: UserProps): Promise<string | null> {
        const existingUser = await this.userRepo.findOne({
            email: userProps.email,
        });

        if (!existingUser) {
            return null;
        }

        const passwordMatches = await compare(existingUser.password, userProps.password);

        if (!passwordMatches) {
            return null;
        }

        /* Avoids returning password to user */
        delete existingUser.password;

        const token = sign({}, this.signKey, {
            subject: existingUser.id,
            expiresIn: '1d',
        });

        return token;
    }
}

export default AuthenticateUserService;
