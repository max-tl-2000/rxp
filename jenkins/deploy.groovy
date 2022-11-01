node() {
  def branch = getJobParameter(params.BRANCH, 'master')
  def slackChannel = getJobParameter(params.SLACK_CHANNEL, 'ci')
  def isSlackNotificationEnabled = getJobParameter(params.ENABLE_SLACK_NOTIFICATION?.toString(), 'false').toBoolean()
  def buildIOSIpa = getJobParameter(params.BUILD_IOS_IPA?.toString(), 'false').toBoolean()
  def buildIOSAdditionalArgs = getJobParameter(params.BUILD_IOS_ADDITIONAL_ARGS?.toString(), '')
  def buildAndroidApk = getJobParameter(params.BUILD_ANDROID_APK?.toString(), 'false').toBoolean()
  def environment = getJobParameter(params.ENVIRONMENT)
  def expoCredentialsId = getJobParameter(params.EXPO_CREDENTIALS_ID, 'reva-expo-credentials')
  def appleDeveloperCredentialsId = getJobParameter(params.APPLE_DEVELOPER_CREDENTIALS_ID, 'reva-apple-developer-credentials')
  def fastlaneSessionCredentialsId = getJobParameter(params.FASTLANE_SESSION_CREDENTIALS_ID, 'fastlane-session')
  def customers = getJobParameter(params.CUSTOMERS)

  try {
    if (!environment) throw new Exception("ENVIRONMENT parameter is required")

    try {
      withCredentials([string(credentialsId: "${environment.toUpperCase()}_RXP_API_TOKEN", variable: 'ENV_RXP_API_TOKEN')]) {
        println 'Using customized RXP_API_TOKEN'
        env.RXP_API_TOKEN = ENV_RXP_API_TOKEN
      }
    } catch (error) {
      println "${error}. Using default RXP_API_TOKEN"
    }

    stage('Build') {
      echo 'Building...'
      checkout scm
      sh script: './configure.sh && cd backend && ./configure.sh'
      sh script: './verify.sh'
    }

    stage('Test') {
      echo 'Testing...'
      sh script: './test.sh'
    }

    def customerPaths = getCustomerPaths(customers?.tokenize(','))

    println "Deploying - ${customerPaths}"

    stage('Deploy - Expo') {
      withCredentials([usernamePassword(credentialsId: expoCredentialsId, passwordVariable: 'EXPO_CREDS_PSW', usernameVariable: 'EXPO_CREDS_USR')]) {
        for (def customerPath : customerPaths) {
          sh script: "ENVIRONMENT=${environment} ./customize.sh -p ${customerPath} ; cat app.json"
          sh script: "./deploy.sh --release-channel ${environment}"
        }
      }
    }

    stage('Deploy - ipa') {
      if (buildIOSIpa) {
        withCredentials([usernamePassword(credentialsId: appleDeveloperCredentialsId, passwordVariable: 'APPLE_DEVELOPER_CREDS_PSW', usernameVariable: 'APPLE_DEVELOPER_CREDS_USR'),
                         usernamePassword(credentialsId: expoCredentialsId, passwordVariable: 'EXPO_CREDS_PSW', usernameVariable: 'EXPO_CREDS_USR'),
                         string(credentialsId: fastlaneSessionCredentialsId, variable: 'FASTLANE_SESSION')]) {
          env.FASTLANE_SESSION = FASTLANE_SESSION
          for (def customerPath : customerPaths) {
            def appleTeamId = getAppleTeamId(EXPO_CREDS_USR, customerPath)
            sh script: "ENVIRONMENT=${environment} ./customize.sh -p ${customerPath} ; cat app.json"
            sh script: "EXPO_APPLE_PASSWORD='${APPLE_DEVELOPER_CREDS_PSW}' ./build-ios.sh --apple-id ${APPLE_DEVELOPER_CREDS_USR} --release-channel ${environment} --type archive --team-id ${appleTeamId} --non-interactive ${buildIOSAdditionalArgs}"
          }
        }
      }
    }

    stage('Deploy - apk') {
      if (buildAndroidApk) {
        for (def customerPath : customerPaths) {
          sh script: "ENVIRONMENT=${environment} ./customize.sh -p ${customerPath} ; cat app.json"
          sh script: "./build-android.sh --release-channel ${environment} --non-interactive"
        }
      }
    }
    currentBuild.result = 'SUCCESS'
  } catch (Exception err) {
    currentBuild.result = 'FAILURE'
    println err
  } finally {
    if (isSlackNotificationEnabled) notifyBuild(currentBuild.result, slackChannel)
    deleteDir()
  }
}

// return the apple team id from the customers configuration if using the production expo account
// otherwise use the reva customer account apple id as default
def getAppleTeamId(final def expoUsername, def customer) {
  if (!expoUsername.toLowerCase().contains('prod')) {
    customer = 'reva'
  }

  def appleTeamId = sh script: "grep APPLE_TEAM_ID customers/${customer}/storeConfig.ini | sed 's/.*=//' | tr -d '\n'", returnStdout: true

  return appleTeamId
}

def getCustomerPaths(final def customersFromParams) {
  if (customersFromParams?.size()) return customersFromParams

  def customerPaths = sh script: 'ls customers', returnStdout: true
  customerPaths = customerPaths.trim().replaceAll(' +', ' ').replaceAll('[\n\r]', ' ').split(' ')

  return customerPaths;
}

def getJobParameter(final def parameter, def defaultValue = '') {
  return parameter?.trim() ? parameter.trim() : defaultValue
}

def notifyBuild(final def buildStatus = 'STARTED', final def slackChannel = 'ci') {
  def final GREEN = '#36a64f'
  def final RED = '#ff0000'
  def colorCode = GREEN
  def subject = "${env.JOB_NAME} - #${getBuildTag(true)} ${buildStatus}"
  def message = "${subject} (${env.BUILD_URL})"

  if (buildStatus == 'STARTED' || buildStatus == 'SUCCESS') {
    colorCode = GREEN
  } else {
    colorCode = RED
  }

  slackSend(channel: slackChannel, color: colorCode, message: message)
}
