import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
} from 'typeorm';

class CreateBarberShop1588796629208 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'barbershops',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'uuid_generate_v4()',
                    },
                    {
                        /* barbershop is owned by a user */
                        name: 'user_id',
                        type: 'uuid',
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                    },
                    {
                        /* Primary message */
                        name: 'slogan',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        /* Describe the business */
                        name: 'description',
                        type: 'varchar',
                    },
                    {
                        /* location of the barbershop */
                        name: 'address',
                        type: 'varchar',
                    },
                    { name: 'created_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
                    { name: 'updated_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
                ],
            }),
        );

        /*
            Relates barbershops to users by foreignKey
        */
        await queryRunner.createForeignKey(
            'barbershops',
            new TableForeignKey({
                name: 'FK_barbershops_user',
                columnNames: ['user_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('barbershops');
    }
}

export default CreateBarberShop1588796629208;
