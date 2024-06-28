const { db } = require('@vercel/postgres');
const data = require('./data.json');

const bcrypt = require('bcrypt');

async function seedUsers(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    // Create the "users" table if it doesn't exist
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `;

    console.log(`Created "users" table`);

    // Insert data into the "users" table
    const insertedUsers = await Promise.all(
      data.users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return client.sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
      }),
    );

    console.log(`Seeded ${insertedUsers.length} users`);

    return {
      createTable,
      users: insertedUsers,
    };
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

async function seedCasts(client) {
  try {
    // Create the "casts" table if it doesn't exist
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS casts (
        hash CHAR(42) PRIMARY KEY,
        username VARCHAR(128) NOT NULL,
        fid INT NOT NULL,
        text TEXT NOT NULL,
        channel VARCHAR(64) DEFAULT null,
        tags VARCHAR(255) NOT NULL,
        engagement DECIMAL(15, 6) NOT NULL DEFAULT 0,
        likes INT NOT NULL DEFAULT 0,
        replies INT NOT NULL DEFAULT 0,
        recasts INT NOT NULL DEFAULT 0,
        summary VARCHAR(255) NOT NULL DEFAULT '',
        status INT NOT NULL DEFAULT 0,
        scv DECIMAL(10, 2) NOT NULL DEFAULT 0,
        casted_at TIMESTAMP with time zone NOT NULL,
        fetched_at TIMESTAMP with time zone DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP with time zone DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS casts_fetched_idx ON casts (fetched_at);
    `;

    console.log(`Created "casts" table`);

    // Insert data into the "casts" table
    const insertedCasts = await Promise.all(
      data.casts.map(
        (cast) => client.sql`
        INSERT INTO casts (hash, username, fid, text, channel, tags, likes, replies, recasts, scv, casted_at)
        VALUES (${cast.hash}, ${cast.profileName}, ${cast.fid}, ${cast.text}, ${cast.channelId}, ${cast.tags},
                ${cast.numberOfLikes}, ${cast.numberOfReplies}, ${cast.numberOfRecasts}, ${cast.scv}, ${cast.castedAtTimestamp})
        ON CONFLICT (hash) DO UPDATE SET
          likes = EXCLUDED.likes,
          replies = EXCLUDED.replies,
          recasts = EXCLUDED.recasts;
      `,
      ),
    );

    console.log(`Seeded ${insertedCasts.length} casts`);

    return {
      createTable,
      casts: insertedCasts,
    };
  } catch (error) {
    console.error('Error seeding casts:', error);
    throw error;
  }
}




async function main() {
  const client = await db.connect();

  await seedUsers(client);
  await seedCasts(client);

  await client.end();
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to seed the database:',
    err,
  );
});
