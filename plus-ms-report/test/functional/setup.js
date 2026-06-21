const { execSync, spawnSync } = require('child_process');
const CONTAINER_NAME = 'plus-ms-report-func-test';
const IMAGE_NAME = 'plus-ms-report-test';
const HOST_PORT = 3019;
const CONTAINER_PORT = 3009;

async function waitForApp(url, retries = 30, delayMs = 500) {
  for (let i = 0; i < retries; i++) {
    try { const res = await fetch(url); if (res.ok) return; } catch {}
    await new Promise(r => setTimeout(r, delayMs));
  }
  throw new Error(`App at ${url} did not become ready`);
}

module.exports = async function setup() {
  spawnSync('docker', ['rm', '-f', CONTAINER_NAME], { stdio: 'inherit' });
  execSync(`docker build -t ${IMAGE_NAME} .`, { stdio: 'inherit' });
  execSync(`docker run -d --name ${CONTAINER_NAME} -p ${HOST_PORT}:${CONTAINER_PORT} -e USE_MOCKS=true ${IMAGE_NAME}`, { stdio: 'inherit' });
  await waitForApp(`http://localhost:${HOST_PORT}/health`);
  process.env.FUNC_TEST_BASE_URL = `http://localhost:${HOST_PORT}`;
};
