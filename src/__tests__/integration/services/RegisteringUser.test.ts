import { isUuid } from 'uuidv4';
import {
    getRepository,
    Connection,
    createConnection,
} from 'typeorm';
import { createHash } from 'crypto';

import Users from '../../../models/Users';
import RegisterUserService from '../../../services/RegisterUserService';

describe('Register User', () => {
    let connection: Connection;
    const validUserName = 'username';
    const validEmail = 'test@mail.com';
    const validPassword = createHash('sha256').update('password').digest('hex');

    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
    });

    afterEach(async () => {
        await connection.query('DELETE FROM users;');
    });

    afterAll(async () => {
        await connection.close();
    });

    it('Should return User', async () => {
        const userRepo = getRepository(Users);
        const service = new RegisterUserService(userRepo);

        const returnedUser = await service.execute({
            name: validUserName,
            email: validEmail,
            password: validPassword,
        });

        expect(returnedUser.name).toBe(validUserName);
        expect(returnedUser.email).toBe(validEmail);
        expect(returnedUser.password).toBe(undefined);
    });

    it('Should insert user in repository', async () => {
        const userRepo = getRepository(Users);
        const service = new RegisterUserService(userRepo);

        await service.execute({
            name: validUserName,
            email: validEmail,
            password: validPassword,
        });

        const registeredUser = await userRepo.findOne({
            email: validEmail,
        }) as Users;

        expect(isUuid(registeredUser.id)).toBeTruthy();
        expect(registeredUser.name).toBe(validUserName);
        expect(registeredUser.email).toBe(validEmail);
        expect(typeof registeredUser.password).toBe('string');
    });

    it('Should throw if username is invalid', async () => {
        const userRepo = getRepository(Users);
        const service = new RegisterUserService(userRepo);

        await expect(
            service.execute({
                name: '#$##@!$#@!$@',
                email: validEmail,
                password: validPassword,
            }),
        ).rejects.toThrow();
    });

    it('Should throw if email is invalid', async () => {
        const userRepo = getRepository(Users);
        const service = new RegisterUserService(userRepo);

        await expect(
            service.execute({
                name: validUserName,
                email: 'invalid @ mail',
                password: validPassword,
            }),
        ).rejects.toThrow();
    });

    it('Should throw if password is invalid', async () => {
        const userRepo = getRepository(Users);
        const service = new RegisterUserService(userRepo);

        await expect(
            service.execute({
                name: validUserName,
                email: validEmail,
                password: 'invalid password',
            }),
        ).rejects.toThrow();
    });

    it('Should throw if user already exists', async () => {
        const userRepo = getRepository(Users);
        const service = new RegisterUserService(userRepo);

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
