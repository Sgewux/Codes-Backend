import { Connection, FieldPacket, RowDataPacket } from "mysql2/promise";
import getConnection from "../db";

async function callProcedure(
  procedureName: string,
  params: any[] = []
): Promise<RowDataPacket[]> {
  let connection: Connection | null = null;

  try {
    connection = await getConnection();

    const placeholders: string = params.map(() => "?").join(", ");
    const query: string = `CALL ${procedureName}(${placeholders})`;
    const [result]: [RowDataPacket[], FieldPacket[]] = await connection.query(
      query,
      params
    );

    return result;
  } catch (e: any) {
    throw e;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export default callProcedure;
