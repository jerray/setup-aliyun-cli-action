const tc = require('@actions/tool-cache');
const core = require('@actions/core');
const exec = require('@actions/exec');
const os = require('os');

const name = 'aliyun';
const platform = os.platform();
const version = core.getInput('aliyun-cli-version', { required: true });
const arch = getArch(os.arch());

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

function getArch(arch) {
  // 'arm', 'arm64', 'ia32', 'mips', 'mipsel', 'ppc', 'ppc64', 's390', 's390x', 'x32', and 'x64'.

  // wants amd64, 386, arm64, armv61, ppc641e, s390x
  // currently not supported by runner but future proofed mapping
  switch (arch) {
    case 'x64':
      arch = 'amd64';
      break;
    case 'x32':
      arch = '386';
      break;
    case 'arm':
      arch = 'armv6l';
      break;
  }

  return arch;
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

  const url = `https://github.com/aliyun/aliyun-cli/releases/download/v${version}/aliyun-cli-${system}-${version}-${arch}.${ext}`;
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
