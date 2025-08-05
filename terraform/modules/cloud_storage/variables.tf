variable "bucket_name_suffix" {
  type        = string
  default     = "static-website-bucket"
}

variable "gcp_region" {
  description = "GCPリージョン"
  type        = string
}

variable "storage_api_dependency" {
  type        = any
} 