import BarbershopService from '../../../database/models/BarbershopService';

export interface EnableBarberServiceInput {
    id: string;
}

export interface EnableBarberServiceOutput {
    service: BarbershopService;
}

export interface EnableBarberServiceInterface {
    enable(enableProps: EnableBarberServiceInput): Promise<EnableBarberServiceOutput>;
}
