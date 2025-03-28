import React, { useState, useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogActions, 
  Button,
  TextField,
  IconButton,
  Stack,
  Tooltip
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatColorText,
  FormatSize
} from '@mui/icons-material';

const TextEditor = ({ open, onClose, initialText, onSave }) => {
  const [text, setText] = useState(initialText);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const textFieldRef = useRef(null);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  const handleFormat = (format) => {
    const input = textFieldRef.current.querySelector('textarea');
    const start = input.selectionStart;
    const end = input.selectionEnd;
    
    let newText = text;
    switch(format) {
      case 'bold':
        newText = text.slice(0, start) + '**' + text.slice(start, end) + '**' + text.slice(end);
        break;
      case 'italic':
        newText = text.slice(0, start) + '_' + text.slice(start, end) + '_' + text.slice(end);
        break;
      case 'underline':
        newText = text.slice(0, start) + '__' + text.slice(start, end) + '__' + text.slice(end);
        break;
      case 'color':
        newText = text.slice(0, start) + '{color:red}' + text.slice(start, end) + '{color}' + text.slice(end);
        break;
      case 'size':
        newText = text.slice(0, start) + '{size:large}' + text.slice(start, end) + '{size}' + text.slice(end);
        break;
      default:
        break;
    }
    setText(newText);
  };

  const handleSave = () => {
    onSave(text);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Kalın">
              <IconButton onClick={() => handleFormat('bold')}>
                <FormatBold />
              </IconButton>
            </Tooltip>
            <Tooltip title="İtalik">
              <IconButton onClick={() => handleFormat('italic')}>
                <FormatItalic />
              </IconButton>
            </Tooltip>
            <Tooltip title="Altı Çizili">
              <IconButton onClick={() => handleFormat('underline')}>
                <FormatUnderlined />
              </IconButton>
            </Tooltip>
            <Tooltip title="Renk">
              <IconButton onClick={() => handleFormat('color')}>
                <FormatColorText />
              </IconButton>
            </Tooltip>
            <Tooltip title="Boyut">
              <IconButton onClick={() => handleFormat('size')}>
                <FormatSize />
              </IconButton>
            </Tooltip>
          </Stack>
          <TextField
            ref={textFieldRef}
            multiline
            rows={4}
            fullWidth
            value={text}
            onChange={(e) => setText(e.target.value)}
            variant="outlined"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button onClick={handleSave} variant="contained">Kaydet</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TextEditor; 