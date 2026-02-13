const API = "https://ai-interview-backend.onrender.com/api";


// Fetch admin statistics
async function fetchAdminStats() {
  try {
    console.log("Fetching admin data...");

    // Fetch all users
    const usersRes = await fetch(`${API}/admin/users`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!usersRes.ok) {
      throw new Error(`Users fetch failed: ${usersRes.status}`);
    }

    const users = await usersRes.json();
    console.log("Users fetched:", users);

    // Fetch all interviews
    const interviewsRes = await fetch(`${API}/admin/interviews`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!interviewsRes.ok) {
      throw new Error(`Interviews fetch failed: ${interviewsRes.status}`);
    }

    const interviews = await interviewsRes.json();
    console.log("Interviews fetched:", interviews);

    // Update stats cards
    document.getElementById('totalUsers').textContent = users.length || 0;
    document.getElementById('totalInterviews').textContent = interviews.length || 0;
    
    // Calculate completed interviews
    const completed = interviews.filter(i => i.status === 'completed').length;
    document.getElementById('completedInterviews').textContent = completed;
    
    // Calculate average score (only from completed interviews with scores)
    const scoredInterviews = interviews.filter(i => i.overallScore !== null && i.overallScore !== undefined);
    const avgScore = scoredInterviews.length > 0 
      ? (scoredInterviews.reduce((sum, i) => sum + i.overallScore, 0) / scoredInterviews.length).toFixed(1)
      : 0;
    document.getElementById('avgScore').textContent = avgScore;

    // Populate users table (show most recent 10)
    populateUsersTable(users.slice(0, 10));
    
    // Populate interviews table (show most recent 10)
    populateInterviewsTable(interviews.slice(0, 10));

  } catch (error) {
    console.error('Error fetching admin data:', error);
    
    // Show error in tables
    document.getElementById('usersTableBody').innerHTML = `
      <tr><td colspan="5" style="color: #f44336; text-align: center; padding: 20px;">
        ❌ Error loading data: ${error.message}
      </td></tr>
    `;
    document.getElementById('interviewsTableBody').innerHTML = `
      <tr><td colspan="6" style="color: #f44336; text-align: center; padding: 20px;">
        ❌ Error loading data: ${error.message}
      </td></tr>
    `;
  }
}

function populateUsersTable(users) {
  const tbody = document.getElementById('usersTableBody');
  
  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="loading">No users found</td></tr>';
    return;
  }

  tbody.innerHTML = users.map(user => `
    <tr>
      <td>${user.name || 'N/A'}</td>
      <td>${user.email || 'N/A'}</td>
      <td><span class="role-badge">${user.role || 'candidate'}</span></td>
      <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
      <td>
        <button class="btn-view" onclick="viewUser('${user._id}')">View</button>
        <button class="btn-delete" onclick="deleteUser('${user._id}', '${user.name}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function populateInterviewsTable(interviews) {
  const tbody = document.getElementById('interviewsTableBody');

  if (interviews.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="loading">No interviews found</td></tr>';
    return;
  }

  tbody.innerHTML = interviews.map(interview => {
    const candidateName =
      interview.user?.name ||
      interview.user?.email ||
      'Unknown';

    const status = interview.status || 'pending';
    const statusClass = `status-${status.replace('-', '')}`;

    return `
      <tr>
        <td>${candidateName}</td>
        <td>${interview.jobRole || interview.role || 'N/A'}</td>
        <td>${interview.difficulty || interview.level || 'N/A'}</td>
        <td><strong>${interview.overallScore ?? 'N/A'}</strong></td>
        <td><span class="status-badge ${statusClass}">${status}</span></td>
        <td>${interview.createdAt ? new Date(interview.createdAt).toLocaleDateString() : 'N/A'}</td>
      </tr>
    `;
  }).join('');
}


function viewUser(userId) {
  // For now, just show an alert. Later you can create a detailed user page
  alert(`View user details: ${userId}\n\nThis feature will show detailed user information and their interview history.`);
  // TODO: Create user-details.html page
  // window.location.href = `user-details.html?id=${userId}`;
}

async function deleteUser(userId, userName) {
  if (!confirm(`⚠️ Are you sure you want to delete user "${userName}"?\n\nThis action cannot be undone and will delete all their interview data.`)) {
    return;
  }
  
  try {
    const res = await fetch(`${API}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (res.ok) {
      alert('✅ User deleted successfully');
      fetchAdminStats(); // Refresh the data
    } else {
      const error = await res.json();
      alert(`❌ Failed to delete user: ${error.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    alert(`❌ Error deleting user: ${error.message}`);
  }
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log("Admin dashboard loaded, fetching data...");
  fetchAdminStats();
});