import React, { useState, useEffect } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from "react-i18next";
import { Layout, Modal, message } from "antd";

// Styles
import './mindmapList.css';

// Components
import Header from '../../components/header';
import MindMapContent from './components/content';

// Services
import mindmapService from '../../services/api/mindmap';
import Utils from '../../utils';
import ViewTypeSelector from "@/pages/mindmapList/components/viewtypeselector.jsx";

const MindMapList = () => {
    const { t } = useTranslation();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [viewType, setViewType] = useState("list"); // list or card
    const [filterType, setFilterType] = useState("all"); // all, shared, favorites
    const [pageSize, setPageSize] = useState(10);
    const [deletedMapId, setDeletedMapId] = useState(null);
    
    // Data fetching function
    const getMindMap = async () => {
        try {
            setLoading(true);
            Utils.loadingScreen.show();
            const recordSize = 1000;
            const response = await mindmapService.getMindMapListByUserId(recordSize);
            
            if (response.data) {
                const mindMapList = response.data.mindMap || [];
                localStorage.setItem('requestIsDone', false);
                
                if (mindMapList.length > 0) {
                    const formattedMindMaps = mindMapList.map(map => ({
                        ...map,
                        modifiedDate: map.modifiedDate ? Utils.formatDateWithMonthName(map.modifiedDate) : map.modifiedDate,
                        creationDate: map.creationDate ? Utils.formatDateWithMonthName(map.creationDate) : map.creationDate
                    }));
                    
                    setData(formattedMindMaps);
                } else {
                    // Yeni tasarımda boş durumu göstereceğiz, yönlendirmeye gerek yok
                    setData([]);
                }
            }
        } catch (error) {
            console.error("Error fetching mind maps:", error);
            message.error(t("errorFetchingMindMaps"));
        } finally {
            setLoading(false);
            Utils.loadingScreen.hide();
        }
    };
    
    // Actions
    const deleteMindMap = async () => {
        try {
            await mindmapService.deleteMindMap(deletedMapId);
            getMindMap();
            message.success(t("mindMapDeletedSuccessfully"));
        } catch (error) {
            console.error("Error deleting mind map:", error);
            message.error(t("errorDeletingMindMap"));
        }
    };

    const deleteMapApproveModal = (id) => {
        setDeletedMapId(id);
        Modal.confirm({
            title: t("areyousureMsgTxt"),
            content: t('deleteMapApproveModalMsgTxt'),
            okText: t("yesMsgTxt"),
            cancelText: t("noMsgTxt"),
            onOk: deleteMindMap
        });
    };

    const updateMapName = async (record, newName) => {
        try {
            if (newName && newName.trim() && newName !== record.name) {
                Utils.loadingScreen.show();
                await mindmapService.updateMindMapSetting(record.id, newName);
                await getMindMap();
                message.success(t("mapNameUpdatedSuccessfully"));
            }
        } catch (error) {
            console.error("Error updating map name:", error);
            message.error(t("errorUpdatingMapName"));
        } finally {
            Utils.loadingScreen.hide();
        }
    };

    const clickOpenUrl = (id, name) => {
        localStorage.setItem('openedMapName', name);
        localStorage.setItem('openedMapId', id);
        window.open(`/map?mapId=${id}`, '_self', 'noopener,noreferrer');
    };

    const addRemoveFavorite = async (mapId, isFavStatus) => {
        try {
            Utils.loadingScreen.show();
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
            Utils.loadingScreen.hide();
        }
    };

    const makePublicPrivate = async (mapId, isPublicStatus) => {
        try {
            Utils.loadingScreen.show();
            await mindmapService.setPublicOrPrivateMap(mapId, isPublicStatus);
            await getMindMap();
            message.success(isPublicStatus ? 
                t("mapIsNowPublic") : 
                t("mapIsNowPrivate"));
        } catch (error) {
            console.error("Error updating public/private status:", error);
            message.error(t("errorUpdatingMapStatus"));
        } finally {
            Utils.loadingScreen.hide();
        }
    };
    
    const handleShareMap = (record) => {
        // TODO: Implement share functionality
        message.info(`Paylaşım modalı: ${record.name}`);
    };

    // Actions object to pass to content component
    const actions = {
        clickOpenUrl,
        deleteMapApproveModal,
        updateMapName,
        makePublicPrivate,
        addRemoveFavorite,
        handleShareMap,
        getMindMap
    };

    useEffect(() => {
        try {
            // Initialize local storage items
            localStorage.setItem('isFavFilter', false);
            localStorage.setItem('isSharedFilter', false);
            localStorage.setItem('isAiFilter', false);
            localStorage.setItem('isNewMap', false);
            localStorage.setItem('mapPermission', 0);
            localStorage.removeItem("willGoToNewMapPage");
            localStorage.setItem("retrieveUrl", window.location.pathname);

            // Set document title
            document.title = `Foramind | ${t("mindMapsMsgTxt")}`;
            
            // Fetch mind maps
            getMindMap();
        } catch (error) {
            console.error("Error in useEffect:", error);
        }
    }, [t]);

    const handleSearch = (value) => {
        setSearchText(value);
    };

    return (
        <Layout className="mind-map-list-layout">

                <Header/>
                <MindMapContent
                    viewType={viewType}
                    setViewType={setViewType}
                    data={data}
                    loading={loading}
                    searchText={searchText}
                    handleSearch={handleSearch}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    setCurrentPage={setCurrentPage}
                    setPageSize={setPageSize}
                    actions={actions}
                    filterType={filterType}
                    setFilterType={setFilterType}
                />
            <ToastContainer />
        </Layout>
    );
};

export default MindMapList; 