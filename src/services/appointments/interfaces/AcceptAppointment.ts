import Appointment from '../../../database/models/Appointment';
import User from '../../../database/models/User';

export interface AcceptAppointmentInput {
    id: string;
    user: User;
    observations?: string;
}

export interface AcceptAppointmentOutput {
    appointment: Appointment;
}

export interface AcceptAppointmentInterface {
    execute(acceptProps: AcceptAppointmentInput): Promise<AcceptAppointmentOutput>;
}
