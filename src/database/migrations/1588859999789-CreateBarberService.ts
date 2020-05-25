import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
} from 'typeorm';

class CreateBarberService1588859999789 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        /*
            Table to define unique barber services
        */
        await queryRunner.createTable(
            new Table({
                name: 'service_types',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'title',
                        type: 'varchar',
                    },
                    {
                        name: 'description',
                        type: 'varchar',
                    },
                    {
                        name: 'logo_url',
                        type: 'varchar',
                    },
                ],
            }),
        );

        /*
            Table to establish many-to-many relations between barbershop and services
                - if the barbershop does the service, the relation exists
         */
        await queryRunner.createTable(
            new Table({
                name: 'barbershop_services',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'shop_id',
                        type: 'uuid',
                    },
                    {
                        name: 'service_id',
                        type: 'uuid',
                    },
                    {
                        /* A description to the appointment */
                        name: 'title',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        /* user may override description to be displayed */
                        name: 'description',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'price',
                        type: 'int',
                    },
                    {
                        /* user may override logo to be displayed */
                        name: 'logo_url',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        /* enum kind: disabled, enabled, deleted */
                        name: 'status',
                        type: 'varchar',
                        default: '\'enabled\'',
                    },
                ],
            }),
        );

        /*
            Relates barbershops to users by foreignKey
        */
        await queryRunner.createForeignKey(
            'barbershop_services',
            new TableForeignKey({
                name: 'FK_service_babershop',
                columnNames: ['shop_id'],
                referencedTableName: 'barbershops',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'barbershop_services',
            new TableForeignKey({
                name: 'FK_service_type',
                columnNames: ['service_id'],
                referencedTableName: 'service_types',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('barbershop_services');
        await queryRunner.dropTable('service_types');
    }
}

export default CreateBarberService1588859999789;
