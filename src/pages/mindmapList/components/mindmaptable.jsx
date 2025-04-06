import React, { useState } from 'react';
import { Table, Space, Button, Tooltip, Typography, Input } from 'antd';
import {
    DeleteOutlined,
    EditOutlined,
    LinkOutlined,
    LockOutlined,
    UnlockOutlined,
    HeartOutlined,
    HeartFilled,
    ShareAltOutlined,
    CheckOutlined,
    CloseOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

// Import AI icon
import ChatGptMapListIcon from "@/styles/img/gpt-gray-icon.png";

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
    const [editingKey, setEditingKey] = useState('');
    const [editingName, setEditingName] = useState('');

    const isEditing = (record) => record.id === editingKey;

    const edit = (record) => {
        setEditingKey(record.id);
        setEditingName(record.name);
    };

    const cancel = () => {
        setEditingKey('');
    };

    const save = async (record) => {
        if (editingName && editingName.trim() && editingName !== record.name) {
            await updateMapName(record, editingName);
        }
        setEditingKey('');
    };

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
        switch (filterType) {
            case "shared":
                filteredData = filteredData.filter(item => item.isMapShared === true);
                break;
            case "favorites":
                filteredData = filteredData.filter(item => item.isFavorite === true);
                break;
            case "ai-generated":
                filteredData = filteredData.filter(item => item.isAiGenerated === true);
                break;
            default:
                // "all" - no filtering
                break;
        }

        return filteredData;
    };

    // Tablo sütunları
    const columns = [
        {
            title: t("nameMsgTxt"),
            dataIndex: "name",
            key: "name",
            render: (text, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <div className="editable-cell">
                        <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onPressEnter={() => save(record)}
                            style={{ width: '80%', height: '28px' }}
                            autoFocus
                        />
                        <Space className="editable-buttons" size="small">
                            <Button
                                type="text"
                                icon={<CheckOutlined />}
                                onClick={() => save(record)}
                                className="save-button"
                            />
                            <Button
                                type="text"
                                icon={<CloseOutlined />}
                                onClick={cancel}
                                className="cancel-button"
                            />
                        </Space>
                    </div>
                ) : (
                    <div className="map-name-cell">
                        <Text 
                            className="map-name" 
                            onClick={() => clickOpenUrl(record.id, record.name)}
                        >
                            {text}
                        </Text>
                    </div>
                );
            },
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
                    {/* AI-Generated */}
                    <Tooltip title={record.isAiGenerated ? t("aiGeneratedMsgTxt") : ""} 
                             open={null} // Let the tooltip handle its own visibility
                    >
                        <Button
                            type="text"
                            icon={
                                <img
                                    src={ChatGptMapListIcon}
                                    alt="AI"
                                    style={{ 
                                        width: 20, 
                                        height: 20, 
                                        opacity: record.isAiGenerated ? 1 : 0.2,
                                        visibility: record.isAiGenerated ? 'visible' : 'hidden'
                                    }}
                                />
                            }
                            className="ai-icon"
                            style={{ 
                                width: 32, 
                                height: 32, 
                                margin: '0 4px',
                                pointerEvents: record.isAiGenerated ? 'auto' : 'none'
                            }}
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
                    {/* Public / Private */}
                    <Tooltip title={record.isPublicMap ? t("makePrivateMsgTxt") : t("makePublicMsgTxt")}>
                        <Button
                            type="text"
                            icon={record.isPublicMap ? <UnlockOutlined /> : <LockOutlined />}
                            onClick={() => makePublicPrivate(record.id, !record.isPublicMap)}
                            className={record.isPublicMap ? "public-icon" : "private-icon"}
                        />
                    </Tooltip>
                    {/* Shared */}
                    <Tooltip title={record.isMapShared ? t("sharedMsgTxt") : t("notSharedMsgTxt")}>
                        <Button
                            type="text"
                            icon={<ShareAltOutlined />}
                            className={record.isMapShared ? "shared-icon" : "not-shared-icon"}
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
            render: (_, record) => {
                const editable = isEditing(record);
                return (
                    <Space size="middle" className="action-buttons">
                        {editable ? null : (
                            <>
                                {/* Edit */}
                                <Tooltip title={t("editNameMsgTxt")}>
                                    <Button
                                        type="text"
                                        icon={<EditOutlined />}
                                        onClick={() => edit(record)}
                                        className="action-button edit-button"
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
                            </>
                        )}
                    </Space>
                );
            },
        }
    ];

    return (
        <div className="table-container">
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
