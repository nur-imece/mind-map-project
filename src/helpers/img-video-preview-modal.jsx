import React, { useEffect } from "react";
import { Modal } from "antd";
import { useTranslation } from "react-i18next";
import Utils from "../libraries/utils";

const ImgVideoPreviewModal = ({ media, sharedClick, handler }) => {
	const { t } = useTranslation();
	
	useEffect(() => {
		const closeButton = document.querySelector(".close-modal");
		
		const closeModal = () => {
			sharedClick(false);
			localStorage.setItem('isCustomModalOpen', false);
		};
		
		if (closeButton) {
			closeButton.addEventListener("click", closeModal);
		}
		
		return () => {
			if (closeButton) {
				closeButton.removeEventListener("click", closeModal);
			}
		};
	}, [sharedClick]);

	const warningModal = () => {
		Utils.modalm().open({
			exitButtonText: t("exitMsgTxt"),
			title: t("warningSendMailMsgTxt"),
			bodyContent: t("warningmodalMsgTxt"),
			buttons: [
				{
					text: t("okMsgTxt"),
					class: 'button yellow-button confirm-button',
					href: ''
				},
			],
		});
	};

	return (
		<div className="overlay">
			<div className="popup img-video-preview-modal">
				<div className="title">
					<div className="text">
						{t("previewMsgTxt")}
					</div>
				</div>
				<a className="close close-modal" onClick={handler}>&times;</a>
				<div className="select-shared">
					<ul>
						<li className="buttons shared-select">
							<div className="email-tab-contents">
								<div className="email-box active">
									{media.type === 'IMG' ? (
                    <img src={media.src} alt="Image" />
                  ) : (
                    <video controls controlsList="nodownload" preload="metadata" disablePictureInPicture>
                      <source src={media.src} type="video/mp4" />
                    </video>
                  )}
								</div>
							</div>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
};

export default ImgVideoPreviewModal;
