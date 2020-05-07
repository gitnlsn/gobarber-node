import {
    PrimaryGeneratedColumn,
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import User from './User';
import Appointment from './Appointment';

@Entity('appointment_messages')
class AppointmentMessage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar')
    text: string;

    /* message is written by a client */
    @ManyToOne(() => User, (user) => user.appointmentMessages)
    @JoinColumn({ name: 'user_id' })
    author: User;

    /* message is related to an appointment */
    @ManyToOne(() => Appointment, (appointment) => appointment.messages)
    @JoinColumn({ name: 'appointment_id' })
    appointment: Appointment;

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
    updatedAt: Date;
}

export default AppointmentMessage;
