import React, { useCallback, useState, useEffect } from 'react';
import { Box, IconButton, Tooltip, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, Button } from '@mui/material';
import ReactFlow, { Background, Controls, MiniMap, ConnectionMode, Panel } from 'reactflow';
import { Slideshow as SlideshowIcon, Wallpaper as WallpaperIcon, SaveAlt as SaveAltIcon } from '@mui/icons-material';
import 'reactflow/dist/style.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import MindMapNode from './nodes/MindMapNode.js';
import useMindMapStore from './store/mindMapStore.js';
import PresentationMode from './components/PresentationMode.js';
import ActiveUsers from './components/ActiveUsers.js';
import useCollaborationStore from './store/collaborationStore.js';

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

function MindMap() {
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
    // Export code implementation
    console.log('Exporting as', format);
    setExportSettings({
      ...exportSettings,
      showExportDialog: true
    });
  };

  return (
    <>
      {presentationMode ? (
        <PresentationMode 
          nodes={nodes} 
          edges={edges} 
          onClose={() => setPresentationMode(false)}
        />
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100vh',
          bgcolor: bgColor
        }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            onNodesChange={onNodesChange}
            onNodeClick={onNodeClick}
            connectionMode={ConnectionMode.Loose}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap style={minimapStyle} nodeColor="#1976d2" />
            
            <Panel position="top-right">
              <Box sx={{ display: 'flex', gap: 1, bgcolor: 'rgba(255,255,255,0.8)', p: 0.5, borderRadius: 1 }}>
                <ActiveUsers users={activeUsers} />
              
                <Tooltip title="Sunum Modu">
                  <IconButton
                    onClick={() => setPresentationMode(true)}
                    size="small"
                    sx={{ bgcolor: 'white' }}
                  >
                    <SlideshowIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Arka Plan Değiştir">
                  <IconButton
                    onClick={handleBackgroundChange}
                    size="small"
                    sx={{ bgcolor: 'white' }}
                  >
                    <WallpaperIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Dışa Aktar">
                  <IconButton
                    onClick={() => handleExport('pdf')}
                    size="small"
                    sx={{ bgcolor: 'white' }}
                  >
                    <SaveAltIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Panel>
          </ReactFlow>
          
          <Dialog
            open={exportSettings.showExportDialog}
            onClose={() => setExportSettings({...exportSettings, showExportDialog: false})}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Dışa Aktarma Ayarları</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                <FormControl fullWidth>
                  <InputLabel>Kağıt Boyutu</InputLabel>
                  <Select
                    value={exportSettings.format}
                    label="Kağıt Boyutu"
                    onChange={(e) => setExportSettings({...exportSettings, format: e.target.value})}
                  >
                    <MenuItem value="A4">A4</MenuItem>
                    <MenuItem value="A3">A3</MenuItem>
                    <MenuItem value="A5">A5</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>Yönlendirme</InputLabel>
                  <Select
                    value={exportSettings.orientation}
                    label="Yönlendirme"
                    onChange={(e) => setExportSettings({...exportSettings, orientation: e.target.value})}
                  >
                    <MenuItem value="landscape">Yatay</MenuItem>
                    <MenuItem value="portrait">Dikey</MenuItem>
                  </Select>
                </FormControl>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                  <Button 
                    onClick={() => setExportSettings({...exportSettings, showExportDialog: false})}
                  >
                    İptal
                  </Button>
                  <Button 
                    variant="contained"
                    onClick={() => {
                      console.log('Exporting with settings:', exportSettings);
                      setExportSettings({...exportSettings, showExportDialog: false});
                    }}
                  >
                    Dışa Aktar
                  </Button>
                </Box>
              </Box>
            </DialogContent>
          </Dialog>
        </Box>
      )}
    </>
  );
}

export default MindMap;
