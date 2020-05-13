import { inject, injectable } from 'tsyringe';
import { FindConditions } from 'typeorm';
import BarbershopsRepository from '../../../database/repositories/BarbershopsRepository';
import {
    CrudBarbershopInterface,
    CreateBarbershopOutput,
    CreateBarbershopInput,
    UpdateBarbershopInput,
    UpdateBarbershopOutput,
    DeleteBarbershopOutput,
    DeleteBarbershopInput,
    RetrieveBarbershopInput,
    RetrieveBarbershopOutput,
    RetrieveAllBarbershopOutput,
    RetrieveAllBarbershopInput,
} from '../interfaces/CrudBarbershop';
import AppError from '../../../errors/AppError';
import Barbershop from '../../../database/models/Barbershop';

@injectable()
class CrudBarbershopService implements CrudBarbershopInterface {
    constructor(
        @inject('BarbershopsRepository') private shopRepo: BarbershopsRepository,
    ) {}

    async create(createProps: CreateBarbershopInput): Promise<CreateBarbershopOutput> {
        const newShop = this.shopRepo.create();
        const savedShop = await this.shopRepo.save({
            ...newShop,
            ...createProps,
        });
        return { barbershop: savedShop };
    }

    async update({
        id,
        ...props
    }: UpdateBarbershopInput): Promise<UpdateBarbershopOutput> {
        const existingBarbershop = await this.shopRepo.findOne({ id });

        if (!existingBarbershop) {
            throw new AppError('Barbershop with specified id does not exists');
        }

        const updatedShop = await this.shopRepo.save({
            ...existingBarbershop,
            ...props,
        });
        return { barbershop: updatedShop };
    }

    async delete({ id }: DeleteBarbershopInput): Promise<DeleteBarbershopOutput> {
        const existingBarbershop = await this.shopRepo.findOne({ id });

        if (!existingBarbershop) {
            throw new AppError('Barbershop with specified id does not exists');
        }

        const updatedShop = await this.shopRepo.delete(existingBarbershop);
        return { barbershop: updatedShop };
    }

    async retrieve(conditions?: FindConditions<Barbershop>): Promise<RetrieveBarbershopOutput> {
        const existingBarbershop = await this.shopRepo.findOne(
            conditions,
            { relations: ['owner', 'services'] },
        );
        return { barbershop: existingBarbershop };
    }

    async retrieveAll(props?: RetrieveAllBarbershopInput): Promise<RetrieveAllBarbershopOutput> {
        const barberShopList = await this.shopRepo.find({
            relations: ['owner', 'services'],
        });
        return { barbershopList: barberShopList };
    }
}

export default CrudBarbershopService;
