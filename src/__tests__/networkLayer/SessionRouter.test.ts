import request from 'supertest';
import express, { Response } from 'express';
import { Connection, createConnection } from 'typeorm';
import { createHash } from 'crypto';
import sendgrid from '@sendgrid/mail';

import { container } from 'tsyringe';
import registerRepositories from '../../database/container';
import { GoBarberServer } from '../../app';
import registerServices from '../../services/container';
import JwtSecurityService from '../../services/user/implementations/JwtSecurityService';

describe('Sessions Router', () => {
    let expressApp: express.Express;
    let connection: Connection;

    beforeAll(async () => {
        connection = await createConnection();
        connection.runMigrations();

        registerRepositories({ typeormConnection: connection });
        registerServices();

        expressApp = await GoBarberServer({
            typeormConnection: connection,
        });
    });

    afterEach(async () => {
        await connection.query('delete from users');
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await connection.close();
    });

    test('Fails to authenticate without registering', async () => {
        const failedAuthResponse = await request(expressApp)
            .post('/user/authenticate')
            .send({
                email: 'john@mail.com',
                password: '123456',
            });

        expect(failedAuthResponse.status).toBe(400);
        expect(failedAuthResponse.body).toHaveProperty('status', 'error');
        expect(failedAuthResponse.body).toHaveProperty('message');
    });

    test('Registers and authenticates', async () => {
        const registerResponse = await request(expressApp)
            .post('/user/register')
            .send({
                email: 'john@mail.com',
                password: createHash('sha256').update('12345678').digest('hex'),
            });

        expect(registerResponse.status).toBe(200);
        expect(registerResponse.body).toHaveProperty('token');
        expect(registerResponse.body).toHaveProperty('user');
        expect(registerResponse.body.user).toHaveProperty('id');
        expect(registerResponse.body.user).toHaveProperty('email');

        const successfullAuthResponse = await request(expressApp)
            .post('/user/authenticate')
            .send({
                email: 'john@mail.com',
                password: createHash('sha256').update('12345678').digest('hex'),
            });

        expect(successfullAuthResponse.status).toBe(200);
        expect(successfullAuthResponse.body).toHaveProperty('token');
        expect(successfullAuthResponse.body).toHaveProperty('user');
        expect(successfullAuthResponse.body.user).toHaveProperty('id');
        expect(successfullAuthResponse.body.user).toHaveProperty('email');

        const { token } = successfullAuthResponse.body;

        const validateTokenResponse = await request(expressApp)
            .post('/user/validate-token')
            .send({
                token,
            });

        expect(validateTokenResponse.status).toBe(200);
        expect(validateTokenResponse.body).toHaveProperty('token');
        expect(validateTokenResponse.body).toHaveProperty('user');
        expect(validateTokenResponse.body.user).toHaveProperty('id');
        expect(validateTokenResponse.body.user).toHaveProperty('email');
    });

    test('Forgets password and Reset', async () => {
        await request(expressApp)
            .post('/user/register')
            .send({
                email: 'john@mail.com',
                password: createHash('sha256').update('12345678').digest('hex'),
            });

        /* Temporary mocking to SendGrid */
        process.env.SENDGRID_API_KEY = 'key';
        const setKeyMock = jest.spyOn(sendgrid, 'setApiKey') as jest.SpyInstance;
        const sendMock = jest.spyOn(sendgrid, 'send') as jest.SpyInstance;
        setKeyMock.mockImplementation((key) => key);
        sendMock.mockImplementation(async () => ([{ statusCode: 200 } as Response]));

        const forgotPasswordResponse = await request(expressApp)
            .post('/user/password/forgot')
            .send({
                email: 'john@mail.com',
            });

        expect(forgotPasswordResponse.status).toBe(200);
        expect(forgotPasswordResponse.body).toHaveProperty('message');

        expect(sendMock).toHaveBeenCalledTimes(1);
        expect(sendMock).toHaveBeenCalledWith(
            expect.objectContaining({
                to: 'john@mail.com',
                subject: 'Reset Password',
            }),
        );

        const [johnDoeUser] = await connection.query(`
            select id from users where email  = '${'john@mail.com'}'
        `);

        const jwtService = container.resolve(JwtSecurityService);
        const resetPasswordToken = jwtService.signJwt(
            johnDoeUser.id,
            undefined,
            { usage: 'resetPassword' },
        );

        const resetPasswordResponse = await request(expressApp)
            .post('/user/password/reset')
            .send({
                token: resetPasswordToken,
                newPassword: createHash('sha256').update('12345678').digest('hex'),
            });

        expect(resetPasswordResponse.status).toBe(200);
        expect(resetPasswordResponse.body).toHaveProperty('token');
        expect(resetPasswordResponse.body).toHaveProperty('user');
        expect(resetPasswordResponse.body.user).toHaveProperty('id');
        expect(resetPasswordResponse.body.user).toHaveProperty('email');
    });
});
