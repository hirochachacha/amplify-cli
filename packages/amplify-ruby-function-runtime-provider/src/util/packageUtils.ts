import { PackageRequest, PackageResult } from 'amplify-function-plugin-interface/src';
import archiver from 'archiver';
import path from 'path';
import fs from 'fs-extra';

// packages ruby lambda functions and writes the archive to the specified file
export async function rubyPackage(context: any, params: PackageRequest): Promise<PackageResult> {
  if (!params.lastPackageTimestamp || params.lastBuildTimestamp > params.lastPackageTimestamp) {
    // zip source and dependencies and write to specified file
    const file = fs.createWriteStream(params.dstFilename);
    const packageHash = await context.amplify.hashDir(params.srcRoot, ['dist']);
    return new Promise(async (resolve, reject) => {
      file.on('close', () => {
        resolve({ packageHash });
      });
      file.on('error', err => {
        reject(new Error(`Failed to zip with error: [${err}]`));
      });
      const zip = archiver.create('zip', {});
      zip.pipe(file);
      zip.glob(
        '**/*',
        {
          // TODO potentially get 'src' as an input from template breadcrumb
          cwd: path.join(params.srcRoot, 'src'),
          ignore: ['**/dist/**'],
        },
        {
          prefix: params.isLayer ? 'ruby/lib' : undefined,
        },
      );
      if (params.isLayer) {
        zip.directory(path.join(params.srcRoot, 'vendor/bundle'), false);
      } else {
        zip.directory(path.join(params.srcRoot, 'vendor'), 'vendor');
      }
      zip.finalize();
    });
  }
  return Promise.resolve({});
}
