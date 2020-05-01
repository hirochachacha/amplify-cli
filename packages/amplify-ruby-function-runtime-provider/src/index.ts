import { FunctionRuntimeContributorFactory } from 'amplify-function-plugin-interface';
import { rubyBuild } from './util/buildUtils';
import { rubyPackage } from './util/packageUtils';
import { rubyInvoke } from './util/invokeUtil';
import { checkDeps } from './util/depUtils';

export const functionRuntimeContributorFactory: FunctionRuntimeContributorFactory = context => {
  return {
    contribute: request => {
      const selection = request.selection;
      if (selection !== 'ruby') {
        return Promise.reject(new Error(`Unknown selection ${selection}`));
      }
      return Promise.resolve({
        runtime: {
          name: 'Ruby',
          value: 'ruby',
          cloudTemplateValue: 'ruby2.7',
          defaultHandler: 'index.handler',
        },
      });
    },
    checkDependencies: checkDeps,
    package: request => rubyPackage(context, request),
    build: rubyBuild,
    invoke: request => rubyBuild(request).then(() => rubyInvoke(context, request)),
  };
};
