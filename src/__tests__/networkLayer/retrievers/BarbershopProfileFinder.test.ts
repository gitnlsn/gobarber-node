import request from 'supertest';
import express from 'express';
import { Connection, createConnection } from 'typeorm';

import { createHash } from 'crypto';
import { GoBarberServer } from '../../../app';

describe('Retriever Router to Barbershop Profiles', () => {
    let expressApp: express.Express;
    let connection: Connection;

    let clientToken: string;

    beforeAll(async () => {
        connection = await createConnection();

        expressApp = await GoBarberServer({
            typeormConnection: connection,
        });
    });

    beforeEach(async () => {
        const { body: { token } } = await request(expressApp)
            .post('/user/register')
            .send({
                email: 'john@mail.com',
                password: createHash('sha256').update('12345678').digest('hex'),
            });

        clientToken = token;
    });

    afterEach(async () => {
        await connection.query('delete from barbershops');
        await connection.query('delete from users');
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await connection.close();
    });

    test('GET "/barbershops" - Retrieve all barbershops', async () => {
        const { body: { token: client1Token } } = await request(expressApp)
            .post('/user/register')
            .send({
                email: 'client1@mail.com',
                password: createHash('sha256').update('12345678').digest('hex'),
            });

        await request(expressApp)
            .post('/barbershop')
            .set('Authorization', `Bearer ${client1Token}`)
            .send({
                barbershop: {
                    name: 'barbershop 1',
                    address: 'Scissors Avenue, 3434',
                },
            });

        const { body: { token: client2Token } } = await request(expressApp)
            .post('/user/register')
            .send({
                email: 'client2@mail.com',
                password: createHash('sha256').update('12345678').digest('hex'),
            });

        await request(expressApp)
            .post('/barbershop')
            .set('Authorization', `Bearer ${client2Token}`)
            .send({
                barbershop: {
                    name: 'barbershop 2',
                    address: 'Scissors Avenue, 3434',
                },
            });

        const { body: { token: client3Token } } = await request(expressApp)
            .post('/user/register')
            .send({
                email: 'client3@mail.com',
                password: createHash('sha256').update('12345678').digest('hex'),
            });

        await request(expressApp)
            .post('/barbershop')
            .set('Authorization', `Bearer ${client3Token}`)
            .send({
                barbershop: {
                    name: 'barbershop 3',
                    address: 'Scissors Avenue, 3434',
                },
            });

        /* Deletes */
        const getResponse = await request(expressApp)
            .get('/barbershops')
            .set('Authorization', `Bearer ${clientToken}`);

        expect(getResponse.status).toBe(200);

        const retrievedBarbershopList = getResponse.body.barbershopList;
        expect(Array.isArray(retrievedBarbershopList)).toBeTruthy();
        expect(retrievedBarbershopList.length).toBe(3);
        expect(retrievedBarbershopList).toContainEqual(
            expect.objectContaining({ name: 'barbershop 1' }),
        );
        expect(retrievedBarbershopList).toContainEqual(
            expect.objectContaining({ name: 'barbershop 2' }),
        );
        expect(retrievedBarbershopList).toContainEqual(
            expect.objectContaining({ name: 'barbershop 3' }),
        );
    });
});
