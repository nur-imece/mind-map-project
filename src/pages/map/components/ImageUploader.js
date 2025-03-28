import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Typography,
} from '@mui/material';
import { CloudUpload, Delete } from '@mui/icons-material';

const ImageUploader = ({ open, onClose, onSave }) => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (preview) {
      onSave(preview);
      handleClose();
    }
  };

  const handleClose = () => {
    setImage(null);
    setPreview('');
    onClose();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Resim Yükle</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            p: 2,
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: 200,
              border: '2px dashed #ccc',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
              },
              position: 'relative',
              overflow: 'hidden',
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('image-input').click()}
          >
            {preview ? (
              <>
                <img
                  src={preview}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                />
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'background.paper',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreview('');
                    setImage(null);
                  }}
                >
                  <Delete />
                </IconButton>
              </>
            ) : (
              <>
                <CloudUpload sx={{ fontSize: 48, color: 'text.secondary' }} />
                <Typography variant="body1" color="text.secondary" mt={1}>
                  Resim yüklemek için tıklayın veya sürükleyin
                </Typography>
              </>
            )}
          </Box>
          <input
            type="file"
            id="image-input"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>İptal</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!preview}
        >
          Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageUploader; 