const BASE_URL = "https://edusphere-api-func-f7c4fbgxgncweafs.centralindia-01.azurewebsites.net";

async function register() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!name || !email || !password) {
    showMessage("Please fill in all fields", "error");
    return;
  }

  showMessage("Registering...", "info");

  try {
    const res = await fetch(`${BASE_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (res.ok) { showMessage(data.message, "success"); }
    else { showMessage(data.message, "error"); }
  } catch (err) {
    showMessage("Cannot reach server. Please try again.", "error");
  }
}

async function login() {
  const name = document.getElementById("name").value;
  const password = document.getElementById("password").value;

  if (!name || !password) {
    showMessage("Please fill in all fields", "error");
    return;
  }

  showMessage("Logging in...", "info");

  try {
    const res = await fetch(`${BASE_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password })
    });
    const data = await res.json();
    if (res.ok) { window.location.href = "index.html"; }
    else { showMessage(data.message, "error"); }
  } catch (err) {
    showMessage("Cannot reach server. Please try again.", "error");
  }
}

function showMessage(msg, type) {
  const el = document.getElementById("message");
  el.innerText = msg;
  el.className = type;
}