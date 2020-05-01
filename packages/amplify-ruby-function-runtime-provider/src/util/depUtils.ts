import { CheckDependenciesResult } from 'amplify-function-plugin-interface/src';
import { execAsStringPromise } from './rbUtils';
import { coerce, lt } from 'semver';

const minRbVersion = coerce('2.7')!;
const rubyErrMsg =
  'You must have ruby >= 2.7 installed and available on your PATH as "ruby". It can be installed from https://www.ruby-lang.org/en/downloads/';
const bundleErrMsg =
  'You must have bundler installed and available on your PATH as "bundle". It can be installed by running "gem install bundler --user-install".';

export async function checkDeps(): Promise<CheckDependenciesResult> {
  let hasDeps = true;
  let errMsg = '';

  let rbVersionStr;
  try {
    rbVersionStr = await execAsStringPromise('ruby --version');
    const rbVersion = coerce(rbVersionStr);
    if (!rbVersion || lt(rbVersion, minRbVersion)) {
      hasDeps = false;
      errMsg = `ruby found but version ${rbVersionStr} is less than the minimum required version.\n${rubyErrMsg}`;
    }
  } catch (err) {
    hasDeps = false;
    errMsg = `Error executing ruby\n${rubyErrMsg}`;
  }

  // check bundler
  try {
    await execAsStringPromise('bundle --version');
  } catch (err) {
    hasDeps = false;
    errMsg = errMsg.concat(errMsg ? '\n' : '', bundleErrMsg);
  }
  return Promise.resolve({ hasRequiredDependencies: hasDeps, errorMessage: errMsg });
}
