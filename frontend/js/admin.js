const API = API_BASE_URL;

// Fetch admin statistics
async function fetchAdminStats() {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("No token found");
    window.location.href = "login.html";
    return;
  }

  try {
    console.log("Fetching admin data...");

    const usersRes = await fetch(`${API}/api/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!usersRes.ok) {
      throw new Error(`Users fetch failed: ${usersRes.status}`);
    }

    const users = await usersRes.json();

    const interviewsRes = await fetch(`${API}/api/admin/interviews`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!interviewsRes.ok) {
      throw new Error(`Interviews fetch failed: ${interviewsRes.status}`);
    }

    const interviews = await interviewsRes.json();

    updateStats(users, interviews);
    populateUsersTable(users.slice(0, 10));
    populateInterviewsTable(interviews.slice(0, 10));

  } catch (error) {
    console.error("Error fetching admin data:", error);
    showError(error.message);
  }
}

function updateStats(users, interviews) {
  document.getElementById("totalUsers").textContent = users.length;
  document.getElementById("totalInterviews").textContent = interviews.length;

  const completed = interviews.filter(i => i.status === "completed").length;
  document.getElementById("completedInterviews").textContent = completed;

  const scored = interviews.filter(i => i.overallScore != null);

  const avgScore = scored.length
    ? (scored.reduce((sum, i) => sum + i.overallScore, 0) / scored.length).toFixed(1)
    : 0;

  document.getElementById("avgScore").textContent = avgScore;
}

function showError(message) {
  document.getElementById("usersTableBody").innerHTML =
    `<tr><td colspan="5" style="color:red;text-align:center;">❌ ${message}</td></tr>`;

  document.getElementById("interviewsTableBody").innerHTML =
    `<tr><td colspan="6" style="color:red;text-align:center;">❌ ${message}</td></tr>`;
}
