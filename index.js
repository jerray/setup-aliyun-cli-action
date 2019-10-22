const tc = require('@actions/tool-cache');
const core = require('@actions/core');
const exec = require('@actions/exec');
const os = require('os');

const name = 'aliyun';
const platform = os.platform();
const version = core.getInput('aliyun-cli-version', { required: true });

const configs = [
  { input: 'mode', flag: '--mode' },
  { input: 'region', flag: '--region' },
  { input: 'access-key-id', flag: '--access-key-id' },
  { input: 'access-key-secret', flag: '--access-key-secret' },
  { input: 'sts-token', flag: '--sts-token' },
  { input: 'ram-role-name', flag: '--ram-role-name' },
  { input: 'ram-role-arn', flag: '--ram-role-arn' },
  { input: 'role-session-name', flag: '--role-session-name' },
];
for (const config of configs) {
  config.value = core.getInput(config.input);
}

async function run() {
  const [system, ext, extractFunc, executable] = (function() { switch(platform) {
    case 'linux':
      return ['linux', 'tgz', 'extractTar', name];
    case 'darwin':
      return ['macosx', 'tgz', 'extractTar', name];
    case 'win32':
      return ['windows', 'zip', 'extractZip', `${name}.exe`];
    default:
      throw new Error(`Unexpected OS ${platform}`);
  }})();

  const url = `https://github.com/aliyun/aliyun-cli/releases/download/v${version}/aliyun-cli-${system}-${version}-amd64.${ext}`;
  const downloadedPath = await tc.downloadTool(url);
  const extractedPath = await tc[extractFunc](downloadedPath);
  const cachedPath = await tc.cacheDir(extractedPath, name, version);
  core.addPath(cachedPath);

  const args = ['configure', 'set'];
  for (const config of configs) {
    if (config.value.length > 0) {
      args.push(config.flag, config.value);
    }
  }

  await exec.exec(executable, args);
}

run().catch(function(e) {
  core.setFailed(`Action failed with error: ${e}`);
});
