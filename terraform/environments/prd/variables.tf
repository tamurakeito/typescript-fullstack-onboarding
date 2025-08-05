variable "project_id" {
  type        = string
  default     = "typescript-fullstack-onboard"
}

variable "gcp_region" {
  type        = string
  default     = "us-central1"
}

variable "domain_name" {
  type        = string
  default     = "sandbox.keiyousya.com"
}

variable "db_user_secret_value" {
  type        = string
  default     = "db-user"
  sensitive   = true
}

variable "db_name_secret_value" {
  type        = string
  default     = "db-name"
  sensitive   = true
}