'use client';

import { AppBar, Toolbar, IconButton, Button, Box } from '@mui/material';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';

const colors = {
  background: '#000000',
  textPrimary: '#fff',
  textSecondary: '#ccc',
};

export default function Header() {
  const { data: session } = useSession();

  return (
    <AppBar position="static" sx={{ backgroundColor: colors.background }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Image src="/Project.png" alt="Project Logo" width={171} height={40} />
        </Box>
        {session && (
          <IconButton color="inherit" onClick={() => signOut()} sx={{ color: colors.textPrimary, padding: 1 }}>
          <Image src="/account_circle.png" alt="Profile" width={20} height={20} /> 
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
}