const LocalStrategy = require('passport-local').Strategy;
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');

module.exports = function (passport) {
  // 1. LOCAL STRATEGY (Email & Password Authentication)
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email: email.toLowerCase().trim() });
          if (!user) {
            return done(null, false, { message: 'Invalid email address or user not found.' });
          }

          if (!user.password) {
            return done(null, false, {
              message: 'Account password is missing. Please reset password.',
            });
          }

          const isMatch = await user.comparePassword(password);
          if (!isMatch) {
            return done(null, false, { message: 'Incorrect password entered.' });
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // 2. JWT STRATEGY FOR PROTECTED API ENDPOINTS
  const jwtSecret = process.env.JWT_SECRET || 'pack_assist_ai_super_secret_jwt_token_key_112233';
  const jwtOpts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecret,
  };

  passport.use(
    new JwtStrategy(jwtOpts, async (jwtPayload, done) => {
      try {
        const user = await User.findById(jwtPayload.id || jwtPayload.sub);
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (err) {
        return done(err, false);
      }
    })
  );

  // SESSION SERIALIZATION
  passport.serializeUser((user, done) => {
    done(null, String(user._id));
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
