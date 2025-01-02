import React, { memo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { 
  Typography, 
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Popover,
  Box,
  Button,
  Select,
  FormControl,
  InputLabel,
  Stack,
  ButtonGroup,
  Divider,
  TextField,
} from '@mui/material';
import { 
  Add as AddIcon, 
  TextFields, 
  Image, 
  ChatBubble,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  InsertEmoticon,
  FormatSize,
  Palette,
  CropSquare,
  Image as ImageIcon,
  Edit as EditIcon,
  ZoomOut,
  ZoomIn,
  ContentCut,
  ContentPaste,
} from '@mui/icons-material';
import NodeText from './NodeText';
import NodeButtons from './NodeButtons';
import NodeMenu from './NodeMenu';
import NodePopover from './NodePopover';
import useMindMapStore from '../../store/mindMapStore';

const FONT_SIZES = ['Auto', 'Küçük', 'Orta', 'Büyük', 'En Büyük'];
const FONT_FAMILIES = ['Indie Flower', 'Arial', 'Times New Roman', 'Courier New', 'Georgia'];

const MindMapNode = ({ data, isConnectable, id }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [editAnchorEl, setEditAnchorEl] = useState(null);
  const [showButtons, setShowButtons] = useState(false);
  const [currentDirection, setCurrentDirection] = useState('right');
  const [zoom, setZoom] = useState(1);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [fontStyle, setFontStyle] = useState(data.style || {
    bold: false,
    italic: false,
    underline: false,
    align: 'center',
    size: data.isRoot ? 16 : 14,
    shape: data.type === 'text' ? 'none' : 'rounded',
  });
  const fileInputRef = React.useRef();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(data.label);
  const [showMenu, setShowMenu] = useState(false);
  const [dynamicStyles, setDynamicStyles] = useState({
    addButton: {},
    editButton: {}
  });
  const [isSelected, setIsSelected] = useState(false);
  const [isMoveMode, setIsMoveMode] = useState(false);
  const onConnect = useMindMapStore(state => state.onConnect);
  const cutNode = useMindMapStore(state => state.cutNode);
  const cutNodeAction = useMindMapStore(state => state.cutNodeAction);
  const pasteNode = useMindMapStore(state => state.pasteNode);
  const setEdgeStyle = useMindMapStore(state => state.setEdgeStyle);
  const edges = useMindMapStore(state => state.edges);

  const handleClick = (event, direction) => {
    event.stopPropagation?.();
    console.log('Setting direction:', direction);
    setCurrentDirection(direction);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = (event) => {
    event.stopPropagation?.();
    setEditAnchorEl(event.currentTarget);
  };

  const handleEditClose = () => {
    setEditAnchorEl(null);
  };

  const handleStyleChange = (style) => {
    setFontStyle(prev => {
      const newStyle = { ...prev, ...style };
      data.onUpdateStyle && data.onUpdateStyle(newStyle);
      return newStyle;
    });
  };

  const handleAddNode = () => {
    console.log('Adding node with direction:', currentDirection);
    data.onAdd && data.onAdd(currentDirection);
    handleClose();
  };

  const handleAddText = () => {
    data.onAddText && data.onAddText(currentDirection);
    handleClose();
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
    handleClose();
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        data.onAddImage && data.onAddImage(reader.result, currentDirection);
      };
      reader.readAsDataURL(file);
    }
  };

  const getNodeStyle = () => {
    if (data.type === 'image') {
      return {
        padding: 0,
        minWidth: 'auto',
        position: 'relative',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        boxShadow: 'none',
        border: data.isCut ? '2px dashed #666' : 'none',
      };
    }

    if (data.type === 'text') {
      return {
        padding: '10px',
        minWidth: '100px',
        position: 'relative',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: data.isCut ? '2px dashed #666' : 'none',
      };
    }

    const baseStyle = {
      padding: '10px',
      minWidth: '100px',
      position: 'relative',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: data.isRoot ? '#E0E0E0' : data.color,
      color: data.isRoot ? '#333' : '#fff',
      border: data.isCut ? '2px dashed #666' : (data.isRoot ? '1px solid #ccc' : 'none'),
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      opacity: data.isCut ? 0.7 : 1,
    };

    switch (fontStyle.shape) {
      case 'square':
        return { ...baseStyle, borderRadius: '0px' };
      case 'circle':
        return { ...baseStyle, borderRadius: '50%', aspectRatio: '1' };
      default: // rounded
        return { ...baseStyle, borderRadius: '8px' };
    }
  };

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

  const shouldShowLeftButton = data.isRoot || data.direction === 'left';
  const shouldShowRightButton = data.isRoot || data.direction === 'right';

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleTextChange = (e) => {
    setEditText(e.target.value);
  };

  const handleTextBlur = () => {
    setIsEditing(false);
    if (editText !== data.label) {
      data.onUpdateLabel(editText);
    }
  };

  const handleZoom = (newZoom) => {
    setZoom(newZoom);
  };

  const handleImageSizeChange = (size) => {
    setImageSize(size);
  };

  useEffect(() => {
    const updateButtonPositions = () => {
      const imageWidth = imageSize.width * zoom;
      const imageHeight = imageSize.height * zoom;

      const dynamicStyles = {
        addButton: {
          left: `${imageWidth / 2 + 10}px`,
          top: '50%',
          transform: 'translateY(-50%)',
        },
        editButton: {
          bottom: `${imageHeight / 2 + 10}px`,
          left: '50%',
          transform: 'translateX(-50%)',
        }
      };

      setDynamicStyles(dynamicStyles);
    };

    window.addEventListener('resize', updateButtonPositions);

    // Initial call to set positions
    updateButtonPositions();

    return () => {
      window.removeEventListener('resize', updateButtonPositions);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isSelected) return;

      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsMoveMode(true);
      }

      if (isMoveMode && e.key === 'Enter') {
        e.preventDefault();
        onConnect({ source: id, target: document.activeElement.id });
        setIsMoveMode(false);
      }

      if (e.key === 'Escape') {
        setIsMoveMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelected, isMoveMode, id, onConnect]);

  const handleFocus = () => {
    setIsSelected(true);
  };

  const handleBlur = () => {
    setIsSelected(false);
  };

  const handleCutNode = () => {
    const store = useMindMapStore.getState();
    store.cutNodeAction(id);
  };

  const handlePasteNode = () => {
    const store = useMindMapStore.getState();
    store.pasteNode(id);
  };

  // Add these functions to NodeMenu component
  const handleCut = () => {
    cutNodeAction(id);
  };

  const handlePaste = () => {
    pasteNode(id);
  };

  return (
    <div 
      className="mindmap-node" 
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
      }}
      style={{ 
        position: 'relative',
        ...getNodeStyle()
      }}
      onMouseEnter={() => setShowButtons(true)}
      onMouseLeave={() => setShowButtons(false)}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="leftTarget"
        isConnectable={isConnectable}
        style={{ opacity: 0 }}
      />
      
      <NodeText
        data={data}
        fontStyle={fontStyle}
        onUpdateLabel={data.onUpdateLabel}
        onZoomChange={handleZoom}
        zoom={zoom}
      />
      
      <NodeButtons
        showButtons={showButtons}
        handleClick={handleClick}
        handleEditClick={handleEditClick}
        data={data}
        onCut={handleCut}
        onPaste={handlePaste}
        hasCutNode={Boolean(cutNode)}
        handleAddNode={handleAddNode}
        handleAddText={handleAddText}
        handleImageClick={handleImageClick}
      />

      <Handle
        type="source"
        position={Position.Left}
        id="leftSource"
        isConnectable={isConnectable}
        style={{ opacity: 0 }}
      />

      <Handle
        type="source"
        position={Position.Right}
        id="rightSource"
        isConnectable={isConnectable}
        style={{ opacity: 0 }}
      />

      <Handle
        type="target"
        position={Position.Right}
        id="rightTarget"
        isConnectable={isConnectable}
        style={{ opacity: 0 }}
      />

      <NodeMenu
        anchorEl={anchorEl}
        handleClose={handleClose}
        handleAddNode={handleAddNode}
        handleAddText={handleAddText}
        handleImageClick={handleImageClick}
        fileInputRef={fileInputRef}
        handleImageSelect={handleImageSelect}
      />

      <NodePopover
        editAnchorEl={editAnchorEl}
        open={Boolean(editAnchorEl)}
        onClose={handleEditClose}
        fontStyle={fontStyle}
        handleStyleChange={handleStyleChange}
        FONT_SIZES={FONT_SIZES}
        FONT_FAMILIES={FONT_FAMILIES}
      />

      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleImageSelect}
      />
    </div>
  );
};

export default memo(MindMapNode); 