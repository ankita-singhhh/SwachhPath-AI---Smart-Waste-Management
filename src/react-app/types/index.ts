export interface Dustbin {
  id: string;
  location: string;
  fillLevel: number;
  lastUpdate?: Date;
  priority?: "Normal" | "Medium" | "Critical";
  alerted?: boolean;
  temperatureC?: number;
  humidityPercent?: number;
}

export interface Postcode {
  pin: string;
  area: string;
  dustbins: Dustbin[];
}

export interface PostcodesData {
  postcodes: Postcode[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  pin?: string;
}

export interface UsersData {
  users: User[];
}

export interface Complaint {
  id: number;
  user: string;
  pin: string;
  area: string;
  issue: string;
  status: "Pending" | "In Progress" | "Resolved";
  createdAt?: string;
}

export interface ComplaintsData {
  complaints: Complaint[];
}

export type FillStatus = "low" | "medium" | "high";

export function getFillStatus(fillLevel: number): FillStatus {
  if (fillLevel <= 40) return "low";
  if (fillLevel <= 80) return "medium";
  return "high";
}

export function getStatusColor(status: FillStatus): string {
  switch (status) {
    case "low":
      return "text-green-400";
    case "medium":
      return "text-yellow-400";
    case "high":
      return "text-red-400";
  }
}

export function getStatusBgColor(status: FillStatus): string {
  switch (status) {
    case "low":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "medium":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "high":
      return "bg-red-500/20 text-red-400 border-red-500/30";
  }
}

export function getProgressColor(status: FillStatus): string {
  switch (status) {
    case "low":
      return "bg-green-500";
    case "medium":
      return "bg-yellow-500";
    case "high":
      return "bg-red-500";
  }
}
