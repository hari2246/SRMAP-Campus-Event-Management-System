// src/components/Admin/UserManagement.js
import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Paper, Typography } from '@mui/material';

const roles = ['student', 'faculty', 'admin'];

export default function UserManagement() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      setUsers(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    await updateDoc(doc(db, 'users', userId), {
      role: newRole
    });
  };

  const columns = [
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'role', headerName: 'Role', width: 150, editable: true },
    { 
      field: 'lastLogin', 
      headerName: 'Last Active', 
      width: 200,
      valueGetter: (params) => 
        new Date(params.value?.toDate()).toLocaleString()
    }
  ];

  return (
    <Paper sx={{ p: 2, height: 500 }}>
      <Typography variant="h6" gutterBottom>User Management</Typography>
      <DataGrid
        rows={users}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        processRowUpdate={(newRow) => {
          handleRoleChange(newRow.id, newRow.role);
          return newRow;
        }}
      />
    </Paper>
  );
}