var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var FileStore = require('session-file-store')(session);
var md5 = require('md5');
var sha256 = require('sha256');
var bkfd2Password = require('pbkdf2-password');
var hasher = bkfd2Password();
var app = express();

app.use(bodyParser.urlencoded({ extended: false}));
app.use(session({
  secret: 'atc54321',
  resave: false,
  saveUninitialized: true,
  store: new FileStore()
}));

app.get('/count', function(req, res){
  if(req.session.count){
    req.session.count++;
  } else {
    req.session.count = 1;
  }  
  res.send('count: '+req.session.count);
});

app.get('/auth/login', function(req, res){
  var output = `
  <h1>Login</h1>
  <form action="/auth/login" method="post">
    <p>
      <input type="text" name="username" placeholder="username">
    </p>
    <p>
      <input type="password" name="password" placeholder="password">
    </p>
    <p>
      <input type="submit">
    </p>
  </form>
  `;
  
  res.send(output);
});
app.post('/auth/login', function(req, res){
  var uname = req.body.username;
  var pwd = req.body.password;

  for(var i = 0; i < users.length; i++){
    var user = users[i];

    if(uname === user.username) {
      return hasher({password: pwd, salt: user.salt}, function(err, pass, salt, hash) {
        if(hash === user.password) {
          req.session.displayName = user.displayName;
          req.session.save(function() {
            res.redirect('/welcome');
          });
        } else {
          res.send('Who are you? <a href="/auth/login">login</a>')
        }
      });
    }
    // if(usrname === user.username && sha256(pwd+user.salt) === user.password){
    //   req.session.displayName = user.displayName;
    //   return req.session.save(function(){
    //      res.redirect('/welcome');
    //   });
    // }
  }
  res.send('I never recognized you <a href="/auth/login">login</a>');
});

app.get('/welcome', function(req, res){
  if(req.session.displayName){
    res.send(`
      <h1>Hello, ${req.session.displayName}</h1>
      <a href="/auth/logout">logout</a>
    `);
  } else {
    res.send(`
      <h1>Welcome.</h1>
      <ul>
        <li><a href="/auth/login">Login</a></li>
        <li><a href="/auth/register">Register</a></li>
      </ul>
    `);
  }
});
app.get('/auth/logout', function(req, res){
  delete req.session.displayName;
  res.redirect('/welcome');
});

app.get('/auth/register', function(req, res){
  var output = `
  <h1>Register</h1>
  <form action="/auth/register" method="post">
    <p>
      <input type="text" name="username" placeholder="username">
    </p>
    <p>
      <input type="password" name="password" placeholder="password">
    </p>
    <p>
      <input type="text" name="displayName" placeholder="displayName">
    </p>
    <p>
      <input type="submit">
    </p>
  </form>
  `
  res.send(output);
})
app.post('/auth/register', function(req, res){
  hasher({password: req.body.password}, function(err, pass, salt, hash) {
    var user = {
      username: req.body.username,
      password: hash,
      salt: salt,
      displayName: req.body.displayName
    };
    users.push(user);
    req.session.displayName = req.body.displayName;
    req.session.save(function() {
      res.redirect('/welcome');
    });    
  });  
});

// var salt = 'keyboard cat'
var users = [
  {
    username: 'kakaru',
    password: 'x//oACdxYP3wy+H09P5ooEylMHwrHC7uO4Sh08pT1Z66qMtxxky4Ahc5b+WVkiFSNByvAQR1rLUJSm5iG/PCWDJaD+WL70nk8z8w1QIL2OVNDrYLsuH3a0Fu2HI/KsF3XH/ZoIyMrNoJz65ZebTrObgpYLO68tiaI4ff9o+WoAk=',
    salt: '9uXDPOvAJNaV7Rk1E506LchWhVRyriM7iGVNjRI2uhtJECPi5JFLb1O/kub7EvYSeM1BWVaP2mG5GoVBPiRiAw==',
    displayName: 'Kakaru'
  }
  // {
  //   username: 'apple',
  //   password: '0ae93a5a5fc6c35fcea23b7157e94573d9f3430aecd58a01acb9d176e8b41ea3',
  //   salt: 'b',
  //   displayName: 'Apple'
  // }
];


app.listen(3004, function(){
  console.log('Connected 3004 port!');
});