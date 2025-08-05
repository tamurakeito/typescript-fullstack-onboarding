terraform { 
  required_providers { 
    google = { 
      source = "hashicorp/google" 
      version = "6.8.0" 
    } 
  } 
}

provider "google" { 
  project = var.project_id
  region  = var.gcp_region
}

data "google_project" "project" {}

/* API */
resource "google_project_service" "compute_api" {
  service            = "compute.googleapis.com"
  disable_on_destroy = false
}
resource "google_project_service" "vpcaccess_api" {
  service            = "vpcaccess.googleapis.com"
  disable_on_destroy = false
}
resource "google_project_service" "secretmanager_api" {
  service            = "secretmanager.googleapis.com"
  disable_on_destroy = false
}
resource "google_project_service" "servicenetworking_api" {
  service            = "servicenetworking.googleapis.com"
  disable_on_destroy = false
}
resource "google_project_service" "storage_api" {
  service            = "storage.googleapis.com"
  disable_on_destroy = false
}
resource "google_project_service" "sqladmin_api" {
  service            = "sqladmin.googleapis.com"
  disable_on_destroy = false
}
resource "google_project_service" "cloudrun_api" {
  service            = "run.googleapis.com"
  disable_on_destroy = false
}
resource "google_project_service" "certificatemanager_api" {
  service            = "certificatemanager.googleapis.com"
  disable_on_destroy = false
}

/* Cloud SQL Module */
resource "random_password" "pwd" {
  length  = 16
  special = true
}
module "cloud_sql" {
  source = "../../modules/cloud_sql"
  
  gcp_project   = var.project_id
  gcp_region    = var.gcp_region
  root_password = random_password.pwd.result
  sqladmin_api_dependency = google_project_service.sqladmin_api
}

/* Cloud Run Module */
resource "google_service_account" "cloudrun_sa" {
  account_id   = "cloudrun-sa"
  display_name = "Cloud Run用サービスアカウント"
}
resource "google_project_iam_member" "cloudrun_sa_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = google_service_account.cloudrun_sa.member
}

resource "google_secret_manager_secret" "dbuser" {
  secret_id = "dbusersecret"
  replication {
    auto {}
  }
  depends_on = [google_project_service.secretmanager_api]
}
resource "google_secret_manager_secret_version" "dbuser_data" {
  secret      = google_secret_manager_secret.dbuser.id
  secret_data = var.db_user_secret_value
}
resource "google_secret_manager_secret_iam_member" "secretaccess_compute_dbuser" {
  secret_id = google_secret_manager_secret.dbuser.id
  role      = "roles/secretmanager.secretAccessor"
  member    = google_service_account.cloudrun_sa.member
}

resource "google_secret_manager_secret" "dbpass" {
  secret_id = "dbpasssecret"
  replication {
    auto {}
  }
  depends_on = [google_project_service.secretmanager_api]
}
resource "google_secret_manager_secret_version" "dbpass_data" {
  secret      = google_secret_manager_secret.dbpass.id
  secret_data = random_password.pwd.result
}
resource "google_secret_manager_secret_iam_member" "secretaccess_compute_dbpass" {
  secret_id = google_secret_manager_secret.dbpass.id
  role      = "roles/secretmanager.secretAccessor"
  member    = google_service_account.cloudrun_sa.member
}

resource "google_secret_manager_secret" "dbname" {
  secret_id = "dbnamesecret"
  replication {
    auto {}
  }
  depends_on = [google_project_service.secretmanager_api]
}
resource "google_secret_manager_secret_version" "dbname_data" {
  secret      = google_secret_manager_secret.dbname.id
  secret_data = var.db_name_secret_value
}
resource "google_secret_manager_secret_iam_member" "secretaccess_compute_dbname" {
  secret_id = google_secret_manager_secret.dbname.id
  role      = "roles/secretmanager.secretAccessor"
  member    = google_service_account.cloudrun_sa.member
}
module "cloud_run" {
  source = "../../modules/cloud_run"
  
  gcp_region = var.gcp_region
  cloudrun_sa_email = google_service_account.cloudrun_sa.email
  instance_connection_name = module.cloud_sql.instance_connection_name
  db_user_secret = google_secret_manager_secret.dbuser.secret_id
  db_password_secret = google_secret_manager_secret.dbpass.secret_id
  db_name_secret = google_secret_manager_secret.dbname.secret_id
  secretmanager_api_dependency = google_project_service.secretmanager_api
  cloudrun_api_dependency = google_project_service.cloudrun_api
  sqladmin_api_dependency = google_project_service.sqladmin_api
  compute_api_dependency = google_project_service.compute_api
}

/* Cloud Storage Module */
module "cloud_storage" {
  source = "../../modules/cloud_storage"
  
  gcp_region = var.gcp_region
  storage_api_dependency = google_project_service.storage_api
}

/* Load Balancer Module */
module "load_balancer" {
  source = "../../modules/load-balancer"
  
  domain_name = var.domain_name
  gcp_region = var.gcp_region
  cloudrun_service_name = module.cloud_run.cloudrun_service_name
  bucket_name = module.cloud_storage.bucket_name
  compute_api_dependency = google_project_service.compute_api
  certificatemanager_api_dependency = google_project_service.certificatemanager_api
  cloudrun_service_dependency = module.cloud_run.cloudrun_service
}

