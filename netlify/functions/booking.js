const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
);

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

    // Generate Zimuch booking reference
    const reference = "ZM-" + Math.floor(100000 + Math.random() * 900000);

    // Save booking to Supabase
    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          reference: reference,

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

    // Successful booking
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Booking request received successfully.",
        reference: reference,
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
