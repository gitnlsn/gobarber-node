import Appointment from '../../../database/models/Appointment';

export interface DisableAppointmentInput {
    id: string;
}

export interface DisableAppointmentOutput {
    appointment: Appointment;
}

export interface DisableAppointmentInterface {
    disable(disableProps: DisableAppointmentInput): Promise<DisableAppointmentOutput>;
}
