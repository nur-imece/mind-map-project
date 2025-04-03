import { v4 as uuidv4 } from 'uuid';
import { mindmap } from "../../../../../services";

export async function handleImageSelected({
                                              file,
                                              nodeId,
                                              getNodes,
                                              getEdges,
                                              setNodes,
                                              setEdges,
                                              handleImageUploadSuccess,
                                              removeLoadingNode
                                          }) {
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
    const currentNode = nodes.find(node => node.id === nodeId);

    // Generate a temporary node ID
    const loadingNodeId = uuidv4();

    if (currentNode && position) {
        // Create loading node HTML
        const loadingHTML = `
      <div class="loading-node">
          <div class="loading-spinner"></div>
          <div class="loading-text">Resim Yükleniyor...</div>
      </div>
    `;

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
            if (node.id === nodeId) return false;
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
            id: `edge-${nodeId}-${loadingNodeId}`,
            source: nodeId,
            target: loadingNodeId,
            sourceHandle,
            targetHandle,
            type: 'straight',
            style: {
                strokeWidth: 2,
                stroke: currentNode.data.color || '#1890ff'
            }
        };

        setNodes([...nodes, loadingNode]);
        setEdges([...edges, loadingEdge]);

        // Store loading node ID
        sessionStorage.setItem('loadingNodeId', loadingNodeId);
    }

    // Use FileReader to convert to base64
    try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const fileName = Date.now().toString();
            const uploadData = {
                name: fileName,
                extension: file.name.split('.').pop() || 'png',
                type: file.type,
                referenceId: "",
                referenceIdType: 0,
                file: reader.result.toString().split(',')[1]
            };

            // import mindMapService dynamically
            const response = await mindmap.uploadMindMapFile('', uploadData);

            // Validate response
            if (
                response &&
                ((response.data && (response.data.path || (response.data.file && response.data.file.name))) ||
                    (response.path || (response.file && response.file.name)))
            ) {
                const responseData = response.data || response;
                handleImageUploadSuccess(responseData);
            } else {
                removeLoadingNode();
                console.error('Invalid response format:', response);
                alert('Resim yükleme hatası: Sunucu yanıtı beklenilen formatta değil');
            }
        };
        reader.onerror = (error) => {
            removeLoadingNode();
            alert('Resim yükleme hatası: ' + error);
        };
    } catch (error) {
        removeLoadingNode();
        alert('Resim yükleme hatası: ' + error.message);
    }
}
