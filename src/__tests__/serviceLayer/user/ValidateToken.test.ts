import {
    getRepository,
    Connection,
    createConnection,
} from 'typeorm';
import { createHash } from 'crypto';
import { container } from 'tsyringe';

import registerRepositories from '../../../database/container';
import registerServices from '../../../services/container';

import Users from '../../../database/models/User';
import RegisterUserService from '../../../services/user/implementations/RegisterUserService';
import AuthenticateUserService from '../../../services/user/implementations/AuthenticateUserService';
import ValidateTokenService from '../../../services/user/implementations/ValidateTokenService';
import JwtSecurityService from '../../../services/user/implementations/JwtSecurityService';

describe('Validate Token', () => {
    let connection: Connection;
    const userEmail = 'test@mail.com';
    const userPassword = createHash('sha256').update('password').digest('hex');

    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
        registerRepositories({ typeormConnection: connection });
        registerServices();
    });

    afterEach(async () => {
        await connection.query('DELETE FROM users;');
    });

    afterAll(async () => {
        await connection.close();
    });

    it('Should return user if succeed', async () => {
        const securityService = container.resolve(JwtSecurityService);
        const registerService = container.resolve(RegisterUserService);
        const authService = container.resolve(AuthenticateUserService);
        const validateService = container.resolve(ValidateTokenService);

        await registerService.execute({
            email: userEmail,
            password: userPassword,
        });

        const { token } = await authService.execute({
            email: userEmail,
            password: userPassword,
        });

        const decodedToken = securityService.decodeJwt(token);
        const { user: { id: userId } } = await validateService.execute({ token });
        expect(userId).toBe(decodedToken.sub);
    });


    it('Should throw if jwt verify fails', async () => {
        const registerService = container.resolve(RegisterUserService);
        const validateService = container.resolve(ValidateTokenService);

        await registerService.execute({
            email: userEmail,
            password: userPassword,
        });

        await expect(
            validateService.execute({
                token: 'invalid token',
            }),
        ).rejects.toThrow();
    });

    it('Should throw if there is no user with userId', async () => {
        const userRepo = getRepository(Users);
        const registerService = container.resolve(RegisterUserService);
        const authService = container.resolve(AuthenticateUserService);
        const validateService = container.resolve(ValidateTokenService);

        await registerService.execute({
            email: userEmail,
            password: userPassword,
        });

        const { token } = await authService.execute({
            email: userEmail,
            password: userPassword,
        });

        /* user deletion forces missing user */
        await userRepo.delete({
            email: userEmail,
        });

        await expect(
            validateService.execute({ token }),
        ).rejects.toThrow();
    });
});
