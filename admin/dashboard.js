import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://iwcmxyoejaezmwkdjhby.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_WwsBkdDls4e9PPuVLLV1YQ_z4Gaq5VG";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const bookingsContainer = document.getElementById("bookingsContainer");

const logoutButton = document.getElementById("logoutButton");

const searchInput = document.getElementById("searchBookings");

const statusFilter = document.getElementById("statusFilter");

const totalBookings = document.getElementById("totalBookings");

const pendingBookings = document.getElementById("pendingBookings");

const confirmedBookings = document.getElementById("confirmedBookings");

const bookingModal = document.getElementById("bookingModal");

const bookingDetails = document.getElementById("bookingDetails");

const invoicePaymentStatus = document.getElementById("invoicePaymentStatus");

const invoicePaymentBadge = document.getElementById("invoicePaymentBadge");

const invoiceModal = document.getElementById("invoiceModal");

const closeInvoiceModal = document.getElementById("closeInvoiceModal");

const invoiceNumber = document.getElementById("invoiceNumber");

const invoiceCustomer = document.getElementById("invoiceCustomer");

const invoiceEmail = document.getElementById("invoiceEmail");

const invoicePhone = document.getElementById("invoicePhone");

const invoiceReference = document.getElementById("invoiceReference");

const invoiceDate = document.getElementById("invoiceDate");

const invoiceRoute = document.getElementById("invoiceRoute");

const invoiceDeparture = document.getElementById("invoiceDeparture");

const invoiceReturn = document.getElementById("invoiceReturn");

const invoicePassengers = document.getElementById("invoicePassengers");

const invoiceCabin = document.getElementById("invoiceCabin");

const invoiceFlightPrice = document.getElementById("invoiceFlightPrice");

const invoiceServiceFee = document.getElementById("invoiceServiceFee");

const invoiceDiscount = document.getElementById("invoiceDiscount");

const invoiceAmountPaid = document.getElementById("invoiceAmountPaid");

const invoiceAmountDue = document.getElementById("invoiceAmountDue");

const invoiceTotal = document.getElementById("invoiceTotal");

const saveInvoice = document.getElementById("saveInvoice");

const printInvoice = document.getElementById("printInvoice");

let selectedBooking = null;

const closeBookingModal = document.getElementById("closeBookingModal");

const cancelledBookings = document.getElementById("cancelledBookings");

let allBookings = [];

/* ================================
   CHECK AUTHENTICATION
================================ */

const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  window.location.href = "index.html";
}

/* ================================
   LOGOUT
================================ */

logoutButton.addEventListener("click", async () => {
  await supabase.auth.signOut();

  window.location.href = "index.html";
});

/* ================================
   LOAD BOOKINGS
================================ */

async function loadBookings() {
  bookingsContainer.innerHTML = `
    <p>Loading bookings...</p>
  `;

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("Booking error:", error);

    bookingsContainer.innerHTML = `
      <p>Unable to load bookings.</p>
    `;

    return;
  }

  allBookings = data || [];

  updateStatistics();

  displayBookings();
}

/* ================================
   STATISTICS
================================ */

function updateStatistics() {
  totalBookings.textContent = allBookings.length;

  pendingBookings.textContent = allBookings.filter(
    (booking) => booking.status === "pending",
  ).length;

  confirmedBookings.textContent = allBookings.filter(
    (booking) => booking.status === "confirmed",
  ).length;

  cancelledBookings.textContent = allBookings.filter(
    (booking) => booking.status === "cancelled",
  ).length;
}

/* ================================
   DISPLAY BOOKINGS
================================ */

