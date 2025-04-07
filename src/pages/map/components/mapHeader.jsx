import React, { useState, useEffect, useRef } from 'react';
import { Button, Typography, Space, Tag, Row, Col, Tooltip } from 'antd';
import { LeftOutlined, EditOutlined } from '@ant-design/icons';

const { Title } = Typography;

const MapHeader = ({ mapData, onBack, onNameChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const titleRef = useRef(null);

  useEffect(() => {
    if (mapData?.name) {
      setNameValue(mapData.name);
    }
  }, [mapData?.name]);

  useEffect(() => {
    if (isEditing && titleRef.current) {
      titleRef.current.focus();
      // Cursor'u en sona konumlandır
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(titleRef.current);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [isEditing]);

  if (!mapData) return null;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    if (isEditing) {
      const newName = titleRef.current.innerText.trim();
      if (newName && newName !== mapData.name && typeof onNameChange === 'function') {
        onNameChange(newName);
      }
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      titleRef.current.blur();
    } else if (e.key === 'Escape') {
      titleRef.current.innerText = mapData.name;
      setIsEditing(false);
    }
  };

  return (
    <div className="map-header">
      <Row gutter={[24, 16]} align="middle">
        <Col span={2}>
          <Button 
            type="text" 
            icon={<LeftOutlined />} 
            onClick={onBack} 
            title="Geri Dön"
            style={{ paddingLeft: 0 }}
          />
        </Col>
        <Col span={14} style={{ paddingLeft: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              ref={titleRef}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="editable-title"
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                outline: 'none',
                padding: '4px 6px',
                borderRadius: '4px',
                maxWidth: '200px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                background: isEditing ? '#f5f5f5' : 'transparent',
                border: isEditing ? '1px solid #d9d9d9' : 'none',
                marginRight: '4px'
              }}
            >
              {mapData.name}
            </div>
            {!isEditing && (
              <Tooltip title="Harita adını düzenle">
                <Button 
                  type="text" 
                  icon={<EditOutlined />} 
                  onClick={handleEdit}
                  className="edit-button"
                  size="small"
                />
              </Tooltip>
            )}
          </div>
          <Space size="small" wrap style={{ marginTop: '2px' }}>
            {mapData.isPublic && <Tag color="green">Herkese Açık</Tag>}
            {mapData.isDownloadable && <Tag color="blue">İndirilebilir</Tag>}
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default MapHeader; 