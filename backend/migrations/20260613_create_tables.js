exports.up = async function (knex) {
  // users - single-user default
  await knex.schema.createTable('users', (t) => {
    t.string('id').primary();
    t.string('name').notNullable().defaultTo('user');
    t.string('email');
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('habits', (t) => {
    t.string('id').primary();
    t.string('user_id').notNullable();
    t.string('title').notNullable();
    t.string('cadence').notNullable().defaultTo('daily');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at');
    t.foreign('user_id').references('users.id').onDelete('CASCADE');
  });

  await knex.schema.createTable('entries', (t) => {
    t.string('id').primary();
    t.string('habit_id').notNullable();
    t.string('date').notNullable();
    t.string('status').notNullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.foreign('habit_id').references('habits.id').onDelete('CASCADE');
  });

  await knex.schema.createTable('backups', (t) => {
    t.string('id').primary();
    t.string('path').notNullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('backups');
  await knex.schema.dropTableIfExists('entries');
  await knex.schema.dropTableIfExists('habits');
  await knex.schema.dropTableIfExists('users');
};
