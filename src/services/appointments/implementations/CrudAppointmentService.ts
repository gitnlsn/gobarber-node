import { inject, injectable } from 'tsyringe';
import {
    FindConditions,
    Not,
    IsNull,
    MoreThan,
    LessThan,
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

@injectable()
class CrudAppointmentService
implements
    CreateAppointmentInterface,
    UpdateAppointmentInterface,
    DeleteAppointmentInterface,
    RetrieveAppointmentInterface {
    constructor(
        @inject('AppointmentsRepository') private appointmentRepo: AppointmentsRepository,
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
        const existingAppointment = await this.appointmentRepo.findOne({ id });

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
        const existingApopintment = await this.appointmentRepo.findOne({ id });

        if (!existingApopintment) {
            throw new AppError('Barbershop with specified id does not exists');
        }

        const updatedApopintment = await this.appointmentRepo.delete(existingApopintment);
        return { appointment: updatedApopintment };
    }

    async retrieve(conditions?: FindConditions<Appointment>): Promise<RetrieveAppointmentOutput> {
        const existingAppointment = await this.appointmentRepo.findOne(
            conditions,
            { relations: ['messages', 'service', 'client'] },
        );
        return { appointment: existingAppointment };
    }

    async retrieveAll({
        available,
        serviceId,
        providerId,
        serviceTypeId,
        period,
    }: RetrieveAllAppointmentInput): Promise<RetrieveAllAppointmentOutput> {
        if (serviceId) {
            const appointmentList = await this.appointmentRepo.find({
                where: {
                    service: { id: serviceId },
                    client: available ? Not(IsNull()) : IsNull(),
                    startsAt: MoreThan(period?.min),
                    endsAt: LessThan(period?.max),
                },
                relations: ['client', 'service', 'service.provider', 'service.type'],
            });
            return { appointmentList };
        }

        if (providerId || serviceTypeId) {
            const appointmentList = await this.appointmentRepo.find({
                where: {
                    service: {
                        provider: providerId ? { id: providerId } : null,
                        type: serviceId ? { id: serviceTypeId } : null,
                    },
                    client: available ? Not(IsNull()) : IsNull(),
                    startsAt: MoreThan(period?.min),
                    endsAt: LessThan(period?.max),
                },
                relations: ['client', 'service', 'service.provider', 'service.type'],
            });
            return { appointmentList };
        }

        return { appointmentList: [] };
    }
}

export default CrudAppointmentService;
