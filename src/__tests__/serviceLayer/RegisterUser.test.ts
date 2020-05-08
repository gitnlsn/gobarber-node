import 'reflect-metadata';
import { isUuid } from 'uuidv4';
import { container } from 'tsyringe';

import {
    getRepository,
    Connection,
    createConnection,
} from 'typeorm';
import { createHash } from 'crypto';

import registerRepositories from '../../database/container';
import registerServices from '../../services/implementations/container';

import User from '../../database/models/User';
import RegisterUserService from '../../services/implementations/RegisterUserService';
import JwtSecurityService from '../../services/implementations/JwtSecurityService';

describe('Register User', () => {
    let connection: Connection;
    const validUserName = 'username';
    const validEmail = 'test@mail.com';
    const validPassword = createHash('sha256').update('password').digest('hex');

    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
        registerRepositories();
        registerServices();
    });

    afterEach(async () => {
        await connection.query('DELETE FROM users;');
    });

    afterAll(async () => {
        await connection.close();
    });

    it('Should return User data', async () => {
        const service = container.resolve(RegisterUserService);

        const { user: returnedUser } = await service.execute({
            name: validUserName,
            email: validEmail,
            password: validPassword,
        });

        expect(returnedUser.name).toBe(validUserName);
        expect(returnedUser.email).toBe(validEmail);
        expect(returnedUser.password).toBe(undefined);
    });

    it('Should return token', async () => {
        const securityService = container.resolve(JwtSecurityService);
        const registerService = container.resolve(RegisterUserService);

        const { token } = await registerService.execute({
            name: validUserName,
            email: validEmail,
            password: validPassword,
        });

        const decodedToken = securityService.decodeJwt(token);
        expect(decodedToken).toHaveProperty('iat');
        expect(decodedToken).toHaveProperty('sub');
        expect(decodedToken).toHaveProperty('exp');
    });

    it('Should insert user in repository', async () => {
        const userRepo = getRepository(User);
        const service = container.resolve(RegisterUserService);

        await service.execute({
            name: validUserName,
            email: validEmail,
            password: validPassword,
        });

        const registeredUser = await userRepo.findOne({
            email: validEmail,
        }) as User;

        expect(isUuid(registeredUser.id)).toBeTruthy();
        expect(registeredUser.name).toBe(validUserName);
        expect(registeredUser.email).toBe(validEmail);
        expect(typeof registeredUser.password).toBe('string');
    });

    it('Should throw if username is invalid', async () => {
        const service = container.resolve(RegisterUserService);

        await expect(
            service.execute({
                name: '#$ ## @!$#@!$@',
                email: validEmail,
                password: validPassword,
            }),
        ).rejects.toThrow();
    });

    it('Should throw if email is invalid', async () => {
        const service = container.resolve(RegisterUserService);

        await expect(
            service.execute({
                name: validUserName,
                email: 'invalid @ mail',
                password: validPassword,
            }),
        ).rejects.toThrow();
    });

    it('Should throw if password is invalid', async () => {
        const service = container.resolve(RegisterUserService);

        await expect(
            service.execute({
                name: validUserName,
                email: validEmail,
                password: 'invalid password',
            }),
        ).rejects.toThrow();
    });

    it('Should throw if user already exists', async () => {
        const service = container.resolve(RegisterUserService);

        await service.execute({
            name: validUserName,
            email: validEmail,
            password: validPassword,
        });

        expect(
            service.execute({
                name: validUserName,
                email: validEmail,
                password: validPassword,
            }),
        ).rejects.toThrow();
    });
});
