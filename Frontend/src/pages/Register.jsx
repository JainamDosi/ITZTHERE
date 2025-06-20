import React, { useState } from 'react';
import Navbar from '../components/navbar';

const Register = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    userType: 'individual',
    companyName: '',
    gstin: '',
    companyDoc: null,
    identityDoc: null,
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', form);
    alert('Registered!');
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-800 pt-32">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-bold font-roboto mb-6 text-center">Register</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className="w-full px-4 py-2 font-roboto border rounded"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border font-roboto rounded"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border font-roboto rounded"
              required
            />
            <div className="flex space-x-4 align-middle justify-center">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="userType"
                  value="individual"
                  checked={form.userType === 'individual'}
                  onChange={handleChange}
                  className="mr-2 font-roboto"
                />
                Individual
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="userType"
                  value="company"
                  checked={form.userType === 'company'}
                  onChange={handleChange}
                  className="mr-2 font-roboto"
                />
                Company Admin
              </label>
            </div>
            {form.userType === 'company' && (
              <>
                <input
                  type="text"
                  name="companyName"
                  placeholder="Company Name"
                  value={form.companyName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border font-roboto rounded"
                  required
                />
                <input
                  type="text"
                  name="gstin"
                  placeholder="GSTIN Number"
                  value={form.gstin}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border font-roboto rounded"
                  required
                />
                <label className="block w-full">
                  Company Verification Document
                  <div className="relative mt-3 flex items-center space-x-2">
                    <input
                      id="companyDoc"
                      type="file"
                      name="companyDoc"
                      accept="application/pdf,image/*"
                      onChange={handleChange}
                      className="hidden"
                      required={!form.companyDoc}
                    />
                    <label
                      htmlFor="companyDoc"
                      className="cursor-pointer flex-1 flex items-center justify-center px-4 py-8 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {form.companyDoc ? form.companyDoc.name : 'Upload Document'}
                    </label>
                    {form.companyDoc && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setForm({ ...form, companyDoc: null });
                        }}
                        className="ml-2 text-red-500 hover:text-red-700 text-lg font-bold"
                        aria-label="Remove file"
                        tabIndex={0}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </label>
              </>
            )}
            {form.userType === 'individual' && (
              <label className="block w-full">
                Identity Verification Document
                <div className="relative mt-1 flex items-center space-x-2">
                  <input
                    id="identityDoc"
                    type="file"
                    name="identityDoc"
                    accept="application/pdf,image/*"
                    onChange={handleChange}
                    className="hidden"
                    required={!form.identityDoc}
                  />
                  <label
                    htmlFor="identityDoc"
                    className="cursor-pointer flex-1 flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {form.identityDoc ? form.identityDoc.name : 'Upload Document'}
                  </label>
                  {form.identityDoc && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setForm({ ...form, identityDoc: null });
                      }}
                      className="ml-2 text-red-500 hover:text-red-700 text-lg font-bold"
                      aria-label="Remove file"
                      tabIndex={0}
                    >
                      ×
                    </button>
                  )}
                </div>
              </label>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;
