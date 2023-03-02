const odbc = require('odbc')
const SqlString = require('sqlstring');
const { BaseDriver } = require('@cubejs-backend/base-driver');
const DremioQuery = require('./DremioQuery');
const applyParams = (query, params) => SqlString.format(query, params);

class DremioDriver extends BaseDriver {

  static dialectClass() {
    return DremioQuery;
  }
  /**
     * Returns default concurrency value.
     */
  static getDefaultConcurrency() {
    return 2;
  }
  /**
 * Class constructor.
 */
  constructor(config = {}) {
    super();
    this.config = {
      connectionString:
        config.connectionString || '',
      loginTimeout:
        config.loginTimeout || 10,
      connectionTimeout:
        config.connectionTimeout || 10,
      ...config
    };
    this.pool = odbc.pool(this.config)
  }

  /**
   * @public
   * @return {Promise<void>}
   */
  async testConnection() {
    try {
      const pool = await this.pool;
      return await pool.query('SELECT 1');
    } catch (e) {
      throw e;
    }
  }

  quoteIdentifier(identifier) {
    return `"${identifier}"`;
  }

  async query(query, values) {
    const queryString = applyParams(
      query,
      (values || []).map(s => (typeof s === 'string' ? {
        toSqlString: () => SqlString.escape(s).replace(/\\\\([_%])/g, '\\$1').replace(/\\'/g, '\'\'')
      } : s))
    );
    try {
      const pool = await this.pool;
      const res = await pool.query(queryString);
      return res;
    } catch (error) {
      throw new Error(
        `Dremio odbc Query error,${error.message}`,
      );
    }
  }

  informationSchemaQuery() {
    const q = `SELECT columns.column_name as ${this.quoteIdentifier('column_name')},
    columns.table_name as ${this.quoteIdentifier('table_name')},
    columns.table_schema as ${this.quoteIdentifier('table_schema')},
    columns.data_type as ${this.quoteIdentifier('data_type')}
FROM information_schema.columns
join information_schema.views
on columns.table_name=views.table_name
WHERE columns.table_schema NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')  AND columns.table_schema NOT IN ('INFORMATION_SCHEMA', 'sys.cache')`;
    return q;
  }
}

module.exports = DremioDriver;