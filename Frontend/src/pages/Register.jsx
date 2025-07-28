import React, { useState } from 'react';
import Navbar from '../components/navbar';
import axios from 'axios';
import OtpModal from '../components/OtpModal';
import { toast } from 'react-toastify';
import AlreadyRegisteredModal from '../components/AlreadyRegisteredModal ';

const inputClass =
  'w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-pink-400';

const FileUpload = ({ label, file, onRemove, onChange, name }) => (
  <label className="block text-sm font-medium text-gray-700">
    {label}
    <span className="text-red-500">*</span>
    <div className="relative mt-2 flex items-center space-x-2">
      <input
        id={name}
        type="file"
        name={name}
        accept="application/pdf,image/*"
        onChange={onChange}
        className="hidden"
      />
      <label
        htmlFor={name}
        className="cursor-pointer flex-1 px-4 py-3 bg-gray-100 text-center text-gray-700 rounded hover:bg-gray-200 transition"
      >
        {file ? file.name : 'Upload Document'}
      </label>
      {file && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="text-red-500 text-lg hover:text-red-700"
        >
          ×
        </button>
      )}
    </div>
  </label>
);

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [existingModalOpen, setExistingModalOpen] = useState(false);
  const [existingRole, setExistingRole] = useState([]);
  const [existingId, setExistingId] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'
  
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
      toast.error('Please select a subscription plan.');
      return;
    }

    if (
      (form.userType === 'company' && !form.companyDoc) ||
      (form.userType === 'individual' && !form.identityDoc)
    ) {
      toast.error('Please upload the required verification document.');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post('/auth/register/send-otp', {
        email: form.email,
      }, {
        withCredentials: true,
      });

      if (res.status === 200) {
        setOtpModalOpen(true);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      const msg = error.response?.data?.error || 'Failed to send OTP';

      // Check if email already exists and backend returns role
      if (msg.includes('Email already exists')) {
       


        const role = error.response?.data?.allowedRole || []; // expect backend to send { error, role }
        const userId = error.response?.data?.Id || ''; // expect backend to send { error, Id }
        setExistingId(userId);
        setExistingRole(role);
        setExistingModalOpen(true);
      } else {
        toast.error(msg);
      }}
    finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    try {
      const formData = new FormData();
      formData.append('username', form.username);
      formData.append('email', form.email);
      formData.append('password', form.password);
      formData.append('otp', otp);
      formData.append('userType', form.userType);
      formData.append('phone', form.phone || '');
      formData.append('plan', form.plan);

      if (form.userType === 'company') {
        formData.append('companyName', form.companyName);
        formData.append('gstin', form.gstin);
        formData.append('companyDoc', form.companyDoc);
        formData.append('billingCycle', billingCycle); // ← add this

      } else {
        formData.append('identityDoc', form.identityDoc);
        formData.append('billingCycle', billingCycle); // ← add this

      }

      const res = await axios.post(
        '/auth/register/verify',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }, {
        withCredentials: true,
      }
      );

      if (res.status === 200) {
        setOtpModalOpen(false);
        toast.success('User registered successfully! Your Docs are under verification.');
      }
    } catch (err) {
      console.error('OTP verification failed:', err);
      alert(err.response?.data?.error || 'OTP verification failed');
    }
  };

  const handleResendOtp = async () => {
    try {
      const res = await axios.post('/auth/register/send-otp', {
        email: form.email,
      }, {
        withCredentials: true,
      });
      if (res.status === 200) {
        console.log('OTP re-sent');
      }
    } catch (err) {
      console.error('Failed to resend OTP', err);
      alert('Failed to resend OTP');
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-200 pt-24 px-4">
        <div className="w-full max-w-lg p-8 bg-white rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-center mb-6">Register</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
            {/* Basic Info */}
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className={inputClass}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className={inputClass}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className={inputClass}
              required
            />

            {/* User Type */}
            <div className="flex items-center justify-center gap-6 font-medium">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="userType"
                  value="individual"
                  checked={form.userType === 'individual'}
                  onChange={handleChange}
                />
                Individual
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="userType"
                  value="company"
                  checked={form.userType === 'company'}
                  onChange={handleChange}
                />
                Company Admin
              </label>
            </div>
                      <div className="flex justify-center items-center mb-4 gap-2">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-pink-700' : 'text-gray-500'}`}>
              Monthly
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={billingCycle === 'yearly'}
                onChange={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
            </label>
            <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-pink-700' : 'text-gray-500'}`}>
              Yearly
            </span>
          </div>


                    {/* Plan Selection */}
            <div>
            <h3 className="text-center font-semibold mb-2">Choose Your Plan</h3>
            
            <div className="flex flex-wrap justify-center gap-4">
            {[
            {
              id: 'individual',
              title: 'Individual',
              monthly: 0,
              yearly: 0, // 20% discount
              features: ['Basic Access'],
              allowedUserTypes: ['individual'],
            },
            {
              id: 'business',
              title: 'Business',
              monthly: 0,
              yearly: 0,
              features: ['Team Access', 'Basic Analytics'],
              allowedUserTypes: ['company'],
            },
            {
              id: 'business-plus',
              title: 'Business+',
              monthly: 0,
              yearly: 0,
              features: ['All Features', 'Priority Support'],
              allowedUserTypes: ['company'],
            },
          ]
            .filter((plan) => plan.allowedUserTypes.includes(form.userType))
            .map((plan) => {
              const price = billingCycle === 'monthly' ? plan.monthly : plan.yearly;
              return (
                <div
                  key={plan.id}
                  onClick={() => setForm({ ...form, plan: plan.id })}
                  className={`w-64 cursor-pointer border rounded-lg p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
                    form.plan === plan.id ? 'border-pink-600 bg-pink-100' : 'border-gray-300'
                  }`}
                >
                  <h4 className="text-sm font-bold mb-1">{plan.title}</h4>
                  <p className="text-xs mb-2 text-gray-600">
                    ₹{price.toFixed(0)}/{billingCycle}
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    {plan.features.map((f, i) => (
                      <li key={i}>• {f}</li>
                    ))}
                  </ul>
                </div>
              );
            })}

            </div>
          </div>

            {/* Company Fields */}
            {form.userType === 'company' && (
              <>
                <input
                  type="text"
                  name="companyName"
                  placeholder="Company Name"
                  value={form.companyName}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
                <input
                  type="text"
                  name="gstin"
                  placeholder="GSTIN Number"
                  value={form.gstin}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
                <FileUpload
                  label="Company Verification Document"
                  file={form.companyDoc}
                  onRemove={() => setForm({ ...form, companyDoc: null })}
                  onChange={handleChange}
                  name="companyDoc"
                />
              </>
            )}

            {/* Individual Fields */}
            {form.userType === 'individual' && (
              <FileUpload
                label="Identity Verification Document"
                file={form.identityDoc}
                onRemove={() => setForm({ ...form, identityDoc: null })}
                onChange={handleChange}
                name="identityDoc"
              />
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                loading ? 'bg-pink-300 cursor-not-allowed' : 'bg-pink-700 hover:bg-pink-600 text-white'
              }`}
            >
              {loading ? 'Sending OTP...' : 'Register'}
            </button>

              <p className="text-center text-xs text-gray-500 mt-2 italic">
              All plans are currently in trial version.
            </p>


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
            <AlreadyRegisteredModal
        open={existingModalOpen}
        role={existingRole}
        userId={existingId}
        onClose={() => setExistingModalOpen(false)}
      />

    </>
  );
};

export default Register;
