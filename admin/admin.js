import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://iwcmxyoejaezmwkdjhby.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_WwsBkdDls4e9PPuVLLV1YQ_z4Gaq5VG";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");
const loginError = document.getElementById("loginError");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  loginError.textContent = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  loginButton.disabled = true;
  loginButton.textContent = "Signing in...";

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login error:", error);

    loginError.textContent = "Invalid email or password. Please try again.";

    loginButton.disabled = false;
    loginButton.textContent = "Sign In";

    return;
  }

  console.log("Admin logged in:", data.user);

  // Temporary destination until we build the dashboard
  window.location.href = "dashboard.html";
});
