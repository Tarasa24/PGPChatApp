import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export default class AddedHashToFiles1633013397001 implements MigrationInterface {
  async up(queryRunner: QueryRunner) {
    const hasFileTable = await queryRunner.hasTable('file')
    if (hasFileTable)
      await queryRunner.addColumn(
        'file',
        new TableColumn({
          name: 'hash',
          type: 'text',
          isNullable: true,
          isUnique: true,
        })
      )
  }

  async down(queryRunner: QueryRunner) {
    const hasFileTable = await queryRunner.hasTable('file')
    if (hasFileTable) await queryRunner.dropColumn('file', 'hash')
  }
}
