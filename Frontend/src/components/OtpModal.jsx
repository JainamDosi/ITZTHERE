import React, { useEffect, useRef, useState } from "react";

const OtpModal = ({ open, otp, setOtp, onCancel, onVerify, onResend }) => {
  const inputsRef = useRef([]);
  const [cooldown, setCooldown] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setCooldown(30);
      setIsSubmitting(false); // reset on open
    }
  }, [open]);

  useEffect(() => {
    if (!open || cooldown <= 0) return;
    const interval = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [cooldown, open]);

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
    if (!value) return;

    const newOtp = otp.split("");
    newOtp[index] = value;
    setOtp(newOtp.join(""));
    if (index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newOtp = otp.split("");
      newOtp[index] = "";
      setOtp(newOtp.join(""));
      if (index > 0) inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, 6).replace(/\D/g, "");
    const newOtp = otp.split("");
    for (let i = 0; i < pasted.length; i++) newOtp[i] = pasted[i];
    setOtp(newOtp.join(""));
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = () => {
    setIsSubmitting(true);
    Promise.resolve(onVerify()) // handles both sync and async
      .finally(() => setIsSubmitting(false));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-[380px]">
        <h2 className="text-xl font-bold mb-4 text-center">Enter OTP</h2>
        <div className="flex justify-between gap-2 mb-4" onPaste={handlePaste}>
          {[...Array(6)].map((_, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              type="text"
              maxLength={1}
              value={otp[index] || ""}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-10 h-12 text-xl text-center border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          ))}
        </div>

        <div className="text-sm mb-4 text-center">
          {cooldown > 0 ? (
            <span className="text-gray-500">Resend OTP in {cooldown}s</span>
          ) : (
            <button
              onClick={() => {
                onResend();
                setCooldown(30);
              }}
              className="text-blue-600 hover:underline"
              disabled={isSubmitting}
            >
              Resend OTP
            </button>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleVerify}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={otp.length < 6 || isSubmitting}
          >
            {isSubmitting ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpModal;
