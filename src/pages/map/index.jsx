import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Spin, Empty, Button } from 'antd';

import mindMapService from '@/services/api/mindmap';
import './index.scss';

// Import components from components directory
import CustomNode from './components/customNode';
import MapHeader from './components/mapHeader';
import { convertMindMapToReactFlow } from './components/mapUtils';

/* (E) Ana Bileşen */
const MindMapPage = () => {
  const [searchParams] = useSearchParams();
  const mapId = searchParams.get('mapId');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mindMapData, setMindMapData] = useState(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Node tipini kaydet
  const nodeTypes = useMemo(() => ({
    customNode: CustomNode
  }), []);

  // mindMap verisi
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
        name: mindMap.name,
        createdDate: mindMap.creationDate,
        updatedDate: mindMap.modifiedDate,
        isPublic: mindMap.isPublicMap,
        isDownloadable: mindMap.isDownloadable ?? false
      });

      // Harita dönüştür
      if (parsedContent && parsedContent.root) {
        const { nodes, edges } = convertMindMapToReactFlow(parsedContent.root);
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
  }, [mapId]);

  useEffect(() => {
    if (mapId) {
      fetchMindMap();
    } else {
      setLoading(false);
    }
  }, [mapId, fetchMindMap]);

  // Geri
  const handleBack = () => {
    navigate('/');
  };

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

  return (
      <div className="mind-map-page">
        <Spin spinning={loading} tip="Harita yükleniyor..." style={{ minHeight: '400px' }}>
          {!loading && (
              <>
                <MapHeader mapData={mindMapData} onBack={handleBack} />
                <div className="mind-map-container" style={{ width: '100%', height: '80vh' }}>
                  {nodes.length > 0 ? (
                      <ReactFlow
                          nodes={nodes}
                          edges={edges}
                          onNodesChange={onNodesChange}
                          onEdgesChange={onEdgesChange}
                          nodeTypes={nodeTypes}
                          fitView
                          fitViewOptions={{ padding: 0.2 }}
                          minZoom={0.1}
                          maxZoom={2}
                          attributionPosition="bottom-right"
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
