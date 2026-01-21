import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "@/api/client";
import { store } from "@/utils";
import { useUserStore } from "@/store/userStore";

// Components
import FormInput from "@/components/FormInput";
import FormButton from "@/components/FormButton";
import ErrorMessage from "@/components/ErrorMessage";
import {
  MdAccountCircle,
  MdMedicalServices,
  MdLocalPharmacy,
  MdDirectionsBike,
} from "react-icons/md";
import { FaRegUser } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { FiPhoneCall } from "react-icons/fi";
import { SlLockOpen } from "react-icons/sl";
import logo from "@/assets/images/klinic_logo.jpeg";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Field-specific validation errors
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

  // Validation functions
  const validateName = (value: string) => {
    if (value.trim().length < 3) {
      setNameError("Name must be at least 3 characters");
      return false;
    }
    setNameError("");
    return true;
  };

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePhone = (value: string) => {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(value)) {
      setPhoneError("Phone number must be 10 digits");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const validatePassword = (value: string) => {
    if (value.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return false;
    }

    // Check for at least one uppercase letter, one lowercase letter, and one number
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      setPasswordError(
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      );
      return false;
    }

    setPasswordError("");
    return true;
  };

  const validateConfirmPassword = (value: string) => {
    if (value !== password) {
      setConfirmPasswordError("Passwords do not match");
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };

  // Handle text change with validation
  const handleNameChange = (text: string) => {
    setName(text);
    if (nameError) validateName(text);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) validateEmail(text);
  };

  const handlePhoneChange = (text: string) => {
    // Only allow digits
    const digitsOnly = text.replace(/\D/g, "");
    setPhone(digitsOnly);
    if (phoneError) validatePhone(digitsOnly);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) validatePassword(text);
    if (confirmPassword) validateConfirmPassword(confirmPassword);
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (confirmPasswordError) validateConfirmPassword(text);
  };

  const handleRegister = async () => {
    // Validate all fields
    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPhoneValid = validatePhone(phone);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (
      !isNameValid ||
      !isEmailValid ||
      !isPhoneValid ||
      !isPasswordValid ||
      !isConfirmPasswordValid
    ) {
      setError("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiClient.post("/api/v1/register", {
        name,
        email,
        phone,
        password,
        role,
      });

      // Store token and set user data
      await store.set("token", response.data.token);
      setUser(response.data.user);

      // Navigate to verification page
      if (response.data.user) {
        navigate("/verify");
      } else {
        alert("Some went Wrong");
      }
    } catch (error: any) {
      console.error("Registration failed:", error);

      // Handle suspension errors specifically
      if (
        error.response?.status === 403 &&
        error.response?.data?.message?.includes("suspended")
      ) {
        const suspensionData = error.response.data;
        let suspensionMessage = "Registration failed: ";

        if (error.response.data.message.includes("email")) {
          suspensionMessage += "This email address has been suspended.";
        } else if (error.response.data.message.includes("phone")) {
          suspensionMessage += "This phone number has been suspended.";
        } else {
          suspensionMessage += "This account has been suspended.";
        }

        if (suspensionData.reason) {
          suspensionMessage += `\nReason: ${suspensionData.reason}`;
        }

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

        suspensionMessage += "\n\nPlease contact support for assistance.";
        setError(suspensionMessage);
      } else {
        setError(
          error.response?.data?.message ||
            "Registration failed. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const RoleBox = ({
    title,
    value,
    icon,
  }: {
    title: string;
    value: string;
    icon: React.ReactNode;
  }) => {
    const isSelected = role === value;
    return (
      <button
        onClick={() => setRole(value)}
        className={`flex-1 p-3 rounded-lg border-2 flex flex-col items-center justify-center  transition-all cursor-pointer ${
          isSelected
            ? "bg-blue-50 border-primary"
            : "bg-transparent border-gray-300 hover:border-gray-400"
        }`}
        type="button"
        style={{
          backgroundColor: isSelected
            ? "rgba(79, 70, 229, 0.1)"
            : "transparent",
          borderColor: isSelected ? "#4F46E5" : "#E5E7EB",
        }}
      >
        <div
          className="mb-1"
          style={{
            color: isSelected ? "#4F46E5" : "#6B7280",
            fontSize: "24px",
          }}
        >
          {icon}
        </div>
        <div
          className="text-xs mt-1 text-center"
          style={{
            color: isSelected ? "#4F46E5" : "#6B7280",
            fontWeight: isSelected ? "bold" : "normal",
          }}
        >
          {title}
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center flex-col lg:p-5 p-3  relative overflow-hidden bg-[#f4f5fa]"> 

      <div className=" bg-white max-w-lg w-full sm:p-8 p-4 rounded-xl z-10 ">
        <div className="text-center mb-7">
          <img src={logo} alt="logo" className="w-30 h-auto mx-auto -my-3" />
          <h2 className="lg:text-xl text-lg font-medium text-black mt-4 font-poppins">
            Get Started with <span className="text-[#5570f1]">Klinic</span>
          </h2>

          <p className="text-[#8B8D97] font-inter text-sm">
            Create your free account
          </p>
        </div>

        <ErrorMessage message={error} />

        <FormInput
          label="Full Name"
          value={name}
          onChangeText={handleNameChange}
          placeholder="John A. Smith"
          icon={<FaRegUser />}
          error={nameError}
        />

        <FormInput
          label="Email"
          value={email}
          onChangeText={handleEmailChange}
          placeholder="john.smith@example.com"
          icon={<HiOutlineMail />}
          type="email"
          autoComplete="email"
          error={emailError}
        />

        <FormInput
          label="Phone"
          value={phone}
          onChangeText={handlePhoneChange}
          placeholder="+1 555 123 4567"
          icon={<FiPhoneCall />}
          type="tel"
          error={phoneError}
        />

        <div className="mb-4">
          <div className="text-lg mb-1 font-medium">Choose Your Role</div>
          <div className="flex gap-2">
            <RoleBox title="User" value="user" icon={<MdAccountCircle />} />
            <RoleBox
              title="Doctor"
              value="doctor"
              icon={<MdMedicalServices />}
            />
            <RoleBox
              title="Laboratory"
              value="laboratory"
              icon={<MdLocalPharmacy />}
            />
            <RoleBox
              title="Delivery"
              value="deliverypartner"
              icon={<MdDirectionsBike />}
            />
          </div>
        </div>

        <FormInput
          label="Password"
          value={password}
          onChangeText={handlePasswordChange}
          placeholder="At least 8 characters"
          icon={<SlLockOpen />}
          type={showPassword ? "text" : "password"}
          showPassword={showPassword}
          togglePassword={togglePassword}
          secureTextEntry={true}
          error={passwordError}
        />

        <FormInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
          placeholder="Re-enter your password"
          icon={<SlLockOpen />}
          type={showConfirmPassword ? "text" : "password"}
          showPassword={showConfirmPassword}
          secureTextEntry={true}
          togglePassword={toggleConfirmPassword}
          error={confirmPasswordError}
        />

        <h3 className="text-center lg:my-9 my-6 text-[#8B8D97] font-sm font-inter font-normal">
          Already have an account?
          <Link
            to="/login"
            className="text-[#5570f1] duration-200 hover:underline ml-1"
          >
            Login
          </Link>
        </h3>

        <div className="flex items-center justify-center">
          <FormButton
            title="Register"
            onClick={handleRegister}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
