import { Pool } from "pg";

// const pool = new Pool({
//   host: process.env.PGHOST,
//   user: process.env.PGUSER,
//   password: process.env.PGPASSWORD,
//   database: process.env.PGDATABASE,
//   port: process.env.PGPORT,
//   ssl: false,
// });

//using connection string
const connectionString =
  "postgresql://neondb_owner:npg_BRKgo1dlSzY0@ep-dry-scene-aha1t3f7-pooler.c-3.us-east-1.aws.neon.tech/PaystackDB?sslmode=require&channel_binding=require";

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;
