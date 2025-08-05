variable "project_id" {
  type        = string
  default     = "typescript-fullstack-onboard"
  description = "GCPプロジェクトID"
}

variable "gcp_region" {
  type        = string
  default     = "us-central1"
  description = "GCPリージョン"
}

variable "domain_name" {
  type        = string
  default     = "sandbox.keiyousya.com"
  description = "ドメイン名"
}

variable "db_user_secret_value" {
  type        = string
  default     = "db-user"
  description = "データベースユーザーシークレットの値"
  sensitive   = true
}

variable "db_name_secret_value" {
  type        = string
  default     = "db-name"
  description = "データベース名シークレットの値"
  sensitive   = true
}