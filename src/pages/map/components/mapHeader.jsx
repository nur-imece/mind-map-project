import React, { useState, useEffect, useRef } from 'react';
import { Button, Typography, Space, Tag, Row, Col, Tooltip, Dropdown, message, Modal, Input, Form, Radio, Select, Tabs } from 'antd';
import { 
  LeftOutlined, 
  EditOutlined, 
  HeartOutlined, 
  HeartFilled,
  ShareAltOutlined, 
  CopyOutlined, 
  DownloadOutlined
} from '@ant-design/icons';
import SharedUsersList from './shared-users-list';

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const MapHeader = ({ mapData, onBack, onNameChange, onSave, saveInProgress, onFavoriteToggle, onShareMap, onDuplicateMap, onDownloadMap, sharedUsers, onRemoveSharedUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [shareType, setShareType] = useState('private');
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState('Görüntüleyen');
  const [downloadFormat, setDownloadFormat] = useState('A4');
  const [activeTab, setActiveTab] = useState('1');
  const titleRef = useRef(null);
  const [form] = Form.useForm();

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

  const handleFavoriteToggle = () => {
    if (typeof onFavoriteToggle === 'function') {
      onFavoriteToggle(!mapData.isFavorite);
    }
  };

  const showShareModal = () => {
    setShareModalVisible(true);
  };

  const handleShareModalCancel = () => {
    setShareModalVisible(false);
    form.resetFields();
  };

  const handleShareSubmit = () => {
    form.validateFields().then(values => {
      if (shareType === 'private') {
        const shareData = {
          mindMapId: mapData.id,
          users: [{
            email: values.email,
            mapPermissionId: values.permission === 'Görüntüleyen' ? '1' : '2',
            mapPermissionValue: values.permission
          }]
        };
        onShareMap(shareData, 'private');
      } else {
        // For public sharing, confirm first
        Modal.confirm({
          title: 'Haritayı Herkese Açık Yap',
          content: 'Bu işlem haritayı herkese açık yapacak ve herkes tarafından görüntülenebilir hale getirecektir. Devam etmek istiyor musunuz?',
          okText: 'Evet, Herkese Açık Yap',
          cancelText: 'İptal',
          onOk: () => {
            const shareData = {
              mindMapId: mapData.id,
              isPublicMap: true
            };
            onShareMap(shareData, 'public');
          }
        });
      }
      setShareModalVisible(false);
      form.resetFields();
    });
  };

  const showDownloadModal = () => {
    setDownloadModalVisible(true);
  };

  const handleDownloadModalCancel = () => {
    setDownloadModalVisible(false);
  };

  const handleDownloadSubmit = () => {
    if (typeof onDownloadMap === 'function') {
      onDownloadMap(downloadFormat);
    }
    setDownloadModalVisible(false);
  };

  const handleDuplicateMap = () => {
    if (typeof onDuplicateMap === 'function') {
      onDuplicateMap();
    }
  };

  const shareModalItems = [
    {
      key: '1',
      label: 'Yeni Paylaşım',
      children: (
        <Form form={form} layout="vertical">
          <Form.Item name="shareType" label="Paylaşım Tipi">
            <Radio.Group 
              value={shareType} 
              onChange={(e) => setShareType(e.target.value)}
            >
              <Radio value="private">Kişiyle Paylaş</Radio>
              <Radio value="public">Genel Paylaşım</Radio>
            </Radio.Group>
          </Form.Item>

          {shareType === 'private' && (
            <>
              <Form.Item 
                name="email" 
                label="E-posta" 
                rules={[{ required: true, message: 'E-posta adresi gerekli!' }, { type: 'email', message: 'Geçerli bir e-posta girin!' }]}
              >
                <Input 
                  placeholder="E-posta adresi girin" 
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                />
              </Form.Item>
              
              <Form.Item name="permission" label="İzin" initialValue="Görüntüleyen">
                <Select 
                  value={sharePermission} 
                  onChange={(value) => setSharePermission(value)}
                  options={[
                    { value: 'Görüntüleyen', label: 'Görüntüleyen' },
                    { value: 'Düzenleyen', label: 'Düzenleyen' }
                  ]}
                />
              </Form.Item>
            </>
          )}
          
          {shareType === 'public' && (
            <p>Bu seçenek haritayı genel erişime açar. Herkes bu haritayı görüntüleyebilir.</p>
          )}
        </Form>
      )
    },
    {
      key: '2',
      label: 'Paylaşılanlar Listesi',
      children: (
        <SharedUsersList 
          users={sharedUsers || []} 
          onRemoveUser={onRemoveSharedUser} 
        />
      )
    }
  ];

  return (
    <div className="map-header">
      <Row gutter={[24, 16]} align="middle" justify="space-between">
        <Col flex="none">
          <Button 
            type="text" 
            icon={<LeftOutlined />} 
            onClick={onBack} 
            title="Geri Dön"
            style={{ paddingLeft: 0 }}
          />
        </Col>
        <Col flex="auto" style={{ paddingLeft: 20 }}>
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