variable "project_id" {
  type        = string
}
variable "project_number" {
  type        = string
}
variable "gcp_region" {
  type        = string
}
variable "github_token" {
  type        = string
  sensitive   = true
}
variable "app_installation_id" {
  type        = string
}
variable "repo_name" {
  type        = string
}
variable "repo_uri" {
  type        = string
}
variable "branch_name" {
  type        = string
}
variable "substitutions" {
  type        = map(string)
}
variable "cloudbuild_v2_api_dependency" {
  type        = any
}
variable "cloud_storage_dependency" {
  type        = any
}
variable "cloudbuild_service_account" {
  type        = any
}
variable "static_website_bucket" {
  type        = any
}
