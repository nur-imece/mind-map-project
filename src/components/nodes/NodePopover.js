import React from 'react';
import { 
  Popover, 
  IconButton, 
  Stack, 
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatSize,
  CropSquare,
} from '@mui/icons-material';

const NodePopover = ({ 
  editAnchorEl, 
  open, 
  onClose, 
  fontStyle, 
  handleStyleChange,
  FONT_SIZES,
  FONT_FAMILIES,
}) => {
  return (
    <Popover
      open={open}
      anchorEl={editAnchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ p: 2 }}
        divider={<Divider orientation="vertical" flexItem />}
      >
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            onClick={() => handleStyleChange({ bold: !fontStyle.bold })}
            color={fontStyle.bold ? 'primary' : 'default'}
          >
            <FormatBold />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleStyleChange({ italic: !fontStyle.italic })}
            color={fontStyle.italic ? 'primary' : 'default'}
          >
            <FormatItalic />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleStyleChange({ underline: !fontStyle.underline })}
            color={fontStyle.underline ? 'primary' : 'default'}
          >
            <FormatUnderlined />
          </IconButton>
        </Stack>

        <Stack direction="row" spacing={1}>
          <FormControl size="small" sx={{ minWidth: 80 }}>
            <InputLabel>Boyut</InputLabel>
            <Select
              value={fontStyle.size || 'Auto'}
              onChange={(e) => handleStyleChange({ size: e.target.value })}
              label="Boyut"
            >
              {FONT_SIZES.map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Yazı Tipi</InputLabel>
            <Select
              value={fontStyle.fontFamily || 'Arial'}
              onChange={(e) => handleStyleChange({ fontFamily: e.target.value })}
              label="Yazı Tipi"
            >
              {FONT_FAMILIES.map((font) => (
                <MenuItem key={font} value={font}>
                  {font}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            onClick={() => handleStyleChange({ shape: fontStyle.shape === 'square' ? 'rounded' : 'square' })}
            color={fontStyle.shape === 'square' ? 'primary' : 'default'}
          >
            <CropSquare />
          </IconButton>
        </Stack>
      </Stack>
    </Popover>
  );
};

export default NodePopover; 