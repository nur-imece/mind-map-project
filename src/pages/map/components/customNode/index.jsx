import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import Handles from './components/handles.jsx';
import TextEditor from './components/textEditor.jsx';
import AddButtons from './components/addButtons.jsx';
import NodeEditOptions from './components/nodeEditOptions.jsx';

import useImageHandler from '../imageHandler';
import {
    findPositionWithoutOverlap,
    getPlainTextFromHTML,
    getNodePosition,
    getRandomSoftColor,
    NODE_SHAPES
} from './components/utils.js';

import './index.scss';

const Index = memo(({ data, isConnectable, selected, id, saveMapFnRef }) => {
    // ----------------------------------------------------------------
    // State ve Ref'ler
    // ----------------------------------------------------------------
    const [visibleDropdown, setVisibleDropdown] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editableText, setEditableText] = useState('');
    const [imageZoom, setImageZoom] = useState(100);
    const [showEditOptions, setShowEditOptions] = useState(false);
    const [selectedShape, setSelectedShape] = useState(NODE_SHAPES[0]);
    const [selectedFontFamily, setSelectedFontFamily] = useState(null);

    const nodeRef = useRef(null);
    const fileInputRef = useRef(null);

    const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();

    // Image handler fonksiyonları (kendi hook'unuzdan gelenler)
    const {
        handleImageSelected,
        handlePasteEvent,
        setupImageNodeEventListeners,
        applyImageZoom
        // ... diğer fonksiyonlar
    } = useImageHandler();

    // ----------------------------------------------------------------
    // Effect'ler
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

    // (2) Image node ise nodeRef'e event listener bağlama
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

    // Yazı rengini düzeltme fonksiyonu
    const fixTextColor = () => {
        const nodes = getNodes();
        const updatedNodes = nodes.map(node => {
            if (node.data.color === node.data.bgColor) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        color: '#000000' // Yazı rengini siyah yap
                    }
                };
            }
            return node;
        });
        setNodes(updatedNodes);
    };

    // Component mount olduğunda yazı rengini düzelt
    useEffect(() => {
        fixTextColor();
    }, []);

    // ----------------------------------------------------------------
    // Callback'ler ve yardımcı fonksiyonlar
    // ----------------------------------------------------------------

    // ID'yi data'dan veya URL paramlarından alma
    const getMindMapId = useCallback(() => {
        if (data && data.mindMapId) {
            return data.mindMapId;
        }
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id') || '';
    }, [data]);

    // Tekst düzenleme başlat
    const startEditing = () => {
        // HTML'den düz metni çıkar ve emojiyi kod adına dönüştür
        let plainText = getPlainTextFromHTML(data.label);
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
                        // Emoji kodlarını içeren metni kaydet (Unicode olarak değil)
                        label: editableText
                    }
                };
            }
            return node;
        });
        setNodes(updatedNodes);
        setIsEditing(false);
        
        // Trigger save operation if saveMapFnRef is available
        if (saveMapFnRef && saveMapFnRef.current) {
            setTimeout(() => {
                saveMapFnRef.current({
                    nodes: updatedNodes,
                    edges: getEdges()
                });
            }, 100);
        }
    };

    // Metin değişikliğini state'e at
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

        // Renk belirleme - sadece kök düğümden ekleniyorsa yeni renk oluştur
        // Check if current node is a root node (has no incoming edges)
        const isRootNode = !edges.some(edge => edge.target === id);
        
        // Renk belirleme - Sadece kök düğümden ekleniyorsa yeni renk oluştur, değilse parent'ın rengini kullan
        const nodeColor = isRootNode ? getRandomSoftColor() : currentNode.data.bgColor;
        // Yazı rengi için kontrast renk oluştur
        const textColor = '#000000'; // Varsayılan olarak siyah

        // Node verisi
        const newNode = {
            id: newNodeId,
            position: newPosition,
            data: {
                label: content,
                bgColor: nodeColor, // Parent'ın rengini kullan veya kök ise yeni renk
                color: textColor, // Metin rengi siyah olarak ayarla
                fontSize: currentNode.data.fontSize,
                fontFamily: currentNode.data.fontFamily,
                borderRadius: currentNode.data.borderRadius,
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
                stroke: nodeColor, // Aynı rengi edge'e uygula
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

    // Düzenleme seçeneklerini göster/gizle
    const handleEditClick = () => {
        setShowEditOptions(!showEditOptions);
    };

    // Modal kapatma fonksiyonu
    const handleCloseEditOptions = () => {
        setShowEditOptions(false);
    };

    // Yazı tipi değiştirme
    const handleFontChange = (fontFamily) => {
        const nodes = getNodes();
        const updatedNodes = nodes.map(node => {
            if (node.id === id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        fontFamily
                    }
                };
            }
            return node;
        });
        setNodes(updatedNodes);
        setSelectedFontFamily(fontFamily);
    };

    // Metin stili değiştirme (bold, italic, underline)
    const handleTextStyleChange = (styleType) => {
        const nodes = getNodes();
        let updatedLabel = '';
        
        // Mevcut etiketi alıp HTML formatında stilize et
        const currentLabel = data.label;
        
        switch(styleType) {
            case 'bold':
                // Eğer etikette <b> varsa kaldır, yoksa ekle
                if (currentLabel.includes('<b>') && currentLabel.includes('</b>')) {
                    updatedLabel = currentLabel.replace(/<b>(.*?)<\/b>/g, '$1');
                } else {
                    updatedLabel = `<b>${currentLabel}</b>`;
                }
                break;
            case 'italic':
                // Eğer etikette <i> varsa kaldır, yoksa ekle
                if (currentLabel.includes('<i>') && currentLabel.includes('</i>')) {
                    updatedLabel = currentLabel.replace(/<i>(.*?)<\/i>/g, '$1');
                } else {
                    updatedLabel = `<i>${currentLabel}</i>`;
                }
                break;
            case 'underline':
                // Eğer etikette <u> varsa kaldır, yoksa ekle
                if (currentLabel.includes('<u>') && currentLabel.includes('</u>')) {
                    updatedLabel = currentLabel.replace(/<u>(.*?)<\/u>/g, '$1');
                } else {
                    updatedLabel = `<u>${currentLabel}</u>`;
                }
                break;
            default:
                return;
        }
        
        // Düğümü güncelle
        const updatedNodes = nodes.map(node => {
            if (node.id === id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        label: updatedLabel
                    }
                };
            }
            return node;
        });
        
        setNodes(updatedNodes);
    };

    // Renk değiştirme (yazı rengi veya arkaplan rengi)
    const handleColorChange = (colorType, colorValue) => {
        const nodes = getNodes();
        const edges = getEdges();
        const updatedNodes = nodes.map(node => {
            if (node.id === id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        ...(colorType === 'textColor' 
                            ? { color: colorValue } 
                            : { bgColor: colorValue })
                    }
                };
            }
            return node;
        });

        // Eğer arkaplan rengi değiştiyse, bu node'a bağlı edge'lerin rengini de güncelle
        let updatedEdges = edges;
        if (colorType === 'bgColor') {
            updatedEdges = edges.map(edge => {
                if (edge.source === id || edge.target === id) {
                    return {
                        ...edge,
                        style: {
                            ...edge.style,
                            stroke: colorValue
                        }
                    };
                }
                return edge;
            });
            setEdges(updatedEdges);
        }

        setNodes(updatedNodes);

        // Değişiklikleri kaydet
        if (saveMapFnRef && saveMapFnRef.current) {
            setTimeout(() => {
                saveMapFnRef.current({
                    nodes: updatedNodes,
                    edges: updatedEdges
                });
            }, 100);
        }
    };

    // İkon ekleme fonksiyonu yerine emoji ekleme fonksiyonu
    const handleAddEmoji = (emoji) => {
        if (!emoji) return;
        
        const nodes = getNodes();
        
        const updatedNodes = nodes.map(node => {
            if (node.id === id) {
                // Emoji karakterini (Unicode) direkt olarak mevcut metne ekle
                const updatedLabel = node.data.label + emoji;
                return {
                    ...node,
                    data: {
                        ...node.data,
                        label: updatedLabel
                    }
                };
            }
            return node;
        });
        
        // Set the updated nodes
        setNodes(updatedNodes);
        
        // Close the edit options modal after adding emoji
        setShowEditOptions(false);
        
        // Trigger save operation if saveMapFnRef is available
        if (saveMapFnRef && saveMapFnRef.current) {
            setTimeout(() => {
                saveMapFnRef.current({
                    nodes: updatedNodes,
                    edges: getEdges()
                });
            }, 100);
        }
    };

    // Düğüm boyutunu değiştirme
    const handleSizeChange = (dimension, value) => {
        const nodes = getNodes();
        const updatedNodes = nodes.map(node => {
            if (node.id === id) {
                if (dimension === 'reset') {
                    // Boyutu sıfırlama - değerleri "auto" yerine null yaparak tam sıfırlama sağlıyoruz
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            style: {
                                ...node.data.style,
                                width: null,
                                height: null,
                                minWidth: null,
                                minHeight: null
                            }
                        }
                    };
                } else if (dimension === 'auto') {
                    // İçeriğe göre otomatik boyutlandırma (bir karakter sayısını temel alabilir)
                    const textLength = node.data.label.length;
                    const estimatedWidth = Math.max(160, Math.min(400, textLength * 10));
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            style: {
                                ...node.data.style,
                                width: estimatedWidth
                            }
                        }
                    };
                } else {
                    // Boyutu belirli bir değere ayarlama (genişlik veya yükseklik)
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            style: {
                                ...node.data.style,
                                [dimension]: value
                            }
                        }
                    };
                }
            }
            return node;
        });
        setNodes(updatedNodes);
    };

    // Şekil değiştirme
    const handleShapeChange = (shape) => {
        const nodes = getNodes();
        const updatedNodes = nodes.map(node => {
            if (node.id === id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        borderRadius: shape.borderRadius,
                        shape: shape.name,
                        style: {
                            ...node.data.style,
                            customStyle: shape.customStyle || {}
                        }
                    }
                };
            }
            return node;
        });
        setNodes(updatedNodes);
        setSelectedShape(shape);
    };

    // Node konumu (root/left/right?)
    const nodePosition = getNodePosition(getEdges(), id);
    console.log("nodePosition", nodePosition)

    // Stil düzenlemeleri
    const nodeClassName = `
    custom-node 
    ${data.noBorder ? 'no-border' : ''} 
    ${data.isImageNode ? 'image-node' : ''} 
    ${selected ? 'selected' : ''}
  `.trim();

    // Stil hesaplamaları
    const getNodeStyle = () => {
        const style = {
            backgroundColor: data.bgColor || '#FFFFFF',
            borderRadius: data.borderRadius || '8px',
            fontFamily: data.fontFamily || 'inherit',
            color: data.color || '#000000',
            border: '1px solid #d9d9d9',
            padding: '8px 12px',
            position: 'relative',
            transition: 'all 0.3s cubic-bezier(.08,.82,.17,1)',
        };

        // Genişlik, yükseklik ve minimum genişlik/yükseklik ayarları
        if (data.style?.width) {
            style.width = data.style.width;
            style.minWidth = data.style.width;
        } else {
            style.minWidth = '160px';
            style.width = 'auto';
        }

        if (data.style?.height) {
            style.height = data.style.height;
            style.minHeight = data.style.height;
        } else {
            style.minHeight = '40px';
            style.height = 'auto';
        }

        // CustomStyle'ı ekle (varsa)
        if (data.style?.customStyle) {
            Object.assign(style, data.style.customStyle);
        }

        // NoBoard ve ImageNode durumları için ek stiller
        if (data.noBorder) {
            style.border = 'none';
            style.boxShadow = 'none';
            style.background = 'transparent';
        }

        if (data.isImageNode) {
            style.background = 'transparent';
            style.border = 'none';
            style.padding = '0';
            style.boxShadow = 'none';
            if (selected) {
                style.border = '2px dashed #1890ff';
                style.padding = '5px';
                style.borderRadius = '4px';
            }
        }

        return style;
    };

    const nodeStyle = getNodeStyle();

    // Mevcut yazı stillerini kontrol et
    const getCurrentStyles = () => {
        const label = data.label || '';
        return {
            isBold: label.includes('<b>') && label.includes('</b>'),
            isItalic: label.includes('<i>') && label.includes('</i>'),
            isUnderline: label.includes('<u>') && label.includes('</u>')
        };
    };

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
                        fontFamily={data.fontFamily}
                    />
                ) : (
                    <div
                        className="html-content"
                        dangerouslySetInnerHTML={{ 
                            __html: data.label || ''
                        }}
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
                        fontFamily={data.fontFamily}
                    />
                ) : (
                    <div
                        className="html-content"
                        dangerouslySetInnerHTML={{ 
                            __html: data.label || ''
                        }}
                    />
                )}

                {/* Düzenleme paneli */}
                {showEditOptions && !data.isImageNode && (
                    <NodeEditOptions
                        onFontChange={handleFontChange}
                        onShapeChange={handleShapeChange}
                        onTextStyleChange={handleTextStyleChange}
                        onColorChange={handleColorChange}
                        onAddEmoji={handleAddEmoji}
                        onSizeChange={handleSizeChange}
                        selectedFontFamily={selectedFontFamily}
                        selectedShape={selectedShape}
                        currentNodeSize={{
                            width: data.style?.width || 160,
                            height: data.style?.height || 40
                        }}
                        currentStyles={getCurrentStyles()}
                        onClose={handleCloseEditOptions}
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
                    handleEditClick={handleEditClick}
                    selected={selected}
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
                    handleEditClick={handleEditClick}
                    selected={selected}
                />
            )}
        </>
    );
});

export default Index;
