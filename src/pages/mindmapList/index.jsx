import React, { useState, useEffect } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from "react-i18next";
import { Modal, message, Spin, Button, Input, Tooltip, Typography } from "antd";
import { 
    HeartOutlined, 
    HeartFilled, 
    UnorderedListOutlined, 
    AppstoreOutlined, 
    ShareAltOutlined,
    UserOutlined,
    AppstoreAddOutlined
} from '@ant-design/icons';

// Styles
import './index.scss';

// Components
import Header from '../../components/header';
import PageContainer from "../../components/PageContainer";
import MindMapContent from './components/content';
import MindMapsIcon from '../../icons/mindMaps.svg';

// Services
import mindmapService from '../../services/api/mindmap';
import Utils from '../../utils';
import ChatGptMapListIcon from "@/styles/img/gpt-gray-icon.png";

const { Title } = Typography;

const MindMapList = () => {
    const { t } = useTranslation();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [viewType, setViewType] = useState("list"); // list or card
    const [filterType, setFilterType] = useState("all"); // all, shared, favorites, ai-generated
    const [pageSize, setPageSize] = useState(10);
    const [deletedMapId, setDeletedMapId] = useState(null);
    const [spinLoading, setSpinLoading] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    
    // Data fetching function
    const getMindMap = async () => {
        try {
            setLoading(true);
            setSpinLoading(true);
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
                    setFilteredData(formattedMindMaps);
                } else {
                    // Yeni tasarımda boş durumu göstereceğiz, yönlendirmeye gerek yok
                    setData([]);
                    setFilteredData([]);
                }
            }
        } catch (error) {
            console.error("Error fetching mind maps:", error);
            message.error(t("errorFetchingMindMaps"));
        } finally {
            setLoading(false);
            setSpinLoading(false);
        }
    };

    // Filter data based on search and filter type
    const filterData = () => {
        if (data.length === 0) return;
        
        let filtered = [...data];
        
        // Apply text search
        if (searchText) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchText.toLowerCase())
            );
        }
        
        // Apply filter type
        switch (filterType) {
            case "shared":
                filtered = filtered.filter(item => item.isMapShared === true);
                break;
            case "favorites":
                filtered = filtered.filter(item => item.isFavorite === true);
                break;
            case "ai-generated":
                filtered = filtered.filter(item => item.isAiGenerated === true);
                break;
            default:
                // "all" - no filtering
                break;
        }
        
        setFilteredData(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    };
    
    // Actions
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

    // Handle search input changes
    const handleSearch = (value) => {
        setSearchText(value);
    };

    // Toggle filter type
    const toggleFilterType = (type) => {
        setFilterType(type === filterType ? "all" : type);
    };

    // Toggle view type (list/grid)
    const toggleViewType = (type) => {
        setViewType(type);
    };

    // Actions object to pass to content component
    const actions = {
        clickOpenUrl,
        deleteRow,
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

    // Apply filters when relevant states change
    useEffect(() => {
        filterData();
    }, [data, searchText, filterType]);

    return (
        <>
            <Header/>
            <PageContainer>
                <div className="title-wrapper">
                    <div className="title-left">
                        <div className="title-with-icon">
                            <img src={MindMapsIcon} className="page-icon" alt="Mind Maps" />
                            <Title level={3}>{t("mindMapsMsgTxt")}</Title>
                        </div>
                    </div>
                    <div className="view-controls">
                        <Tooltip title={t("allMapsMsgTxt")}>
                            <Button
                                type="text"
                                icon={<AppstoreAddOutlined />}
                                onClick={() => toggleFilterType("all")}
                                className={`view-control-btn ${filterType === "all" ? 'active' : ''}`}
                            />
                        </Tooltip>
                        <Tooltip title={t("favoriteMsgTxt")}>
                            <Button
                                type="text"
                                icon={filterType === "favorites" ? <HeartFilled /> : <HeartOutlined />}
                                onClick={() => toggleFilterType("favorites")}
                                className={`view-control-btn ${filterType === "favorites" ? 'active' : ''}`}
                            />
                        </Tooltip>
                        <Tooltip title={t("sharedMapsMsgTxt")}>
                            <Button
                                type="text"
                                icon={<ShareAltOutlined />}
                                onClick={() => toggleFilterType("shared")}
                                className={`view-control-btn ${filterType === "shared" ? 'active' : ''}`}
                            />
                        </Tooltip>
                        <Tooltip title={t("aiGeneratedMsgTxt")}>
                            <Button
                                type="text"
                                icon={
                                    <img
                                        src={ChatGptMapListIcon}
                                        alt="AI"
                                        style={{ width: 20, height: 20 }}
                                    />
                                }
                                onClick={() => toggleFilterType("ai-generated")}
                                className={`view-control-btn ${filterType === "ai-generated" ? 'active' : ''}`}
                            />
                        </Tooltip>
                        <Tooltip title={t("showAsListMsgTxt")}>
                            <Button
                                type="text"
                                icon={<UnorderedListOutlined />}
                                onClick={() => toggleViewType('list')}
                                className={`view-control-btn ${viewType === 'list' ? 'active' : ''}`}
                            />
                        </Tooltip>
                        <Tooltip title={t("showAsGridMsgTxt")}>
                            <Button
                                type="text"
                                icon={<AppstoreOutlined />}
                                onClick={() => toggleViewType('card')}
                                className={`view-control-btn ${viewType === 'card' ? 'active' : ''}`}
                            />
                        </Tooltip>
                    </div>
                </div>

                <div className="search-section">
                    <Input
                        placeholder={t("filterByTagOrNameMsgTxt")}
                        value={searchText}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="search-input"
                        allowClear
                    />
                </div>

                <MindMapContent
                    viewType={viewType}
                    setViewType={setViewType}
                    data={filteredData}
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
            </PageContainer>
        </>
    );
};

export default MindMapList; 