import path from 'path';
import fs from 'fs-extra';
import { promisify } from 'util';
import { exec, ExecOptions } from 'child_process';

// wrapper for executing a shell command and returning the result as a string promise
// opts are passed directly to the exec command
// errorMessage is an optional error message to throw if the command fails
// outputOnStderr is a flag if the 'success' output of the command will be on stderr (for some ungodly reason, this is how ruby --version works)
export async function execAsStringPromise(
  command: string,
  opts?: ExecOptions,
  errorMessage?: string,
  outputOnStderr: boolean = false,
): Promise<string> {
  const { stdout, stderr } = await promisify(exec)(command, opts);
  if (outputOnStderr) {
    return stderr.toString('utf8').trim();
  }
  if (stderr) {
    throw new Error(errorMessage || `Received error [${stderr.toString('utf8').trim()}] running command [${command}]`);
  }
  return stdout.toString('utf8').trim();
}
