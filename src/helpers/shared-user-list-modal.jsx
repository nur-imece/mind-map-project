import React, { useState, useEffect } from "react";
import { Modal, Select, Button } from "antd";
import { useTranslation } from "react-i18next";
import MapService from "../services/api/map";
import Utils from "../libraries/utils";

const SharedUserListModal = ({ sharedClick, handler }) => {
	const [sharedUserList, setSharedUserList] = useState([]);
	const { t } = useTranslation();

	useEffect(() => {
		const closeButton = document.querySelector(".close-modal");
		if (closeButton) {
			closeButton.addEventListener("click", () => {
				sharedClick(false);
				localStorage.setItem('isCustomModalOpen', false);
			});
		}
		
		getSharedUserList();
		
		return () => {
			if (closeButton) {
				closeButton.removeEventListener("click", () => {
					sharedClick(false);
					localStorage.setItem('isCustomModalOpen', false);
				});
			}
		};
	}, [sharedClick]);

	const getSharedUserList = () => {
		const mindMapId = Utils.getParameterByName('mapId') || sessionStorage.getItem('openedMapId');
		
		MapService.getSharedUserList(mindMapId, (response) => {
			const userData = JSON.parse(response.response).list;
			if (userData && userData.length) {
				setSharedUserList(userData);
			}
		});
	};

	const changeUserPermission = (e, sharedMapId) => {
		const data = {
			sharedMindMapMailId: sharedMapId,
			mapPermissionId: e
		};
		MapService.updateUserMapPermission(JSON.stringify(data));
	};

	const removeUserFromMap = (mindMapId, sharedMapId) => {
		const data = {
			sharedMindMapMailId: sharedMapId,
			mindMapId: mindMapId
		};
		
		MapService.removeUserFromMap(JSON.stringify(data));
		
		// Remove user from state instead of direct DOM manipulation
		setSharedUserList(prev => prev.filter(user => user.sharedMindMapMailId !== sharedMapId));
	};

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
			<div className="popup">
				<div className="title">
					<span className="fa-stack fa-1x icon-wrap">
						<i className="fa fa-circle fa-stack-2x circle-icon"></i>
						<i className="fa fa-external-link fa-stack-1x sitemap-icon"></i>
					</span>
					<div className="text">
						{t("listOfSharedPeopleTitleMsgTxt")}
					</div>
				</div>
				<a className="close close-modal" onClick={handler}>&times;</a>
				<div className="select-shared">
					<ul>
						<li className="buttons shared-select">
							<div className="email-tab-contents">
								<div className="email-box active">
									<div className="share-selected-user-wrapper">
										<ul className="share-selected-user-list">
											{sharedUserList.length ? sharedUserList.map(user => (
												<li className="share-selected-user-item" key={user.sharedMindMapMailId} id={user.sharedMindMapMailId}>
													<span className="share-selected-user-mail">
														<span className="circle">
															<i className="fa fa-user"></i>
														</span>
														{user.firstnameLastName ? `${user.firstnameLastName} (${user.email})` : user.email}
													</span>
													<select 
														onChange={(e) => changeUserPermission(e.target.value, user.sharedMindMapMailId)} 					
														defaultValue={user.mapPermissionId}
													>
														<option value="1">
															{t("viewerMsgTxt")}
														</option>
														<option value="2">
															{t("editorMsgTxt")}
														</option>
													</select>
													<div className="remove-shared-user" 
														onClick={() => removeUserFromMap(user.mindMapId, user.sharedMindMapMailId)}
													>
														<i className="fa fa-times"></i>
													</div>
												</li>
											)) 
											: 
												<li>
													<i className="fa fa-exclamation-circle"></i>&nbsp;
													{t("noSharedPeopleInListMsgTxt")}
												</li>
											}
										</ul>
									</div>
								</div>
							</div>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
};

export default SharedUserListModal;
