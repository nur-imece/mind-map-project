import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Image as ImageIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Wallpaper as WallpaperIcon,
} from '@mui/icons-material';

const predefinedBackgrounds = [
  { name: 'Arkaplan 1', url: '/backgrounds/background-image1.png' },
  { name: 'Arkaplan 2', url: '/backgrounds/background-image2.png' },
  { name: 'Arkaplan 3', url: '/backgrounds/background-image3.png' },
  { name: 'Arkaplan 4', url: '/backgrounds/background-image4.png' },
  { name: 'Arkaplan 5', url: '/backgrounds/background-image5.png' },
  { name: 'Arkaplan 6', url: '/backgrounds/background-image6.png' },
  { name: 'Arkaplan 7', url: '/backgrounds/background-image7.png' },
  { name: 'Arkaplan 8', url: '/backgrounds/background-image8.png' },
  { name: 'Arkaplan 9', url: '/backgrounds/background-image9.png' },
  { name: 'Arkaplan 10', url: '/backgrounds/background-image.png' },
  { name: 'Arkaplan 11', url: '/backgrounds/background-image11.png' },
  { name: 'Arkaplan 12', url: '/backgrounds/background-image12.png' },
  { name: 'Arkaplan 13', url: '/backgrounds/background-image13.png' },
  { name: 'Arkaplan 14', url: '/backgrounds/background-image14.png' },
  { name: 'Arkaplan 15', url: '/backgrounds/background-image15.png' },
  { name: 'Arkaplan 16', url: '/backgrounds/background-image16.png' },
];

const BackgroundImagePicker = ({ onBackgroundChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const fileInputRef = useRef(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleImageSelect = (url) => {
    onBackgroundChange(url);
    handleClose();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onBackgroundChange(reader.result);
        handleClose();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = () => {
    onBackgroundChange(null);
    handleClose();
  };

  return (
    <Box sx={{ 
      backgroundColor: 'white',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '10px',
        maxHeight: '400px',
        overflowY: 'auto',
      }}>
        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={() => fileInputRef.current.click()}
          fullWidth
          sx={{ marginBottom: '10px' }}
        >
          Resim Yükle
        </Button>

        <Button
          variant="outlined"
          startIcon={<DeleteIcon />}
          onClick={handleRemoveBackground}
          fullWidth
          sx={{ marginBottom: '10px' }}
        >
          Arkaplanı Kaldır
        </Button>

        {predefinedBackgrounds.map((bg) => (
          <Button
            key={bg.name}
            variant="outlined"
            startIcon={<ImageIcon />}
            onClick={() => handleImageSelect(bg.url)}
            fullWidth
          >
            {bg.name}
          </Button>
        ))}
      </div>

      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
    </Box>
  );
};

export default BackgroundImagePicker; 