export async function handlePasteEvent({
                                           e,
                                           nodeId,
                                           isEditing,
                                           data,
                                           startEditing,
                                           setEditableText,
                                           handleImageSelected,
                                           handleNodeContentImageUpload
                                       }) {
    if (!nodeId) return;

    const items = e.clipboardData?.items;
    if (!items) return;

    let hasImageItem = false;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            hasImageItem = true;
            if (e.shiftKey) {
                // Shift + Paste => yeni child düğüm olarak ekle
                e.preventDefault();
                const file = items[i].getAsFile();
                if (!file) continue;
                sessionStorage.setItem('pendingImageNodePosition', 'right');
                await handleImageSelected(file, nodeId);
                break;
            } else {
                // Normal paste => düğümün kendisini resme dönüştür
                e.preventDefault();
                const file = items[i].getAsFile();
                if (!file) continue;
                await handleNodeContentImageUpload(file, nodeId);
                break;
            }
        }
    }

    // Metin yapıştırma
    if (!hasImageItem && e.clipboardData.getData('text')) {
        if (!isEditing && !data?.isImageNode) {
            e.preventDefault();
            startEditing();
            setTimeout(() => {
                const text = e.clipboardData.getData('text');
                setEditableText(text);
            }, 10);
        }
    }
}
