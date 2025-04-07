import React, { useState } from 'react';
import { Modal, Button, Table, message } from 'antd';
import { DragOutlined } from '@ant-design/icons';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import mindMapService from '../../../services/api/mindmap';
import { stripHtmlTags } from '../components/map-utils';
import './presentation-node-selector.scss';

// Sortable item component
const SortableItem = ({ item }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    border: '1px solid #f0f0f0',
    borderRadius: '4px',
    padding: '12px 16px',
    marginBottom: '8px',
    background: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'move',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        <DragOutlined style={{ marginRight: 12, color: '#999' }} />
        <div className="sortable-item-content">
          <div className="sortable-item-text">{item.text}</div>
        </div>
      </div>
    </div>
  );
};

const PresentationNodeSelector = ({ mindMapId, nodes, onSuccess, onCancel }) => {
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [orderedNodes, setOrderedNodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Select nodes, 2: Order nodes

  // Transform ReactFlow nodes to a format easier to work with
  const tableData = nodes.map(node => {
    // Get the node label and strip HTML tags
    const label = node.data?.label || 'İsimsiz Node';
    const cleanLabel = stripHtmlTags(label);
    
    return {
      key: node.id,
      text: cleanLabel,
      rawText: label,
      id: node.id
    };
  });

  const columns = [
    {
      title: 'Node İçeriği',
      dataIndex: 'text',
      key: 'text',
      render: (text) => <div style={{ fontWeight: 500 }}>{text}</div>,
    }
  ];

  const rowSelection = {
    selectedRowKeys: selectedNodes.map(node => node.key),
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedNodes(selectedRows);
    },
  };

  // DND Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setOrderedNodes((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleContinueToOrdering = () => {
    if (selectedNodes.length === 0) {
      message.warning('Lütfen en az bir node seçin');
      return;
    }
    
    // Start with the selected nodes order
    setOrderedNodes([...selectedNodes]);
    setStep(2);
  };

  const handleBackToSelection = () => {
    setStep(1);
  };

  const handleCreatePresentation = async () => {
    if (orderedNodes.length === 0) {
      message.warning('Düzenlenmiş node bulunamadı');
      return;
    }

    setLoading(true);
    try {
      const presentationNodes = orderedNodes.map(node => ({
        nodeText: node.rawText, // Use the original HTML text for the API
        nodeId: node.id
      }));

      const data = {
        mindMapId,
        presentationNodes
      };

      const response = await mindMapService.createMindMapPresentation(data);
      
      if (response.data && response.data.isSuccess) {
        message.success('Sunum başarıyla oluşturuldu');
        if (onSuccess) onSuccess();
      } else {
        message.error('Sunum oluşturulurken bir hata oluştu');
      }
    } catch (error) {
      message.error('Sunum oluşturulurken bir hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderFooter = () => {
    if (step === 1) {
      return [
        <Button key="cancel" onClick={onCancel}>
          İptal
        </Button>,
        <Button 
          key="continue" 
          type="primary" 
          onClick={handleContinueToOrdering}
          disabled={selectedNodes.length === 0}
        >
          Devam Et
        </Button>
      ];
    } else {
      return [
        <Button key="back" onClick={handleBackToSelection}>
          Geri
        </Button>,
        <Button 
          key="create" 
          type="primary" 
          onClick={handleCreatePresentation}
          loading={loading}
        >
          Sunum Oluştur
        </Button>
      ];
    }
  };

  const renderStepContent = () => {
    if (step === 1) {
      // Step 1: Select nodes
      return (
        <>
          <div className="presentation-selector-info">
            Sunumda göstermek istediğiniz içerikleri seçin.
          </div>
          
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={tableData}
            pagination={tableData.length > 10 ? { pageSize: 10 } : false}
            className="presentation-node-table"
          />
          
          <div className="presentation-selection-summary">
            {selectedNodes.length > 0 ? (
              <span>Seçilen içerik sayısı: <strong>{selectedNodes.length}</strong></span>
            ) : (
              <span>Henüz içerik seçilmedi</span>
            )}
          </div>
        </>
      );
    } else {
      // Step 2: Order nodes with drag and drop
      return (
        <>
          <div className="presentation-ordering-info">
            Sunumda gösterilecek içerikleri sıralamak için sürükleyip bırakın.
          </div>
          
          <div className="sortable-container">
            <DndContext 
              sensors={sensors} 
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={orderedNodes.map(item => item.id)} strategy={verticalListSortingStrategy}>
                {orderedNodes.map((item) => (
                  <SortableItem key={item.id} item={item} />
                ))}
              </SortableContext>
            </DndContext>
          </div>
          
          <div className="presentation-ordering-summary">
            Sunum sırası: İçerikler yukarıdan aşağıya doğru gösterilecektir.
          </div>
        </>
      );
    }
  };

  return (
    <Modal
      title={step === 1 ? "Sunum İçeriklerini Seçin" : "Sunum Sıralamasını Düzenleyin"}
      open={true}
      onCancel={onCancel}
      width={800}
      footer={renderFooter()}
    >
      {renderStepContent()}
    </Modal>
  );
};

export default PresentationNodeSelector; 