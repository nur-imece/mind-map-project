import { useState, useCallback } from 'react';
import { useReactFlow } from 'reactflow';

import { handleImageSelected } from './handleImageSelected';
import { handleNodeContentImageUpload } from './handleNodeContentImageUpload';
import { removeLoadingNode } from './removeLoadingNode';
import { replaceWithImageNode } from './replaceWithImageNode';
import { addNewImageNode } from './addNewImageNode';
import { handleImageUploadSuccess } from './handleImageUploadSuccess';
import { removeImageNode } from './removeImageNode';
import { applyImageZoom } from './applyImageZoom';
import { handlePasteEvent } from './handlePasteEvent';
import { resetNodeAfterError } from './resetNodeAfterError';

function useImageHandler() {
    const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();

    // Örnek olarak local state. Zoom gibi değerleri burada tutabilirsiniz.
    const [imageZoom, setImageZoom] = useState(100);

    // Hook içinde callback’leri sarmalıyoruz, böylece
    // React Flow fonksiyonlarını parametre olarak her bir küçük fonksiyona geçiyoruz.

    const _handleImageSelected = useCallback(
        async (file, nodeId) => {
            await handleImageSelected({
                file,
                nodeId,
                getNodes,
                getEdges,
                setNodes,
                setEdges,
                handleImageUploadSuccess: _handleImageUploadSuccess,
                removeLoadingNode: _removeLoadingNode
            });
        },
        [getNodes, getEdges, setNodes, setEdges]
    );

    const _removeLoadingNode = useCallback(
        () => removeLoadingNode({
            getNodes,
            getEdges,
            setNodes,
            setEdges
        }),
        [getNodes, getEdges, setNodes, setEdges]
    );

    const _handleNodeContentImageUpload = useCallback(
        async (file, nodeId) => {
            await handleNodeContentImageUpload({
                file,
                nodeId,
                getNodes,
                setNodes,
                resetNodeAfterError: _resetNodeAfterError
            });
        },
        [getNodes, setNodes]
    );

    const _resetNodeAfterError = useCallback(
        (nodeId) => {
            resetNodeAfterError({ nodeId, getNodes, setNodes });
        },
        [getNodes, setNodes]
    );

    const _replaceWithImageNode = useCallback(
        (nodeId, imagePath, position, existingPosition) => {
            replaceWithImageNode({
                nodeId,
                imagePath,
                position,
                existingPosition,
                getNodes,
                getEdges,
                setNodes,
                setEdges
            });
        },
        [getNodes, getEdges, setNodes, setEdges]
    );

    const _addNewImageNode = useCallback(
        (position, imagePath) => {
            addNewImageNode({
                position,
                imagePath,
                getNodes,
                setNodes,
                setEdges
            });
        },
        [getNodes, setNodes, setEdges]
    );

    const _handleImageUploadSuccess = useCallback(
        (response) => {
            handleImageUploadSuccess({
                response,
                getNodes,
                replaceWithImageNode: _replaceWithImageNode,
                addNewImageNode: _addNewImageNode,
                removeLoadingNode: _removeLoadingNode
            });
        },
        [
            getNodes,
            _replaceWithImageNode,
            _addNewImageNode,
            _removeLoadingNode
        ]
    );

    const _removeImageNode = useCallback(
        (nodeId) => {
            removeImageNode({
                nodeId,
                getNodes,
                getEdges,
                setNodes
            });
        },
        [getNodes, getEdges, setNodes]
    );

    const _applyImageZoom = useCallback(
        (nodeRef, zoomValue) => {
            applyImageZoom(nodeRef, zoomValue);
        },
        []
    );

    const _handlePasteEvent = useCallback(
        async (e, nodeId, isEditing, data, startEditing, setEditableText) => {
            await handlePasteEvent({
                e,
                nodeId,
                isEditing,
                data,
                startEditing,
                setEditableText,
                handleImageSelected: _handleImageSelected,
                handleNodeContentImageUpload: _handleNodeContentImageUpload
            });
        },
        [_handleImageSelected, _handleNodeContentImageUpload]
    );

    // Hook’in dışarı açtığı fonksiyon/objeler
    return {
        handleImageSelected: _handleImageSelected,
        handleNodeContentImageUpload: _handleNodeContentImageUpload,
        removeLoadingNode: _removeLoadingNode,
        replaceWithImageNode: _replaceWithImageNode,
        addNewImageNode: _addNewImageNode,
        handleImageUploadSuccess: _handleImageUploadSuccess,
        removeImageNode: _removeImageNode,
        setupImageNodeEventListeners: (nodeRef, nodeId, setImageZoomState) => {
            // setupImageNodeEventListeners burada inline yazabilir
            // veya ayrı bir dosya hâline getirebilirsiniz.
            if (nodeRef.current) {
                const node = nodeRef.current;
                const onRemoveImage = (e) => {
                    e.stopPropagation();
                    _removeImageNode(nodeId);
                };
                const onZoomIn = (e) => {
                    e.stopPropagation();
                    setImageZoomState((prev) => Math.min(prev + 20, 200));
                };
                const onZoomOut = (e) => {
                    e.stopPropagation();
                    setImageZoomState((prev) => Math.max(prev - 20, 40));
                };
                const removeBtn = node.querySelector('.remove-image');
                const zoomInBtn = node.querySelector('.zoom-in');
                const zoomOutBtn = node.querySelector('.zoom-out');

                if (removeBtn) removeBtn.addEventListener('click', onRemoveImage);
                if (zoomInBtn) zoomInBtn.addEventListener('click', onZoomIn);
                if (zoomOutBtn) zoomOutBtn.addEventListener('click', onZoomOut);

                // cleanup
                return () => {
                    if (removeBtn) removeBtn.removeEventListener('click', onRemoveImage);
                    if (zoomInBtn) zoomInBtn.removeEventListener('click', onZoomIn);
                    if (zoomOutBtn) zoomOutBtn.removeEventListener('click', onZoomOut);
                };
            }
        },
        applyImageZoom: _applyImageZoom,
        handlePasteEvent: _handlePasteEvent,
        imageZoom,
        setImageZoom
    };
}

export default useImageHandler;
