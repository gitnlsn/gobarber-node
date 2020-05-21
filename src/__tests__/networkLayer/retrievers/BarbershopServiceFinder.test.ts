import request from 'supertest';
import express from 'express';
import { Connection, createConnection } from 'typeorm';

import { createHash } from 'crypto';
import registerRepositories from '../../../database/container';
import { GoBarberServer } from '../../../app';
import registerServices from '../../../services/container';
import Barbershop from '../../../database/models/Barbershop';
import ServiceType from '../../../database/models/ServiceType';

describe('Sessions Router', () => {
    let expressApp: express.Express;
    let connection: Connection;

    let barbershopToken: string;
    let registeredBarbershop: Barbershop;

    let anotherBarbershopToken: string;
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

        const { body: { token: firstToken } } = await request(expressApp)
            .post('/user/register')
            .send({
                email: 'john@mail.com',
                password: createHash('sha256').update('12345678').digest('hex'),
            });

        barbershopToken = firstToken;

        const { body: { barbershop: firstBarbershop } } = await request(expressApp)
            .post('/barbershop/')
            .set('Authorization', `Bearer ${barbershopToken}`)
            .send({
                barbershop: {
                    name: 'johndoes shop',
                    address: 'Scissors Avenue, 3434',
                },
            });

        registeredBarbershop = firstBarbershop;

        const { body: { token: secondToken } } = await request(expressApp)
            .post('/user/register')
            .send({
                email: 'john2@mail.com',
                password: createHash('sha256').update('12345678').digest('hex'),
            });

        anotherBarbershopToken = secondToken;

        const { body: { barbershop: secondBarbershop } } = await request(expressApp)
            .post('/barbershop/')
            .set('Authorization', `Bearer ${anotherBarbershopToken}`)
            .send({
                barbershop: {
                    name: 'johndoes shop',
                    address: 'Scissors Avenue, 3434',
                },
            });

        anotherRegisteredBarbershop = secondBarbershop;

        await request(expressApp)
            .post('/barbershop/service')
            .set('Authorization', `Bearer ${barbershopToken}`)
            .send({
                service: {
                    provider: registeredBarbershop,
                    type: availableServiceType,
                    price: 4000,
                    description: 'short haircut',
                    logo: 'short hair logo',
                },
            });

        await request(expressApp)
            .post('/barbershop/service')
            .set('Authorization', `Bearer ${barbershopToken}`)
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
            .set('Authorization', `Bearer ${anotherBarbershopToken}`)
            .send({
                service: {
                    provider: anotherRegisteredBarbershop,
                    type: availableServiceType,
                    price: 6000,
                    description: 'short styled haircut',
                    lgoo: 'amazing start logo',
                },
            });

        await request(expressApp)
            .post('/barbershop/service')
            .set('Authorization', `Bearer ${anotherBarbershopToken}`)
            .send({
                service: {
                    provider: anotherRegisteredBarbershop,
                    type: anotherAvailableServiceType,
                    price: 8000,
                    description: 'long styled haircut',
                    lgoo: 'amazing start logo',
                },
            });
    });

    afterAll(async () => {
        await connection.query('delete from barbershop_services');
        await connection.query('delete from service_types');
        await connection.query('delete from barbershops');
        await connection.query('delete from users');
        await connection.close();
    });

    describe('Default behaviour', () => {
        test('GET "/services" retrieves all', async () => {
            const response = await request(expressApp)
                .get('/services');

            expect(response.status).toBe(200);
            const { serviceList } = response.body;

            expect(Array.isArray(serviceList)).toBeTruthy();
            expect(serviceList.length).toBe(4);
            expect(serviceList).toContainEqual(expect.objectContaining({ description: 'short haircut' }));
            expect(serviceList).toContainEqual(expect.objectContaining({ description: 'long haircut' }));
            expect(serviceList).toContainEqual(expect.objectContaining({ description: 'short styled haircut' }));
            expect(serviceList).toContainEqual(expect.objectContaining({ description: 'long styled haircut' }));
        });
    });

    describe('Filtering', () => {
        test('GET "/services?barbershopId=:id" - filters by barbershop_id', async () => {
            /* first barbershop services */
            const firstResponse = await request(expressApp)
                .get(`/services?barbershopId=${registeredBarbershop.id}`);

            expect(firstResponse.status).toBe(200);
            const { serviceList: firstBarbershopServiceList } = firstResponse.body;

            expect(Array.isArray(firstBarbershopServiceList)).toBeTruthy();
            expect(firstBarbershopServiceList.length).toBe(2);
            expect(firstBarbershopServiceList).toContainEqual(expect.objectContaining({ description: 'short haircut' }));
            expect(firstBarbershopServiceList).toContainEqual(expect.objectContaining({ description: 'long haircut' }));

            /* Second barbershop services */
            const secondResponse = await request(expressApp)
                .get(`/services?barbershopId=${anotherRegisteredBarbershop.id}`);

            expect(secondResponse.status).toBe(200);
            const { serviceList } = secondResponse.body;

            expect(Array.isArray(serviceList)).toBeTruthy();
            expect(serviceList.length).toBe(2);
            expect(serviceList).toContainEqual(expect.objectContaining({ description: 'short styled haircut' }));
            expect(serviceList).toContainEqual(expect.objectContaining({ description: 'long styled haircut' }));
        });

        test('GET "/services?serviceTypeId=:id" - filters by serviceType', async () => {
            /* First serviceType */
            const firstResponse = await request(expressApp)
                .get(`/services?serviceTypeId=${availableServiceType.id}`);

            expect(firstResponse.status).toBe(200);
            const { serviceList: firstServiceList } = firstResponse.body;

            expect(Array.isArray(firstServiceList)).toBeTruthy();
            expect(firstServiceList.length).toBe(2);
            expect(firstServiceList).toContainEqual(expect.objectContaining({ description: 'short haircut' }));
            expect(firstServiceList).toContainEqual(expect.objectContaining({ description: 'short styled haircut' }));

            /* Second serviceType */
            const secondResponse = await request(expressApp)
                .get(`/services?serviceTypeId=${anotherAvailableServiceType.id}`);

            expect(secondResponse.status).toBe(200);
            const { serviceList: secondServiceList } = secondResponse.body;

            expect(Array.isArray(secondServiceList)).toBeTruthy();
            expect(secondServiceList.length).toBe(2);
            expect(secondServiceList).toContainEqual(expect.objectContaining({ description: 'long haircut' }));
            expect(secondServiceList).toContainEqual(expect.objectContaining({ description: 'long styled haircut' }));
        });

        test('GET "/services?serviceTypeId=:serviceId&barbershopId=:shopId" - mixes both filters', async () => {
            const firstResponse = await request(expressApp)
                .get(`/services?serviceTypeId=${availableServiceType.id}&barbershopId=${registeredBarbershop.id}`);

            expect(firstResponse.status).toBe(200);
            const { serviceList: firstServiceList } = firstResponse.body;

            expect(Array.isArray(firstServiceList)).toBeTruthy();
            expect(firstServiceList.length).toBe(1);
            expect(firstServiceList).toContainEqual(expect.objectContaining({ description: 'short haircut' }));


            const secondResponse = await request(expressApp)
                .get(`/services?serviceTypeId=${availableServiceType.id}&barbershopId=${anotherRegisteredBarbershop.id}`);

            expect(firstResponse.status).toBe(200);
            const { serviceList: secondServiceList } = secondResponse.body;

            expect(Array.isArray(secondServiceList)).toBeTruthy();
            expect(secondServiceList.length).toBe(1);
            expect(secondServiceList).toContainEqual(expect.objectContaining({ description: 'short styled haircut' }));


            const thirdResponse = await request(expressApp)
                .get(`/services?serviceTypeId=${anotherAvailableServiceType.id}&barbershopId=${registeredBarbershop.id}`);

            expect(thirdResponse.status).toBe(200);
            const { serviceList: thirdServiceList } = thirdResponse.body;

            expect(Array.isArray(thirdServiceList)).toBeTruthy();
            expect(thirdServiceList.length).toBe(1);
            expect(thirdServiceList).toContainEqual(expect.objectContaining({ description: 'long haircut' }));


            const forthResponse = await request(expressApp)
                .get(`/services?serviceTypeId=${anotherAvailableServiceType.id}&barbershopId=${anotherRegisteredBarbershop.id}`);

            expect(forthResponse.status).toBe(200);
            const { serviceList: forthServiceList } = forthResponse.body;

            expect(Array.isArray(forthServiceList)).toBeTruthy();
            expect(forthServiceList.length).toBe(1);
            expect(forthServiceList).toContainEqual(expect.objectContaining({ description: 'long styled haircut' }));
        });

        test('GET "/services?priceMin=:value" - mixes both filters', async () => {
            const firstResponse = await request(expressApp)
                .get(`/services?priceMin=${5000}`);

            expect(firstResponse.status).toBe(200);
            const { serviceList: firstServiceList } = firstResponse.body;

            expect(Array.isArray(firstServiceList)).toBeTruthy();
            expect(firstServiceList.length).toBe(3);
            expect(firstServiceList).toContainEqual(expect.objectContaining({ description: 'long haircut' }));
            expect(firstServiceList).toContainEqual(expect.objectContaining({ description: 'short styled haircut' }));
            expect(firstServiceList).toContainEqual(expect.objectContaining({ description: 'long styled haircut' }));

            const secondResponse = await request(expressApp)
                .get(`/services?priceMin=${5000}&priceMax=${6000}`);

            expect(secondResponse.status).toBe(200);
            const { serviceList: secondServiceList } = secondResponse.body;

            expect(Array.isArray(secondServiceList)).toBeTruthy();
            expect(secondServiceList.length).toBe(2);
            expect(secondServiceList).toContainEqual(expect.objectContaining({ description: 'long haircut' }));
            expect(secondServiceList).toContainEqual(expect.objectContaining({ description: 'short styled haircut' }));
        });
    });
});
