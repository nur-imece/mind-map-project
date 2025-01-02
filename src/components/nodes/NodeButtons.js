// src/components/NodeButtons.jsx
import React, { useRef } from 'react';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { TextFields, Image as ImageIcon, ContentCut, ContentPaste } from '@mui/icons-material';

const NodeButtons = ({ 
  showButtons, 
  handleEditClick, 
  handleClick, 
  data, 
  onCut, 
  onPaste, 
  hasCutNode
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [contextMenuAnchorEl, setContextMenuAnchorEl] = React.useState(null);
  // Sağ veya sol menüye tıklandığında hangi yöne ekleneceğini tutuyor:
  const [currentDirection, setCurrentDirection] = React.useState('right');
  const fileInputRef = useRef(null);

  const handleMenuClick = (event, direction) => {
    event.stopPropagation();
    console.log('Menu clicked with direction:', direction);
    setCurrentDirection(direction);
    setAnchorEl(event.currentTarget);
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenuAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleContextMenuClose = () => {
    setContextMenuAnchorEl(null);
  };

  // Resim dosyası seçildiğinde
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Store'daki onAddImage fonksiyonunu tetikle
        data.onAddImage && data.onAddImage(reader.result, currentDirection);
        event.target.value = '';
        handleClose();
      };
      reader.readAsDataURL(file);
    }
  };

  // Menüdeki "Yeni Dal", "Metin Ekle", "Resim Ekle" tıklamaları
  const handleMenuItemClick = (type) => {
    if (type === 'node') {
      console.log('Adding node with direction:', currentDirection);
      data.onAdd && data.onAdd(currentDirection);
    } else if (type === 'text') {
      data.onAddText && data.onAddText(currentDirection);
    } else if (type === 'image') {
      fileInputRef.current.click();
    }
    handleClose();
  };

  // Sağ tık menüsündeki "Kes", "Yapıştır"
  const handleContextMenuItemClick = (type) => {
    if (type === 'cut') {
      onCut && onCut();
    } else if (type === 'paste') {
      onPaste && onPaste();
    }
    handleContextMenuClose();
  };

  // Ortak stil
  const addButtonStyle = {
    position: 'absolute',
    backgroundColor: '#fff',
    border: '2px solid ' + (data.color || '#ccc'),
    width: '20px',
    height: '20px',
    padding: 0,
    minWidth: 'unset',
    opacity: showButtons ? 1 : 0,
    transition: 'opacity 0.2s',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 10,
    '&:hover': {
      backgroundColor: '#f5f5f5',
      opacity: 1,
    }
  };

  // Sol veya sağ butonu gösterip göstermeye karar ver
  const shouldShowLeftButton = data.isRoot || data.direction === 'left';
  const shouldShowRightButton = data.isRoot || data.direction === 'right';

  return (
    <>
      {/* Düzenle butonu */}
      <IconButton
        size="small"
        onClick={handleEditClick}
        onContextMenu={handleContextMenu}
        sx={{
          position: 'absolute',
          bottom: '-16px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#666',
          backgroundColor: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          width: '20px',
          height: '20px',
          opacity: showButtons ? 1 : 0,
          transition: 'opacity 0.2s',
          zIndex: 10,
          '&:hover': {
            backgroundColor: '#f5f5f5',
          }
        }}
      >
        <EditIcon sx={{ fontSize: 14 }} />
      </IconButton>

      {/* Sağ tarafa yeni dal ekleme butonu */}
      {shouldShowRightButton && (
        <IconButton
          sx={{ 
            ...addButtonStyle, 
            right: '-12px',
          }}
          onClick={(event) => handleMenuClick(event, 'right')}
          onContextMenu={handleContextMenu}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      )}

      {/* Sol tarafa yeni dal ekleme butonu */}
      {shouldShowLeftButton && (
        <IconButton
          sx={{ 
            ...addButtonStyle, 
            left: '-12px',
          }}
          onClick={(event) => handleMenuClick(event, 'left')}
          onContextMenu={handleContextMenu}
        >
          <AddIcon fontSize="small" sx={{ transform: 'rotate(180deg)' }} />
        </IconButton>
      )}

      {/* "Yeni Dal", "Metin Ekle", "Resim Ekle" menüsü */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'center',
          horizontal: currentDirection === 'left' ? 'left' : 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: currentDirection === 'left' ? 'right' : 'left',
        }}
      >
        <MenuItem onClick={() => handleMenuItemClick('node')}>
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Yeni Dal</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuItemClick('text')}>
          <ListItemIcon>
            <TextFields fontSize="small" />
          </ListItemIcon>
          <ListItemText>Metin Ekle</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuItemClick('image')}>
          <ListItemIcon>
            <ImageIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Resim Ekle</ListItemText>
        </MenuItem>
      </Menu>

      {/* Sağ tık menüsü ("Kes", "Yapıştır") */}
      <Menu
        anchorEl={contextMenuAnchorEl}
        open={Boolean(contextMenuAnchorEl)}
        onClose={handleContextMenuClose}
      >
        <MenuItem onClick={() => handleContextMenuItemClick('cut')}>
          <ListItemIcon>
            <ContentCut fontSize="small" />
          </ListItemIcon>
          <ListItemText>Kes</ListItemText>
        </MenuItem>
        {hasCutNode && (
          <MenuItem onClick={() => handleContextMenuItemClick('paste')}>
            <ListItemIcon>
              <ContentPaste fontSize="small" />
            </ListItemIcon>
            <ListItemText>Yapıştır</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Resim seçmek için file input (gizli) */}
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleImageSelect}
      />
    </>
  );
};

export default NodeButtons;
