import { NextAuthConfig } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const authConfig: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ''
    })
  ],
  pages: {
    signIn: '/'
  }
};

export default authConfig;
