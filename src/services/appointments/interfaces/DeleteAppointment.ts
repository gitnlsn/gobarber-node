import Appointment from '../../../database/models/Appointment';

export interface DeleteAppointmentInput {
    id: string;
}

export interface DeleteAppointmentOutput {
    appointment: Appointment;
}

export interface DeleteAppointmentInterface {
    delete(deleleProps: DeleteAppointmentInput): Promise<DeleteAppointmentOutput>;
}
