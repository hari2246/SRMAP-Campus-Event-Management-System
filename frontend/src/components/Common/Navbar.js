import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  Toolbar,
  Typography
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

import DashboardIcon from '@mui/icons-material/Dashboard';
import EventIcon from '@mui/icons-material/Event';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AddIcon from '@mui/icons-material/Add';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PersonIcon from '@mui/icons-material/Person';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import QrCodeIcon from '@mui/icons-material/QrCode';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const drawerWidth = 240;

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [];

  if (user) {
    navItems.push({ label: 'Events', path: '/events', icon: <EventIcon /> });

    if (user.role === 'student') {
      navItems.push(
        { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
        { label: 'Polls', path: '/polls', icon: <HowToVoteIcon /> },
        { label: 'Volunteer', path: '/volunteer', icon: <GroupAddIcon /> },
      );
    }

    if (user.role === 'organiser') {
      navItems.push(
        { label: 'My Events', path: '/organiser/myEvents', icon: <EventIcon /> },
        { label: 'Dashboard', path: '/organiser/dashboard', icon: <DashboardIcon /> },
        { label: 'Create Event', path: '/create-event', icon: <AddIcon /> },
        { label: 'Create Poll', path: '/create-poll', icon: <AddIcon /> },
        { label: 'Book Venue', path: '/venue/venueBooking', icon: <MeetingRoomIcon /> },
        { label: 'Request Volunteers', path: '/volunteer/request', icon: <GroupAddIcon /> },
        { label: 'Accommodation Booking', path: '/accommodation/booking', icon: <MeetingRoomIcon /> },
        { label: 'Poll Results', path: '/poll/results', icon: <HowToVoteIcon /> },
        { label: 'Volunteer Applications', path: '/volunteer/applications', icon: <PersonIcon /> },
      );
    }

    if (user.role === 'admin') {
      navItems.push(
        { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
        { label: 'Event Approvals', path: '/event/approvals', icon: <EventIcon /> },
        { label: 'Venue Approvals', path: '/venue/approval', icon: <MeetingRoomIcon /> },
        { label: 'Add Venue', path: '/venue/addvenue', icon: <AddIcon /> },
        { label: 'Manage Accommodation', path: '/accommodation/management', icon: <MeetingRoomIcon /> },
        { label: 'Accommodation Approval', path: '/accommodation/approvals', icon: <CheckCircleIcon /> },
      );
    }
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, rgba(225, 241, 255, 0.9), rgba(255, 237, 232, 0.9))',
          backdropFilter: 'blur(12px) saturate(120%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <Toolbar sx={{ minHeight: '48px !important' }}>  {/* Reduced toolbar height */}
        <Typography variant="h6" noWrap sx={{ 
          color: '#1A237E',
          fontWeight: 'bold',
          fontFamily: 'Roboto, sans-serif',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          fontSize: '1.1rem'  // Smaller font size
        }}>
          SRMAP Events
        </Typography>
      </Toolbar>

      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ 
          flex: 1,
          overflow: 'auto',
          '&::-webkit-scrollbar': { display: 'none' },  // Hide scrollbar
          scrollbarWidth: 'none'  // Firefox support
        }}>
          <List dense>  {/* Added dense prop to reduce spacing */}
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <ListItem
                  button
                  key={index}
                  component={Link}
                  to={item.path}
                  sx={{
                    backgroundColor: isActive ? 'rgba(26, 35, 126, 0.1)' : 'transparent',
                    borderLeft: isActive ? '4px solid #1A237E' : '4px solid transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(26, 35, 126, 0.05)',
                    },
                    py: 0.75,  // Reduced vertical padding
                    mx: 0.5,   // Reduced horizontal margin
                    borderRadius: 1,
                    minHeight: '40px'  // Smaller list items
                  }}
                >
                  <ListItemIcon sx={{ color: '#1A237E', minWidth: '36px' }}>{item.icon}</ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    sx={{ 
                      color: '#2A2A2A',
                      '& .MuiTypography-root': {
                        fontWeight: isActive ? 600 : 500,
                        fontSize: '0.875rem'  // Smaller text
                      }
                    }} 
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>

        <Box sx={{ padding: 1, mt: 'auto' }}>  {/* Reduced padding */}
          {user && (
            <List dense>  {/* Added dense prop */}
              <ListItem
                button
                onClick={async () => {
                  await logout();
                  navigate('/login');
                }}
                sx={{
                  '&:hover': { 
                    backgroundColor: 'rgba(255, 87, 87, 0.1)',
                  },
                  backgroundColor: 'transparent',
                  borderRadius: 1,
                  mx: 0.5,  // Reduced margin
                  py: 0.75  // Reduced padding
                }}
              >
                <ListItemIcon sx={{ color: '#FF5757', minWidth: '36px' }}>
                  <LogoutIcon fontSize="small" />  {/* Smaller icon */}
                </ListItemIcon>
                <ListItemText
                  primary="Logout"
                  sx={{ 
                    color: '#FF5757',
                    '& .MuiTypography-root': {
                      fontWeight: 600,
                      fontSize: '0.875rem'  // Smaller text
                    }
                  }}
                />
              </ListItem>
            </List>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
