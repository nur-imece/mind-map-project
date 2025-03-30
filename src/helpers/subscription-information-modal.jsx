import React from "react";
import { Modal, Button } from "antd";
import { useTranslation } from "react-i18next";

const SubscriptionInformationModal = ({ popupContent, sharedClick }) => {
	const { t } = useTranslation();
	
	const handleClose = () => {
		sharedClick(false);
		localStorage.setItem('isCustomModalOpen', false);
	};

	return (
		<Modal
			title={popupContent.title}
			open={true}
			onCancel={handleClose}
			centered
			footer={[
				<Button 
					key="ok" 
					type="primary" 
					onClick={handleClose}
				>
					{t("okMsgTxt")}
				</Button>
			]}
		>
			<div dangerouslySetInnerHTML={{ __html: popupContent.content }}></div>
		</Modal>
	);
};

export default SubscriptionInformationModal;
