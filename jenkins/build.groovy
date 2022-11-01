import com.cloudbees.groovy.cps.NonCPS

node() {
  def stagingDeployJob = getJobParameter(params.STAGING_DEPLOY_JOB_NAME, 'Staging - Deployment')
  def stagingGreenDeployJob = getJobParameter(params.STAGING_GREEN_DEPLOY_JOB_NAME, 'Staging Green - Deployment')
  def stagingBlueDeployJob = getJobParameter(params.STAGING_BLUE_DEPLOY_JOB_NAME, 'Staging Blue - Deployment')
  def deployImage = getJobParameter(params.DEPLOY_IMAGE?.toString(), 'true').toBoolean()

  def isPR = getJobParameter(params.ghprbActualCommit)?.trim() ? true : false
  def registryHostname = 'registry.corp.reva.tech'
  def revaRegistry = "https://${registryHostname}"
  def registryUser = 'dc16cc5d-ba6b-42c8-a8b4-be7dae244fa2' // testuser

  def slackChannel = getJobParameter(params.SLACK_CHANNEL, 'ci')
  def isSlackNotificationEnabled = getJobParameter(params.ENABLE_SLACK_NOTIFICATION?.toString(), 'false').toBoolean()

  try {
    if (isPR) currentBuild.description = params.ghprbPullTitle

    stage('Checkout') {
      checkout scm
    }

    stage('Build') {
      withCredentials([string(credentialsId: 'GITHUB_LABELER', variable: 'LABELER_GITHUB_TOKEN')]) {
        sh script: './pr-labels.sh'
      }
      sh script: './configure.sh && cd backend && ./configure.sh'
      sh script: './verify.sh'
      sh script: './customize.sh'
      sh script: './backend-build.sh'
    }

    stage('Test') {
      sh script: './test.sh'
    }

    if (!isPR) {
      stage('Image') {
        docker.withRegistry(revaRegistry, registryUser) {
          def useBuildNumber = true
          def imageTag = getBuildTag(useBuildNumber)

          // push image for this branch/build
          def rxp = docker.build "${registryHostname}/rxp:${imageTag}"
          rxp.push()

          // push latest tag for this branch
          useBuildNumber = false
          rxp.push(getBuildTag(useBuildNumber))
        }
      }

      if (deployImage) {
        stage('Deploy') {
          deploy([stagingDeployJob, stagingGreenDeployJob, stagingBlueDeployJob])
        }
      }
    }

    currentBuild.result = 'SUCCESS'
  } catch (Exception err) {
    currentBuild.result = 'FAILURE'
    println err
  } finally {
    if (isSlackNotificationEnabled) notifyBuild(currentBuild.result, slackChannel)
    if (!isPR) sh script: 'image-cleanup.sh'
    deleteDir()
  }
}

/*
* returns a string used to tag built images
* if env.BRANCH_NAME is master:
* registry.corp.reva.tech/rxp:1
* registry.corp.reva.tech/rxp:latest
*
* if it's something other than master (ie. 20.06.08)
* registry.corp.reva.tech/rxp:20.06.08-1
* registry.corp.reva.tech/rxp:20.06.08-latest
*/
def getBuildTag(final def useBuildNumber = true) {
  def buildNumber = useBuildNumber ? env.BUILD_NUMBER : 'latest'
  return env.BRANCH_NAME != 'master' ? "${env.BRANCH_NAME}-${buildNumber}" : buildNumber
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

@NonCPS
def getJob(final def jobName = '') {
  return Hudson.instance.items.find { job -> job.name == jobName }
}

def getJobXMLConfig(final def jobName = '') {
  return getJob(jobName) ? getJob(jobName).getConfigFile().asString() : ''
}

def writeJobConfigToXMLFile(final def jobName, final def fileName = 'config.xml') {
  writeFile file: fileName, text: getJobXMLConfig(jobName)
}

def deploy(final def deployJobs) {
  def imageBuildUrlXPath = "'//flow-definition/properties/hudson.model.ParametersDefinitionProperty/parameterDefinitions/hudson.model.StringParameterDefinition[name/text()=\"RED_IMAGE_BUILD_URL\"]/defaultValue'"

  for (jobName in deployJobs) {
    writeJobConfigToXMLFile(jobName);
    def imageBuildUrl = sh(script: "xmlstarlet sel -t -v ${imageBuildUrlXPath} config.xml", returnStdout: true).trim()

    if (imageBuildUrl?.contains(env.BRANCH_NAME)) {
      build job: jobName, wait: false
    }
  }
}
