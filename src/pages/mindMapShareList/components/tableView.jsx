import React from "react";
import { Table, Space, Button, Tooltip } from 'antd';
import { HeartOutlined, HeartFilled, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import Utils from "../../../utils";
import iconShared from "../../../styles/img/shared-icon.png";

const TableView = ({ 
    data, 
    isLoading,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    addRemoveFavorite,
    deleteRow,
    clickOpenUrl 
}) => {
    const { t } = useTranslation();

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

    return (
        <Table
            columns={columns}
            dataSource={data}
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
    );
};

export default TableView; 