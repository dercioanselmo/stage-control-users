'use client';

import { useState, useEffect } from 'react';
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TableComponent from './components/TableComponent';
import CustomButton from './components/CustomButton';

const colors = {
  background: '#0F0F0F',
  textPrimary: '#fff',
  textSecondary: '#ccc',
};

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export default function HomeComponent() {
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
      const res = await fetch(`/api/users`, {
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
      const res = await fetch(`/api/users`, {
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
      maxWidth={1344}
      sx={{ mt: 0, minHeight: '100vh', padding: 2, color: colors.textPrimary, backgroundColor: 'transparent' }}
    >
      <Typography
        variant="h5"
        width={151}
        height={33}
        gutterBottom
        sx={{
          color: colors.textPrimary,
          fontSize: '18px',
          fontWeight: 500,
          lineHeight: '33px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        Admin Users
      </Typography>

      <div style={{ display: 'flex', gap: 8, mb: 2, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <TextField
            label="Search by Name"
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            variant="outlined"
            sx={{
              width: 348,
              '& .MuiOutlinedInput-root': {
                height: 44,
                '& fieldset': {
                  borderColor: '#909090',
                },
                '&:hover fieldset': {
                borderColor: '#909090',
              },
                '&.Mui-focused fieldset': {
                  borderColor: '#909090',
                },
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
          <TextField
            label="Search by Email"
            value={emailSearch}
            onChange={(e) => setEmailSearch(e.target.value)}
            variant="outlined"
            sx={{
              width: 348,
              '& .MuiOutlinedInput-root': {
                height: 44,
                '& fieldset': {
                  borderColor: '#909090',
                },
                '&:hover fieldset': {
                  borderColor: '#909090', 
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#909090',
                },
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
        </div>
        
        <CustomButton
          buttonColor="#FFFFFF"
          textColor="#000000"
          text="Invite User"
          icon="/person_add.png"
          width='178'
          onClick={() => handleOpenDialog()} // Placeholder action (to be implemented later)
        />
        
      </div >
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
      </div >
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
            borderColor: '#909090'
          } 
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
            <Alert severity="error" sx={{ mb: 2, backgroundColor: colors.background, color: colors.textPrimary }} onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          )}
          
      
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={currentUser.email}
            onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
            sx={{
              width: 384,
              '& .MuiOutlinedInput-root': {
                height: 44,
                '& fieldset': {
                  borderColor: '#909090',
                },
                '&:hover fieldset': {
                  borderColor: '#909090',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#909090',
                },
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
            label="Role"
            fullWidth
            value={currentUser.role}
            onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: colors.background + ' !important', // Force black background (#0F0F0F)
                  '& .MuiMenuItem-root': {
                    color: colors.textPrimary, // White text (#fff)
                    backgroundColor: colors.background, // Ensure each item matches (#0F0F0F)
                  },
                  '& .MuiMenuItem-root:hover': {
                    backgroundColor: '#1F1F1F', // Slightly lighter on hover
                    color: colors.textPrimary,
                  },
                  '& .MuiMenuItem-root.Mui-selected': {
                    backgroundColor: '#2F2F2F', // Slightly different for selected
                    color: colors.textPrimary,
                  },
                  '& .MuiMenuItem-root.Mui-selected:hover': {
                    backgroundColor: '#2F2F2F', // Keep selected hover consistent
                  },
                },
              },
            }}
            sx={{
              marginTop: 4,
              width: 384,
              '& .MuiOutlinedInput-root': {
                height: 44,
                '& fieldset': {
                  borderColor: '#909090',
                },
                '&:hover fieldset': {
                  borderColor: '#909090', // Maintain border color on hover
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#909090',
                },
              },
              '& .MuiInputBase-input': {
                color: colors.textPrimary, // White text (#fff)
                padding: '10px 14px',
              },
              '& .MuiInputLabel-root': {
                color: colors.textPrimary + ' !important', // Default to white (#fff)
                top: '-2px',
              },
              '&:hover .MuiInputLabel-root': {
                color: colors.textPrimary + ' !important', // White on hover
              },
              '&.Mui-focused .MuiInputLabel-root': {
                color: colors.textPrimary + ' !important', // White when focused
              },
              '& .MuiInputLabel-shrink': {
                color: colors.textPrimary + ' !important', // White when shrunk
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#909090',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#909090', // Ensure hover state consistency
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#909090', // Ensure focused state consistency
              },
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
          width='118px'
          onClick={() => handleCloseDialog()} 
        />

        <CustomButton
          buttonColor="#FFFFFF"
          textColor="#000000"
          text={currentUser._id ? 'Save' : 'Invite'}
          icon=""
          width='118px'
          onClick={saveUser} 
        />

        </DialogActions>
      </Dialog>
    </Container>
  );
}