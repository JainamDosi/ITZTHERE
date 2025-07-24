import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import axios from 'axios';
import { toast } from "react-toastify";

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-400';

const AlreadyRegisteredModal = ({ open, role, userId, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [companyDoc, setCompanyDoc] = useState(null);
  const [identityDoc, setIdentityDoc] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!open) return;
    const roles = Array.isArray(role) ? role : [role];
    if (roles.includes('individual') && roles.includes('company-admin')) {
      toast.error('Please login with your respective credentials. No upgrade possible.');
      setBlocked(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setBlocked(false);
    }
  }, [open, role, onClose]);

  if (!open || blocked) return null;

  const allPlans = [
    {
      id: 'individual',
      title: 'Individual',
      price: '₹199/month',
      features: ['Basic Access'],
    },
    {
      id: 'business',
      title: 'Business',
      price: '₹499/month',
      features: ['Team Access', 'Basic Analytics'],
    },
    {
      id: 'business-plus',
      title: 'Business+',
      price: '₹999/month',
      features: ['All Features', 'Priority Support'],
    },
  ];

  const getAvailablePlans = () => {
    const roles = Array.isArray(role) ? role : [role];
    if (roles.includes('individual')) {
      return allPlans.filter((p) => p.id !== 'individual');
    } else if (roles.includes('company-admin') || roles.includes('employee')) {
      return allPlans.filter((p) => p.id === 'individual');
    } else if (roles.includes('client')) {
      return allPlans;
    }
    return [];
  };

  const availablePlans = getAvailablePlans();

  const handleFileChange = (e, setter) => {
    setter(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!selectedPlan) return;

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('selectedPlan', selectedPlan);
    formData.append('billingCycle', billingCycle);

    if (selectedPlan === 'individual') {
      if (!identityDoc) return alert('Please upload your identity document.');
      formData.append('verificationDoc', identityDoc);
    } else {
      if (!companyName || !gstin || !companyDoc) {
        return alert('Please fill in all company fields and upload document.');
      }
      formData.append('companyName', companyName);
      formData.append('gstin', gstin);
      formData.append('verificationDoc', companyDoc);
    }


    try {
      setLoading(true);
      
      const res = await axios.patch('/auth/upgrade-plan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        alert('Plan upgrade successful. Your documents are under verification.');
        onClose();
      } else {
        alert('Upgrade failed.');
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black bg-opacity-40 overflow-y-auto">
      <div className="relative bg-white rounded-lg max-w-lg w-full p-6 shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-600"
        >
          <FiX size={20} />
        </button>

        <h2 className="text-xl font-bold mb-3 text-center text-pink-700">
          You're Already Registered
        </h2>
        <p className="text-sm text-gray-700 text-center mb-1">
          You are already added to our system as{' '}
          <span className="font-semibold capitalize">
            {Array.isArray(role) ? role.join(', ') : role}
          </span>.
        </p>
        <p className="text-sm text-gray-600 text-center mb-4">
          To buy another plan, select from the available options below.
        </p>

        {/* Billing cycle toggle */}
        <div className="flex justify-center items-center gap-2 mb-4">
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

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {availablePlans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`border rounded-lg p-4 bg-gray-50 hover:shadow-md transition cursor-pointer ${
                selectedPlan === plan.id ? 'border-pink-500 bg-pink-50' : 'border-gray-300'
              }`}
            >
              <h4 className="text-pink-700 font-semibold mb-1">{plan.title}</h4>
              <p className="text-sm text-gray-700 mb-2">{plan.price}</p>
              <ul className="text-xs text-gray-600 mb-3 list-disc list-inside">
                {plan.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Conditional Fields */}
        {selectedPlan === 'individual' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Identity Document <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => handleFileChange(e, setIdentityDoc)}
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md p-2"
            />
            {identityDoc && (
              <p className="text-xs text-green-600 mt-1">{identityDoc.name} selected</p>
            )}
          </div>
        )}

        {(selectedPlan === 'business' || selectedPlan === 'business-plus') && (
          <div className="space-y-3 mb-4">
            <input
              type="text"
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="GSTIN Number"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              className={inputClass}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Company Document <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => handleFileChange(e, setCompanyDoc)}
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md p-2"
              />
              {companyDoc && (
                <p className="text-xs text-green-600 mt-1">{companyDoc.name} selected</p>
              )}
            </div>
          </div>
        )}

        {selectedPlan && (
          <div className="text-center mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`bg-pink-600 text-white px-6 py-2 rounded hover:bg-pink-700 transition ${
                loading ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'This may take some time please wait...' : 'Submit & Continue'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlreadyRegisteredModal;
