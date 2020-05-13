import 'reflect-metadata';
import { container } from 'tsyringe';

import {
    Connection,
    createConnection,
} from 'typeorm';
import { createHash } from 'crypto';

import registerRespositories from '../../../database/container';
import registerServices from '../../../services/container';

import RegisterUserService from '../../../services/user/implementations/RegisterUserService';
import AuthenticateUserService from '../../../services/user/implementations/AuthenticateUserService';
import JwtSecurityService from '../../../services/user/implementations/JwtSecurityService';

describe('Authenticate User', () => {
    let connection: Connection;
    const userName = 'john doe';
    const userEmail = 'test@mail.com';
    const userPassword = createHash('sha256').update('password').digest('hex');

    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
        registerRespositories({ typeormConnection: connection });
        registerServices();
    });

    afterEach(async () => {
        await connection.query('DELETE FROM users;');
    });

    afterAll(async () => {
        await connection.close();
    });

    it('Should return user data', async () => {
        const registerService = container.resolve(RegisterUserService);
        const authService = container.resolve(AuthenticateUserService);

        await registerService.execute({
            name: userName,
            email: userEmail,
            password: userPassword,
        });

        const { user } = await authService.execute({
            email: userEmail,
            password: userPassword,
        });

        expect(user.name).toBe(userName);
        expect(user.email).toBe(userEmail);
    });

    it('Should return token', async () => {
        const registerService = container.resolve(RegisterUserService);
        const authService = container.resolve(AuthenticateUserService);
        const securityService = container.resolve(JwtSecurityService);

        await registerService.execute({
            email: userEmail,
            password: userPassword,
        });

        const { token } = await authService.execute({
            email: userEmail,
            password: userPassword,
        });

        const decodedToken = securityService.decodeJwt(token);
        expect(decodedToken).toHaveProperty('iat');
        expect(decodedToken).toHaveProperty('sub');
        expect(decodedToken).toHaveProperty('exp');
    });


    it('Should throw if email is invalid', async () => {
        const registerService = container.resolve(RegisterUserService);
        const authService = container.resolve(AuthenticateUserService);

        await registerService.execute({
            email: userEmail,
            password: userPassword,
        });

        await expect(
            authService.execute({
                email: 'invalid @ mail',
                password: userPassword,
            }),
        ).rejects.toThrow();
    });

    it('Should throw if password is invalid', async () => {
        const registerService = container.resolve(RegisterUserService);
        const authService = container.resolve(AuthenticateUserService);

        await registerService.execute({
            email: userEmail,
            password: userPassword,
        });

        await expect(
            authService.execute({
                email: userEmail,
                password: 'invalid password',
            }),
        ).rejects.toThrow();
    });
});
