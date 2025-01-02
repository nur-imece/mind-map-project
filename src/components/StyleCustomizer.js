import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material';
import { ColorLens } from '@mui/icons-material';
import { HexColorPicker } from 'react-colorful';

const EDGE_TYPES = {
  default: 'Düz',
  step: 'Basamaklı',
  smoothstep: 'Yumuşak Basamaklı',
  straight: 'Direkt',
};

const StyleCustomizer = ({
  selectedNode,
  selectedEdge,
  onNodeStyleChange,
  onEdgeStyleChange,
  onGlobalStyleChange,
}) => {
  const [colorPickerOpen, setColorPickerOpen] = React.useState(false);
  const [colorTarget, setColorTarget] = React.useState(null);

  const handleColorChange = (color) => {
    switch (colorTarget) {
      case 'node':
        onNodeStyleChange({ backgroundColor: color });
        break;
      case 'edge':
        onEdgeStyleChange({ stroke: color });
        break;
      case 'text':
        onNodeStyleChange({ color: color });
        break;
      default:
        break;
    }
  };

  return (
    <Paper
      sx={{
        p: 2,
        width: 300,
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1000,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Stil Ayarları
      </Typography>

      <Stack spacing={2}>
        {/* Node Stilleri */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Node Stilleri
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Arkaplan Rengi">
              <IconButton
                onClick={() => {
                  setColorTarget('node');
                  setColorPickerOpen(true);
                }}
              >
                <ColorLens />
              </IconButton>
            </Tooltip>
            <Tooltip title="Yazı Rengi">
              <IconButton
                onClick={() => {
                  setColorTarget('text');
                  setColorPickerOpen(true);
                }}
              >
                <ColorLens sx={{ color: '#666' }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Bağlantı Stilleri */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Bağlantı Stilleri
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Bağlantı Tipi</InputLabel>
            <Select
              value={selectedEdge?.type || 'smoothstep'}
              onChange={(e) => onEdgeStyleChange({ type: e.target.value })}
            >
              {Object.entries(EDGE_TYPES).map(([type, label]) => (
                <MenuItem key={type} value={type}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Çizgi Kalınlığı
            </Typography>
            <Slider
              size="small"
              min={1}
              max={5}
              step={0.5}
              valueLabelDisplay="auto"
              value={selectedEdge?.style?.strokeWidth || 2}
              onChange={(_, value) =>
                onEdgeStyleChange({ strokeWidth: value })
              }
            />
          </Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
            <Tooltip title="Çizgi Rengi">
              <IconButton
                onClick={() => {
                  setColorTarget('edge');
                  setColorPickerOpen(true);
                }}
              >
                <ColorLens />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Genel Ayarlar */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Genel Ayarlar
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" gutterBottom>
              Boşluk
            </Typography>
            <Slider
              size="small"
              min={50}
              max={300}
              step={10}
              valueLabelDisplay="auto"
              defaultValue={200}
              onChange={(_, value) =>
                onGlobalStyleChange({ nodeSpacing: value })
              }
            />
          </Box>
        </Box>
      </Stack>

      {/* Renk Seçici */}
      {colorPickerOpen && (
        <Box
          sx={{
            position: 'absolute',
            top: '100%',
            right: 0,
            mt: 1,
            p: 1,
            bgcolor: 'background.paper',
            boxShadow: 3,
            borderRadius: 1,
          }}
        >
          <HexColorPicker onChange={handleColorChange} />
        </Box>
      )}
    </Paper>
  );
};

export default StyleCustomizer; 