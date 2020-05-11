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

import Barbershop from '../models/Barbershop';

@EntityRepository(Barbershop)
class BarbershopsRepository extends AbstractRepository<Barbershop> {
    /**
     * Creates a new entity instance.
     */
    create(): Barbershop { return this.repository.create(); }

    /**
     * Finds entities that match given conditions.
     */
    async find(
        options?: FindConditions<Barbershop> | FindManyOptions<Barbershop> | undefined,
    ): Promise<Barbershop[]> {
        return this.repository.find({
            ...options,
            where: { status: In(['enabled', 'disabled']) },
        });
    }

    /**
     * Finds first entity that matches given conditions.
     */
    async findOne(
        conditions?: FindConditions<Barbershop> | undefined,
        options?: FindOneOptions<Barbershop> | undefined,
    ): Promise<Barbershop | undefined> {
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
        barbershop: Barbershop,
        options?: SaveOptions,
    ): Promise<Barbershop> {
        const existingBarbershop = await this.repository.findOne({
            where: {
                owner: { id: barbershop.owner.id },
                status: In(['enabled', 'disabled']),
            },
        });

        if (existingBarbershop) {
            return this.repository.save({
                ...existingBarbershop,
                ...barbershop,
            } as Barbershop, options);
        }
        return this.repository.save(barbershop, options);
    }

    async enable(barbershop: Barbershop): Promise<Barbershop> {
        barbershop.status = 'enabled';
        return this.repository.save(barbershop);
    }

    async disable(barbershop: Barbershop): Promise<Barbershop> {
        barbershop.status = 'disabled';
        return this.repository.save(barbershop);
    }

    async delete(barbershop: Barbershop): Promise<Barbershop> {
        barbershop.status = 'deleted';
        return this.repository.save(barbershop);
    }
}

export default BarbershopsRepository;
