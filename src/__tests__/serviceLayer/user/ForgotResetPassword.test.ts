import 'reflect-metadata';
import { container } from 'tsyringe';

import {
    Connection,
    createConnection,
} from 'typeorm';
import { createHash } from 'crypto';

import registerRepositories from '../../../database/container';
import registerServices from '../../../services/container';

import RegisterUserService from '../../../services/user/implementations/RegisterUserService';
import JwtSecurityService from '../../../services/user/implementations/JwtSecurityService';
import ForgotPasswordService from '../../../services/user/implementations/ForgotPasswordService';
import ResetPasswordService from '../../../services/user/implementations/ResetPasswordService';
import AuthenticateUserService from '../../../services/user/implementations/AuthenticateUserService';
import ValidateTokenService from '../../../services/user/implementations/ValidateTokenService';

describe('Forgot and Reset Password', () => {
    let connection: Connection;
    const userName = 'john doe';
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

    describe('Forgot Password', () => {
        it('Forgot Password Service should return token with id', async () => {
            const registerService = container.resolve(RegisterUserService);
            const forgotPasswordService = container.resolve(ForgotPasswordService);
            const securityService = container.resolve(JwtSecurityService);

            const { user } = await registerService.execute({
                name: userName,
                email: userEmail,
                password: userPassword,
            });

            const { token } = await forgotPasswordService.execute({
                email: userEmail,
            });

            const { sub } = securityService.decodeJwt(token);

            expect(sub).toBe(user.id);
        });

        it('Forgot Password Service should return token with resetPassword usage', async () => {
            const registerService = container.resolve(RegisterUserService);
            const forgotPasswordService = container.resolve(ForgotPasswordService);
            const securityService = container.resolve(JwtSecurityService);

            await registerService.execute({
                name: userName,
                email: userEmail,
                password: userPassword,
            });

            const { token } = await forgotPasswordService.execute({
                email: userEmail,
            });

            const { usage } = securityService.decodeJwt(token);

            expect(usage).toBe('resetPassword');
        });

        it('Should throw if email is invalid', async () => {
            const registerService = container.resolve(RegisterUserService);
            const forgotPasswordService = container.resolve(ForgotPasswordService);

            await registerService.execute({
                email: userEmail,
                password: userPassword,
            });

            await expect(
                forgotPasswordService.execute({
                    email: 'invalid @ mail',
                }),
            ).rejects.toThrow();
        });
    });
    describe('Reset Password', () => {
        const newPasswordHash = createHash('sha256').update('new password').digest('hex');

        it('Should allow authentication with new password', async () => {
            const registerService = container.resolve(RegisterUserService);
            const forgotPasswordService = container.resolve(ForgotPasswordService);
            const authenticateUserService = container.resolve(AuthenticateUserService);
            const resetPasswordService = container.resolve(ResetPasswordService);

            await registerService.execute({
                name: userName,
                email: userEmail,
                password: userPassword,
            });

            const { token: resetPasswordToken } = await forgotPasswordService.execute({
                email: userEmail,
            });

            await resetPasswordService.execute({
                newPassword: newPasswordHash,
                token: resetPasswordToken,
            });

            await authenticateUserService.execute({
                email: userEmail,
                password: newPasswordHash,
            });
            /* expects not to throw */
        });

        it('Should return valid token at reset event', async () => {
            const registerService = container.resolve(RegisterUserService);
            const forgotPasswordService = container.resolve(ForgotPasswordService);
            const validateTokenService = container.resolve(ValidateTokenService);
            const resetPasswordService = container.resolve(ResetPasswordService);

            await registerService.execute({
                name: userName,
                email: userEmail,
                password: userPassword,
            });

            const { token: resetPasswordToken } = await forgotPasswordService.execute({
                email: userEmail,
            });

            const { token: newClientToken } = await resetPasswordService.execute({
                newPassword: newPasswordHash,
                token: resetPasswordToken,
            });

            await validateTokenService.execute({
                token: newClientToken,
            });
            /* expects not to throw */
        });

        it('Should throw if new password is invalid', async () => {
            const registerService = container.resolve(RegisterUserService);
            const forgotPasswordService = container.resolve(ForgotPasswordService);
            const resetPasswordService = container.resolve(ResetPasswordService);

            await registerService.execute({
                name: userName,
                email: userEmail,
                password: userPassword,
            });

            const { token: resetPasswordToken } = await forgotPasswordService.execute({
                email: userEmail,
            });

            await expect(resetPasswordService.execute({
                newPassword: 'invalid new password',
                token: resetPasswordToken,
            })).rejects.toThrow();
        });
    });
});
