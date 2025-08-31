import { useState } from "react";
import FormCard from "../../components/common/FormCard";
import RegisterForm from "../../components/form/RegisterForm";
import authService from "../../services/authService";

const Register = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [otp, setOtp] = useState("");

  const handleRegister = (formData) => {
    authService
      .register(formData)
      .then((response) => {
        setEmail(response.data.email);
        setIsRegistered(true);
        setMessage(
          response.data.message || "Registration successful, please verify OTP"
        );
      })
      .catch((error) => {
        console.error("Registration failed:", error);
        setMessage(error.response?.data?.message || "Registration failed");
      });
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    authService
      .verifyOTP(email, otp)
      .then((response) => {
        setMessage(response.data.message || "OTP verified successfully");
      })
      .catch((error) => {
        console.error("OTP verification failed:", error);
        setMessage(error.response?.data?.message || "Invalid OTP");
      });
  };

  return (
    <FormCard title={isRegistered ? "Verify OTP" : "Register"}>
      {isRegistered ? (
        <div>
          <p>{message}</p>
          <p>OTP sent to: {email}</p>
          <form onSubmit={handleVerifyOtp}>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              required
            />
            <button type="submit">Verify OTP</button>
          </form>
        </div>
      ) : (
        <RegisterForm onSubmit={handleRegister} />
      )}
    </FormCard>
  );
};

export default Register;
