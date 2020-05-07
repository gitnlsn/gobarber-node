import {
    PrimaryGeneratedColumn,
    Entity,
    Column,
    OneToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import Appointment from './Appointment';
import ServiceType from './ServiceType';
import Barbershop from './Barbershop';

@Entity('barbershop_services')
class BarbershopService {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /* a user may register a barbershop */
    @OneToOne(() => ServiceType)
    @JoinColumn({ name: 'service_id' })
    type: ServiceType;

    @OneToOne(() => Barbershop)
    @JoinColumn({ name: 'shop_id' })
    provider: Barbershop;

    @OneToMany(() => Appointment, (appointment) => appointment.service)
    appointments: Appointment[];

    @Column('int')
    price: number;

    @Column('varchar', { name: 'logo_url' })
    logoUrl: string | null;

    @Column('varchar')
    description: string;

    @Column('varchar')
    status: 'enabled' | 'disabled' | 'deleted';
}

export default BarbershopService;
