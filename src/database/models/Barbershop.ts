import {
    PrimaryGeneratedColumn,
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import User from './User';
import Appointment from './Appointment';

@Entity('barbershops')
class Barbershop {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /* a user may register a barbershop */
    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    owner: User;

    @OneToMany(() => Appointment, (appointment) => appointment.shop)
    appointments: Appointment[]

    @Column('varchar')
    name: string;

    @Column('varchar')
    slogan: string;

    @Column('varchar')
    description: string;

    @Column('varchar')
    address: string;

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
    updatedAt: Date;
}

export default Barbershop;
