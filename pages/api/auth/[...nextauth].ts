import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';

export default function (req, res) {
  NextAuth(req, res, {
    // setting no session, only jwt
    session: {
      jwt: true,
    },
    // jwt secret
    jwt: {
      secret: process.env.JWT_SECRET,
    },
    // signin providers
    providers: [
      Providers.Github({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET
      })
    ],
    database: process.env.DATABASE_URL,
    // use custom signin page, otherwise will use a template prebuilt
    pages: {
      signIn: '/signin'
    },
  });
};