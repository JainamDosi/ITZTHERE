import React, { useState } from 'react';
import Navbar from '../components/navbar';
import axios from 'axios';
import OtpModal from '../components/OtpModal';
import { toast } from 'react-toastify';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState("");

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    userType: 'individual',
    companyName: '',
    gstin: '',
    companyDoc: null,
    identityDoc: null,
    plan: '',
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.plan) {
      toast.error("Please select a subscription plan.");
      return;
    }

    if (
      (form.userType === "company" && !form.companyDoc) ||
      (form.userType === "individual" && !form.identityDoc)
    ) {
      toast.error("Please upload the required verification document.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3000/api/auth/register/send-otp", {
        email: form.email,
      });

      if (res.status === 200) {
        setOtpModalOpen(true);
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      const msg = error.response?.data?.error || "Failed to send OTP";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async () => {
  try {
    const formData = new FormData();
    formData.append("username", form.username);
    formData.append("email", form.email);
    formData.append("password", form.password);
    formData.append("otp", otp);
    formData.append("userType", form.userType);
    formData.append("phone", form.phone || "");

    if (form.userType === "company") {
      formData.append("companyName", form.companyName);
      formData.append("gstin", form.gstin);
      formData.append("companyDoc", form.companyDoc);
    } else {
      formData.append("identityDoc", form.identityDoc);
    }

    const res = await axios.post(
      "http://localhost:3000/api/auth/register/verify",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (res.status === 200) {
      setOtpModalOpen(false);
      toast.success("User registered successfully ! Your Docs are under verification ");
    }
  } catch (err) {
    console.error("OTP verification failed:", err);
    alert(err.response?.data?.error || "OTP verification failed");
  }
};


  const handleResendOtp = async () => {
    try {
      const res = await axios.post("http://localhost:3000/api/auth/register/send-otp", {
        email: form.email,
      });
      if (res.status === 200) {
        console.log("OTP re-sent");
      }
    } catch (err) {
      console.error("Failed to resend OTP", err);
      alert("Failed to resend OTP");
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-300 pt-32">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-bold font-roboto mb-6 text-center">Register</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" name="username" placeholder="Username" value={form.username} onChange={handleChange} className="w-full px-4 py-2 font-roboto border rounded" required />
            <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full px-4 py-2 border font-roboto rounded" required />
            <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full px-4 py-2 border font-roboto rounded" required />

            <div className="flex space-x-4 align-middle justify-center">
              <label className="flex items-center">
                <input type="radio" name="userType" value="individual" checked={form.userType === 'individual'} onChange={handleChange} className="mr-2 font-roboto" /> Individual
              </label>
              <label className="flex items-center">
                <input type="radio" name="userType" value="company" checked={form.userType === 'company'} onChange={handleChange} className="mr-2 font-roboto" /> Company Admin
              </label>
            </div>

            {/* Subscription Plan Cards */}
            <div>
              <h3 className="text-center font-semibold mb-2">Choose Your Plan</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                {[{ id: "individual", title: "Individual", price: "₹199/mo", features: ["Basic Access"] }, { id: "business", title: "Business", price: "₹499/mo", features: ["Team Access", "Basic Analytics"] }, { id: "business-plus", title: "Business+", price: "₹999/mo", features: ["All Features", "Priority Support"] }].map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setForm({ ...form, plan: plan.id })}
                    className={`cursor-pointer border rounded-lg p-4 shadow transition-all duration-200 hover:shadow-lg ${form.plan === plan.id ? "border-pink-600 bg-pink-100" : "border-gray-300"}`}
                  >
                    <h4 className="text-lg font-bold mb-1">{plan.title}</h4>
                    <p className="text-sm mb-2 text-gray-600">{plan.price}</p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      {plan.features.map((f, i) => <li key={i}>• {f}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Uploads */}
            {form.userType === 'company' && (
              <>
                <input type="text" name="companyName" placeholder="Company Name" value={form.companyName} onChange={handleChange} className="w-full px-4 py-2 border font-roboto rounded" required />
                <input type="text" name="gstin" placeholder="GSTIN Number" value={form.gstin} onChange={handleChange} className="w-full px-4 py-2 border font-roboto rounded" required />
                <label className="block w-full">Company Verification Document<span className="text-red-500">*</span>
                  <div className="relative mt-3 flex items-center space-x-2">
                    <input id="companyDoc" type="file" name="companyDoc" accept="application/pdf,image/*" onChange={handleChange} className="hidden" />
                    <label htmlFor="companyDoc" className="cursor-pointer flex-1 flex items-center justify-center px-4 py-8 bg-gray-200 text-gray-700 rounded hover:bg-gray-300" onClick={(e) => e.stopPropagation()}>
                      {form.companyDoc ? form.companyDoc.name : 'Upload Document'}
                    </label>
                    {form.companyDoc && (
                      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setForm({ ...form, companyDoc: null }); }} className="ml-2 text-red-500 hover:text-red-700 text-lg font-bold" aria-label="Remove file" tabIndex={0}>×</button>
                    )}
                  </div>
                </label>
              </>
            )}

            {form.userType === 'individual' && (
              <label className="block w-full">Identity Verification Document<span className="text-red-500">*</span>
                <div className="relative mt-1 flex items-center space-x-2">
                  <input id="identityDoc" type="file" name="identityDoc" accept="application/pdf,image/*" onChange={handleChange} className="hidden" />
                  <label htmlFor="identityDoc" className="cursor-pointer flex-1 flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300" onClick={(e) => e.stopPropagation()}>
                    {form.identityDoc ? form.identityDoc.name : 'Upload Document'}
                  </label>
                  {form.identityDoc && (
                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setForm({ ...form, identityDoc: null }); }} className="ml-2 text-red-500 hover:text-red-700 text-lg font-bold" aria-label="Remove file" tabIndex={0}>×</button>
                  )}
                </div>
              </label>
            )}

            <button type="submit" disabled={loading} className={`w-full py-2 rounded font-semibold ${loading ? 'bg-pink-300 cursor-not-allowed' : 'bg-pink-700 hover:bg-pink-600 text-white'}`}>
              {loading ? 'Sending OTP...' : 'Register'}
            </button>
          </form>
        </div>
      </div>

      <OtpModal
        open={otpModalOpen}
        otp={otp}
        setOtp={setOtp}
        onCancel={() => setOtpModalOpen(false)}
        onVerify={handleOtpVerify}
        onResend={handleResendOtp}
      />

    </>
  );
};

export default Register;