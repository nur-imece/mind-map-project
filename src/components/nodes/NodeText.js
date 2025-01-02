import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, TextField } from '@mui/material';
import { ZoomIn, ZoomOut } from '@mui/icons-material';

const NodeText = ({ data, fontStyle, onUpdateLabel, onZoomChange, zoom }) => {
  const [localZoom, setLocalZoom] = useState(1);
  const imageRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(data.label || '');
  const textInputRef = useRef(null);
  const containerRef = useRef(null);

  const handleZoomIn = () => {
    setLocalZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setLocalZoom(prev => Math.max(prev - 0.2, 0.2));
  };

  const handleDoubleClick = (event) => {
    event.stopPropagation();
    setIsEditing(true);
    setEditText(data.label || '');
  };

  const handleTextChange = (event) => {
    setEditText(event.target.value);
  };

  const handleTextBlur = () => {
    setIsEditing(false);
    if (editText !== data.label) {
      onUpdateLabel(editText);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleTextBlur();
    }
    if (event.key === 'Escape') {
      setIsEditing(false);
      setEditText(data.label || '');
    }
  };

  useEffect(() => {
    if (isEditing && textInputRef.current) {
      textInputRef.current.focus();
      // Cursor'ı metnin sonuna konumlandır
      textInputRef.current.setSelectionRange(
        editText.length,
        editText.length
      );
    }
  }, [isEditing, editText]);

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

  const commonStyles = {
    fontWeight: fontStyle.bold ? 'bold' : 'normal',
    fontStyle: fontStyle.italic ? 'italic' : 'normal',
    textDecoration: fontStyle.underline ? 'underline' : 'none',
    textAlign: fontStyle.align || 'center',
    fontSize: fontStyle.fontSize || 14,
    fontFamily: fontStyle.fontFamily || 'inherit',
    color: fontStyle.color || '#666',
    width: '100%',
    height: '100%',
    padding: '10px',
    margin: 0,
    boxSizing: 'border-box',
    overflow: 'hidden',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    minHeight: 'inherit',
    lineHeight: 'normal',
  };

  return (
    <div
      ref={containerRef}
      onDoubleClick={handleDoubleClick}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        minHeight: 'inherit',
      }}
    >
      {isEditing ? (
        <TextField
          inputRef={textInputRef}
          value={editText}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          onKeyDown={handleKeyDown}
          multiline
          variant="standard"
          autoFocus
          InputProps={{
            style: {
              ...commonStyles,
              resize: 'none',
              background: 'transparent',
              minHeight: 'inherit',
              width: containerRef.current ? containerRef.current.offsetWidth : '100%',
              maxWidth: containerRef.current ? containerRef.current.offsetWidth : '100%',
            }
          }}
          sx={{
            width: containerRef.current ? containerRef.current.offsetWidth : '100%',
            maxWidth: containerRef.current ? containerRef.current.offsetWidth : '100%',
            height: '100%',
            minHeight: 'inherit',
            '& .MuiInput-root': {
              height: '100%',
              minHeight: 'inherit',
              display: 'flex',
              alignItems: 'center',
              textAlign: 'center',
              width: '100%',
              maxWidth: '100%',
            },
            '& .MuiInputBase-input': {
              height: '100% !important',
              minHeight: 'inherit !important',
              textAlign: 'center',
              padding: '0 !important',
              width: '100% !important',
              maxWidth: '100% !important',
            },
            '& .MuiInput-root:before, & .MuiInput-root:after': {
              display: 'none',
            }
          }}
        />
      ) : (
        <div
          style={{
            ...commonStyles,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'inherit',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          {fontStyle.emoji && (
            <span style={{ fontSize: Math.max((fontStyle.fontSize || 14) * 1.2, 20) }}>
              {fontStyle.emoji}
            </span>
          )}
          <span>{data.label}</span>
        </div>
      )}
    </div>
  );
};

export default NodeText; 