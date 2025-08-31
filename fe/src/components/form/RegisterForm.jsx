// src/components/auth/RegisterForm.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import InputField from "../common/InputField";
import Button from "../common/Button";

const RegisterForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phone) newErrors.phone = "phone is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <InputField
        label="Name"
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Enter your name"
        error={errors.name}
      />
      <InputField
        label="Phone"
        type="phone"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="Enter your phone"
        error={errors.phone}
      />
      <InputField
        label="Address"
        type="address"
        name="address"
        value={formData.address}
        onChange={handleChange}
        placeholder="Enter your address"
        error={errors.address}
      />
      <InputField
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Enter your email"
        error={errors.email}
      />
      <InputField
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Enter your password"
        error={errors.password}
      />
      <InputField
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="Confirm your password"
        error={errors.confirmPassword}
      />
      <Button type="submit" variant="primary" loading={false}>
        Register
      </Button>
      <div className="text-center mt-3">
        <Link to="/login">Already have an account? Login</Link>
      </div>
    </form>
  );
};

export default RegisterForm;
