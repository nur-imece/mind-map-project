import React from 'react';
import { Box, Avatar, Tooltip, AvatarGroup, Typography, Badge } from '@mui/material';
import { PersonOutline } from '@mui/icons-material';

const ActiveUsers = () => {
  // Dummy kullanıcı verileri
  const dummyUsers = [
    { 
      id: 1, 
      name: 'Ahmet Yılmaz', 
      color: '#1976d2', 
      avatar: 'https://i.pravatar.cc/150?img=1',
      status: 'online'
    },
    { 
      id: 2, 
      name: 'Mehmet Demir', 
      color: '#4caf50', 
      avatar: 'https://i.pravatar.cc/150?img=2',
      status: 'online'
    },
    { 
      id: 3, 
      name: 'Ayşe Kaya', 
      color: '#f44336', 
      avatar: 'https://i.pravatar.cc/150?img=3',
      status: 'busy'
    },
    { 
      id: 4, 
      name: 'Fatma Şahin', 
      color: '#ff9800', 
      avatar: 'https://i.pravatar.cc/150?img=4',
      status: 'online'
    },
    { 
      id: 5, 
      name: 'Ali Öztürk', 
      color: '#9c27b0', 
      avatar: 'https://i.pravatar.cc/150?img=5',
      status: 'busy'
    },
    { 
      id: 6, 
      name: 'Zeynep Yıldız', 
      color: '#009688', 
      avatar: 'https://i.pravatar.cc/150?img=6',
      status: 'online'
    }
  ];

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '8px 20px',
        borderRadius: '50px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        minWidth: '300px',
        justifyContent: 'center'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonOutline sx={{ color: 'text.secondary' }} />
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            fontWeight: 500,
            minWidth: '100px'
          }}
        >
          {dummyUsers.length} Aktif Kullanıcı
        </Typography>
      </Box>
      <AvatarGroup 
        max={6}
        sx={{
          '& .MuiAvatar-root': {
            width: 32,
            height: 32,
            fontSize: '0.9rem',
            border: '2px solid #fff',
            transition: 'all 0.2s',
            cursor: 'pointer',
            '&:hover': {
              transform: 'scale(1.1) translateY(-2px)',
              zIndex: 1,
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }
          }
        }}
      >
        {dummyUsers.map((user) => (
          <Tooltip 
            key={user.id} 
            title={
              <Box sx={{ p: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {user.status === 'online' ? 'Çevrimiçi' : 'Meşgul'}
                </Typography>
              </Box>
            }
            arrow
            placement="bottom"
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant="dot"
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: user.status === 'online' ? '#44b700' : '#ffa000',
                  color: user.status === 'online' ? '#44b700' : '#ffa000',
                  boxShadow: `0 0 0 2px #fff`,
                  '&::after': {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    animation: user.status === 'online' ? 'ripple 1.2s infinite ease-in-out' : 'none',
                    border: '1px solid currentColor',
                    content: '""',
                  },
                },
                '@keyframes ripple': {
                  '0%': {
                    transform: 'scale(.8)',
                    opacity: 1,
                  },
                  '100%': {
                    transform: 'scale(2.4)',
                    opacity: 0,
                  },
                },
              }}
            >
              <Avatar
                alt={user.name}
                src={user.avatar}
                sx={{
                  backgroundColor: user.color || '#1976d2',
                }}
              >
                {user.name.split(' ').map(n => n[0]).join('')}
              </Avatar>
            </Badge>
          </Tooltip>
        ))}
      </AvatarGroup>
    </Box>
  );
};

export default ActiveUsers; 