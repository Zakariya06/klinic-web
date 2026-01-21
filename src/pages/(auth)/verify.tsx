import React from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/api/client";
import { useUserStore } from "@/store/userStore";

// Components (keep your existing ones, just make sure they are web-compatible)
import FormInput from "@/components/FormInput";
import FormButton from "@/components/FormButton";
import ErrorMessage from "@/components/ErrorMessage";
import ChangeEmailPhoneModal from "@/components/ChangeEmailPhoneModal";
import logo from "@/assets/images/klinic_logo.jpeg";

export default function Verify() {
  const [emailOtp, setEmailOtp] = React.useState("");
  const [phoneOtp, setPhoneOtp] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [resendLoading, setResendLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [timer, setTimer] = React.useState(30);
  const [showChangeModal, setShowChangeModal] = React.useState(false);

  const intervalIdRef = React.useRef<number | null>(null);

  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  // Field-specific validation errors
  const [emailOtpError, setEmailOtpError] = React.useState("");
  const [phoneOtpError, setPhoneOtpError] = React.useState("");

  const navigate = useNavigate();

  React.useEffect(() => {
    if (timer > 0) {
      const id = window.setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      intervalIdRef.current = id;
    }

    return () => {
      if (intervalIdRef.current !== null) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [timer]);

  // Validation
  const validateEmailOtp = (value: string): boolean => {
    if (value.length !== 4 || !/^\d+$/.test(value)) {
      setEmailOtpError("Email OTP must be 4 digits");
      return false;
    }
    setEmailOtpError("");
    return true;
  };

  const validatePhoneOtp = (value: string): boolean => {
    if (value.length !== 4 || !/^\d+$/.test(value)) {
      setPhoneOtpError("Phone OTP must be 4 digits");
      return false;
    }
    setPhoneOtpError("");
    return true;
  };

  // Change handlers (digits only; keep your original logic incl. slice(0, 6))
  const handleEmailOtpChange = (text: string) => {
    const digitsOnly = text.replace(/\D/g, "");
    const limitedText = digitsOnly.slice(0, 6);
    setEmailOtp(limitedText);
    if (emailOtpError) validateEmailOtp(limitedText);
  };

  const handlePhoneOtpChange = (text: string) => {
    const digitsOnly = text.replace(/\D/g, "");
    const limitedText = digitsOnly.slice(0, 6);
    setPhoneOtp(limitedText);
    if (phoneOtpError) validatePhoneOtp(limitedText);
  };

  const handleVerify = async () => {
    const isEmailOtpValid = validateEmailOtp(emailOtp);
    const isPhoneOtpValid = validatePhoneOtp(phoneOtp);

    if (!isEmailOtpValid || !isPhoneOtpValid) {
      setError("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await apiClient.post("/api/v1/verify-otp", {
        emailOtp,
        phoneOtp,
      });
      setSuccess("Verification successful!");
      localStorage.setItem("token", user.token);
      window.setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1500);
    } catch (err: unknown) {
      console.error("Verification failed:", err);
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(
        errorObj.response?.data?.message ||
          "Verification failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setError("");
    setSuccess("");

    try {
      await apiClient.get("/api/v1/resend-otp");
      setSuccess("OTP sent successfully!");
      setTimer(60);
    } catch (err: unknown) {
      console.error("Resend OTP failed:", err);
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(
        errorObj.response?.data?.message ||
          "Failed to resend OTP. Please try again.",
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleChangeEmailPhone = async (newEmail: string, newPhone: string) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiClient.post("/api/v1/change-email-phone", {
        email: newEmail,
        phone: newPhone,
      });

      setUser(response.data);

      setEmailOtp("");
      setPhoneOtp("");

      setTimer(60);
      await handleResendOtp();

      setSuccess("Email and phone updated successfully! New OTP sent.");
    } catch (err: unknown) {
      console.error("Change email/phone failed:", err);
      const errorObj = err as { response?: { data?: { message?: string } } };
      throw new Error(
        errorObj.response?.data?.message ||
          "Failed to update email/phone. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center flex-col lg:p-5 p-3  relative overflow-hidden bg-[#f4f5fa]">
      <div className=" bg-white max-w-lg w-full sm:p-8 p-4 rounded-xl z-10 ">
        <div className="mb-5">
          <img src={logo} alt="logo" className="w-30 h-auto mb-3 -ml-4" />
          <h2 className="lg:text-xl text-lg font-medium text-black font-poppins">
            Verify Your Account
          </h2>

          <p className="text-[#8B8D97] font-inter text-sm  mt-1">
            We&apos;ve sent verification codes to your email and phone number.
            Please enter them below to verify your account.
          </p>
        </div>

        {error ? <ErrorMessage message={error} /> : null}

        {success ? (
          <div className="mb-4 flex items-center rounded-lg bg-green-50 p-3">
            <p className="ml-2 flex-1 text-green-600">{success}</p>
          </div>
        ) : null}

        <FormInput
          label="Email Verification Code"
          value={emailOtp}
          onChangeText={handleEmailOtpChange}
          placeholder="Enter 4-digit email OTP"
          iconName="email-outline"
          error={emailOtpError}
          rightText={user?.email}
        />

        <FormInput
          label="Phone Verification Code"
          value={phoneOtp}
          onChangeText={handlePhoneOtpChange}
          placeholder="Enter 4-digit phone OTP"
          iconName="phone-outline"
          error={phoneOtpError}
          rightText={user?.phone}
        />

        <div className="flex flex-col items-center my-7">
          <p className="mb-1 text-gray-500">Didn&apos;t receive the code</p>

          <div className="flex flex-wrap items-center gap-4">
            {timer > 0 ? (
              <p className="font-medium text-indigo-600">
                Resend in {timer} seconds
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendLoading}
                className="font-bold text-indigo-600 disabled:opacity-60 cursor-pointer hover:text-indigo-500"
              >
                {resendLoading ? "Sending..." : "Resend Code"}
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowChangeModal(true)}
              disabled={loading}
              className="font-bold text-indigo-600 disabled:opacity-60 hover:text-indigo-500 cursor-pointer"
            >
              Change Email/Phone
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <FormButton title="Verify" onClick={handleVerify} loading={loading} />
        </div>
      </div>

      <ChangeEmailPhoneModal
        visible={showChangeModal}
        onClose={() => setShowChangeModal(false)}
        onSubmit={handleChangeEmailPhone}
        currentEmail={user?.email || ""}
        currentPhone={user?.phone || ""}
      />
    </div>
  );
}
