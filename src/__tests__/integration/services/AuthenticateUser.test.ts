import {
    getRepository,
    Connection,
    createConnection,
} from 'typeorm';
import { createHash } from 'crypto';
import { verify } from 'jsonwebtoken';

import Users from '../../../models/Users';
import RegisterUserService from '../../../services/RegisterUserService';
import AuthenticateUserService from '../../../services/AuthenticateUserService';

describe('Authenticate User', () => {
    let connection: Connection;
    const jwtSignKey = 'jwt incredibly long key and randomly generated';
    const userEmail = 'test@mail.com';
    const userPassword = createHash('sha256').update('password').digest('hex');

    beforeAll(async () => {
        connection = await createConnection();
    });

    afterEach(async () => {
        await connection.query('DELETE FROM users;');
    });

    afterAll(async () => {
        await connection.close();
    });

    it('Should return token', async () => {
        const userRepo = getRepository(Users);
        const registerService = new RegisterUserService(userRepo);
        const authService = new AuthenticateUserService(userRepo, jwtSignKey);

        await registerService.execute({
            email: userEmail,
            password: userPassword,
        });

        const token = await authService.execute({
            email: userEmail,
            password: userPassword,
        });

        if (token) {
            const decodedToken = verify(token, jwtSignKey);
            expect(decodedToken).toHaveProperty('iat');
            expect(decodedToken).toHaveProperty('sub');
            expect(decodedToken).toHaveProperty('exp');
        }
    });


    it('Should return null if email is invalid', async () => {
        const userRepo = getRepository(Users);
        const registerService = new RegisterUserService(userRepo);
        const authService = new AuthenticateUserService(userRepo, jwtSignKey);

        await registerService.execute({
            email: userEmail,
            password: userPassword,
        });

        const token = await authService.execute({
            email: 'invalid @ mail',
            password: userPassword,
        });

        expect(token).toBe(null);
    });

    it('Should return null if password is invalid', async () => {
        const userRepo = getRepository(Users);
        const registerService = new RegisterUserService(userRepo);
        const authService = new AuthenticateUserService(userRepo, jwtSignKey);

        await registerService.execute({
            email: userEmail,
            password: userPassword,
        });

        const token = await authService.execute({
            email: userEmail,
            password: 'invalid password',
        });

        expect(token).toBe(null);
    });
});
