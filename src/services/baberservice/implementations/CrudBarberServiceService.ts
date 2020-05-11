import { inject, singleton } from 'tsyringe';
import BarberServicesRepository from '../../../database/repositories/BarberServiceRepository';
import {
    CrudBarberServiceInterface,
    CreateBarberServiceInput,
    CreateBarberServiceOutput,
    UpdateBarberServiceInput,
    UpdateBarberServiceOutput,
    DeleteBarberServiceInput,
    DeleteBarberServiceOutput,
    RetrieveBarberServiceInput,
    RetrieveBarberServiceOutput,
} from '../interfaces/CrudBarberService';
import AppError from '../../../errors/AppError';

@singleton()
class CrudBarberServiceService implements CrudBarberServiceInterface {
    constructor(
        @inject(BarberServicesRepository) private serviceRepo: BarberServicesRepository,
    ) { }

    async create(createProps: CreateBarberServiceInput): Promise<CreateBarberServiceOutput> {
        const newService = this.serviceRepo.create();
        const savedService = await this.serviceRepo.save({
            ...newService,
            ...createProps,
        });

        return { service: savedService };
    }

    async update({
        id,
        ...serviceProps
    }: UpdateBarberServiceInput): Promise<UpdateBarberServiceOutput> {
        const existingBarbershop = await this.serviceRepo.findOne({ id });

        if (!existingBarbershop) {
            throw new AppError('Barbershop with specified id does not exists');
        }

        const updatedService = await this.serviceRepo.save({
            ...existingBarbershop,
            ...serviceProps,
        });
        return { service: updatedService };
    }

    async delete({ id }: DeleteBarberServiceInput): Promise<DeleteBarberServiceOutput> {
        const existingService = await this.serviceRepo.findOne({ id });

        if (!existingService) {
            throw new AppError('Barbershop with specified id does not exists');
        }

        const updatedService = await this.serviceRepo.delete(existingService);
        return { service: updatedService };
    }

    async retrieve({ id }: RetrieveBarberServiceInput): Promise<RetrieveBarberServiceOutput> {
        const existingService = await this.serviceRepo.findOne({ id });
        return { service: existingService };
    }
}

export default CrudBarberServiceService;
