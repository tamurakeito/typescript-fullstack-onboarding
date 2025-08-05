variable "bucket_name_suffix" {
  type        = string
  default     = "static-website-bucket"
}

variable "gcp_region" {
  type        = string
}

variable "storage_api_dependency" {
  type        = any
} 