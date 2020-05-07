import {
    MigrationInterface, QueryRunner, Table, TableForeignKey,
} from 'typeorm';

class ServiceCosmetic1588862716391 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        /*
            Table of qualifiers of a service
         */
        await queryRunner.createTable(
            new Table({
                name: 'service_cosmetics',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'uuid_generate_v4()',
                    },
                    {
                        /* foreignKey */
                        name: 'service_id',
                        type: 'uuid',
                    },
                    {
                        /* Cosmetic name / title */
                        name: 'title',
                        type: 'varchar',
                    },
                    {
                        /* one word description: to attach to the service */
                        name: 'tag',
                        type: 'varchar',
                    },
                    {
                        /* extended description of the cosmetic */
                        name: 'description',
                        type: 'varchar',
                    },
                ],
            }),
        );

        await queryRunner.createTable(
            new Table({
                name: 'services_cosmetics_relation',
                columns: [
                    {
                        name: 'service_id',
                        type: 'uuid',
                    },
                    {
                        name: 'cosmetic_id',
                        type: 'uuid',
                    },
                    {
                        name: 'price',
                        type: 'int',
                    },
                    {
                        name: 'logo_url',
                        type: 'varchar',
                    },
                    {
                        name: 'status',
                        type: 'varchar', /* dubious support to enum */
                    },
                ],
            }),
        );

        /*
            Relates barbershops to users by foreignKey
        */
        await queryRunner.createForeignKey(
            'service_cosmetics',
            new TableForeignKey({
                name: 'FK_service_cosmetic',
                columnNames: ['service_id'],
                referencedTableName: 'barber_services',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('services_cosmetics_relation');
        await queryRunner.dropTable('service_cosmetics');
    }
}
export default ServiceCosmetic1588862716391;
