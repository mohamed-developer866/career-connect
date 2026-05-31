import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("auth", "routes/auth/route.tsx"),

  // STUDENT ROUTES
  layout("layouts/StudentLayout.tsx", [
    route("student", "routes/student/route.tsx"),
    route("student/analytics", "routes/student/analytics/route.tsx"),
    route("student/jobs", "routes/student/jobs/route.tsx"),
    route("student/chat", "routes/student/chat/route.tsx"),
    route("student/courses", "routes/student/courses/route.tsx"),
    route("student/courses/learn/:courseId", "routes/student/courses/learn/route.tsx"),
    route("student/practice", "routes/student/practice/route.tsx"),
    route("student/practice/intro-js", "routes/student/practice/intro-js/route.tsx"),
    route("student/practice/intro-js/color-picker", "routes/student/practice/intro-js/color-picker/route.tsx"),
    route("student/assessments", "routes/student/assessments/route.tsx"),
    route("student/assessments/generate", "routes/student/assessments/generate/route.tsx"),
    route("student/assessments/take", "routes/student/assessments/take/route.tsx"),
    route("student/assessments/result", "routes/student/assessments/result/route.tsx"),
    route("student/wallet", "routes/student/wallet/route.tsx"),
    route("student/applications", "routes/student/applications/route.tsx"),
    route("student/message", "routes/student/message/route.tsx"),
  ]),

  // EMPLOYER ROUTES
  layout("layouts/EmployerLayout.tsx", [
    route("employer", "routes/employer/route.tsx"),
    route("employer/jobs", "routes/employer/jobs/route.tsx"),
    route("employer/messages/*", "routes/employer/messages/route.tsx"),
    route("employer/jobs/new", "routes/employer/jobs/new/route.tsx"),
    route("employer/applicants", "routes/employer/applicants/route.tsx"),  // ✅ ADD THIS
    route("employer/rankings", "routes/employer/rankings/route.tsx"),
    route("employer/analytics", "routes/employer/analytics/route.tsx"),
    route("employer/employerapplications", "routes/employer/employerapplications/employerapplications.tsx"),
  ]),

  // COLLEGE TPO ROUTES
  layout("layouts/CollegeLayout.tsx", [
    route("college", "routes/college/route.tsx"),
    route("college/messages/*", "routes/college/messages/route.tsx"),
    route("college/companies", "routes/college/companies/route.tsx"),
    route("college/broadcast", "routes/college/broadcast/route.tsx"),
    route("college/students", "routes/college/students/route.tsx"),
    route("college/reports", "routes/college/reports/route.tsx"),
  ]),

  // ADMIN
  route("admin", "routes/admin/route.tsx"),
] satisfies RouteConfig;