import { PrimaryGeneratedColumn, Entity, Column } from 'typeorm';

@Entity('users')
class Users {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar')
    name: string;

    @Column('varchar')
    email: string;

    @Column('varchar')
    password: string;

    @Column('timestamp with time zone')
    created_at: string;

    @Column('timestamp with time zone')
    updated_at: string;
}

export default Users;
