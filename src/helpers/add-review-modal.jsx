import React, { Component } from "react";
import Resources from "../libraries/resources";
import Utils from "../libraries/utils";
import closeIconImg from "./../styles/img/close-icon-img.png";
import ReactStars from "react-rating-stars-component";
import LandingPageService from "../services/api/landing-page";
import FeedbackClarifyingText from "../components/feedback-clarifying-text";

class AddReviewModal extends Component {

	constructor(props) {
		super(props);
		this.state = {
			reviewTitle: "",
			reviewNameSurname: "",
			reviewMessage: "",
			hideNameSurname: false,
			hideImage: false
		};

		this.hideNameSurnameFunc = this.hideNameSurnameFunc.bind(this);
		this.hideImageFunc = this.hideImageFunc.bind(this);
	}

	componentDidMount() {
		this.openModal();
	}

	hideNameSurnameFunc() {
    var hideNameSurnameVal = document.querySelector("#hideNameSurname input").checked;
		if(hideNameSurnameVal !== undefined) {
			this.setState({
				hideNameSurname: hideNameSurnameVal
			})
		}
  }

	hideImageFunc() {
    var hideImageVal = document.querySelector("#hideImage input").checked;
		if(hideImageVal !== undefined) {
			this.setState({
				hideImage: hideImageVal
			})
		}
  }

	openModal() {
		var _this = this;
		document.querySelector(".close").addEventListener("click", function () {
			_this.props.sharedClick(false);
			_this.props.setReviewRate(0);
			localStorage.setItem("reviewRate", 0);
		})

		document.querySelector(".cancel").addEventListener("click", function () {
			_this.props.sharedClick(false);
			_this.props.setReviewRate(0);
			localStorage.setItem("reviewRate", 0);
		});
	}

	requiredFieldsKeyUp = (e) => {
		if(e.target.value !== '') {
			e.target.classList.remove('red');
		}
	}

	requiredClarifyTextCheck = (e) => {
		if(e.target.checked) {
			document.querySelector(".clarify-required-error").classList.remove('red');
			document.querySelector(".clarify-required-error").classList.add('none');
		}
	}

	sendReview = () => {
		var _this = this;
		var title = document.querySelector(".review-title").value;
		var message = document.querySelector(".review-message").value;

		if(message === '') {
			document.querySelector(".review-message").classList.add('red');
		} else {
			if (document.querySelector(".review-message").classList.contains('red')) {
				document.querySelector(".review-message").classList.remove('red');
			}

			if(
				(this.state.hideNameSurname === false && this.state.hideImage === false) ||
				(this.state.hideNameSurname === true && this.state.hideImage === false) ||
				(this.state.hideNameSurname === false && this.state.hideImage === true)
			) {
				if(document.querySelector("#checkbox-clarify").checked) {
					document.querySelector(".clarify-required-error").classList.remove('red');
					document.querySelector(".clarify-required-error").classList.add('none');

					var data = {
						title: title,
						userId: JSON.parse(localStorage.getItem('userInformation')).id,
						description: message,
						star: JSON.parse(localStorage.getItem('reviewRate')),
						hideMyNameSurname: this.state.hideNameSurname,
						hideMyProfileImage: this.state.hideImage
					}
					LandingPageService.sendReview(JSON.stringify(data));
					_this.props.sharedClick(false);
					_this.props.setReviewRate(0);
					localStorage.setItem('isCustomModalOpen', false);
					document.querySelector(".review-title").value = "";
					document.querySelector(".review-message").value = "";
					document.querySelector("#checkbox-clarify").checked = false;
				} else {
					document.querySelector(".clarify-required-error").classList.add('red');
					document.querySelector(".clarify-required-error").classList.remove('none');
					return false;
				}
			} else {
				document.querySelector(".clarify-required-error").classList.remove('red');
				document.querySelector(".clarify-required-error").classList.add('none');
				var data = {
					title: title,
					userId: JSON.parse(localStorage.getItem('userInformation')).id,
					description: message,
					star: JSON.parse(localStorage.getItem('reviewRate')),
					hideMyNameSurname: this.state.hideNameSurname,
					hideMyProfileImage: this.state.hideImage
				}
				LandingPageService.sendReview(JSON.stringify(data));
				_this.props.sharedClick(false);
				_this.props.setReviewRate(0);
				localStorage.setItem('isCustomModalOpen', false);
				document.querySelector(".review-title").value = "";
				document.querySelector(".review-message").value = "";
				document.querySelector("#checkbox-clarify").checked = false;
			}
		}
	};

	reviewTitle(e) {
		var title = e.target.value;
		this.setState({
			reviewTitle: title
		});
	}

	reviewNameSurname(e) {
		var name = e.target.value;
		this.setState({
			reviewNameSurname: name
		});
	}

	reviewMessage(e) {
		var message = e.target.value
		this.setState({
			anonymousSendMessage: message
		})
	}

	messageKeyUpHandler(e) {
		var len = e.target.textLength;
		document.getElementById('review-messagebox').value = document.getElementById('review-messagebox').value.substring(0, 500);
		if (len >= 500) {
			document.getElementById('current').innerHTML = 500;
			document.getElementById('review-messagebox').maxLength = 500;
			return false;
		}
		else {
			document.getElementById('current').innerHTML = len;
		}

		if(e.target.value !== '') {
			e.target.classList.remove('red');
		}
	}

