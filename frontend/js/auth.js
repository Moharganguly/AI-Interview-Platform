const API_BASE_URL = "https://ai-interview-backend.onrender.com/api";

const token = localStorage.getItem("token");

if (!token) {
  alert("Unauthorized! Please login.");
  document.body.innerHTML = "<h1>Please login first</h1><a href='index.html'>Go to Login</a>";
}