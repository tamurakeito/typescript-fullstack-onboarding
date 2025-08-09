resource "google_cloud_run_v2_service" "default" {
  name     = "cloudrun-service"
  location = var.gcp_region

  deletion_protection = false

  template {

    service_account = var.cloudrun_sa_email

    containers {
      image = "us-docker.pkg.dev/cloudrun/container/hello:latest"
      
      env {
        name  = "INSTANCE_CONNECTION_NAME"
        value = var.instance_connection_name
      }
      env {
        name = "DB_USER"
        value_source {
          secret_key_ref {
            secret  = var.db_user_secret
            version = "latest"                                      
          }
        }
      }
      env {
        name = "DB_PASS"
        value_source {
          secret_key_ref {
            secret  = var.db_password_secret
            version = "latest"                                      
          }
        }
      }
      env {
        name = "DB_NAME"
        value_source {
          secret_key_ref {
            secret  = var.db_name_secret
            version = "latest"                                      
          }
        }
      }
      env {
        name = "JWT_SECRET"
        value_source {
          secret_key_ref {
            secret  = var.jwt_secret
            version = "latest"                                      
          }
        }
      }
      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = var.database_url_secret
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
        instances = [var.instance_connection_name]
      }
    }
  }
  client     = "terraform"
  depends_on = [
    var.secretmanager_api_dependency,
    var.cloudrun_api_dependency,
    var.sqladmin_api_dependency,
    var.compute_api_dependency
  ]
}