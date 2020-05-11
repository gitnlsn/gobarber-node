import Barbershop from '../../../database/models/Barbershop';

export interface EnableBarbershopInput {
    id: string;
}

export interface EnableBarbershopOutput {
    barbershop: Barbershop;
}

export interface EnableBarbershopInterface {
    enable(enableProps: EnableBarbershopInput): Promise<EnableBarbershopOutput>;
}
