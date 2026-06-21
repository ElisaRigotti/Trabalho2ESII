const { execSync } = require('child_process');
const CONTAINER_NAME = 'plus-ms-report-func-test';
module.exports = async function teardown() {
  execSync(`docker stop ${CONTAINER_NAME}`, { stdio: 'inherit' });
  execSync(`docker rm ${CONTAINER_NAME}`, { stdio: 'inherit' });
};
