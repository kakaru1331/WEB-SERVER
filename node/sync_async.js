var fs = require('fs');
var data = fs.readFileSync('data.txt', {encoding: 'utf8'});
console.log(1);
console.log(data);
console.log(2);

fs.readFile('data.txt', {encoding: 'utf8'}, function(err, data) {
  console.log(3);
  console.log(data);
})
console.log(4);