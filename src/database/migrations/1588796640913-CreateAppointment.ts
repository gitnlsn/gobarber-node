import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
} from 'typeorm';

class CreateAppointments1588796640913 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'appointments',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'uuid_generate_v4()',
                    },
                    {
                        /* A description to the appointment */
                        name: 'title',
                        type: 'varchar',
                    },
                    {
                        /* points to users: client chooses an appointment */
                        name: 'user_id',
                        type: 'uuid',
                        isNullable: true,
                    },
                    {
                        /* points to shop: barbershop announces an available appointment */
                        name: 'shop_id',
                        type: 'uuid',
                    },
                    {
                        /* Starting timestamp */
                        name: 'starts_at',
                        type: 'timestamp with time zone',
                    },
                    {
                        /* Ending timestamp */
                        name: 'ends_at',
                        type: 'timestamp with time zone',
                    },
                    {
                        /* details the appoint has */
                        name: 'observations',
                        type: 'varchar',
                        isNullable: true,
                    },
                    /* timestamp logs */
                    { name: 'created_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
                    { name: 'updated_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
                ],
            }),
        );

        /*
            Relates barbershops to users by foreignKey
        */
        await queryRunner.createForeignKey(
            'appointments',
            new TableForeignKey({
                name: 'appointment_client',
                columnNames: ['user_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'appointments',
            new TableForeignKey({
                name: 'appointment_shop',
                columnNames: ['shop_id'],
                referencedTableName: 'barbershops',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('appointments');
    }
}

export default CreateAppointments1588796640913;
