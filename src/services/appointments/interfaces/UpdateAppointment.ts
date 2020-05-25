import Appointment from '../../../database/models/Appointment';
import User from '../../../database/models/User';

export interface UpdateAppointmentInput {
    id: string;
    observations?: string; /* may be null */
    startsAt?: Date;
    endsAt?: Date;
    client?: User;
}

export interface UpdateAppointmentOutput {
    appointment: Appointment;
}

export interface UpdateAppointmentInterface {
    update(updateProps: UpdateAppointmentInput): Promise<UpdateAppointmentOutput>;
}
