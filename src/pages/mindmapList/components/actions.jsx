import React from "react";
import { Modal, message } from 'antd';
import { useTranslation } from 'react-i18next';
import mindmapService from '../../../services/api/mindmap';

const useMapActions = (getMindMap, setSpinLoading, setDeletedMapId) => {
    const { t } = useTranslation();

    const deleteMindMap = async (id) => {
        // Ensure id exists and is not null
        if (!id) {
            console.error("Map ID is missing");
            message.error(t("errorDeletingMindMap"));
            return;
        }
        
        try {
            await mindmapService.deleteMindMap(id);
            getMindMap();
            message.success(t("mindMapDeletedSuccessfully"));
        } catch (error) {
            console.error("Error deleting mind map:", error);
            message.error(t("errorDeletingMindMap"));
        }
    };

    const deleteRow = (id) => {
        // Check if ID is valid
        if (!id) {
            console.error("Invalid map ID for deletion");
            message.error(t("errorDeletingMindMap"));
            return;
        }
        
        setDeletedMapId(id);
        showDeleteConfirmModal(id);
    };

    const showDeleteConfirmModal = (id) => {
        Modal.confirm({
            title: t("areyousureMsgTxt"),
            content: t('deleteMapApproveModalMsgTxt'),
            okText: t("yesMsgTxt"),
            cancelText: t("noMsgTxt"),
            onOk: () => deleteMindMap(id)
        });
    };

    const updateMapName = async (record, newName) => {
        try {
            if (newName && newName.trim() && newName !== record.name) {
                setSpinLoading(true);
                await mindmapService.updateMindMapSetting(record.id, newName);
                await getMindMap();
                message.success(t("mapNameUpdatedSuccessfully"));
            }
        } catch (error) {
            console.error("Error updating map name:", error);
            message.error(t("errorUpdatingMapName"));
        } finally {
            setSpinLoading(false);
        }
    };

    const clickOpenUrl = (id, name) => {
        localStorage.setItem('openedMapName', name);
        localStorage.setItem('openedMapId', id);
        window.open(`/map?mapId=${id}`, '_self', 'noopener,noreferrer');
    };

    const addRemoveFavorite = async (mapId, isFavStatus) => {
        try {
            setSpinLoading(true);
            const userId = JSON.parse(localStorage.getItem('userInformation')).id;
            const favData = {
                mindMapId: mapId,
                userId: userId,
                isFavorite: isFavStatus
            };
            
            await mindmapService.setFavoriteMapStatus(favData);
            await getMindMap();
            message.success(isFavStatus ? 
                t("addedToFavoritesSuccessfully") : 
                t("removedFromFavoritesSuccessfully"));
        } catch (error) {
            console.error("Error updating favorite status:", error);
            message.error(t("errorUpdatingFavoriteStatus"));
        } finally {
            setSpinLoading(false);
        }
    };

    const makePublicPrivate = async (mapId, isPublicStatus) => {
        try {
            setSpinLoading(true);
            await mindmapService.setPublicOrPrivateMap(mapId, isPublicStatus);
            await getMindMap();
            message.success(isPublicStatus ? 
                t("mapIsNowPublic") : 
                t("mapIsNowPrivate"));
        } catch (error) {
            console.error("Error updating public/private status:", error);
            message.error(t("errorUpdatingMapStatus"));
        } finally {
            setSpinLoading(false);
        }
    };
    
    const handleShareMap = (record) => {
        // TODO: Implement share functionality
        message.info(`Paylaşım modalı: ${record.name}`);
    };

    return {
        deleteMindMap,
        deleteRow,
        updateMapName,
        clickOpenUrl,
        addRemoveFavorite,
        makePublicPrivate,
        handleShareMap
    };
};

export default useMapActions; 