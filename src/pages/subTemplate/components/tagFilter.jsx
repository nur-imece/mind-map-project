import React from "react";
import { Input, Tag } from "antd";
import { useTranslation } from "react-i18next";
import "./templateModal.scss";

const TagFilter = ({ tags, inputValue, handleInputChange, handleInputKeyDown, removeTag }) => {
  const { t } = useTranslation();

  return (
    <div className="sub-template__tag-filter-container">
      <div className="sub-template__filter-row">
        <div className="sub-template__tags-wrapper">
          {tags.map(tag => (
            <Tag
              key={tag}
              closable
              onClose={() => removeTag(tag)}
              className="sub-template__tag"
            >
              {tag}
            </Tag>
          ))}
        </div>
        <Input
          className="sub-template__custom-input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder={t("filterByTagOrNameMsgTxt")}
        />
      </div>
    </div>
  );
};

export default TagFilter; 