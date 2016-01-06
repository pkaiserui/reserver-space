var models = require('../models');
var jwt = require('jwt-simple');

module.exports = {
  signup: function(req, res, next) {
    var username = req.body.userData.email;
    console.log(username);
    var password = req.body.password;

    models.User.findAll({
      where: {
        username: username
      }
    })
    .then(function(user) {
      console.log('this is the user: ', user);
      if (user.length > 0) {
        res.status(403).send({error: 'User already exist!'});
        next(new Error('User already exist!'));
      } else {
        return models.User.create({
          username: username,
          password: password,
          registered: true
        });
      }
    })
    .then(function(user) {
      var token = jwt.encode(user, 'secret');
      res.json({token: token});
    })
    // .fail(function(error) {
    //   next(error);
    // });
  },
  signin: function(req, res, next) {
    var username = req.body.loginData.username;
    var password = req.body.loginData.password;
 
    models.User.findAll({
      where: {
        username: username
      }
    })
    .then(function(user) {
      if (!user) {
        res.status(401).send({error: 'User does not exist'});
        next(new Error('User does not exist'));
      } else {
        console.log('this is the user: ', user);
        return user.checkPassword(password)
          .then(function(foundUser) {
            if (foundUser) {
              var token = jwt.encode(user, 'secret');
              res.json({
                username: user.username,
                token: token
              });
            } else {
              res.status(401).send('User or password is incorrect');
              next(new Error('User or password is incorrect'));
            }
          });
      }
    })
  },
  checkAuth: function(req, res, next) {
    var token = req.headers['x-access-token'];
    if (!token) {
      next(new Error('no token'));
    } else {
      var user = jwt.decode(token, 'secret');

      models.User.findAll({
        where: {
          username: user.username
        }
      })
        .then(function(foundUser) {
          if (foundUser) {
            res.status(200).send();
          } else {
            res.status(401).send();
          }
        })
        // .fail(function(error) {
        //   next(error);
        // });
    }
  }
}