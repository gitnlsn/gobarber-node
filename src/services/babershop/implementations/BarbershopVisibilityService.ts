import { inject, injectable } from 'tsyringe';
import BarbershopsRepository from '../../../database/repositories/BarbershopsRepository';
import AppError from '../../../errors/AppError';

import {
    EnableBarbershopInterface,
    EnableBarbershopInput,
    EnableBarbershopOutput,
} from '../interfaces/EnableBarbershop';

import {
    DisableBarbershopInterface,
    DisableBarbershopInput,
    DisableBarbershopOutput,
} from '../interfaces/DisableBarbershop';

@injectable()
class BarbershopVisibilityService
implements EnableBarbershopInterface, DisableBarbershopInterface {
    constructor(
        @inject('BarbershopsRepository') private shopRepo: BarbershopsRepository,
    ) { }

    async enable({ id }: EnableBarbershopInput): Promise<EnableBarbershopOutput> {
        const existingBarbershop = await this.shopRepo.findOne({ id });

        if (!existingBarbershop) {
            throw new AppError('Barbershop with specified id does not exists');
        }

        const updatedShop = await this.shopRepo.enable(existingBarbershop);
        return { barbershop: updatedShop };
    }

    async disable({ id }: DisableBarbershopInput): Promise<DisableBarbershopOutput> {
        const existingBarbershop = await this.shopRepo.findOne({ id });

        if (!existingBarbershop) {
            throw new AppError('Barbershop with specified id does not exists');
        }

        const updatedShop = await this.shopRepo.disable(existingBarbershop);
        return { barbershop: updatedShop };
    }
}

export default BarbershopVisibilityService;
