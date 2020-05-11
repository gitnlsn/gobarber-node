import Appointment from '../../../database/models/Appointment';

export interface EnableAppointmentInput {
    id: string;
}

export interface EnableAppointmentOutput {
    appointment: Appointment;
}

export interface EnableAppointmentInterface {
    enable(enableProps: EnableAppointmentInput): Promise<EnableAppointmentOutput>;
}
