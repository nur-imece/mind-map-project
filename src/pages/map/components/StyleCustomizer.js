import React, { useState } from 'react';
import {
  Popover,
  Box,
  Select,
  MenuItem,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Stack,
  Typography,
  Button,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  Square,
  Circle,
  Hexagon,
  BorderOuter,
  BorderAll,
  BorderStyle,
  EmojiEmotions,
} from '@mui/icons-material';
import { ChromePicker } from 'react-color';

const FONT_FAMILIES = [
  'Arial',
  'Times New Roman',
  'Helvetica',
  'Courier New',
  'Georgia',
  'Verdana',
  'Impact'
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

const StyleCustomizer = ({ open, anchorEl, onClose, onStyleChange, initialStyle }) => {
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showNodeColorPicker, setShowNodeColorPicker] = useState(false);
  const [showBorderColorPicker, setShowBorderColorPicker] = useState(false);
  const [currentStyle, setCurrentStyle] = useState(initialStyle || {});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleStyleChange = (changes) => {
    const newStyle = { ...currentStyle, ...changes };
    setCurrentStyle(newStyle);
    onStyleChange(newStyle);
  };

  const handleFontFamilyChange = (event) => {
    handleStyleChange({ fontFamily: event.target.value });
  };

  const handleFontSizeChange = (event) => {
    handleStyleChange({ fontSize: event.target.value });
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

  const handleBoldClick = () => {
    handleStyleChange({ bold: !currentStyle.bold });
  };

  const handleItalicClick = () => {
    handleStyleChange({ italic: !currentStyle.italic });
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
          anchorEl={anchorEl}
          onClose={onClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
      >
        <Box sx={{ p: 2, width: 320 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Yazı Tipi</InputLabel>
              <Select
                  value={currentStyle.fontFamily || 'Arial'}
                  onChange={handleFontFamilyChange}
                  label="Yazı Tipi"
              >
                {FONT_FAMILIES.map(font => (
                    <MenuItem key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 80 }}>
              <InputLabel>Boyut</InputLabel>
              <Select
                  value={currentStyle.fontSize || 14}
                  onChange={handleFontSizeChange}
                  label="Boyut"
              >
                {FONT_SIZES.map(size => (
                    <MenuItem key={size.value} value={size.value}>
                      {size.label}
                    </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ position: 'relative', ml: 'auto' }}>
              <IconButton
                  onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: currentStyle.color || '#000',
                    '&:hover': { backgroundColor: currentStyle.color || '#000' },
                  }}
              />
              {showTextColorPicker && (
                  <Box sx={{ position: 'absolute', zIndex: 2, right: 0 }}>
                    <ChromePicker
                        color={currentStyle.color || '#000'}
                        onChange={handleTextColorChange}
                    />
                  </Box>
              )}
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} mb={2}>
            <IconButton
                onClick={handleBoldClick}
                color={currentStyle.bold ? 'primary' : 'default'}
            >
              <FormatBold />
            </IconButton>
            <IconButton
                onClick={handleItalicClick}
                color={currentStyle.italic ? 'primary' : 'default'}
            >
              <FormatItalic />
            </IconButton>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            Kutucuk Ayarları
          </Typography>

          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="caption" sx={{ minWidth: 80 }}>Boyut:</Typography>
              <Stack direction="row" spacing={1}>
                {NODE_SIZES.map(size => (
                    <IconButton
                        key={size.value}
                        onClick={() => handleNodeSizeChange(size)}
                        sx={{
                          border: currentStyle.nodeSize === size.value ? '2px solid #1976d2' : '1px solid #ddd',
                          borderRadius: '4px',
                          p: 1,
                        }}
                    >
                      <Box
                          sx={{
                            width: size.value === 'small' ? 30 : size.value === 'medium' ? 40 : 50,
                            height: size.value === 'small' ? 15 : size.value === 'medium' ? 20 : 25,
                            border: '1px solid #666',
                            borderRadius: '4px',
                          }}
                      />
                    </IconButton>
                ))}
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="caption" sx={{ minWidth: 80 }}>Şekil:</Typography>
              <Stack direction="row" spacing={1}>
                {NODE_SHAPES.map(shape => {
                  const Icon = shape.icon;
                  return (
                      <IconButton
                          key={shape.value}
                          onClick={() => handleNodeShapeChange(shape)}
                          sx={{
                            border: currentStyle.borderRadius === shape.value || currentStyle.clipPath === shape.value
                                ? '2px solid #1976d2'
                                : '1px solid #ddd',
                            borderRadius: '4px',
                          }}
                      >
                        <Icon />
                      </IconButton>
                  );
                })}
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="caption" sx={{ minWidth: 80 }}>Renkler:</Typography>
              <Box sx={{ position: 'relative' }}>
                <IconButton
                    onClick={() => setShowNodeColorPicker(!showNodeColorPicker)}
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: currentStyle.backgroundColor || '#fff',
                      '&:hover': { backgroundColor: currentStyle.backgroundColor || '#fff' },
                    }}
                />
                {showNodeColorPicker && (
                    <Box sx={{ position: 'absolute', zIndex: 2 }}>
                      <ChromePicker
                          color={currentStyle.backgroundColor || '#fff'}
                          onChange={handleNodeColorChange}
                      />
                    </Box>
                )}
              </Box>

              <Stack direction="row" spacing={1}>
                {BORDER_WIDTHS.map(width => (
                    <IconButton
                        key={width.value}
                        onClick={() => handleBorderWidthChange(width.value)}
                        sx={{
                          border: currentStyle.borderWidth === width.value
                              ? '2px solid #1976d2'
                              : '1px solid #ddd',
                          borderRadius: '4px',
                        }}
                    >
                      <BorderAll sx={{ fontSize: width.value === '3px' ? 24 : 20 }} />
                    </IconButton>
                ))}
              </Stack>

              <Box sx={{ position: 'relative' }}>
                <IconButton
                    onClick={() => setShowBorderColorPicker(!showBorderColorPicker)}
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: currentStyle.borderColor || '#000',
                      '&:hover': { backgroundColor: currentStyle.borderColor || '#000' },
                    }}
                />
                {showBorderColorPicker && (
                    <Box sx={{ position: 'absolute', zIndex: 2 }}>
                      <ChromePicker
                          color={currentStyle.borderColor || '#000'}
                          onChange={handleBorderColorChange}
                      />
                    </Box>
                )}
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="caption" sx={{ minWidth: 80 }}>Emoji:</Typography>
              <Box sx={{ position: 'relative' }}>
                <IconButton
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    sx={{ border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <EmojiEmotions />
                </IconButton>
                {showEmojiPicker && (
                    <Box sx={{
                      position: 'absolute',
                      zIndex: 2,
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      p: 1,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(8, 1fr)',
                      gap: 0.5,
                    }}>
                      {EMOJIS.map((emoji, index) => (
                          <Button
                              key={index}
                              onClick={() => handleEmojiSelect(emoji)}
                              sx={{
                                minWidth: 'unset',
                                p: 0.5,
                                fontSize: '1.2rem',
                                '&:hover': { backgroundColor: '#f5f5f5' }
                              }}
                          >
                            {emoji}
                          </Button>
                      ))}
                    </Box>
                )}
              </Box>
            </Stack>
          </Stack>
        </Box>
      </Popover>
  );
};

export default StyleCustomizer;
