let sockets = {};

module.exports.openSocket = (socket) => {
  console.log('A user has connected');
  if (socket.request.user.email) {
    sockets[socket.request.user.email] = sockets[socket.request.user.email] || [];
    sockets[socket.request.user.email].push(socket);
  }
  // TODO - Add event listeners here
};

module.exports.closeSocket = (socket) => {
  console.log('A user has disconnected');
  if (socket.request.user.id) {
    for (let i = 0; i < sockets[socket.request.user.email].length; i++) {
      if (sockets[socket.request.user.email][i] === socket) {
        sockets[socket.request.user.email].splice(i, 1);
        if (sockets[socket.request.user.email].length === 0) {
          delete sockets[socket.request.user.email];
          break;
        }
      }
    }
  }
};

module.exports.respondToUsers = (users, dataType, data) => {
  for (let i = 0; i < users.length; i++) {
    // If this user has any open socket connections
    if (sockets[users[i].email]) {
      for (let j = 0; j < sockets[users[i].email].length; j++) {
        sockets[users[i].email][j].emit(dataType, data);
      }
    }
  }
};

module.exports.respondToUsersByEmail = (userEmails, dataType, data) => {
  for (let i = 0; i < userEmails.length; i++) {
    // If this user has any open socket connections
    if (sockets[userEmails[i]]) {
      for (let j = 0; j < sockets[userEmails[i]].length; j++) {
        sockets[userEmails[i]][j].emit(dataType, data);
      }
    }
  }
};

module.exports.respondToAllUsers = (dataType, data) => {
  Object.values(sockets).forEach((socketArray) => {
    socketArray.forEach((socket) => {
      socket.emit(dataType, data);
    });
  });
};

module.exports.getUsersOnline = () => {
  return Object.keys(sockets);
};