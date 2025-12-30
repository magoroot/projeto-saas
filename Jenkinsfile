stage('Install & Build') {
  steps {
    sh '''
      node -v
      npm -v

      npm ci
      npm run -w apps/api build
      npm run -w apps/web build
    '''
  }
}
