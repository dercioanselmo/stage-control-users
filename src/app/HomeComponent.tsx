'use client';

import { useState, useEffect, ChangeEvent, useCallback } from 'react';
import {
  Container,
  Typography,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  IconButton,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TableComponent from './components/TableComponent';
import CustomButton from './components/CustomButton';
import debounce from 'lodash/debounce'; 

// Define color constants
const colors = {
  background: '#0F0F0F',
  textPrimary: '#fff',
  textSecondary: '#ccc',
} as const;

// Define interfaces
interface User {
  fullName: string;
  email: string;
  role: string;
  _id: string;
}

interface SortConfig {
  key: keyof User;
  direction: 'asc' | 'desc';
}

interface FetchUsersResponse {
  users: User[];
  total: number;
  error?: string;
}

export default function HomeComponent() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User>({ fullName: '', email: '', role: '', _id: '' });
  const [searchValue, setSearchValue] = useState<string>(''); // Search text
  const [searchCategory, setSearchCategory] = useState<'fullName' | 'email' | 'role'>('fullName'); // Search category
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'fullName', direction: 'asc' });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Debounced fetchUsers function
  const debouncedFetchUsers = useCallback(
    debounce(async (value: string, category: 'fullName' | 'email' | 'role') => {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        [category]: value,
        sort: sortConfig.key,
        direction: sortConfig.direction,
      }).toString();

      try {
        const res = await fetch(`/api/users?${params}`);
        const data: FetchUsersResponse = await res.json();
        if (res.ok) {
          setUsers(data.users || []);
          setTotal(data.total || 0);
        } else {
          console.error('Failed to fetch users:', data.error);
        }
      } catch (error) {
        console.error('Error fetching users:', (error as Error).message);
      } finally {
        setIsLoading(false);
      }
    }, 300), // 300ms debounce delay
    [page, rowsPerPage, sortConfig] // Dependencies for debounce
  );

  // Initial load and dependency-based fetch
  useEffect(() => {
    debouncedFetchUsers(searchValue, searchCategory);
    return () => debouncedFetchUsers.cancel(); // Cleanup debounce on unmount
  }, [searchValue, searchCategory, page, rowsPerPage, sortConfig, debouncedFetchUsers]);

  const handleOpenDialog = (user: User = { fullName: '', email: '', role: '', _id: '' }): void => {
    setCurrentUser(user);
    setOpenDialog(true);
    setErrorMessage(null);
  };

  const validateFields = (): string | null => {
    if (!currentUser.fullName.trim() && currentUser._id) return 'Full Name is required';
    if (!currentUser.email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(currentUser.email.trim())) return 'Invalid email format';
    if (!currentUser.role.trim()) return 'Role is required';
    return null;
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setCurrentUser({ fullName: '', email: '', role: '', _id: '' });
  };

  const saveUser = async (): Promise<void> => {
    const validationError = validateFields();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    try {
      const userData: Partial<User> = currentUser._id
        ? { _id: currentUser._id, fullName: currentUser.fullName, email: currentUser.email, role: currentUser.role }
        : { fullName: currentUser.fullName, email: currentUser.email, role: currentUser.role };
      const method: 'POST' | 'PUT' = currentUser._id ? 'PUT' : 'POST';
      const res = await fetch(`/api/users`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data: { error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save user');
      handleCloseDialog();
      await debouncedFetchUsers(searchValue, searchCategory);
    } catch (error) {
      console.error('Error saving user:', (error as Error).message);
      setErrorMessage((error as Error).message);
    }
  };

  const deleteUser = async (id: string): Promise<void> => {
    try {
      const res = await fetch(`/api/users`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data: { error?: string } = await res.json();
      if (res.ok) {
        await debouncedFetchUsers(searchValue, searchCategory);
      } else {
        console.error('Failed to delete user:', data.error);
      }
    } catch (error) {
      console.error('Error deleting user:', (error as Error).message);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number): void => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const requestSort = (key: keyof User): void => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Container
      maxWidth={false}
      sx={{ mt: 0, minHeight: '100vh', padding: 3, color: colors.textPrimary, backgroundColor: 'transparent' }}
    >
      <Typography
        variant="h5"
        sx={{
          width: 151,
          height: 33,
          color: colors.textPrimary,
          fontSize: '18px',
          fontWeight: 500,
          lineHeight: '33px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          mb: 2,
        }}
      >
        Admin Users
      </Typography>

      <div style={{ display: 'flex', gap: 8, mb: 2, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8 }}>

        <TextField
            key="search-text" // Stable key to prevent remount
            label="Search Text"
            value={searchValue}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value)}
            variant="outlined"
            sx={{
              width: 348,
              '& .MuiOutlinedInput-root': {
                height: 44,
                '& fieldset': { borderColor: '#909090' },
                '&:hover fieldset': { borderColor: '#909090' },
                '&.Mui-focused fieldset': { borderColor: '#909090' },
              },
              '& .MuiInputBase-input': {
                color: colors.textPrimary,
                padding: '10px 14px',
              },
              '& .MuiInputLabel-root': {
                color: colors.textSecondary,
                top: '-2px',
              },
            }}
          />
          <Select
            label="Search Category"
            value={searchCategory}
            onChange={(e: SelectChangeEvent<'fullName' | 'email' | 'role'>) =>
              setSearchCategory(e.target.value as 'fullName' | 'email' | 'role')
            }
            sx={{
              width: 348,
              '& .MuiOutlinedInput-root': {
                height: 44,
                '& fieldset': { borderColor: '#909090' },
                '&:hover fieldset': { borderColor: '#909090' },
                '&.Mui-focused fieldset': { borderColor: '#909090' },
              },
              '& .MuiInputBase-input': {
                color: colors.textPrimary,
                padding: '10px 14px',
              },
              '& .MuiInputLabel-root': {
                color: colors.textSecondary,
                top: '-2px',
              },
              '&:hover .MuiInputLabel-root': {
                color: colors.textSecondary,
              },
              '&.Mui-focused .MuiInputLabel-root': {
                color: colors.textSecondary,
              },
              '& .MuiInputLabel-shrink': {
                color: colors.textSecondary,
              },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#909090' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#909090' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#909090' },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: colors.background + ' !important',
                  '& .MuiMenuItem-root': {
                    color: colors.textPrimary,
                    backgroundColor: colors.background,
                  },
                  '& .MuiMenuItem-root:hover': {
                    backgroundColor: '#1F1F1F',
                    color: colors.textPrimary,
                  },
                  '& .MuiMenuItem-root.Mui-selected': {
                    backgroundColor: '#2F2F2F',
                    color: colors.textPrimary,
                  },
                },
              },
            }}
          >
            <MenuItem value="fullName">Full Name</MenuItem>
            <MenuItem value="email">Email</MenuItem>
            <MenuItem value="role">Role</MenuItem>
          </Select>
          
        </div>
        <CustomButton
          buttonColor="#FFFFFF"
          textColor="#000000"
          text="Invite User"
          icon="/person_add.png"
          width="178"
          onClick={() => handleOpenDialog()}
        />
      </div>
      <div style={{ marginTop: 36 }}>
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
      </div>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: colors.background,
            color: colors.textPrimary,
            borderRadius: 5,
            width: 480,
            height: 335,
            padding: 3,
            border: '1px solid white',
            borderColor: '#909090',
          },
        }}
      >
        <DialogTitle sx={{ color: colors.textPrimary, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {currentUser._id ? 'Edit User' : 'Invite User'}
          <IconButton onClick={handleCloseDialog} sx={{ color: colors.textPrimary }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {errorMessage && (
            <Alert
              severity="error"
              sx={{ mb: 2, backgroundColor: colors.background, color: colors.textPrimary }}
              onClose={() => setErrorMessage(null)}
            >
              {errorMessage}
            </Alert>
          )}
          {currentUser._id && (
            <TextField
              margin="dense"
              label="Full Name"
              fullWidth
              value={currentUser.fullName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentUser({ ...currentUser, fullName: e.target.value })}
              sx={{
                width: 384,
                '& .MuiOutlinedInput-root': {
                  height: 44,
                  '& fieldset': { borderColor: '#909090' },
                  '&:hover fieldset': { borderColor: '#909090' },
                  '&.Mui-focused fieldset': { borderColor: '#909090' },
                },
                '& .MuiInputBase-input': {
                  color: colors.textPrimary,
                  padding: '10px 14px',
                },
                '& .MuiInputLabel-root': {
                  color: colors.textPrimary + ' !important',
                  top: '-2px',
                },
                '&:hover .MuiInputLabel-root': {
                  color: colors.textPrimary + ' !important',
                },
                '&.Mui-focused .MuiInputLabel-root': {
                  color: colors.textPrimary + ' !important',
                },
                '& .MuiInputLabel-shrink': {
                  color: colors.textPrimary + ' !important',
                },
              }}
            />
          )}

          
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={currentUser.email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentUser({ ...currentUser, email: e.target.value })}
            sx={{
              width: 384,
              '& .MuiOutlinedInput-root': {
                height: 44,
                '& fieldset': { borderColor: '#909090' },
                '&:hover fieldset': { borderColor: '#909090' },
                '&.Mui-focused fieldset': { borderColor: '#909090' },
              },
              '& .MuiInputBase-input': {
                color: colors.textPrimary,
                padding: '10px 14px',
              },
              '& .MuiInputLabel-root': {
                color: colors.textPrimary + ' !important',
                top: '-2px',
              },
              '&:hover .MuiInputLabel-root': {
                color: colors.textPrimary + ' !important',
              },
              '&.Mui-focused .MuiInputLabel-root': {
                color: colors.textPrimary + ' !important',
              },
              '& .MuiInputLabel-shrink': {
                color: colors.textPrimary + ' !important',
              },
            }}
          />
          
          <Select
            label="Role"
            fullWidth
            value={currentUser.role}
            onChange={(e: SelectChangeEvent<string>) => setCurrentUser({ ...currentUser, role: e.target.value })}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: colors.background + ' !important',
                  '& .MuiMenuItem-root': {
                    color: colors.textPrimary,
                    backgroundColor: colors.background,
                  },
                  '& .MuiMenuItem-root:hover': {
                    backgroundColor: '#1F1F1F',
                    color: colors.textPrimary,
                  },
                  '& .MuiMenuItem-root.Mui-selected': {
                    backgroundColor: '#2F2F2F',
                    color: colors.textPrimary,
                  },
                  '& .MuiMenuItem-root.Mui-selected:hover': {
                    backgroundColor: '#2F2F2F',
                  },
                },
              },
            }}
            sx={{
              marginTop: 4,
              width: 384,
              '& .MuiOutlinedInput-root': {
                height: 44,
                '& fieldset': { borderColor: '#909090' },
                '&:hover fieldset': { borderColor: '#909090' },
                '&.Mui-focused fieldset': { borderColor: '#909090' },
              },
              '& .MuiInputBase-input': {
                color: colors.textPrimary,
                padding: '10px 14px',
              },
              '& .MuiInputLabel-root': {
                color: colors.textPrimary + ' !important',
                top: '-2px',
              },
              '&:hover .MuiInputLabel-root': {
                color: colors.textPrimary + ' !important',
              },
              '&.Mui-focused .MuiInputLabel-root': {
                color: colors.textPrimary + ' !important',
              },
              '& .MuiInputLabel-shrink': {
                color: colors.textPrimary + ' !important',
              },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#909090' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#909090' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#909090' },
            }}
          >
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Super Admin">Super Admin</MenuItem>
            <MenuItem value="Moderator">Moderator</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <CustomButton
            buttonColor="#000000"
            textColor="#FFFFFF"
            text="Cancel"
            icon=""
            width="118px"
            onClick={() => handleCloseDialog()}
          />
          <CustomButton
            buttonColor="#FFFFFF"
            textColor="#000000"
            text={currentUser._id ? 'Save' : 'Invite'}
            icon=""
            width="118px"
            onClick={saveUser}
          />
        </DialogActions>
      </Dialog>
    </Container>
  );
}
