variable "project_id" {
  type        = string
  default     = "typescript-fullstack-onboard"
}

variable "project_number" {
  type        = string
  default     = "998684226932"
}

variable "gcp_region" {
  type        = string
  default     = "us-central1"
}

variable "domain_name" {
  type        = string
  default     = "sandbox.keiyousya.com"
}

variable "db_name" {
  type        = string
  default     = "db-name"
  sensitive   = true
}

variable "db_migration_user" {
  type        = string
}

variable "db_app_user" {
  type        = string
}

variable "vite_api_base_url" {
  type        = string
  default     = "https://sandbox.keiyousya.com/api"
}

variable "app_installation_id" {
  type        = string
  default     = "78662661"
}

variable "github_token" {
  type        = string
  sensitive   = true
}