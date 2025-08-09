resource "google_secret_manager_secret" "github_token_secret" {
    project =  var.project_id
    secret_id = "github-token-secret"

    replication {
        auto {}
    }
}

resource "google_secret_manager_secret_version" "github_token_secret_version" {
    secret = google_secret_manager_secret.github_token_secret.id
    secret_data = var.github_token
}

data "google_iam_policy" "serviceagent_secretAccessor" {
    binding {
        role = "roles/secretmanager.secretAccessor"
        members = ["serviceAccount:service-${var.project_number}@gcp-sa-cloudbuild.iam.gserviceaccount.com"]
    }
}

resource "google_secret_manager_secret_iam_policy" "policy" {
  project = google_secret_manager_secret.github_token_secret.project
  secret_id = google_secret_manager_secret.github_token_secret.secret_id
  policy_data = data.google_iam_policy.serviceagent_secretAccessor.policy_data
}

resource "google_cloudbuildv2_connection" "my_connection" {
    project = var.project_id
    location = var.gcp_region
    name = "my-github-connection"

    github_config {
        app_installation_id = var.app_installation_id
        authorizer_credential {
            oauth_token_secret_version = google_secret_manager_secret_version.github_token_secret_version.id
        }
    }
    depends_on = [
      var.cloudbuild_v2_api_dependency,
      google_secret_manager_secret_iam_policy.policy
    ]
}

resource "google_cloudbuildv2_repository" "my_repository" {
  name       = "typescript-fullstack-onboarding"
  location   = var.gcp_region
  parent_connection = google_cloudbuildv2_connection.my_connection.name
  remote_uri = "https://github.com/tamurakeito/typescript-fullstack-onboarding.git"
}

resource "google_project_iam_member" "act_as" {
  project = var.project_id
  role    = "roles/iam.serviceAccountUser"
  member  = "serviceAccount:${var.cloudbuild_service_account.email}"
}
resource "google_project_iam_member" "logs_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${var.cloudbuild_service_account.email}"
}
resource "google_project_iam_member" "sql_admin" {
  project = var.project_id
  role    = "roles/cloudsql.admin"
  member  = "serviceAccount:${var.cloudbuild_service_account.email}"
}
resource "google_project_iam_member" "storage_admin" {
  project = var.project_id
  role    = "roles/storage.admin"
  member  = "serviceAccount:${var.cloudbuild_service_account.email}"
}
resource "google_project_iam_member" "cloudbuild_artifact_registry_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${var.cloudbuild_service_account.email}"
}
resource "google_project_iam_member" "cloudbuild_run_developer" {
  project = var.project_id
  role    = "roles/run.developer"
  member  = "serviceAccount:${var.cloudbuild_service_account.email}"
}

resource "google_cloudbuild_trigger" "trigger-migration" {
  name = "trigger-migration"
  location = var.gcp_region

  repository_event_config {
    repository = google_cloudbuildv2_repository.my_repository.id
    push {
      branch = "deploy"
    }
  }

  filename = "cloudbuild-migration.yaml"
  service_account = var.cloudbuild_service_account.id

  substitutions = {
    _BUCKET_NAME = var.substitutions["_BUCKET_NAME"]
  }
  depends_on = [
    var.cloud_storage_dependency,
    var.cloudbuild_v2_api_dependency,
    var.cloudbuild_service_account,
    google_project_iam_member.act_as,
    google_project_iam_member.logs_writer,
    google_project_iam_member.storage_admin,
    google_project_iam_member.cloudbuild_artifact_registry_writer,
    google_project_iam_member.cloudbuild_run_developer
  ]
}

resource "google_cloudbuild_trigger" "trigger-backend" {
  name = "trigger-backend"
  location = var.gcp_region

  repository_event_config {
    repository = google_cloudbuildv2_repository.my_repository.id
    push {
      branch = "deploy"
    }
  }

  filename = "cloudbuild-backend.yaml"
  service_account = var.cloudbuild_service_account.id

  substitutions = {
    _BUCKET_NAME = var.substitutions["_BUCKET_NAME"]
  }
  depends_on = [
    var.cloud_storage_dependency,
    var.cloudbuild_v2_api_dependency,
    var.cloudbuild_service_account,
    google_project_iam_member.act_as,
    google_project_iam_member.logs_writer,
    google_project_iam_member.storage_admin,
    google_project_iam_member.cloudbuild_artifact_registry_writer,
    google_project_iam_member.cloudbuild_run_developer
  ]
}

resource "google_cloudbuild_trigger" "trigger-frontend" {
  name = "trigger-frontend"
  location = var.gcp_region

  repository_event_config {
    repository = google_cloudbuildv2_repository.my_repository.id
    push {
      branch = "deploy"
    }
  }

  filename = "cloudbuild-frontend.yaml"
  service_account = var.cloudbuild_service_account.id

  substitutions = {
    _BUCKET_NAME = var.substitutions["_BUCKET_NAME"]
  }
  depends_on = [
    var.cloud_storage_dependency,
    var.cloudbuild_v2_api_dependency,
    var.cloudbuild_service_account,
    google_project_iam_member.act_as,
    google_project_iam_member.logs_writer,
    google_project_iam_member.storage_admin,
    google_project_iam_member.cloudbuild_artifact_registry_writer,
    google_project_iam_member.cloudbuild_run_developer
  ]
}
