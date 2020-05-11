import Barbershop from '../../../database/models/Barbershop';

export interface DisableBarbershopInput {
    id: string;
}

export interface DisableBarbershopOutput {
    barbershop: Barbershop;
}

export interface DisableBarbershopInterface {
    disable(disableProps: DisableBarbershopInput): Promise<DisableBarbershopOutput>;
}
