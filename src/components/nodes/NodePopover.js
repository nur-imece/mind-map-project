import React, { useState } from 'react';
import { 
  Popover, 
  IconButton, 
  Stack, 
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Button,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  Square,
  Circle,
  Hexagon,
  BorderOuter,
  BorderAll,
  BorderStyle,
  EmojiEmotions,
  Palette,
} from '@mui/icons-material';
import { ChromePicker } from 'react-color';

const NODE_SIZES = [
  { value: 'small', label: 'Küçük', width: '100px', height: '40px' },
  { value: 'medium', label: 'Orta', width: '150px', height: '60px' },
  { value: 'large', label: 'Büyük', width: '200px', height: '80px' },
];

const NODE_SHAPES = [
  { value: '4px', label: 'Kare', icon: Square },
  { value: '12px', label: 'Yuvarlak Köşeli', icon: Square },
  { value: '50%', label: 'Daire', icon: Circle },
  { value: '50px', label: 'Oval', icon: Circle },
  { value: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)', label: 'Beşgen', icon: Hexagon },
];

const BORDER_WIDTHS = [
  { value: '1px', label: 'İnce' },
  { value: '2px', label: 'Orta' },
  { value: '3px', label: 'Kalın' },
];

const EMOJIS = [
  '😊', '❤️', '👍', '🎯', '⭐', '🔥', '💡', '📌',
  '✅', '❌', '⚡', '🎨', '🎮', '📱', '💻', '🌟'
];

const FONT_SIZES = [
  { value: 12, label: '12px' },
  { value: 14, label: '14px' },
  { value: 16, label: '16px' },
  { value: 18, label: '18px' },
  { value: 20, label: '20px' },
  { value: 24, label: '24px' },
  { value: 28, label: '28px' },
  { value: 32, label: '32px' },
];

