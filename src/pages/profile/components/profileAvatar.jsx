import React from "react";
import { Button, Upload } from "antd";
import { CloseOutlined, CameraOutlined, LoadingOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const profileAvatar = ({ 
  hasImage, 
  profileImage, 
  loading, 
  avatarColor, 
  firstNameLetter, 
  lastNameLetter, 
  handleRemoveImage, 
  handleChangeAvatarImage 
}) => {
  const { t } = useTranslation();

  return (
    <div className="text-center">
      <div className="avatar-container">
        <div className="img-wrapper" id="img-wrapper" style={{ backgroundColor: `#${avatarColor}` }}>
          {hasImage && profileImage.imagePreviewUrl ? (
            <img
              src={profileImage.imagePreviewUrl}
              className="photo"
              alt="profilePhoto"
              id="image"
            />
          ) : (
            <div className="user-name-letters">
              {firstNameLetter || ''}
              {lastNameLetter || ''}
            </div>
          )}
          
          {loading && <div className="loading-overlay"><LoadingOutlined /></div>}
          
          <div className="avatar-controls">
            {hasImage ? (
              <Button 
                shape="circle" 
                icon={<CloseOutlined />} 
                className="avatar-button remove-button"
                onClick={handleRemoveImage}
                title={t("removeProfileImageMsgTxt")}
              />
            ) : (
              <Upload
                accept=".jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*"
                showUploadList={false}
                beforeUpload={handleChangeAvatarImage}
              >
                <Button 
                  shape="circle" 
                  icon={<CameraOutlined />} 
                  className="avatar-button upload-button"
                  title={t("selectFileMsgTxt")}
                />
              </Upload>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default profileAvatar; 