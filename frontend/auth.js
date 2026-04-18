const BASE_URL = "https://edusphere-api-func-f7c4fbgxgncweafs.centralindia-01.azurewebsites.net";

async function register() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  if (!name || !email || !password) { showMessage("Please fill in all fields", "error"); return; }
  showMessage("Registering...", "info");
  try {
    const res = await fetch(`${BASE_URL}/api/registerUser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (res.ok) { showMessage(data.message, "success"); }
    else { showMessage(data.message, "error"); }
  } catch (err) { showMessage("Cannot reach server. Please try again.", "error"); }
}

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  if (!email || !password) { showMessage("Please fill in all fields", "error"); return; }
  showMessage("Logging in...", "info");
  try {
    const res = await fetch(`${BASE_URL}/api/loginUser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      const user = {
        name: data.name || "",
        email: data.email || email,
        role: data.role || "student"
      };
      localStorage.setItem("user", JSON.stringify(user));
      sessionStorage.setItem("user", JSON.stringify(user));
      window.location.href = "dashboard.html";
    } else {
      showMessage(data.message, "error");
    }
  } catch (err) { showMessage("Cannot reach server. Please try again.", "error"); }
}

function logout() {
  localStorage.removeItem("user");
  sessionStorage.removeItem("user");
  window.location.href = "login.html";
}

function showMessage(msg, type) {
  const el = document.getElementById("message");
  el.innerText = msg;
  el.className = type;
}