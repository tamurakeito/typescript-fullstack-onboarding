variable "project_id" {
  type = string
}

variable "gcp_region" {
  type = string
}

variable "cloud_run_job_service_account" {
  type = any
}

variable "db_name" {
  type = string
}

variable "db_migration_user" {
  type = string
}

variable "db_migration_password" {
  type = string
}

variable "database_url" {
  type = string
}

variable "cloud_sql_instance_connection_name" {
  type = string
}