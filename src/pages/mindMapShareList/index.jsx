import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Table, Space, Button, Modal, message, Tooltip, Input, Card } from 'antd';
import { HeartOutlined, HeartFilled, DeleteOutlined, EyeOutlined, UnorderedListOutlined, AppstoreOutlined } from '@ant-design/icons';
import Header from "../../components/header";
import PageContainer from "../../components/PageContainer";
import SubHeader from "../../components/subHeader";
import SharedMapService from "../../services/api/mindmap";
import Utils from "../../utils";
import "./index.scss";
import iconShared from "../../styles/img/shared-icon.png";
import iconGridFile from "../../styles/img/grid-file-icon.png";

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

    // Columns configuration for the table
    const columns = [
        {
            title: t("isim"),
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
            title: t("olusturmaTarihi"),
            dataIndex: "creationDate",
            key: "creationDate",
            sorter: (a, b) => new Date(a.creationDate) - new Date(b.creationDate),
            render: (text) => <div>{Utils.formatDateWithMonthName(text)}</div>,
            className: "date-column",
        },
        {
            title: "",
            key: "actions",
            render: (_, record) => (
                <Space size="middle" className="action-buttons">
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

    // Function to render grid items
    const renderGridItems = () => {
        return (
            <div className="grid-items">
                {filteredData.map(item => (
                    <Card 
                        key={item.id} 
                        className="grid-item" 
                        hoverable
                        cover={<img src={iconGridFile} alt={item.name} />}
                        actions={[
                            <Tooltip title={t("showMsgTxt")}>
                                <EyeOutlined 
                                    onClick={() => {
                                        clickOpenUrl(item.id, item.name, item.mapPermissionId);
                                        localStorage.setItem("mapJsonObj", JSON.stringify(item));
                                        localStorage.setItem('mapPermission', item.mapPermissionId);
                                    }}
                                />
                            </Tooltip>,
                            <Tooltip title={item.isFavorite ? t("removeFromFavListMsgTxt") : t("addToFavListMsgTxt")}>
                                {item.isFavorite ? 
                                    <HeartFilled 
                                        className="favorite-active" 
                                        onClick={() => addRemoveFavorite(item.id, !item.isFavorite)} 
                                    /> : 
                                    <HeartOutlined 
                                        onClick={() => addRemoveFavorite(item.id, !item.isFavorite)} 
                                    />
                                }
                            </Tooltip>,
                            <Tooltip title={t("deleteMsgTxt")}>
                                <DeleteOutlined onClick={() => deleteRow(item.id)} />
                            </Tooltip>
                        ]}
                    >
                        <Card.Meta 
                            title={item.name}
                            description={
                                <div className="grid-item-meta">
                                    {item.isMapShared && (
                                        <div className="shared-indicator">
                                            <img src={iconShared} alt={t("sharedMapMsgTxt")} />
                                            <span>{t("sharedMapMsgTxt")}</span>
                                        </div>
                                    )}
                                    <div className="creation-date">
                                        {Utils.formatDateWithMonthName(item.creationDate)}
                                    </div>
                                </div>
                            }
                        />
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <>
            <Header />
            <PageContainer>
                <div className="title-wrapper">
                    <div className="title-left">
                        <SubHeader
                            title={t("benimlePaylasilanlar")}
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

                <div className="search-section">
                    <Input
                        placeholder={t("ara")}
                        value={searchText}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="maps-content">
                    {activeLayout === 'list' ? (
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
                                    `${range[0]}-${range[1]} / ${total}`,
                                size: "small",
                                showQuickJumper: false
                            }}
                            locale={{
                                emptyText: t("noDataTextMsgTxt"),
                                triggerDesc: t("triggerDescMsgTxt"),
                                triggerAsc: t("triggerAscMsgTxt"),
                                cancelSort: t("cancelSortMsgTxt")
                            }}
                            className="maps-table"
                        />
                    ) : (
                        renderGridItems()
                    )}
                </div>
            </PageContainer>
        </>
    );
};

export default MindMapShare;
