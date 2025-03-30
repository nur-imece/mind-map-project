import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Spin, Empty, Button, Typography, Space, Tag, Divider, Row, Col } from 'antd';
import { LeftOutlined } from '@ant-design/icons';

import mindMapService from '@/services/api/mindmap';
import './index.scss';

const { Title, Text } = Typography;

/* (A) CUSTOM NODE
   - 8 handle: 4 'source' (sourceLeft, sourceRight, sourceTop, sourceBottom)
               4 'target' (targetLeft, targetRight, targetTop, targetBottom)
   - Bu şekilde kenar oluşturma aşamasında hangi yöne en yakınsa oradan bağlanabilir.
*/
const CustomNode = memo(({ data, isConnectable, selected }) => {
  return (
      <div
          className={`custom-node ${selected ? 'selected' : ''}`}
          style={{
            background: data.bgColor || '#FFFFFF',
            color: data.color || '#000000',
            fontSize: data.fontSize ? `${data.fontSize}px` : '16px',
            borderColor: selected ? '#4096ff' : '#ddd',
            padding: '8px 12px',
            borderRadius: 6
          }}
      >
        {/* TARGET handle'lar (4 yön) */}
        <Handle id="targetLeft"   type="target" position={Position.Left}   isConnectable={isConnectable} />
        <Handle id="targetRight"  type="target" position={Position.Right}  isConnectable={isConnectable} />
        <Handle id="targetTop"    type="target" position={Position.Top}    isConnectable={isConnectable} />
        <Handle id="targetBottom" type="target" position={Position.Bottom} isConnectable={isConnectable} />

        {/* İçerik */}
        <div className="html-content" dangerouslySetInnerHTML={{ __html: data.label }} />

        {/* SOURCE handle'lar (4 yön) */}
        <Handle id="sourceLeft"   type="source" position={Position.Left}   isConnectable={isConnectable} />
        <Handle id="sourceRight"  type="source" position={Position.Right}  isConnectable={isConnectable} />
        <Handle id="sourceTop"    type="source" position={Position.Top}    isConnectable={isConnectable} />
        <Handle id="sourceBottom" type="source" position={Position.Bottom} isConnectable={isConnectable} />
      </div>
  );
});

/* (B) HEADER BİLEŞENİ - Değişmedi */
const MapHeader = ({ mapData, onBack }) => {
  if (!mapData) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
      <div className="map-header">
        <Row gutter={[16, 16]} align="middle">
          <Col span={1}>
            <Button type="text" icon={<LeftOutlined />} onClick={onBack} title="Geri Dön" />
          </Col>
          <Col span={15}>
            <Title level={4} style={{ margin: 0 }}>{mapData.name}</Title>
            <Space size="small" wrap>
              {mapData.isPublic && <Tag color="green">Herkese Açık</Tag>}
              {mapData.isDownloadable && <Tag color="blue">İndirilebilir</Tag>}
            </Space>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <Space direction="vertical" size="small">
              <Text type="secondary">Oluşturulma: {formatDate(mapData.createdDate)}</Text>
              <Text type="secondary">Güncellenme: {formatDate(mapData.updatedDate)}</Text>
            </Space>
          </Col>
        </Row>
        <Divider style={{ margin: '12px 0' }} />
      </div>
  );
};

/* (C) Yardımcı Fonksiyonlar */

// 1) computeAbsolutePos: child = parent + childRelative
function computeAbsolutePos(nodePos, parentAbsPos) {
  if (!parentAbsPos) {
    return {
      x: nodePos.left || 0,
      y: nodePos.top || 0
    };
  }
  return {
    x: parentAbsPos.x + (nodePos.left || 0),
    y: parentAbsPos.y + (nodePos.top || 0)
  };
}

// 2) getClosestHandles:
// 4 olası source handle (sourceLeft, sourceRight, sourceTop, sourceBottom)
// 4 olası target handle (targetLeft, targetRight, targetTop, targetBottom)
// Basit yaklaşım:
//  - Hangisi baskınsa x mi y mi,
//  - dx < 0 => parent's sourceLeft + child's targetRight, vb.
function getClosestHandles(parentPos, childPos) {
  // parentPos, childPos => mutlak (x,y)
  const dx = childPos.x - parentPos.x;
  const dy = childPos.y - parentPos.y;

  // Hangisi büyük? x mi y mi
  if (Math.abs(dx) > Math.abs(dy)) {
    // Yatay baskın
    if (dx < 0) {
      // parent sourceLeft => child targetRight
      return { sourceHandle: 'sourceLeft', targetHandle: 'targetRight' };
    } else {
      // parent sourceRight => child targetLeft
      return { sourceHandle: 'sourceRight', targetHandle: 'targetLeft' };
    }
  } else {
    // Dikey baskın
    if (dy < 0) {
      // parent sourceTop => child targetBottom
      return { sourceHandle: 'sourceTop', targetHandle: 'targetBottom' };
    } else {
      // parent sourceBottom => child targetTop
      return { sourceHandle: 'sourceBottom', targetHandle: 'targetTop' };
    }
  }
}

/* (D) Konvert Fonksiyonu
   - side vs. yok, handle seçimi getClosestHandles ile
   - 2. seviye children konumu = parentAbs + childRelative
*/
function convertMindMapToReactFlow(node, parentNode = null, nodesAcc = [], edgesAcc = []) {
  if (!node) return { nodes: nodesAcc, edges: edgesAcc };

  // Parent absPos
  const parentAbsPos = parentNode?.data?.absPos || null;

  // JSON position
  const nodePos = node.position || { left: 0, top: 0 };

  // Bu node'un mutlak konumu
  const absPos = computeAbsolutePos(nodePos, parentAbsPos);

  // React Flow node
  const newNode = {
    id: node.id,
    position: { x: absPos.x, y: absPos.y },
    data: {
      label: node.text || '',
      color: node.color,
      bgColor: node.bgColor,
      fontSize: node.fontSize,
      absPos // çocuklar da buradan hesaplayacak
    },
    type: 'customNode'
  };
  nodesAcc.push(newNode);

  // Kenar
  if (parentNode) {
    const ph = parentNode.data?.absPos || { x: 0, y: 0 };
    // min mesafe handle bul
    const { sourceHandle, targetHandle } = getClosestHandles(ph, absPos);

    edgesAcc.push({
      id: `edge-${parentNode.id}-${node.id}`,
      source: parentNode.id,
      target: node.id,
      type: 'bezier',
      style: { stroke: '#666', strokeWidth: 2 },
      sourceHandle,
      targetHandle
    });
  }

  // Alt düğümler
  if (Array.isArray(node.children)) {
    node.children.forEach((child) => {
      convertMindMapToReactFlow(child, newNode, nodesAcc, edgesAcc);
    });
  }

  return { nodes: nodesAcc, edges: edgesAcc };
}

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
