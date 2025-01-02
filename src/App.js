import React, { useCallback, useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { 
  Box, 
  IconButton, 
  Tooltip, 
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
} from '@mui/material';
import ReactFlow, { 
  Background,
  Controls,
  MiniMap,
  ConnectionMode,
  Panel,
} from 'reactflow';
import { 
  Slideshow as SlideshowIcon,
  Wallpaper as WallpaperIcon,
  SaveAlt as SaveAltIcon,
} from '@mui/icons-material';
import 'reactflow/dist/style.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import MindMapNode from './components/nodes/MindMapNode';
import useMindMapStore from './store/mindMapStore';
import PresentationMode from './components/PresentationMode';
import ImageUploader from './components/ImageUploader';
import ActiveUsers from './components/ActiveUsers';
import useCollaborationStore from './store/collaborationStore';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    }
  },
  components: {
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: 4,
        },
      },
    },
  },
  typography: {
    fontFamily: "'Segoe UI', 'Roboto', sans-serif",
  },
});

const nodeTypes = {
  mindMap: MindMapNode,
};

const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: true,
  style: { 
    strokeWidth: 2,
    stroke: '#90caf9',
    strokeDasharray: '0',
  },
};

const minimapStyle = {
  backgroundColor: '#f5f5f5',
  maskColor: '#f5f5f550',
};

