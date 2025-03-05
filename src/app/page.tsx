'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TableComponent from './components/TableComponent';

const colors = {
  background: '#0F0F0F',
  textPrimary: '#fff',
  textSecondary: '#ccc',
  tableBackground: '#0F0F0F',
};

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export default function Home() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState({ fullName: '', email: '', role: '', _id: '' });
  const [nameSearch, setNameSearch] = useState('');
  const [emailSearch, setEmailSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'fullName', direction: 'asc' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, nameSearch, emailSearch, sortConfig]);

  const fetchUsers = async () => {
    setIsLoading(true);
    const params = new URLSearchParams({
      page: (page + 1).toString(),
      limit: rowsPerPage.toString(),
      name: nameSearch,
      email: emailSearch,
      sort: sortConfig.key,
      direction: sortConfig.direction,
    }).toString();
    const res = await fetch(`/api/users?${params}`);
    const data = await res.json();
    if (res.ok) {
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } else {
      console.error('Failed to fetch users:', data.error);
    }
    setIsLoading(false);
  };

  const handleOpenDialog = (user = { fullName: '', email: '', role: '', _id: '' }) => {
    setCurrentUser(user);
    setOpenDialog(true);
    setErrorMessage(null);
  };

  const validateFields = () => {
    if (!currentUser.fullName.trim()) return 'Full Name is required';
    if (!currentUser.email.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(currentUser.email.trim())) {
      return 'Invalid email format';
    }
    if (!currentUser.role.trim()) return 'Role is required';
    return null;
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentUser({ fullName: '', email: '', role: '', _id: '' });
  };

  const saveUser = async () => {
    const validationError = validateFields();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    try {
      const userData = currentUser._id
        ? { _id: currentUser._id, fullName: currentUser.fullName, email: currentUser.email, role: currentUser.role }
        : { fullName: currentUser.fullName, email: currentUser.email, role: currentUser.role };
      const method = currentUser._id ? 'PUT' : 'POST';
      const res = await fetch('/api/users', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save user');
      handleCloseDialog();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error.message);
      setErrorMessage(error.message);
    }
  };

  const deleteUser = async (id) => {
    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchUsers();
      } else {
        console.error('Failed to delete user:', data.error);
      }
    } catch (error) {
      console.error('Error deleting user:', error.message);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Container
      maxWidth="md"
      sx={{ mt: 4, minHeight: '100vh', padding: 2, color: colors.textPrimary }}
    >
      <Typography variant="h4" gutterBottom sx={{ color: colors.textPrimary }}>
        Admin Users
      </Typography>
      <div style={{ display: 'flex', gap: 8, mb: 2 }}>
        <TextField
          label="Search by Name"
          value={nameSearch}
          onChange={(e) => setNameSearch(e.target.value)}
          variant="outlined"
          sx={{ input: { color: colors.textPrimary }, label: { color: colors.textSecondary }, flex: 1 }}
        />
        <TextField
          label="Search by Email"
          value={emailSearch}
          onChange={(e) => setEmailSearch(e.target.value)}
          variant="outlined"
          sx={{ input: { color: colors.textPrimary }, label: { color: colors.textSecondary }, flex: 1 }}
        />
        <Button variant="contained" onClick={() => handleOpenDialog()} sx={{ color: colors.textPrimary }}>
          Add User
        </Button>
      </div>
      <TableComponent
        users={users}
        total={total}
        page={page}
        rowsPerPage={rowsPerPage}
        sortConfig={sortConfig}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onEdit={handleOpenDialog}
        onDelete={deleteUser}
        requestSort={requestSort}
      />
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        sx={{ '& .MuiDialog-paper': { backgroundColor: colors.background, color: colors.textPrimary } }}
      >
        <DialogTitle sx={{ color: colors.textPrimary, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {currentUser._id ? 'Edit User' : 'Add User'}
          <IconButton onClick={handleCloseDialog} sx={{ color: colors.textPrimary }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2, backgroundColor: colors.background, color: colors.textPrimary }} onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Full Name"
            type="text"
            fullWidth
            value={currentUser.fullName}
            onChange={(e) => setCurrentUser({ ...currentUser, fullName: e.target.value })}
            sx={{ input: { color: colors.textPrimary }, label: { color: colors.textSecondary } }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={currentUser.email}
            onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
            sx={{ input: { color: colors.textPrimary }, label: { color: colors.textSecondary } }}
          />
          <TextField
            margin="dense"
            label="Role"
            type="text"
            fullWidth
            value={currentUser.role}
            onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
            sx={{ input: { color: colors.textPrimary }, label: { color: colors.textSecondary } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ color: colors.textPrimary }}>
            Cancel
          </Button>
          <Button onClick={saveUser} variant="contained">
            {currentUser._id ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}