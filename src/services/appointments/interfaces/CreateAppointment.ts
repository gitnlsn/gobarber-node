import BarbershopService from '../../../database/models/BarbershopService';
import Appointment from '../../../database/models/Appointment';

export interface CreateAppointmentInput {
    service: BarbershopService;
    observations?: string; /* may be null */
    startsAt: Date;
    endsAt: Date;
}

export interface CreateAppointmentOutput {
    appointment: Appointment;
}

export interface CreateAppointmentInterface {
    create(createProps: CreateAppointmentInput): Promise<CreateAppointmentOutput>;
}