function displayBookings() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  const selectedStatus = statusFilter.value;

  const filteredBookings = allBookings.filter((booking) => {
    const matchesSearch =
      !searchTerm ||
      booking.reference?.toLowerCase().includes(searchTerm) ||
      booking.name?.toLowerCase().includes(searchTerm) ||
      booking.email?.toLowerCase().includes(searchTerm) ||
      booking.from_city?.toLowerCase().includes(searchTerm) ||
      booking.to_city?.toLowerCase().includes(searchTerm);

    const matchesStatus =
      selectedStatus === "all" || booking.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  if (filteredBookings.length === 0) {
    bookingsContainer.innerHTML = `
      <div class="booking-card">
        <p>No matching bookings found.</p>
        <div class="booking-card-actions">

  <button
    class="view-booking"
    data-id="${booking.id}"
  >
    View Details
  </button>

</div>
      </div>
    `;

    return;
  }

  bookingsContainer.innerHTML = filteredBookings
    .map((booking) => {
      const cabinName =
        booking.cabin === "first"
          ? "First Class"
          : booking.cabin === "premium"
            ? "Premium Economy"
            : booking.cabin === "business"
              ? "Business"
              : booking.cabin === "economy"
                ? "Economy"
                : booking.cabin;

      return `
          <div class="booking-card">

            <div class="booking-top">

              <strong>
                ${booking.reference}
              </strong>

              <select
                class="status-select"
                data-id="${booking.id}"
              >

                <option
                  value="pending"
                  ${booking.status === "pending" ? "selected" : ""}
                >
                  Pending
                </option>

                <option
                  value="contacted"
                  ${booking.status === "contacted" ? "selected" : ""}
                >
                  Contacted
                </option>

                <option
                  value="confirmed"
                  ${booking.status === "confirmed" ? "selected" : ""}
                >
                  Confirmed
                </option>

                <option
                  value="cancelled"
                  ${booking.status === "cancelled" ? "selected" : ""}
                >
                  Cancelled
                </option>

              </select>

            </div>

            <h3>
              ${booking.from_city}
              →
              ${booking.to_city}
            </h3>

            <p>
              <strong>Passenger:</strong>
              ${booking.name}
            </p>

            <p>
              <strong>Email:</strong>
              ${booking.email}
            </p>

            <p>
              <strong>Phone:</strong>
              ${booking.phone}
            </p>

            <p>
              <strong>Passengers:</strong>
              ${booking.passengers}
            </p>

            <p>
              <strong>Cabin:</strong>
              ${cabinName}
            </p>

            <p>
              <strong>Departure:</strong>
              ${booking.departure_date}
            </p>

            ${
              booking.return_date
                ? `
                  <p>
                    <strong>Return:</strong>
                    ${booking.return_date}
                  </p>
                `
                : ""
            }

           <div class="booking-card-actions">

  <button
    class="view-booking"
    data-id="${booking.id}"
  >
    View Details
  </button>

  <button
    class="generate-invoice"
    data-id="${booking.id}"
  >
    Generate Invoice
  </button>

</div>

          </div>
        `;
    })
    .join("");

  attachStatusListeners();
  attachBookingDetailListeners();
  attachInvoiceListeners();
}

/* ================================
   UPDATE BOOKING STATUS
================================ */

function attachStatusListeners() {
  const statusSelects = document.querySelectorAll(".status-select");

  statusSelects.forEach((select) => {
    select.addEventListener("change", async (event) => {
      const bookingId = event.target.dataset.id;

      const newStatus = event.target.value;

      const { error } = await supabase
        .from("bookings")
        .update({
          status: newStatus,
        })
        .eq("id", bookingId);

      if (error) {
        console.error("Status update error:", error);

        alert("Unable to update booking status.");

        return;
      }

      // Update local data
      const booking = allBookings.find((item) => item.id == bookingId);

      if (booking) {
        booking.status = newStatus;
      }

      updateStatistics();

      displayBookings();
    });
  });
}

/* ================================
   SEARCH
================================ */

searchInput.addEventListener("input", displayBookings);

/* ================================
   STATUS FILTER
================================ */

statusFilter.addEventListener("change", displayBookings);

/* ================================
   START
================================ */

/* ================================
   BOOKING DETAILS
================================ */

function attachBookingDetailListeners() {
  const buttons = document.querySelectorAll(".view-booking");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const bookingId = button.dataset.id;

      const booking = allBookings.find((item) => item.id == bookingId);

      if (!booking) return;

      showBookingDetails(booking);
    });
  });
}

