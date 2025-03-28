import React from 'react';
import { Layout, Menu, Typography } from 'antd';
import { 
    TeamOutlined, 
    PlusOutlined, 
    ShareAltOutlined, 
    QuestionCircleOutlined 
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Sider } = Layout;
const { Title } = Typography;

const Sidebar = () => {
    const { t } = useTranslation();

    return (
        <Sider className="sidebar" width={250}>
            <div className="logo">
                <Title level={3}>FORAMIND AI</Title>
            </div>
            <Menu
                mode="inline"
                defaultSelectedKeys={['1']}
                className="sidebar-menu"
            >
                <Menu.Item key="1" icon={<PlusOutlined />}>
                    {t("createNewMapMsgTxt")}
                </Menu.Item>
                <Menu.Item key="2" icon={<TeamOutlined />}>
                    {t("mindMapsMsgTxt")}
                </Menu.Item>
                <Menu.Item key="3" icon={<ShareAltOutlined />}>
                    {t("sharedWithMeMsgTxt")}
                </Menu.Item>
                <Menu.Item key="4" icon={<QuestionCircleOutlined />}>
                    {t("helpMsgTxt")}
                </Menu.Item>
            </Menu>
        </Sider>
    );
};

export default Sidebar; 