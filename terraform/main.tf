terraform { 
  required_providers { 
    google = { 
      source = "hashicorp/google" 
      version = "6.8.0" 
    } 
  } 
}

variable "gcp_region" {
  type        = string
  default     = "us-central1"
}
variable "domain_name" {
  type        = string
  default     = "atodesettei.com"
}

provider "google" { 
  project = "typescript-fullstack-onboard"
  region  = var.gcp_region
}

data "google_project" "project" {}

resource "google_project_service" "vpcaccess_api" {
  service            = "vpcaccess.googleapis.com"
  disable_on_destroy = false
}
resource "google_project_service" "secretmanager_api" {
  service            = "secretmanager.googleapis.com"
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

/* VPC */
resource "google_compute_network" "peering_network" {
  name                    = "private-network"
  auto_create_subnetworks = "false"
}

resource "google_compute_global_address" "private_ip_address" {
  name          = "private-ip-address"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.peering_network.id
}

resource "google_service_networking_connection" "default" {
  network                 = google_compute_network.peering_network.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
}

/* Cloud SQL */
resource "google_sql_database_instance" "postgres_instance" {
  name             = "private-ip-sql-instance"
  database_version = "POSTGRES_14"
  depends_on = [google_service_networking_connection.default]
  settings {
    tier = "db-custom-2-7680"
    ip_configuration {
      ipv4_enabled    = "false"
      private_network = google_compute_network.peering_network.id
    }
  }
}

/* Cloud Run */
resource "google_secret_manager_secret" "dbuser" {
  secret_id = "dbusersecret"
  replication {
    auto {}
  }
  depends_on = [google_project_service.secretmanager_api]
}
resource "google_secret_manager_secret_version" "dbuser_data" {
  secret      = google_secret_manager_secret.dbuser.id
  secret_data = "org_todo_user"
}
resource "google_secret_manager_secret_iam_member" "secretaccess_compute_dbuser" {
  secret_id = google_secret_manager_secret.dbuser.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
}

resource "google_secret_manager_secret" "dbpass" {
  secret_id = "dbpasssecret"
  replication {
    auto {}
  }
  depends_on = [google_project_service.secretmanager_api]
}
resource "google_secret_manager_secret_iam_member" "secretaccess_compute_dbpass" {
  secret_id = google_secret_manager_secret.dbpass.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
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
  secret_data = "org_todo_db"
}
resource "google_secret_manager_secret_iam_member" "secretaccess_compute_dbname" {
  secret_id = google_secret_manager_secret.dbname.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
}

resource "google_vpc_access_connector" "connector" {
  name          = "vpc-connector"
  region        = var.gcp_region
  network       = google_compute_network.peering_network.name
  ip_cidr_range = "10.8.0.0/28"
  depends_on    = [google_project_service.vpcaccess_api]
}

resource "google_cloud_run_v2_service" "default" {
  name     = "cloudrun-service"
  location = var.gcp_region

  deletion_protection = false

  template {
    containers {
      image = "us-docker.pkg.dev/cloudrun/container/hello:latest"
      
      env {
        name  = "INSTANCE_CONNECTION_NAME"
        value = google_sql_database_instance.default.connection_name
      }
      env {
        name = "DB_USER"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.dbuser.secret_id 
            version = "latest"                                      
          }
        }
      }
      env {
        name = "DB_PASS"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.dbpass.secret_id 
            version = "latest"                                      
          }
        }
      }
      env {
        name = "DB_NAME"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.dbname.secret_id 
            version = "latest"                                      
          }
        }
      }
      
      volume_mounts {
        name       = "cloudsql"
        mount_path = "/cloudsql"
      }
    }
    volumes {
      name = "cloudsql"
      cloud_sql_instance {
        instances = [google_sql_database_instance.default.connection_name]
      }
    }
    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "ALL_TRAFFIC"
    }
  }
  client     = "terraform"
  depends_on = [google_project_service.secretmanager_api, google_project_service.cloudrun_api, google_project_service.sqladmin_api]
}

/* Cloud Storage */
resource "random_id" "bucket_prefix" {
  byte_length = 8
}

resource "google_storage_bucket" "static_website" {
  name                          = "${random_id.bucket_prefix.hex}-static-website-bucket"
  location                      = "US"
  uniform_bucket_level_access = true
  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html"
  }
}

resource "google_storage_bucket_iam_member" "public_rule" {
  bucket = google_storage_bucket.static_website.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

/* Load Balancer */
resource "google_compute_global_address" "default" {
  name = "lb-static-ip"
}
resource "google_certificate_manager_certificate" "default" {
  name = "managed-cert"
  managed {
    domains = [var.domain_name]
  }
}