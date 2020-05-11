import BarbershopService from '../../../database/models/BarbershopService';

export interface DisableBarberServiceInput {
    id: string;
}

export interface DisableBarberServiceOutput {
    service: BarbershopService;
}

export interface DisableBarberServiceInterface {
    disable(disableProps: DisableBarberServiceInput): Promise<DisableBarberServiceOutput>;
}
