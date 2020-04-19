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
import ValidateTokenService from '../../../services/ValidateTokenService';

describe('Validate Token', () => {
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

    it('Should return userId if succeed', async () => {
        const userRepo = getRepository(Users);
        const registerService = new RegisterUserService(userRepo);
        const authService = new AuthenticateUserService(userRepo, jwtSignKey);
        const validateService = new ValidateTokenService(userRepo, jwtSignKey);

        await registerService.execute({
            email: userEmail,
            password: userPassword,
        });

        const token = await authService.execute({
            email: userEmail,
            password: userPassword,
        });

        if (token) {
            const decodedToken = verify(token, jwtSignKey) as { sub: string };
            const userId = await validateService.execute({
                token,
            });
            expect(userId).toBe(decodedToken.sub);
        }
    });


    it('Should return null if jwt verify fails', async () => {
        const userRepo = getRepository(Users);
        const registerService = new RegisterUserService(userRepo);
        const authService = new AuthenticateUserService(userRepo, jwtSignKey);
        const validateService = new ValidateTokenService(userRepo, jwtSignKey);

        await registerService.execute({
            email: userEmail,
            password: userPassword,
        });

        const token = await authService.execute({
            email: userEmail,
            password: userPassword,
        });

        if (token) {
            const userId = await validateService.execute({
                token: 'invalid token',
            });
            expect(userId).toBe(null);
        }
    });

    it('Should return null if there is no user with userId', async () => {
        const userRepo = getRepository(Users);
        const registerService = new RegisterUserService(userRepo);
        const authService = new AuthenticateUserService(userRepo, jwtSignKey);
        const validateService = new ValidateTokenService(userRepo, jwtSignKey);

        await registerService.execute({
            email: userEmail,
            password: userPassword,
        });

        const token = await authService.execute({
            email: userEmail,
            password: userPassword,
        });

        /* user deletion forces missing user */
        await userRepo.delete({
            email: userEmail,
        });

        if (token) {
            const userId = await validateService.execute({
                token,
            });
            expect(userId).toBe(null);
        }
    });
});
