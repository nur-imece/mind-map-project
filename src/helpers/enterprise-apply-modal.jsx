import React, { Component } from "react";
import Resources from "../libraries/resources";
import IMask from 'imask';
import Utils from "../libraries/utils";
import closeIconImg from "./../styles/img/close-icon-img.png";
import LandingPageService from "../services/api/landing-page";

class EnterpriseApplyModal extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    var _this = this;
    Utils.formValidation();
    this.phoneNumberMask();
    this.openModal();

    // number input char control (8 for backspace && 48-57 for 0-9 numbers)
    document.querySelector("#companyUserCount").addEventListener("keypress", function (evt) {
      if (evt.which != 8 && evt.which < 48 || evt.which > 57) {
        evt.preventDefault();
      }
    });

    window.applyDataSend = function () {
      const datas = {
        companyName: this.document.querySelector("#companyName").value,
				companyUserCount: this.document.querySelector("#companyUserCount").value ? parseInt(this.document.querySelector("#companyUserCount").value) : 0,
				contactFullName: this.document.querySelector("#contactFullName").value,
				contactNumber: document.querySelector("#contactNumber").value,
        contactEmail: document.querySelector("#contactEmail").value,
				description: this.document.querySelector("#description").value,
      }
      LandingPageService.sendCorporationSubscriptionApply(JSON.stringify(datas));
      _this.props.sharedClick(false);
    };
  }

  phoneNumberMask() {
		IMask(document.getElementById('contactNumber'), {
			mask: '{+9\\0}(000)-000-00-00'
		});
	};

  openModal() {
    var _this = this;
    document.querySelector(".close").addEventListener("click", function () {
      _this.props.sharedClick(false);
    });
  }

  render() {
    return (
      <div className="overlay">
        <div className="popup enterprise-apply-modal">
          <div className="title">
            <div className="text">
              {Resources.getValue("companySubscriptionApplyTitleMsgTxt")}
              <div className="landing-page-mail">
                <i className="i-icon fa fa-envelope mr-2"></i>
                <a className="landing-page-mail" href="mailto:info@zihinlerfora.com">info@zihinlerfora.com</a>
              </div>
            </div>
          </div>
          <a className="close" ><img src={closeIconImg} alt={Resources.getValue('closeMsgTxt')} /></a>
          <div className="select-shared">
            <div className="email-tab-contents">
              <div className="email-box">
                <form onSubmit={(e) => { e.preventDefault() }}>
                  <div className="row ">
                    <div className="col-md-6">
                      <div className="row">
                        <div className="col-md-12">
                          <div className="form-group">
                            <input
                              type="text"
                              id="companyName"
                              name="companyName"
                              className="form-control-input validate-required"
                              placeholder={Resources.getValue("companyNameMsgTxt")}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-12">
                          <div className="form-group">
                            <input
                              type="number"
                              id="companyUserCount"
                              name="companyUserCount"
                              className="form-control-input"
                              placeholder={Resources.getValue("companyApproximatelyUserCountMsgTxt")}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-12">
                          <div className="form-group">
                            <input
                              type="text"
                              id="contactFullName"
                              name="contactFullName"
                              className="form-control-input validate-required"
                              placeholder={Resources.getValue("companyContactUserNameSurnameMsgTxt")}
                              maxLength="150"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-12">
                          <div className="form-group">
                            <input
                              className="form-control-input validate-required"
                              id="contactNumber"
                              name="contactNumber"
                              placeholder={Resources.getValue("companyContactUserPhoneMsgTxt")}
                              data-minlength="18"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-12">
                          <div className="form-group">
                            <input
                              type="text"
                              id="contactEmail"
                              name="contactEmail"
                              className="form-control-input validate-email"
                              placeholder={Resources.getValue("companyContactUserEmailMsgTxt")}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="row">
                        <div className="col-md-12">
                          <div className="form-group">
                            <textarea
                              rows="4"
                              cols="66"
                              type="text"
                              id="description"
                              name="description"
                              className="form-control-textarea"
                              placeholder={Resources.getValue("companyApplyDescriptionMsgTxt")}
                              maxLength="500"
                              title={Resources.getValue("companyApplyDescriptionMsgTxt")}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-12">
                          <div className="form-group">
                            <button
                              className="form-control-submit-button button submit-form-button"
                              title={Resources.getValue("contactsendMsgTxt")}
                              type="submit"
                              data-submit-method="applyDataSend"
                            >
                              {Resources.getValue("contactsendMsgTxt")}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default EnterpriseApplyModal;
