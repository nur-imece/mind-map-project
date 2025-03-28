const Utils = {
  // Get URL parameters
  getParameterByName: (name, url) => {
    if (!url) url = window.location.href.replace("#", "?");
    name = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  },

  // Scroll element into view
  scrollElement: (element) => {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  },

  // Sort array by property
  sortArrByProp: (property) => {
    let sortOrder = 1;
    if (property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
    }
    return (a, b) => {
      const result = a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
      return result * sortOrder;
    };
  },

  // Check if device is iOS
  isIOS: (() => {
    return /iPad|iPhone|iPod/.test(navigator.platform) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  })(),

  // Debounce function
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Format date time
  formatDateTime: (dateTime, lang = 'en') => {
    if (!dateTime) return "";

    const [date, time] = dateTime.split("T");
    const [yyyy, mm, dd] = date.split("-");

    if (lang === "tr") {
      return `${dd}-${mm}-${yyyy} ${time}`;
    }
    return `${mm}-${dd}-${yyyy} ${time}`;
  },

  // Format date time without seconds
  formatDateTimeWithoutSecond: (dateTime, lang = 'en') => {
    if (!dateTime) return "";

    const [date, time] = dateTime.split("T");
    const [yyyy, mm, dd] = date.split("-");
    const [hours, minutes] = time.split(":");

    if (lang === "tr") {
      return `${dd}-${mm}-${yyyy} ${hours}:${minutes}`;
    }
    return `${mm}-${dd}-${yyyy} ${hours}:${minutes}`;
  },

  // Format date without time
  formatDateTimeWithoutTime: (dateTime) => {
    if (!dateTime) return "";

    const [date] = dateTime.split("T");
    const [yyyy, mm, dd] = date.split("-");
    return `${dd}.${mm}.${yyyy}`;
  },

  // Format date with month name
  formatDateWithMonthName: (dateTime, lang = 'en') => {
    if (!dateTime) return "";

    const [date] = dateTime.split("T");
    const [yyyy, mm, dd] = date.split("-");

    const monthNames = {
      "01": "January",
      "02": "February",
      "03": "March",
      "04": "April",
      "05": "May",
      "06": "June",
      "07": "July",
      "08": "August",
      "09": "September",
      "10": "October",
      "11": "November",
      "12": "December"
    };

    return `${dd} ${monthNames[mm]} ${yyyy}`;
  },

  // Loading screen management
  loadingScreen: {
    show: () => {
      const container = document.querySelector("body");
      if (!container.getAttribute("loading-screen")) {
        const loadingDiv = document.createElement("div");
        loadingDiv.classList.add("loading-screen");
        container.setAttribute("loading-screen", "true");
        container.appendChild(loadingDiv);
        loadingDiv.classList.add("show");
      }
    },
    hide: () => {
      const container = document.querySelector("body");
      const loadingDiv = document.querySelector(".loading-screen");
      if (loadingDiv) {
        loadingDiv.classList.remove("show");
        container.setAttribute("loading-screen", "false");
        setTimeout(() => {
          loadingDiv.remove();
        }, 300);
      }
    }
  },

  // Modal management
  modal: {
    show: (options) => {
      const {
        title,
        content,
        onConfirm,
        onCancel,
        confirmText = "OK",
        cancelText = "Cancel"
      } = options;

      const modal = document.createElement("div");
      modal.className = "modal";
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h3>${title}</h3>
            <button class="close-button">&times;</button>
          </div>
          <div class="modal-body">${content}</div>
          <div class="modal-footer">
            <button class="cancel-button">${cancelText}</button>
            <button class="confirm-button">${confirmText}</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const closeModal = () => {
        modal.remove();
      };

      modal.querySelector(".close-button").onclick = closeModal;
      modal.querySelector(".cancel-button").onclick = () => {
        if (onCancel) onCancel();
        closeModal();
      };
      modal.querySelector(".confirm-button").onclick = () => {
        if (onConfirm) onConfirm();
        closeModal();
      };
    }
  }
};

export default Utils; 