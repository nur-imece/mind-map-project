import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Spin, Empty, message, Modal, Input, Form, Dropdown } from 'antd';
import { useNodesState, useEdgesState, Background, Controls, MiniMap, ReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import { useTranslation } from 'react-i18next';

import './index.scss';

// Import components
import Index from './components/customNode';
import CustomEdge from './components/custom-edge';
import MapHeader from './components/mapHeader';
import MapControls from './components/map-controls';
import MapContainer from './components/map-container';
import ErrorView from './components/error-view';
import MapDataProvider, { useMapDataProvider } from './components/map-data-provider';
import Header from "../../components/header";
// Import edge utils for edge styles
import { getNextEdgeStyle } from './components/edge-utils';
import mindMapService from "../../services/api/mindmap";
import { downloadMindMapAsPDF, isPdfGenerationSupported } from './components/download-helper';

const MindMapPage = () => {
  return (
    <MapDataProvider>
      <MindMapContent />
    </MapDataProvider>
  );
};

const MindMapContent = () => {
  const [searchParams] = useSearchParams();
  const mapId = searchParams.get('mapId');
  const navigate = useNavigate();
  const updateTriggerRef = useRef(0);
  const nodePositionChangeTimeoutRef = useRef(null);
  const nodeDragDataRef = useRef({ draggedNodeId: null, startPosition: null, childNodeIds: null });
  const { t } = useTranslation();
  const [sharedUsers, setSharedUsers] = useState([]);
  const fileDownloadRef = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Use the map data provider hook
  const {
    loading,
    error,
    mindMapData,
    saveInProgress,
    nodes: initialNodes,
    edges: initialEdges,
    backgroundName,
    saveMindMapChanges,
    handleNameChange,
    handleBackgroundChange,
    saveMapFnRef,
    toggleFavorite
  } = useMapDataProvider();
  
  // ReactFlow states for node and edge management 
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Update nodes and edges when initial data changes
  useEffect(() => {
    if (initialNodes && initialNodes.length > 0) {
      setNodes(initialNodes);
    }
  }, [initialNodes, setNodes]);
  
  useEffect(() => {
    if (initialEdges && initialEdges.length > 0) {
      setEdges(initialEdges);
    }
  }, [initialEdges, setEdges]);

  // Özel nodes change handler - pozisyon değişikliklerinde kaydetme için
  const handleNodesChange = (changes) => {
    onNodesChange(changes);
    
    // Detect position changes for saving
    const hasPositionChange = changes.some(change => 
      change.type === 'position' && (change.position?.x !== undefined || change.position?.y !== undefined)
    );
    
    if (hasPositionChange) {
      // Clear previous timeout to prevent multiple calls
      if (nodePositionChangeTimeoutRef.current) {
        clearTimeout(nodePositionChangeTimeoutRef.current);
      }
      
      // Debounce position changes
      nodePositionChangeTimeoutRef.current = setTimeout(() => {
        if (mindMapData && !saveInProgress && saveMapFnRef.current) {
          // Trigger a save with latest node positions
          saveMapFnRef.current({ 
            nodes, 
            edges,
            name: mindMapData.name,
            backgroundName
          });
        }
      }, 500); // 500ms debounce
    }
  };

  // Find all child nodes (direct and indirect) of a given parent node
  const findAllChildNodes = useCallback((parentId, visited = new Set()) => {
    if (visited.has(parentId)) return new Set();
    visited.add(parentId);
    
    const childNodeIds = new Set();
    
    // Find direct children (nodes connected via outgoing edges)
    const childIds = edges
      .filter(edge => edge.source === parentId)
      .map(edge => edge.target);
    
    // Add direct children to the set
    childIds.forEach(childId => childNodeIds.add(childId));
    
    // Recursively get descendants of each child
    childIds.forEach(childId => {
      const descendants = findAllChildNodes(childId, visited);
      descendants.forEach(id => childNodeIds.add(id));
    });
    
    return childNodeIds;
  }, [edges]);

  // Handle node drag start to prepare for moving child nodes together
  const handleNodeDragStart = useCallback((event, node) => {
    // Skip if already tracking a drag operation
    if (nodeDragDataRef.current.draggedNodeId) return;
    
    // Find all child nodes that should move with this parent
    const childNodeIds = findAllChildNodes(node.id);
    
    // Store drag data for use during dragging
    nodeDragDataRef.current = {
      draggedNodeId: node.id,
      startPosition: { ...node.position },
      childNodeIds
    };
  }, [findAllChildNodes]);

  // Handle node dragging to move children with parent node
  const handleNodeDrag = useCallback((event, node) => {
    const { draggedNodeId, startPosition, childNodeIds } = nodeDragDataRef.current;
    
    // Skip if no drag operation in progress or if this isn't the tracked node
    if (!draggedNodeId || node.id !== draggedNodeId || !childNodeIds || childNodeIds.size === 0) return;
    
    // Calculate movement delta from the drag start position
    const deltaX = node.position.x - startPosition.x;
    const deltaY = node.position.y - startPosition.y;
    
    // Move all child nodes by the same delta
    setNodes(currentNodes => 
      currentNodes.map(n => {
        if (childNodeIds.has(n.id)) {
          // Update position relative to the node's original position
          return {
            ...n,
            position: {
              x: n.position.x + deltaX,
              y: n.position.y + deltaY
            }
          };
        }
        return n;
      })
    );
    
    // Update start position for the next drag event
    nodeDragDataRef.current.startPosition = { ...node.position };
  }, [setNodes]);

  // Handle node drag stop to clean up and save changes
  const handleNodeDragStop = useCallback((event, node) => {
    // Skip if not dragging anything
    if (!nodeDragDataRef.current.draggedNodeId) return;
    
    // Clear drag tracking data
    nodeDragDataRef.current = { draggedNodeId: null, startPosition: null, childNodeIds: null };
    
    // Save changes to the server
    if (mindMapData && !saveInProgress && saveMapFnRef.current) {
      if (nodePositionChangeTimeoutRef.current) {
        clearTimeout(nodePositionChangeTimeoutRef.current);
      }
      
      nodePositionChangeTimeoutRef.current = setTimeout(() => {
        saveMapFnRef.current({
          nodes,
          edges,
          name: mindMapData.name,
          backgroundName
        });
      }, 300);
    }
  }, [nodes, edges, mindMapData, saveInProgress, saveMapFnRef]);

  // Type definitions for ReactFlow
  const nodeTypes = useMemo(() => ({
    customNode: (props) => <Index {...props} saveMapFnRef={saveMapFnRef} />
  }), [saveMapFnRef]);

  // Edge type definitions
  const edgeTypes = useMemo(() => ({
    default: CustomEdge,
    straight: CustomEdge,
    bezier: CustomEdge,
    smoothstep: CustomEdge
  }), []);

  // Navigate back to list
  const handleBack = () => {
    navigate('/mind-map-list');
  };

  // Handle edge click to change style
  const handleEdgeClick = (event, edge) => {
    if (!edge?.id) return;
    
    setEdges((eds) => {
      const updatedEdges = eds.map((e) => {
        if (e.id === edge.id) {
          // Save current edge color
          const currentColor = e.style.stroke;
          
          // Get next style
          const nextStyle = getNextEdgeStyle(e.type, {
            ...e.style,
            stroke: undefined 
          });
          
          // Create updated edge
          return {
            ...e,
            type: nextStyle.type,
            style: {
              ...nextStyle.style,
              stroke: currentColor
            },
            data: {
              ...e.data,
              styleName: nextStyle.name,
              styleDescription: nextStyle.description
            }
          };
        }
        return e;
      });
      
      // Update API
      if (mindMapData && nodes.length > 0 && saveMapFnRef.current) {
        setTimeout(() => {
          saveMapFnRef.current({
            nodes, 
            edges: updatedEdges,
            name: mindMapData.name,
            backgroundName
          });
        }, 100);
      }
      
      return updatedEdges;
    });
  };
  
  // Periodic save function to preserve changes
  const saveChanges = () => {
    if (mindMapData && nodes.length > 0 && !saveInProgress && saveMapFnRef.current) {
      updateTriggerRef.current += 1;
      saveMapFnRef.current({
        nodes,
        edges,
        name: mindMapData.name,
        backgroundName
      });
    }
  };

  // Handler function to toggle favorite status
  const handleFavoriteToggle = async () => {
    if (!mindMapData) return;
    await toggleFavorite(!mindMapData.isFavorite);
  };
  
  // Handler function to share map
  const handleShareMap = async (shareData, shareType) => {
    try {
      if (shareType === 'private') {
        // Share with specific users
        const response = await mindMapService.shareMapToUsers({
          mindMapId: shareData.mindMapId,
          users: shareData.users
        });
        
        if (response && !response.error) {
          message.success('Harita başarıyla paylaşıldı');
          // Fetch updated shared users list
          loadSharedUsers(shareData.mindMapId);
        } else {
          message.error('Harita paylaşılırken bir hata oluştu');
        }
      } else {
        // Make map public
        const response = await mindMapService.setPublicOrPrivateMap(
          shareData.mindMapId,
          shareData.isPublicMap
        );
        
        if (response && !response.error) {
          message.success('Harita herkese açık olarak ayarlandı');
          // Update local state
          setMindMapData(prevData => ({
            ...prevData,
            isPublic: true
          }));
        } else {
          message.error('Harita ayarları değiştirilirken bir hata oluştu');
        }
      }
    } catch (err) {
      console.error('Harita paylaşılırken hata:', err);
      message.error('Harita paylaşılırken bir hata oluştu');
    }
  };
  
  // Load shared users for a mind map
  const loadSharedUsers = async (mindMapId) => {
    try {
      const response = await mindMapService.sharedMindMapList(mindMapId);
      if (response && !response.error && response.data?.list) {
        setSharedUsers(response.data.list);
      }
    } catch (err) {
      console.error('Paylaşılan kullanıcılar yüklenirken hata:', err);
    }
  };
  
  // Handler to remove a user from shared list
  const handleRemoveSharedUser = async (user) => {
    if (!mindMapData || !mindMapData.id) return;
    
    try {
      const response = await mindMapService.removeUserFromMap({
        mindMapId: mindMapData.id,
        sharedMindMapMailId: user.sharedMindMapMailId
      });
      
      if (response && !response.error) {
        message.success(`${user.firstnameLastName || user.email} kullanıcısı paylaşım listesinden kaldırıldı`);
        // Refresh shared users list
        loadSharedUsers(mindMapData.id);
      } else {
        message.error('Kullanıcı kaldırılırken bir hata oluştu');
      }
    } catch (err) {
      console.error('Paylaşım kaldırılırken hata:', err);
      message.error('Kullanıcı kaldırılırken bir hata oluştu');
    }
  };
  
  // Handler to duplicate the mind map
  const handleDuplicateMap = async () => {
    if (!mindMapData || !mindMapData.id) return;
    
    Modal.confirm({
      title: 'Harita Kopyası Oluştur',
      content: (
        <Input
          placeholder="Yeni harita adını girin"
          defaultValue={`Kopya - ${mindMapData.name}`}
          style={{ marginTop: 16 }}
        />
      ),
      okText: 'Kopyala',
      cancelText: 'İptal',
      onOk: async (close) => {
        const input = document.querySelector('.ant-modal-content input');
        if (!input || !input.value.trim()) {
          message.error('Lütfen bir harita adı girin');
          return Promise.reject();
        }

        const newMapName = input.value.trim();
        
        // Show loading message
        const hideLoading = message.loading('Harita kopyalanıyor...', 0);

        try {
          const response = await mindMapService.duplicateMindMap({
            mindMapId: mindMapData.id,
            mapName: newMapName,
            content: null
          });
          
          hideLoading();
          
          if (response && !response.error) {
            message.success('Haritanın kopyası oluşturuldu');
            // Navigate to mind-map-list
            navigate('/mind-map-list');
          } else {
            message.error('Harita kopyalanırken bir hata oluştu');
          }
        } catch (err) {
          hideLoading();
          message.error('Harita kopyalanırken bir hata oluştu');
          return Promise.reject();
        }
      }
    });
  };
  
  // Handler to download the mind map
  const handleDownloadMap = async (format) => {
    try {
      if (!isPdfGenerationSupported()) {
        message.error('PDF indirme işlevi bu tarayıcıda desteklenmiyor');
        return;
      }
      
      message.loading({
        content: `Harita ${format} formatında hazırlanıyor...`,
        key: 'download'
      });

      // Hide controls and buttons temporarily
      const controls = document.querySelector('.react-flow__controls');
      const minimap = document.querySelector('.react-flow__minimap');
      if (controls) controls.style.display = 'none';
      if (minimap) minimap.style.display = 'none';
      
      // Use only the canvas element for capture
      const success = await downloadMindMapAsPDF(
        '.react-flow__viewport', 
        `${mindMapData.name || 'Harita'}_${format}`,
        format,
        true
      );

      // Show controls and buttons again
      if (controls) controls.style.display = 'block';
      if (minimap) minimap.style.display = 'block';
      
      if (success) {
        message.success({
          content: `Harita ${format} formatında indirildi`,
          key: 'download',
          duration: 2
        });
      }
    } catch (err) {
      console.error('Harita indirilirken hata:', err);
      message.error({
        content: 'Harita indirilirken bir hata oluştu',
        key: 'download'
      });
    }
  };
  
  // Load shared users when mind map data is loaded
  useEffect(() => {
    if (mindMapData?.id) {
      loadSharedUsers(mindMapData.id);
    }
  }, [mindMapData?.id]);

  // Show error if loading failed
  if (error && !loading) {
    return <ErrorView error={error} onBack={handleBack} />;
  }

  // Render the mind map
  return (
    <div className="mind-map-page">
      <Spin spinning={loading} tip="Harita yükleniyor..." style={{ minHeight: '400px' }}>
        {!loading && (
          <>
            <MapHeader 
              mapData={mindMapData} 
              onBack={handleBack} 
              onNameChange={handleNameChange}
            />
            <div className="mind-map-content">
              <div className="react-flow-wrapper">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={handleNodesChange}
                  onEdgesChange={onEdgesChange}
                  onEdgeClick={handleEdgeClick}
                  onNodeClick={(e, node) => console.log('Node clicked:', node)}
                  onNodeDragStart={handleNodeDragStart}
                  onNodeDrag={handleNodeDrag}
                  onNodeDragStop={handleNodeDragStop}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  fitView
                  onInit={setReactFlowInstance}
                  proOptions={{ hideAttribution: true }}
                  defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                  minZoom={0.1}
                  maxZoom={4}
                  translateExtent={[[-5000, -5000], [5000, 5000]]}
                >
                  <Controls />
                  <MiniMap
                    nodeStrokeColor={(n) => n.data?.color || '#eee'}
                    nodeColor={(n) => n.data?.bgColor || '#fff'}
                    nodeBorderRadius={4}
                  />
                </ReactFlow>
                <MapControls
                  mapData={mindMapData}
                  onFavoriteToggle={handleFavoriteToggle}
                  onShareMap={handleShareMap}
                  onDuplicateMap={handleDuplicateMap}
                  onDownloadMap={handleDownloadMap}
                  sharedUsers={sharedUsers}
                  onRemoveSharedUser={handleRemoveSharedUser}
                  onBackgroundChange={handleBackgroundChange}
                  nodes={nodes}
                  reactFlowInstance={reactFlowInstance}
                />
              </div>
            </div>
          </>
        )}
      </Spin>
    </div>
  );
};

export default MindMapPage;
