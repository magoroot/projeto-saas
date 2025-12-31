pipeline {
  agent any

  environment {
    // Docker Hub
    DOCKERHUB_USER = "magoroot"
    API_IMAGE_REPO = "${DOCKERHUB_USER}/projeto-saas-api"
    WEB_IMAGE_REPO = "${DOCKERHUB_USER}/projeto-saas-web"

    // Kubernetes
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
          set -e
          TAG=${BUILD_NUMBER}

          echo "Building images with tag: ${TAG}"

          docker build -f docker/api/Dockerfile \
            -t ${API_IMAGE_REPO}:${TAG} \
            -t ${API_IMAGE_REPO}:latest .

          docker build -f docker/web/Dockerfile \
            -t ${WEB_IMAGE_REPO}:${TAG} \
            -t ${WEB_IMAGE_REPO}:latest .
        '''
      }
    }

    stage('Docker Push') {
      steps {
        )]) {
          sh '''#!/bin/bash

            docker push ${API_IMAGE_REPO}:${TAG}
            docker push ${API_IMAGE_REPO}:latest

            docker push ${WEB_IMAGE_REPO}:${TAG}
            docker push ${WEB_IMAGE_REPO}:latest

            
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
            set -e
            TAG=${BUILD_NUMBER}

            echo "Deploying tag: ${TAG}"

            # Garantir namespace
            kubectl get ns ${K8S_NAMESPACE} >/dev/null 2>&1 || \
              kubectl create ns ${K8S_NAMESPACE}

            # Copiar manifests (não sujar repo)
            cp k8s/10-api.yaml /tmp/10-api.yaml
            cp k8s/20-web.yaml /tmp/20-web.yaml

            # Substituir imagens
            sed -i "s|REPLACE_API_IMAGE|${API_IMAGE_REPO}:${TAG}|g" /tmp/10-api.yaml
            sed -i "s|REPLACE_WEB_IMAGE|${WEB_IMAGE_REPO}:${TAG}|g" /tmp/20-web.yaml

            # Aplicar base
            kubectl apply -f k8s/00-namespace.yaml
            kubectl apply -f k8s/01-secrets.yaml
            kubectl apply -f k8s/02-configmap.yaml

            # Aplicar app
            kubectl -n ${K8S_NAMESPACE} apply -f /tmp/10-api.yaml
            kubectl -n ${K8S_NAMESPACE} apply -f k8s/11-api-service.yaml

            kubectl -n ${K8S_NAMESPACE} apply -f /tmp/20-web.yaml
            kubectl -n ${K8S_NAMESPACE} apply -f k8s/21-web-service.yaml

            kubectl -n ${K8S_NAMESPACE} apply -f k8s/30-ingress.yaml

            kubectl -n ${K8S_NAMESPACE} rollout status deploy/saas-api
            kubectl -n ${K8S_NAMESPACE} rollout status deploy/saas-web

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
      echo "❌ Pipeline falhou — agora o erro é REAL, não Groovy."
    }
  }
}
