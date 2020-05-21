import ServiceType from '../../../database/models/ServiceType';

export interface CreateServiceTypeInput {
    title: string;
    description: string;
    logo: string;
}

export interface UpdateServiceTypeInput {
    id: string;
    title: string;
    description: string;
    logo: string;
}

export interface DeleteServiceTypeInput {
    id: string;
}

export interface RetrieveServiceTypeInput {
    id: string;
}

export interface CreateServiceTypeOutput {
    serviceType: ServiceType;
}

export interface UpdateServiceTypeOutput {
    serviceType: ServiceType;
}

export interface DeleteServiceTypeOutput {
    serviceType: ServiceType;
}

export interface RetrieveServiceTypeOutput {
    serviceType: ServiceType | undefined;
}

export interface CrudServiceTypeInterface {
    create(createProps: CreateServiceTypeInput): Promise<CreateServiceTypeOutput>;
    update(updateProps: UpdateServiceTypeInput): Promise<UpdateServiceTypeOutput>;
    delete(deleteProps: DeleteServiceTypeInput): Promise<DeleteServiceTypeOutput>;
    retrieve(retrieveProps: RetrieveServiceTypeInput): Promise<RetrieveServiceTypeOutput>;
}
