import React from 'react';
import { Table, Input, Space, Button, Tooltip, Modal, Badge, Typography } from 'antd';
import {
    SearchOutlined,
    DeleteOutlined,
    EditOutlined,
    LinkOutlined,
    LockOutlined,
    UnlockOutlined,
    HeartOutlined,
    HeartFilled
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import TableFilters from './tablefilters';

import ChatGptMapListIcon from "../../../styles/oldImage/img/gpt-gray-icon.png";
import ViewTypeSelector from "@/pages/mindmapList/components/viewtypeselector.jsx";

const { Text } = Typography;

const MindMapTable = ({
                          data,
                          loading,
                          currentPage,
                          pageSize,
                          setCurrentPage,
                          setPageSize,
                          searchText,
                          handleSearch,
                          clickOpenUrl,
                          makePublicPrivate,
                          handleShareMap,
                          addRemoveFavorite,
                          deleteRow,
                          updateMapName,
                          filterType,
                          setFilterType,
                          viewType,
                          setViewType
                      }) => {
    const { t } = useTranslation();

    // Filtreli veriyi hazırlama
    const getFilteredData = () => {
        let filteredData = [...data];

        // Arama filtresi
        if (searchText) {
            filteredData = filteredData.filter(item =>
                item.name.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // Tip filtresi
        if (filterType === "shared") {
            filteredData = filteredData.filter(item => item.isMapShared === true);
        } else if (filterType === "favorites") {
            filteredData = filteredData.filter(item => item.isFavorite === true);
        }

        return filteredData;
    };

    // Tablo sütunları
    const columns = [
        {
            title: (
                <div className="column-header-with-search">
                    <span className="column-name">{t("nameMsgTxt")}</span>
                    <Input
                        placeholder={t("searchMsgTxt")}
                        prefix={<SearchOutlined />}
                        onChange={(e) => handleSearch(e.target.value)}
                        value={searchText}
                        className="table-search-input small-input"
                        allowClear
                    />
                </div>
            ),
        dataIndex: "name",
            key: "name",
            render: (text, record) => (
                <div className="map-name-cell">
                    <Text className="map-name" onClick={() => clickOpenUrl(record.id, record.name)}>
                        {text}
                    </Text>
                    {record.isMapShared && (
                        <Badge
                            count={
                                <img
                                    src={ChatGptMapListIcon}
                                    alt="AI"
                                    style={{ width: 16, height: 16 }}
                                />
                            }
                            className="shared-badge"
                            offset={[0, 0]}
                        />
                    )}
                </div>
            ),
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: t("creationDateMsgTxt"),
            dataIndex: "creationDate",
            key: "creationDate",
            className: "date-column",
            align: "right",
            sorter: (a, b) => new Date(a.creationDate) - new Date(b.creationDate),
        },
        {
            title: t("statusMsgTxt"),
            key: "status",
            className: "status-column",
            align: "center",
            render: (_, record) => (
                <Space size="middle" className="status-icons">
                    {/* Public / Private */}
                    <Tooltip title={record.isPublicMap ? t("makePrivateMsgTxt") : t("makePublicMsgTxt")}>
                        <Button
                            type="text"
                            icon={record.isPublicMap ? <UnlockOutlined /> : <LockOutlined />}
                            onClick={() => makePublicPrivate(record.id, !record.isPublicMap)}
                            className={record.isPublicMap ? "public-icon" : "private-icon"}
                        />
                    </Tooltip>
                    {/* Shared / Not shared */}
                    <Tooltip title={record.isMapShared ? t("sharedMsgTxt") : t("notSharedMsgTxt")}>
                        <Button
                            type="text"
                            icon={<img src={ChatGptMapListIcon} alt="AI" style={{ width: 16, height: 16 }} />}
                            className={record.isMapShared ? "shared-icon" : "not-shared-icon"}
                            onClick={() => handleShareMap(record)}
                        />
                    </Tooltip>
                    {/* Favorite / Not favorite */}
                    <Tooltip title={record.isFavorite ? t("removeFromFavListMsgTxt") : t("addToFavListMsgTxt")}>
                        <Button
                            type="text"
                            icon={record.isFavorite ? <HeartFilled /> : <HeartOutlined />}
                            onClick={() => addRemoveFavorite(record.id, !record.isFavorite)}
                            className={record.isFavorite ? "favorite-icon" : "not-favorite-icon"}
                        />
                    </Tooltip>
                </Space>
            ),
        },
        {
            title: t("actionsMsgTxt"),
            key: "actions",
            className: "actions-column",
            align: "right",
            render: (_, record) => (
                <Space size="middle" className="action-buttons">
                    {/* Edit */}
                    <Tooltip title={t("editNameMsgTxt")}>
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => {
                                Modal.confirm({
                                    title: t("editNameMsgTxt"),
                                    content: (
                                        <Input
                                            defaultValue={record.name}
                                            id="newMapName"
                                        />
                                    ),
                                    onOk: () => {
                                        const newName = document.getElementById('newMapName').value;
                                        updateMapName(record, newName);
                                    }
                                });
                            }}
                            className="action-button edit-button"
                        />
                    </Tooltip>
                    {/* Share */}
                    <Tooltip title={t("shareMsgTxt")}>
                        <Button
                            type="text"
                            icon={<LinkOutlined />}
                            onClick={() => handleShareMap(record)}
                            className="action-button share-button"
                        />
                    </Tooltip>
                    {/* Delete */}
                    <Tooltip title={t("deleteMsgTxt")}>
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={() => deleteRow(record.id)}
                            className="action-button delete-button"
                        />
                    </Tooltip>
                </Space>
            ),
        }
    ];

    return (
        <div className="table-container">
            <div className="table-header">
                <TableFilters filterType={filterType} setFilterType={setFilterType} />
                <ViewTypeSelector viewType={viewType} setViewType={setViewType} />
            </div>

            <Table
                columns={columns}
                dataSource={getFilteredData()}
                rowKey="id"
                loading={loading}
                pagination={{
                    position: ["bottomCenter"],
                    current: currentPage,
                    pageSize: pageSize,
                    onChange: (page) => setCurrentPage(page),
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    onShowSizeChange: (current, size) => {
                        setCurrentPage(1);
                        setPageSize(size);
                    },
                    showTotal: (total) =>
                        `${t("pageTextMsgTxt")} ${currentPage} / ${Math.ceil(total/pageSize)}`,
                    itemRender: (page, type, originalElement) => {
                        if (type === 'prev') {
                            return <Button size="small">{t("previousTextMsgTxt")}</Button>;
                        }
                        if (type === 'next') {
                            return <Button size="small">{t("nextTextMsgTxt")}</Button>;
                        }
                        return originalElement;
                    }
                }}
                className="mind-map-table"
            />
        </div>
    );
};

export default MindMapTable;
