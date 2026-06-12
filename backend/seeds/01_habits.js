const { randomUUID } = require('crypto');

exports.seed = async function (knex) {
  // minimal seed: one user and one habit
  await knex('users').del();
  await knex('habits').del();
  await knex('entries').del();

  const userId = randomUUID();
  await knex('users').insert({ id: userId, name: 'singleuser' });

  const habitId = randomUUID();
  await knex('habits').insert({ id: habitId, user_id: userId, title: 'Ejemplo: beber agua', cadence: 'daily' });
};
