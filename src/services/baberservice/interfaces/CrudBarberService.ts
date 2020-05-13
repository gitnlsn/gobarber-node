import BarbershopService from '../../../database/models/BarbershopService';
import ServiceType from '../../../database/models/ServiceType';
import Barbershop from '../../../database/models/Barbershop';

export interface CreateBarberServiceInput {
    type: ServiceType;
    provider: Barbershop;
    price: number;
    description?: string;
    logo?: string;
}

export interface UpdateBarberServiceInput {
    id: string;
    serviceType?: ServiceType;
    description?: string;
    price?: number;
    logo?: string;
}

export interface DeleteBarberServiceInput {
    id: string;
}

export interface RetrieveBarberServiceInput {
    id: string;
}

export interface RetrieveAllBarberServiceInput {
    type: ServiceType;
    provider: Barbershop;
    price?: [{ /* TODO: FILTER */
        comparison: 'ge' | 'le';
        value: number;
    }];
}

export interface CreateBarberServiceOutput {
    service: BarbershopService;
}

export interface UpdateBarberServiceOutput {
    service: BarbershopService;
}

export interface DeleteBarberServiceOutput {
    service: BarbershopService;
}

export interface RetrieveBarberServiceOutput {
    service: BarbershopService | undefined;
}

export interface RetrieveAllBarberServiceOutput {
    serviceList: BarbershopService[];
}

export interface CrudBarberServiceInterface {
    create(createProps: CreateBarberServiceInput): Promise<CreateBarberServiceOutput>;
    update(updateProps: UpdateBarberServiceInput): Promise<UpdateBarberServiceOutput>;
    delete(deleteProps: DeleteBarberServiceInput): Promise<DeleteBarberServiceOutput>;
    retrieve(retrieveProps: RetrieveBarberServiceInput): Promise<RetrieveBarberServiceOutput>;
    retrieveAll(
        retrieveProps?: RetrieveAllBarberServiceInput
    ): Promise<RetrieveAllBarberServiceOutput>;
}
