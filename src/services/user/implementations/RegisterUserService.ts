import { hashSync } from 'bcryptjs';
import { injectable, inject } from 'tsyringe';
import validator from 'validator';

import { Repository } from 'typeorm';
import AppError from '../../../errors/AppError';

import User from '../../../database/models/User';
import { RegisterUserInterface, RegisterUserInput, RegisterUserOutput } from '../interfaces/RegisterUserInterface';
import { JwtSignInterface, TokenPayload } from '../interfaces/JwtSignInterface';

export const validFullName: (fullname: string) => boolean = (fullname) => {
    if (!fullname) {
        return false;
    }

    const invalidName = fullname
        .split(' ')
        .find((name) => !validator.isAlpha(name));

    return !invalidName;
};

/**
 *  Use Case: user has no credentials in the database.
 *  Email and password are provided to create credentials.
 *  Returns created User from database, otherwise throws Error.
 */
@injectable()
class RegisterUserService implements RegisterUserInterface {
    constructor(
        @inject('UsersRepository') private userRepo: Repository<User>,
        @inject('JwtSecurityService') private security: JwtSignInterface,
    ) { }

    public async execute(userProps: RegisterUserInput): Promise<RegisterUserOutput> {
        /* Data Validation */
        if (!validator.isEmail(userProps.email)) {
            throw new AppError('Invalid email');
        }

        if (userProps.name && !validFullName(userProps.name)) {
            throw new AppError('Invalid username');
        }

        if (!validator.isHash(userProps.password, 'sha256')) {
            throw new AppError('Invalid password');
        }

        /* Data access: check */
        const existingUser = await this.userRepo.findOne({
            email: userProps.email,
        });

        if (existingUser) {
            throw new AppError('A user with the specified email already exists');
        }

        /* Data access: create */
        const newUser = this.userRepo.create();
        if (userProps.name) newUser.name = userProps.name;
        newUser.email = userProps.email;
        newUser.password = hashSync(userProps.password);
        const createdUser = await this.userRepo.save(newUser);

        /* Pos processing */
        const clonedUser = { ...createdUser };
        delete clonedUser.password;

        const token = this.security.signJwt(
            createdUser.id,
            undefined,
            { usage: 'client' as TokenPayload['usage'] },
        );

        return { user: clonedUser as User, token };
    }
}

export default RegisterUserService;
