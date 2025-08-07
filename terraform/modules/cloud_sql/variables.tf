variable "gcp_project" {
  type        = string
}

variable "gcp_region" {
  type        = string
}

variable "root_password" {
  type        = string
}

variable "db_name" {
  type        = string
}

variable "db_migration_user" {
  type        = string
}

variable "db_migration_password" {
  type        = string
}

variable "db_app_user" {
  type        = string
}

variable "db_app_password" {
  type        = string
}

variable "sqladmin_api_dependency" {
  type        = any
}