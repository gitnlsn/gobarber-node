import { compare } from 'bcryptjs';
import { injectable, inject } from 'tsyringe';

import { Repository } from 'typeorm';
import User from '../../database/models/User';
import AppError from '../../errors/AppError';
import {
    AuthenticateUserInterface,
    AuthenticateOutput,
    AuthenticateInput,
} from '../interfaces/AuthenticateUserInterface';
import { JwtSignInterface, TokenPayload } from '../interfaces/JwtSignInterface';


/**
 *  Use Case: user has credentials in the database and requests a jwt token.
 *  Email and password are provided to validate credentials.
 *  Returns token if credentials matches, otherwise null.
 */
@injectable()
class AuthenticateUserService implements AuthenticateUserInterface {
    constructor(
        @inject('UsersRepository') private userRepo: Repository<User>,
        @inject('JwtSecurityService') private security: JwtSignInterface,
    ) { }

    public async execute(userProps: AuthenticateInput): Promise<AuthenticateOutput> {
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
        const clonedUser = { ...existingUser };
        delete clonedUser.password;

        const token = this.security.signJwt(
            existingUser.id,
            undefined,
            { usage: 'client' as TokenPayload['usage'] },
        );

        return { user: clonedUser, token };
    }
}

export default AuthenticateUserService;
