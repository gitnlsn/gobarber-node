import { inject } from 'tsyringe';
import BarberServicesRepository from '../../../database/repositories/BarberServiceRepository';
import AppError from '../../../errors/AppError';

import {
    EnableBarberServiceInterface,
    EnableBarberServiceInput,
    EnableBarberServiceOutput,
} from '../interfaces/EnableBarberService';

import {
    DisableBarberServiceInterface,
    DisableBarberServiceInput,
    DisableBarberServiceOutput,
} from '../interfaces/DisableBarberService';

class BarberServiceVisibilityService
implements EnableBarberServiceInterface, DisableBarberServiceInterface {
    constructor(
        @inject(BarberServicesRepository) private shopRepo: BarberServicesRepository,
    ) { }

    async enable({ id }: EnableBarberServiceInput): Promise<EnableBarberServiceOutput> {
        const existingService = await this.shopRepo.findOne({ id });

        if (!existingService) {
            throw new AppError('BarberService with specified id does not exists');
        }

        const updatedService = await this.shopRepo.enable(existingService);
        return { service: updatedService };
    }

    async disable({ id }: DisableBarberServiceInput): Promise<DisableBarberServiceOutput> {
        const existingService = await this.shopRepo.findOne({ id });

        if (!existingService) {
            throw new AppError('BarberService with specified id does not exists');
        }

        const updatedService = await this.shopRepo.disable(existingService);
        return { service: updatedService };
    }
}

export default BarberServiceVisibilityService;
