variable "gcp_region" {
  type        = string
}

variable "cloudrun_sa_email" {
  type        = string
}

variable "instance_connection_name" {
  type        = string
}

variable "db_user_secret" {
  type        = string
}

variable "db_password_secret" {
  type        = string
}

variable "db_name_secret" {
  type        = string
}

variable "secretmanager_api_dependency" {
  type        = any
}

variable "cloudrun_api_dependency" {
  type        = any
}

variable "sqladmin_api_dependency" {
  type        = any
}

variable "compute_api_dependency" {
  type        = any
} 