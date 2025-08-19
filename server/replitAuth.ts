import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import MongoStore from "connect-mongo";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const mongodbUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  
  if (!mongodbUri) {
    throw new Error("MONGODB_URI not provided for session store");
  }
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: MongoStore.create({
      mongoUrl: mongodbUri,
      ttl: sessionTtl / 1000, // TTL in seconds for MongoDB
      touchAfter: 24 * 3600, // lazy session update (24 hours)
      collectionName: 'sessions',
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
      sameSite: 'lax',
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.access_token = tokens.access_token;
  user.id_token = tokens.id_token;
  user.token_expires_at = new Date(
    Date.now() + (tokens.expires_in ?? 0) * 1000
  );

  if (tokens.refresh_token != null) {
    user.refresh_token = tokens.refresh_token;
  }
}

export function initAuth(app: Express) {
  const origin = process.env.REPLIT_PROJECT_NAME ?
    `https://${process.env.REPLIT_PROJECT_NAME}.${process.env.REPLIT_OWNER}.repl.co` :
    process.env.NODE_ENV === 'production' ? 
      'https://rideconnect.app' : 
      'http://localhost:5000';

  const callback_url = `${origin}/auth/replit/callback`;

  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());
  
  getOidcConfig().then((config) => {
    const verify: VerifyFunction = (_tokenset, userInfo, done) => {
      return done(null, userInfo);
    };

    passport.use(new Strategy(config, { callback_url }, verify));

    async function refreshUser(user: any) {
      updateUserSession(user, tokens);
      await storage.upsertUser(user);
    }

    passport.serializeUser(async (user, done) => {
      user = { ...(user as any) };
      if (!user.id) {
        user.id = user.email;
      }
      await storage.upsertUser(user);
      done(null, user);
    });

    passport.deserializeUser(async (user: any, done) => {
      if (user == null) {
        return done(null, null);
      }

      const stored = await storage.getUser(user.id);
      if (stored == null) {
        return done(null, null);
      }

      return done(null, user);
    });

    app.get('/login', (_req, res) => {
      res.redirect('/auth/replit');
    });

    app.get('/logout', (req, res) => {
      return res.json({
        logout_url:
          client.buildEndSessionUrl(config, {
            id_token_hint: (req.user as any)?.id_token,
            post_logout_redirect_uri: origin + '/welcome',
          }) || origin + '/welcome',
      });
    });

    app.get(
      '/auth/replit',
      ...passport.authenticate('openidconnect', {
        scope: 'openid email profile',
      })
    );

    app.get(
      '/auth/replit/callback',
      ...passport.authenticate('openidconnect', {
        failureRedirect: '/welcome',
        successRedirect: '/',
      }),
    );

    app.get('/api/auth/refresh', async (req: any, res) => {
      if (req.user == null) {
        return res.status(401).json({ error: 'Must be logged in' });
      }

      if (req.user.refresh_token == null) {
        return res.status(401).json({ error: 'No refresh token available' });
      }

      const tokenResponse = await client.refreshTokenGrant(
        config,
        req.user.refresh_token
      );
      updateUserSession(req.user, tokenResponse);
      await storage.upsertUser(req.user);
      await new Promise((resolve, reject) => {
        req.session.save((err: any) => {
          if (err) reject(err);
          else resolve(undefined);
        });
      });

      return res.json({
        access_token: req.user.access_token,
        expires_in: tokenResponse.expires_in,
      });
    });
  });
}