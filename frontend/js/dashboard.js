async function loadAnalytics() {
  const token = localStorage.getItem("token");

  const res = await fetch(
    "http://localhost:5000/api/analytics/overview",
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
