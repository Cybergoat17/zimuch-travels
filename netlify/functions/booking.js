const { createClient } = require("@supabase/supabase-js");
const { Resend } = require("resend");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
);

const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event) => {
  try {
    // Only allow POST requests
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({
          success: false,
          message: "Method not allowed",
        }),
      };
    }

    // Read booking data
    const bookingData = JSON.parse(event.body);

    // Generate booking reference
    const reference = "ZM-" + Math.floor(100000 + Math.random() * 900000);

    // Save booking to Supabase
    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          reference,

          name: bookingData.name,
          email: bookingData.email,
          phone: bookingData.phone,

          trip_type: bookingData.tripType,

          from_city: bookingData.from,
          to_city: bookingData.to,

          departure_date: bookingData.departureDate,

          return_date:
            bookingData.tripType === "return" ? bookingData.returnDate : null,

          passengers: Number(bookingData.passengers),

          cabin: bookingData.cabin,

          status: "pending",
        },
      ])
      .select()
      .single();

    // Database error
    if (error) {
      console.error("Supabase error:", error);

      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          message: "Could not save booking.",
        }),
      };
    }

    /*
    ========================================
    SEND ADMIN NOTIFICATION
    ========================================
    */

    const cabinName =
      bookingData.cabin === "first"
        ? "First Class"
        : bookingData.cabin === "premium"
          ? "Premium Economy"
          : bookingData.cabin === "business"
            ? "Business"
            : bookingData.cabin === "economy"
              ? "Economy"
              : bookingData.cabin;

    try {
      await resend.emails.send({
        // For initial testing, Resend provides
        // onboarding@resend.dev.
        from: "Zimuch Travels <onboarding@resend.dev>",

        // CHANGE THIS to the email that should
        // receive new booking notifications.
        to: [process.env.ADMIN_EMAIL],

        subject: `New Flight Request — ${reference}`,

        html: `

          <div style="
            font-family: Arial, sans-serif;
            max-width: 650px;
            margin: auto;
            color: #26364d;
          ">

            <div style="
              background: #0b3478;
              color: white;
              padding: 25px;
              border-radius: 10px 10px 0 0;
            ">

              <h1 style="
                margin: 0;
                font-size: 24px;
              ">
                ZIMUCH TRAVELS
              </h1>

              <p style="
                margin: 8px 0 0;
                opacity: .9;
              ">
                New Flight Booking Request
              </p>

            </div>


            <div style="
              border: 1px solid #e5eaf1;
              border-top: none;
              padding: 25px;
              border-radius: 0 0 10px 10px;
            ">

              <h2 style="
                color: #0b3478;
              ">
                ${reference}
              </h2>


              <h3>
                Passenger Details
              </h3>

              <p>
                <strong>Name:</strong>
                ${bookingData.name}
              </p>

              <p>
                <strong>Email:</strong>
                ${bookingData.email}
              </p>

              <p>
                <strong>Phone:</strong>
                ${bookingData.phone}
              </p>


              <h3>
                Flight Details
              </h3>

              <p>
                <strong>Route:</strong>
                ${bookingData.from}
                →
                ${bookingData.to}
              </p>

              <p>
                <strong>Trip:</strong>
                ${bookingData.tripType}
              </p>

              <p>
                <strong>Departure:</strong>
                ${bookingData.departureDate}
              </p>

              <p>
                <strong>Return:</strong>
                ${
                  bookingData.tripType === "return"
                    ? bookingData.returnDate
                    : "One Way"
                }
              </p>

              <p>
                <strong>Passengers:</strong>
                ${bookingData.passengers}
              </p>

              <p>
                <strong>Cabin:</strong>
                ${cabinName}
              </p>


              <div style="
                margin-top: 25px;
                padding: 15px;
                background: #f5f8fc;
                border-radius: 8px;
              ">

                <strong>
                  Status:
                </strong>

                <span style="
                  color: #a66a00;
                  font-weight: bold;
                ">
                  PENDING
                </span>

              </div>

            </div>

          </div>

        `,
      });

      console.log("Admin notification email sent.");
    } catch (emailError) {
      /*
      Email failure should NOT make the
      customer's booking fail.

      The booking was already saved.
      */

      console.error("Notification email error:", emailError);
    }

    // Successful booking
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,

        message: "Booking request received successfully.",

        reference,

        booking: data,
      }),
    };
  } catch (error) {
    console.error("Booking error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,

        message: "Something went wrong while processing the booking.",
      }),
    };
  }
};
