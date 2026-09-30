import React from "react";

export interface ProfileFormData {
  image: string;
  name: string;
  email: string;
  phone: string;
  address: string;

  // Student specific fields
  level: string;
  batch: string;
  board: string;
  institution: string;

  // Teacher specific fields
  subject: string;
  designation: string;

  // Admin specific fields
  adminTier: string;
  adminDept: string;
  adminBase: string;
}

export interface RoleBadgeConfig {
  icon: React.ReactNode;
  label: string;
  color: string;
  code: string;
}
