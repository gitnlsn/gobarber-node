import request from 'supertest';
import express, { Response } from 'express';
import { Connection, createConnection, Repository } from 'typeorm';

import { createHash } from 'crypto';
import registerRepositories from '../../database/container';
import { GoBarberServer } from '../../app';
import registerServices from '../../services/container';
import User from '../../database/models/User';
import Barbershop from '../../database/models/Barbershop';

describe('Sessions Router', () => {
    let expressApp: express.Express;
    let connection: Connection;

    let registeredUser: User;
    let clientToken: string;

    beforeAll(async () => {
        connection = await createConnection();
        connection.runMigrations();

        registerRepositories({ typeormConnection: connection });
        registerServices();

        expressApp = await GoBarberServer({
            typeormConnection: connection,
        });
    });

    beforeEach(async () => {
        const { body: { token, user } } = await request(expressApp)
            .post('/user/register')
            .send({
                email: 'john@mail.com',
                password: createHash('sha256').update('12345678').digest('hex'),
            });

        registeredUser = user;
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

    test('Registers a barbershop', async () => {
        const response = await request(expressApp)
            .post('/barbershop/')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                barbershop: {
                    name: 'johndoes barbershop',
                    address: 'Scissors Avenue, 3434',
                },
            });

        expect(response.status).toBe(200);

        const { barbershop } = response.body;
        expect(barbershop).toHaveProperty('id');
        expect(barbershop).toHaveProperty('name', 'johndoes barbershop');
        expect(barbershop).toHaveProperty('address', 'Scissors Avenue, 3434');

        const [storedBarbershop] = await connection.query(`
            select *
            from barbershops
            where name = '${'johndoes barbershop'}'
        `);

        expect(storedBarbershop).toHaveProperty('id');
        expect(storedBarbershop).toHaveProperty('name');
        expect(storedBarbershop).toHaveProperty('address', 'Scissors Avenue, 3434');
        expect(storedBarbershop).toHaveProperty('status', 'enabled');
        expect(storedBarbershop).toHaveProperty('created_at');
        expect(storedBarbershop).toHaveProperty('updated_at');
    });

    test('Updates a barbershop', async () => {
        const { body } = await request(expressApp)
            .post('/barbershop/')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                barbershop: {
                    name: 'johndoes barbershop',
                    address: 'Scissors Avenue, 3434',
                },
            });

        const storedBarbershop = body.barbershop;

        const response = await request(expressApp)
            .put(`/barbershop/${storedBarbershop.id}`)
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                barbershop: {
                    name: 'johndoes barbershop',
                    address: 'Scissors Avenue, 3434',
                    slogan: 'Your hair like crazy',
                    description: 'Have a nice haircut at johns',
                },
            });

        expect(response.status).toBe(200);

        const [updatedBarbershop] = await connection.query(`
            select *
            from barbershops
            where name = '${'johndoes barbershop'}'
        `);

        expect(updatedBarbershop).toHaveProperty('slogan', 'Your hair like crazy');
        expect(updatedBarbershop).toHaveProperty('description', 'Have a nice haircut at johns');
    });

    test.skip('Disables and Enables a barbershop', async () => {
        /* Unimplemented */
        const { body } = await request(expressApp)
            .post('/barbershop/')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                barbershop: {
                    name: 'johndoes barbershop',
                    address: 'Scissors Avenue, 3434',
                },
            });

        const storedBarbershop = body.barbershop;

        /* Disables */
        const disableResponse = await request(expressApp)
            .put(`/barbershop/disable/${storedBarbershop.id}`)
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                barbershop: {
                    name: 'johndoes barbershop',
                    address: 'Scissors Avenue, 3434',
                    slogan: 'Your hair like crazy',
                    description: 'Have a nice haircut at johns',
                },
            });

        expect(disableResponse.status).toBe(200);

        const disabledBarbershop = disableResponse.body.barbershop;
        expect(disabledBarbershop).toHaveProperty('status', 'disabled');

        /* Enables */
        const enableResponse = await request(expressApp)
            .put(`/barbershop/enable/${storedBarbershop.id}`)
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                barbershop: {
                    name: 'johndoes barbershop',
                    address: 'Scissors Avenue, 3434',
                    slogan: 'Your hair like crazy',
                    description: 'Have a nice haircut at johns',
                },
            });

        expect(enableResponse.status).toBe(200);

        const enabledBarbershop = enableResponse.body.barbershop;
        expect(enabledBarbershop).toHaveProperty('status', 'enabled');
    });

    test('Deletes a barbershop', async () => {
        const { body } = await request(expressApp)
            .post('/barbershop/')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                barbershop: {
                    name: 'johndoes barbershop',
                    address: 'Scissors Avenue, 3434',
                },
            });

        const storedBarbershop = body.barbershop;

        /* Deletes */
        const deleteResponse = await request(expressApp)
            .delete(`/barbershop/${storedBarbershop.id}`)
            .set('Authorization', `Bearer ${clientToken}`);

        expect(deleteResponse.status).toBe(200);

        const [deletedBarbershop] = await connection.query(`
            select *
            from barbershops
            where name = '${'johndoes barbershop'}'
        `);
        expect(deletedBarbershop).toHaveProperty('status', 'deleted');
    });

    test('Retrieve a barbershop by id', async () => {
        const { body } = await request(expressApp)
            .post('/barbershop/')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                barbershop: {
                    name: 'johndoes barbershop',
                    address: 'Scissors Avenue, 3434',
                },
            });

        const storedBarbershop = body.barbershop;

        /* Deletes */
        const getResponse = await request(expressApp)
            .get(`/barbershop/${storedBarbershop.id}`)
            .set('Authorization', `Bearer ${clientToken}`);

        expect(getResponse.status).toBe(200);

        const retrievedBarbershop = getResponse.body.barbershop;
        expect(retrievedBarbershop).toHaveProperty('id');
        expect(retrievedBarbershop).toHaveProperty('name', 'johndoes barbershop');
        expect(retrievedBarbershop).toHaveProperty('address', 'Scissors Avenue, 3434');
    });
});
