import { useState, useEffect } from "react";

const testimonials = [
  { name: "Ananya K.", role: "Placed at Google", college: "AMSCE Chennai", feedback: "Career Connect's AI mentor helped me crack the coding round. I landed my dream job!", avatar: "AK" },
  { name: "Rahul P.", role: "Full-Stack Developer", college: "IIT Madras", feedback: "The smart assessments were exactly like real interviews. Best prep platform ever!", avatar: "RP" },
  { name: "Sneha M.", role: "Data Scientist", college: "NIT Trichy", feedback: "From resume tips to mock tests — the chatbot guided me at every step.", avatar: "SM" },
];

// Predefined colleges list
const predefinedColleges = [
  "Aalim Muhammed Salegh College of Engineering (AMSCE), Chennai",
  "Anna University, Chennai",
  "IIT Madras, Chennai",
  "NIT Trichy",
  "VIT Vellore",
  "BITS Pilani",
  "PSG College of Technology, Coimbatore",
  "SSN College of Engineering, Chennai",
  "SASTRA University, Thanjavur",
  "SRM University, Chennai",
  "Sathyabama University, Chennai",
  "Loyola College, Chennai",
  "Madras Christian College (MCC), Chennai",
  "St. Joseph's College of Engineering, Chennai",
  "Rajalakshmi Engineering College, Chennai",
  "Saveetha Engineering College, Chennai",
  "Vel Tech University, Chennai",
  "Hindustan University, Chennai",
  "B.S. Abdur Rahman University, Chennai",
  "MIT Chennai",
];

// Predefined companies list
const predefinedCompanies = [
  // ========== MULTINATIONAL CORPORATIONS (MNCs) ==========
  "Google", 
  "Microsoft", 
  "Amazon", 
  "Flipkart", 
  "Zomato", 
  "Swiggy",
  "TCS", 
  "Infosys", 
  "Wipro", 
  "HCL Technologies", 
  "Tech Mahindra",
  "Accenture", 
  "Deloitte", 
  "PwC", 
  "EY", 
  "KPMG",
  "Goldman Sachs", 
  "Morgan Stanley", 
  "JP Morgan Chase", 
  "PayPal",
  "Adobe", 
  "Salesforce", 
  "Oracle", 
  "IBM", 
  "Cisco", 
  "Intel",
  "Dell Technologies", 
  "HP", 
  "NVIDIA", 
  "AMD",
  
  // ========== STARTUP COMPANIES (Innovative) ==========
  "InnovateLabs AI",
  "CodeCraft Studios",
  "DataMind Analytics",
  "CloudNest Technologies",
  "FinTech Fusion",
  "HealthTech Innovators",
  "EduTech Solutions",
  "GreenEnergy Startups",
  "BlockChain Labs",
  "CyberSecure Systems",
  
  // ========== MID-SIZED COMPANIES ==========
  "TechSolutions India",
  "DigitalWave Creators",
  "NextGen Systems",
  "SmartBridge Consulting",
  "Velocity Tech",
  "PrimeSoft Solutions",
  "InnoGrid Technologies",
  "StratEdge Consulting",
  "Virtuoso Digital",
  "Apexa Systems",
  
  // ========== PRODUCT-BASED COMPANIES ==========
  "FreshWorks",
  "Zoho Corporation",
  "Chargebee",
  "Unacademy",
  "Byju's",
  "Ola Cabs",
  "Oyo Rooms",
  "Razorpay",
  "PhonePe",
  "Groww",
  
  // ========== SERVICE-BASED COMPANIES ==========
  "Cognizant",
  "Capgemini",
  "L&T Infotech",
  "Mphasis",
  "Mindtree",
  "Hexaware",
  "Persistent Systems",
  "UST Global",
  "Quest Global",
  "Virtusa",
  
  // ========== E-COMMERCE & RETAIL ==========
  "Meesho",
  "Nykaa",
  "Myntra",
  "Ajio",
  "ShopClues",
  "BigBasket",
  "Grofers",
  "Blinkit",
  "Zepto",
  "Dunzo",
  
  // ========== FINTECH COMPANIES ==========
  "Paytm",
  "BharatPe",
  "Cred",
  "Slice",
  "Jupiter Money",
  "FamPay",
  "INDmoney",
  "Upstox",
  "Zerodha",
  "CoinDCX"
];

