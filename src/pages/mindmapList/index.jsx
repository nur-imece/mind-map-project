import React, { useState, useEffect } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from "react-i18next";
import { message } from "antd";

// Styles
import './index.scss';

// Components
import Header from '../../components/header';
import PageContainer from "../../components/PageContainer";
import MindMapContent from './components/content';
import Toolbar from './components/toolbar';
import useMapActions from './components/actions';

// Services
import mindmapService from '../../services/api/mindmap';
import Utils from '../../utils';

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

    // Get map actions
    const mapActions = useMapActions(getMindMap, setSpinLoading, setDeletedMapId);
    
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
        clickOpenUrl: mapActions.clickOpenUrl,
        deleteRow: mapActions.deleteRow,
        updateMapName: mapActions.updateMapName,
        makePublicPrivate: mapActions.makePublicPrivate,
        addRemoveFavorite: mapActions.addRemoveFavorite,
        handleShareMap: mapActions.handleShareMap,
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
                <Toolbar 
                    searchText={searchText}
                    handleSearch={handleSearch}
                    filterType={filterType}
                    toggleFilterType={toggleFilterType}
                    viewType={viewType}
                    toggleViewType={toggleViewType}
                />

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