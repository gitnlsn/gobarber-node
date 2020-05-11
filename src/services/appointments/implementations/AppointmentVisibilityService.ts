import { inject } from 'tsyringe';
import AppointmentsRepository from '../../../database/repositories/AppointmentsRepository';
import AppError from '../../../errors/AppError';

import {
    EnableAppointmentInterface,
    EnableAppointmentInput,
    EnableAppointmentOutput,
} from '../interfaces/EnableAppointment';

import {
    DisableAppointmentInterface,
    DisableAppointmentInput,
    DisableAppointmentOutput,
} from '../interfaces/DisableAppointment';

class AppointmentsVisibilityService
implements EnableAppointmentInterface, DisableAppointmentInterface {
    constructor(
        @inject(AppointmentsRepository) private shopRepo: AppointmentsRepository,
    ) { }

    async enable({ id }: EnableAppointmentInput): Promise<EnableAppointmentOutput> {
        const existingAppointment = await this.shopRepo.findOne({ id });

        if (!existingAppointment) {
            throw new AppError('Appointment with specified id does not exists');
        }

        const updatedAppointment = await this.shopRepo.enable(existingAppointment);
        return { appointment: updatedAppointment };
    }

    async disable({ id }: DisableAppointmentInput): Promise<DisableAppointmentOutput> {
        const existingAppointment = await this.shopRepo.findOne({ id });

        if (!existingAppointment) {
            throw new AppError('Appointment with specified id does not exists');
        }

        const updatedAppointment = await this.shopRepo.disable(existingAppointment);
        return { appointment: updatedAppointment };
    }
}

export default AppointmentsVisibilityService;
