import { compare } from 'bcryptjs';
import { injectable, inject } from 'tsyringe';

import { Repository } from 'typeorm';
import User from '../database/models/User';
import AppError from '../errors/AppError';
import { SecurityProvider } from './container';

interface UserProps {
    email: string;
    password: string;
}

interface Returnable {
    user: User;
    token: string;
}

/**
 *  Use Case: user has credentials in the database and requests a jwt token.
 *  Email and password are provided to validate credentials.
 *  Returns token if credentials matches, otherwise null.
 */
@injectable()
class AuthenticateUserService {
    constructor(
        @inject('UsersRepository') private userRepo: Repository<User>,
        @inject('SecurityService') private security: SecurityProvider,
    ) { }

    public async execute(userProps: UserProps): Promise<Returnable> {
        const existingUser = await this.userRepo.findOne({
            email: userProps.email,
        });

        if (!existingUser) {
            throw new AppError('Invalid crendentials');
        }

        const passwordMatches = await compare(
            userProps.password,
            existingUser.password,
        ); /* order is important */

        if (!passwordMatches) {
            throw new AppError('Invalid crendentials');
        }

        /* Avoids returning password to user */
        delete existingUser.password;

        const token = this.security.signJwt(existingUser.id);

        return { user: existingUser, token };
    }
}

export default AuthenticateUserService;
