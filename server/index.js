require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const Store = require('connect-session-sequelize')(session.Store);
const db = require('../database');
const url = require('url');
const path = require('path');
const apiRouter = require('./apiRoutes');
const cookieParser = require('cookie-parser');
const authRouter = require('./authRouter.js');
const passportSocketIo = require('passport.socketio');
const socketHandler = require('./socketHandler.js');
const compression = require('compression');

const shouldCompress = (req, res) => {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header 
    return false
  }
 
  // fallback to standard filter function 
  return compression.filter(req, res)
}

// TODO - Remove this variable
const fakeGame = {
  hand: [
    {id: 54, text: 'cardOne', type: 'white'},
    {id: 34, text: 'cardTwo', type: 'white'},
    {id: 48, text: 'cardThree', type: 'white'},
    {id: 2, text: 'cardFour', type: 'white'},
    {id: 75, text: 'cardFive', type: 'white'}
  ],
  currentBlackCard: {id: 555, text: 'blackCard', type: 'black', answerFields: 2},
  whiteCardsPlayed: [],
  judgeId: 420,
  ownerId: 20,
  players: [
    {
      id: 420,
      name: 'Alec',
      email: 'alec@gmail.com'
    },
    {
      id: 20,
      name: 'Tommy',
      email: 'tommy@gmail.com'
    },
    {
      id: 75,
      name: 'Jesse',
      email: 'jesse@gmail.com'
    },
    {
      id: 4,
      name: 'Steve',
      email: 'steve@gmail.com'
    },
    {
      id: 2,
      name: 'Joey',
      email: 'joey@gmail.com'
    }
  ],
  roundStage: 'card play phase',
  nextStageStart: new Date().getTime(),
  isRunning: true,
  name: `Tommy's Game`,
  maxPlayers: 8
};

// Create session store
let store = new Store({db: db.connection});

// Initialize passport strategies
require('./auth')(passport, db.User.model);

// Sync database
db.connection.sync().then(() => {
  console.log('Nice! Database looks fine.');
}).catch((err) => {
  console.log('Uh oh. something went wrong when updating the database.');
  console.error(err);
});

// Create app
let app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.use(compression({filter: shouldCompress}))

// ---- MIDDLEWARE ----
// Body parser
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
// Cookie parser
app.use(cookieParser());
// Passport and sessions
app.use(session({
  store,
  secret: 'thisisasecret',
  resave: true,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Setup auth and api routing
app.use('/api', apiRouter(socketHandler));
app.use('/', authRouter); // Middleware redirector

// Serve static files
app.get('*/bundle.js', (req, res) => {
  res.sendFile(path.resolve(__dirname + '/../client/dist/bundle.js'));
});
app.get('/*', (req, res) => {
  if (req.user) {
    db.Cardpack.getByUserEmail(req.user.email)
      .then((cardpacks) => {
        db.Friend.get(req.user.email)
          .then((friendData) => {
            res.render('index', {user: JSON.stringify(req.user), game: JSON.stringify(fakeGame), cardpacks: JSON.stringify(cardpacks), friends: JSON.stringify(friendData.friends), requestsSent: JSON.stringify(friendData.requestsSent), requestsReceived: JSON.stringify(friendData.requestsReceived)});
          });
      });
  } else {
    res.render('index', {user: JSON.stringify(null), game: JSON.stringify(null), cardpacks: '[]', friends: '[]', requestsSent: '[]', requestsReceived: '[]'});
  }
});

let http = require('http').Server(app);
let io = require('socket.io')(http);

// Launch/export server
if (module.parent) {
  module.exports = http;
} else {
  let port = process.env.PORT || 3000;
  http.listen(port, () => {
    console.log('Listening on port ' + port);
  });
}

// Setup passport authentication for web sockets
io.use(passportSocketIo.authorize({
  key: 'connect.sid',
  secret: 'thisisasecret',
  store,
  passport: passport,
  cookieParser: cookieParser
}));

// Setup socket event handlers
io.on('connection', (socket) => {
  socketHandler.openSocket(socket);
  socket.on('disconnect', () => {
    socketHandler.closeSocket(socket);
  });
});