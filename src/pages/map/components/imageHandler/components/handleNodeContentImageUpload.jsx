import { mindmap } from "../../../../../services";

export async function handleNodeContentImageUpload({
                                                       file,
                                                       nodeId,
                                                       getNodes,
                                                       setNodes,
                                                       resetNodeAfterError
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

    // Mevcut düğümü bir yükleme düğümüne dönüştür
    const nodes = getNodes();
    const currentNode = nodes.find(node => node.id === nodeId);
    if (!currentNode) return;

    // Asıl içeriği sakla
    const originalLabel = currentNode.data.label;
    const originalStyle = currentNode.style;

    // Yükleme göstergesi
    const loadingHTML = `
    <div class="loading-node">
      <div class="loading-spinner"></div>
      <div class="loading-text">Resim Yükleniyor...</div>
    </div>
  `;

    setNodes(nodes.map(node => {
        if (node.id === nodeId) {
            return {
                ...node,
                data: {
                    ...node.data,
                    label: loadingHTML,
                    isLoading: true,
                    originalLabel
                },
                originalStyle
            };
        }
        return node;
    }));

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

            if (
                response &&
                ((response.data && (response.data.path || (response.data.file && response.data.file.name))) ||
                    (response.path || (response.file && response.file.name)))
            ) {
                const responseData = response.data || response;

                let imagePath;
                if (responseData.path) {
                    imagePath = responseData.path;
                } else if (responseData.file && responseData.file.name) {
                    imagePath = `https://foramind.blob.core.windows.net/cdn/${responseData.file.name}`;
                }

                if (imagePath) {
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
            </div>
          `;

                    setNodes(nodes.map(node => {
                        if (node.id === nodeId) {
                            return {
                                ...node,
                                data: {
                                    ...node.data,
                                    label: imageHTML,
                                    isLoading: false,
                                    isImageNode: true,
                                    imagePath,
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
                    resetNodeAfterError(nodeId);
                    alert('Resim yükleme hatası: URL oluşturulamadı');
                }
            } else {
                resetNodeAfterError(nodeId);
                console.error('Invalid response format:', response);
                alert('Resim yükleme hatası: Sunucu yanıtı beklenilen formatta değil');
            }
        };
        reader.onerror = (error) => {
            resetNodeAfterError(nodeId);
            alert('Resim yükleme hatası: ' + error);
        };
    } catch (error) {
        resetNodeAfterError(nodeId);
        alert('Resim yükleme hatası: ' + error.message);
    }
}