function App() {
  const {
    nodes,
    edges,
    addNode,
    updateNodePosition,
    updateNodeStyle,
    setEdgeStyle
  } = useMindMapStore();

  const [presentationMode, setPresentationMode] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [bgColor, setBgColor] = useState('#ffffff');

  const backgroundColors = [
    { id: 1, name: 'Beyaz', color: '#ffffff' },
    { id: 2, name: 'Açık Mavi', color: '#e3f2fd' },
    { id: 3, name: 'Açık Yeşil', color: '#e8f5e9' },
    { id: 4, name: 'Açık Pembe', color: '#fce4ec' },
    { id: 5, name: 'Açık Mor', color: '#f3e5f5' },
    { id: 6, name: 'Açık Sarı', color: '#fffde7' },
    { id: 7, name: 'Açık Gri', color: '#f5f5f5' },
  ];

  const handleBackgroundChange = () => {
    const colors = ['#e3f2fd', '#e8f5e9', '#fce4ec', '#f3e5f5', '#fffde7', '#f5f5f5'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setBgColor(randomColor);
  };

  const onNodesChange = useCallback((changes) => {
    changes.forEach(change => {
      if (change.type === 'position' && change.position) {
        updateNodePosition(change.id, change.position);
      }
    });
  }, [updateNodePosition]);

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
  }, []);

  React.useEffect(() => {
    if (nodes.length === 0) {
      addNode(null, 'Ana Fikir');
    }
  }, [addNode, nodes.length]);

  const { initializeConnection, activeUsers } = useCollaborationStore();

  // Dummy kullanıcı verileri
  const dummyUsers = [
    { 
      id: 1, 
      name: 'Ahmet Yılmaz', 
      color: '#1976d2', 
      avatar: 'https://i.pravatar.cc/150?img=1',
      status: 'online'
    },
    { 
      id: 2, 
      name: 'Mehmet Demir', 
      color: '#4caf50', 
      avatar: 'https://i.pravatar.cc/150?img=2',
      status: 'online'
    },
    { 
      id: 3, 
      name: 'Ayşe Kaya', 
      color: '#f44336', 
      avatar: 'https://i.pravatar.cc/150?img=3',
      status: 'busy'
    },
    { 
      id: 4, 
      name: 'Fatma Şahin', 
      color: '#ff9800', 
      avatar: 'https://i.pravatar.cc/150?img=4',
      status: 'online'
    },
    { 
      id: 5, 
      name: 'Ali Öztürk', 
      color: '#9c27b0', 
      avatar: 'https://i.pravatar.cc/150?img=5',
      status: 'busy'
    },
    { 
      id: 6, 
      name: 'Zeynep Yıldız', 
      color: '#009688', 
      avatar: 'https://i.pravatar.cc/150?img=6',
      status: 'online'
    }
  ];

  useEffect(() => {
    const userId = "user-" + Math.random().toString(36).substr(2, 9);
    const userName = "Test User";
    const mindMapId = "mindmap-1";

    initializeConnection(userId, userName, mindMapId);

    // Dummy kullanıcıları ekle
    useCollaborationStore.setState({ activeUsers: dummyUsers });

    return () => {
      useCollaborationStore.getState().disconnect();
    };
  }, []);

  // Export settings state
  const [exportSettings, setExportSettings] = useState({
    format: 'A4',
    orientation: 'landscape',
    scale: 1,
    quality: 2,
    showExportDialog: false
  });

  // Function to handle mind map export
  const handleExport = async (format) => {
    try {
      const flowElement = document.querySelector('.react-flow');
      if (!flowElement) return;

      // Hide UI elements before capture
      const uiElements = flowElement.querySelectorAll('.react-flow__panel, .react-flow__controls, .react-flow__minimap');
      uiElements.forEach(el => {
        el.style.display = 'none';
      });

      // Get paper dimensions in pixels (assuming 96 DPI)
      const paperSizes = {
        'A4': { width: 297, height: 210 }, // mm
        'A3': { width: 420, height: 297 }, // mm
        'A5': { width: 210, height: 148 }  // mm
      };

      const mmToPx = 3.7795275591; // 1mm = 3.7795275591 pixels at 96 DPI
      const { width: paperWidth, height: paperHeight } = paperSizes[exportSettings.format];
      const isLandscape = exportSettings.orientation === 'landscape';
      
      const exportWidth = (isLandscape ? paperWidth : paperHeight) * mmToPx;
      const exportHeight = (isLandscape ? paperHeight : paperWidth) * mmToPx;

      // Create canvas with proper dimensions
      const canvas = await html2canvas(flowElement, {
        width: flowElement.offsetWidth,
        height: flowElement.offsetHeight,
        scale: exportSettings.quality,
        useCORS: true,
        logging: false,
        backgroundColor: bgColor,
        ignoreElements: (element) => {
          return element.classList.contains('react-flow__panel') ||
                 element.classList.contains('react-flow__controls') ||
                 element.classList.contains('react-flow__minimap');
        }
      });

      // Show UI elements after capture
      uiElements.forEach(el => {
        el.style.display = '';
      });

      if (format === 'png') {
        // Export as PNG
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'mindmap.png';
        link.href = dataUrl;
        link.click();
      } else if (format === 'pdf') {
        // Export as PDF
        const pdf = new jsPDF({
          orientation: exportSettings.orientation,
          unit: 'mm',
          format: exportSettings.format
        });

        // Calculate scaling to fit the content
        const canvasAspectRatio = canvas.width / canvas.height;
        const pageAspectRatio = exportWidth / exportHeight;
        
        let scaleFactor;
        if (canvasAspectRatio > pageAspectRatio) {
          scaleFactor = exportWidth / canvas.width;
        } else {
          scaleFactor = exportHeight / canvas.height;
        }

        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, 
          canvas.width * scaleFactor / mmToPx, 
          canvas.height * scaleFactor / mmToPx);
        pdf.save('mindmap.pdf');
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Dışa aktarma sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Export dialog component
  const ExportDialog = () => (
    <Dialog 
      open={exportSettings.showExportDialog} 
      onClose={() => setExportSettings(prev => ({ ...prev, showExportDialog: false }))}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Dışa Aktarma Ayarları</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Kağıt Boyutu</InputLabel>
            <Select
              value={exportSettings.format}
              onChange={(e) => setExportSettings(prev => ({ ...prev, format: e.target.value }))}
              label="Kağıt Boyutu"
            >
              <MenuItem value="A3">A3</MenuItem>
              <MenuItem value="A4">A4</MenuItem>
              <MenuItem value="A5">A5</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Yönlendirme</InputLabel>
            <Select
              value={exportSettings.orientation}
              onChange={(e) => setExportSettings(prev => ({ ...prev, orientation: e.target.value }))}
              label="Yönlendirme"
            >
              <MenuItem value="landscape">Yatay</MenuItem>
              <MenuItem value="portrait">Dikey</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Kalite</InputLabel>
            <Select
              value={exportSettings.quality}
              onChange={(e) => setExportSettings(prev => ({ ...prev, quality: Number(e.target.value) }))}
              label="Kalite"
            >
              <MenuItem value={1}>Normal</MenuItem>
              <MenuItem value={2}>Yüksek</MenuItem>
              <MenuItem value={3}>En Yüksek</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => handleExport('pdf')}
            >
              PDF olarak kaydet
            </Button>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={() => handleExport('png')}
            >
              PNG olarak kaydet
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );

  const onEdgeClick = useCallback((event, edge) => {
    // Mevcut stili kontrol et ve bir sonraki stile geç
    let newDashArray;
    if (!edge.style?.strokeDasharray || edge.style.strokeDasharray === '0') {
      newDashArray = '5,5'; // kesikli çizgi
    } else if (edge.style.strokeDasharray === '5,5') {
      newDashArray = '2,2'; // noktalı çizgi
    } else {
      newDashArray = '0'; // düz çizgi
    }
    
    setEdgeStyle(edge.id, { 
      ...edge.style,
      strokeDasharray: newDashArray 
    });
  }, [setEdgeStyle]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ width: '100vw', height: '100vh', position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          connectionMode={ConnectionMode.Loose}
          fitView
          minZoom={0.1}
          maxZoom={1.5}
          snapToGrid={true}
          snapGrid={[15, 15]}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          selectNodesOnDrag={false}
          style={{
            background: bgColor
          }}
        >
          <Background 
            color="#000000"
            gap={16} 
            size={1}
            style={{ opacity: 0.1 }}
          />
          
          {/* Sol üst köşedeki arkaplan değiştirme menüsü */}
          <Panel position="top-left" style={{ margin: '10px' }}>
            <FormControl 
              variant="outlined" 
              size="small" 
              sx={{
                bgcolor: 'white',
                borderRadius: 1,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                minWidth: 180,
              }}
            >
              <InputLabel id="background-select-label">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WallpaperIcon fontSize="small" />
                  Arkaplan Seç
                </Box>
              </InputLabel>
              <Select
                labelId="background-select-label"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WallpaperIcon fontSize="small" />
                    Arkaplan Seç
                  </Box>
                }
              >
                {backgroundColors.map((bg) => (
                  <MenuItem key={bg.id} value={bg.color}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box 
                        sx={{ 
                          width: 20, 
                          height: 20, 
                          borderRadius: 1,
                          bgcolor: bg.color,
                          border: '1px solid #ddd'
                        }} 
                      />
                      {bg.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Panel>

          {/* Sağ üst köşedeki sunum modu butonu */}
          <Panel position="top-right" style={{ margin: '10px' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Dışa Aktar">
                <IconButton
                  onClick={() => setExportSettings(prev => ({ ...prev, showExportDialog: true }))}
                  sx={{
                    bgcolor: 'white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                >
                  <SaveAltIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Sunum Modu">
                <IconButton
                  onClick={() => setPresentationMode(true)}
                  sx={{
                    bgcolor: 'white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                >
                  <SlideshowIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Panel>

          <Controls />
          <MiniMap style={minimapStyle} />
        </ReactFlow>

        <PresentationMode
          open={presentationMode}
          onClose={() => setPresentationMode(false)}
          nodes={nodes}
          edges={edges}
        />

        <ImageUploader
          open={false}
          onClose={() => {}}
          onSave={(imageUrl) => {
            if (selectedNode) {
              updateNodeStyle(selectedNode.id, { image: imageUrl });
            }
          }}
        />

        <ActiveUsers />

        <ExportDialog />
      </Box>
    </ThemeProvider>
  );
}

export default App;
