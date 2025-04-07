import React, { useState, useEffect, useRef } from 'react';
import { Button, message, Progress, Tooltip } from 'antd';
import { LeftOutlined, RightOutlined, CloseOutlined } from '@ant-design/icons';
import mindMapService from '../../../services/api/mindmap';
import { stripHtmlTags } from './map-utils';
import './mind-map-presentation.scss';

// Sunum için global durum - component dışı erişime izin vermek için
let globalPresentationInstance = null;

const MindMapPresentation = ({ mindMapId, reactFlowInstance, onEditPresentation }) => {
  const [loading, setLoading] = useState(false);
  const [presentationData, setPresentationData] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  // Global durumu React state'ine dönüştürelim
  const [presentationInstance, setPresentationInstance] = useState(null);
  
  // useRef ile tek seferlik odaklanma takibi yapalım
  const initialFocusRef = useRef(false);
  const currentTimestampRef = useRef(null);
  
  // Global durum değiştiğinde React state'ini güncelle - böylece re-render tetiklenecek
  useEffect(() => {
    // Timestamp değişmediyse tekrar çalıştırmayalım
    if (!globalPresentationInstance || 
        currentTimestampRef.current === globalPresentationInstance.timestamp) {
      return;
    }
    
    console.log('Global durum değişti, timestamp:', globalPresentationInstance.timestamp);
    currentTimestampRef.current = globalPresentationInstance.timestamp;
    
    // Önce state'i güncelle
    setPresentationInstance(globalPresentationInstance);
    
    // Sunum verilerini getir
    const getAndSetPresentationData = async () => {
      try {
        setLoading(true);
        const response = await mindMapService.getPresentationByMindMapId(globalPresentationInstance.mindMapId);
        
        if (response.data && response.data.data && 
            response.data.data.presentationNodes && 
            response.data.data.presentationNodes.length > 0) {
          
          console.log('Sunum verileri başarıyla yüklendi');
          setPresentationData(response.data.data);
          setCurrentStep(0);
          
          // Sunum modunu aktifleştir
          document.body.classList.add('presentation-mode');
          
          // Sadece ilk kez odaklanma yapıyoruz - tekrarlı render'larda odaklanmayı önler
          if (!initialFocusRef.current) {
            initialFocusRef.current = true;
            
            // İlk node'a odaklan
            setTimeout(() => {
              const firstNodeId = response.data.data.presentationNodes[0].nodeId;
              focusOnNode(firstNodeId);
            }, 100);
          }
        } else {
          console.log('Sunum verisi bulunamadı');
          message.info('Bu harita için oluşturulmuş bir sunum bulunmamaktadır');
        }
      } catch (error) {
        console.error('Sunum verileri getirilirken hata:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getAndSetPresentationData();
  }, [globalPresentationInstance?.timestamp]); // Sadece timestamp değiştiğinde tetikle
  
  // Sunum sonlandığında veya adımlar arasında geçişte ref sıfırlama
  useEffect(() => {
    // presentationData null ise (sunum sonlandığında) initialFocus'u sıfırla
    if (!presentationData) {
      initialFocusRef.current = false;
    }
  }, [presentationData]);
  
  // Focus the view on a specific node with maximum zoom
  const focusOnNode = (nodeId) => {
    console.log('focusOnNode çağrıldı:', nodeId);
    
    if (!reactFlowInstance) {
      console.error('reactFlowInstance bulunamadı');
      return;
    }
    
    const node = reactFlowInstance.getNode(nodeId);
    
    if (node) {
      try {
        // Fit view to focus on the node with maximum zoom
        reactFlowInstance.fitView({
          nodes: [node],
          padding: 0.1,  // Minimum padding for maximum zoom
          duration: 800,
          maxZoom: 3.5   // Maximum zoom level
        });
        
        // Highlight the current node
        reactFlowInstance.setNodes((nds) => 
          nds.map((n) => ({
            ...n,
            data: { 
              ...n.data,
              isHighlighted: n.id === nodeId
            }
          }))
        );
        
        console.log('Node başarıyla odaklandı');
      } catch (error) {
        console.error('Node odaklama hatası:', error);
      }
    } else {
      console.error('Belirtilen ID ile node bulunamadı:', nodeId);
      message.error('Sunum düğümü bulunamadı. Lütfen sunumu yeniden oluşturun.');
    }
  };

  // Handle next button click
  const handleNext = () => {
    if (!presentationData || 
        currentStep >= presentationData.presentationNodes.length - 1) {
      console.log('Sonraki adıma geçilemiyor: Son adımdasınız veya sunum verisi yok');
      return;
    }
    
    const nextStep = currentStep + 1;
    
    // Önce node'un var olduğunu kontrol et
    const nextNodeId = presentationData.presentationNodes[nextStep].nodeId;
    const nextNode = reactFlowInstance.getNode(nextNodeId);
    
    if (!nextNode) {
      console.error('Sonraki node bulunamadı:', nextNodeId);
      message.error('Sunumdaki düğüm haritada bulunamadı. Sunumu yeniden oluşturun.');
      return;
    }
    
    // Önce state'i güncelle, sonra odaklan
    setCurrentStep(nextStep);
    setTimeout(() => {
      focusOnNode(nextNodeId);
    }, 50);
  };

  // Handle previous button click
  const handlePrev = () => {
    if (!presentationData || currentStep <= 0) {
      console.log('Önceki adıma geçilemiyor: İlk adımdasınız veya sunum verisi yok');
      return;
    }
    
    const prevStep = currentStep - 1;
    
    // Önce node'un var olduğunu kontrol et
    const prevNodeId = presentationData.presentationNodes[prevStep].nodeId;
    const prevNode = reactFlowInstance.getNode(prevNodeId);
    
    if (!prevNode) {
      console.error('Önceki node bulunamadı:', prevNodeId);
      message.error('Sunumdaki düğüm haritada bulunamadı. Sunumu yeniden oluşturun.');
      return;
    }
    
    // Önce state'i güncelle, sonra odaklan
    setCurrentStep(prevStep);
    setTimeout(() => {
      focusOnNode(prevNodeId);
    }, 50);
  };

  // End presentation and reset state
  const endPresentation = () => {
    // Reset node highlighting
    if (reactFlowInstance) {
      reactFlowInstance.setNodes((nds) => 
        nds.map((n) => ({
          ...n,
          data: { 
            ...n.data,
            isHighlighted: false
          }
        }))
      );
      
      // Reset view to fit all nodes
      reactFlowInstance.fitView({ duration: 800 });
    }
    
    // Sunum modunu kapat
    document.body.classList.remove('presentation-mode');
    
    // Reset states and refs
    setPresentationData(null);
    setCurrentStep(0);
    globalPresentationInstance = null; // Global referansı temizle
    setPresentationInstance(null); // React state'ini de temizle
    initialFocusRef.current = false; // Odaklanma ref'ini sıfırla
    currentTimestampRef.current = null; // Timestamp ref'ini sıfırla
  };

  // Bileşen temizleme işlevi
  useEffect(() => {
    // Temizleme işlevi - bileşen kaldırıldığında sunum modunu temizle
    return () => {
      if (document.body.classList.contains('presentation-mode')) {
        console.log('Bileşen kaldırıldı: presentation-mode class silindi');
        document.body.classList.remove('presentation-mode');
      }
    };
  }, []);

  // If no presentation is started, show nothing
  if (!presentationData && !presentationInstance) {
    return null;
  }
  
  // Eğer presentationInstance var ama henüz presentationData yüklenmediyse yükleniyor göster
  if (presentationInstance && !presentationData) {
    return (
      <div className="map-presentation-controls">
        <div className="presentation-loading">Sunum yükleniyor...</div>
      </div>
    );
  }

  // Otherwise, show only minimal presentation controls
  return (
    <div className="map-presentation-controls">      
      <div className="presentation-buttons">
        <div className="nav-buttons-container">
          <Button 
            type="primary"
            shape="circle" 
            icon={<LeftOutlined />} 
            onClick={handlePrev} 
            disabled={!presentationData || currentStep === 0}
            className="presentation-nav-button"
            size="middle"
          />
          
          <Button 
            type="primary"
            shape="circle" 
            icon={<RightOutlined />} 
            onClick={handleNext} 
            disabled={!presentationData || currentStep >= presentationData.presentationNodes.length - 1}
            className="presentation-nav-button"
            size="middle"
          />
        </div>
        
        <Button 
          danger
          type="primary"
          shape="circle" 
          icon={<CloseOutlined />} 
          onClick={endPresentation}
          className="presentation-close-button"
          size="small"
          style={{ marginTop: '10px', display: 'block', margin: '10px auto 0' }}
        />
      </div>
    </div>
  );
};

// Dışa aktarılan başlatma fonksiyonu
export function initPresentation(mindMapId, reactFlowInstance) {
  // Eğer zaten bir sunum varsa ve aynı mindMapId ile çağrıldıysa, yeni bir sunum başlatmıyoruz
  if (globalPresentationInstance && globalPresentationInstance.mindMapId === mindMapId) {
    console.log('Zaten aktif bir sunum bulunuyor, aynı harita için yeniden başlatma atlanıyor');
    return Promise.resolve(true);
  }

  // Global referansı ayarla - sadece yeni bir sunum başlatıldığında
  console.log('initPresentation çağrıldı - yeni global referans ayarlanıyor');
  
  // Global değişkeni güncelleme - sadece yeni bir sunum ya da farklı bir harita için
  globalPresentationInstance = { 
    mindMapId, 
    reactFlowInstance,
    timestamp: new Date().getTime() // Değişikliği algılamak için zaman damgası
  };
  
  // Sunumu başlatma isteği gönder, ancak UI güncellemelerini MindMapPresentation bileşenine bırak
  return mindMapService.getPresentationByMindMapId(mindMapId)
    .then(response => {
      if (response.data && response.data.data && 
          response.data.data.presentationNodes && 
          response.data.data.presentationNodes.length > 0) {
        return true;
      } else {
        message.info('Bu harita için oluşturulmuş bir sunum bulunmamaktadır');
        globalPresentationInstance = null;
        return false;
      }
    })
    .catch(error => {
      console.error('Presentation error:', error);
      message.error('Sunum başlatılırken bir hata oluştu');
      globalPresentationInstance = null;
      return false;
    });
}

export { MindMapPresentation as default }; 