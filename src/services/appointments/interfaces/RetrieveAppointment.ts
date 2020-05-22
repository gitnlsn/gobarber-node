import Appointment from '../../../database/models/Appointment';
import ServiceType from '../../../database/models/ServiceType';
import Barbershop from '../../../database/models/Barbershop';
import BarbershopService from '../../../database/models/BarbershopService';

export interface RetrieveAppointmentInput {
    id: string;
}

export interface RetrieveAppointmentOutput {
    appointment: Appointment | undefined;
}

export interface RetrieveAllAppointmentInput {
    available: 'all' | true | false;
    serviceList?: BarbershopService[];
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
