var mysql = require('mysql');
var pool = mysql.createPool({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: 'root',
    database: 'node_test'
});


module.exports.pool = pool;
