const API_URL = "http://localhost:5000/api";

export async function signup(data: {
  fullName: string;
  email: string;
  password: string;
  role: string;
  college?: string;
  company?: string;
}) {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Signup failed");
  }
  return res.json();
}

export async function login(data: { email: string; password: string }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Login failed");
  }
  return res.json();
}

export async function fetchJobs(params?: Record<string, string>) {
  const query = new URLSearchParams(params).toString();
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/jobs/approved?${query}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch jobs");
  return res.json();
}

export async function fetchJob(id: string) {
  const res = await fetch(`${API_URL}/jobs/${id}`);
  if (!res.ok) throw new Error("Job not found");
  return res.json();
}

export async function askAI(message: string) {
  const res = await fetch(`${API_URL}/chatbot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error("AI request failed");
  return res.json();
}
export async function fetchStudentStats() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/users/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}
export async function fetchAssessment(id: string) {
  const res = await fetch(`${API_URL}/assessments/${id}`);
  if (!res.ok) throw new Error("Assessment not found");
  return res.json();
}

export async function fetchAssessments() {
  const res = await fetch(`${API_URL}/assessments`);
  if (!res.ok) throw new Error("Failed to fetch assessments");
  return res.json();
}
export async function fetchDashboard() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/users/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard");
  return res.json();
}

export async function fetchZaraTip() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/chatbot/zara/tip`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch tip");
  return res.json();
}
export async function generateTestQuestions(topic: string, difficulty: string, count: number) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/assessments/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ topic, difficulty, count }),
  });
  if (!res.ok) throw new Error("Failed to generate questions");
  return res.json();
}
export async function applyForJob(data: any) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/applications/apply`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json", 
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Apply failed");
  return res.json();
}

export async function generateZaraTasks(data: any) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/zara/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to generate tasks");
  return res.json();
}

export async function askZaraCode(message: string, code: { html: string; css: string; js: string }) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/chatbot/zara-code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message, code }),
  });
  if (!res.ok) throw new Error("Zara code request failed");
  return res.json();
}