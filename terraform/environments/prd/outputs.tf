output "load_balancer_ip_address" {
  description = "グローバル外部HTTPSロードバランサーのパブリックIPアドレス"
  value       = module.load_balancer.load_balancer_ip_address
}
