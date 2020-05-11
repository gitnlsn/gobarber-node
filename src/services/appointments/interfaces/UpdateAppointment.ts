import Appointment from '../../../database/models/Appointment';

export interface UpdateAppointmentInput {
    id: string;
    title?: string; /* may be copied from serviceType name */
    observations?: string; /* may be null */
    startsAt?: Date;
    endsAt?: Date;
}

export interface UpdateAppointmentOutput {
    appointment: Appointment;
}

export interface UpdateAppointmentInterface {
    update(updateProps: UpdateAppointmentInput): Promise<UpdateAppointmentOutput>;
}