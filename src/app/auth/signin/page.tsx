'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button, TextField, Container, Typography, Alert } from '@mui/material';

const colors = {
  background: '#0F0F0F',
  textPrimary: '#fff',
  textSecondary: '#ccc',
};

export default function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn('credentials', {
      redirect: false,
      username,
      password,
    });

    if (result?.error) {
      setError('Invalid credentials');
    } else {
      router.push('/');
    }
  };

  return (
    <Container
      maxWidth="xs"
      sx={{ mt: 8, color: colors.textPrimary, backgroundColor: colors.background, padding: 2, borderRadius: 1 }}
    >
      <Typography variant="h4" gutterBottom sx={{ color: colors.textPrimary }}>
        Sign In
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2, color: colors.textPrimary }}>{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ mb: 2, input: { color: colors.textPrimary }, label: { color: colors.textSecondary } }}
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2, input: { color: colors.textPrimary }, label: { color: colors.textSecondary } }}
        />
        <Button type="submit" variant="contained" sx={{ color: colors.textPrimary }}>
          Sign In
        </Button>
      </form>
    </Container>
  );
}