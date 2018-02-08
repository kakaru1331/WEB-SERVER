var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var FileStore = require('session-file-store')(session);
var sha256 = require('sha256');
var bkfd2Password = require('pbkdf2-password');
var hasher = bkfd2Password();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'atc54321',
  resave: false,
  saveUninitialized: true,
  store: new FileStore()
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/count', function(req, res){
  if(req.session.count){
    req.session.count++;
  } else {
    req.session.count = 1;
  }  
  res.send('count: '+req.session.count);
});

app.get('/welcome', function(req, res) {
  if(req.user && req.user.displayName) {
    res.send(`
      <h1>Hello, ${req.user.displayName}</h1>
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
  <a href="/auth/facebook">facebook</a>
  `;
  
  res.send(output);
});
app.post('/auth/login', 
  passport.authenticate('local', 
    { 
      successRedirect: '/welcome',
      failureRedirect: '/auth/login',
      failureFlash: false
    }
  )
)

passport.serializeUser(function(user, done) {
  console.log('serializeUser', user);
  done(null, user.username);
});
passport.deserializeUser(function(id, done) {
  console.log('deserializeUser', id);
  for(var i = 0; i < users.length; i++){
    var user = users[i];

    if(user.username === id) {
      return done(null, user);
    }
  }  
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    var uname = username;
    var pwd = password;

    for(var i = 0; i < users.length; i++){
      var user = users[i];

      if(uname === user.username) {
        return hasher({ password: pwd, salt: user.salt }, function(err, pass, salt, hash) {
          if(hash === user.password) {
            console.log('LocalStrategy', user);
            return done(null, user);
          } else {
            done(null, false);            
          }
        });
      }
    }
    done(null, false);
  }
));
passport.use(new FacebookStrategy({
  clientID: '941077499383304',
  clientSecret: '70b76176af02f37840e4c89118be4e48',
  callbackURL: "http://3004/auth/facebook/callback"
},
function(accessToken, refreshToken, profile, done) {
  // User.findOrCreate(..., function(err, user) {
  //   if (err) { return done(err); }
  //   done(null, user);
  // });
}
));

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', 
  { 
    // successRedirect: 'http://localhost:3004/welcome',
    failureRedirect: '/auth/login' 
  }), function(req, res) {
    res.redirect('/welcome')
  }
);

app.get('/auth/logout', function(req, res){
  req.logout();
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
})

var users = [
  {
    username: 'kakaru',
    password: 'x//oACdxYP3wy+H09P5ooEylMHwrHC7uO4Sh08pT1Z66qMtxxky4Ahc5b+WVkiFSNByvAQR1rLUJSm5iG/PCWDJaD+WL70nk8z8w1QIL2OVNDrYLsuH3a0Fu2HI/KsF3XH/ZoIyMrNoJz65ZebTrObgpYLO68tiaI4ff9o+WoAk=',
    salt: '9uXDPOvAJNaV7Rk1E506LchWhVRyriM7iGVNjRI2uhtJECPi5JFLb1O/kub7EvYSeM1BWVaP2mG5GoVBPiRiAw==',
    displayName: 'Kakaru'
  }
];

app.listen(3004, function(){
  console.log('Connected 3004 port!');
});