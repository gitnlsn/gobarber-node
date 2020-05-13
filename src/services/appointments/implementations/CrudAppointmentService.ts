import { inject, injectable } from 'tsyringe';
import { FindConditions } from 'typeorm';
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
}

export default CrudAppointmentService;