function showBookingDetails(booking) {
  const cabinName =
    booking.cabin === "first"
      ? "First Class"
      : booking.cabin === "premium"
        ? "Premium Economy"
        : booking.cabin === "business"
          ? "Business"
          : booking.cabin === "economy"
            ? "Economy"
            : booking.cabin;

  const whatsappNumber = (booking.phone || "").replace(/\D/g, "");

  bookingDetails.innerHTML = `

    <div class="booking-details-header">

      <h2>
        ${booking.from_city} → ${booking.to_city}
      </h2>

      <div class="booking-details-reference">
        ${booking.reference}
      </div>

    </div>


    <div class="booking-detail-section">

      <h3>Passenger Information</h3>

      <div class="booking-detail-row">
        <span>Name</span>
        <span>${booking.name}</span>
      </div>

      <div class="booking-detail-row">
        <span>Email</span>
        <span>${booking.email}</span>
      </div>

      <div class="booking-detail-row">
        <span>Phone</span>
        <span>${booking.phone}</span>
      </div>

    </div>


    <div class="booking-detail-section">

      <h3>Flight Information</h3>

      <div class="booking-detail-row">
        <span>From</span>
        <span>${booking.from_city}</span>
      </div>

      <div class="booking-detail-row">
        <span>To</span>
        <span>${booking.to_city}</span>
      </div>

      <div class="booking-detail-row">
        <span>Departure</span>
        <span>${booking.departure_date}</span>
      </div>

      ${
        booking.return_date
          ? `
            <div class="booking-detail-row">
              <span>Return</span>
              <span>${booking.return_date}</span>
            </div>
          `
          : ""
      }

      <div class="booking-detail-row">
        <span>Passengers</span>
        <span>${booking.passengers}</span>
      </div>

      <div class="booking-detail-row">
        <span>Cabin</span>
        <span>${cabinName}</span>
      </div>

    </div>


    <div class="booking-detail-section">

      <h3>Booking Information</h3>

      <div class="booking-detail-row">
        <span>Reference</span>
        <span>${booking.reference}</span>
      </div>

      <div class="booking-detail-row">
        <span>Status</span>
        <span>${booking.status}</span>
      </div>

    </div>


    <div class="booking-contact-actions">

      <a
        href="mailto:${booking.email}?subject=Zimuch Travels Booking ${booking.reference}"
        class="email-button"
      >
        Email Customer
      </a>

      <a
        href="https://wa.me/${whatsappNumber}"
        target="_blank"
        rel="noopener noreferrer"
        class="whatsapp-button"
      >
        WhatsApp Customer
      </a>

    </div>

  `;

  bookingModal.classList.add("active");
}

closeBookingModal.addEventListener("click", () => {
  bookingModal.classList.remove("active");
});

bookingModal.addEventListener("click", (event) => {
  if (event.target === bookingModal) {
    bookingModal.classList.remove("active");
  }
});

/* ================================
   INVOICE GENERATOR
================================ */

function updatePaymentStatusDisplay() {
  const status = invoicePaymentStatus.value;

  invoicePaymentBadge.className = `invoice-payment-badge ${status}`;

  if (status === "paid") {
    invoicePaymentBadge.textContent = "PAID";
  } else if (status === "partially_paid") {
    invoicePaymentBadge.textContent = "PARTIALLY PAID";
  } else {
    invoicePaymentBadge.textContent = "UNPAID";
  }
}
invoicePaymentStatus.addEventListener("change", updatePaymentStatusDisplay);

function attachInvoiceListeners() {
  const buttons = document.querySelectorAll(".generate-invoice");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const bookingId = button.dataset.id;

      const booking = allBookings.find((item) => item.id == bookingId);

      if (!booking) {
        alert("Booking could not be found.");
        return;
      }

      openInvoice(booking);
    });
  });
}

/* ================================
   OPEN INVOICE
================================ */

function openInvoice(booking) {
  selectedBooking = booking;

  const cabinName =
    booking.cabin === "first"
      ? "First Class"
      : booking.cabin === "premium"
        ? "Premium Economy"
        : booking.cabin === "business"
          ? "Business"
          : booking.cabin === "economy"
            ? "Economy"
            : booking.cabin;

  // Generate invoice number if one doesn't exist
  const generatedInvoiceNumber =
    booking.invoice_number || `INV-${booking.reference}`;

  invoiceNumber.textContent = generatedInvoiceNumber;

  invoiceCustomer.textContent = booking.name || "N/A";

  invoiceEmail.textContent = booking.email || "N/A";

  invoicePhone.textContent = booking.phone || "N/A";

  invoiceReference.textContent = booking.reference || "N/A";

  invoiceDate.textContent = new Date().toLocaleDateString("en-GB");

  invoiceRoute.textContent = `${booking.from_city} → ${booking.to_city}`;

  invoiceDeparture.textContent = booking.departure_date || "N/A";

  invoiceReturn.textContent = booking.return_date || "One Way";

  invoicePassengers.textContent = booking.passengers || "1";

  invoiceCabin.textContent = cabinName || "N/A";

  // Load existing prices from Supabase
  invoiceFlightPrice.value = Number(booking.flight_price || 0);

  invoiceServiceFee.value = Number(booking.service_fee || 0);

  invoiceDiscount.value = Number(booking.discount || 0);

  invoiceAmountPaid.value = Number(booking.amount_paid || 0);

  invoicePaymentStatus.value = booking.payment_status || "unpaid";

  updatePaymentStatusDisplay();

  calculateInvoiceTotal();

  invoiceModal.classList.add("active");
}

