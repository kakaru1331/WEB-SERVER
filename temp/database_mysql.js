var mysql = require('mysql');
var connection = mysql.createConnection({
  host  : 'localhost',
  user  : 'root',
  password  : '012345',
  database  : 'o2'
});
connection.connect();
// var params = ['Supervisor', 'Watcher', 'graphittie'];
// connection.query('INSERT INTO topic (title, description, author) VALUES(?, ?, ?)', params, function
// (err, rows, fields){
//   if(err){
//     console.log(err);
//   } else {
//     console.log(rows.insertId);
//   }
// });
// connection.query('SELECT * FROM topic', function(err, rows, fields) {
//   if(err) {
//     console.log(err);
//   } else {
//     for(var i = 0; i < rows.length; i++){
//       console.log(rows[i].description);
//     }    
//   }
// });

var sql = 'DELETE FROM topic WHERE id=?';
var params = [1];
connection.query(sql, params, function(err, rows, fields){
  if(err){
    console.log(err);
  } else {
    console.log(rows);
  }
});

connection.end();