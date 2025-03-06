import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Replace this with your authentication logic
        const user = { id: '1', name: 'Admin', email: 'admin@example.com' }; // Dummy user for now
        console.log("User Login Tested");
        console.log(credentials?.username)
        console.log(credentials?.password)
        if (credentials?.username === 'admin' && credentials?.password === 'password') {
          return user;
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin', // Custom sign-in page
  },
});

export { handler as GET, handler as POST };