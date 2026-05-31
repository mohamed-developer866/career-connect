const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getEmployerStats(employerId) {
  try {
    // Get all jobs posted by this employer
    const jobs = await prisma.job.findMany({
      where: { postedBy: employerId },
      include: {
        applications: true
      }
    });

    const totalJobs = jobs.length;
    const totalApplicants = jobs.reduce((sum, job) => sum + (job.applications?.length || 0), 0);
    const shortlisted = jobs.reduce((sum, job) => sum + (job.applications?.filter(a => a.status === 'Shortlisted').length || 0), 0);
    const hired = jobs.reduce((sum, job) => sum + (job.applications?.filter(a => a.status === 'HIRED').length || 0), 0);
    
    // Calculate average match score
    let totalMatchScore = 0;
    let matchCount = 0;
    jobs.forEach(job => {
      job.applications?.forEach(app => {
        if (app.matchScore) {
          totalMatchScore += app.matchScore;
          matchCount++;
        }
      });
    });
    const avgMatchScore = matchCount > 0 ? Math.round(totalMatchScore / matchCount) : 0;

    return {
      totalJobs,
      totalApplicants,
      shortlisted,
      hired,
      viewCount: Math.floor(Math.random() * 500) + 100, // Placeholder for views
      avgMatchScore
    };
  } catch (error) {
    console.error('Error in getEmployerStats:', error);
    return {
      totalJobs: 0,
      totalApplicants: 0,
      shortlisted: 0,
      hired: 0,
      viewCount: 0,
      avgMatchScore: 0
    };
  }
}

async function getApplicationTrend(employerId, range = 'week') {
  try {
    const jobs = await prisma.job.findMany({
      where: { postedBy: employerId },
      select: { id: true }
    });
    
    const jobIds = jobs.map(j => j.id);
    
    // Get applications for these jobs
    const applications = await prisma.jobApplication.findMany({
      where: { jobId: { in: jobIds } },
      orderBy: { appliedAt: 'asc' }
    });
    
    // Group by date
    const today = new Date();
    const daysMap = new Map();
    
    let days = range === 'week' ? 7 : range === 'month' ? 30 : 365;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      daysMap.set(dateStr, 0);
    }
    
    applications.forEach(app => {
      const dateStr = app.appliedAt.toISOString().split('T')[0];
      if (daysMap.has(dateStr)) {
        daysMap.set(dateStr, daysMap.get(dateStr) + 1);
      }
    });
    
    const labels = [];
    const values = [];
    
    daysMap.forEach((value, key) => {
      if (range === 'week') {
        const date = new Date(key);
        labels.push(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]);
      } else if (range === 'month') {
        const date = new Date(key);
        labels.push(`W${Math.ceil(date.getDate() / 7)}`);
      } else {
        const date = new Date(key);
        labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
      }
      values.push(value);
    });
    
    return { labels, values };
  } catch (error) {
    console.error('Error in getApplicationTrend:', error);
    return { labels: [], values: [] };
  }
}

async function getApplicationStatus(employerId) {
  try {
    const jobs = await prisma.job.findMany({
      where: { postedBy: employerId },
      select: { id: true }
    });
    
    const jobIds = jobs.map(j => j.id);
    
    const statuses = await prisma.jobApplication.groupBy({
      by: ['status'],
      where: { jobId: { in: jobIds } },
      _count: true
    });
    
    const statusMap = {
      'Applied': 0,
      'Shortlisted': 0,
      'Interview': 0,
      'HIRED': 0,
      'Rejected': 0
    };
    
    statuses.forEach(s => {
      if (statusMap[s.status] !== undefined) {
        statusMap[s.status] = s._count;
      }
    });
    
    return {
      labels: ['Applied', 'Shortlisted', 'Interview', 'Hired', 'Rejected'],
      values: [statusMap.Applied, statusMap.Shortlisted, statusMap.Interview, statusMap.HIRED, statusMap.Rejected]
    };
  } catch (error) {
    console.error('Error in getApplicationStatus:', error);
    return {
      labels: ['Applied', 'Shortlisted', 'Interview', 'Hired', 'Rejected'],
      values: [0, 0, 0, 0, 0]
    };
  }
}

async function getJobPerformance(employerId) {
  try {
    const jobs = await prisma.job.findMany({
      where: { postedBy: employerId },
      include: {
        applications: true
      }
    });
    
    return jobs.map(job => {
      const applicants = job.applications?.length || 0;
      const shortlisted = job.applications?.filter(a => a.status === 'Shortlisted').length || 0;
      const hired = job.applications?.filter(a => a.status === 'HIRED').length || 0;
      
      let totalMatchScore = 0;
      job.applications?.forEach(app => {
        totalMatchScore += app.matchScore || 0;
      });
      const avgMatchScore = applicants > 0 ? Math.round(totalMatchScore / applicants) : 0;
      
      return {
        title: job.title,
        applicants,
        shortlisted,
        hired,
        matchScore: avgMatchScore
      };
    });
  } catch (error) {
    console.error('Error in getJobPerformance:', error);
    return [];
  }
}

async function getRecentActivity(employerId) {
  try {
    const jobs = await prisma.job.findMany({
      where: { postedBy: employerId },
      select: { id: true, title: true }
    });
    
    const jobIds = jobs.map(j => j.id);
    const jobMap = new Map(jobs.map(j => [j.id, j.title]));
    
    const recentApplications = await prisma.jobApplication.findMany({
      where: { jobId: { in: jobIds } },
      orderBy: { appliedAt: 'desc' },
      take: 10,
      include: { student: true }
    });
    
    const activities = [];
    
    recentApplications.forEach(app => {
      const timeAgo = getTimeAgo(app.appliedAt);
      activities.push({
        action: 'New application received',
        job: jobMap.get(app.jobId) || 'Job',
        candidate: app.student?.fullName,
        time: timeAgo,
        type: 'application'
      });
    });
    
    // Add some sample activities for demo
    if (activities.length === 0) {
      return [
        { action: "No applications yet", job: "", time: "Just now", type: "info" }
      ];
    }
    
    return activities.slice(0, 5);
  } catch (error) {
    console.error('Error in getRecentActivity:', error);
    return [];
  }
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return `${Math.floor(seconds / 604800)} weeks ago`;
}

module.exports = {
  getEmployerStats,
  getApplicationTrend,
  getApplicationStatus,
  getJobPerformance,
  getRecentActivity
};