import React, { useState } from 'react';
import { Button, Space, Tooltip, Modal, Form, Radio, Select, Input, Tabs, Dropdown } from 'antd';
import { 
  HeartOutlined, 
  HeartFilled,
  ShareAltOutlined, 
  CopyOutlined, 
  DownloadOutlined,
  PictureOutlined
} from '@ant-design/icons';
import SharedUsersList from './shared-users-list';
import BackgroundChanger from './backgroundChanger';
import './map-controls.css';

const backgroundOptions = [
  { key: 'dots', label: 'Noktalar' },
  { key: 'lines', label: 'Çizgiler' },
  { key: 'cross', label: 'Çapraz Çizgiler' },
  { key: 'none', label: 'Arkaplan Yok' }
];

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
            key="a4-download" 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={() => {
              setDownloadFormat('A4');
              handleDownloadSubmit();
            }}
          >
            A4 Olarak İndir
          </Button>,
          <Button 
            key="custom-download" 
            type="primary"
            onClick={handleDownloadSubmit}
          >
            Seçili Format ile İndir
          </Button>
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="Format">
            <Radio.Group 
              value={downloadFormat} 
              onChange={(e) => setDownloadFormat(e.target.value)}
            >
              <Radio value="A2">A2</Radio>
              <Radio value="A3">A3</Radio>
              <Radio value="A4">A4</Radio>
            </Radio.Group>
          </Form.Item>
          <div style={{ marginTop: 16 }}>
            <ul>
              <li><strong>A2:</strong> Çok büyük haritalar için (420×594mm)</li>
              <li><strong>A3:</strong> Orta büyüklükteki haritalar için (297×420mm)</li>
              <li><strong>A4:</strong> Standart kağıt boyutu (210×297mm)</li>
            </ul>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default MapControls; 