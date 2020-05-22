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

import Appointment from '../models/Appointment';

@EntityRepository(Appointment)
class AppointmentsRepository extends AbstractRepository<Appointment> {
    /**
     * Creates a new entity instance.
     */
    create(): Appointment { return this.repository.create(); }

    /**
     * Finds entities that match given conditions.
     */
    async find(
        options?: FindManyOptions<Appointment>,
    ): Promise<Appointment[]> {
        return this.repository.find({
            ...options,
            where: {
                ...options?.where as FindConditions<Appointment>,
                status: In(['enabled', 'disabled']),
            },
        });
    }

    /**
     * Finds first entity that matches given conditions.
     */
    async findOne(
        conditions?: FindConditions<Appointment> | undefined,
        options?: FindOneOptions<Appointment> | undefined,
    ): Promise<Appointment | undefined> {
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
        appointment: Appointment,
        options?: SaveOptions,
    ): Promise<Appointment> {
        /* user must provide service id for save to behave as update */
        if (appointment.id) {
            const existingAppointment = await this.repository.findOne({
                where: {
                    id: appointment.id,
                    status: In(['enabled', 'disabled']),
                },
            });

            if (!existingAppointment) {
                throw Error(`Appointment ${appointment.id} was provided, but no appointment was found in database`);
            }

            return this.repository.save({
                ...existingAppointment,
                ...appointment,
            } as Appointment, options);
        }
        return this.repository.save(appointment, options);
    }

    async enable(appointment: Appointment): Promise<Appointment> {
        appointment.status = 'enabled';
        return this.repository.save(appointment);
    }

    async disable(appointment: Appointment): Promise<Appointment> {
        appointment.status = 'disabled';
        return this.repository.save(appointment);
    }

    async delete(appointment: Appointment): Promise<Appointment> {
        appointment.status = 'deleted';
        return this.repository.save(appointment);
    }
}

export default AppointmentsRepository;
