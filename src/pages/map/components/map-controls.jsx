import React, { useState } from 'react';
import { Button, Space, Tooltip, Modal, Form, Radio, Select, Input, Tabs, Dropdown, message } from 'antd';
import { 
  HeartOutlined, 
  HeartFilled,
  ShareAltOutlined, 
  CopyOutlined, 
  DownloadOutlined,
  SaveOutlined,
  PlayCircleOutlined,
  DesktopOutlined
} from '@ant-design/icons';
import SharedUsersList from './shared-users-list';
import BackgroundChanger from './backgroundChanger';
import './map-controls.css';
import mindMapService from '../../../services/api/mindmap';
import SaveTemplateModal from './save-template-modal.jsx';
import MindMapPresentation, { initPresentation } from './mind-map-presentation';
import PresentationNodeSelector from './presentation-node-selector';

const MapControls = ({ 
  mapData, 
  onFavoriteToggle, 
  onShareMap, 
  onDuplicateMap, 
  onDownloadMap,
  sharedUsers,
  onRemoveSharedUser,
  onBackgroundChange,
  nodes,
  reactFlowInstance
}) => {
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [saveTemplateModalVisible, setSaveTemplateModalVisible] = useState(false);
  const [presentationSelectorVisible, setPresentationSelectorVisible] = useState(false);
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

  const showSaveTemplateModal = () => {
    setSaveTemplateModalVisible(true);
  };

  const handleSaveTemplateModalClose = () => {
    setSaveTemplateModalVisible(false);
  };

  const showPresentationSelector = () => {
    setPresentationSelectorVisible(true);
  };

  const handlePresentationSelectorClose = () => {
    setPresentationSelectorVisible(false);
  };

  const handlePresentationCreated = () => {
    setPresentationSelectorVisible(false);
  };

  // Sunum başlatma fonksiyonu
  const startPresentation = () => {
    console.log('Sunum başlatma isteği yapıldı:', mapData?.id, reactFlowInstance);
    if (!mapData?.id) {
      console.error('mapData.id bulunamadı');
      message.error('Harita ID\'si bulunamadı');
      return;
    }
    
    if (!reactFlowInstance) {
      console.error('reactFlowInstance bulunamadı');
      message.error('Harita henüz tam olarak yüklenmedi. Lütfen tekrar deneyin.');
      return;
    }

    const allNodes = reactFlowInstance.getNodes();
    if (!allNodes || allNodes.length === 0) {
      console.error('Haritada düğüm bulunamadı');
      message.error('Haritada gösterilecek düğüm bulunamadı');
      return;
    }
    
    console.log('reactFlowInstance OK, nodlar:', allNodes.length);
    console.log('Örnek node ID\'leri:', allNodes.slice(0, 3).map(n => n.id));
    
    message.loading({ content: 'Sunum başlatılıyor...', key: 'presentationLoading' });
    
    // Önce sunum verilerini getir ve node eşleşmesini kontrol et
    mindMapService.getPresentationByMindMapId(mapData.id)
      .then(response => {
        console.log('Sunumu getir yanıtı:', response);
        
        if (response.data && response.data.data && 
            response.data.data.presentationNodes && 
            response.data.data.presentationNodes.length > 0) {
          
          console.log('Sunum verileri alındı, node kontrolü yapılıyor...');
          const allMapNodes = allNodes.map(n => n.id);
          const presentationNodes = response.data.data.presentationNodes.map(n => n.nodeId);
          
          // Eksik node kontrolü
          const missingNodes = presentationNodes.filter(id => !allMapNodes.includes(id));
          
          if (missingNodes.length > 0) {
            console.warn('Sunumda var olan ancak haritada bulunmayan nodeler:', missingNodes);
            message.destroy('presentationLoading');
            Modal.confirm({
              title: 'Sunum Güncel Değil',
              content: 'Bu sunum güncel değil. Haritada artık bulunmayan düğümler içeriyor. Yeni bir sunum oluşturmak ister misiniz?',
              okText: 'Evet, Yeniden Oluştur',
              cancelText: 'Hayır, Bu Sunumu Kullan',
              onOk: () => {
                showPresentationSelector();
              },
              onCancel: () => {
                // Kullanıcı mevcut sunumu kullanmak istiyorsa
                console.log('Kullanıcı eksik nodelarla devam etmek istiyor');
                
                const validNodes = presentationNodes.filter(id => allMapNodes.includes(id));
                if (validNodes.length === 0) {
                  message.error('Haritayla eşleşen hiçbir sunum düğümü kalmadı. Lütfen yeni bir sunum oluşturun.');
                  return;
                }
                
                // Eğer hala geçerli node varsa devam et
                message.loading({ content: 'Sunum başlatılıyor...', key: 'presentationLoading' });
                initPresentation(mapData.id, reactFlowInstance)
                  .then(success => {
                    console.log('initPresentation sonucu:', success);
                    message.destroy('presentationLoading');
                    if (success) {
                      // Doğrudan odaklanmayı tetikle - ek yardımcı kod
                      const presentationFirstNode = response.data.data.presentationNodes[0].nodeId;
                      const node = reactFlowInstance.getNode(presentationFirstNode);
                      if (node) {
                        // Önce genel görünüm
                        reactFlowInstance.fitView({ duration: 800 });
                        
                        // Sonra düğüme odaklan
                        setTimeout(() => {
                          reactFlowInstance.fitView({
                            nodes: [node],
                            padding: 0.1,
                            duration: 800,
                            maxZoom: 3.5
                          });
                          
                          // Düğümü vurgula
                          reactFlowInstance.setNodes((nds) => 
                            nds.map((n) => ({
                              ...n,
                              data: { 
                                ...n.data,
                                isHighlighted: n.id === presentationFirstNode
                              }
                            }))
                          );
                          
                          // UI'ı temizle
                          document.body.classList.add('presentation-mode');
                          console.log('Sunum modu (doğrudan) aktif edildi');
                        }, 100);
                      }
                      
                      message.success('Sunum başlatıldı');
                    } else {
                      message.warning('Sunum başlatılırken uyarı oluştu');
                    }
                  })
                  .catch(error => {
                    console.error('Sunum başlatma hatası:', error);
                    message.destroy('presentationLoading');
                    message.error('Sunum başlatılamadı');
                  });
              }
            });
            return;
          }
          
          // Eğer eksik node yoksa direkt başlat
          console.log('Nodeler eşleşti, sunum başlatılıyor...');
          initPresentation(mapData.id, reactFlowInstance)
            .then(success => {
              console.log('initPresentation sonucu:', success);
              message.destroy('presentationLoading');
              if (success) {
                // Doğrudan odaklanmayı tetikle - ek yardımcı kod
                const presentationFirstNode = response.data.data.presentationNodes[0].nodeId;
                const node = reactFlowInstance.getNode(presentationFirstNode);
                if (node) {
                  // Önce genel görünüm
                  reactFlowInstance.fitView({ duration: 800 });
                  
                  // Sonra düğüme odaklan
                  setTimeout(() => {
                    reactFlowInstance.fitView({
                      nodes: [node],
                      padding: 0.1,
                      duration: 800,
                      maxZoom: 3.5
                    });
                    
                    // Düğümü vurgula
                    reactFlowInstance.setNodes((nds) => 
                      nds.map((n) => ({
                        ...n,
                        data: { 
                          ...n.data,
                          isHighlighted: n.id === presentationFirstNode
                        }
                      }))
                    );
                    
                    // UI'ı temizle
                    document.body.classList.add('presentation-mode');
                    console.log('Sunum modu (doğrudan) aktif edildi');
                  }, 100);
                }
                
                message.success('Sunum başlatıldı');
              }
            })
            .catch(error => {
              console.error('Sunum başlatma hatası:', error);
              message.destroy('presentationLoading');
              message.error('Sunum başlatılırken bir hata oluştu');
            });
        } else {
          // Hiç sunum yoksa seçici göster
          console.log('Daha önce oluşturulmuş sunum bulunamadı.');
          message.destroy('presentationLoading');
          message.info('Bu harita için oluşturulmuş bir sunum bulunmamaktadır. Yeni bir sunum oluşturun.');
          showPresentationSelector();
        }
      })
      .catch(error => {
        console.error('Sunum veri kontrolü hatası:', error);
        message.destroy('presentationLoading');
        message.error('Sunum verisi kontrol edilirken bir hata oluştu');
      });
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
          
          <Tooltip title="Şablon Olarak Kaydet">
            <Button 
              className="control-button"
              type="text"
              icon={<SaveOutlined style={{ fontSize: '20px' }} />}
              onClick={showSaveTemplateModal}
            />
          </Tooltip>
        </Space>
      </div>

      {/* Sunum Başlatma/Oluşturma Butonları - Alt Merkez */}
      <div className="presentation-controls-container">
        <div className="presentation-buttons-wrapper">
          <Tooltip title="Video Sunum">
            <div 
              className="presentation-mode-button"
              onClick={startPresentation}
            >
              <span className="presentation-icon video-icon"></span>
            </div>
          </Tooltip>

          <Tooltip title="Ekran Sunumu">
            <div 
              className="presentation-mode-button"
              onClick={showPresentationSelector}
            >
              <span className="presentation-icon screen-icon"></span>
            </div>
          </Tooltip>
        </div>
      </div>

      {/* Mevcut MindMapPresentation bileşenini koşullu olarak göster */}
      {mapData?.id && !presentationSelectorVisible && (
        <MindMapPresentation 
          mindMapId={mapData.id} 
          reactFlowInstance={reactFlowInstance}
          onEditPresentation={showPresentationSelector}
        />
      )}

      {/* Modallar */}
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

      {/* Presentation Selector Modal */}
      {presentationSelectorVisible && nodes && (
        <PresentationNodeSelector 
          mindMapId={mapData?.id}
          nodes={nodes}
          onSuccess={handlePresentationCreated}
          onCancel={handlePresentationSelectorClose}
        />
      )}

      {/* Save Template Modal */}
      {saveTemplateModalVisible && (
        <SaveTemplateModal 
          visible={saveTemplateModalVisible}
          onClose={handleSaveTemplateModalClose}
          mapData={mapData}
        />
      )}
    </>
  );
};

export default MapControls;