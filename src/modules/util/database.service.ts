import { Injectable } from '@nestjs/common';
import { OkPacket, RowDataPacket, ResultSetHeader } from 'mysql2';
import * as mysql from 'mysql2';
@Injectable()
export class DatabaseService {
  reader_pool: mysql.Pool;
  writer_pool: mysql.Pool;

  constructor() {
    console.info('new MySQLPool()');

    this.reader_pool = mysql.createPool({
      host: process.env.LHIRE_READER_DB_HOST,
      port: parseInt(process.env.LHIRE_DB_PORT),
      user: process.env.LHIRE_DB_USER,
      password: process.env.LHIRE_DB_PASSWORD,
      database: process.env.LHIRE_DB_DATABASE,
      waitForConnections: process.env.WAIT_FOR_CONNECTION === 'true',
      connectionLimit: Number(process.env.CONNECTION_LIMIT),
      charset: 'utf8mb4',
      queryFormat: (query: string, values: any) => {
        let queryResult = null;

        if (!values) {
          queryResult = query;
        }

        if (queryResult === 'COMMIT' || queryResult === 'START TRANSACTION') {
          return queryResult;
        }

        if (values) {
          if (Array.isArray(values)) {
            let index = -1;

            queryResult = query.replace(/:\?/g, () => {
              index += 1;
              return this.reader_pool.escape(values[index]);
            });
          } else {
            // eslint-disable-next-line func-names
            queryResult = query.replace(/:(\w+)/g, (text, key) => {
              let localQuery = '';

              if (Object.prototype.hasOwnProperty.call(values, key) === true) {
                localQuery = this.reader_pool.escape(values[key]);
              } else {
                localQuery = text;
              }

              return localQuery;
            });
          }
        }

        if (process.env.LOGGING === 'true') {
          console.info(`query > ${queryResult}`);
        }

        return queryResult;
      },
    });

    this.writer_pool = mysql.createPool({
      host: process.env.LHIRE_WRITER_DB_HOST,
      port: parseInt(process.env.LHIRE_DB_PORT),
      user: process.env.LHIRE_DB_USER,
      password: process.env.LHIRE_DB_PASSWORD,
      database: process.env.LHIRE_DB_DATABASE,
      waitForConnections: process.env.WAIT_FOR_CONNECTION === 'true',
      connectionLimit: Number(process.env.CONNECTION_LIMIT),
      charset: 'utf8mb4',
      queryFormat: (query: string, values: any) => {
        let queryResult = null;

        if (!values) {
          queryResult = query;
        }

        if (queryResult === 'COMMIT' || queryResult === 'START TRANSACTION') {
          return queryResult;
        }

        if (values) {
          if (Array.isArray(values)) {
            let index = -1;

            queryResult = query.replace(/:\?/g, () => {
              index += 1;
              return this.writer_pool.escape(values[index]);
            });
          } else {
            // eslint-disable-next-line func-names
            queryResult = query.replace(/:(\w+)/g, (text, key) => {
              let localQuery = '';

              if (Object.prototype.hasOwnProperty.call(values, key) === true) {
                localQuery = this.writer_pool.escape(values[key]);
              } else {
                localQuery = text;
              }

              return localQuery;
            });
          }
        }

        if (process.env.LOGGING === 'true') {
          console.info(`query > ${queryResult}`);
        }

        return queryResult;
      },
    });
  }

  async writeBeginTransaction(): Promise<mysql.PoolConnection> {
    return new Promise((resolve, reject) => {
      this.writer_pool.getConnection((error, connection) => {
        if (error) {
          return reject(error);
        }

        connection.beginTransaction((error) => {
          reject(error);
        });

        resolve(connection);
      });
    });
  }

  async readBeginTransaction(): Promise<mysql.PoolConnection> {
    return new Promise((resolve, reject) => {
      this.reader_pool.getConnection((error, connection) => {
        if (error) {
          return reject(error);
        }

        connection.beginTransaction((error) => {
          reject(error);
        });

        resolve(connection);
      });
    });
  }

  async query(
    connection: mysql.PoolConnection,
    query: string,
    params?: any,
  ): Promise<RowDataPacket | RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader> {
    return new Promise((resolve, reject) => {
      if (!connection) {
        return reject(new Error('query() > connection is empty '));
      }

      if (!params) {
        params = {};
      }
      connection.query(query, params, (error, rows) => {
        if (error) {
          return reject(error);
        }

        if (Array.isArray(rows) && rows.length === 1 && Object.keys(rows[0]).length === 1) {
          resolve(rows[0]);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async writeQueryOne(
    query: string,
    params?: any,
  ): Promise<RowDataPacket | RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader> {
    return new Promise((resolve, reject) => {
      this.writer_pool.getConnection((error, connection) => {
        if (error) {
          return reject(error);
        }

        if (!params) {
          params = {};
        }

        connection.query(query, params, (error2, rows) => {
          if (error2) {
            connection.rollback(() => {});
            connection.release();

            return reject(error2);
          }

          connection.release();

          if (Array.isArray(rows) && rows.length === 1 && Object.keys(rows[0]).length === 1) {
            resolve(rows[0]);
          } else {
            resolve(rows);
          }
        });
      });
    });
  }

  async readQueryOne(
    query: string,
    params?: any,
  ): Promise<RowDataPacket | RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader> {
    return new Promise((resolve, reject) => {
      this.reader_pool.getConnection((error, connection) => {
        if (error) {
          return reject(error);
        }

        if (!params) {
          params = {};
        }

        connection.query(query, params, (error2, rows) => {
          if (error2) {
            connection.rollback(() => {});
            connection.release();

            return reject(error2);
          }

          connection.release();

          if (Array.isArray(rows) && rows.length === 1 && Object.keys(rows[0]).length === 1) {
            resolve(rows[0]);
          } else {
            resolve(rows);
          }
        });
      });
    });
  }

  async endTransaction(connection: mysql.PoolConnection) {
    return new Promise((resolve, reject) => {
      if (!connection) {
        return reject(new Error('end_transaction() > connection is empty'));
      }

      connection.commit();
      connection.release();

      resolve(connection);
    });
  }

  async rollback(connection: mysql.PoolConnection) {
    return new Promise((resolve, reject) => {
      if (!connection) {
        return reject(new Error('rollback() > connection is empty'));
      }

      connection.rollback(() => {});
      connection.release();

      resolve(connection);
    });
  }
}
