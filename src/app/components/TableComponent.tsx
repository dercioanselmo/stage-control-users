'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  IconButton,
  TablePagination,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { SortConfig } from '../page'; // Import the SortConfig interface

interface TableComponentProps {
  users: any[];
  total: number;
  page: number;
  rowsPerPage: number;
  sortConfig: SortConfig;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEdit: (user: any) => void;
  onDelete: (id: string) => void;
  requestSort: (key: string) => void;
}

const colors = {
  textPrimary: '#fff',
  tableBackground: '#0F0F0F',
};

export default function TableComponent({
  users,
  total,
  page,
  rowsPerPage,
  sortConfig,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  requestSort,
}: TableComponentProps) {
  return (
    <>
      <Table >
        <TableHead>
          <TableRow sx={{ height: '40px' }}>
            <TableCell sx={{ color: colors.textPrimary }}>
              <TableSortLabel
                active={sortConfig.key === 'fullName'}
                direction={sortConfig.key === 'fullName' ? sortConfig.direction : 'asc'}
                onClick={() => requestSort('fullName')}
                sx={{
                  color: colors.textPrimary,
                  '&:hover': { color: colors.textPrimary },
                  '&.Mui-active': { color: colors.textPrimary },
                }}
              >
                Full Name
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ color: colors.textPrimary }}>
              <TableSortLabel
                active={sortConfig.key === 'email'}
                direction={sortConfig.key === 'email' ? sortConfig.direction : 'asc'}
                onClick={() => requestSort('email')}
                sx={{
                  color: colors.textPrimary,
                  '&:hover': { color: colors.textPrimary },
                  '&.Mui-active': { color: colors.textPrimary },
                }}
              >
                Email
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ color: colors.textPrimary }}>
              <TableSortLabel
                active={sortConfig.key === 'role'}
                direction={sortConfig.key === 'role' ? sortConfig.direction : 'asc'}
                onClick={() => requestSort('role')}
                sx={{
                  color: colors.textPrimary,
                  '&:hover': { color: colors.textPrimary },
                  '&.Mui-active': { color: colors.textPrimary },
                }}
              >
                Role
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ color: colors.textPrimary }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id} sx={{ height: '40px' }}>
              <TableCell sx={{ color: colors.textPrimary }}>{user.fullName}</TableCell>
              <TableCell sx={{ color: colors.textPrimary }}>{user.email}</TableCell>
              <TableCell sx={{ color: colors.textPrimary }}>{user.role}</TableCell>
              <TableCell>
                <IconButton onClick={() => onEdit(user)} sx={{ color: colors.textPrimary }}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => onDelete(user._id.toString())} sx={{ color: colors.textPrimary }}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        sx={{ color: colors.textPrimary, display: 'flex', justifyContent: 'center' }}
      />
    </>
  );
}