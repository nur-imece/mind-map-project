import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Checkbox, message, Tooltip, Modal, Upload } from "antd";
import { 
	InfoCircleOutlined, 
	UserOutlined, 
	CloseOutlined, 
	UploadOutlined,
	CameraOutlined,
	LoadingOutlined
} from "@ant-design/icons";
import IMask from 'imask';
import Resizer from 'react-image-file-resizer';
import accountService from "../../services/api/account";
import Header from "../../components/header";
import ClarifyingText from "../../components/profile-clarifying-text";
import ExplicitConsentText from "../../components/profile-explicit-consent-text";
import './index.scss';

const Profile = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [isCheckboxRequired, setIsCheckboxRequired] = useState(false);
	
	const [profileImage, setProfileImage] = useState({
		imagePreviewUrl: "",
		imagePreviewBase64Type: "",
		avatar: {
			name: "",
			extension: "",
			type: "",
			referenceId: "",
			referenceIdType: 0,
			file: ""
		}
	});
	
	const [hasImage, setHasImage] = useState(false);
	const [avatarColor, setAvatarColor] = useState('00ceff');
	const [getUserInfos, setGetUserInfos] = useState({
		company: "",
		jobTitle: "",
		avatarImage: null
	});
	
	useEffect(() => {
		localStorage.setItem("retrieveUrl", window.location.pathname);
		phoneNumberMask();
		getProfile();
	}, []);
	
	const phoneNumberMask = () => {
		const element = document.getElementById('phoneNumber');
		if (element) {
			IMask(element, {
				mask: '{+9\\0}(500)-000-00-00'
			});
		}
	};
	
	const getProfile = async () => {
		setLoading(true);
		try {
			const response = await accountService.getDetail();
			if (response.data) {
				fillProfile(response.data);
			}
		} catch (error) {
			console.error("Error fetching profile:", error);
			message.error(t("errorMsgTxt"));
		} finally {
			setLoading(false);
		}
	};
	
	const fillProfile = (userProfile) => {
		if (!userProfile || !userProfile.user) return;
		
		const { user } = userProfile;
		
		form.setFieldsValue({
			phoneNumber: user.phoneNumber,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			company: user.company,
			jobTitle: user.jobTitle
		});
		
		setGetUserInfos({
			company: user.company,
			jobTitle: user.jobTitle,
			avatarImage: user.avatarImagePath
		});
		
		if (user.avatarColorCode) {
			setAvatarColor(user.avatarColorCode);
		}
		
		setHasImage(user.hasProfileImage);
		
		localStorage.setItem('newUserProfileImage', user.avatarImagePath);
		localStorage.setItem('userHasImage', JSON.stringify(user.hasProfileImage));
	};
	
	const handleRemoveImage = (e) => {
		e && e.stopPropagation();
		
		Modal.confirm({
			title: t("removeProfileImageMsgTxt"),
			content: t("areyousureMsgTxt"),
			okText: t("yesMsgTxt"),
			cancelText: t("noMsgTxt"),
			onOk: async () => {
				setProfileImage({
					imagePreviewUrl: "",
					imagePreviewBase64Type: "",
					avatar: {
						name: "",
						extension: "",
						type: "",
						referenceId: "",
						referenceIdType: 0,
						file: ""
					}
				});
				setHasImage(false);
			}
		});
	};
	
	const handleChangeAvatarImage = (file) => {
		const fileSizeLimit = 2048; // 2MB max size
		if (file.size < (fileSizeLimit * 1024)) {
			setLoading(true);
			Resizer.imageFileResizer(
				file,
				5000,
				5000,
				'jpeg',
				50,
				0,
				(blob) => {
					const optimizedFileObj = new File([blob], (new Date().getTime().toString()) + (Math.floor(Math.random() * 10000000000000000) + 1).toString(), { type: blob.type });
					const reader = new FileReader();
					reader.readAsDataURL(optimizedFileObj);
					reader.onload = () => {
						const image = reader.result.split(';base64,')[1];
						setProfileImage({
							imagePreviewUrl: reader.result,
							imagePreviewBase64Type: image,
							avatar: {
								name: optimizedFileObj.name,
								extension: 'jpg',
								type: optimizedFileObj.type,
								referenceId: "",
								referenceIdType: 0,
								file: image
							}
						});
						setHasImage(true);
						setLoading(false);
					};
				},
				'blob'
			);
		} else {
			message.error(t("imageFileSizeMsgTxt").replace('*_*_*', fileSizeLimit));
		}
		return false; // Prevent automatic upload
	};
	
	const updateProfile = async () => {
		const formValues = form.getFieldsValue();
		
		const profileData = {
			firstName: formValues.firstName,
			lastName: formValues.lastName,
			company: formValues.company,
			jobTitle: formValues.jobTitle,
			phoneNumber: formValues.phoneNumber,
			email: formValues.email,
			avatarColorCode: avatarColor,
		};
		
		if (hasImage) {
			// Include avatar data if an image is uploaded
			profileData.avatarImage = profileImage.avatar;
		}
		
		if (profileData.phoneNumber && profileData.phoneNumber.length > 0 && profileData.phoneNumber.length < 18) {
			message.error(t('wrongPhoneNumberMsgTxt'));
			return false;
		}
		
		if (
			(getUserInfos.company === profileData.company) &&
			(getUserInfos.jobTitle === profileData.jobTitle) &&
			(!hasImage || profileImage.avatar.file === '')
		) {
			// No changes to company, jobTitle, or avatar
			try {
				setLoading(true);
				await accountService.updateDetail(profileData);
				message.success(t("successMsgTxt"));
			} catch (error) {
				message.error(t("errorMsgTxt"));
			} finally {
				setLoading(false);
			}
		} else {
			// Changes to company, jobTitle, or avatar
			setIsCheckboxRequired(true);
			
			const requiredErr = document.querySelector('.required-err');
			if (requiredErr) {
				requiredErr.classList.add('red');
				requiredErr.classList.remove('none');
			}
			
			const checkbox1 = document.querySelector("#checkbox1-clarify");
			const checkbox2 = document.querySelector("#checkbox2-explicit");
			
			if (checkbox1 && checkbox2 && checkbox1.checked && checkbox2.checked) {
				if (requiredErr) {
					requiredErr.classList.remove('red');
					requiredErr.classList.add('none');
				}
				
				try {
					setLoading(true);
					await accountService.updateDetail(profileData);
					message.success(t("successMsgTxt"));
				} catch (error) {
					message.error(t("errorMsgTxt"));
				} finally {
					setLoading(false);
				}
			} else {
				return false;
			}
		}
		setIsCheckboxRequired(false);
	};
	
	const checkboxCheckControl = (e) => {
		if (e.target.checked) {
			const parentNode = e.target.closest('.agreement-wrapper');
			if (parentNode) {
				const requiredErr = document.querySelector(".required-err");
				if (requiredErr) {
					requiredErr.classList.remove('red');
					requiredErr.classList.add('none');
				}
			}
		}
	};
	
	const clarificationTextModal = () => {
		Modal.info({
			title: t("profileUpdateClarifyAgreementTitle"),
			content: <div className="membership-agreement" dangerouslySetInnerHTML={{ __html: ClarifyingText() }} />,
			okText: t("okMsgTxt"),
			width: 800,
		});
	};
	
	const explicitConsentTextModal = () => {
		Modal.info({
			title: t("profileUpdateExplicitConsentTextTitle"),
			content: <div className="membership-agreement" dangerouslySetInnerHTML={{ __html: ExplicitConsentText() }} />,
			okText: t("okMsgTxt"),
			width: 800,
		});
	};
	
	return (
		<>
			<Header />
			<div className="profile-page">
				<div className="profile-panel">
					<div className="profile-header">
						<h2>{t("profileMsgTxt")}</h2>
					</div>
					<Form form={form} layout="vertical">
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
											{form.getFieldValue("firstName")?.charAt(0) || ''}
											{form.getFieldValue("lastName")?.charAt(0) || ''}
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

						<Form.Item
							name="firstName"
							rules={[{ required: true, message: t("requiredMsgTxt") }]}
						>
							<Input 
								placeholder={t("firstnameMsgTxt")}
								maxLength={50}
								prefix={<UserOutlined />}
							/>
						</Form.Item>

						<Form.Item
							name="lastName"
							rules={[{ required: true, message: t("requiredMsgTxt") }]}
						>
							<Input 
								placeholder={t("lastnameMsgTxt")}
								maxLength={50}
								prefix={<UserOutlined />}
							/>
						</Form.Item>

						<Form.Item
							name="phoneNumber"
							rules={[{ required: true, message: t("requiredMsgTxt") }]}
						>
							<Input 
								id="phoneNumber"
								placeholder={'+90 ' + t("phonenumberMsgTxt")}
							/>
						</Form.Item>

						<Form.Item
							name="email"
							rules={[
								{ required: true, message: t("requiredMsgTxt") },
								{ type: 'email', message: t("validEmailMsgTxt") }
							]}
						>
							<Input 
								className="profile-email-input"
								placeholder={t("currentemailMsgTxt")}
								maxLength={50}
								readOnly
							/>
						</Form.Item>

						<Form.Item
							name="company"
							rules={[{ required: true, message: t("requiredMsgTxt") }]}
						>
							<Input 
								placeholder={t("companyMsgTxt")}
								maxLength={50}
							/>
						</Form.Item>

						<Form.Item
							name="jobTitle"
							rules={[{ required: true, message: t("requiredMsgTxt") }]}
						>
							<Input 
								placeholder={t("jobtitleMsgTxt")}
								maxLength={50}
							/>
						</Form.Item>

						<div className="profile-agreement-info">
							<InfoCircleOutlined /> {' '}
							{t("profileAgreementsInfoMsgText")}
						</div>

						<div className="agreement-wrapper">
							<Checkbox 
								id="checkbox1-clarify"
								className={isCheckboxRequired ? 'validate-required' : ''}
								onChange={checkboxCheckControl}
							>
								<span className="text">
									<b>
										<u>
											<a onClick={clarificationTextModal}>{t("profileUpdateClarifyAgreement")}</a>
										</u>
									</b>
									{" " + t("registerMembershipAgreement") + " "}
								</span>
							</Checkbox>
						</div>

						<div className="agreement-wrapper">
							<Checkbox 
								id="checkbox2-explicit"
								className={isCheckboxRequired ? 'validate-required' : ''}
								onChange={checkboxCheckControl}
							>
								<span className="text">
									<b>
										<u>
											<a onClick={explicitConsentTextModal}>{t("profileUpdateExplicitConsentText")}</a>
										</u>
									</b>
									{" " + t("registerMembershipAgreement") + " "}
								</span>
							</Checkbox>
						</div>

						<div className="required-err none">
							<span>{t("profileUpdateAgreementReqiredInfoMsgTxt")}</span>
						</div>

						<Form.Item>
							<Button
								type="primary"
								className="yellow-button"
								onClick={updateProfile}
								loading={loading}
								block
							>
								{t("saveMsgTxt")}
							</Button>
						</Form.Item>
					</Form>
				</div>
			</div>
		</>
	);
};

export default Profile;
