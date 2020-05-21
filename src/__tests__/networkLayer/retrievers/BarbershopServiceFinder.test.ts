import request from 'supertest';
import express from 'express';
import { Connection, createConnection } from 'typeorm';

import { createHash } from 'crypto';
import registerRepositories from '../../../database/container';
import { GoBarberServer } from '../../../app';
import registerServices from '../../../services/container';
import User from '../../../database/models/User';
import Barbershop from '../../../database/models/Barbershop';
import ServiceType from '../../../database/models/ServiceType';

describe('Sessions Router', () => {
    let expressApp: express.Express;
    let connection: Connection;

    let clientToken: string;
    let registeredUser: User;
    let registeredBarbershop: Barbershop;

    let anotherClientToken: string;
    let anotherRegisteredUser: User;
    let anotherRegisteredBarbershop: Barbershop;

    let availableServiceType: ServiceType;
    let anotherAvailableServiceType: ServiceType;

    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();

        registerRepositories({ typeormConnection: connection });
        registerServices();

        /* Inserting serviceTypes manually since there is no designed route to create it */
        const serviceTypeRepository = connection.getRepository(ServiceType);
        availableServiceType = await serviceTypeRepository.save({
            title: 'Haircut - male',
            description: 'haircut for men',
            logoUrl: 'some logo url',
        });

        anotherAvailableServiceType = await serviceTypeRepository.save({
            title: 'Haircut - female',
            description: 'haircut for women',
            logoUrl: 'some female logo url',
        });

        expressApp = await GoBarberServer({
            typeormConnection: connection,
        });

        const { body: { token: firstToken, user: firstUser } } = await request(expressApp)
            .post('/user/register')
            .send({
                email: 'john@mail.com',
                password: createHash('sha256').update('12345678').digest('hex'),
            });

        clientToken = firstToken;
        registeredUser = firstUser;

        const { body: { barbershop: firstBarbershop } } = await request(expressApp)
            .post('/barbershop/')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                barbershop: {
                    name: 'johndoes shop',
                    address: 'Scissors Avenue, 3434',
                },
            });

        registeredBarbershop = firstBarbershop;

        const { body: { token: secondToken, user: secondUser } } = await request(expressApp)
            .post('/user/register')
            .send({
                email: 'john2@mail.com',
                password: createHash('sha256').update('12345678').digest('hex'),
            });

        anotherClientToken = secondToken;
        anotherRegisteredUser = secondUser;

        const { body: { barbershop: secondBarbershop } } = await request(expressApp)
            .post('/barbershop/')
            .set('Authorization', `Bearer ${anotherClientToken}`)
            .send({
                barbershop: {
                    name: 'johndoes shop',
                    address: 'Scissors Avenue, 3434',
                },
            });

        anotherRegisteredBarbershop = secondBarbershop;
    });

    afterEach(async () => {
        await connection.query('delete from barbershop_services');
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await connection.query('delete from service_types');
        await connection.query('delete from barbershops');
        await connection.query('delete from users');
        await connection.close();
    });

    test('GET "/services" - Retrieve services', async () => {
        await request(expressApp)
            .post('/barbershop/service')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                service: {
                    provider: registeredBarbershop,
                    type: availableServiceType,
                    price: 3000,
                    description: 'short haircut',
                    logo: 'short hair logo',
                },
            });

        await request(expressApp)
            .post('/barbershop/service')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                service: {
                    provider: registeredBarbershop,
                    type: anotherAvailableServiceType,
                    price: 5000,
                    description: 'long haircut',
                    logo: 'long hair logo',
                },
            });

        await request(expressApp)
            .post('/barbershop/service')
            .set('Authorization', `Bearer ${anotherClientToken}`)
            .send({
                service: {
                    provider: anotherRegisteredBarbershop,
                    type: availableServiceType,
                    price: 10000,
                    description: 'customer styled haircut',
                    lgoo: 'amazing start logo',
                },
            });


        /* changing male haircut to female */
        const response = await request(expressApp)
            .get('/services');

        expect(response.status).toBe(200);
        const { body: { serviceList } } = response;

        expect(Array.isArray(serviceList)).toBeTruthy();
        expect(serviceList.length).toBe(3);
        expect(serviceList).toContainEqual(expect.objectContaining({ description: 'short haircut' }));
        expect(serviceList).toContainEqual(expect.objectContaining({ description: 'long haircut' }));
        expect(serviceList).toContainEqual(expect.objectContaining({ description: 'customer styled haircut' }));
    });
});
