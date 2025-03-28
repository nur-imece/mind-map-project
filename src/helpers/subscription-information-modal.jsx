import React, { useEffect } from "react";
import { Modal } from "antd";
import { useTranslation } from "react-i18next";

const SubscriptionInformationModal = ({ popupContent, sharedClick, handler }) => {
	const { t } = useTranslation();
	
	useEffect(() => {
		const closeModal = () => {
			sharedClick(false);
			localStorage.setItem('isCustomModalOpen', false);
		};
		
		const closeButton = document.querySelector(".close-modal");
		if (closeButton) {
			closeButton.addEventListener("click", closeModal);
		}
		
		return () => {
			if (closeButton) {
				closeButton.removeEventListener("click", closeModal);
			}
		};
	}, [sharedClick]);

	return (
		<div className="overlay subscription-information-modal">
			<div className="popup">
				<div className="title">
					{popupContent.title}
				</div>
				<a className="close close-modal" onClick={handler}>&times;</a>
				<div className="select-shared">
					<div className="modal-content-wrapper">
						<div dangerouslySetInnerHTML={{ __html: popupContent.content }}></div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SubscriptionInformationModal;
