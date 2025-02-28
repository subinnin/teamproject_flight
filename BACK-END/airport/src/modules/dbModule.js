const dbModule = () =>{
    const mysql = require("mysql");
    const dbConfig = require("../dbconfig/dbConfig");
    const dbHandler = mysql.createConnection({
        host:dbConfig.host,
        user:dbConfig.user,
        database:dbConfig.database,
        password:dbConfig.password
    });
    return dbHandler;
}

module.exports = dbModule;