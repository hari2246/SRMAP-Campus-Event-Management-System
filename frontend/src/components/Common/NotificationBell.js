// src/components/Common/NotificationBell.js
import React, { useState, useEffect } from 'react';
import { Badge, IconButton, Menu, List, ListItem, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    if (auth.currentUser) {
      const q = query(
        collection(db, 'notifications'), 
        where('userId', '==', auth.currentUser.uid),
        where('read', '==', false)
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setNotifications(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      });

      return () => unsubscribe();
    }
  }, []);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <List sx={{ width: 300 }}>
          {notifications.map(notification => (
            <ListItem key={notification.id} divider>
              <Typography variant="body2">
                {notification.message}
              </Typography>
            </ListItem>
          ))}
          {notifications.length === 0 && (
            <ListItem>
              <Typography color="textSecondary">
                No new notifications
              </Typography>
            </ListItem>
          )}
        </List>
      </Menu>
    </>
  );
}