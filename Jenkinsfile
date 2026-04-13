pipeline {
    agent { 
        docker { 
            image 'mcr.microsoft.com/playwright:v1.58.2-noble' 
        } 
    }
    
    stages {         
        stage('e2e-tests') {
            steps {
                sh 'npm ci'
                // Forzamos el reporte HTML
                sh 'npx playwright test --reporter=html'
            }
        }
    }

    post {
        always {
            publishHTML(target: [
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright HTML Report'
            ])
        }
    }
}