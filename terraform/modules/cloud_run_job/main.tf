resource "google_project_iam_member" "sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${var.cloud_run_job_service_account.email}"
}

resource "google_cloud_run_v2_job" "migration_job" {
  name     = "migration-job"
  location = var.gcp_region
  deletion_protection = false

  template {
    template {
      service_account = var.cloud_run_job_service_account.email

      containers {
        # ダミーのイメージ
        image = "us-docker.pkg.dev/cloudrun/container/job:latest"

        env {
          name  = "DATABASE_URL"
          value = var.database_url
        }

        volume_mounts {
          name       = "cloudsql"
          mount_path = "/cloudsql"
        }
      }

      volumes {
        name = "cloudsql"
        cloud_sql_instance {
          instances = [var.cloud_sql_instance_connection_name]
        }
      }
    }
  }
}