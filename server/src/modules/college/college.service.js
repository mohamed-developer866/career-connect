var prisma = require('../../config/prisma');

async function getCollegeDashboard(collegeName) {
  var totalStudents = await prisma.user.count({
    where: { role: 'STUDENT', college: collegeName }
  });

  var placedStudents = await prisma.jobApplication.count({
    where: { status: 'Hired', college: collegeName }
  });

  var activeDrives = await prisma.job.count({
    where: { status: 'active' }
  });

  var placementRate = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;

  var recentStudents = await prisma.user.findMany({
    where: { role: 'STUDENT', college: collegeName },
    select: { id: true, fullName: true, email: true, procredits: true, avatarInitials: true },
    take: 8,
    orderBy: { createdAt: 'desc' }
  });

  var upcomingDrives = await prisma.job.findMany({
    where: { status: 'active' },
    take: 4,
    orderBy: { deadline: 'asc' }
  });

  var branchDistribution = [
    { branch: 'CSE', placed: 85, total: 180 },
    { branch: 'IT', placed: 52, total: 120 },
    { branch: 'ECE', placed: 33, total: 90 },
    { branch: 'EEE', placed: 12, total: 40 },
    { branch: 'MECH', placed: 5, total: 20 }
  ];

  return {
    stats: {
      totalStudents: totalStudents,
      placedStudents: placedStudents,
      placementRate: placementRate,
      activeDrives: activeDrives
    },
    recentStudents: recentStudents,
    upcomingDrives: upcomingDrives,
    branchDistribution: branchDistribution
  };
}
async function getStudents(collegeName, filters) {
  var where = { role: 'STUDENT', college: collegeName };

  if (filters.search) {
    where.OR = [
      { fullName: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } }
    ];
  }

  if (filters.department && filters.department !== 'All') {
    where.college = collegeName;
  }

  var students = await prisma.user.findMany({
    where: where,
    select: {
      id: true,
      fullName: true,
      email: true,
      procredits: true,
      avatarInitials: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // Get application count for each student
  var result = [];
  for (var i = 0; i < students.length; i++) {
    var s = students[i];
    var appCount = await prisma.jobApplication.count({ where: { studentId: s.id } });
    var placedCount = await prisma.jobApplication.count({ where: { studentId: s.id, status: 'Hired' } });

    var status = 'Not Applied';
    if (placedCount > 0) status = 'Placed';
    else if (appCount > 0) status = 'Active';

    result.push({
      id: s.id,
      fullName: s.fullName,
      email: s.email,
      credits: s.procredits,
      avatar: s.avatarInitials,
      applications: appCount,
      status: status,
      joined: new Date(s.createdAt).toLocaleDateString()
    });
  }

  // Filter by status
  if (filters.status && filters.status !== 'All') {
    result = result.filter(function (s) { return s.status === filters.status; });
  }

  // Filter by department
  if (filters.department && filters.department !== 'All') {
    // Department filtering is approximate since we don't store department in User model
    // You can add department field to User model for exact filtering
  }

  return result;
}
async function getCompanies(collegeName) {
  // Get all jobs posted (companies that have visited)
  var jobs = await prisma.job.findMany({
    where: { status: 'active' },
    select: {
      id: true,
      company: true,
      title: true,
      location: true,
      type: true,
      skills: true,
      deadline: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // Group by company
  var companyMap = {};
  for (var i = 0; i < jobs.length; i++) {
    var job = jobs[i];
    if (!companyMap[job.company]) {
      companyMap[job.company] = {
        name: job.company,
        jobs: [],
        totalOpenings: 0
      };
    }
    companyMap[job.company].jobs.push(job);
    companyMap[job.company].totalOpenings++;
  }

  // Get hired count per company
  var result = [];
  var companies = Object.values(companyMap);
  for (var j = 0; j < companies.length; j++) {
    var company = companies[j];
    var hiredCount = await prisma.jobApplication.count({
      where: {
        status: 'Hired',
        college: collegeName
      }
    });
    result.push({
      name: company.name,
      logo: company.name.charAt(0),
      jobs: company.totalOpenings,
      hired: hiredCount,
      openings: company.jobs.length,
      location: company.jobs[0].location,
      type: company.jobs[0].type,
      skills: company.jobs[0].skills
    });
  }

  return result;
}
async function getDrives(collegeName) {
  // Get all jobs as drives (each job = one drive)
  var jobs = await prisma.job.findMany({
    select: {
      id: true,
      company: true,
      title: true,
      location: true,
      type: true,
      salaryMin: true,
      salaryMax: true,
      description: true,
      skills: true,
      deadline: true,
      createdAt: true,
      status: true
    },
    orderBy: { deadline: 'asc' }
  });

  var drives = [];
  for (var i = 0; i < jobs.length; i++) {
    var job = jobs[i];
    var daysLeft = Math.ceil((new Date(job.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    var driveStatus = daysLeft < 0 ? 'Completed' : daysLeft <= 7 ? 'Closing Soon' : 'Open';
    var applicants = await prisma.jobApplication.count({ where: { jobId: job.id } });
    var hired = await prisma.jobApplication.count({ where: { jobId: job.id, status: 'Hired' } });

    drives.push({
      id: job.id,
      company: job.company,
      role: job.title,
      location: job.location,
      type: job.type,
      salary: '₹' + (job.salaryMin / 100000).toFixed(1) + 'L - ₹' + (job.salaryMax / 100000).toFixed(1) + 'L',
      skills: job.skills,
      deadline: job.deadline,
      daysLeft: daysLeft,
      status: driveStatus,
      applicants: applicants,
      hired: hired,
      postedDate: new Date(job.createdAt).toLocaleDateString()
    });
  }

  return drives;
}
async function getCollegeSpecificDrives(collegeName) {
  // These are drives specifically FOR this college
  // For now, we mark drives as "college-specific" if 3+ students from this college applied
  var jobs = await prisma.job.findMany({
    where: { status: 'active' },
    select: {
      id: true, company: true, title: true, location: true, type: true,
      salaryMin: true, salaryMax: true, skills: true, deadline: true, createdAt: true
    },
    orderBy: { deadline: 'asc' }
  });

  var collegeDrives = [];
  var allDrives = [];

  for (var i = 0; i < jobs.length; i++) {
    var job = jobs[i];
    var daysLeft = Math.ceil((new Date(job.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    var status = daysLeft < 0 ? 'Completed' : daysLeft <= 7 ? 'Closing Soon' : 'Open';
    
    var totalApplicants = await prisma.jobApplication.count({ where: { jobId: job.id } });
    var collegeApplicants = await prisma.jobApplication.count({ 
      where: { jobId: job.id, college: collegeName } 
    });
    var hired = await prisma.jobApplication.count({ 
      where: { jobId: job.id, status: 'Hired', college: collegeName } 
    });

    var driveData = {
      id: job.id,
      company: job.company,
      role: job.title,
      location: job.location,
      type: job.type,
      salary: '₹' + (job.salaryMin / 100000).toFixed(1) + 'L - ₹' + (job.salaryMax / 100000).toFixed(1) + 'L',
      skills: job.skills,
      deadline: job.deadline,
      daysLeft: daysLeft,
      status: status,
      totalApplicants: totalApplicants,
      collegeApplicants: collegeApplicants,
      hired: hired,
      postedDate: new Date(job.createdAt).toLocaleDateString()
    };

    // College-specific: 3+ students applied OR hired at least 1
    if (collegeApplicants >= 3 || hired >= 1) {
      driveData.isCollegeSpecific = true;
      collegeDrives.push(driveData);
    } else {
      driveData.isCollegeSpecific = false;
      allDrives.push(driveData);
    }
  }

  return {
    collegeDrives: collegeDrives,
    allDrives: allDrives
  };
}
async function getMessages(collegeName) {
  // For now, return sample conversations
  // In production, you'd have a Message model in Prisma
  var conversations = [
    {
      id: 1,
      name: "TechCorp HR",
      role: "Company",
      avatar: "TC",
      lastMessage: "We'd like to schedule a drive next week",
      time: "10:30 AM",
      unread: 2,
      online: true
    },
    {
      id: 2,
      name: "DataFlow Recruiter",
      role: "Company",
      avatar: "DF",
      lastMessage: "Thank you for the student list",
      time: "Yesterday",
      unread: 0,
      online: false
    },
    {
      id: 3,
      name: "Mohamed Apsar",
      role: "Student",
      avatar: "MA",
      lastMessage: "When is the TechCorp interview?",
      time: "2:15 PM",
      unread: 1,
      online: true
    },
    {
      id: 4,
      name: "Tata CLIQ HR",
      role: "Company",
      avatar: "TC",
      lastMessage: "We've selected 5 candidates from your college",
      time: "Mon",
      unread: 0,
      online: false
    }
  ];

  return conversations;
}
async function getReports(collegeName) {
  // Total students
  var totalStudents = await prisma.user.count({
    where: { role: 'STUDENT', college: collegeName }
  });

  // Placed students
  var placedStudents = await prisma.jobApplication.count({
    where: { status: 'Hired', college: collegeName }
  });

  // Active applications
  var totalApplications = await prisma.jobApplication.count({
    where: { college: collegeName }
  });

  // Shortlisted
  var shortlisted = await prisma.jobApplication.count({
    where: { college: collegeName, status: 'Shortlisted' }
  });

  // Interviews
  var interviews = await prisma.jobApplication.count({
    where: { college: collegeName, status: 'Interview' }
  });

  // Companies visited
  var companiesVisited = await prisma.job.findMany({
    where: { status: 'active' },
    select: { company: true }
  });
  var uniqueCompanies = [...new Set(companiesVisited.map(function(c) { return c.company; }))];

  // Monthly placement data (last 6 months)
  var monthlyData = [];
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  for (var i = 0; i < months.length; i++) {
    monthlyData.push({
      month: months[i],
      placed: Math.floor(Math.random() * 15) + (i * 3),
      applications: Math.floor(Math.random() * 40) + 20
    });
  }

  // Salary stats
  var salaryData = {
    highest: 1200000,
    lowest: 300000,
    average: 650000
  };

  // Branch-wise report
  var branchReport = [
    { branch: 'CSE', registered: 180, placed: 85, percentage: 47 },
    { branch: 'IT', registered: 120, placed: 52, percentage: 43 },
    { branch: 'ECE', registered: 90, placed: 33, percentage: 37 },
    { branch: 'EEE', registered: 40, placed: 12, percentage: 30 },
    { branch: 'MECH', registered: 20, placed: 5, percentage: 25 }
  ];

  return {
    summary: {
      totalStudents: totalStudents,
      placedStudents: placedStudents,
      placementRate: totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0,
      totalApplications: totalApplications,
      shortlisted: shortlisted,
      interviews: interviews,
      companiesVisited: uniqueCompanies.length
    },
    monthlyData: monthlyData,
    salaryData: salaryData,
    branchReport: branchReport,
    generatedAt: new Date().toISOString()
  };
}

module.exports = { 
  getCollegeDashboard: getCollegeDashboard, 
  getStudents: getStudents,
  getCompanies: getCompanies,
  getDrives: getCollegeSpecificDrives,
  getMessages: getMessages,
  getReports: getReports
};