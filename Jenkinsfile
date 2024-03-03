pipeline {
    agent any
    stages {
        stage('Init') {
            steps {
                echo 'Testing..'
                telegramSend(message: 'Building Job tCamera-traffic-dev API...', chatId: -740504133)
            }
        }
        stage ('Deployments') {
            steps {
                echo 'Deploying to Production environment...'
                echo 'Copy project over SSH...'
                sshPublisher(publishers: [
                    sshPublisherDesc(
                        configName: 'swarm1',
                        transfers:
                            [sshTransfer(
                                cleanRemote: false,
                                excludes: '',
                                execCommand: "docker build -t registry.thinklabs.com.vn:5000/tcameratrafficdevapi ./thinklabsdev/tcameratrafficdevapiCI/ \
                                    && docker image push registry.thinklabs.com.vn:5000/tcameratrafficdevapi \
                                    && docker service rm tcameratrafficdev_api || true \
                                    && docker stack deploy -c ./thinklabsdev/tcameratrafficdevapiCI/docker-compose.yml tcameratrafficdev \
                                    && rm -rf ./thinklabsdev/tcameratrafficdevapiCIB \
                                    && mv ./thinklabsdev/tcameratrafficdevapiCI/ ./thinklabsdev/tcameratrafficdevapiCIB",
                                execTimeout: 6000000,
                                flatten: false,
                                makeEmptyDirs: false,
                                noDefaultExcludes: false,
                                patternSeparator: '[, ]+',
                                remoteDirectory: './thinklabsdev/tcameratrafficdevapiCI',
                                remoteDirectorySDF: false,
                                removePrefix: '',
                                sourceFiles: '*, server/'
                            )],
                        usePromotionTimestamp: false,
                        useWorkspaceInPromotion: false,
                        verbose: false
                    )
                ])
                telegramSend(message: 'Build Job tCamera-traffic-dev API -STATUS: $BUILD_STATUS!', chatId: -740504133)
            }
        }
    }
}
