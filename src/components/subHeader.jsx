import React from "react";

const SubHeader = (props) =>  {

    const {title, iconName} = props;

    return (
        <div className="mind-map-board2 py-3">
            <div className="title">
                {iconName && (
                    <i className={iconName}></i>
                )}
                <span style={{ marginLeft: iconName ? 34 : 0}}>{title}</span>
            </div>
        </div>
    );
}

export default SubHeader;
