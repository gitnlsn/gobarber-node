import { inject, injectable } from 'tsyringe';
import { Repository } from 'typeorm';
import {
    CrudServiceTypeInterface,
    CreateServiceTypeOutput,
    CreateServiceTypeInput,
    UpdateServiceTypeInput,
    UpdateServiceTypeOutput,
    DeleteServiceTypeOutput,
    DeleteServiceTypeInput,
    RetrieveServiceTypeInput,
    RetrieveServiceTypeOutput,
} from '../interfaces/CrudServiceType';
import AppError from '../../../errors/AppError';
import ServiceType from '../../../database/models/ServiceType';

@injectable()
class CrudServiceTypeService implements CrudServiceTypeInterface {
    constructor(
        @inject('ServiceTypeRepository') private serviceTypeRepo: Repository<ServiceType>,
    ) { }

    async create(createProps: CreateServiceTypeInput): Promise<CreateServiceTypeOutput> {
        const newServiceType = this.serviceTypeRepo.create();
        const savedServiceType = await this.serviceTypeRepo.save({
            ...newServiceType,
            ...createProps,
        });
        return { serviceType: savedServiceType };
    }

    async update({
        id,
        ...props
    }: UpdateServiceTypeInput): Promise<UpdateServiceTypeOutput> {
        const existingServiceType = await this.serviceTypeRepo.findOne({ id });

        if (!existingServiceType) {
            throw new AppError('Barbershop with specified id does not exists');
        }

        const updatedServiceType = await this.serviceTypeRepo.save({
            ...existingServiceType,
            ...props,
        });
        return { serviceType: updatedServiceType };
    }

    async delete({ id }: DeleteServiceTypeInput): Promise<DeleteServiceTypeOutput> {
        const existingServiceType = await this.serviceTypeRepo.findOne({ id });

        if (!existingServiceType) {
            throw new AppError('Barbershop with specified id does not exists');
        }

        await this.serviceTypeRepo.delete(existingServiceType);
        return { serviceType: existingServiceType };
    }

    async retrieve({ id }: RetrieveServiceTypeInput): Promise<RetrieveServiceTypeOutput> {
        const existingServiceType = await this.serviceTypeRepo.findOne({ id });
        return { serviceType: existingServiceType };
    }
}

export default CrudServiceTypeService;
