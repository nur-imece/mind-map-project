import React, { memo, useState, useCallback } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Button, Dropdown, Input } from 'antd';
import {
    PlusOutlined,
    PictureOutlined,
    FontSizeOutlined,
    BranchesOutlined
} from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import './customNode.scss';

/**
 * side: 'root'   => 4 tane source handle (top/right/bottom/left)
 * side: 'left'   => sourceLeft, targetRight
 * side: 'right'  => sourceRight, targetLeft
 * side: 'top'    => sourceTop, targetBottom
 * side: 'bottom' => sourceBottom, targetTop
 */
const CustomNode = memo(({ data, isConnectable, selected, id }) => {
    const [visibleDropdown, setVisibleDropdown] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editableText, setEditableText] = useState('');
    const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();

    const handleAddClick = (position) => {
        setVisibleDropdown(position);
    };

    // Parse HTML content to get plain text
    const getPlainTextFromHTML = (html) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html || '';
        return tempDiv.textContent || tempDiv.innerText || '';
    };

    // Enable text editing
    const startEditing = () => {
        // Extract plain text from HTML content
        const plainText = getPlainTextFromHTML(data.label);
        setEditableText(plainText);
        setIsEditing(true);
    };

    // Save the edited text
    const saveText = () => {
        const nodes = getNodes();
        const updatedNodes = nodes.map(node => {
            if (node.id === id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        label: editableText
                    }
                };
            }
            return node;
        });
        setNodes(updatedNodes);
        setIsEditing(false);
    };

    // Handle text change
    const handleTextChange = (e) => {
        setEditableText(e.target.value);
    };

    // Handle keyboard events (Enter to save, Escape to cancel)
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            saveText();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
        }
    };

    // Ebeveyne en yakın boşluğu bularak yeni node konumunu hesapla
// Tek sütunda dikey dizilim:
// - direction === 'right' ise parentX + 300 civarına yerleştir
// - direction === 'left'  ise parentX - 300 civarına yerleştir
// - Sonra while döngüsüyle çakışma varsa y'yi step kadar artır (alttan alta diz)
    function findPositionWithoutOverlap(parentX, parentY, direction, allNodes) {
        // Node ölçümleri (ortalama genişlik / yükseklik)
        const nodeWidth = 160;
        const nodeHeight = 60;

        // Node'lar arasına eklemek istediğiniz "boşluk" (margin)
        // Yatay yerleşimde kenarların üst üste binmemesi için de faydalı olur
        const margin = 20;

        // Ebeveynden uzaklaşma miktarı
        // (sağdaysa parent'ın sağ kenarı + offset,
        // soldaysa parent'ın sol kenarı - offset)
        const offset = 260;

        // Eğer sağa ekliyorsak...
        let newX = direction === 'right'
            ? parentX + nodeWidth + offset
            : parentX - nodeWidth - offset;

        // Başlangıçta, parent'ın Y hizasını baz al
        let newY = parentY;

        // Çakışma kontrolü (margin dahil)
        const overlaps = (x1, y1, node2) => {
            const x2 = node2.position.x;
            const y2 = node2.position.y;
            const w2 = node2.__width || nodeWidth;
            const h2 = node2.__height || nodeHeight;

            // Şu kadar da margin ekleyelim ki node'lar biraz daha boşluklu olsun
            const totalWidth = nodeWidth + margin;
            const totalHeight = nodeHeight + margin;

            // İki dikdörtgenin çakışıp çakışmadığını kontrol et
            return !(
                x1 + totalWidth < x2 ||
                x1 > x2 + w2 + margin ||
                y1 + totalHeight < y2 ||
                y1 > y2 + h2 + margin
            );
        };

        // Bir çakışma bulduğumuz sürece Y'yi step kadar aşağı al
        const verticalStep = 80;
        while (allNodes.some((n) => overlaps(newX, newY, n))) {
            newY += verticalStep;
        }

        return { x: newX, y: newY };
    }


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

    const handleOptionClick = (action, position) => {
        switch(action) {
            case 'text':
                // Add a text node with no-border styling
                addNewNode(position, 'text', '', true);
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

    const addNewNode = (position, nodeType = 'text', content = '', noBorder = false) => {
        // Get current nodes and edges
        const nodes = getNodes();
        const edges = getEdges();
        
        // Find the current node
        const currentNode = nodes.find(node => node.id === id);
        if (!currentNode) return;
        
        // Create new node id
        const newNodeId = uuidv4();
        
        // Parent'a en yakın boşluğa göre konumu hesapla
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
                nodeType: position, // Mark as 'left' or 'right' based on where it was created
                noBorder: noBorder // Add noBorder flag
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

    // Green icons style matching the reference image
    const iconStyle = { 
        fontSize: '16px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    };

    const dropdownItems = [
        {
            key: 'text',
            label: <FontSizeOutlined className="node-menu-icon" style={iconStyle} />,
            onClick: () => handleOptionClick('text', visibleDropdown),
        },
        {
            key: 'node',
            label: <BranchesOutlined className="node-menu-icon" style={iconStyle} />,
            onClick: () => handleOptionClick('node', visibleDropdown),
        },
        {
            key: 'image',
            label: <PictureOutlined className="node-menu-icon" style={iconStyle} />,
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
        if (incomingEdge.sourceHandle === 'sourceLeft' || incomingEdge.sourceHandle === 'sourceBottom') {
            return 'left'; // Node is on the left side of its parent
        } else if (incomingEdge.sourceHandle === 'sourceRight' || incomingEdge.sourceHandle === 'sourceTop') {
            return 'right'; // Node is on the right side of its parent
        }

        return 'unknown';
    }, [getEdges, id]);

    // Menünün arka planını şeffaf yapacak stiller
    const transparentMenuStyle = {
        boxShadow: 'none',
        background: 'transparent',
    };

    // Dropdown overlay stilleri
    const dropdownOverlayStyle = {
        background: 'transparent',
        boxShadow: 'none'
    };

    // Dropdown menu stilini özelleştirme
    const dropdownProps = {
        menu: { items: dropdownItems },
        trigger: ['click'],
        overlayStyle: {
            background: 'transparent',
            boxShadow: 'none',
            minWidth: 'auto',
            padding: 0
        },
        overlayClassName: 'custom-node-dropdown-menu',
        dropdownRender: (menu) => (
            <div style={{
                background: 'transparent',
                boxShadow: 'none',
                minWidth: 'auto',
                borderRadius: '50%'
            }}>
                {React.cloneElement(menu, {
                    style: {
                        background: 'transparent',
                        boxShadow: 'none',
                        padding: 0,
                        borderRadius: '8px'
                    }
                })}
            </div>
        )
    };

    // Only show buttons when selected
    if (!selected) {
        const nodeStyle = {
            background: data.bgColor || '#FFFFFF',
            color: data.color || '#000000',
            fontSize: data.fontSize ? `${data.fontSize}px` : '16px',
            borderColor: data.color,
            padding: '10px 16px',
            borderRadius: '8px',
            minWidth: '160px',
            minHeight: '40px',
            position: 'relative',
        };

        // Apply no-border styling if specified
        if (data.noBorder) {
            nodeStyle.border = 'none';
            nodeStyle.boxShadow = 'none';
            nodeStyle.background = 'transparent';
        }

        return (
            <div
                className={`custom-node ${data.noBorder ? 'no-border' : ''}`}
                style={nodeStyle}
                onDoubleClick={startEditing}
            >
                <Handle id="targetLeft" type="target" position={Position.Left} isConnectable={isConnectable} className="node-handle hidden-handle" style={{ opacity: 0 }} />
                <Handle id="targetRight" type="target" position={Position.Right} isConnectable={isConnectable} className="node-handle hidden-handle" style={{ opacity: 0 }} />
                <Handle id="targetTop" type="target" position={Position.Top} isConnectable={isConnectable} className="node-handle hidden-handle" style={{ opacity: 0 }} />
                <Handle id="targetBottom" type="target" position={Position.Bottom} isConnectable={isConnectable} className="node-handle hidden-handle" style={{ opacity: 0 }} />

                {isEditing ? (
                    <Input.TextArea
                        autoSize
                        value={editableText}
                        onChange={handleTextChange}
                        onBlur={saveText}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className="no-border"
                        style={{
                            fontSize: data.fontSize ? `${data.fontSize}px` : '16px',
                            color: data.color || '#000000',
                            background: 'transparent',
                            border: 'none',
                            boxShadow: 'none',
                            width: '100%',
                            resize: 'none'
                        }}
                    />
                ) : (
                    <div className="html-content" dangerouslySetInnerHTML={{ __html: data.label }} />
                )}

                <Handle id="sourceLeft" type="source" position={Position.Left} isConnectable={isConnectable} className="node-handle hidden-handle" style={{ opacity: 0 }} />
                <Handle id="sourceRight" type="source" position={Position.Right} isConnectable={isConnectable} className="node-handle hidden-handle" style={{ opacity: 0 }} />
                <Handle id="sourceTop" type="source" position={Position.Top} isConnectable={isConnectable} className="node-handle hidden-handle" style={{ opacity: 0 }} />
                <Handle id="sourceBottom" type="source" position={Position.Bottom} isConnectable={isConnectable} className="node-handle hidden-handle" style={{ opacity: 0 }} />
            </div>
        );
    }

    const nodePosition = getNodePosition();
    console.log("nodePosition",nodePosition)
    const rootNode = nodePosition === 'root';
    const leftNode = nodePosition === 'left';
    const rightNode = nodePosition === 'right';

    // Determine which buttons to show based on node position
    const showLeftButton = rootNode || leftNode;
    const showRightButton = rootNode || rightNode;

    const nodeStyle = {
        background: data.bgColor || '#FFFFFF',
        color: data.color || '#000000',
        fontSize: data.fontSize ? `${data.fontSize}px` : '16px',
        borderColor: data.color,
        padding: '10px 16px',
        borderRadius: '8px',
        minWidth: '160px',
        minHeight: '40px',
        position: 'relative',
    };

    // Apply no-border styling if specified
    if (data.noBorder) {
        nodeStyle.border = 'none';
        nodeStyle.boxShadow = 'none';
        nodeStyle.background = 'transparent';
    }

    return (
        <>
            <div
                className={`custom-node selected ${data.noBorder ? 'no-border' : ''}`}
                style={nodeStyle}
                onDoubleClick={startEditing}
            >
                {/* TARGET handle'lar (4 yön) - invisible but functional */}
                <Handle id="targetLeft" type="target" position={Position.Left} isConnectable={isConnectable} className="node-handle hidden-handle" style={{ opacity: 0 }} />
                <Handle id="targetRight" type="target" position={Position.Right} isConnectable={isConnectable} className="node-handle hidden-handle" style={{ opacity: 0 }} />
                <Handle id="targetTop" type="target" position={Position.Top} isConnectable={isConnectable} className="node-handle hidden-handle" style={{ opacity: 0 }} />
                <Handle id="targetBottom" type="target" position={Position.Bottom} isConnectable={isConnectable} className="node-handle hidden-handle" style={{ opacity: 0 }} />

                {/* İçerik */}
                {isEditing ? (
                    <Input.TextArea
                        autoSize
                        value={editableText}
                        onChange={handleTextChange}
                        onBlur={saveText}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className="no-border"
                        style={{
                            fontSize: data.fontSize ? `${data.fontSize}px` : '16px',
                            color: data.color || '#000000',
                            background: 'transparent',
                            border: 'none',
                            boxShadow: 'none',
                            width: '100%',
                            resize: 'none'
                        }}
                    />
                ) : (
                    <div className="html-content" dangerouslySetInnerHTML={{ __html: data.label }} />
                )}

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
                        {...dropdownProps}
                        placement="leftTop" 
                        open={visibleDropdown === 'left'}
                        onOpenChange={(open) => !open && setVisibleDropdown(null)}
                        className="custom-node-dropdown"
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
                        {...dropdownProps}
                        placement="rightTop"
                        open={visibleDropdown === 'right'}
                        onOpenChange={(open) => !open && setVisibleDropdown(null)}
                        className="custom-node-dropdown"
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