	feedbackClarificationTextModal() {
    Utils.modalm().open({
      exitButtonText: Resources.getValue("exitMsgTxt"),
      title: Resources.getValue("feedbackClarifyAgreementTitle"),
      bodyContent:
        '<div class="membership-agreement">' + FeedbackClarifyingText() + "</div>",
      buttons: [
        {
          text: Resources.getValue("okMsgTxt"),
          class: "button yellow-button confirm-button",
          href: "",
        },
      ],
    });
  }

	render() {
		return (
			<div className="overlay">
				<div className="popup review-modal">
					<div className="title">
						<div className="text">
							{Resources.getValue("addYourReviewMsgTxt")} 
						</div>
						<div className="selected-rate">
							<ReactStars {...{
								size: 16,
								count: 5,
								color: "#fcbc2c",
								activeColor: "#fcbc2c",
								value: this.props.reviewRate,
								edit: false,
								a11y: true,
								emptyIcon: <i className="fa-star-o" />,
								filledIcon: <i className="fa fa-star" />
							}} />
						</div>
					</div>
					<a className="close" ><img src={closeIconImg} alt={Resources.getValue('closeMsgTxt')} /></a>
					<div className="select-shared">
						<div className="email-tab-contents">
							<form className="email-box" onSubmit={(e) => e.preventDefault()}>
								<div className="popup-input mail-input">
									<div className="input-select-wrapper w-100">
										<input 
											type="text"
											readOnly 
											id="review-name-input" 
											className="review-name"
											onChange={(e) => this.reviewNameSurname(e)}
											placeholder={Resources.getValue("nameSurnameMsgTxt")}
											value={JSON.parse(localStorage.getItem('userInformation')).firstName + ' ' + JSON.parse(localStorage.getItem('userInformation')).lastName}
										/>
									</div>
								</div>
								<div className="popup-input info-box">
									<div className="hide-show-check">
										<label
											id="hideNameSurname"
											className="register-checkbox container-checkbox login-label silver-gray-button">
											{Resources.getValue("hideMyNameMsgTxt")}
											<input type="checkbox" onChange={this.hideNameSurnameFunc} />
											<span className="checkmark"></span>
										</label>
									</div>
									<div className="hide-show-check">
										<label
											id="hideImage"
											className="register-checkbox container-checkbox login-label silver-gray-button">
											{Resources.getValue("hideMyImageMsgTxt")}
											<input type="checkbox" onChange={this.hideImageFunc} />
											<span className="checkmark"></span>
										</label>
									</div>
								</div>
								<div className="popup-input mail-input">
									<div className="input-select-wrapper w-100">
										<input type="text" id="review-title-input" className="review-title"
											onChange={(e) => this.reviewTitle(e)}
											// onKeyUp={(e) => this.requiredFieldsKeyUp(e)}
											placeholder={Resources.getValue("titleMsgTxt")}
											maxLength={150}
										/>
									</div>
								</div>
								<div className="popup-input message-area">
									<textarea
										id="review-messagebox"
										className="review-message"
										cols="30"
										rows="4"
										onChange={(e) => this.reviewMessage(e)}
										placeholder={Resources.getValue("commentMsgTxt") + ' *'}
										onKeyUp={this.messageKeyUpHandler}
									></textarea>
								</div>
								<div className="popup-input info-wrap">
									<div id="required-fields-error">
										{'{*}'} {Resources.getValue('requiredFieldsMsgTxt')}
									</div>
									<div className="count-area">
										<div id="message-count">
											<span id="current">0</span>
											<span id="maximum">/500</span>
										</div>
									</div>
								</div>
								{(this.state.hideNameSurname === true && this.state.hideImage === true) ?
								'' :
									(
										<>
											<div className="popup-input my-2">
												<div className="feedback-clarify-info">
													<i
														className="fa fa-info-circle"
														aria-hidden="true"
													></i> {'  '}
													{Resources.getValue('feedbackClarifyInfoMsgTxt')}
												</div>
											</div>
											<div className="popup-input">
												<div className="agreement-wrapper">
													<label className="register-checkbox container-checkbox register-label">
														<input
															type="checkbox"
															id="checkbox-clarify"
															name="checkbox"
															onChange={(e) => this.requiredClarifyTextCheck(e)}
														/>
														<span className="checkmark"></span>
													</label>
													<span className="text">
														<b>
															<u>
															<a onClick={this.feedbackClarificationTextModal}>
																{Resources.getValue("feedbackClarifyAgreement")}
															</a>
															</u>
														</b>
														{" " + Resources.getValue("registerCheckboxAllowClarifyAgreement") + " "} 
														<span className="clarify-required-error none">
															{' ' + Resources.getValue("requiredMsgTxt")}
														</span>
													</span>
												</div>
											</div>
										</>
									)
								}
								<div className="share-send-button">
									<div className="right-button-wrap">
										<a className="yellow-button cancel">
											{Resources.getValue("cancelMsgTxt")}
										</a>
										<button
											className="yellow-button button submit-form-button float-right"
											type="submit"
											title={Resources.getValue("sendMsgTxt")}
											onClick={this.sendReview}
										>
											{Resources.getValue("contactsendMsgTxt")}
										</button>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default AddReviewModal;
