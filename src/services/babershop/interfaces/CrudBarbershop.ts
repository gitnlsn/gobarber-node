import Barbershop from '../../../database/models/Barbershop';
import User from '../../../database/models/User';

export interface CreateBarbershopInput {
    owner: User;
    name: string;
    address: string;
    slogan?: string;
    description?: string;
}

export interface UpdateBarbershopInput {
    id: string;
    name?: string;
    slogan?: string;
    description?: string;
    address?: string;
}

export interface DeleteBarbershopInput {
    id: string;
}

export interface RetrieveBarbershopInput {
    id: string;
}

export interface CreateBarbershopOutput {
    barbershop: Barbershop;
}

export interface UpdateBarbershopOutput {
    barbershop: Barbershop;
}

export interface DeleteBarbershopOutput {
    barbershop: Barbershop;
}

export interface RetrieveBarbershopOutput {
    barbershop: Barbershop | undefined;
}

export interface CrudBarbershopInterface {
    create(createProps: CreateBarbershopInput): Promise<CreateBarbershopOutput>;
    update(updateProps: UpdateBarbershopInput): Promise<UpdateBarbershopOutput>;
    delete(deleteProps: DeleteBarbershopInput): Promise<DeleteBarbershopOutput>;
    retrieve(retrieveProps: RetrieveBarbershopInput): Promise<RetrieveBarbershopOutput>;
}
