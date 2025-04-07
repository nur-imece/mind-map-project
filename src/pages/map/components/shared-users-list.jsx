import React from 'react';
import { List, Avatar, Button, Tooltip, Typography, Badge, Tag } from 'antd';
import { DeleteOutlined, UserOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';

const { Text } = Typography;

const SharedUsersList = ({ users, onRemoveUser }) => {
  const getPermissionIcon = (permissionId) => {
    // Permission ID: 1 = View only, 2 = Edit
    if (permissionId === 1) {
      return <EyeOutlined style={{ color: '#1890ff' }} />;
    } else if (permissionId === 2) {
      return <EditOutlined style={{ color: '#52c41a' }} />;
    }
    return null;
  };

  const getPermissionTag = (permissionId, permissionValue) => {
    if (permissionId === 1) {
      return <Tag color="blue">{permissionValue || 'Görüntüleyen'}</Tag>;
    } else if (permissionId === 2) {
      return <Tag color="green">{permissionValue || 'Düzenleyen'}</Tag>;
    }
    return null;
  };

  return (
    <List
      itemLayout="horizontal"
      dataSource={users}
      locale={{ emptyText: 'Harita henüz kimseyle paylaşılmamış' }}
      renderItem={(user) => (
        <List.Item
          actions={[
            <Tooltip title="Kullanıcıyı kaldır">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onRemoveUser(user)}
              />
            </Tooltip>
          ]}
        >
          <List.Item.Meta
            avatar={
              <Badge count={getPermissionIcon(user.mapPermissionId)}>
                <Avatar icon={<UserOutlined />} />
              </Badge>
            }
            title={user.firstnameLastName || user.email}
            description={
              <>
                <Text type="secondary" style={{ marginRight: 8 }}>
                  {user.email}
                </Text>
                {getPermissionTag(user.mapPermissionId, user.mapPermissionValue)}
              </>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default SharedUsersList; 