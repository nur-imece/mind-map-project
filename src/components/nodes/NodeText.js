import React, { useState, useRef } from 'react';
import { Box, IconButton } from '@mui/material';
import { ZoomIn, ZoomOut } from '@mui/icons-material';

const NodeText = ({ data, fontStyle, onUpdateLabel }) => {
  const [localZoom, setLocalZoom] = useState(1);
  const imageRef = useRef(null);

  const handleZoomIn = () => {
    setLocalZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setLocalZoom(prev => Math.max(prev - 0.2, 0.2));
  };

  if (data.type === 'image' && data.label) {
    return (
      <Box
        sx={{ 
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100px',
          width: '100%',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <Box
            sx={{
              transform: `scale(${localZoom})`,
              transition: 'transform 0.2s ease-in-out',
              transformOrigin: 'center center',
            }}
          >
            <img 
              ref={imageRef}
              src={data.label} 
              alt="Node content"
              style={{
                maxWidth: '200px',
                maxHeight: '200px',
                objectFit: 'contain',
              }}
            />
          </Box>
          <Box
            sx={{
              position: 'absolute',
              bottom: '-30px',
              display: 'flex',
              gap: 1,
            }}
          >
            <IconButton
              size="small"
              onClick={handleZoomOut}
              sx={{ 
                bgcolor: 'white',
                boxShadow: 1,
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
            >
              <ZoomOut fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleZoomIn}
              sx={{ 
                bgcolor: 'white',
                boxShadow: 1,
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
            >
              <ZoomIn fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <div
      style={{
        fontWeight: fontStyle.bold ? 'bold' : 'normal',
        fontStyle: fontStyle.italic ? 'italic' : 'normal',
        textDecoration: fontStyle.underline ? 'underline' : 'none',
        textAlign: fontStyle.align || 'center',
        fontSize: fontStyle.size || 14,
        fontFamily: fontStyle.fontFamily || 'inherit',
        color: fontStyle.color || '#666',
      }}
    >
      {data.label}
    </div>
  );
};

export default NodeText; 