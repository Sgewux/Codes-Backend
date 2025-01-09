import { Connection, createConnection } from "mysql2/promise";

async function getConnection(): Promise<Connection> {
  try {
    return await createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || "0000"),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
  } catch (e) {
    throw e;
  }
}

export default getConnection;
