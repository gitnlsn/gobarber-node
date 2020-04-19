import { hashSync } from 'bcryptjs';
import validator from 'validator';

import { Repository, InsertResult } from 'typeorm';
import { GeneratedMetadataArgs } from 'typeorm/metadata-args/GeneratedMetadataArgs';
import AppError from '../errors/AppError';

import Users from '../models/Users';

interface UserProps {
    name?: string;
    email: string;
    password: string;
}

/**
 *  Use Case: user has no credentials in the database.
 *  Email and password are provided to create credentials.
 *  Returns created User from database, otherwise throws Error.
 */
class RegisterUserService {
    private userRepo: Repository<Users>;

    constructor(repo: Repository<Users>) {
        this.userRepo = repo;
    }

    public async execute(userProps: UserProps): Promise<Users> {
        if (!validator.isEmail(userProps.email)) {
            throw new AppError('Invalid email');
        }

        if (userProps.name && !validator.isAlpha(userProps.name)) {
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

        return createdUser as Users;
    }
}

export default RegisterUserService;
