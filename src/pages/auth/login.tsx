import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "@/api/client";
import { store } from "@/utils";
import { useUserStore } from "@/store/userStore";

// Components
import FormInput from "@/components/FormInput";
import FormButton from "@/components/FormButton";
import ErrorMessage from "@/components/ErrorMessage";
import logo from "@/assets/images/klinic_logo.jpeg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const navigate = useNavigate();
  const { user, setUser } = useUserStore();
  const token = localStorage.getItem("token");

  const togglePassword = () => setShowPassword(!showPassword);

  useEffect(() => {
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  // Validation
  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (value: string) => {
    if (value.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) validateEmail(text);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) validatePassword(text);
  };

  const handleLogin = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      setError("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiClient.post("/api/v1/login", {
        email,
        password,
      });

      await store.set("token", response.data.token);
      localStorage.setItem("token", response.data.token);
      setUser(response.data.user);

      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      console.error("Login failed:", err);

      if (
        err.response?.status === 403 &&
        err.response?.data?.message?.includes("suspended")
      ) {
        const suspensionData = err.response.data;
        let suspensionMessage = "Your account has been suspended.";
        if (suspensionData.reason)
          suspensionMessage += `\nReason: ${suspensionData.reason}`;
        if (suspensionData.suspendedAt) {
          const suspendedDate = new Date(
            suspensionData.suspendedAt,
          ).toLocaleDateString();
          suspensionMessage += `\nSuspended on: ${suspendedDate}`;
        }
        if (suspensionData.expiresAt) {
          const expiryDate = new Date(
            suspensionData.expiresAt,
          ).toLocaleDateString();
          suspensionMessage += `\nSuspension expires: ${expiryDate}`;
        } else {
          suspensionMessage += "\nThis is a permanent suspension.";
        }
        suspensionMessage += "\n\nPlease contact support.";
        setError(suspensionMessage);
      } else {
        setError(
          err.response?.data?.message || "Login failed. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center flex-col lg:p-5 p-3  relative overflow-hidden bg-[#f4f5fa]">
      <div className=" bg-white max-w-lg w-full sm:p-8 p-4 rounded-xl z-10 ">
        <div className="text-center mb-7">
          <img src={logo} alt="logo" className="w-30 h-auto mx-auto -my-3" />
          <h2 className="lg:text-xl text-lg font-medium text-black mt-4 font-poppins">
            Welcome Back
          </h2>

          <p className="text-[#8B8D97] font-inter text-sm">
            Login to your account
          </p>
        </div>

        <ErrorMessage message={error} />

        <FormInput
          label="Email"
          value={email}
          onChangeText={handleEmailChange}
          placeholder="john.smith@example.com"
          iconName="email-outline"
          type="email"
          error={emailError}
        />

        <FormInput
          label="Password"
          value={password}
          onChangeText={handlePasswordChange}
          placeholder="At least 8 characters"
          iconName="lock-outline"
          type={showPassword ? "text" : "password"}
          showPassword={showPassword}
          secureTextEntry={true}
          togglePassword={togglePassword}
          error={passwordError}
        />

        <h3 className="text-center lg:my-9 my-6 text-[#8B8D97] font-sm font-inter font-normal">
          Don’t have an account?
          <Link
            to={"/register"}
            className="text-[#5570f1] duration-200 hover:underline ml-1"
          >
            Sign Up
          </Link>
        </h3>

        <div className="flex items-center justify-center">
          <FormButton title="Login" onClick={handleLogin} loading={loading} />
        </div>
      </div>
    </div>
  );
}