import React, { useState, useEffect } from 'react';
import { Button, Typography, Space, Tag, Divider, Row, Col, Input, Tooltip } from 'antd';
import { LeftOutlined, EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const MapHeader = ({ mapData, onBack, onNameChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nameValue, setNameValue] = useState('');

  useEffect(() => {
    if (mapData?.name) {
      setNameValue(mapData.name);
    }
  }, [mapData?.name]);

  if (!mapData) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const handleEdit = () => {
    setNameValue(mapData.name);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (nameValue.trim() && typeof onNameChange === 'function') {
      onNameChange(nameValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNameValue(mapData.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
      <div className="map-header">
        <Row gutter={[16, 16]} align="middle">
          <Col span={1}>
            <Button type="text" icon={<LeftOutlined />} onClick={onBack} title="Geri Dön" />
          </Col>
          <Col span={15}>
            {isEditing ? (
              <Space>
                <Input 
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onPressEnter={handleSave}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  maxLength={100}
                  style={{ fontSize: '18px', fontWeight: 'bold', width: '300px' }}
                />
                <Button 
                  type="primary" 
                  icon={<CheckOutlined />} 
                  onClick={handleSave}
                  size="small"
                />
                <Button 
                  type="default" 
                  icon={<CloseOutlined />} 
                  onClick={handleCancel}
                  size="small"
                />
              </Space>
            ) : (
              <Space size={6}>
                <Title level={4} style={{ margin: 0 }}>{mapData.name}</Title>
                <Tooltip title="Harita adını düzenle">
                  <Button 
                    type="text" 
                    icon={<EditOutlined />} 
                    onClick={handleEdit}
                    className="edit-button"
                    size="small"
                  />
                </Tooltip>
              </Space>
            )}
            <Space size="small" wrap style={{ marginTop: '4px' }}>
              {mapData.isPublic && <Tag color="green">Herkese Açık</Tag>}
              {mapData.isDownloadable && <Tag color="blue">İndirilebilir</Tag>}
            </Space>
          </Col>
        </Row>
        <Divider style={{ margin: '12px 0' }} />
      </div>
  );
};

export default MapHeader; 