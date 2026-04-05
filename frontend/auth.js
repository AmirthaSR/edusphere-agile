// REGISTER
async function register() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const res = await fetch("https://edusphere-api-func.azurewebsites.net/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();
  document.getElementById("message").innerText = data.message;
}

// LOGIN
async function login() {
  const name = document.getElementById("name").value;
  const password = document.getElementById("password").value;
  const res = await fetch("https://edusphere-api-func.azurewebsites.net/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, password })
  });
  const data = await res.json();
  if (res.ok) {
    localStorage.setItem("user", JSON.stringify({ name }));
    window.location.href = "index.html";
  } else {
    document.getElementById("message").innerText = data.message;
  }
}

// LOGOUT
function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}