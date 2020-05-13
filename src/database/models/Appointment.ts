import {
    PrimaryGeneratedColumn,
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import User from './User';
import AppointmentMessage from './AppointmentMessage';
import BarbershopService from './BarbershopService';

@Entity('appointments')
class Appointment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar')
    title: string;

    /* client may have many appointments */
    @ManyToOne(() => User, (user) => user.appointments)
    @JoinColumn({ name: 'user_id' })
    client: User;

    /* client may have many appointments */
    @ManyToOne(() => BarbershopService, (service) => service.appointments)
    @JoinColumn({ name: 'service_id' })
    service: BarbershopService;

    /* client may have many appointments */
    @OneToMany(() => AppointmentMessage, (message) => message.appointment)
    messages: AppointmentMessage[];

    @Column({ type: 'timestamptz', name: 'starts_at' })
    startsAt: Date;

    @Column({ type: 'timestamptz', name: 'ends_at' })
    endsAt: Date;

    @Column('varchar')
    observations: string;

    /*
        shop owner customizes accessibility
            enabled: owner creates appointment availability
            disabled: appointment is created, but owner wants to prevent its booking
            deleted: owner cancels appointment availability
        - implements persistense after deletion
     */
    @Column('varchar')
    status: 'enabled' | 'disabled' | 'deleted' | 'canceled';

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
    updatedAt: Date;
}

export default Appointment;
