import { inject, injectable } from 'tsyringe';
import {
    FindConditions,
    Not,
    IsNull,
    MoreThanOrEqual,
    LessThanOrEqual,
    FindManyOptions,
    In,
} from 'typeorm';

import AppointmentsRepository from '../../../database/repositories/AppointmentsRepository';
import AppError from '../../../errors/AppError';
import {
    CreateAppointmentInterface,
    CreateAppointmentInput,
    CreateAppointmentOutput,
} from '../interfaces/CreateAppointment';
import {
    UpdateAppointmentInterface,
    UpdateAppointmentInput,
    UpdateAppointmentOutput,
} from '../interfaces/UpdateAppointment';
import {
    DeleteAppointmentInterface,
    DeleteAppointmentInput,
    DeleteAppointmentOutput,
} from '../interfaces/DeleteAppointment';
import {
    RetrieveAppointmentInterface,
    RetrieveAppointmentInput,
    RetrieveAppointmentOutput,
    RetrieveAllAppointmentInput,
    RetrieveAllAppointmentOutput,
} from '../interfaces/RetrieveAppointment';
import Appointment from '../../../database/models/Appointment';
import BarberServicesRepository from '../../../database/repositories/BarberServiceRepository';
import BarbershopService from '../../../database/models/BarbershopService';
import Barbershop from '../../../database/models/Barbershop';
import ServiceType from '../../../database/models/ServiceType';

@injectable()
class CrudAppointmentService
implements
    CreateAppointmentInterface,
    UpdateAppointmentInterface,
    DeleteAppointmentInterface,
    RetrieveAppointmentInterface {
    constructor(
        @inject('AppointmentsRepository') private appointmentRepo: AppointmentsRepository,
        @inject('BarberServicesRepository') private barberserviceRepo: BarberServicesRepository,
    ) { }

    async create(createProps: CreateAppointmentInput): Promise<CreateAppointmentOutput> {
        const newAppointment = this.appointmentRepo.create();
        const savedAppointment = await this.appointmentRepo.save({
            ...newAppointment,
            ...createProps,
        });

        return { appointment: savedAppointment };
    }

    async update({
        id,
        ...appointmentProps
    }: UpdateAppointmentInput): Promise<UpdateAppointmentOutput> {
        const existingAppointment = await this.appointmentRepo.findOne(
            { id },
            { relations: ['messages', 'client', 'service', 'service.provider', 'service.type'] },
        );

        if (!existingAppointment) {
            throw new AppError('Barbershop with specified id does not exists');
        }

        const updatedApopintment = await this.appointmentRepo.save({
            ...existingAppointment,
            ...appointmentProps,
        });
        return { appointment: updatedApopintment };
    }

    async delete({ id }: DeleteAppointmentInput): Promise<DeleteAppointmentOutput> {
        const existingApopintment = await this.appointmentRepo.findOne(
            { id },
            { relations: ['messages', 'client', 'service', 'service.provider', 'service.type'] },
        );

        if (!existingApopintment) {
            throw new AppError('Barbershop with specified id does not exists');
        }

        const updatedApopintment = await this.appointmentRepo.delete(existingApopintment);
        return { appointment: updatedApopintment };
    }

    async retrieve(conditions?: FindConditions<Appointment>): Promise<RetrieveAppointmentOutput> {
        const existingAppointment = await this.appointmentRepo.findOne(
            conditions,
            { relations: ['messages', 'client', 'service', 'service.provider', 'service.type'] },
        );
        return { appointment: existingAppointment };
    }

    async retrieveAll({
        available,
        serviceList,
        period,
    }: RetrieveAllAppointmentInput): Promise<RetrieveAllAppointmentOutput> {
        const options = {} as FindManyOptions<Appointment>;
        options.relations = ['messages', 'client', 'service', 'service.provider', 'service.type'];
        options.where = {};

        switch (available) {
        case true:
            options.where.client = IsNull();
            break;
        case false:
            options.where.client = Not(IsNull());
            break;
        case 'all':
        default:
        }

        if (period) {
            options.where.startsAt = MoreThanOrEqual(period.min);
            options.where.endsAt = LessThanOrEqual(period.max);
        }

        if (serviceList && serviceList.length > 0) {
            options.where.service = In(serviceList.map((service) => service.id));
        }

        if (!Object.keys(options.where).length) {
            delete options.where;
        }

        const retrievedAppointmentList = await this.appointmentRepo.find(options);
        return { appointmentList: retrievedAppointmentList };
    }
}

export default CrudAppointmentService;
