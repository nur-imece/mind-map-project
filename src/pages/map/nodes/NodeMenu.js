import React from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { 
  Add as AddIcon,
  TextFields,
  Image as ImageIcon,
  ContentCut,
  ContentPaste,
} from '@mui/icons-material';
import useMindMapStore from '../store/mindMapStore.js';

const NodeMenu = ({ 
  anchorEl, 
  handleClose, 
  handleAddNode, 
  handleAddText, 
  handleImageClick,
  fileInputRef,
  handleImageSelect,
  onCut,
  onPaste,
  hasCutNode,
}) => {
  const cutNode = useMindMapStore(state => state.cutNode);

  const handleCutClick = () => {
    handleClose();
    onCut();
  };

  const handlePasteClick = () => {
    handleClose();
    onPaste();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'center',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'center',
        horizontal: 'center',
      }}
    >
      <MenuItem onClick={handleAddNode}>
        <ListItemIcon>
          <AddIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Yeni Dal</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleAddText}>
        <ListItemIcon>
          <TextFields fontSize="small" />
        </ListItemIcon>
        <ListItemText>Metin Ekle</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleImageClick}>
        <ListItemIcon>
          <ImageIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Resim Ekle</ListItemText>
      </MenuItem>

      <Divider />

      <MenuItem onClick={handleCutClick}>
        <ListItemIcon>
          <ContentCut fontSize="small" />
        </ListItemIcon>
        <ListItemText>Kes</ListItemText>
      </MenuItem>
      {hasCutNode && (
        <MenuItem onClick={handlePasteClick}>
          <ListItemIcon>
            <ContentPaste fontSize="small" />
          </ListItemIcon>
          <ListItemText>Yapıştır</ListItemText>
        </MenuItem>
      )}

      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleImageSelect}
      />
    </Menu>
  );
};

export default NodeMenu; 