function calculateInvoiceTotal() {
  const flightPrice = Number(invoiceFlightPrice.value) || 0;

  const serviceFee = Number(invoiceServiceFee.value) || 0;

  const discount = Number(invoiceDiscount.value) || 0;

  const amountPaid = Number(invoiceAmountPaid.value) || 0;

  const total = Math.max(flightPrice + serviceFee - discount, 0);

  const amountDue = Math.max(total - amountPaid, 0);

  const invoicePaidSummary = document.getElementById("invoicePaidSummary");

  const invoiceDueSummary = document.getElementById("invoiceDueSummary");

  invoiceTotal.textContent = `₦${total.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  invoiceAmountDue.textContent = `₦${amountDue.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  invoicePaidSummary.textContent = `₦${amountPaid.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  invoiceDueSummary.textContent = `₦${amountDue.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  /*
    Automatically determine payment status
  */

  if (amountPaid <= 0) {
    invoicePaymentStatus.value = "unpaid";
  } else if (amountPaid >= total && total > 0) {
    invoicePaymentStatus.value = "paid";
  } else {
    invoicePaymentStatus.value = "partially_paid";
  }

  updatePaymentStatusDisplay();
}

invoiceFlightPrice.addEventListener("input", calculateInvoiceTotal);

invoiceServiceFee.addEventListener("input", calculateInvoiceTotal);

invoiceDiscount.addEventListener("input", calculateInvoiceTotal);

invoiceAmountPaid.addEventListener("input", calculateInvoiceTotal);

closeInvoiceModal.addEventListener("click", () => {
  invoiceModal.classList.remove("active");
});

invoiceModal.addEventListener("click", (event) => {
  if (event.target === invoiceModal) {
    invoiceModal.classList.remove("active");
  }
});

/* ================================
   SAVE INVOICE TO SUPABASE
================================ */

saveInvoice.addEventListener("click", async () => {
  if (!selectedBooking) {
    alert("No booking selected.");
    return;
  }

  const flightPrice = Number(invoiceFlightPrice.value) || 0;

  const serviceFee = Number(invoiceServiceFee.value) || 0;

  const discount = Number(invoiceDiscount.value) || 0;

  const amountPaid = Number(invoiceAmountPaid.value) || 0;

  const total = Math.max(flightPrice + serviceFee - discount, 0);

  const amountDue = Math.max(total - amountPaid, 0);

  const invoiceNum =
    selectedBooking.invoice_number || `INV-${selectedBooking.reference}`;

  saveInvoice.disabled = true;
  saveInvoice.textContent = "Saving...";

  const { data, error } = await supabase
    .from("bookings")
    .update({
      flight_price: flightPrice,
      service_fee: serviceFee,
      discount: discount,
      amount_paid: amountPaid,
      amount_due: amountDue,
      invoice_number: invoiceNum,
      payment_status: invoicePaymentStatus.value,
    })
    .eq("id", selectedBooking.id)
    .select()
    .single();

  if (error) {
    console.error("Invoice save error:", error);

    alert("Could not save invoice. Please try again.");

    saveInvoice.disabled = false;
    saveInvoice.textContent = "Save Invoice";

    return;
  }

  // Update local booking
  const index = allBookings.findIndex(
    (booking) => booking.id === selectedBooking.id,
  );

  if (index !== -1) {
    allBookings[index] = data;
  }

  selectedBooking = data;

  invoiceNumber.textContent = data.invoice_number;

  saveInvoice.disabled = false;
  saveInvoice.textContent = "Saved ✓";

  setTimeout(() => {
    saveInvoice.textContent = "Save Invoice";
  }, 2000);
});

/* ================================
   PRINT / PDF
================================ */

printInvoice.addEventListener("click", () => {
  if (!selectedBooking) {
    alert("No booking selected.");
    return;
  }

  window.print();
});

loadBookings();
