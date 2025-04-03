export function handleImageUploadSuccess({
                                             response,
                                             getNodes,
                                             replaceWithImageNode,
                                             addNewImageNode,
                                             removeLoadingNode
                                         }) {
    const position = sessionStorage.getItem('pendingImageNodePosition');
    const loadingNodeId = sessionStorage.getItem('loadingNodeId');

    sessionStorage.removeItem('pendingImageNodePosition');
    sessionStorage.removeItem('loadingNodeId');

    if (!position) return;

    let imagePath;
    if (response.path) {
        imagePath = response.path;
    } else if (response.file && response.file.name) {
        imagePath = `https://foramind.blob.core.windows.net/cdn/${response.file.name}`;
    } else {
        console.error('Image path not found in response:', response);
        removeLoadingNode();
        alert('Resim yolunu alamadık, lütfen tekrar deneyin');
        return;
    }

    if (loadingNodeId) {
        const nodes = getNodes();
        const loadingNode = nodes.find(node => node.id === loadingNodeId);
        if (loadingNode) {
            replaceWithImageNode(
                loadingNodeId,
                imagePath,
                loadingNode.data.nodeType,
                loadingNode.position
            );
            return;
        }
    }

    // Eğer loading node yoksa doğrudan yeni image node ekle
    addNewImageNode(position, imagePath);
}
