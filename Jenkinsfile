pipeline {
  agent any

  environment {
    DOCKERHUB_USER = "magoroot"
    API_IMAGE_REPO = "${DOCKERHUB_USER}/projeto-saas-api"
    WEB_IMAGE_REPO = "${DOCKERHUB_USER}/projeto-saas-web"

    K8S_NAMESPACE = "saas-operator"
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

    stage('Docker Build') {
      steps {
        sh '''#!/bin/bash
          set -euo pipefail
          TAG=${BUILD_NUMBER}

          echo "==> Building images with tag: ${TAG}"

          docker build -f docker/api/Dockerfile \
            -t ${API_IMAGE_REPO}:${TAG} \
            -t ${API_IMAGE_REPO}:latest .

          docker build -f docker/web/Dockerfile \
            -t ${WEB_IMAGE_REPO}:${TAG} \
            -t ${WEB_IMAGE_REPO}:latest .

          echo "==> Local images built:"
          docker images | egrep "projeto-saas-(api|web)" || true
        '''
      }
    }

    stage('Docker Push') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-credentials',
          usernameVariable: 'DH_USER',
          passwordVariable: 'DH_PASS'
        )]) {
          sh '''#!/bin/bash
            set -euo pipefail
            TAG=${BUILD_NUMBER}

            echo "==> Docker Hub login as ${DH_USER}"
            echo "${DH_PASS}" | docker login -u "${DH_USER}" --password-stdin

            echo "==> Sanity: images must exist locally before push"
            docker image inspect ${API_IMAGE_REPO}:${TAG} >/dev/null
            docker image inspect ${WEB_IMAGE_REPO}:${TAG} >/dev/null

            echo "==> Pushing API: ${API_IMAGE_REPO}:${TAG} and :latest"
            docker push ${API_IMAGE_REPO}:${TAG}
            docker push ${API_IMAGE_REPO}:latest

            echo "==> Pushing WEB: ${WEB_IMAGE_REPO}:${TAG} and :latest"
            docker push ${WEB_IMAGE_REPO}:${TAG}
            docker push ${WEB_IMAGE_REPO}:latest

            docker logout
          '''
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        withCredentials([file(
          credentialsId: 'kubeconfig-homelab',
          variable: 'KUBECONFIG'
        )]) {
          sh '''#!/bin/bash
            set -euo pipefail
            TAG=${BUILD_NUMBER}

            echo "==> Deploying tag: ${TAG} to namespace: ${K8S_NAMESPACE}"

            # Namespace
            kubectl get ns ${K8S_NAMESPACE} >/dev/null 2>&1 || kubectl create ns ${K8S_NAMESPACE}

            # Render manifests in /tmp (never apply templates directly)
            cp k8s/10-api.yaml /tmp/10-api.yaml
            cp k8s/20-web.yaml /tmp/20-web.yaml

            sed -i "s|REPLACE_API_IMAGE|${API_IMAGE_REPO}:${TAG}|g" /tmp/10-api.yaml
            sed -i "s|REPLACE_WEB_IMAGE|${WEB_IMAGE_REPO}:${TAG}|g" /tmp/20-web.yaml

            echo "==> Rendered images:"
            grep -n "image:" /tmp/10-api.yaml || true
            grep -n "image:" /tmp/20-web.yaml || true

            echo "==> Guardrail: placeholders must NOT exist"
            if grep -R "REPLACE_API_IMAGE\\|REPLACE_WEB_IMAGE" /tmp/10-api.yaml /tmp/20-web.yaml; then
              echo "ERROR: Placeholder still present in rendered manifests."
              exit 1
            fi

            # Apply base
            echo "==> Applying base manifests"
            kubectl apply -f k8s/00-namespace.yaml || true
            kubectl -n ${K8S_NAMESPACE} apply -f k8s/01-secrets.yaml
            kubectl -n ${K8S_NAMESPACE} apply -f k8s/02-configmap.yaml

            # Apply app (ONLY rendered /tmp files)
            echo "==> Applying API"
            kubectl -n ${K8S_NAMESPACE} apply -f /tmp/10-api.yaml
            kubectl -n ${K8S_NAMESPACE} apply -f k8s/11-api-service.yaml

            echo "==> Applying WEB"
            kubectl -n ${K8S_NAMESPACE} apply -f /tmp/20-web.yaml
            kubectl -n ${K8S_NAMESPACE} apply -f k8s/21-web-service.yaml

            echo "==> Applying Ingress"
            kubectl -n ${K8S_NAMESPACE} apply -f k8s/30-ingress.yaml

            echo "==> Rollout status"
            kubectl -n ${K8S_NAMESPACE} rollout status deploy/saas-api --timeout=180s
            kubectl -n ${K8S_NAMESPACE} rollout status deploy/saas-web --timeout=180s

            echo "==> Current objects:"
            kubectl -n ${K8S_NAMESPACE} get deploy,po,svc,ingress -o wide
          '''
        }
      }
    }
  }

  post {
    success {
      echo "✅ Pipeline concluída com sucesso!"
    }
    failure {
      echo "❌ Pipeline falhou. Olhe o stage que falhou (Push ou Deploy) — agora tem guardrails."
    }
    always {
      // Opcional: limpeza de imagens locais pra não lotar o disco do Jenkins
      sh '''#!/bin/bash
        set +e
        docker image prune -f >/dev/null 2>&1 || true
      '''
    }
  }
}
