import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Button, Dropdown, Input } from 'antd';
import {
    PlusOutlined,
    PictureOutlined,
    FontSizeOutlined,
    BranchesOutlined,
    DeleteOutlined,
    ZoomInOutlined,
    ZoomOutOutlined
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
    const [imageZoom, setImageZoom] = useState(100);
    const nodeRef = useRef(null);
    const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();
    const fileInputRef = useRef(null);

    // Effect to handle paste events for image
    useEffect(() => {
        if (selected && data) {
            const handlePaste = async (e) => {
                // Sadece seçili düğümlerde paste işlemini handle et
                if (!selected) return;
                
                // Clipboard verilerini kontrol et
                const items = e.clipboardData?.items;
                if (!items) return;
                
                // Resim içeren bir öğe var mı diye kontrol et
                let hasImageItem = false;
                for (let i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf('image') !== -1) {
                        hasImageItem = true;
                        
                        // Eğer kullanıcı Shift tuşuna basılı tutarak paste yaparsa, yeni child olarak ekle
                        if (e.shiftKey) {
                            e.preventDefault(); // Varsayılan davranışı engelle
                            
                            // Clipboard'daki resmi al
                            const file = items[i].getAsFile();
                            if (!file) continue;
                            
                            // Düğüm konumunu belirle (mevcut düğümün sağına)
                            sessionStorage.setItem('pendingImageNodePosition', 'right');
                            
                            // Resim yükleme fonksiyonunu çağır
                            await handleImageSelected(file);
                            break;
                        } else {
                            // Shift tuşu basılı değilse, düğümün kendisini resimle değiştir
                            e.preventDefault();
                            const file = items[i].getAsFile();
                            if (!file) continue;
                            
                            // Düğümün kendisini resimle değiştirmek için doğrudan yükle
                            await handleNodeContentImageUpload(file);
                            break;
                        }
                    }
                }
                
                // Eğer resim yoksa ve metin varsa, düğümün içeriğini değiştir
                if (!hasImageItem && e.clipboardData.getData('text')) {
                    // İçeriği doğrudan düğüme yapıştır - ama bu ön tanımlı davranış olduğu için
                    // preventDefault() çağırmıyoruz, böylece normal metin girişi çalışmaya devam eder
                    
                    if (!isEditing && !data.isImageNode) {
                        // Eğer şu anda düzenleme modunda değilsek, düzenleme moduna geç
                        e.preventDefault();
                        startEditing();
                        // Kısa bir gecikme ile metni yapıştır
                        setTimeout(() => {
                            const text = e.clipboardData.getData('text');
                            setEditableText(text);
                        }, 10);
                    }
                }
            };
            
            // Event listener'ı ekle
            document.addEventListener('paste', handlePaste);
            
            // Cleanup
            return () => {
                document.removeEventListener('paste', handlePaste);
            };
        }
    }, [selected, data, id]);

    // Get mindMapId from data or from URL
    const getMindMapId = useCallback(() => {
        // First try to get from data
        if (data && data.mindMapId) {
            return data.mindMapId;
        }
        
        // Otherwise try to get from URL
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id') || '';
    }, [data]);

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
    const determineHandles = (sourcePos, targetPos, isImageNode = false) => {
        // Ana yönü belirle (x ekseninde mi y ekseninde mi daha uzak)
        const dx = targetPos.x - sourcePos.x;
        const dy = targetPos.y - sourcePos.y;
        
        // For image nodes, simplify handle selection for more direct connections
        if (isImageNode) {
            // If the target (image) is to the right of source
            if (dx > 0) {
                return { sourceHandle: 'sourceRight', targetHandle: 'targetLeft' };
            } 
            // If the target (image) is to the left of source
            else {
                return { sourceHandle: 'sourceLeft', targetHandle: 'targetRight' };
            }
        }
        
        // Regular nodes use more dynamic handle selection
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
                // Store the position for later use when image is uploaded
                sessionStorage.setItem('pendingImageNodePosition', position);
                // Close dropdown
                setVisibleDropdown(null);
                // Create an invisible file input and trigger it
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.style.display = 'none';
                input.onchange = (e) => handleImageSelected(e.target.files[0]);
                document.body.appendChild(input);
                input.click();
                document.body.removeChild(input);
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
                noBorder: noBorder, // Add noBorder flag
                mindMapId: getMindMapId() // Add mindMapId
            },
            type: 'customNode'
        };
        
        // Pozisyona göre sabit handle'ları belirle - çok daha basit bir yaklaşım
        let sourceHandle, targetHandle;
        
        if (position === 'right') {
            sourceHandle = 'sourceRight';
            targetHandle = 'targetLeft';
        } else { // left veya varsayılan
            sourceHandle = 'sourceLeft';
            targetHandle = 'targetRight';
        }
        
        // Düz çizgi olacak şekilde edge oluştur
        const newEdge = {
            id: `edge-${id}-${newNodeId}`,
            source: id,
            target: newNodeId,
            sourceHandle: sourceHandle,
            targetHandle: targetHandle,
            type: 'default', // Use default edge type
            style: { 
                strokeWidth: 2,
                stroke: currentNode.data.color || '#1890ff',
                curvature: 0 // Set curvature to 0 for a straight line
            },
            animated: false
        };
        
        // Update the graph
        setNodes([...nodes, newNode]);
        setEdges([...edges, newEdge]);
        
        // Close dropdown
        setVisibleDropdown(null);
    };

    // Handle selected image
    const handleImageSelected = useCallback(async (file) => {
        if (!file) return;
        
        // Check file type
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            alert('Yalnızca resim dosyaları yüklenebilir!');
            return;
        }

        // Check file size (5MB)
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            alert('Resim boyutu 5MB\'dan küçük olmalıdır!');
            return;
        }
        
        // Retrieve and clear the stored position
        const position = sessionStorage.getItem('pendingImageNodePosition');
        
        // Create a loading node
        const nodes = getNodes();
        const edges = getEdges();
        const currentNode = nodes.find(node => node.id === id);
        
        // Generate a temporary node ID
        const loadingNodeId = uuidv4();
        
        if (currentNode && position) {
            // Create loading node HTML
            const loadingHTML = `
            <div class="loading-node">
                <div class="loading-spinner"></div>
                <div class="loading-text">Resim Yükleniyor...</div>
            </div>`;
            
            // Calculate new position
            const HORIZONTAL_OFFSET = 300;
            let newPosition;
            
            if (position === 'right') {
                newPosition = {
                    x: currentNode.position.x + HORIZONTAL_OFFSET,
                    y: currentNode.position.y
                };
            } else {
                newPosition = {
                    x: currentNode.position.x - HORIZONTAL_OFFSET,
                    y: currentNode.position.y
                };
            }
            
            // Çakışma kontrolü
            const isOverlapping = nodes.some(node => {
                if (node.id === id) return false;
                
                const xDistance = Math.abs(node.position.x - newPosition.x);
                const yDistance = Math.abs(node.position.y - newPosition.y);
                
                return xDistance < 150 && yDistance < 80;
            });
            
            if (isOverlapping) {
                newPosition.y += 150;
            }
            
            // Create the loading node
            const loadingNode = {
                id: loadingNodeId,
                position: newPosition,
                data: {
                    label: loadingHTML,
                    bgColor: '#FFFFFF',
                    color: currentNode.data.color,
                    nodeType: position,
                    isLoadingNode: true
                },
                type: 'customNode'
            };
            
            // Create edge for the loading node
            let sourceHandle, targetHandle;
            
            if (position === 'right') {
                sourceHandle = 'sourceRight';
                targetHandle = 'targetLeft';
            } else {
                sourceHandle = 'sourceLeft';
                targetHandle = 'targetRight';
            }
            
            const loadingEdge = {
                id: `edge-${id}-${loadingNodeId}`,
                source: id,
                target: loadingNodeId,
                sourceHandle: sourceHandle,
                targetHandle: targetHandle,
                type: 'straight',
                style: { 
                    strokeWidth: 2,
                    stroke: currentNode.data.color || '#1890ff'
                }
            };
            
            // Add loading node and edge to the graph
            setNodes([...nodes, loadingNode]);
            setEdges([...edges, loadingEdge]);
            
            // Store loading node ID for replacement later
            sessionStorage.setItem('loadingNodeId', loadingNodeId);
        }
        
        // Use FileReader to convert to base64
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                // Create fileName
                const fileName = Date.now().toString();
                
                // Prepare upload data
                const uploadData = {
                    name: fileName,
                    extension: file.name.split('.').pop() || 'png',
                    type: file.type,
                    referenceId: "", // Don't include referenceId in URL
                    referenceIdType: 0,
                    file: reader.result.toString().split(',')[1]
                };
                
                // Import mindMapService and upload file
                const mindMapService = await import('../../../services/api/mindmap');
                const response = await mindMapService.default.uploadMindMapFile("", uploadData); // Empty string for referenceId
                
                // Check if response is valid based on the expected format
                if (response && 
                    ((response.data && (response.data.path || (response.data.file && response.data.file.name))) || 
                     (response.path || (response.file && response.file.name)))) {
                    
                    // Handle both response formats
                    const responseData = response.data || response;
                    
                    // Pass response to image upload success handler
                    handleImageUploadSuccess(responseData);
                } else {
                    // Remove loading node if upload fails
                    removeLoadingNode();
                    console.error('Invalid response format:', response);
                    alert('Resim yükleme hatası: Sunucu yanıtı beklenilen formatta değil');
                }
            };
            reader.onerror = (error) => {
                // Remove loading node if upload fails
                removeLoadingNode();
                alert('Resim yükleme hatası: ' + error);
            };
        } catch (error) {
            // Remove loading node if upload fails
            removeLoadingNode();
            alert('Resim yükleme hatası: ' + error.message);
        }
    }, [id, getNodes, getEdges, setNodes, setEdges]);

    // Remove loading node helper
    const removeLoadingNode = useCallback(() => {
        const loadingNodeId = sessionStorage.getItem('loadingNodeId');
        if (loadingNodeId) {
            const currentNodes = getNodes();
            const currentEdges = getEdges();
            setNodes(currentNodes.filter(node => node.id !== loadingNodeId));
            setEdges(currentEdges.filter(edge => edge.target !== loadingNodeId));
            sessionStorage.removeItem('loadingNodeId');
        }
    }, [getNodes, getEdges, setNodes, setEdges]);

    // Düğümün kendisini resimli düğüme dönüştür
    const handleNodeContentImageUpload = useCallback(async (file) => {
        if (!file) return;
        
        // Check file type
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            alert('Yalnızca resim dosyaları yüklenebilir!');
            return;
        }

        // Check file size (5MB)
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            alert('Resim boyutu 5MB\'dan küçük olmalıdır!');
            return;
        }
        
        // Mevcut düğümü bir yükleme düğümüne dönüştür
        const nodes = getNodes();
        const currentNode = nodes.find(node => node.id === id);
        if (!currentNode) return;
        
        // Asıl içeriği sakla
        const originalLabel = currentNode.data.label;
        const originalStyle = currentNode.style;
        
        // Yükleme göstergesi ile güncelle
        const loadingHTML = `
        <div class="loading-node">
            <div class="loading-spinner"></div>
            <div class="loading-text">Resim Yükleniyor...</div>
        </div>`;
        
        // Düğümü güncelle
        setNodes(nodes.map(node => {
            if (node.id === id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        label: loadingHTML,
                        isLoading: true,
                        originalLabel: originalLabel
                    },
                    originalStyle: originalStyle
                };
            }
            return node;
        }));
        
        // Use FileReader to convert to base64
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                // Create fileName
                const fileName = Date.now().toString();
                
                // Prepare upload data
                const uploadData = {
                    name: fileName,
                    extension: file.name.split('.').pop() || 'png',
                    type: file.type,
                    referenceId: "", // Don't include referenceId in URL
                    referenceIdType: 0,
                    file: reader.result.toString().split(',')[1]
                };
                
                // Import mindMapService and upload file
                const mindMapService = await import('../../../services/api/mindmap');
                const response = await mindMapService.default.uploadMindMapFile("", uploadData);
                
                // Check if response is valid based on the expected format
                if (response && 
                    ((response.data && (response.data.path || (response.data.file && response.data.file.name))) || 
                    (response.path || (response.file && response.file.name)))) {
                    
                    // Handle both response formats
                    const responseData = response.data || response;
                    
                    // Get image path from response
                    let imagePath;
                    if (responseData.path) {
                        imagePath = responseData.path;
                    } else if (responseData.file && responseData.file.name) {
                        imagePath = `https://foramind.blob.core.windows.net/cdn/${responseData.file.name}`;
                    }
                    
                    if (imagePath) {
                        // Create image HTML content
                        const imageHTML = `
                        <div class="image-node-container">
                            <img 
                                src="${imagePath}" 
                                alt="Node Image" 
                                class="node-image" 
                                data-node-id="${id}"
                                data-original-path="${imagePath}"
                                style="max-width: 100%; height: auto; object-fit: contain;"
                            />
                            <div class="image-controls">
                                <span class="image-control remove-image" title="Resmi Kaldır">×</span>
                                <span class="image-control zoom-in" title="Büyüt">+</span>
                                <span class="image-control zoom-out" title="Küçült">−</span>
                            </div>
                        </div>`;
                        
                        // Update node to image node
                        setNodes(nodes.map(node => {
                            if (node.id === id) {
                                return {
                                    ...node,
                                    data: {
                                        ...node.data,
                                        label: imageHTML,
                                        isLoading: false,
                                        isImageNode: true,
                                        imagePath: imagePath,
                                        showButtons: true
                                    },
                                    style: {
                                        width: 'auto',
                                        maxWidth: '300px',
                                        height: 'auto',
                                        padding: 0
                                    }
                                };
                            }
                            return node;
                        }));
                    } else {
                        // Hata durumunda düğümü eski haline getir
                        resetNodeAfterError();
                        alert('Resim yükleme hatası: URL oluşturulamadı');
                    }
                } else {
                    // Hata durumunda düğümü eski haline getir
                    resetNodeAfterError();
                    console.error('Invalid response format:', response);
                    alert('Resim yükleme hatası: Sunucu yanıtı beklenilen formatta değil');
                }
            };
            reader.onerror = (error) => {
                // Hata durumunda düğümü eski haline getir
                resetNodeAfterError();
                alert('Resim yükleme hatası: ' + error);
            };
        } catch (error) {
            // Hata durumunda düğümü eski haline getir
            resetNodeAfterError();
            alert('Resim yükleme hatası: ' + error.message);
        }
    }, [id, getNodes, setNodes]);

    // Hata durumunda düğümü eski haline getir
    const resetNodeAfterError = useCallback(() => {
        const nodes = getNodes();
        setNodes(nodes.map(node => {
            if (node.id === id && node.data.isLoading) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        label: node.data.originalLabel || 'Yeni düğüm',
                        isLoading: false,
                        originalLabel: undefined
                    },
                    style: node.originalStyle || {}
                };
            }
            return node;
        }));
    }, [id, getNodes, setNodes]);

    // Replace loading node with image node
    const replaceWithImageNode = useCallback((nodeId, imagePath, parentId, position) => {
        const nodes = getNodes();
        const edges = getEdges();
        
        // Find the node to replace
        const nodeToReplace = nodes.find(node => node.id === nodeId);
        if (!nodeToReplace) return;
        
        // Create image HTML content
        const imageHTML = `
        <div class="image-node-container">
            <img 
                src="${imagePath}" 
                alt="Node Image" 
                class="node-image" 
                data-node-id="${nodeId}"
                data-original-path="${imagePath}"
                style="max-width: 100%; height: auto; object-fit: contain;"
            />
            <div class="image-controls">
                <span class="image-control remove-image" title="Resmi Kaldır">×</span>
                <span class="image-control zoom-in" title="Büyüt">+</span>
                <span class="image-control zoom-out" title="Küçült">−</span>
            </div>
        </div>`;
        
        // Create image node to replace the loading node
        const updatedNode = {
            ...nodeToReplace,
            data: {
                ...nodeToReplace.data,
                label: imageHTML,
                nodeType: 'image',
                imagePath: imagePath,
                showButtons: true,
                isImageNode: true,
            },
            position: position || nodeToReplace.position,
            style: {
                width: 'auto',
                maxWidth: '300px',
                height: 'auto',
                padding: 0
            }
        };
        
        // Find any existing edges
        const connectedEdges = edges.filter(edge => edge.target === nodeId);
        
        // Update the edges to be direct (no curve)
        const updatedEdges = edges.map(edge => {
            if (edge.target === nodeId) {
                return {
                    ...edge,
                    data: { ...edge.data, curvature: 0 },
                };
            }
            return edge;
        });
        
        // Update nodes and edges
        setNodes(nodes.map(node => node.id === nodeId ? updatedNode : node));
        setEdges(updatedEdges);
    }, [getNodes, getEdges, setNodes, setEdges]);

    // Add a new image node
    const addNewImageNode = useCallback((parentNodeId, imagePath) => {
        // Create node with image
        const newNodeId = uuidv4();
        
        // Create image HTML content
        const imageHTML = `
        <div class="image-node-container">
            <img 
                src="${imagePath}" 
                alt="Node Image" 
                class="node-image" 
                data-node-id="${newNodeId}"
                data-original-path="${imagePath}"
                style="max-width: 100%; height: auto; object-fit: contain;"
            />
            <div class="image-controls">
                <span class="image-control remove-image" title="Resmi Kaldır">×</span>
                <span class="image-control zoom-in" title="Büyüt">+</span>
                <span class="image-control zoom-out" title="Küçült">−</span>
            </div>
        </div>`;
        
        const newNode = {
            id: newNodeId,
            position: { x: 0, y: 0 },
            type: 'customNode',
            data: {
                label: imageHTML,
                nodeType: 'image',
                color: '#ffffff',
                imagePath: imagePath,
                showButtons: true,
                isImageNode: true,
            },
            parentNode: parentNodeId,
            style: {
                width: 'auto',
                maxWidth: '300px',
                height: 'auto',
                padding: 0
            }
        };
        
        // Find parent node
        const nodes = getNodes();
        const parent = nodes.find((n) => n.id === parentNodeId);
        if (!parent) return;
        
        // Calculate position based on parent node position
        // Place image nodes 150px away from parent
        const childNodes = nodes.filter((n) => n.parentNode === parentNodeId);
        const length = childNodes.length;
        
        newNode.position = {
            x: 150,
            y: (length * 100),
        };

        // Create edge from parent to new node
        const newEdge = {
            id: `${parentNodeId}-${newNodeId}`,
            source: parentNodeId,
            target: newNodeId,
            type: 'custom',
            style: { stroke: '#000000' },
            data: { curvature: 0 }, // Direct edge for image nodes
        };
        
        // Update nodes and edges
        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) => eds.concat(newEdge));
    }, [getNodes, setNodes, setEdges]);

    // Handle successful image upload
    const handleImageUploadSuccess = useCallback((response) => {
        // Get stored position
        const position = sessionStorage.getItem('pendingImageNodePosition');
        const loadingNodeId = sessionStorage.getItem('loadingNodeId');
        
        // Clear stored data
        sessionStorage.removeItem('pendingImageNodePosition');
        sessionStorage.removeItem('loadingNodeId');
        
        if (!position) return;
        
        // Get image path from the appropriate location in the response
        // Response şablonlarını kontrol et ve doğru değeri al
        let imagePath;
        if (response.path) {
            // Doğrudan path varsa, onu kullan
            imagePath = response.path;
        } else if (response.file && response.file.name) {
            // File name varsa, CDN URL'ini oluştur
            imagePath = `https://foramind.blob.core.windows.net/cdn/${response.file.name}`;
        } else {
            console.error('Image path not found in response:', response);
            removeLoadingNode();
            alert('Resim yolunu alamadık, lütfen tekrar deneyin');
            return;
        }
        
        // Check if we have a loading node to replace
        if (loadingNodeId) {
            // Get current nodes and edges
            const nodes = getNodes();
            
            // Find the loading node and its position
            const loadingNode = nodes.find(node => node.id === loadingNodeId);
            
            if (loadingNode) {
                // Use the loading node's position
                const position = loadingNode.data.nodeType;
                
                // Replace the loading node with an image node
                replaceWithImageNode(loadingNodeId, imagePath, position, loadingNode.position);
                return;
            }
        }
        
        // Add a regular image node if no loading node exists
        addNewImageNode(position, imagePath);
    }, [getNodes, replaceWithImageNode, addNewImageNode, removeLoadingNode]);

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

    // Add event listeners for image controls when mounting
    useEffect(() => {
        if (data.isImageNode && nodeRef.current) {
            const node = nodeRef.current;
            
            // Add event handlers for image controls
            const onRemoveImage = (e) => {
                e.stopPropagation(); // Prevent selection of node
                removeImageNode();
            };
            
            const onZoomIn = (e) => {
                e.stopPropagation(); // Prevent selection of node
                setImageZoom(prev => Math.min(prev + 20, 200));
            };
            
            const onZoomOut = (e) => {
                e.stopPropagation(); // Prevent selection of node
                setImageZoom(prev => Math.max(prev - 20, 40));
            };
            
            // Attach event listeners
            const removeBtn = node.querySelector('.remove-image');
            const zoomInBtn = node.querySelector('.zoom-in');
            const zoomOutBtn = node.querySelector('.zoom-out');
            
            if (removeBtn) removeBtn.addEventListener('click', onRemoveImage);
            if (zoomInBtn) zoomInBtn.addEventListener('click', onZoomIn);
            if (zoomOutBtn) zoomOutBtn.addEventListener('click', onZoomOut);
            
            // Cleanup listeners on unmount
            return () => {
                if (removeBtn) removeBtn.removeEventListener('click', onRemoveImage);
                if (zoomInBtn) zoomInBtn.removeEventListener('click', onZoomIn);
                if (zoomOutBtn) zoomOutBtn.removeEventListener('click', onZoomOut);
            };
        }
    }, [data.isImageNode]);

    // Apply zoom to image whenever imageZoom changes
    useEffect(() => {
        if (data.isImageNode && nodeRef.current) {
            // Get zoom factor
            const zoomFactor = imageZoom / 100;
            
            // Get the image element
            const imgElement = nodeRef.current.querySelector('.node-image');
            if (imgElement) {
                // Apply zoom to image
                imgElement.style.transform = `scale(${zoomFactor})`;
                imgElement.style.transformOrigin = 'center center';
            }
            
            // Keep controls in top-right corner
            const controls = nodeRef.current.querySelector('.image-controls');
            if (controls) {
                controls.style.position = 'absolute';
                controls.style.top = '5px';
                controls.style.right = '5px';
                controls.style.zIndex = '1000';
            }
        }
    }, [imageZoom, data.isImageNode]);
    
    // Remove image node and replace with text node
    const removeImageNode = () => {
        // Get the current nodes and edges
        const nodes = getNodes();
        const edges = getEdges();
        
        // Mevcut düğümü bul
        const currentNode = nodes.find(node => node.id === id);
        if (!currentNode) return;
        
        // Bu düğüme bağlı parent düğümü bul
        const parentEdge = edges.find(edge => edge.target === id);
        const parentNode = parentEdge ? nodes.find(node => node.id === parentEdge.source) : null;
        
        // Parent'ın özelliklerini al ya da varsayılan değerleri kullan
        const parentStyle = parentNode ? {
            bgColor: parentNode.data.bgColor || '#FFFFFF',
            color: parentNode.data.color || '#000000',
            fontSize: parentNode.data.fontSize || 16,
            borderColor: parentNode.data.color || '#000000'
        } : {
            bgColor: '#FFFFFF',
            color: '#000000',
            fontSize: 16,
            borderColor: '#000000'
        };
        
        // Yeni bir metin düğümü oluştur (aynı ID ile) ve parent'ın stilini al
        const updatedNode = {
            ...currentNode,
            data: {
                ...currentNode.data,
                label: "Yeni düğüm", // Yeni bir metin içeriği
                bgColor: parentStyle.bgColor, // Parent'ın arka plan rengi
                color: parentStyle.color, // Parent'ın metin rengi
                fontSize: parentStyle.fontSize, // Parent'ın font boyutu
                isImageNode: false, // Artık resim düğümü değil
                noBorder: false, // Kenarlık göster
                image: null // Resim yolunu temizle
            },
            // Normal metin düğümü boyutlarına dön
            style: {
                width: null,
                height: null,
                padding: null
            }
        };
        
        // Düğümü güncelle
        const updatedNodes = nodes.map(node => 
            node.id === id ? updatedNode : node
        );
        
        // Düğümü güncelle ama kenarları koruyarak
        setNodes(updatedNodes);
    };

    // Base node style with optional image node class
    const nodeClassName = `custom-node ${data.noBorder ? 'no-border' : ''} ${data.isImageNode ? 'image-node' : ''} ${selected ? 'selected' : ''}`;
    
    // Base node style
    const nodeStyle = {
        background: data.bgColor || '#FFFFFF',
        color: data.color || '#000000',
        fontSize: data.fontSize ? `${data.fontSize}px` : '16px',
        borderColor: data.color,
        padding: '10px 16px',
        borderRadius: '8px',
        minWidth: data.isImageNode ? 'auto' : '160px',
        minHeight: data.isImageNode ? 'auto' : '40px',
        position: 'relative',
    };

    // Apply no-border styling if specified
    if (data.noBorder) {
        nodeStyle.border = 'none';
        nodeStyle.boxShadow = 'none';
        nodeStyle.background = 'transparent';
    }

    // Special styling for image nodes
    if (data.isImageNode) {
        nodeStyle.background = 'transparent';
        nodeStyle.border = 'none';
        nodeStyle.padding = '0';
        nodeStyle.boxShadow = 'none';
        
        // Add a subtle border when selected
        if (selected) {
            nodeStyle.border = '2px dashed #1890ff';
            nodeStyle.padding = '5px';
            nodeStyle.borderRadius = '4px';
        }
    }

    // Render handles with improved positioning for image nodes
    const renderHandles = () => {
        // For image nodes, simplify handles to just the ones we need
        if (data.isImageNode) {
            // Handle style for image nodes
            const imageHandleStyle = {
                width: '12px',
                height: '12px',
                background: selected ? '#fff' : 'transparent',
                border: selected ? '2px solid #1890ff' : 'none',
                borderRadius: '50%',
                zIndex: 10
            };

            return (
                <>
                    {/* Left handles for incoming and outgoing connections */}
                    <Handle 
                        id="targetLeft" 
                        type="target" 
                        position={Position.Left} 
                        isConnectable={isConnectable} 
                        style={{
                            ...imageHandleStyle,
                            left: '-6px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                        }}
                    />
                    <Handle 
                        id="sourceLeft" 
                        type="source" 
                        position={Position.Left} 
                        isConnectable={isConnectable} 
                        style={{
                            ...imageHandleStyle,
                            left: '-6px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                        }}
                    />
                    
                    {/* Right handles for incoming and outgoing connections */}
                    <Handle 
                        id="targetRight" 
                        type="target" 
                        position={Position.Right} 
                        isConnectable={isConnectable} 
                        style={{
                            ...imageHandleStyle,
                            right: '-6px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                        }}
                    />
                    <Handle 
                        id="sourceRight" 
                        type="source" 
                        position={Position.Right} 
                        isConnectable={isConnectable} 
                        style={{
                            ...imageHandleStyle,
                            right: '-6px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                        }}
                    />
                </>
            );
        }
        
        // For regular nodes, return all handles with opacity 0
        return (
            <>
                <Handle 
                    id="targetLeft" 
                    type="target" 
                    position={Position.Left} 
                    isConnectable={isConnectable} 
                    className="node-handle hidden-handle" 
                    style={{ opacity: 0 }} 
                />
                <Handle 
                    id="targetRight" 
                    type="target" 
                    position={Position.Right} 
                    isConnectable={isConnectable} 
                    className="node-handle hidden-handle" 
                    style={{ opacity: 0 }} 
                />
                <Handle 
                    id="targetTop" 
                    type="target" 
                    position={Position.Top} 
                    isConnectable={isConnectable} 
                    className="node-handle hidden-handle" 
                    style={{ opacity: 0 }} 
                />
                <Handle 
                    id="targetBottom" 
                    type="target" 
                    position={Position.Bottom} 
                    isConnectable={isConnectable} 
                    className="node-handle hidden-handle" 
                    style={{ opacity: 0 }} 
                />
                <Handle 
                    id="sourceLeft" 
                    type="source" 
                    position={Position.Left} 
                    isConnectable={isConnectable} 
                    className="node-handle hidden-handle" 
                    style={{ opacity: 0 }} 
                />
                <Handle 
                    id="sourceRight" 
                    type="source" 
                    position={Position.Right} 
                    isConnectable={isConnectable} 
                    className="node-handle hidden-handle" 
                    style={{ opacity: 0 }} 
                />
                <Handle 
                    id="sourceTop" 
                    type="source" 
                    position={Position.Top} 
                    isConnectable={isConnectable} 
                    className="node-handle hidden-handle" 
                    style={{ opacity: 0 }} 
                />
                <Handle 
                    id="sourceBottom" 
                    type="source" 
                    position={Position.Bottom} 
                    isConnectable={isConnectable} 
                    className="node-handle hidden-handle" 
                    style={{ opacity: 0 }} 
                />
            </>
        );
    };

    // Only show buttons when selected
    if (!selected) {
        return (
            <>
                <div
                    ref={nodeRef}
                    className={nodeClassName}
                    style={nodeStyle}
                    onDoubleClick={data.isImageNode ? null : startEditing}
                >
                    {renderHandles()}

                    {isEditing && !data.isImageNode ? (
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
                </div>
            </>
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
                ref={nodeRef}
                className={nodeClassName}
                style={nodeStyle}
                onDoubleClick={data.isImageNode ? null : startEditing}
            >
                {renderHandles()}

                {isEditing && !data.isImageNode ? (
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
            </div>

            {/* Show add buttons for regular nodes and image nodes with showButtons flag */}
            {(data.showButtons || !data.isImageNode) && showLeftButton && (
                <div 
                    style={{ 
                        position: 'absolute', 
                        left: '-30px', 
                        top: '50%',
                        transform: 'translateY(-50%)',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
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

            {/* Show add buttons for regular nodes and image nodes with showButtons flag */}
            {(data.showButtons || !data.isImageNode) && showRightButton && (
                <div 
                    style={{ 
                        position: 'absolute', 
                        right: '-30px', 
                        top: '50%',
                        transform: 'translateY(-50%)',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
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
