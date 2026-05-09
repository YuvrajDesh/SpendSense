pipeline {
    agent any

    environment {
        DOCKER_HUB_REPO = 'yuvraj12345678/spendsense'
        BACKEND_IMAGE = "${DOCKER_HUB_REPO}-backend"
        FRONTEND_IMAGE = "${DOCKER_HUB_REPO}-frontend"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/yuvrajdeshmukh/Spendsense.git'
            }
        }

        stage('Run Tests') {
            steps {
                dir('backend') {
                    sh 'npm install'
                    sh 'npm test'
                }
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm test -- --watchAll=false'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    docker.build("${BACKEND_IMAGE}:${env.BUILD_NUMBER}", './backend')
                    docker.build("${FRONTEND_IMAGE}:${env.BUILD_NUMBER}", './frontend')
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'dockerhub-credentials') {
                        docker.image("${BACKEND_IMAGE}:${env.BUILD_NUMBER}").push()
                        docker.image("${FRONTEND_IMAGE}:${env.BUILD_NUMBER}").push('latest')
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    sh 'kubectl apply -f k8s/'
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}