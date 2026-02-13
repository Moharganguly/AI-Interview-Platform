async function loadAnalytics() {
  const token = localStorage.getItem("token");
  const API_BASE = "https://ai-interview-platform-c8f2.onrender.com";


  const res = await fetch(
  `${API_BASE}/api/analytics/overview`,
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);


  const data = await res.json();
  document.getElementById("output").innerText =
    JSON.stringify(data, null, 2);
}

loadAnalytics();
