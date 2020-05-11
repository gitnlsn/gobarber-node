import Appointment from '../../../database/models/Appointment';

export interface RetrieveAppointmentInput {
    id: string;
}

export interface RetrieveAppointmentOutput {
    appointment: Appointment | undefined;
}

export interface RetrieveAppointmentInterface {
    retrieve(retrieveProps: RetrieveAppointmentInput): Promise<RetrieveAppointmentOutput>;
}
