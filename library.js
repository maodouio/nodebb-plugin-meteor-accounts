(function(module) {
  "use strict";

  var meta = module.parent.require('./meta'),
    user = module.parent.require('./user'),
    db = module.parent.require('../src/database'),
    passport = module.parent.require('passport'),
    passportLocal = module.parent.require('passport-local').Strategy,
    nconf = module.parent.require('nconf'),
    async = module.parent.require('async'),
    mongodb = require('mongodb');

  exports.setupLogin = function() {
    passport.use(new passportLocal(function(username, password, next) {
      if (!username) {
        return next(new Error('[[error:invalid-username]]'));
      }
      if (!password) {
        return next(new Error('[[error:invalid-password]]'));
      }

      var mongoClient = require('mongodb').MongoClient;
      var userAccount, uid;
      var meteorAccountsDbUrl = nconf.get('meteorAccountsDbUrl');

      async.waterfall([
        function(next) {
          mongoClient.connect(meteorAccountsDbUrl, next);
        },
        function(_db, next) {
          var selector = username.indexOf('@') === -1 ? {username: username} : {'emails.address': username};
          _db.collection('users').find(selector).toArray(next);
        },
        function(docs, next) {
          if (docs.length === 0) {
            return next(new Error('[[error:no-user]]'));
          }
          userAccount = docs[0];
          if (!userAccount.username) {
            return next(new Error('[[error:invalid-username]]'));
          }
          require('bcrypt').compare(require('sha256')(password), userAccount.services.password.bcrypt, next);
        },
        function(res, next) {
          if (!res) {
            return next(new Error('[[error:invalid-password]]'));
          }
          user.getUidByUserslug(userAccount.username, next);
        },
        function(_uid, next) {
          if (!_uid) { // register a user in local database
            return user.create({username: userAccount.username, email: userAccount.emails.length > 0 ? userAccount.emails[0].address : ""}, next);
          }
          next(null, _uid);
        },
        function(_uid, next) {
          uid = _uid;
          async.parallel({
            userData: function(next) {
              db.getObjectFields('user:' + uid, ['banned', 'passwordExpiry'], next);
            },
            isAdmin: function(next) {
              user.isAdministrator(uid, next);
            }
          }, next);
        },
        function(result, next) {
          var userData = result.userData;
          userData.uid = uid;
          userData.isAdmin = result.isAdmin;

          if (!result.isAdmin && parseInt(meta.config.allowLocalLogin, 10) === 0) {
            return next(new Error('[[error:local-login-disabled]]'));
          }

          if (!userData) {
            return next(new Error('[[error:invalid-user-data]]'));
          }
          if (userData.banned && parseInt(userData.banned, 10) === 1) {
            return next(new Error('[[error:user-banned]]'));
          }
          next(null, userData, '[[success:authentication-successful]]');
        }
      ], next);
    }));
  };

}(module));
