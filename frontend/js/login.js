

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", login);
  }
});

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please enter both email and password");
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }

    // Save token
    localStorage.setItem("token", data.token);

    // Optional: save user info
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    // Redirect
    window.location.href = "dashboard.html";

  } catch (error) {
    console.error("Login error:", error);
    alert("Server not responding. Please try again later.");
  }
}