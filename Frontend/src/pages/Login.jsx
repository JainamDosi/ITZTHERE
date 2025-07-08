import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar';
import axios from 'axios';
axios.defaults.withCredentials = true;
import OtpModal from '../components/OtpModal';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import { useMutation } from "@tanstack/react-query";

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpModalOpen, setOtpModalOpen] = useState(false);

  // Get the intended path from location.state
  const from = location.state?.from?.pathname || null;

  // 🔁 Redirect if already logged in
  useEffect(() => {
    if (user && location.pathname === "/login") {
      if (from) {
        navigate(from, { replace: true });
      } else {
        // fallback to dashboard by role
        const role = user.role;
        if (role === 'company-admin') navigate('/main/dashboard', { replace: true });
        else if (role === 'employee') navigate('/employee/dashboard', { replace: true });
        else if (role === 'client') navigate('/client/dashboard', { replace: true });
        else if(role=="Individual") navigate('/individual/dashboard', { replace: true });
        else if(role=="superadmin") navigate('/superadmin/dashboard', { replace: true });
        else navigate('/', { replace: true });
      }
    }
  }, [user, location.pathname, navigate, from]);

  // 🔐 Send OTP mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      return await axios.post('http://localhost:3000/api/auth/login/password', { email, password });
    },
    onSuccess: (_, variables) => {
      toast.success('OTP sent to your email');
      setEmail(variables.email);
      setOtpModalOpen(true);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Login failed');
    },
  });

  // ✅ OTP Verification mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async ({ email, otp }) => {
      return await axios.post("http://localhost:3000/api/auth/login/verify", { email, otp });
    },
    onSuccess: (res) => {
      toast.success('Login successful!');
      setOtpModalOpen(false);
      login(res.data.user); // Set context

      const role = res.data.user.role;
      if (role === 'company-admin') navigate('/main/dashboard', { replace: true });
      else if (role === 'employee') navigate('/employee/dashboard', { replace: true });
      else if (role === 'client') navigate('/client/dashboard', { replace: true });
      else if(role=="Individual") navigate('/individual/dashboard', { replace: true });
      else if(role=="superadmin") navigate('/superadmin/dashboard', { replace: true });
      else navigate('/', { replace: true });
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Invalid OTP');
    },
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate({ email: form.email, password: form.password });
  };

  const handleOtpVerify = () => {
    verifyOtpMutation.mutate({ email, otp });
  };

  const handleResendOtp = () => {
    loginMutation.mutate({ email, password: form.password });
    toast.info('OTP re-sent to your email');
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 px-4">
        <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full relative animate-fade-in">
          <div className="flex flex-col items-center justify-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Welcome Back</h2>
            <p className="text-gray-500 text-sm">Please login to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className={`w-full py-2 rounded-md font-semibold transition text-white ${
                loginMutation.isPending
                  ? 'bg-pink-300 cursor-not-allowed'
                  : 'bg-pink-600 hover:bg-pink-700'
              }`}
            >
              {loginMutation.isPending ? 'Sending OTP...' : 'Login'}
            </button>
          </form>

          <div className="text-center text-xs text-gray-500 mt-6">
            By logging in, you agree to our Terms and Privacy Policy.
          </div>
        </div>
      </div>

      <OtpModal
        open={otpModalOpen}
        otp={otp}
        setOtp={setOtp}
        onCancel={() => setOtpModalOpen(false)}
        onVerify={handleOtpVerify}
        onResend={handleResendOtp}
        loading={verifyOtpMutation.isPending}
      />
    </>
  );
};

export default Login;
