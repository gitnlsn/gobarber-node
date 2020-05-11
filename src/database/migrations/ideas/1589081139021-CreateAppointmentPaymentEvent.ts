import {
    MigrationInterface, QueryRunner, Table, TableForeignKey,
} from 'typeorm';

class CreateAppointmentPaymentEvent1589081139021 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'appointment_payment_events',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    default: 'uuid_generate_v4()',
                },
                {
                    name: 'value',
                    type: 'int',
                },
                {
                    name: 'appointment_id',
                    type: 'uuid',
                },
                {
                    name: 'type',
                    type: 'varchar',
                    /*
                        negotiation:
                            - appointment is booked
                            - payment was not made yet
                            - barbershop wants to change the service price
                            - negotiation value must not change
                        payed:
                            - service occured
                            - installments
                    */
                },
                {
                    name: 'method',
                    type: 'varchar',
                    isNullable: true,
                    /*
                        debit card
                        credit card
                        money
                        null
                    */
                },
                { name: 'occured_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
            ],
        }));

        await queryRunner.createForeignKey(
            'appointment_payment_events',
            new TableForeignKey({
                name: 'FK_payment_event_appointment',
                columnNames: ['appointment_id'],
                referencedTableName: 'appointments',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('appointment_payment_events');
    }
}

export default CreateAppointmentPaymentEvent1589081139021;
