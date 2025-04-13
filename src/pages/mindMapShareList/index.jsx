import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Modal, message } from 'antd';
import Header from "../../components/header";
import PageContainer from "../../components/PageContainer";
import SharedMapService from "../../services/api/mindmap";
import Utils from "../../utils";
import "./index.scss";

// Import extracted components
import Toolbar from "./components/toolbar";
import TableView from "./components/tableView";
import GridView from "./components/gridView";

const MindMapShare = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [data, setData] = useState([]);
    const [deletedMapId, setDeletedMapId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isFavFilter, setIsFavFilter] = useState(false);
    const [activeLayout, setActiveLayout] = useState('list');
    const [searchText, setSearchText] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Initialize local storage settings
        localStorage.setItem('isFavFilter', 'false');
        localStorage.setItem('isNewMap', 'false');
        localStorage.setItem('mapPermission', '0');
        localStorage.setItem("retrieveUrl", window.location.pathname);

        // Set document title
        document.title = `Foramind | ${t("mindMapsShareMsgTxt")}`;

        // Fetch data
        getMindMapShare();
    }, []);

    useEffect(() => {
        // Filter data when search text changes
        if (data.length > 0) {
            filterData();
        }
    }, [searchText, data, isFavFilter]);

    const filterData = () => {
        // Apply text search and favorite filter if enabled
        const filtered = data.filter(item => {
            // Text search
            const matchesText = searchText === "" ||
                item.name.toLowerCase().includes(searchText.toLowerCase());

            // Favorite filter
            const matchesFavorite = !isFavFilter || item.isFavorite;

            return matchesText && matchesFavorite;
        });

        setFilteredData(filtered);

        // Reset to first page when filters change
        setCurrentPage(1);
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const getMindMapShare = async () => {
        setIsLoading(true);
        const userId = JSON.parse(localStorage.getItem('userInformation')).id;
        const recordSize = 1000;

        try {
            const response = await SharedMapService.sharedWithMeMindList(userId, recordSize);

            if (response.data && response.data.mindMap) {
                const mindMapList = response.data.mindMap.map(item => ({
                    ...item,
                    modifiedDate: item.modifiedDate ? Utils.formatDateWithMonthName(item.modifiedDate) : '',
                    creationDate: item.creationDate || '',
                    key: item.id
                }));

                setData(mindMapList);
                setFilteredData(mindMapList);
            } else {
                setData([]);
                setFilteredData([]);
            }
        } catch (error) {
            console.error("Error fetching shared maps:", error);
            message.error(t("errormodalMsgTxt"));
        } finally {
            setIsLoading(false);
        }
    };

    const deleteMindMap = async (id) => {
        // Ensure id exists and is not null
        if (!id) {
            console.error("Map ID is missing");
            message.error(t("errormodalMsgTxt"));
            return;
        }

        try {
            await SharedMapService.deleteSharedMindMapFile(id);
            getMindMapShare();
            message.success(t("successMsgTxt"));
        } catch (error) {
            console.error("Error deleting map:", error);
            message.error(t("errormodalMsgTxt"));
        }
    };

    const deleteRow = (id) => {
        // Check if ID is valid
        if (!id) {
            console.error("Invalid map ID for deletion");
            message.error(t("errormodalMsgTxt"));
            return;
        }
        
        setDeletedMapId(id);
        showDeleteConfirmModal(id);
    };

    const showDeleteConfirmModal = (id) => {
        Modal.confirm({
            title: t("areyousureMsgTxt"),
            content: t('deleteMapApproveWithPermissionModalMsgTxt'),
            okText: t("yesMsgTxt"),
            okType: 'danger',
            cancelText: t("noMsgTxt"),
            onOk: () => deleteMindMap(id)
        });
    };

    const clickOpenUrl = (id, name, permission) => {
        localStorage.setItem('openedMapName', name);
        localStorage.setItem('openedMapId', id);

        const userId = JSON.parse(localStorage.getItem("userInformation")).id;

        if (permission === 2) {
            navigate(`/map?mapId=${id}`);
        } else {
            navigate(`/shared-map?id=${userId}&mindMapId=${id}&sharedMap=true`);
        }
    };

    const addRemoveFavorite = async (mapId, isFavStatus) => {
        const userId = JSON.parse(localStorage.getItem('userInformation')).id;
        const favData = {
            mindMapId: mapId,
            userId: userId,
            isFavorite: isFavStatus
        };

        try {
            await SharedMapService.setFavoriteMapStatus(favData);
            getMindMapShare();
        } catch (error) {
            console.error("Error updating favorite status:", error);
            message.error(t("errormodalMsgTxt"));
        }
    };

    const toggleLayout = (layout) => {
        setActiveLayout(layout);
    };

    const toggleFavFilter = () => {
        setIsFavFilter(!isFavFilter);
    };

    return (
        <>
            <Header />
            <PageContainer>
                <Toolbar 
                    searchText={searchText}
                    handleSearch={handleSearch}
                    isFavFilter={isFavFilter}
                    toggleFavFilter={toggleFavFilter}
                    activeLayout={activeLayout}
                    toggleLayout={toggleLayout}
                />

                <div className="maps-content">
                    {activeLayout === 'list' ? (
                        <TableView 
                            data={filteredData}
                            isLoading={isLoading}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            pageSize={pageSize}
                            setPageSize={setPageSize}
                            addRemoveFavorite={addRemoveFavorite}
                            deleteRow={deleteRow}
                            clickOpenUrl={clickOpenUrl}
                        />
                    ) : (
                        <GridView 
                            data={filteredData}
                            addRemoveFavorite={addRemoveFavorite}
                            deleteRow={deleteRow}
                            clickOpenUrl={clickOpenUrl}
                        />
                    )}
                </div>
            </PageContainer>
        </>
    );
};

export default MindMapShare;
