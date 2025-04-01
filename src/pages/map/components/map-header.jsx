import React, { useState } from 'react';
import { Row, Col, Button, Typography, Space, Tag, Divider, Input } from 'antd';
import { LeftOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons';
import './map-header.scss';

const { Title, Text } = Typography;

const MapHeader = ({ mapData, onBack, onNameChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [mapName, setMapName] = useState(mapData?.name || '');

  if (!mapData) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const handleSave = () => {
    onNameChange(mapName);
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div className="map-header">
      <Row gutter={[16, 16]} align="middle">
        <Col span={1}>
          <Button 
            type="text" 
            icon={<LeftOutlined />} 
            onClick={onBack} 
            title="Geri Dön" 
          />
        </Col>
        <Col span={15}>
          {isEditing ? (
            <Space className="map-name-edit">
              <Input
                value={mapName}
                onChange={(e) => setMapName(e.target.value)}
                onKeyPress={handleKeyPress}
                onBlur={handleSave}
                autoFocus
                size="large"
                style={{ width: '300px' }}
              />
              <Button 
                type="primary" 
                icon={<CheckOutlined />} 
                onClick={handleSave}
                size="large"
              />
            </Space>
          ) : (
            <div className="map-name-display">
              <Title level={4} style={{ margin: 0, display: 'inline-block' }}>
                {mapName}
              </Title>
              <Button 
                type="text" 
                icon={<EditOutlined />} 
                onClick={() => setIsEditing(true)} 
                title="Adı Düzenle"
                className="edit-button"
              />
            </div>
          )}
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

export default MapHeader; 