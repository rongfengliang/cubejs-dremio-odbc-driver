# cube.js dremio odbc driver

## Usage

* cube.js

```code
const { DremioDriver, DremioQuery } = require("dremio-odbc-cubejs-driver")
module.exports = {
    dialectFactory: (dataSource) => {
        return DremioQuery
    },
    dbType: ({ dataSource } = {}) => {
        return "dremio-odbc"
    },
    driverFactory: ({ dataSource } = {}) => {
        const username = "xxxx";
        const password = "xxxxx"
        const host = "xxxxx"
        const port = 32010
        const ssl = false
        const database = "xxxxxx"
        # this use mac odbc path ,you may need change it 
        const connectionConfig = {
            connectionString: `DRIVER=/Library/Dremio/ODBC/lib/libarrow-flight-sql-odbc.dylib;Host=${host};ConnectionType=Direct;Schema=${database};Port=${port};useEncryption=${ssl};UID=${username};PWD=${password}`,
            connectionTimeout: 10,
            loginTimeout: 10,
        }
        return new DremioDriver(connectionConfig)
    }
};
```