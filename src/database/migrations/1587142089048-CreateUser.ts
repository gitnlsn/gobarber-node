/* eslint-disable class-methods-use-this */
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

class CreateUser1587142089048 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

        /**
         *  Establishes necessary data to perform login. No cosmetics
         */
        await queryRunner.createTable(new Table({
            name: 'users',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    default: 'uuid_generate_v4()',
                },

                { name: 'name', type: 'varchar', default: '\'guest\'' },
                {
                    name: 'email', type: 'varchar', isNullable: false, isUnique: true,
                },
                {
                    /* location of the barbershop */
                    name: 'status',
                    type: 'varchar', /* enabled | disabled | deleted */
                    default: '\'enabled\'',
                },
                { name: 'password', type: 'varchar', isNullable: false },

                { name: 'created_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
                { name: 'updated_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
            ],
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('users');
    }
}

export default CreateUser1587142089048;
