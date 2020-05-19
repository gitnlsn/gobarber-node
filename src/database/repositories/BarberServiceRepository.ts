/*
    eslint-disable
        no-param-reassign,
        @typescript-eslint/no-explicit-any,
*/

import {
    EntityRepository,
    In,
    AbstractRepository,
    FindOneOptions,
    FindConditions,
    FindManyOptions,
    SaveOptions,
} from 'typeorm';

import BarbershopService from '../models/BarbershopService';

@EntityRepository(BarbershopService)
class BarberServicesRepository extends AbstractRepository<BarbershopService> {
    /**
     * Creates a new entity instance.
     */
    create(): BarbershopService { return this.repository.create(); }

    /**
     * Finds entities that match given conditions.
     */
    async find(
        options?:
            FindConditions<BarbershopService>
            | FindManyOptions<BarbershopService>
            | undefined,
    ): Promise<BarbershopService[]> {
        return this.repository.find({
            ...options,
            where: { status: In(['enabled', 'disabled']) },
        });
    }

    /**
     * Finds first entity that matches given conditions.
     */
    async findOne(
        conditions?: FindConditions<BarbershopService> | undefined,
        options?: FindOneOptions<BarbershopService> | undefined,
    ): Promise<BarbershopService | undefined> {
        if (!conditions) {
            return undefined;
        }
        return this.repository.findOne({
            ...conditions,
            status: In(['enabled', 'disabled']),
        }, options);
    }

    /**
     * Saves a given entity in the database.
     * If entity does not exist in the database then inserts, otherwise updates.
     */
    public async save(
        service: BarbershopService,
        options?: SaveOptions,
    ): Promise<BarbershopService> {
        /* user must provide service id for save to behave as update */
        if (service.id) {
            const existingService = await this.repository.findOne({
                where: {
                    id: service.id,
                    status: In(['enabled', 'disabled']),
                },
            });

            if (!existingService) {
                throw Error(`Service id ${service.id} was provided, but no existing service was found in database`);
            }

            return this.repository.save({
                ...existingService,
                ...service,
            } as BarbershopService, options);
        }
        return this.repository.save(service, options);
    }

    async enable(service: BarbershopService): Promise<BarbershopService> {
        service.status = 'enabled';
        return this.repository.save(service);
    }

    async disable(service: BarbershopService): Promise<BarbershopService> {
        service.status = 'disabled';
        return this.repository.save(service);
    }

    async delete(service: BarbershopService): Promise<BarbershopService> {
        service.status = 'deleted';
        return this.repository.save(service);
    }
}

export default BarberServicesRepository;
