import {
    MigrationInterface,
    QueryRunner,
    TableForeignKey,
    Table,
} from 'typeorm';

class CreatePost1588796657146 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'appointment_messages',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'uuid_generate_v4()',
                    },
                    {
                        /* points to users: user writes the message */
                        name: 'user_id',
                        type: 'uuid',
                    },
                    {
                        /* points to appointment: users will discuss the appointment */
                        name: 'appointment_id',
                        type: 'uuid',
                    },
                    {
                        /* Describe the business */
                        name: 'text',
                        type: 'varchar',
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
            'appointment_messages',
            new TableForeignKey({
                name: 'message_user',
                columnNames: ['user_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'appointment_messages',
            new TableForeignKey({
                name: 'message_appointment',
                columnNames: ['appointment_id'],
                referencedTableName: 'appointments',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('babershops');
    }
}

export default CreatePost1588796657146;
