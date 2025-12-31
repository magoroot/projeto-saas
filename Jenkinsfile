pipeline {
  agent any

  environment {
    // Infra (VM Docker remota)
    DOCKER_HOST_VM = "172.16.30.56"
    DOCKER_HOST_USER = "ubuntu"

    // Repo alvo na VM (caminho)
    REMOTE_DIR = "~/projeto-saas"

    // Docker Hub
    DOCKERHUB_USER = "magoroot"
    API_IMAGE_REPO = "${DOCKERHUB_USER}/projeto-saas-api"
    WEB_IMAGE_REPO = "${DOCKERHUB_USER}/projeto-saas-web"

    // Kubernetes
    K8S_NAMESPACE = "saas-operator"

    // Referência (se você ainda usa NodePort em algum cenário)
    WEB_NODEPORT = "30080"
    API_NODEPORT = "30081"
  }

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Preflight - Docker Host') {
      steps {
        sshagent(['ssh-homelab-docker']) {
          sh """
            set -e
            ssh -o StrictHostKeyChecking=no ${DOCKER_HOST_USER}@${DOCKER_HOST_VM} "
              set -e
              echo 'REMOTE HOST:' \\$(hostname)
              docker ps >/dev/null
              echo 'OK: docker acessível'
            "
          """
        }
      }
    }

    stage('Remote: Docker Build & Push (API + WEB)') {
      steps {
        sshagent(credentials: ['ssh-homelab-docker']) {
          withCredentials([
            usernamePassword(
              credentialsId: 'dockerhub-credentials',
              usernameVariable: 'DU',
              passwordVariable: 'DP'
            )
          ]) {

            sh """
              set -e
              echo "🐳 Build/Push Docker na VM remota (API + WEB)"

              ssh -tt -o StrictHostKeyChecking=no ${DOCKER_HOST_USER}@${DOCKER_HOST_VM} '
                set -e
                echo "VM Docker: \\$(hostname)"

                # Repo na VM
                mkdir -p ${REMOTE_DIR}
                if [ ! -d "${REMOTE_DIR}/.git" ]; then
                  echo "Clonando repo..."
                  rm -rf ${REMOTE_DIR}
                  git clone ${env.GIT_URL ?: "https://github.com/magoroot/projeto-saas.git"} ${REMOTE_DIR}
                fi

                cd ${REMOTE_DIR}
                git fetch --all
                git reset --hard origin/${env.BRANCH_NAME ?: "main"} || git reset --hard origin/master

                # valida dockerfiles
                test -f docker/api/Dockerfile || { echo "ERRO: docker/api/Dockerfile não encontrado"; exit 1; }
                test -f docker/web/Dockerfile || { echo "ERRO: docker/web/Dockerfile não encontrado"; exit 1; }

                # 🔑 credenciais DockerHub
                export DU="${DU}"
                export DP="${DP}"

                TAG="${BUILD_NUMBER}"

                API_IMAGE="${API_IMAGE_REPO}:\\${TAG}"
                WEB_IMAGE="${WEB_IMAGE_REPO}:\\${TAG}"

                echo "🔐 Docker login"
                docker logout >/dev/null 2>&1 || true
                rm -f ~/.docker/config.json || true
                echo "\\$DP" | docker login -u "\\$DU" --password-stdin

                echo "🐳 Build API: \\$API_IMAGE"
                docker build -f docker/api/Dockerfile -t "\\$API_IMAGE" -t "${API_IMAGE_REPO}:latest" .

                echo "🐳 Build WEB: \\$WEB_IMAGE"
                docker build -f docker/web/Dockerfile -t "\\$WEB_IMAGE" -t "${WEB_IMAGE_REPO}:latest" .

                echo "🚀 Push API"
                docker push "\\$API_IMAGE"
                docker push "${API_IMAGE_REPO}:latest"

                echo "🚀 Push WEB"
                docker push "\\$WEB_IMAGE"
                docker push "${WEB_IMAGE_REPO}:latest"

                # salva as imagens geradas
                echo "\\$API_IMAGE" > /tmp/saas_last_api_image.txt
                echo "\\$WEB_IMAGE" > /tmp/saas_last_web_image.txt

                docker logout >/dev/null 2>&1 || true
                echo "✅ Build e push concluídos"
              '
            """

            script {
              env.BUILT_API_IMAGE = sh(
                script: "ssh -o StrictHostKeyChecking=no ${DOCKER_HOST_USER}@${DOCKER_HOST_VM} 'cat /tmp/saas_last_api_image.txt'",
                returnStdout: true
              ).trim()

              env.BUILT_WEB_IMAGE = sh(
                script: "ssh -o StrictHostKeyChecking=no ${DOCKER_HOST_USER}@${DOCKER_HOST_VM} 'cat /tmp/saas_last_web_image.txt'",
                returnStdout: true
              ).trim()

              if (!env.BUILT_API_IMAGE || !env.BUILT_WEB_IMAGE) {
                error("Imagem(s) vazia(s). Build remoto falhou silenciosamente.")
              }

              echo "✅ API Image: ${env.BUILT_API_IMAGE}"
              echo "✅ WEB Image: ${env.BUILT_WEB_IMAGE}"
            }
          }
        }
      }
    }

    stage('Deploy to Kubernetes (Ingress + Secrets/ConfigMap)') {
      steps {
        withCredentials([file(credentialsId: 'kubeconfig-homelab', variable: 'KUBECONFIG')]) {
          sh """
            set -e

            kubectl get nodes
            kubectl get ns ${K8S_NAMESPACE} >/dev/null 2>&1 || kubectl create ns ${K8S_NAMESPACE}

            # NÃO sujar workspace: copia manifests pra /tmp
            cp k8s/10-api.yaml /tmp/10-api.yaml
            cp k8s/20-web.yaml /tmp/20-web.yaml

            # Substitui imagens nos manifests (placeholders)
            sed -i "s|REPLACE_API_IMAGE|${BUILT_API_IMAGE}|g" /tmp/10-api.yaml
            sed -i "s|REPLACE_WEB_IMAGE|${BUILT_WEB_IMAGE}|g" /tmp/20-web.yaml

            # Aplica base
            kubectl apply -f k8s/00-namespace.yaml

            # Aplica config (separado, do jeito certo)
            kubectl apply -f k8s/01-secrets.yaml
            kubectl apply -f k8s/02-configmap.yaml

            # Aplica app + services + ingress
            kubectl -n ${K8S_NAMESPACE} apply -f /tmp/10-api.yaml
            kubectl -n ${K8S_NAMESPACE} apply -f k8s/11-api-service.yaml

            kubectl -n ${K8S_NAMESPACE} apply -f /tmp/20-web.yaml
            kubectl -n ${K8S_NAMESPACE} apply -f k8s/21-web-service.yaml

            kubectl -n ${K8S_NAMESPACE} apply -f k8s/30-ingress.yaml

            kubectl -n ${K8S_NAMESPACE} rollout status deploy/saas-api
            kubectl -n ${K8S_NAMESPACE} rollout status deploy/saas-web

            kubectl -n ${K8S_NAMESPACE} get deploy,po,svc,ingress -o wide
          """
        }
      }
    }
  }

  post {
    success {
      echo "✅ Pipeline concluída! Imagens: API=${env.BUILT_API_IMAGE} | WEB=${env.BUILT_WEB_IMAGE}"
    }
    failure {
      echo "❌ Pipeline falhou — cola o log do stage que falhou e a gente ajusta fino."
    }
  }
}