const API = "http://localhost:5000/api/auth";

function AuthForm() {
  const [step, setStep] = useState<"login" | "signup" | "otp" | "password" | "forgot" | "reset">("login");
  const [selectedRole, setSelectedRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [form, setForm] = useState({ 
    fullName: "", 
    email: "", 
    password: "", 
    confirmPassword: "", 
    otp: "", 
    college: "", 
    company: "",
    companyDescription: "",
    companyWebsite: "",
    companyIndustry: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [otpPurpose, setOtpPurpose] = useState("signup");

  const roles = [
    { id: "STUDENT", label: "Student", icon: "🎓", description: "Find jobs, take assessments, track progress" },
    { id: "EMPLOYER", label: "Employer/HR", icon: "💼", description: "Post jobs, find talent, manage applications" },
    { id: "COLLEGE", label: "College/TPO", icon: "🏛️", description: "Manage students, approve jobs, track placements" },
  ];

  const filteredColleges = predefinedColleges.filter(college =>
    college.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCompanies = predefinedCompanies.filter(company =>
    company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const interval = setInterval(() => { 
      setIsTransitioning(true); 
      setTimeout(() => { 
        setCurrentTestimonial((p) => (p + 1) % testimonials.length); 
        setIsTransitioning(false); 
      }, 500); 
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { 
    if (timer > 0) { 
      const id = setTimeout(() => setTimer(timer - 1), 1000); 
      return () => clearTimeout(id); 
    } 
  }, [timer]);

  const sendOTP = async (purpose: string) => {
    if (!form.email) { setError("Please enter your email"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/send-otp`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ email: form.email, purpose }) 
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTimer(60); 
      setSuccess(`OTP sent to ${form.email}`);
      setOtpPurpose(purpose);
    } catch (err: any) { setError(err.message); } 
    finally { setLoading(false); }
  };

  const verifyOTP = async () => {
    if (!form.otp) { setError("Please enter OTP"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/verify-otp`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ email: form.email, code: form.otp, purpose: otpPurpose }) 
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess("OTP verified!");
      if (otpPurpose === "forgot") setStep("reset"); 
      else setStep("password");
    } catch (err: any) { setError(err.message); } 
    finally { setLoading(false); }
  };

  const handleSignup = async () => {
    if (form.password !== form.confirmPassword) { setError("Passwords don't match"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    
    setLoading(true); setError("");
    try {
      const signupData: any = { 
        fullName: form.fullName, 
        email: form.email, 
        password: form.password, 
        role: selectedRole 
      };
      
      if (selectedRole === "STUDENT") {
        signupData.college = form.college;
      } else if (selectedRole === "EMPLOYER") {
        signupData.company = form.company;
        signupData.companyDescription = form.companyDescription;
        signupData.companyWebsite = form.companyWebsite;
        signupData.companyIndustry = form.companyIndustry;
      } else if (selectedRole === "COLLEGE") {
        signupData.college = form.college;
      }
      
      const res = await fetch(`${API}/signup`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(signupData) 
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem("token", data.token); 
      localStorage.setItem("user", JSON.stringify(data.user));
      redirectUser(data.user.role);
    } catch (err: any) { setError(err.message); } 
    finally { setLoading(false); }
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) { setError("Please enter email and password"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/login`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ email: form.email, password: form.password }) 
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem("token", data.token); 
      localStorage.setItem("user", JSON.stringify(data.user));
      redirectUser(data.user.role);
    } catch (err: any) { setError(err.message); } 
    finally { setLoading(false); }
  };

  const handleResetPassword = async () => {
    if (form.password !== form.confirmPassword) { setError("Passwords don't match"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/reset-password`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ email: form.email, password: form.password }) 
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess("Password reset! Please login."); 
      setTimeout(() => { setStep("login"); setSuccess(""); }, 2000);
    } catch (err: any) { setError(err.message); } 
    finally { setLoading(false); }
  };

  const redirectUser = (role: string) => {
    if (role === "STUDENT") window.location.href = "/student";
    else if (role === "EMPLOYER") window.location.href = "/employer";
    else if (role === "COLLEGE") window.location.href = "/college";
    else if (role === "ADMIN") window.location.href = "/admin";
  };

  const clearAndGo = (s: typeof step) => { setError(""); setSuccess(""); setStep(s); };

  const CollegeSelector = () => (
    <div className="space-y-3">
      <label className="text-[11px] font-semibold text-[#8899BB] uppercase tracking-wider">Select or Add College</label>
      <div className="relative">
        <input
          type="text"
          placeholder="Search or add college name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          className="w-full px-4 py-3.5 border border-[#D0DDF0] rounded-2xl text-sm outline-none focus:border-[#00C2CB] focus:ring-4 focus:ring-[#00C2CB]/10 transition-all"
        />
        {showDropdown && (filteredColleges.length > 0 || searchTerm) && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-[#D0DDF0] rounded-2xl shadow-xl max-h-60 overflow-y-auto">
            {filteredColleges.slice(0, 10).map((college) => (
              <button
                key={college}
                type="button"
                onClick={() => {
                  setForm({ ...form, college: college });
                  setSearchTerm(college);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-[#F0FBFF] transition-colors text-sm text-gray-700 border-b border-gray-100"
              >
                🏛️ {college}
              </button>
            ))}
            {searchTerm && !predefinedColleges.includes(searchTerm) && (
              <button
                type="button"
                onClick={() => {
                  setForm({ ...form, college: searchTerm });
                  setSearchTerm(searchTerm);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-3 bg-[#00C2CB]/5 hover:bg-[#00C2CB]/10 transition-colors text-sm text-[#00C2CB] font-medium"
              >
                ➕ Add "{searchTerm}" as new college
              </button>
            )}
          </div>
        )}
      </div>
      {form.college && (
        <div className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
          ✅ Selected: {form.college}
        </div>
      )}
    </div>
  );

  const CompanySelector = () => (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="text-[11px] font-semibold text-[#8899BB] uppercase tracking-wider">Select or Add Company</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search or add company name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className="w-full px-4 py-3.5 border border-[#D0DDF0] rounded-2xl text-sm outline-none focus:border-[#00C2CB] focus:ring-4 focus:ring-[#00C2CB]/10 transition-all"
          />
          {showDropdown && (filteredCompanies.length > 0 || searchTerm) && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-[#D0DDF0] rounded-2xl shadow-xl max-h-60 overflow-y-auto">
              {filteredCompanies.slice(0, 10).map((company) => (
                <button
                  key={company}
                  type="button"
                  onClick={() => {
                    setForm({ ...form, company: company });
                    setSearchTerm(company);
                    setShowDropdown(false);
                    setShowCompanyForm(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-[#F0FBFF] transition-colors text-sm text-gray-700 border-b border-gray-100"
                >
                  💼 {company}
                </button>
              ))}
              {searchTerm && !predefinedCompanies.includes(searchTerm) && (
                <button
                  type="button"
                  onClick={() => {
                    setForm({ ...form, company: searchTerm });
                    setShowCompanyForm(true);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-3 bg-[#00C2CB]/5 hover:bg-[#00C2CB]/10 transition-colors text-sm text-[#00C2CB] font-medium"
                >
                  ➕ Add "{searchTerm}" as new company
                </button>
              )}
            </div>
          )}
        </div>
        {form.company && (
          <div className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
            ✅ Selected: {form.company}
          </div>
        )}
      </div>

      {showCompanyForm && form.company && !predefinedCompanies.includes(form.company) && (
        <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-sm font-semibold text-gray-700">📝 Add Company Details</p>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Company Description</label>
            <textarea
              placeholder="Tell us about your company..."
              value={form.companyDescription}
              onChange={(e) => setForm({ ...form, companyDescription: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-[#D0DDF0] rounded-xl text-sm outline-none focus:border-[#00C2CB] transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Company Website</label>
            <input
              type="url"
              placeholder="https://yourcompany.com"
              value={form.companyWebsite}
              onChange={(e) => setForm({ ...form, companyWebsite: e.target.value })}
              className="w-full px-4 py-3 border border-[#D0DDF0] rounded-xl text-sm outline-none focus:border-[#00C2CB] transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Industry</label>
            <select
              value={form.companyIndustry}
              onChange={(e) => setForm({ ...form, companyIndustry: e.target.value })}
              className="w-full px-4 py-3 border border-[#D0DDF0] rounded-xl text-sm outline-none focus:border-[#00C2CB] transition-all"
            >
              <option value="">Select Industry</option>
              <option value="Technology">Technology</option>
              <option value="Finance">Finance</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Retail">Retail</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Consulting">Consulting</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        .animate-up { animation: slideUp 0.3s ease forwards; }
        .otp-input { letter-spacing: 12px; text-align: center; font-size: 24px; font-weight: 700; }
      `}</style>

      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-[40%] bg-[#0D1B40] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-20 -left-10 w-80 h-80 rounded-full bg-[#00C2CB] opacity-[0.03]" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#00C2CB] to-[#008B93] rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">CC</span>
          </div>
          <span className="text-white text-2xl font-bold">Career<span className="text-[#00C2CB]">Connect</span></span>
        </div>
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h1 className="text-white text-4xl font-bold mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>Your Career Journey<br/>Starts Here</h1>
          <p className="text-[#8899BB] text-base mb-10">Join 10,000+ students who found their dream jobs through AI-powered career guidance.</p>
          <div className="space-y-4 mb-10">
            {["AI-powered career mentorship", "Smart automated assessments", "Real-time placement analytics"].map(b => (
              <div key={b} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#00C2CB]/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#00C2CB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <span className="text-gray-300 text-sm">{b}</span>
              </div>
            ))}
          </div>
          <div className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 transition-all duration-500 ${isTransitioning?"opacity-0 translate-y-4":"opacity-100"}`}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00C2CB] to-[#008B93] flex items-center justify-center text-white font-bold text-xs">
                {testimonials[currentTestimonial].avatar}
              </div>
              <div>
                <p className="text-white/80 text-sm italic mb-2">"{testimonials[currentTestimonial].feedback}"</p>
                <span className="text-white text-xs font-semibold">{testimonials[currentTestimonial].name}</span>
                <span className="text-[#00C2CB] text-xs ml-2 bg-[#00C2CB]/10 px-2 py-0.5 rounded-full">{testimonials[currentTestimonial].role}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="relative z-10 text-[#8899BB] text-xs">Trusted by 500+ Colleges & 1000+ Companies</div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 bg-white flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-up">
          {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-2xl mb-5 flex items-center gap-2"><span>✅</span> {success}</div>}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl mb-5 flex items-center justify-between"><span>{error}</span><button onClick={() => setError("")} className="text-red-400">✕</button></div>}

          {/* LOGIN */}
          {step === "login" && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#0D1B40]" style={{ fontFamily: "'Syne', sans-serif" }}>Welcome Back</h2>
                <p className="text-[#8899BB] text-sm mt-1">Login to your account</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#8899BB] uppercase tracking-wider">Email</label>
                <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-3.5 border border-[#D0DDF0] rounded-2xl text-sm outline-none focus:border-[#00C2CB] focus:ring-4 focus:ring-[#00C2CB]/10 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#8899BB] uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input type={showPassword?"text":"password"} placeholder="Enter password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full px-4 py-3.5 pr-12 border border-[#D0DDF0] rounded-2xl text-sm outline-none focus:border-[#00C2CB] focus:ring-4 focus:ring-[#00C2CB]/10 transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8899BB]">{showPassword?"🙈":"👁️"}</button>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => { setOtpPurpose("forgot"); clearAndGo("forgot"); }} className="text-xs text-[#00C2CB] font-semibold hover:underline">Forgot Password?</button>
              </div>
              <button onClick={handleLogin} disabled={loading} className="w-full bg-[#00C2CB] text-white py-3.5 rounded-2xl font-bold text-[15px] hover:bg-[#008B93] active:scale-[0.98] transition-all shadow-lg shadow-[#00C2CB]/20 disabled:opacity-50">
                {loading?"Logging in...":"Login"}
              </button>
              <p className="text-center text-[13px] text-[#8899BB]">Don't have an account? <button onClick={() => clearAndGo("signup")} className="text-[#00C2CB] font-semibold hover:underline">Sign Up</button></p>
            </div>
          )}

          {/* SIGNUP */}
          {step === "signup" && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#0D1B40]" style={{ fontFamily: "'Syne', sans-serif" }}>Create Account</h2>
                <p className="text-[#8899BB] text-sm mt-1">Step 1: Your Details</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#8899BB] uppercase tracking-wider">Full Name</label>
                <input type="text" placeholder="Enter your full name" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className="w-full px-4 py-3.5 border border-[#D0DDF0] rounded-2xl text-sm outline-none focus:border-[#00C2CB] focus:ring-4 focus:ring-[#00C2CB]/10 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#8899BB] uppercase tracking-wider">Email</label>
                <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-3.5 border border-[#D0DDF0] rounded-2xl text-sm outline-none focus:border-[#00C2CB] focus:ring-4 focus:ring-[#00C2CB]/10 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-[#8899BB] uppercase tracking-wider">Select Your Role</label>
                <div className="grid grid-cols-1 gap-3">
                  {roles.map(role => (
                    <button key={role.id} type="button" onClick={() => { setSelectedRole(role.id); setSearchTerm(""); setForm({...form, college: "", company: ""}); }} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${selectedRole===role.id?"border-[#00C2CB] bg-[#F0FBFF] shadow-lg":"border-[#E8EDF5] bg-white hover:border-[#D0DDF0]"}`}>
                      <span className="text-3xl">{role.icon}</span>
                      <div className="flex-1 text-left">
                        <div className={`font-bold text-sm ${selectedRole===role.id?"text-[#0D1B40]":"text-gray-700"}`}>{role.label}</div>
                        <div className="text-xs text-gray-400">{role.description}</div>
                      </div>
                      {selectedRole===role.id && <span className="text-[#00C2CB] text-xl">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
              
              {selectedRole === "STUDENT" && <CollegeSelector />}
              {selectedRole === "EMPLOYER" && <CompanySelector />}
              {selectedRole === "COLLEGE" && <CollegeSelector />}
              
              <button onClick={() => { 
                if (!form.fullName) { setError("Please enter your full name"); return; }
                if (!form.email) { setError("Please enter your email"); return; }
                if (!selectedRole) { setError("Please select a role"); return; }
                if ((selectedRole === "STUDENT" || selectedRole === "COLLEGE") && !form.college) { setError("Please select your college"); return; }
                if (selectedRole === "EMPLOYER" && !form.company) { setError("Please select your company"); return; }
                sendOTP("signup"); 
                setStep("otp"); 
              }} disabled={loading} className="w-full bg-[#00C2CB] text-white py-3.5 rounded-2xl font-bold text-[15px] hover:bg-[#008B93] active:scale-[0.98] transition-all shadow-lg shadow-[#00C2CB]/20">
                Continue → Verify Email
              </button>
              <p className="text-center text-[13px] text-[#8899BB]">Already have an account? <button onClick={() => clearAndGo("login")} className="text-[#00C2CB] font-semibold hover:underline">Login</button></p>
            </div>
          )}

          {/* OTP */}
          {(step === "otp" || step === "forgot") && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <span className="text-4xl block mb-3">📧</span>
                <h2 className="text-2xl font-bold text-[#0D1B40]" style={{ fontFamily: "'Syne', sans-serif" }}>Check Your Email</h2>
                <p className="text-[#8899BB] text-sm mt-1">We sent a 6-digit code to <strong>{form.email}</strong></p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#8899BB] uppercase tracking-wider">Enter OTP</label>
                <input type="text" maxLength={6} placeholder="000000" value={form.otp} onChange={e => setForm({...form, otp: e.target.value.replace(/\D/g,'')})} className="w-full px-4 py-4 border border-[#D0DDF0] rounded-2xl otp-input outline-none focus:border-[#00C2CB] focus:ring-4 focus:ring-[#00C2CB]/10 transition-all" />
              </div>
              {timer > 0 ? (
                <p className="text-center text-xs text-[#8899BB]">Resend OTP in {timer}s</p>
              ) : (
                <button onClick={() => sendOTP(step === "forgot" ? "forgot" : "signup")} className="w-full text-center text-xs text-[#00C2CB] font-semibold hover:underline">Resend OTP</button>
              )}
              <button onClick={verifyOTP} disabled={loading || form.otp.length < 6} className="w-full bg-[#00C2CB] text-white py-3.5 rounded-2xl font-bold text-[15px] hover:bg-[#008B93] active:scale-[0.98] transition-all shadow-lg shadow-[#00C2CB]/20 disabled:opacity-50">
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
              <button onClick={() => clearAndGo("login")} className="w-full text-center text-sm text-[#8899BB]">← Back to Login</button>
            </div>
          )}

          {/* CREATE PASSWORD */}
          {step === "password" && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <span className="text-4xl block mb-3">✅</span>
                <h2 className="text-2xl font-bold text-[#0D1B40]" style={{ fontFamily: "'Syne', sans-serif" }}>Create Password</h2>
                <p className="text-[#8899BB] text-sm mt-1">Email verified! Now create your password</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#8899BB] uppercase tracking-wider">Password</label>
                <input type={showPassword ? "text" : "password"} placeholder="Create password (min 6 characters)" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full px-4 py-3.5 border border-[#D0DDF0] rounded-2xl text-sm outline-none focus:border-[#00C2CB] focus:ring-4 focus:ring-[#00C2CB]/10 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#8899BB] uppercase tracking-wider">Confirm Password</label>
                <input type={showPassword ? "text" : "password"} placeholder="Confirm password" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} className="w-full px-4 py-3.5 border border-[#D0DDF0] rounded-2xl text-sm outline-none focus:border-[#00C2CB] focus:ring-4 focus:ring-[#00C2CB]/10 transition-all" />
              </div>
              <button onClick={handleSignup} disabled={loading} className="w-full bg-gradient-to-r from-[#00C2CB] to-[#6c47ff] text-white py-3.5 rounded-2xl font-bold text-[15px] hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50">
                {loading ? "Creating Account..." : "🎉 Create Account"}
              </button>
            </div>
          )}

          {/* RESET PASSWORD */}
          {step === "reset" && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <span className="text-4xl block mb-3">🔒</span>
                <h2 className="text-2xl font-bold text-[#0D1B40]" style={{ fontFamily: "'Syne', sans-serif" }}>Reset Password</h2>
                <p className="text-[#8899BB] text-sm mt-1">Create a new password for {form.email}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#8899BB] uppercase tracking-wider">New Password</label>
                <input type={showPassword ? "text" : "password"} placeholder="New password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full px-4 py-3.5 border border-[#D0DDF0] rounded-2xl text-sm outline-none focus:border-[#00C2CB] focus:ring-4 focus:ring-[#00C2CB]/10 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#8899BB] uppercase tracking-wider">Confirm Password</label>
                <input type={showPassword ? "text" : "password"} placeholder="Confirm password" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} className="w-full px-4 py-3.5 border border-[#D0DDF0] rounded-2xl text-sm outline-none focus:border-[#00C2CB] focus:ring-4 focus:ring-[#00C2CB]/10 transition-all" />
              </div>
              <button onClick={handleResetPassword} disabled={loading} className="w-full bg-[#00C2CB] text-white py-3.5 rounded-2xl font-bold text-[15px] hover:bg-[#008B93] active:scale-[0.98] transition-all shadow-lg shadow-[#00C2CB]/20 disabled:opacity-50">
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthForm;