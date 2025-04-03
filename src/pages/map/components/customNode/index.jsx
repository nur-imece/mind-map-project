import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import Handles from './components/handles.jsx';
import TextEditor from './components/textEditor.jsx';
import AddButtons from './components/addButtons.jsx';

import useImageHandler from '../imageHandler';
import {
    findPositionWithoutOverlap,
    getPlainTextFromHTML,
    getNodePosition
} from './components/utils.js';

import './index.scss';

const Index = memo(({ data, isConnectable, selected, id }) => {
    // ----------------------------------------------------------------
    // State ve Ref’ler
    // ----------------------------------------------------------------
    const [visibleDropdown, setVisibleDropdown] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editableText, setEditableText] = useState('');
    const [imageZoom, setImageZoom] = useState(100);

    const nodeRef = useRef(null);
    const fileInputRef = useRef(null);

    const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();

    // Image handler fonksiyonları (kendi hook’unuzdan gelenler)
    const {
        handleImageSelected,
        handlePasteEvent,
        setupImageNodeEventListeners,
        applyImageZoom
        // ... diğer fonksiyonlar
    } = useImageHandler();

    // ----------------------------------------------------------------
    // Effect’ler
    // ----------------------------------------------------------------

    // (1) Pano'ya (paste) bir resim yapıştırma olayını dinleme
    useEffect(() => {
        if (selected && data) {
            const handlePaste = async (e) => {
                await handlePasteEvent(
                    e,
                    id,
                    isEditing,
                    data,
                    startEditing,
                    setEditableText
                );
            };
            document.addEventListener('paste', handlePaste);
            return () => {
                document.removeEventListener('paste', handlePaste);
            };
        }
    }, [selected, data, id, isEditing, handlePasteEvent]);

    // (2) Image node ise nodeRef’e event listener bağlama
    useEffect(() => {
        if (data.isImageNode && nodeRef.current) {
            const cleanup = setupImageNodeEventListeners(nodeRef, id, setImageZoom);
            return cleanup;
        }
    }, [data.isImageNode, id, setupImageNodeEventListeners]);

    // (3) Zoom değiştiğinde resmi yeniden ölçekle
    useEffect(() => {
        if (data.isImageNode) {
            applyImageZoom(nodeRef, imageZoom);
        }
    }, [imageZoom, data.isImageNode, applyImageZoom]);

    // ----------------------------------------------------------------
    // Callback’ler ve yardımcı fonksiyonlar
    // ----------------------------------------------------------------

    // ID’yi data’dan veya URL paramlarından alma
    const getMindMapId = useCallback(() => {
        if (data && data.mindMapId) {
            return data.mindMapId;
        }
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id') || '';
    }, [data]);

    // Tekst düzenleme başlat
    const startEditing = () => {
        const plainText = getPlainTextFromHTML(data.label);
        setEditableText(plainText);
        setIsEditing(true);
    };

    // Düzenlenen metni kaydet
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

    // Metin değişikliğini state’e at
    const handleTextChange = (e) => {
        setEditableText(e.target.value);
    };

    // Enter/Escape kısayolları
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            saveText();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
        }
    };

    // Yeni node ekleme
    const addNewNode = (position, nodeType = 'text', content = '', noBorder = false) => {
        const nodes = getNodes();
        const edges = getEdges();

        const currentNode = nodes.find(node => node.id === id);
        if (!currentNode) return;

        // Yeni node ID
        const newNodeId = crypto.randomUUID?.() || // Bazı tarayıcılar destekliyor
            require('uuid').v4();    // Ya da uuid paketinden
        // (Kodunuzda uuidv4 kullanıyorsanız import etmeyi unutmayın)

        // Uygun boş konumu bul
        const newPosition = findPositionWithoutOverlap(
            currentNode.position.x,
            currentNode.position.y,
            position,
            nodes
        );

        // Node verisi
        const newNode = {
            id: newNodeId,
            position: newPosition,
            data: {
                label: content,
                bgColor: currentNode.data.bgColor,
                color: currentNode.data.color,
                fontSize: currentNode.data.fontSize,
                absPos: newPosition,
                nodeType: position,
                noBorder,
                mindMapId: getMindMapId()
            },
            type: 'customNode'
        };

        // Eklenecek edge
        let sourceHandle, targetHandle;
        if (position === 'right') {
            sourceHandle = 'sourceRight';
            targetHandle = 'targetLeft';
        } else {
            sourceHandle = 'sourceLeft';
            targetHandle = 'targetRight';
        }

        const newEdge = {
            id: `edge-${id}-${newNodeId}`,
            source: id,
            target: newNodeId,
            sourceHandle,
            targetHandle,
            type: 'default',
            style: {
                strokeWidth: 2,
                stroke: currentNode.data.color || '#1890ff',
                curvature: 0
            },
            animated: false
        };

        setNodes([...nodes, newNode]);
        setEdges([...edges, newEdge]);
    };

    // Dropdown içindeki seçeneklere tıklayınca yapılacaklar
    const handleOptionClick = (action, position) => {
        switch(action) {
            case 'text':
                addNewNode(position, 'text', '', true);
                setVisibleDropdown(null);
                break;
            case 'node':
                addNewNode(position, 'text');
                setVisibleDropdown(null);
                break;
            case 'image':
                // Konumu saklayıp file input tetiklenebilir
                sessionStorage.setItem('pendingImageNodePosition', position);
                setVisibleDropdown(null);

                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.style.display = 'none';
                input.onchange = (e) => handleImageSelected(e.target.files[0], id);
                document.body.appendChild(input);
                input.click();
                document.body.removeChild(input);
                break;
            default:
                break;
        }
    };

    // Dropdown açma/kapatma
    const handleAddClick = (position) => {
        setVisibleDropdown(position);
    };

    // Node konumu (root/left/right?)
    const nodePosition = getNodePosition(getEdges(), id);

    // Stil düzenlemeleri
    const nodeClassName = `
    custom-node 
    ${data.noBorder ? 'no-border' : ''} 
    ${data.isImageNode ? 'image-node' : ''} 
    ${selected ? 'selected' : ''}
  `.trim();

    const nodeStyle = {
        background: data.bgColor || '#FFFFFF',
        color: data.color || '#000000',
        fontSize: data.fontSize ? `${data.fontSize}px` : '16px',
        borderColor: data.color,
        padding: '10px 16px',
        borderRadius: '8px',
        minWidth: data.isImageNode ? 'auto' : '160px',
        minHeight: data.isImageNode ? 'auto' : '40px',
        position: 'relative'
    };

    if (data.noBorder) {
        nodeStyle.border = 'none';
        nodeStyle.boxShadow = 'none';
        nodeStyle.background = 'transparent';
    }

    if (data.isImageNode) {
        nodeStyle.background = 'transparent';
        nodeStyle.border = 'none';
        nodeStyle.padding = '0';
        nodeStyle.boxShadow = 'none';
        if (selected) {
            nodeStyle.border = '2px dashed #1890ff';
            nodeStyle.padding = '5px';
            nodeStyle.borderRadius = '4px';
        }
    }

    // Seçilmemiş halde butonları göstermeye gerek yok
    if (!selected) {
        return (
            <div
                ref={nodeRef}
                className={nodeClassName}
                style={nodeStyle}
                onDoubleClick={data.isImageNode ? null : startEditing}
            >
                <Handles
                    data={data}
                    selected={selected}
                    isConnectable={isConnectable}
                />
                {isEditing && !data.isImageNode ? (
                    <TextEditor
                        value={editableText}
                        onChange={handleTextChange}
                        onBlur={saveText}
                        onKeyDown={handleKeyDown}
                        fontSize={data.fontSize}
                        color={data.color}
                    />
                ) : (
                    <div
                        className="html-content"
                        dangerouslySetInnerHTML={{ __html: data.label }}
                    />
                )}
            </div>
        );
    }

    // Seçildiğinde sol/sağ butonları (AddButtons) göster
    const isRootNode = (nodePosition === 'root');
    const leftNode = (nodePosition === 'left');
    const rightNode = (nodePosition === 'right');

    const showLeftButton = isRootNode || leftNode;
    const showRightButton = isRootNode || rightNode;

    return (
        <>
            <div
                ref={nodeRef}
                className={nodeClassName}
                style={nodeStyle}
                onDoubleClick={data.isImageNode ? null : startEditing}
            >
                <Handles
                    data={data}
                    selected={selected}
                    isConnectable={isConnectable}
                />

                {isEditing && !data.isImageNode ? (
                    <TextEditor
                        value={editableText}
                        onChange={handleTextChange}
                        onBlur={saveText}
                        onKeyDown={handleKeyDown}
                        fontSize={data.fontSize}
                        color={data.color}
                    />
                ) : (
                    <div
                        className="html-content"
                        dangerouslySetInnerHTML={{ __html: data.label }}
                    />
                )}
            </div>

            {/* Sol buton */}
            {(data.showButtons || !data.isImageNode) && showLeftButton && (
                <AddButtons
                    side="left"
                    visibleDropdown={visibleDropdown}
                    setVisibleDropdown={setVisibleDropdown}
                    handleAddClick={handleAddClick}
                    handleOptionClick={handleOptionClick}
                />
            )}

            {/* Sağ buton */}
            {(data.showButtons || !data.isImageNode) && showRightButton && (
                <AddButtons
                    side="right"
                    visibleDropdown={visibleDropdown}
                    setVisibleDropdown={setVisibleDropdown}
                    handleAddClick={handleAddClick}
                    handleOptionClick={handleOptionClick}
                />
            )}
        </>
    );
});

export default Index;
