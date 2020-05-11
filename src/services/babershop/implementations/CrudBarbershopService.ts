import { inject, singleton } from 'tsyringe';
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
} from '../interfaces/CrudBarbershop';
import AppError from '../../../errors/AppError';

@singleton()
class CRUDBarbershopService implements CrudBarbershopInterface {
    constructor(
        @inject(BarbershopsRepository) private shopRepo: BarbershopsRepository,
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

    async retrieve({ id }: RetrieveBarbershopInput): Promise<RetrieveBarbershopOutput> {
        const existingBarbershop = await this.shopRepo.findOne({ id });
        return { barbershop: existingBarbershop };
    }
}

export default CRUDBarbershopService;
