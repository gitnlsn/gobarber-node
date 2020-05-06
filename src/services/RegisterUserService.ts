import 'reflect-metadata';

import { hashSync } from 'bcryptjs';
import { injectable, inject } from 'tsyringe';
import validator from 'validator';

import { Repository } from 'typeorm';
import AppError from '../errors/AppError';

import Users from '../database/models/Users';
import { SecurityProvider } from './container';

interface UserProps {
    name?: string;
    email: string;
    password: string;
}

interface Returnable {
    user: Users;
    token: string;
}

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
class RegisterUserService {
    constructor(
        @inject('UsersRepository') private userRepo: Repository<Users>,
        @inject('SecurityService') private security: SecurityProvider,
    ) { }

    public async execute(userProps: UserProps): Promise<Returnable> {
        if (!validator.isEmail(userProps.email)) {
            throw new AppError('Invalid email');
        }

        if (userProps.name && !validFullName(userProps.name)) {
            throw new AppError('Invalid username');
        }

        if (!validator.isHash(userProps.password, 'sha256')) {
            throw new AppError('Invalid password');
        }

        const existingUser = await this.userRepo.findOne({
            email: userProps.email,
        });

        if (existingUser) {
            throw new AppError('A user with the specified email already exists');
        }

        const newUser = this.userRepo.create();
        if (userProps.name) newUser.name = userProps.name;
        newUser.email = userProps.email;
        newUser.password = hashSync(userProps.password);

        const { generatedMaps: [createdUser] } = await this.userRepo
            .createQueryBuilder()
            .insert()
            .values(newUser)
            .returning('*')
            .execute();

        /* Avoids returning password to user */
        delete createdUser.password;

        const token = this.security.signJwt(createdUser.id);

        return { user: createdUser as Users, token };
    }
}

export default RegisterUserService;
