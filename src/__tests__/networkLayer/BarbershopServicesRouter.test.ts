import request from 'supertest';
import express from 'express';
import { Connection, createConnection } from 'typeorm';

import { createHash } from 'crypto';
import registerRepositories from '../../database/container';
import { GoBarberServer } from '../../app';
import registerServices from '../../services/container';
import User from '../../database/models/User';
import Barbershop from '../../database/models/Barbershop';
import ServiceType from '../../database/models/ServiceType';

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

    test('POST "/barbershop/service" - Registers new service', async () => {
        const response = await request(expressApp)
            .post('/barbershop/service')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                service: {
                    provider: registeredBarbershop,
                    type: availableServiceType,
                    price: 5000,
                    description: 'johns amazing haircut',
                    logoUrl: 'custom logo',
                },
            });

        expect(response.status).toBe(200);

        const { body: { service: createdService } } = response;

        expect(createdService).toHaveProperty('id');
        expect(createdService).toHaveProperty('provider');
        expect(createdService).toHaveProperty('type');
        expect(createdService).toHaveProperty('price', 5000);
        expect(createdService).toHaveProperty('description', 'johns amazing haircut');
        expect(createdService).toHaveProperty('logoUrl', 'custom logo');

        expect(createdService.provider).toHaveProperty('id', registeredBarbershop.id);
        expect(createdService.type).toHaveProperty('id', availableServiceType.id);
    });

    test('PUT "/barbershop/service/:id" - Updates service', async () => {
        const { body: { service: createdService } } = await request(expressApp)
            .post('/barbershop/service')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                service: {
                    provider: registeredBarbershop,
                    type: availableServiceType,
                    price: 5000,
                    description: 'johns amazing haricut',
                    logoUrl: 'custom logo',
                },
            });

        /* changing male haircut to female */
        const response = await request(expressApp)
            .put(`/barbershop/service/${createdService.id}`)
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                service: {
                    provider: registeredBarbershop,
                    type: anotherAvailableServiceType,
                    price: 6000,
                },
            });


        expect(response.status).toBe(200);

        const { body: { service: updatedService } } = response;

        expect(updatedService).toHaveProperty('id');
        expect(updatedService).toHaveProperty('type');
        expect(updatedService.type).toHaveProperty('id', anotherAvailableServiceType.id);
    });

    test('DELETE "/barbershop/service/:id" - Deletes service', async () => {
        const { body: { service: createdService } } = await request(expressApp)
            .post('/barbershop/service')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                service: {
                    provider: registeredBarbershop,
                    type: availableServiceType,
                    price: 5000,
                    description: 'johns amazing haricut',
                    logoUrl: 'custom logo',
                },
            });

        /* changing male haircut to female */
        const response = await request(expressApp)
            .delete(`/barbershop/service/${createdService.id}`)
            .set('Authorization', `Bearer ${clientToken}`);

        expect(response.status).toBe(200);

        const { body: { service: deletedService } } = response;
        expect(deletedService).toHaveProperty('id', createdService.id);
    });

    test('GET "/barbershop/service/:id" - Filters service by barbershop', async () => {
        await request(expressApp)
            .post('/barbershop/service')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                service: {
                    provider: registeredBarbershop,
                    type: availableServiceType,
                    price: 3000,
                    description: 'short haircut',
                    logoUrl: 'short hair logo',
                },
            });

        const choosenResponse = await request(expressApp)
            .post('/barbershop/service')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                service: {
                    provider: registeredBarbershop,
                    type: anotherAvailableServiceType,
                    price: 5000,
                    description: 'long haircut',
                    logoUrl: 'long hair logo',
                },
            });

        const { service: createdService } = choosenResponse.body;

        /* changing male haircut to female */
        const response = await request(expressApp)
            .get(`/barbershop/service/${createdService.id}`)
            .set('Authorization', `Bearer ${clientToken}`);


        expect(response.status).toBe(200);
        const { body: { service: existingService } } = response;

        expect(existingService).toHaveProperty('id');
        expect(existingService).toHaveProperty('provider');
        expect(existingService).toHaveProperty('type');
        expect(existingService).toHaveProperty('price', 5000);
        expect(existingService).toHaveProperty('description', 'long haircut');
        expect(existingService).toHaveProperty('logoUrl', 'long hair logo');

        expect(existingService.provider).toHaveProperty('id', registeredBarbershop.id);
        expect(existingService.type).toHaveProperty('id', anotherAvailableServiceType.id);
    });
});
