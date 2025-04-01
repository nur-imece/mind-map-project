// CustomNode.jsx
import React, { memo, useState, useCallback } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Button, Dropdown } from 'antd';
import { PlusOutlined, FileTextOutlined, AppstoreOutlined, PictureOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';

/**
 * side: 'root'   => 4 tane source handle (top/right/bottom/left)
 * side: 'left'   => sourceLeft, targetRight
 * side: 'right'  => sourceRight, targetLeft
 * side: 'top'    => sourceTop, targetBottom
 * side: 'bottom' => sourceBottom, targetTop
 */
const CustomNode = memo(({ data, isConnectable, selected, id }) => {
    const [visibleDropdown, setVisibleDropdown] = useState(null);
    const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();

    const handleAddClick = (position) => {
        setVisibleDropdown(position);
    };

    // Ebeveyne en yakın boşluğu bularak yeni node konumunu hesapla
// Tek sütunda dikey dizilim:
// - direction === 'right' ise parentX + 300 civarına yerleştir
// - direction === 'left'  ise parentX - 300 civarına yerleştir
// - Sonra while döngüsüyle çakışma varsa y'yi step kadar artır (alttan alta diz)
    function findPositionWithoutOverlap(parentX, parentY, direction, allNodes) {
        // Node'un varsayılan genişlik/yükseklik değerleri.
        // Hem ebeveyn hem de yeni node için ~160 px kabul ediyorsanız
        // buradaki değeri aynı şekilde kullanabilirsiniz.
        const nodeWidth = 160;
        const nodeHeight = 60;

        // Ebeveynden yatayda ne kadar uzaklaşsın?
        // (Yani, sağdaysa "parent'ın sağ kenarı + offset",
        //  soldaysa "parent'ın sol kenarı - offset")
        const offset = 260;

        // Çakışma olursa dikeyde ne kadar kaydıralım?
        const verticalStep = 80;

        // Sağa ekliyorsak: yeni node'un sol kenarı = parentX + parentWidth + offset
        // Sola ekliyorsak: yeni node'un sol kenarı = parentX - nodeWidth - offset
        let newX =
            direction === 'right'
                ? parentX + nodeWidth + offset   // parent'ın sağ kenarı + offset
                : parentX - nodeWidth - offset;  // parent'ın sol kenarı - offset - yeni node genişliği

        // Başlangıçta, parent'la aynı Y hizasından deniyoruz
        let newY = parentY;

        // Dikdörtgen çakışma kontrolü (basit)
        const overlaps = (x1, y1, node2) => {
            const x2 = node2.position.x;
            const y2 = node2.position.y;
            const w2 = node2.__width || 160;   // React Flow'da node genişliği __width'te tutulabiliyor
            const h2 = node2.__height || 60;

            // İki dikdörtgen üst üste biniyor mu?
            //  (x1 < x2 + w2) && (x1 + w1 > x2) && (y1 < y2 + h2) && (y1 + h1 > y2)
            return !(
                x1 + nodeWidth < x2 ||  // yeni node tamamen solunda
                x1 > x2 + w2 ||         // yeni node tamamen sağında
                y1 + nodeHeight < y2 || // yeni node tamamen yukarısında
                y1 > y2 + h2            // yeni node tamamen aşağısında
            );
        };

        // Herhangi bir node (ebeveyn dahil) ile çakışma varsa,
        // dikeyde verticalStep kadar aşağı itmeye devam et.
        while (allNodes.some((n) => overlaps(newX, newY, n))) {
            newY += verticalStep;
        }

        // Sonuç pozisyon
        return { x: newX, y: newY };
    }


    // Node'un tüm çocuklarını bul (bu fonksiyonu koruyoruz, gerekebilir)
    const getChildNodes = (nodeId) => {
        const edges = getEdges();
        const childEdges = edges.filter(edge => edge.source === nodeId);
        return childEdges.map(edge => edge.target);
    };

    // Belirli bir yöndeki çocukları bul (sol veya sağ)
    const getDirectionalChildren = (nodeId, direction) => {
        const edges = getEdges();
        const sourceHandle = direction === 'right' ? 'sourceRight' : 'sourceLeft';
        
        return edges
            .filter(edge => edge.source === nodeId && edge.sourceHandle === sourceHandle)
            .map(edge => edge.target);
    };

    // Bağlantı için en uygun handle'ları belirle
    const determineHandles = (sourcePos, targetPos) => {
        // Ana yönü belirle (x ekseninde mi y ekseninde mi daha uzak)
        const dx = targetPos.x - sourcePos.x;
        const dy = targetPos.y - sourcePos.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            // X ekseni baskın - sağ veya sol
            if (dx > 0) {
                // Hedef sağda
                return { sourceHandle: 'sourceRight', targetHandle: 'targetLeft' };
            } else {
                // Hedef solda
                return { sourceHandle: 'sourceLeft', targetHandle: 'targetRight' };
            }
        } else {
            // Y ekseni baskın - yukarı veya aşağı
            if (dy > 0) {
                // Hedef aşağıda
                return { sourceHandle: 'sourceBottom', targetHandle: 'targetTop' };
            } else {
                // Hedef yukarıda
                return { sourceHandle: 'sourceTop', targetHandle: 'targetBottom' };
            }
        }
    };

    const addNewNode = (position, nodeType = 'text', content = '') => {
        // Get current nodes and edges
        const nodes = getNodes();
        const edges = getEdges();
        
        // Find the current node
        const currentNode = nodes.find(node => node.id === id);
        if (!currentNode) return;
        
        // Create new node id
        const newNodeId = uuidv4();
        
        // Parent'a en yakın boşluğa göre konumu hesapla
        // addNewNode içinde örnek:
        const newPosition = findPositionWithoutOverlap(
            currentNode.position.x,  // parentX
            currentNode.position.y,  // parentY
            position,                // 'left' veya 'right'
            nodes                    // mevcut tüm node'lar listesi
        );

        // Create the new node data
        const newNode = {
            id: newNodeId,
            position: newPosition,
            data: {
                label: content,
                bgColor: currentNode.data.bgColor,
                color: currentNode.data.color,
                fontSize: currentNode.data.fontSize,
                absPos: newPosition,
                nodeType: position // Mark as 'left' or 'right' based on where it was created
            },
            type: 'customNode'
        };
        
        // If it's an image node, we'll need to handle image upload later
        if (nodeType === 'image') {
            // This would trigger image upload flow, for now just a placeholder
            newNode.data.label = 'Resim Yükle';
        }
        
        // İki node arasındaki en uygun handle'ları belirle
        const { sourceHandle, targetHandle } = determineHandles(
            { x: currentNode.position.x, y: currentNode.position.y },
            newPosition
        );
        
        // Create edge between current node and new node
        const newEdge = {
            id: `edge-${id}-${newNodeId}`,
            source: id,
            target: newNodeId,
            sourceHandle: sourceHandle,
            targetHandle: targetHandle,
            type: 'default',
            style: { 
                strokeWidth: 1.5,
                stroke: currentNode.data.color || '#1890ff'
            },
            data: {
                styleName: 'Default',
                styleDescription: 'Standard line'
            }
        };
        
        // Update the graph
        setNodes([...nodes, newNode]);
        setEdges([...edges, newEdge]);
        
        // Close dropdown
        setVisibleDropdown(null);
    };

    const handleOptionClick = (action, position) => {
        switch(action) {
            case 'text':
                // Add a text node
                addNewNode(position, 'text');
                break;
            case 'node':
                // Add a new child node
                addNewNode(position, 'text');
                break;
            case 'image':
                // Add an image node
                addNewNode(position, 'image');
                break;
            default:
                break;
        }
    };

    // Green icons style matching the reference image
    const iconStyle = { fontSize: '24px', color: '#52c41a' };

    const dropdownItems = [
        {
            key: 'text',
            label: <FileTextOutlined style={iconStyle} />,
            onClick: () => handleOptionClick('text', visibleDropdown),
        },
        {
            key: 'node',
            label: <AppstoreOutlined style={iconStyle} />,
            onClick: () => handleOptionClick('node', visibleDropdown),
        },
        {
            key: 'image',
            label: <PictureOutlined style={iconStyle} />,
            onClick: () => handleOptionClick('image', visibleDropdown),
        },
    ];

    // Check if this is a root node (no incoming edges)
    const isRootNode = useCallback(() => {
        const edges = getEdges();
        return !edges.some(edge => edge.target === id);
    }, [getEdges, id]);

    // Get node position (left or right of parent)
    const getNodePosition = useCallback(() => {
        const edges = getEdges();
        const incomingEdge = edges.find(edge => edge.target === id);
        
        if (!incomingEdge) return 'root';
        
        // Check which handle was used to create this node
        if (incomingEdge.sourceHandle === 'sourceLeft') {
            return 'left'; // Node is on the left side of its parent
        } else if (incomingEdge.sourceHandle === 'sourceRight') {
            return 'right'; // Node is on the right side of its parent
        }
        
        return 'unknown';
    }, [getEdges, id]);

    // Only show buttons when selected
    if (!selected) {
        return (
            <div
                className="custom-node"
                style={{
                    background: data.bgColor || '#FFFFFF',
                    color: data.color || '#000000',
                    fontSize: data.fontSize ? `${data.fontSize}px` : '16px',
                    borderColor: data.color,
                    padding: '10px 16px',
                    borderRadius: '8px',
                    minWidth: '160px',
                    minHeight: '40px',
                    position: 'relative',
                }}
            >
                <Handle id="targetLeft" type="target" position={Position.Left} isConnectable={isConnectable} className="node-handle hidden-handle" style={{ opacity: 0 }} />
                <Handle id="targetRight" type="target" position={Position.Right} isConnectable={isConnectable} className="node-handle hidden-handle" style={{ opacity: 0 }} />
                <Handle id="targetTop" type="target" position={Position.Top} isConnectable={isConnectable} className="node-handle hidden-handle" style={{ opacity: 0 }} />
                <Handle id="targetBottom" type="target" position={Position.Bottom} isConnectable={isConnectable} className="node-handle hidden-handle" style={{ opacity: 0 }} />

                <div className="html-content" dangerouslySetInnerHTML={{ __html: data.label }} />

                <Handle id="sourceLeft" type="source" position={Position.Left} isConnectable={isConnectable} className="node-handle hidden-handle" style={{ opacity: 0 }} />
                <Handle id="sourceRight" type="source" position={Position.Right} isConnectable={isConnectable} className="node-handle hidden-handle" style={{ opacity: 0 }} />
                <Handle id="sourceTop" type="source" position={Position.Top} isConnectable={isConnectable} className="node-handle hidden-handle" style={{ opacity: 0 }} />
                <Handle id="sourceBottom" type="source" position={Position.Bottom} isConnectable={isConnectable} className="node-handle hidden-handle" style={{ opacity: 0 }} />
            </div>
        );
    }

    const nodePosition = getNodePosition();
    const rootNode = nodePosition === 'root';
    const leftNode = nodePosition === 'left';
    const rightNode = nodePosition === 'right';
    
    // Determine which buttons to show based on node position
    const showLeftButton = rootNode || leftNode;
    const showRightButton = rootNode || rightNode;

    return (
        <>
            <div
                className="custom-node selected"
                style={{
                    background: data.bgColor || '#FFFFFF',
                    color: data.color || '#000000',
                    fontSize: data.fontSize ? `${data.fontSize}px` : '16px',
                    borderColor: data.color,
                    padding: '10px 16px',
                    borderRadius: '8px',
                    minWidth: '160px',
                    minHeight: '40px',
                    position: 'relative',
                }}
            >
                {/* TARGET handle'lar (4 yön) - invisible but functional */}
                <Handle id="targetLeft" type="target" position={Position.Left} isConnectable={isConnectable} className="node-handle hidden-handle" style={{ opacity: 0 }} />
                <Handle id="targetRight" type="target" position={Position.Right} isConnectable={isConnectable} className="node-handle hidden-handle" style={{ opacity: 0 }} />
                <Handle id="targetTop" type="target" position={Position.Top} isConnectable={isConnectable} className="node-handle hidden-handle" style={{ opacity: 0 }} />
                <Handle id="targetBottom" type="target" position={Position.Bottom} isConnectable={isConnectable} className="node-handle hidden-handle" style={{ opacity: 0 }} />

                {/* İçerik */}
                <div className="html-content" dangerouslySetInnerHTML={{ __html: data.label }} />

                {/* SOURCE handle'lar (4 yön) - invisible but functional */}
                <Handle id="sourceLeft" type="source" position={Position.Left} isConnectable={isConnectable} className="node-handle hidden-handle" style={{ opacity: 0 }} />
                <Handle id="sourceRight" type="source" position={Position.Right} isConnectable={isConnectable} className="node-handle hidden-handle" style={{ opacity: 0 }} />
                <Handle id="sourceTop" type="source" position={Position.Top} isConnectable={isConnectable} className="node-handle hidden-handle" style={{ opacity: 0 }} />
                <Handle id="sourceBottom" type="source" position={Position.Bottom} isConnectable={isConnectable} className="node-handle hidden-handle" style={{ opacity: 0 }} />
            </div>

            {/* Left add button - only for root and left nodes */}
            {showLeftButton && (
                <div 
                    style={{ 
                        position: 'absolute', 
                        left: '-30px', 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        zIndex: 1000,
                        pointerEvents: 'all'
                    }}
                >
                    <Dropdown
                        menu={{ items: dropdownItems }}
                        placement="leftTop"
                        open={visibleDropdown === 'left'}
                        onOpenChange={(open) => !open && setVisibleDropdown(null)}
                        trigger={['click']}
                        overlayStyle={{ 
                            background: 'transparent',
                            boxShadow: 'none'
                        }}
                    >
                        <Button
                            type="primary" 
                            shape="circle"
                            size="large"
                            style={{ 
                                backgroundColor: '#52c41a',
                                borderColor: '#52c41a',
                                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                                zIndex: 1000
                            }}
                            icon={<PlusOutlined />}
                            onClick={() => handleAddClick('left')}
                        />
                    </Dropdown>
                </div>
            )}

            {/* Right add button - only for root and right nodes */}
            {showRightButton && (
                <div 
                    style={{ 
                        position: 'absolute', 
                        right: '-30px', 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        zIndex: 1000,
                        pointerEvents: 'all'
                    }}
                >
                    <Dropdown
                        menu={{ items: dropdownItems }}
                        placement="rightTop"
                        open={visibleDropdown === 'right'}
                        onOpenChange={(open) => !open && setVisibleDropdown(null)}
                        trigger={['click']}
                        overlayStyle={{ 
                            background: 'transparent',
                            boxShadow: 'none'
                        }}
                    >
                        <Button
                            type="primary"
                            shape="circle"
                            size="large"
                            style={{ 
                                backgroundColor: '#52c41a',
                                borderColor: '#52c41a',
                                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                                zIndex: 1000
                            }}
                            icon={<PlusOutlined />}
                            onClick={() => handleAddClick('right')}
                        />
                    </Dropdown>
                </div>
            )}
        </>
    );
});

export default CustomNode;
