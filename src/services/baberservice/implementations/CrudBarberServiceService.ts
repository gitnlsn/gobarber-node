import { inject, injectable } from 'tsyringe';
import {
    FindConditions,
    Between,
    MoreThanOrEqual,
    LessThanOrEqual,
} from 'typeorm';
import BarberServicesRepository from '../../../database/repositories/BarberServiceRepository';
import {
    CrudBarberServiceInterface,
    CreateBarberServiceInput,
    CreateBarberServiceOutput,
    UpdateBarberServiceInput,
    UpdateBarberServiceOutput,
    DeleteBarberServiceInput,
    DeleteBarberServiceOutput,
    RetrieveBarberServiceOutput,
    RetrieveAllBarberServiceInput,
    RetrieveAllBarberServiceOutput,
} from '../interfaces/CrudBarberService';
import AppError from '../../../errors/AppError';
import BarbershopService from '../../../database/models/BarbershopService';

@injectable()
class CrudBarberServiceService implements CrudBarberServiceInterface {
    constructor(
        @inject('BarberServicesRepository') private serviceRepo: BarberServicesRepository,
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

    async retrieve(
        conditions?: FindConditions<BarbershopService>,
    ): Promise<RetrieveBarberServiceOutput> {
        const existingService = await this.serviceRepo.findOne(
            conditions,
            { relations: ['provider', 'type'] },
        );
        return { service: existingService };
    }

    async retrieveAll({
        provider,
        type,
        price,
    }: RetrieveAllBarberServiceInput): Promise<RetrieveAllBarberServiceOutput> {
        const findOptions = {} as FindConditions<BarbershopService>;

        if (provider) findOptions.provider = provider;
        if (type) findOptions.type = type;
        if (price) {
            if (price.ge && price.le) {
                findOptions.price = Between(price.ge, price.le);
            } else if (price.ge) {
                findOptions.price = MoreThanOrEqual(price.ge);
            } else if (price.le) {
                findOptions.price = LessThanOrEqual(price.le);
            }
        }

        const serviceList = await this.serviceRepo.find({
            where: { ...findOptions },
            relations: ['provider', 'type'],
        });
        return { serviceList };
    }
}

export default CrudBarberServiceService;
