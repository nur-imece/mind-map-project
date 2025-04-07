import React, { useState } from 'react';
import { Button, Space, Tooltip, Modal, Form, Radio, Select, Input, Tabs, Dropdown } from 'antd';
import { 
  HeartOutlined, 
  HeartFilled,
  ShareAltOutlined, 
  CopyOutlined, 
  DownloadOutlined
} from '@ant-design/icons';
import SharedUsersList from './shared-users-list';
import BackgroundChanger from './backgroundChanger';
import './map-controls.css';
import mindMapService from '../../../services/api/mindmap';


const MapControls = ({ 
  mapData, 
  onFavoriteToggle, 
  onShareMap, 
  onDuplicateMap, 
  onDownloadMap,
  sharedUsers,
  onRemoveSharedUser,
  onBackgroundChange
}) => {
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [shareType, setShareType] = useState('private');
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState('Görüntüleyen');
  const [downloadFormat, setDownloadFormat] = useState('A4');
  const [activeTab, setActiveTab] = useState('1');
  const [form] = Form.useForm();

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

  const handleDownloadSubmit = async () => {
    try {
      const response = await mindMapService.isMapDownloadable(mapData.id);
      console.log("response", response);
      
      if (response.data.isSuccess) {
        onDownloadMap(downloadFormat);
        setDownloadModalVisible(false);
      } else {
        Modal.error({
          title: 'İndirme Hatası',
          content: 'Bu harita indirilebilir değil.',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      Modal.error({
        title: 'İndirme Hatası',
        content: 'Bir hata oluştu.',
      });
    }
  };

  const handleDuplicateMap = () => {
    if (typeof onDuplicateMap === 'function') {
      onDuplicateMap();
    }
  };

  const handleBackgroundSelect = ({ key }) => {
    if (typeof onBackgroundChange === 'function') {
      onBackgroundChange(key);
    }
  };

  const handleFavoriteClick = async () => {
    if (typeof onFavoriteToggle === 'function') {
      await onFavoriteToggle();
    }
  };

  return (
    <>
      <div className="map-controls-container">
        <Space size="middle">
          <Tooltip title={mapData?.isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}>
            <Button 
              className="control-button"
              type="text"
              icon={mapData?.isFavorite ? <HeartFilled style={{ color: '#ff4d4f', fontSize: '20px' }} /> : <HeartOutlined style={{ fontSize: '20px' }} />}
              onClick={handleFavoriteClick}
            />
          </Tooltip>
          
          <Tooltip title="Paylaş">
            <Button 
              className="control-button"
              type="text"
              icon={<ShareAltOutlined style={{ fontSize: '20px' }} />}
              onClick={showShareModal}
            />
          </Tooltip>

          <Tooltip title="Haritanın kopyasını oluştur">
            <Button 
              className="control-button"
              type="text"
              icon={<CopyOutlined style={{ fontSize: '20px' }} />}
              onClick={handleDuplicateMap}
            />
          </Tooltip>

          <BackgroundChanger 
            onBackgroundChange={onBackgroundChange}
            initialBackgroundName={mapData?.backgroundName}
          />

          <Tooltip title="İndir">
            <Button 
              className="control-button"
              type="text"
              icon={<DownloadOutlined style={{ fontSize: '20px' }} />}
              onClick={showDownloadModal}
            />
          </Tooltip>
        </Space>
      </div>

      {/* Share Modal */}
      <Modal
        title="Haritayı Paylaş"
        open={shareModalVisible}
        onCancel={handleShareModalCancel}
        onOk={handleShareSubmit}
        okText="Paylaş"
        cancelText="İptal"
        width={600}
      >
        <Tabs 
          items={[
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
          ]}
          onChange={setActiveTab}
          activeKey={activeTab}
        />
      </Modal>

      {/* Download Modal */}
      <Modal
        title="Haritayı İndir"
        open={downloadModalVisible}
        onCancel={handleDownloadModalCancel}
        footer={[
          <Button key="cancel" onClick={handleDownloadModalCancel}>
            İptal
          </Button>,
          <Button 
            key="download" 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={handleDownloadSubmit}
          >
            İndir
          </Button>
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="Format">
            <Radio.Group 
              value={downloadFormat} 
              onChange={(e) => setDownloadFormat(e.target.value)}
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <Radio value="A4">A4 (210×297mm) - Standart kağıt boyutu</Radio>
              <Radio value="A3">A3 (297×420mm) - Orta büyüklükteki haritalar için</Radio>
              <Radio value="A2">A2 (420×594mm) - Çok büyük haritalar için</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default MapControls; 