import Appointment from '../../../database/models/Appointment';

export interface RetrieveAppointmentInput {
    id: string;
}

export interface RetrieveAppointmentOutput {
    appointment: Appointment | undefined;
}

export interface RetrieveAllAppointmentInput {
    available: boolean;
    providerId?: string;
    serviceTypeId?: string;
    serviceId?: string;
    period?: {
        min: Date;
        max: Date;
    };
}

export interface RetrieveAllAppointmentOutput {
    appointmentList: Appointment[];
}

export interface RetrieveAppointmentInterface {
    retrieve(retrieveProps: RetrieveAppointmentInput): Promise<RetrieveAppointmentOutput>;
    retrieveAll(retrieveProps: RetrieveAllAppointmentInput): Promise<RetrieveAllAppointmentOutput>;
}
