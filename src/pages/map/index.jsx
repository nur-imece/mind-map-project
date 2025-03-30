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

// -- (A) Custom Node Tanımı ----------------------------------------------
const CustomNode = memo(({ data, isConnectable, selected }) => {
  return (
      <div
          className={`custom-node ${selected ? 'selected' : ''}`}
          style={{
            background: data.bgColor || '#FFFFFF',
            color: data.color || '#000000',
            fontSize: data.fontSize ? `${data.fontSize}px` : '16px',
            borderColor: selected ? '#4096ff' : '#ddd'
          }}
      >
        <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
        <div
            className="html-content"
            dangerouslySetInnerHTML={{ __html: data.label }}
        />
        <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      </div>
  );
});

// -- (B) MapHeader: Harita bilgilerini gösterecek üst panel ---------------
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

// -- (C) Ana Component ---------------------------------------------------
const MindMapPage = () => {
  // query parametreden mapId'yi al
  const [searchParams] = useSearchParams();
  const mapId = searchParams.get('mapId');

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mindMapData, setMindMapData] = useState(null);

  // React Flow state yönetimi
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // (1) `nodeTypes`'ı componentin her render'ında yeniden oluşturmamak için
  //     ya fonksiyonun dışına taşıyın ya da useMemo ile sarın:
  const nodeTypes = useMemo(() => ({
    customNode: CustomNode
  }), []);

  // (2) Mind map JSON'undan ReactFlow formatına dönüştürme fonksiyonu
  const convertMindMapToReactFlow = useCallback(
      (node, nodesAcc = [], edgesAcc = [], parentId = null) => {
        if (!node) return { nodes: nodesAcc, edges: edgesAcc };

        const { id, text, position, children = [], color, bgColor, fontSize } = node;

        const newNode = {
          id,
          position: {
            x: position?.left || 0,
            y: position?.top || 0
          },
          data: {
            label: text,
            color,
            bgColor,
            fontSize
          },
          type: 'customNode'
        };

        nodesAcc.push(newNode);

        // Kenar (edge) oluştur, eğer bir parent varsa
        if (parentId) {
          edgesAcc.push({
            id: `edge-${parentId}-${id}`,
            source: parentId,
            target: id,
            type: 'smoothstep',
            animated: false,
            style: { stroke: '#555' }
          });
        }

        // Alt çocukları (children) dolaşarak ekle
        if (Array.isArray(children) && children.length > 0) {
          children.forEach((child) => {
            convertMindMapToReactFlow(child, nodesAcc, edgesAcc, id);
          });
        }

        return { nodes: nodesAcc, edges: edgesAcc };
      },
      []
  );

  // (3) API'den mind map verisi alma
  const fetchMindMap = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!mapId) {
        setError('Harita ID’si yok veya geçersiz (mapId parametresi).');
        return;
      }

      // mindMapService'den veriyi çek
      // Sizin belirttiğiniz gibi response yapısı: response.data.mindMap
      const response = await mindMapService.getMindMapById(mapId);

      if (!response || !response.data?.mindMap) {
        throw new Error('Harita bulunamadı veya geçersiz yanıt.');
      }

      const mindMap = response.data.mindMap;

      // content alanını parse edelim
      const parsedContent = JSON.parse(mindMap.content);

      // Header'da göstereceğimiz veriler
      setMindMapData({
        ...parsedContent,
        name: mindMap.name,
        // API’den creationDate / modifiedDate vs. alıyorsanız bunları set edin
        createdDate: mindMap.creationDate,
        updatedDate: mindMap.modifiedDate,
        // "isPublicMap" varsa isPublic = mindMap.isPublicMap
        isPublic: mindMap.isPublicMap,
        // Farklı alan varsa bunları da ayarlayın
        isDownloadable: mindMap.isDownloadable ?? false
      });

      // React Flow'a uygun hale getir
      if (parsedContent && parsedContent.root) {
        const { nodes, edges } = convertMindMapToReactFlow(parsedContent.root);
        setNodes(nodes);
        setEdges(edges);
      } else {
        setError('Harita verisi geçersiz veya boş.');
      }
    } catch (err) {
      console.error('Mind map yükleme hatası:', err);
      setError(err.message || 'Harita yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [mapId, convertMindMapToReactFlow, setNodes, setEdges]);

  // (4) component mount veya mapId değiştiğinde fetchMindMap çalıştır
  useEffect(() => {
    if (mapId) {
      fetchMindMap();
    } else {
      setLoading(false); // mapId yoksa, boş state
    }
  }, [mapId, fetchMindMap]);

  // Geri butonuna basınca ana sayfaya yönlendirelim
  const handleBack = () => {
    navigate('/');
  };

  // (5) Hata durumu
  if (error && !loading) {
    return (
        <div className="mind-map-page">
          <div className="map-error-container">
            <Empty description={<span>{error}</span>} image={Empty.PRESENTED_IMAGE_SIMPLE}>
              <Button type="primary" onClick={handleBack}>
                Ana Sayfaya Dön
              </Button>
            </Empty>
          </div>
        </div>
    );
  }

  // (6) Ana render, Spin’i nested şekilde kullanırsak tip uyarısı kaybolur.
  return (
      <div className="mind-map-page">
        <Spin spinning={loading} tip="Harita yükleniyor..." style={{ minHeight: '400px' }}>
          {!loading && (
              <>
                <MapHeader mapData={mindMapData} onBack={handleBack} />
                <div className="mind-map-container">
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
                            nodeBorderRadius={2}
                        />
                      </ReactFlow>
                  ) : (
                      <div className="map-empty-container">
                        <Empty description="Haritada görüntülenecek düğüm yok" />
                      </div>
                  )}
                </div>
              </>
          )}
        </Spin>
      </div>
  );
};

export default MindMapPage;
