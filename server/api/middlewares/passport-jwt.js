import Passport from 'passport';
import PassportJWT from 'passport-jwt';

import { getConfig } from '../../config/config';
import User from '../resources/User/user.model';

const config = getConfig(process.env.NODE_ENV);

export const configJWTStrategy = () => {
  const opts = {
    jwtFromRequest: PassportJWT.ExtractJwt.fromExtractors([
      PassportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
      PassportJWT.ExtractJwt.fromUrlQueryParameter('token'),
    ]),
    secretOrKey: config.secret,
  };

  Passport.use(
    new PassportJWT.Strategy(opts, (payload, done) => {
      User.findOne({ _id: payload.id, is_deleted: false, active: true }, { password: 0 })
        .populate('role_id')
        .exec(function(err, user) {
          if (err) {
            return done(err, false);
          }
          if (user) {
            let lastChangePassword = new Date(user.last_change_password).getTime();
            if (lastChangePassword > (payload.iat * 1000)) {
              return done(null, false);
            }
            return done(null, user);
          }
          return done(null, false);
        });
    }),
  );
};
