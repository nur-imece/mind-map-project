import React, { useState, useMemo, useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Panel,
  useReactFlow,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import MindMapNode from './nodes/MindMapNode';
import useMindMapStore from '../store/mindMapStore';
import PresentationMode from './PresentationMode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  FormControl, 
  Select, 
  MenuItem, 
  InputLabel,
  Box,
  Divider
} from '@mui/material';

// nodeTypes'ı bileşen dışına taşıyoruz
const nodeTypes = {
  mindMap: MindMapNode,
};

const MindMapContent = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    getVisibleNodes,
    getVisibleEdges,
    backgroundImage,
    setBackgroundImage,
    isPresentationMode,
    presentationOrder,
    currentSlideIndex,
    nextSlide,
    previousSlide,
    endPresentation,
    onConnect,
    setSelectedEdgeStyle,
    selectedEdgeStyle
  } = useMindMapStore();

  // Export settings state
  const [exportSettings, setExportSettings] = useState({
    format: 'A4',
    orientation: 'landscape',
    scale: 1,
    quality: 2,
    showExportDialog: false
  });

  // Seçili arkaplan rengi
  const [bgColor, setBgColor] = useState('#000000');

  // Seçili arkaplan pattern tipi (Dots / Lines / Cross)
  const [bgVariant, setBgVariant] = useState(BackgroundVariant.Dots);

  // Kullanıcıya sunacağımız renk seçenekleri
  const colorOptions = [
    { label: 'Beyaz', value: '#ffffff' },
    { label: 'Gri', value: '#e0e0e0' },
    { label: 'Açık Mavi', value: '#cceeff' },
    { label: 'Açık Yeşil', value: '#ccffcc' },
    { label: 'Açık Pembe', value: '#ffccf2' },
  ];

  // Kullanıcıya sunacağımız arkaplan tipi seçenekleri
  const variantOptions = [
    { label: 'Dots', value: BackgroundVariant.Dots },
    { label: 'Lines', value: BackgroundVariant.Lines },
    { label: 'Cross', value: BackgroundVariant.Cross },
  ];

  const visibleNodes = useMemo(() => getVisibleNodes(), [getVisibleNodes]);
  const visibleEdges = useMemo(() => getVisibleEdges(), [getVisibleEdges]);

  const [presentationDialogOpen, setPresentationDialogOpen] = useState(false);
  const { setCenter, fitView } = useReactFlow();

  // Sunum modunda node'a zoom yap
  const zoomToNode = useCallback((nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setCenter(node.position.x, node.position.y, { zoom: 2, duration: 1000 });
    }
  }, [nodes, setCenter]);

  // İlk node'a zoom yap
  useEffect(() => {
    if (isPresentationMode && presentationOrder.length > 0) {
      const firstNodeId = presentationOrder[0];
      zoomToNode(firstNodeId);
    }
  }, [isPresentationMode, presentationOrder, zoomToNode]);

  // Sunum kontrolü
  const handleKeyDown = useCallback((event) => {
    if (!isPresentationMode) return;

    try {
      switch (event.key) {
        case 'ArrowRight':
        case ' ': // Space tuşu
          event.preventDefault(); // Sayfanın kaymasını önle
          const nextNodeId = presentationOrder[currentSlideIndex + 1];
          if (nextNodeId) {
            nextSlide();
            zoomToNode(nextNodeId);
          }
          break;
        case 'ArrowLeft':
          event.preventDefault();
          const prevNodeId = presentationOrder[currentSlideIndex - 1];
          if (prevNodeId) {
            previousSlide();
            zoomToNode(prevNodeId);
          }
          break;
        case 'Escape':
          event.preventDefault();
          endPresentation();
          fitView({ duration: 1000 });
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Sunum kontrolünde hata:', error);
      endPresentation();
      fitView({ duration: 1000 });
    }
  }, [
    isPresentationMode,
    currentSlideIndex,
    presentationOrder,
    nextSlide,
    previousSlide,
    endPresentation,
    zoomToNode,
    fitView
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Sunum kontrol düğmeleri
  const renderPresentationControls = () => {
    if (!isPresentationMode) return null;

    return (
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          display: 'flex',
          gap: '10px',
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
      >
        <button
          onClick={() => {
            if (currentSlideIndex > 0) {
              previousSlide();
              const prevNodeId = presentationOrder[currentSlideIndex - 1];
              zoomToNode(prevNodeId);
            }
          }}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            opacity: currentSlideIndex === 0 ? 0.5 : 1,
          }}
          disabled={currentSlideIndex === 0}
        >
          ← Önceki
        </button>
        <button
          onClick={() => {
            if (currentSlideIndex < presentationOrder.length - 1) {
              nextSlide();
              const nextNodeId = presentationOrder[currentSlideIndex + 1];
              zoomToNode(nextNodeId);
            }
          }}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            opacity: currentSlideIndex === presentationOrder.length - 1 ? 0.5 : 1,
          }}
          disabled={currentSlideIndex === presentationOrder.length - 1}
        >
          Sonraki →
        </button>
        <div style={{ 
          borderLeft: '1px solid #ccc', 
          margin: '0 10px' 
        }} />
        <div style={{ 
          fontSize: '14px', 
          color: '#666',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <span>Kontroller:</span>
          <kbd style={{ padding: '2px 6px', backgroundColor: '#eee', borderRadius: '3px' }}>←</kbd>
          <kbd style={{ padding: '2px 6px', backgroundColor: '#eee', borderRadius: '3px' }}>→</kbd>
          <kbd style={{ padding: '2px 6px', backgroundColor: '#eee', borderRadius: '3px' }}>Space</kbd>
          <kbd style={{ padding: '2px 6px', backgroundColor: '#eee', borderRadius: '3px' }}>Esc</kbd>
        </div>
        <div style={{ 
          borderLeft: '1px solid #ccc', 
          margin: '0 10px' 
        }} />
        <button
          onClick={() => {
            endPresentation();
            fitView({ duration: 1000 });
          }}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Sunumu Bitir (ESC)
        </button>
      </div>
    );
  };

  // Function to handle mind map export
  const handleExport = async (format) => {
    try {
      const flowElement = document.querySelector('.react-flow');
      if (!flowElement) return;

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
        backgroundColor: null
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
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      zIndex: 1000,
      minWidth: '300px'
    }}>
      <h3 style={{ marginTop: 0 }}>Dışa Aktarma Ayarları</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Kağıt Boyutu:</label>
        <select 
          value={exportSettings.format}
          onChange={(e) => setExportSettings(prev => ({ ...prev, format: e.target.value }))}
          style={{ width: '100%', padding: '8px' }}
        >
          <option value="A3">A3</option>
          <option value="A4">A4</option>
          <option value="A5">A5</option>
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Yönlendirme:</label>
        <select 
          value={exportSettings.orientation}
          onChange={(e) => setExportSettings(prev => ({ ...prev, orientation: e.target.value }))}
          style={{ width: '100%', padding: '8px' }}
        >
          <option value="landscape">Yatay</option>
          <option value="portrait">Dikey</option>
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Kalite:</label>
        <select 
          value={exportSettings.quality}
          onChange={(e) => setExportSettings(prev => ({ ...prev, quality: Number(e.target.value) }))}
          style={{ width: '100%', padding: '8px' }}
        >
          <option value="1">Normal</option>
          <option value="2">Yüksek</option>
          <option value="3">En Yüksek</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button
          onClick={() => handleExport('pdf')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            flex: 1
          }}
        >
          PDF olarak kaydet
        </button>
        <button
          onClick={() => handleExport('png')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            flex: 1
          }}
        >
          PNG olarak kaydet
        </button>
      </div>

      <button
        onClick={() => setExportSettings(prev => ({ ...prev, showExportDialog: false }))}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'none',
          border: 'none',
          fontSize: '20px',
          cursor: 'pointer',
          padding: '5px'
        }}
      >
        ×
      </button>
    </div>
  );

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <ReactFlow
        nodes={visibleNodes}
        edges={visibleEdges}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        onConnect={onConnect}
        connectOnClick={false}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        fitView
        style={{
          background: backgroundImage ? `url(${backgroundImage})` : undefined
        }}
      >
        <div 
          className="background-button-container"
          style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 999999,
            pointerEvents: 'all'
          }}
        >
          <button
            className="background-change-button"
            onClick={() => {
              const backgrounds = [
                '/backgrounds/background-image1.png',
                '/backgrounds/background-image2.png',
                '/backgrounds/background-image3.png',
                '/backgrounds/background-image4.png',
                '/backgrounds/background-image5.png'
              ];
              const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
              setBackgroundImage(randomBg);
            }}
            style={{
              padding: '15px 30px',
              fontSize: '20px',
              backgroundColor: '#FF0000',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
            }}
          >
            ARKAPLAN DEĞİŞTİR
          </button>
        </div>

        <Panel position="top-center" style={{ display: 'flex', gap: '10px', marginTop: '80px' }}>
          <div style={{ display: 'flex', gap: '10px', backgroundColor: 'white', padding: '10px', borderRadius: '8px' }}>
            <div>
              <label htmlFor="bg-color-select" style={{ marginRight: '5px' }}>
                Arkaplan Rengi:
              </label>
              <select
                id="bg-color-select"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
              >
                {colorOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="bg-variant-select" style={{ marginRight: '5px' }}>
                Arkaplan Tipi:
              </label>
              <select
                id="bg-variant-select"
                value={bgVariant}
                onChange={(e) => setBgVariant(e.target.value)}
              >
                {variantOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <Divider orientation="vertical" flexItem />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Bağlantı Stili</InputLabel>
              <Select
                value={selectedEdgeStyle}
                onChange={(e) => setSelectedEdgeStyle(e.target.value)}
                label="Bağlantı Stili"
              >
                <MenuItem value="solid">Düz Çizgi</MenuItem>
                <MenuItem value="dashed">Kesik Çizgi</MenuItem>
                <MenuItem value="dotted">Noktalı Çizgi</MenuItem>
              </Select>
            </FormControl>
          </div>
        </Panel>

        <Background
          color={bgColor}
          variant={bgVariant}
          gap={20}
          size={1}
          lineWidth={1}
        />

        <Controls />

        {renderPresentationControls()}

        <div style={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 99999,
          display: 'flex',
          gap: '10px',
          pointerEvents: 'all'
        }}>
          <button
            onClick={() => setExportSettings(prev => ({ ...prev, showExportDialog: true }))}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            <span>Dışa Aktar</span>
          </button>
          <button
            onClick={() => setPresentationDialogOpen(true)}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            <span>Sunum Modu</span>
          </button>
        </div>

        {exportSettings.showExportDialog && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ExportDialog />
          </div>
        )}
      </ReactFlow>

      <PresentationMode
        open={presentationDialogOpen}
        onClose={() => setPresentationDialogOpen(false)}
        nodes={nodes}
        edges={edges}
      />
    </div>
  );
};

const MindMap = () => {
  return (
    <ReactFlowProvider>
      <MindMapContent />
    </ReactFlowProvider>
  );
};

export default MindMap;
