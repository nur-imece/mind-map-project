import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Table, Space, Button, Modal, message, Tooltip, Input, Tag, Select } from 'antd';
import { HeartOutlined, HeartFilled, DeleteOutlined, EyeOutlined, SearchOutlined, ClearOutlined, UnorderedListOutlined, AppstoreOutlined } from '@ant-design/icons';
import Header from "../../components/header";
import SubHeader from "../../components/subHeader";
import SharedMapService from "../../services/api/mindmap";
import Utils from "../../utils";
import "../templateList/index.scss"
import "./styles.scss";
import iconShared from "../../styles/img/shared-icon.png";
import iconGridFile from "../../styles/img/grid-file-icon.png";

const { Option } = Select;

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
    const [sharedFilter, setSharedFilter] = useState(null);
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
        // Filter data when search text or shared filter changes
        if (data.length > 0) {
            filterData();
        }
    }, [searchText, sharedFilter, data, isFavFilter]);

    const filterData = () => {
        // Apply text search, shared status filters, and favorite filter if enabled
        const filtered = data.filter(item => {
            // Text search
            const matchesText = searchText === "" ||
                item.name.toLowerCase().includes(searchText.toLowerCase());

            // Shared status filter
            const matchesShared = sharedFilter === null ||
                (sharedFilter === true && item.isMapShared) ||
                (sharedFilter === false && !item.isMapShared);

            // Favorite filter
            const matchesFavorite = !isFavFilter || item.isFavorite;

            return matchesText && matchesShared && matchesFavorite;
        });

        setFilteredData(filtered);

        // Reset to first page when filters change
        setCurrentPage(1);
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleSharedFilterChange = (value) => {
        setSharedFilter(value);
    };

    const clearAllFilters = () => {
        setSearchText("");
        setSharedFilter(null);
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
                    key: item.id // Adding a key for antd Table
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

    const deleteMindMap = async () => {
        try {
            await SharedMapService.deleteSharedMindMapFile(deletedMapId);
            getMindMapShare();
            message.success(t("successMsgTxt"));
        } catch (error) {
            console.error("Error deleting map:", error);
            message.error(t("errormodalMsgTxt"));
        }
    };

    const deleteRow = (id) => {
        setDeletedMapId(id);
        showDeleteConfirmModal();
    };

    const showDeleteConfirmModal = () => {
        Modal.confirm({
            title: t("areyousureMsgTxt"),
            content: t('deleteMapApproveWithPermissionModalMsgTxt'),
            okText: t("yesMsgTxt"),
            okType: 'danger',
            cancelText: t("noMsgTxt"),
            onOk: deleteMindMap
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

    const renderFilterBar = () => (
        <div className="filter-bar" style={{
            marginBottom: '20px',
            padding: '15px',
            background: '#f9f9f9',
            borderRadius: '5px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Input
                        placeholder={t("searchMsgTxt")}
                        value={searchText}
                        onChange={(e) => handleSearch(e.target.value)}
                        prefix={<SearchOutlined />}
                        allowClear
                        style={{ width: '250px' }}
                    />
                    <Select
                        placeholder={t("statusMsgTxt")}
                        value={sharedFilter}
                        onChange={handleSharedFilterChange}
                        style={{ width: '180px' }}
                        allowClear
                    >
                        <Option value={true}>{t("sharedMapMsgTxt")}</Option>
                        <Option value={false}>{t("notSharedMsgTxt")}</Option>
                    </Select>
                </div>
                {(searchText || sharedFilter !== null) && (
                    <Button
                        icon={<ClearOutlined />}
                        onClick={clearAllFilters}
                        type="link"
                    >
                        {t("clearFilters")}
                    </Button>
                )}
            </div>
            <div className="filters-applied" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {searchText && (
                    <Tag closable onClose={() => setSearchText("")} color="blue">
                        {t("searchMsgTxt")}: {searchText}
                    </Tag>
                )}
                {sharedFilter !== null && (
                    <Tag closable onClose={() => setSharedFilter(null)} color="green">
                        {sharedFilter ? t("sharedMapMsgTxt") : t("notSharedMsgTxt")}
                    </Tag>
                )}
                {isFavFilter && (
                    <Tag closable onClose={() => setIsFavFilter(false)} color="gold">
                        {t("favoriteMsgTxt")}
                    </Tag>
                )}
                {(searchText || sharedFilter !== null || isFavFilter) && (
                    <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#666' }}>
                        {filteredData.length} {t("totalItemsMsgTxt")}
                    </div>
                )}
            </div>
        </div>
    );

    // Columns configuration for the table
    const columns = [
        {
            title: t("nameMsgTxt"),
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (text, record) => (
                <div className="name-fav-wrapper">
                    <div className="name-fav-wrapper__item-name">
                        <a
                            onClick={() => {
                                clickOpenUrl(record.id, record.name, record.mapPermissionId);
                                localStorage.setItem("mapJsonObj", JSON.stringify(record));
                                localStorage.setItem('mapPermission', record.mapPermissionId);
                            }}
                            title={record.name}
                            style={{ cursor: 'pointer' }}
                        >
                            {text}
                        </a>
                        {record.isMapShared && <img src={iconShared} alt={t("sharedMapMsgTxt")} />}
                    </div>
                    {record.sharedUserNameSurname && (
                        <span className="shared-user-name">
                            ({record.sharedUserNameSurname + t('isSharedInfoMsgTxt')})
                        </span>
                    )}
                    <Tooltip title={record.isFavorite ? t("removeFromFavListMsgTxt") : t("addToFavListMsgTxt")}>
                        <Button
                            type="link"
                            onClick={() => addRemoveFavorite(record.id, !record.isFavorite)}
                            className={`fav-action${record.isFavorite ? ' active' : ''}`}
                            icon={record.isFavorite ? <HeartFilled /> : <HeartOutlined />}
                        />
                    </Tooltip>
                </div>
            ),
            className: "name-column",
        },
        {
            title: t("creationDateMsgTxt"),
            dataIndex: "creationDate",
            key: "creationDate",
            sorter: (a, b) => new Date(a.creationDate) - new Date(b.creationDate),
            render: (text, record) => (
                <div>
                    {Utils.formatDateWithMonthName(record.creationDate)}
                </div>
            ),
            className: "date-column",
        },
        {
            title: "",
            key: "actions",
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title={t("showMsgTxt")}>
                        <Button
                            type="link"
                            className="action-button"
                            icon={<EyeOutlined />}
                            onClick={() => {
                                clickOpenUrl(record.id, record.name, record.mapPermissionId);
                                localStorage.setItem("mapJsonObj", JSON.stringify(record));
                                localStorage.setItem('mapPermission', record.mapPermissionId);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title={t("deleteMsgTxt")}>
                        <Button
                            type="link"
                            className="action-button"
                            icon={<DeleteOutlined />}
                            onClick={() => deleteRow(record.id)}
                        />
                    </Tooltip>
                </Space>
            ),
            className: "action-column",
        }
    ];

    return (
        <>
            <Header />
            <div className="template-list-container">
                <div className="container">
                    <div className="row">
                        <div className="col-12 col-md-12 col-lg-12">
                            <div className="template-panel">
                                <div className="title-wrapper">
                                    <div className="px-3">
                                        <SubHeader
                                            title={t("sharedWithMeMsgTxt")}
                                            iconName="icon-share_list_icon"
                                        />
                                    </div>
                                    <div className="view-controls">
                                        <Tooltip title={t("showFavoritesMsgTxt")}>
                                            <Button
                                                type="text"
                                                icon={isFavFilter ? <HeartFilled /> : <HeartOutlined />}
                                                onClick={toggleFavFilter}
                                                className={`view-control-btn ${isFavFilter ? 'active' : ''}`}
                                            />
                                        </Tooltip>
                                        <Tooltip title={t("showAsListMsgTxt")}>
                                            <Button
                                                type="text"
                                                icon={<UnorderedListOutlined />}
                                                onClick={() => toggleLayout('list')}
                                                className={`view-control-btn ${activeLayout === 'list' ? 'active' : ''}`}
                                            />
                                        </Tooltip>
                                        <Tooltip title={t("showAsGridMsgTxt")}>
                                            <Button
                                                type="text"
                                                icon={<AppstoreOutlined />}
                                                onClick={() => toggleLayout('grid')}
                                                className={`view-control-btn ${activeLayout === 'grid' ? 'active' : ''}`}
                                            />
                                        </Tooltip>
                                    </div>
                                </div>
                                <div>
                                    <div className="col-md-12 px-3 pb-3">
                                        {/* Filter bar */}
                                        {renderFilterBar()}

                                        {/* List layout */}
                                        <div
                                            className={`table-list layout-option-content${activeLayout === 'list' ? ' show' : ''}`}
                                            data-layout="list"
                                        >
                                            <div className="map-table">
                                                <Table
                                                    columns={columns}
                                                    dataSource={filteredData}
                                                    loading={isLoading}
                                                    pagination={{
                                                        pageSize: pageSize,
                                                        current: currentPage,
                                                        onChange: (page) => setCurrentPage(page),
                                                        onShowSizeChange: (current, size) => {
                                                            setCurrentPage(1);
                                                            setPageSize(size);
                                                        },
                                                        showSizeChanger: true,
                                                        pageSizeOptions: [10, 20, 50],
                                                        showTotal: (total, range) =>
                                                            `${t("pageTextMsgTxt")} ${range[0]}-${range[1]} ${t("ofTextMsgTxt")} ${total}`
                                                    }}
                                                    locale={{
                                                        emptyText: t("noDataTextMsgTxt"),
                                                        triggerDesc: t("triggerDescMsgTxt"),
                                                        triggerAsc: t("triggerAscMsgTxt"),
                                                        cancelSort: t("cancelSortMsgTxt")
                                                    }}
                                                    className="-striped -highlight"
                                                />
                                            </div>
                                        </div>

                                        {/* Grid layout */}
                                        <div
                                            className={`table-grid layout-option-content${activeLayout === 'grid' ? ' show' : ''}`}
                                            data-layout="grid"
                                        >
                                            <div className="grid-items">
                                                {filteredData.length > 0 && filteredData.map(item => (
                                                    <div className="grid-item" key={item.id} title={item.name}>
                                                        <a
                                                            onClick={() => addRemoveFavorite(item.id, !item.isFavorite)}
                                                            className={`fav-action${item.isFavorite ? ' active' : ''}`}
                                                            title={item.isFavorite ? t("removeFromFavListMsgTxt") : t("addToFavListMsgTxt")}
                                                        >
                                                            <i className="icon-favorite-icon"></i>
                                                        </a>
                                                        {item.isMapShared && (
                                                            <img
                                                                src={iconShared}
                                                                className="shared-icon"
                                                                alt={t("sharedMapMsgTxt")}
                                                            />
                                                        )}
                                                        <a
                                                            onClick={() => {
                                                                clickOpenUrl(item.id, item.name, item.mapPermissionId);
                                                                localStorage.setItem("mapJsonObj", JSON.stringify(item));
                                                                localStorage.setItem('mapPermission', item.mapPermissionId);
                                                            }}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            <img src={iconGridFile} alt={item.name} />
                                                            <div className="name">{item.name}</div>
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MindMapShare;
