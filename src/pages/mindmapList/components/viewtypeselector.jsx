import React from 'react';
import { Radio } from 'antd';
import { AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const ViewTypeSelector = ({ viewType, setViewType }) => {
    const { t } = useTranslation();

    return (
        <div className="view-type-selector">
            <Radio.Group 
                value={viewType} 
                onChange={(e) => setViewType(e.target.value)}
                className="view-type-group"
            >
                <Radio.Button value="list" title={t("showAsListMsgTxt")}><UnorderedListOutlined /></Radio.Button>
                <Radio.Button value="card" title={t("showAsGridMsgTxt")}><AppstoreOutlined /></Radio.Button>
            </Radio.Group>
        </div>
    );
};

export default ViewTypeSelector; 