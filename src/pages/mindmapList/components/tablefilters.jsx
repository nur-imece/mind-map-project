import React from 'react';
import { Radio } from 'antd';
import { useTranslation } from "react-i18next";

const TableFilters = ({ filterType, setFilterType }) => {
    const { t } = useTranslation();

    return (
        <div className="table-filters">
            <Radio.Group 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-group"
            >
                <Radio.Button value="all">{t("allMapsMsgTxt")}</Radio.Button>
                <Radio.Button value="shared">{t("sharedMapsMsgTxt")}</Radio.Button>
                <Radio.Button value="favorites">{t("favoriteMsgTxt")}</Radio.Button>
            </Radio.Group>
        </div>
    );
};

export default TableFilters; 