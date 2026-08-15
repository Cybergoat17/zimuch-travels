// =========================================
// MOBILE NAVIGATION
// =========================================

const menuButton = document.getElementById("menuButton");
const navLinks = document.querySelector(".nav-links");

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    navLinks.classList.toggle("mobile-open");
    menuButton.classList.toggle("active");
  });

  // Close menu after clicking a navigation link
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("mobile-open");
      menuButton.classList.remove("active");
    });
  });
}
document.addEventListener("DOMContentLoaded", () => {
  /* =========================================
       BOOKING FORM ELEMENTS
    ========================================= */

  const returnButton = document.querySelector(
    '.trip-button[data-trip="return"]',
  );

  const oneWayButton = document.querySelector(
    '.trip-button[data-trip="one-way"]',
  );

  const returnDateGroup = document.querySelector("#returnDateGroup");

  const returnDateInput = document.querySelector("#returnDate");

  const bookingForm = document.querySelector("#bookingForm");

  /* =========================================
       TRIP TYPE
    ========================================= */

  let tripType = "return";

  function setTripType(type) {
    tripType = type;

    if (type === "one-way") {
      oneWayButton?.classList.add("active");
      returnButton?.classList.remove("active");

      // Hide return date
      if (returnDateGroup) {
        returnDateGroup.style.display = "none";
      }

      // Clear return date
      if (returnDateInput) {
        returnDateInput.value = "";
        returnDateInput.removeAttribute("required");
      }
    } else {
      returnButton?.classList.add("active");
      oneWayButton?.classList.remove("active");

      // Show return date
      if (returnDateGroup) {
        returnDateGroup.style.display = "";
      }

      // Make return date required
      if (returnDateInput) {
        returnDateInput.setAttribute("required", "");
      }
    }
  }

  /* =========================================
       BUTTON EVENTS
    ========================================= */

  returnButton?.addEventListener("click", () => {
    setTripType("return");
  });

  oneWayButton?.addEventListener("click", () => {
    setTripType("one-way");
  });

  /* =========================================
       PREVENT PAST DATES
    ========================================= */

  const today = new Date();

  const year = today.getFullYear();

  const month = String(today.getMonth() + 1).padStart(2, "0");

  const day = String(today.getDate()).padStart(2, "0");

  const todayString = `${year}-${month}-${day}`;

  document.querySelectorAll('input[type="date"]').forEach((input) => {
    input.min = todayString;
  });

  /* =========================================
       RETURN DATE VALIDATION
    ========================================= */

  const departureDateInput = document.querySelector("#departureDate");

  departureDateInput?.addEventListener("change", () => {
    if (!returnDateInput) return;

    if (departureDateInput.value) {
      returnDateInput.min = departureDateInput.value;

      // If existing return date is
      // before departure date, clear it
      if (
        returnDateInput.value &&
        returnDateInput.value < departureDateInput.value
      ) {
        returnDateInput.value = "";
      }
    }
  });

  /* =========================================
       FORM SUBMISSION
    ========================================= */

  bookingForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    /* ---------------------------------
               GET FORM VALUES
            --------------------------------- */

    const from = document.querySelector("#from")?.value.trim();

    const to = document.querySelector("#to")?.value.trim();

    const departureDate = document.querySelector("#departureDate")?.value;

    const returnDate = document.querySelector("#returnDate")?.value;

    const passengers = document.querySelector("#passengers")?.value;

    const cabin = document.querySelector("#cabin")?.value;

    const name = document.querySelector("#name")?.value.trim();

    const email = document.querySelector("#email")?.value.trim();

    const phone = document.querySelector("#phone")?.value.trim();

    /* =================================
               BASIC VALIDATION
            ================================= */

    if (!from) {
      showError("Please enter your departure location.");
      return;
    }

    if (!to) {
      showError("Please enter your destination.");
      return;
    }

    if (!departureDate) {
      showError("Please select your departure date.");
      return;
    }

    if (tripType === "return" && !returnDate) {
      showError("Please select your return date.");
      return;
    }

    if (!name) {
      showError("Please enter your name.");
      return;
    }

    if (!email) {
      showError("Please enter your email.");
      return;
    }

    if (!phone) {
      showError("Please enter your phone number.");
      return;
    }

    /* =================================
               RETURN DATE CHECK
            ================================= */

    if (tripType === "return" && returnDate < departureDate) {
      showError("Return date cannot be before the departure date.");

      return;
    }

    /* =================================
               BOOKING DATA
            ================================= */

    const bookingData = {
      tripType,

      from,

      to,

      departureDate,

      returnDate: tripType === "return" ? returnDate : null,

      passengers,

      cabin,

      name,

      email,

      phone,
    };

    console.log("Zimuch booking:", bookingData);

    /* =================================
       SUCCESS MESSAGE
================================= */

    showSuccess(bookingData);

    /*
     * Later we'll replace this with:
     *
     * WhatsApp
     * EmailJS
     * Backend API
     * Database
     * Admin dashboard
     *
     * DO NOT connect those yet.
     */
  });

  /* =========================================
       ERROR MESSAGE
    ========================================= */

  function showError(message) {
    removeMessages();

    const messageBox = document.createElement("div");

    messageBox.className = "form-message error";

    messageBox.textContent = message;

    bookingForm?.prepend(messageBox);

    messageBox.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  /* =========================================
       SUCCESS MESSAGE
    ========================================= */
  function showSuccess(bookingData) {
    if (!bookingForm) return;

    const bookingReference =
      "ZM-" + Math.floor(100000 + Math.random() * 900000);

    bookingForm.innerHTML = `
    <div class="booking-success">

      <div class="success-icon">
        <i class="fa-solid fa-check"></i>
      </div>

      <h3>Request Received!</h3>

      <p class="success-intro">
        Thanks <strong>${bookingData.name}</strong>.<br>
        Your flight quote request has been received.
      </p>

      <div class="booking-reference">
        <span>Request Reference</span>
        <strong>${bookingReference}</strong>
      </div>

      <div class="booking-summary">

        <div>
          <span>Trip</span>
          <strong>
            ${bookingData.from} → ${bookingData.to}
          </strong>
        </div>

        <div>
          <span>Departure</span>
          <strong>
            ${bookingData.departureDate}
          </strong>
        </div>

        ${
          bookingData.tripType === "return"
            ? `
              <div>
                <span>Return</span>
                <strong>
                  ${bookingData.returnDate}
                </strong>
              </div>
            `
            : ""
        }

        <div>
          <span>Passengers</span>
          <strong>
            ${bookingData.passengers}
          </strong>
        </div>

        <div>
          <span>Cabin</span>
          <strong>
            ${bookingData.cabin}
          </strong>
        </div>

      </div>

      <p class="booking-note">
        This is a flight quote request, not a confirmed ticket.
        A Zimuch Travels representative will contact you with
        available options and pricing.
      </p>

      <button
        type="button"
        class="new-request-button"
      >
        <i class="fa-solid fa-rotate-left"></i>
        Make Another Request
      </button>

    </div>
  `;

    const newRequestButton = bookingForm.querySelector(".new-request-button");

    newRequestButton?.addEventListener("click", () => {
      window.location.reload();
    });
  }
  /* =========================================
       REMOVE OLD MESSAGES
    ========================================= */

  function removeMessages() {
    document.querySelectorAll(".form-message").forEach((message) => {
      message.remove();
    });
  }

  /* =========================================
       DEFAULT STATE
    ========================================= */

  setTripType("return");
});