const NodePopover = ({ 
  editAnchorEl, 
  open, 
  onClose, 
  fontStyle, 
  handleStyleChange,
  FONT_FAMILIES,
}) => {
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showNodeColorPicker, setShowNodeColorPicker] = useState(false);
  const [showBorderColorPicker, setShowBorderColorPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleFontFamilyChange = (e) => {
    const newFont = e.target.value;
    let newFontSize = fontStyle.fontSize || 14;

    // Adjust font size based on font family
    switch (newFont) {
      case 'Arial':
      case 'Helvetica':
      case 'Verdana':
        newFontSize = 14; // Standard size for sans-serif fonts
        break;
      case 'Times New Roman':
      case 'Georgia':
        newFontSize = 16; // Slightly larger for serif fonts
        break;
      case 'Indie Flower':
      case 'Comic Sans MS':
        newFontSize = 18; // Larger for decorative fonts
        break;
      case 'Impact':
        newFontSize = 16; // Adjusted for Impact's natural large appearance
        break;
      default:
        newFontSize = 14;
    }

    handleStyleChange({
      fontFamily: newFont,
      fontSize: newFontSize
    });
  };

  const handleTextColorChange = (color) => {
    handleStyleChange({ color: color.hex });
    setShowTextColorPicker(false);
  };

  const handleNodeColorChange = (color) => {
    handleStyleChange({ backgroundColor: color.hex });
    setShowNodeColorPicker(false);
  };

  const handleBorderColorChange = (color) => {
    handleStyleChange({ borderColor: color.hex });
    setShowBorderColorPicker(false);
  };

  const handleNodeSizeChange = (size) => {
    handleStyleChange({
      width: size.width,
      height: size.height,
      nodeSize: size.value
    });
  };

  const handleNodeShapeChange = (shape) => {
    if (shape.value.startsWith('polygon')) {
      handleStyleChange({
        borderRadius: '0',
        clipPath: shape.value
      });
    } else {
      handleStyleChange({
        borderRadius: shape.value,
        clipPath: 'none'
      });
    }
  };

  const handleBorderWidthChange = (width) => {
    handleStyleChange({ borderWidth: width });
  };

  const handleEmojiSelect = (emoji) => {
    handleStyleChange({ emoji: emoji });
    setShowEmojiPicker(false);
  };

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
      <Box sx={{ p: 2, width: 320 }}>
        {/* Text Formatting */}
        <Stack spacing={2}>
          <Typography variant="subtitle2" gutterBottom>
            Metin Ayarları
          </Typography>
          
          <Stack direction="row" spacing={1} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Yazı Tipi</InputLabel>
              <Select
                value={fontStyle.fontFamily || 'Arial'}
                onChange={handleFontFamilyChange}
                label="Yazı Tipi"
              >
                {FONT_FAMILIES.map((font) => (
                  <MenuItem key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 80 }}>
              <InputLabel>Boyut</InputLabel>
              <Select
                value={fontStyle.fontSize || 14}
                onChange={(e) => handleStyleChange({ fontSize: e.target.value })}
                label="Boyut"
              >
                {FONT_SIZES.map((size) => (
                  <MenuItem key={size.value} value={size.value}>
                    {size.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
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

            <Box sx={{ position: 'relative', ml: 'auto' }}>
              <IconButton
                onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: fontStyle.color || '#666',
                  '&:hover': { backgroundColor: fontStyle.color || '#666' },
                }}
              >
                <Palette sx={{ color: '#fff' }} />
              </IconButton>
              {showTextColorPicker && (
                <Box sx={{ position: 'absolute', zIndex: 2, right: 0 }}>
                  <ChromePicker
                    color={fontStyle.color || '#666'}
                    onChange={handleTextColorChange}
                  />
                </Box>
              )}
            </Box>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Node Styling */}
        <Stack spacing={2}>
          <Typography variant="subtitle2" gutterBottom>
            Kutucuk Ayarları
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" sx={{ minWidth: 80 }}>Boyut:</Typography>
            <Stack direction="row" spacing={1}>
              {NODE_SIZES.map(size => (
                <Button
                  key={size.value}
                  variant={fontStyle.nodeSize === size.value ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => handleNodeSizeChange(size)}
                >
                  {size.label}
                </Button>
              ))}
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" sx={{ minWidth: 80 }}>Şekil:</Typography>
            <Stack direction="row" spacing={1}>
              {NODE_SHAPES.map(shape => (
                <IconButton
                  key={shape.value}
                  onClick={() => handleNodeShapeChange(shape)}
                  sx={{
                    border: fontStyle.borderRadius === shape.value ? '2px solid #1976d2' : '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                >
                  <shape.icon />
                </IconButton>
              ))}
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" sx={{ minWidth: 80 }}>Kenarlık:</Typography>
            <Stack direction="row" spacing={1}>
              {BORDER_WIDTHS.map(width => (
                <Button
                  key={width.value}
                  variant={fontStyle.borderWidth === width.value ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => handleBorderWidthChange(width.value)}
                >
                  {width.label}
                </Button>
              ))}
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" sx={{ minWidth: 80 }}>Renkler:</Typography>
            <Stack direction="row" spacing={1}>
              <Box sx={{ position: 'relative' }}>
                <IconButton
                  onClick={() => setShowNodeColorPicker(!showNodeColorPicker)}
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: fontStyle.backgroundColor || '#fff',
                    '&:hover': { backgroundColor: fontStyle.backgroundColor || '#fff' },
                  }}
                >
                  <Palette sx={{ color: '#666' }} />
                </IconButton>
                {showNodeColorPicker && (
                  <Box sx={{ position: 'absolute', zIndex: 2, right: 0 }}>
                    <ChromePicker
                      color={fontStyle.backgroundColor || '#fff'}
                      onChange={handleNodeColorChange}
                    />
                  </Box>
                )}
              </Box>

              <Box sx={{ position: 'relative' }}>
                <IconButton
                  onClick={() => setShowBorderColorPicker(!showBorderColorPicker)}
                  sx={{
                    width: 32,
                    height: 32,
                    border: `2px solid ${fontStyle.borderColor || '#ddd'}`,
                  }}
                >
                  <BorderAll />
                </IconButton>
                {showBorderColorPicker && (
                  <Box sx={{ position: 'absolute', zIndex: 2, right: 0 }}>
                    <ChromePicker
                      color={fontStyle.borderColor || '#ddd'}
                      onChange={handleBorderColorChange}
                    />
                  </Box>
                )}
              </Box>
            </Stack>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Emoji Picker */}
        <Stack spacing={1}>
          <Typography variant="subtitle2" gutterBottom>
            Emoji
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {EMOJIS.map(emoji => (
              <IconButton
                key={emoji}
                size="small"
                onClick={() => handleEmojiSelect(emoji)}
                sx={{
                  border: fontStyle.emoji === emoji ? '2px solid #1976d2' : '1px solid #ddd',
                  borderRadius: '4px',
                }}
              >
                {emoji}
              </IconButton>
            ))}
          </Stack>
        </Stack>
      </Box>
    </Popover>
  );
};

export default NodePopover; 