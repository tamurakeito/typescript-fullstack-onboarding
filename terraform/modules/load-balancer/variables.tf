variable "domain_name" {
  type        = string
}

variable "gcp_region" {
  type        = string
}

variable "cloudrun_service_name" {
  type        = string
}

variable "bucket_name" {
  type        = string
}
variable "compute_api_dependency" {
  type        = any
}

variable "certificatemanager_api_dependency" {
  type        = any
}

variable "cloudrun_service_dependency" {
  type        = any
} 