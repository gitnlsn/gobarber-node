import {
    PrimaryGeneratedColumn,
    Entity,
    Column,
} from 'typeorm';

@Entity('service_types')
class ServiceType {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar')
    title: string;

    @Column('varchar')
    description: string;

    @Column('varchar', { name: 'logo_url' })
    logoUrl: string;
}

export default ServiceType;
