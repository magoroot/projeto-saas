pipeline {
  agent any

  environment {
    // ---- Docker VM (onde build/push acontecem)
    DOCKER_HOST_VM   = "172.16.30.56"
    DOCKER_HOST_USER = "ubuntu"
    REMOTE_DIR       = "/home/ubuntu/projeto-saas"

    // ---- Docker Hub
    DOCKERHUB_USER = "magoroot"
    APP_NAME       = "projeto-saas"
    API_IMAGE_REPO = "${DOCKERHUB_USER}/${APP_NAME}-api"
    WEB_IMAGE_REPO = "${DOCKERHUB_USER}/${APP_NAME}-web"

    // ---- Kubernetes
    K8S_NAMESPACE = "saas-operator"

    // ---- Git repo
    GIT_URL = "https://github.com/magoroot/projeto-saas.git"
    GIT_BRANCH = "main"
  }

  options {
    timestamps()
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Preflight (Docker VM)') {
      steps {
        sshagent(credentials: ['docker-vm-ssh']) {
          sh """
            set -e
            ssh -o StrictHostKeyChecking=no ${DOCKER_HOST_USER}@${DOCKER_HOST_VM} '
              set -e
              docker version >/dev/null
              docker ps >/dev/null
              echo "[OK] Docker VM pronta"
            '
          """
        }
      }
    }

    stage('Build & Push Images (on Docker VM)') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
          sshagent(credentials: ['docker-vm-ssh']) {
            sh """
              set -e

              TAG=${BUILD_NUMBER}
              echo "TAG=${BUILD_NUMBER}" > .tag

              ssh -o StrictHostKeyChecking=no ${DOCKER_HOST_USER}@${DOCKER_HOST_VM} '
                set -e
                mkdir -p ${REMOTE_DIR}
                cd ${REMOTE_DIR}

                if [ ! -d repo ]; then
                  git clone ${GIT_URL} repo
                fi

                cd repo
                git fetch --all
                git checkout ${GIT_BRANCH}
                git reset --hard origin/${GIT_BRANCH}

                echo "[INFO] Buildando imagens..."
                docker build -t ${API_IMAGE_REPO}:${BUILD_NUMBER} -t ${API_IMAGE_REPO}:latest -f docker/api/Dockerfile .
                docker build -t ${WEB_IMAGE_REPO}:${BUILD_NUMBER} -t ${WEB_IMAGE_REPO}:latest -f docker/web/Dockerfile .

                echo "[INFO] Login DockerHub..."
                echo "${DH_PASS}" | docker login -u "${DH_USER}" --password-stdin

                echo "[INFO] Push API..."
                docker push ${API_IMAGE_REPO}:${BUILD_NUMBER}
                docker push ${API_IMAGE_REPO}:latest

                echo "[INFO] Push WEB..."
                docker push ${WEB_IMAGE_REPO}:${BUILD_NUMBER}
                docker push ${WEB_IMAGE_REPO}:latest

                docker logout
                echo "[OK] Build & Push concluído"
              '

              echo "BUILT_API_IMAGE=${API_IMAGE_REPO}:${TAG}" > .images
              echo "BUILT_WEB_IMAGE=${WEB_IMAGE_REPO}:${TAG}" >> .images
            """
          }
        }
      }
    }

    stage('Deploy to Kubernetes (apply manifests)') {
      steps {
        withCredentials([file(credentialsId: 'kubeconfig-homelab', variable: 'KUBECONFIG')]) {
          sh """
            set -e
            . ./.images

            echo "[INFO] Usando imagens:"
            echo "API: \$BUILT_API_IMAGE"
            echo "WEB: \$BUILT_WEB_IMAGE"

            kubectl get nodes >/dev/null

            # Namespace (idempotente)
            kubectl get ns ${K8S_NAMESPACE} >/dev/null 2>&1 || kubectl create ns ${K8S_NAMESPACE}

            # Aplica config/base
            kubectl apply -f k8s/00-namespace.yaml
            kubectl apply -f k8s/01-secrets.yaml
            kubectl apply -f k8s/02-configmap.yaml

            # Copia YAMLs pra /tmp pra não "sujar" workspace
            cp k8s/10-api.yaml /tmp/10-api.yaml
            cp k8s/20-web.yaml /tmp/20-web.yaml

            # Substitui placeholders (alinhado com seus YAMLs)
            sed -i "s|REPLACE_API_IMAGE|\\\$BUILT_API_IMAGE|g" /tmp/10-api.yaml
            sed -i "s|REPLACE_WEB_IMAGE|\\\$BUILT_WEB_IMAGE|g" /tmp/20-web.yaml

            # Aplica recursos
            kubectl -n ${K8S_NAMESPACE} apply -f /tmp/10-api.yaml
            kubectl -n ${K8S_NAMESPACE} apply -f k8s/11-api-service.yaml
            kubectl -n ${K8S_NAMESPACE} apply -f /tmp/20-web.yaml
            kubectl -n ${K8S_NAMESPACE} apply -f k8s/21-web-service.yaml
            kubectl -n ${K8S_NAMESPACE} apply -f k8s/30-ingress.yaml

            # Rollout
            kubectl -n ${K8S_NAMESPACE} rollout status deploy/saas-api
            kubectl -n ${K8S_NAMESPACE} rollout status deploy/saas-web

            # Visão final
            kubectl -n ${K8S_NAMESPACE} get deploy,po,svc,ingress -o wide
          """
        }
      }
    }
  }

  post {
    always {
      echo "Pipeline finalizada."
    }
  }
}
