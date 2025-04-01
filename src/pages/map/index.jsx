import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Spin, Empty, Button, message, Tooltip } from 'antd';

import mindMapService from '@/services/api/mindmap';
import './index.scss';

// Import components from components directory
import CustomNode from './components/customNode';
import CustomEdge from '@/pages/map/components/custom-edge.jsx';
import MapHeader from './components/mapHeader';
import { convertMindMapToReactFlow } from './components/mapUtils';
import { getNextEdgeStyle, EDGE_STYLES } from '@/pages/map/components/edge-utils.js';

/* (E) Ana Bileşen */
const MindMapPage = () => {
  const [searchParams] = useSearchParams();
  const mapId = searchParams.get('mapId');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mindMapData, setMindMapData] = useState(null);
  const [saveInProgress, setSaveInProgress] = useState(false);
  const [userId, setUserId] = useState(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Use ref for avoiding circular dependencies
  const saveMapFnRef = useRef(null);

  // Type definitions for ReactFlow
  const nodeTypes = useMemo(() => ({
    customNode: CustomNode
  }), []);

  // Edge type definitions
  const edgeTypes = useMemo(() => ({
    default: CustomEdge,
    straight: CustomEdge,
    bezier: CustomEdge,
    smoothstep: CustomEdge
  }), []);
  
  // User ID'sini localStorage'dan al
  useEffect(() => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInformation'));
      if (userInfo && userInfo.id) {
        setUserId(userInfo.id);
      }
    } catch (err) {
      console.error('User info could not be parsed', err);
    }
  }, []);

  // Style comparison helper
  const isStyleEqual = useCallback((style1, style2) => {
    if (!style1 || !style2) return false;
    
    const keys1 = Object.keys(style1);
    const keys2 = Object.keys(style2);
    
    if (keys1.length !== keys2.length) return false;
    
    return keys1.every(key => {
      if (key === 'strokeDasharray') {
        return style1[key] === style2[key];
      }
      return style1[key] === style2[key];
    });
  }, []);

  // Find edge style information for an edge
  const findEdgeStyleInfo = useCallback((edge) => {
    return EDGE_STYLES.find(style => 
      style.type === edge.type && 
      isStyleEqual(style.style, edge.style)
    );
  }, [isStyleEqual]);

  // Convert nodes and edges to mind map content format
  const convertToMindMapContent = useCallback((nodes, edges) => {
    // Kök node'u bul (genellikle id'si "1" veya sadece bir tane kök)
    const rootNode = nodes.find(node => !edges.some(edge => edge.target === node.id));
    
    // Save edge styles for later use when reconstructing
    const edgeStylesMap = {};
    edges.forEach(edge => {
      edgeStylesMap[`${edge.source}-${edge.target}`] = {
        type: edge.type,
        style: edge.style,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle
      };
    });
    
    // Rekürsif olarak ağaç yapısını oluştur
    const buildTree = (nodeId, parentPos = null) => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return null;
      
      // Bu node'a bağlı tüm kenarları (children) bul
      const childEdges = edges.filter(e => e.source === nodeId);
      
      // Calculate positions - for root use absolute, for children use relative to parent
      let position;
      if (parentPos) {
        // For children, store relative positions to parent
        position = {
          left: node.position.x - parentPos.x,
          top: node.position.y - parentPos.y
        };
      } else {
        // For root, store absolute position
        position = {
          left: node.position.x,
          top: node.position.y
        };
      }
      
      // Process children with this node's position as their parent
      const children = childEdges.map(e => buildTree(e.target, node.position)).filter(Boolean);
      
      return {
        id: node.id,
        text: node.data.label,
        color: node.data.color,
        bgColor: node.data.bgColor,
        fontSize: node.data.fontSize,
        position: position,
        children: children.length > 0 ? children : []
      };
    };
    
    const rootTree = rootNode ? buildTree(rootNode.id) : null;
    
    return {
      root: rootTree,
      version: "1.0",
      edgeStyles: edgeStylesMap,
      timestamp: new Date().toISOString()
    };
  }, []);

  // Save mind map changes to the API
  const saveMindMapChanges = useCallback(async (params) => {
    const { nodes: updatedNodes, edges: updatedEdges, name } = params;
    
    if (!mindMapData || !userId || saveInProgress) return;
    
    try {
      setSaveInProgress(true);
      
      // Mind map içeriğini oluştur
      const contentData = convertToMindMapContent(updatedNodes || nodes, updatedEdges || edges);
      
      // API'ye gönderilecek veriyi hazırla
      const requestData = {
        id: mindMapData.id,
        name: name || mindMapData.name,
        content: JSON.stringify(contentData),
        userId: userId,
        isPublic: mindMapData.isPublic,
        isDownloadable: mindMapData.isDownloadable,
        isCopiable: true,
        isShareable: true,
        languageId: 1 // Varsayılan dil ID'si
      };
      
      // API isteğini gönder
      const response = await mindMapService.updateMindMapByPermission(requestData);
      
      if (response && !response.error) {
        if (name && name !== mindMapData.name) {
          // İsim değişti, state'i güncelle
          setMindMapData(prev => ({ ...prev, name }));
          message.success('Harita adı güncellendi');
        }
      } else {
        console.error('Harita güncellenirken API hatası:', response?.error);
        message.error('Harita güncellenirken bir hata oluştu');
      }
    } catch (err) {
      console.error('Mind map güncellenirken hata:', err);
      message.error('Harita güncellenirken bir hata oluştu');
    } finally {
      setSaveInProgress(false);
    }
  }, [mindMapData, nodes, edges, convertToMindMapContent, userId, saveInProgress]);

  // Store the save function in a ref to avoid circular dependencies
  useEffect(() => {
    saveMapFnRef.current = saveMindMapChanges;
  }, [saveMindMapChanges]);

  // Handle edge click to change edge style
  const handleEdgeClick = useCallback((event, edge) => {
    console.log('Edge clicked:', edge);
    
    const edgeId = edge?.id;
    if (!edgeId) return;
    
    setEdges((eds) => {
      const updatedEdges = eds.map((e) => {
        if (e.id === edgeId) {
          // Mevcut edge'in rengini sakla
          const currentColor = e.style.stroke;
          
          // Bir sonraki stili al
          const nextStyle = getNextEdgeStyle(e.type, {
            ...e.style,
            stroke: undefined // Renk karşılaştırmasını etkilememesi için stroke'u çıkar
          });
          
          // Yeni edge'i oluştur, rengi koru
          const updatedEdge = {
            ...e,
            type: nextStyle.type,
            style: {
              ...nextStyle.style,
              stroke: currentColor // Parent node'un rengini koru
            },
            data: {
              ...e.data,
              styleName: nextStyle.name,
              styleDescription: nextStyle.description
            }
          };
          
          return updatedEdge;
        }
        return e;
      });
      
      // Use the saved ref function to update the API after edge style change
      if (mindMapData && nodes.length > 0 && saveMapFnRef.current) {
        setTimeout(() => {
          saveMapFnRef.current({
            nodes, 
            edges: updatedEdges,
            name: mindMapData.name
          });
        }, 100);
      }
      
      return updatedEdges;
    });
  }, [nodes, mindMapData]);

  // Handle name change from header
  const handleNameChange = useCallback((newName) => {
    if (newName && newName.trim() !== '' && newName !== mindMapData?.name) {
      saveMapFnRef.current?.({
        nodes, 
        edges, 
        name: newName.trim()
      });
    }
  }, [nodes, edges, mindMapData]);

  // Fetch mind map data
  const fetchMindMap = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!mapId) {
        setError('mapId yok!');
        return;
      }

      const response = await mindMapService.getMindMapById(mapId);
      if (!response || !response.data?.mindMap) {
        throw new Error('Harita bulunamadı veya geçersiz yanıt.');
      }

      const mindMap = response.data.mindMap;
      const parsedContent = JSON.parse(mindMap.content);

      // Header verisi
      setMindMapData({
        ...parsedContent,
        id: mindMap.id,
        name: mindMap.name,
        createdDate: mindMap.creationDate,
        updatedDate: mindMap.modifiedDate,
        isPublic: mindMap.isPublicMap,
        isDownloadable: mindMap.isDownloadable ?? false,
        userId: mindMap.createdBy
      });

      // Harita dönüştür
      if (parsedContent && parsedContent.root) {
        const { nodes, edges } = convertMindMapToReactFlow(
          parsedContent.root, 
          null, 
          [], 
          [], 
          { edgeStyles: parsedContent.edgeStyles || {} }
        );
        setNodes(nodes);
        setEdges(edges);
      } else {
        setError('Harita verisi geçersiz veya boş.');
      }
    } catch (err) {
      console.error('Mind map yüklenirken hata:', err);
      setError(err.message || 'Harita yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [mapId, setNodes, setEdges]);

  // Load mind map when component mounts
  useEffect(() => {
    if (mapId) {
      fetchMindMap();
    } else {
      setLoading(false);
    }
  }, [mapId, fetchMindMap]);

  // Navigate back to list
  const handleBack = () => {
    navigate('/mind-map-list');
  };

  // Show error if loading failed
  if (error && !loading) {
    return (
      <div className="mind-map-page">
        <div className="map-error-container">
          <Empty
            description={<span>{error}</span>}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={handleBack}>
              Ana Sayfaya Dön
            </Button>
          </Empty>
        </div>
      </div>
    );
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
              onSave={saveMindMapChanges}
              saveInProgress={saveInProgress}
            />
            <div className="mind-map-container" style={{ width: '100%', height: '80vh' }}>
              {nodes.length > 0 ? (
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onEdgeClick={handleEdgeClick}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  edgesUpdatable={true}
                  edgesFocusable={true}
                  selectNodesOnDrag={false}
                  elementsSelectable={true}
                  fitView
                  attributionPosition="bottom-left"
                >
                  <Background color="#aaa" gap={16} />
                  <Controls />
                  <MiniMap
                    nodeStrokeColor={(n) => n.data?.bgColor || '#eee'}
                    nodeColor={(n) => n.data?.bgColor || '#fff'}
                    nodeBorderRadius={4}
                  />
                </ReactFlow>
              ) : (
                <Empty description="Haritada görüntülenecek düğüm yok" />
              )}
            </div>
          </>
        )}
      </Spin>
    </div>
  );
};

export default MindMapPage;
