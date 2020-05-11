import {
    PrimaryGeneratedColumn,
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    OneToMany,
} from 'typeorm';
import Barbershop from './Barbershop';
import Appointment from './Appointment';
import AppointmentMessage from './AppointmentMessage';

@Entity('users')
class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar')
    name: string;

    /* client may have register a barbershop */
    @OneToOne(() => Barbershop)
    shop: Barbershop;

    /* client may have many appointments */
    @OneToMany(() => Appointment, (appointment) => appointment.client)
    appointments: Appointment[];

    @OneToMany(() => AppointmentMessage, (message) => message.author)
    appointmentMessages: AppointmentMessage[];

    @Column('varchar')
    email: string;

    @Column('varchar')
    password: string;

    @Column('varchar')
    status: 'enabled' | 'disabled' | 'deleted';

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
    updatedAt: Date;
}

export default User;
