import React, { useState } from 'react';
import Navbar from '../components/navbar';
import axios from 'axios';
import OtpModal from '../components/OtpModal';
import { toast } from 'react-toastify';
import { replace, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from "../context/AuthContext";


const Login = () => {
    const { user } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
  if (user) {
    // Redirect based on role
    if (user.role === 'admin') navigate('/main/dashboard', { replace: true });
    else if (user.role === 'employee') navigate('/employee/dashboard', { replace: true });
    else if (user.role === 'client') navigate('/client/dashboard', { replace: true });
    else navigate('/', { replace: true });
  }
}, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3000/api/auth/login/password', {
        email: form.email,
        password: form.password,
      });

      if (res.status === 200) {
        toast.success('OTP sent to your email');
        setEmail(form.email);
        setOtpModalOpen(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async () => {
  try {
    const res = await axios.post('http://localhost:3000/api/auth/login/verify', {
      email,
      otp,
    });

    if (res.status === 200) {
      toast.success('Login successful!');
    
      setOtpModalOpen(false);
      login(res.data.user);
      console.log('User logged in:', res.data.user);
       // Set user in context

      // Navigate based on user role
      const role = res.data.user.role;
      if (role === 'admin') {
        navigate('/main/dashboard',{replace:true});
      } else if (role === 'employee') {
        navigate('/employee/dashboard',{replace:true});
      } else if (role === 'client') {
        navigate('/client/dashboard',{replace:true});
      } else {
        navigate('/',{replace:true}); // fallback
      }
    }
  } catch (err) {
    toast.error(err.response?.data?.error || 'Invalid OTP');
  }
};

  const handleResendOtp = async () => {
    try {
      await axios.post('http://localhost:3000/api/auth/login/password', {
        email,
        password: form.password,
      });
      toast.info('OTP re-sent to your email');
    } catch (error) {
      toast.error('Failed to resend OTP');
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 pt-32">
        <div className="w-full max-w-md p-8 bg-white rounded shadow">
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded font-semibold ${
                loading
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? 'Sending OTP...' : 'Login'}
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

export default Login;
