import fs from 'fs-extra';
import { BuildRequest, BuildResult } from 'amplify-function-plugin-interface/src';
import { execAsStringPromise } from './rbUtils';
import glob from 'glob';

export async function rubyBuild(params: BuildRequest): Promise<BuildResult> {
  if (!params.lastBuildTimestamp || isBuildStale(params.srcRoot, params.lastBuildTimestamp)) {
    const bundleLogs = await execAsStringPromise('bundle install --path vendor/bundle', { cwd: params.srcRoot }, undefined, true);
    console.log(bundleLogs);
    return Promise.resolve({ rebuilt: true });
  }
  return Promise.resolve({ rebuilt: false });
}

function isBuildStale(resourceDir: string, lastBuildTimestamp: Date) {
  const dirTime = new Date(fs.statSync(resourceDir).mtime);
  if (dirTime > lastBuildTimestamp) {
    return true;
  }
  const fileUpdatedAfterLastBuild = glob
    .sync(`${resourceDir}/**`, { ignore: ['**/dist/**'] })
    .find(file => new Date(fs.statSync(file).mtime) > lastBuildTimestamp);
  return !!fileUpdatedAfterLastBuild;
}
