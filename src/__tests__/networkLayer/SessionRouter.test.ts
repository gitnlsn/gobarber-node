import request from 'supertest';
import express from 'express';
import { Connection, createConnection } from 'typeorm';
import { createHash } from 'crypto';
import mailjet from 'node-mailjet';

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
        await connection.runMigrations();

        process.env.MAILJET_APIKEY_PUBLIC = 'public key';
        process.env.MAILJET_APIKEY_PRIVATE = 'private key';
        process.env.APPLICATION_DOMAIN_NAME = 'app.domain.com';
        process.env.MAILJET_SENDER_EMAIL = 'testing@gobarber.com';

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
        const setKeyMock = jest.spyOn(mailjet, 'connect') as jest.SpyInstance;
        const jetPostResponse = {
            request: jest.fn(async (foo) => ({
                body: {
                    Messages: [{
                        Status: 'success',
                        To: [{
                            Email: 'john@mail.com',
                            MessageUUID: '123',
                            MessageID: 456,
                            MessageHref: 'https://api.mailjet.com/v3/message/456',
                        }],
                        Bcc: [],
                        Cc: [],
                        CustomID: 'some id',
                    }],
                },
            } as mailjet.Email.PostResponse)),
            action: jest.fn(),
            id: jest.fn(),
        } as mailjet.Email.PostResource;
        const jetMock = {
            post: jest.fn(() => jetPostResponse),
            get: jest.fn(),
            put: jest.fn(),
        } as mailjet.Email.Client;
        setKeyMock.mockImplementation((pubKey, privKey) => jetMock);

        const forgotPasswordResponse = await request(expressApp)
            .post('/user/password/forgot')
            .send({
                email: 'john@mail.com',
            });

        expect(forgotPasswordResponse.status).toBe(200);
        expect(forgotPasswordResponse.body).toHaveProperty('message');

        expect(jetMock.post).toHaveBeenCalledTimes(1);
        expect(jetPostResponse.request).toHaveBeenCalledTimes(1);
        expect(jetPostResponse.request).toHaveBeenCalledWith(
            expect.objectContaining({
                Messages: expect.arrayContaining([
                    expect.objectContaining({
                        To: expect.arrayContaining([expect.objectContaining({
                            Email: 'john@mail.com',
                        })]),
                        Subject: 'Password Reset Link',
                    }),
                ]),
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
