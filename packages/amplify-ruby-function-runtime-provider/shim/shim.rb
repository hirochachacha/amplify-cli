#!/usr/bin/env ruby

require 'json'

# Amplify Ruby shim. Can be invoked from commandline with:
# ruby shim.rb <lambda handler filename> <handler method name>
# Then waits for a line on stdin and expects that line to contain:
# {"event":"Lambda event serialized as JSON", "context": {...arbitrary context...}}
# The event is de-serialized into a Ruby hash and passed to the lambda handler along with the context dict
# The result of the handler is written to stdout so that it can be picked up by the node process that invoked the shim
def main
  # command line inputs
  handlerFile = ARGV[0]
  handlerName = ARGV[1]

  # load handler
  require handlerFile

  # parse lambda event from stdin
  lambdaInput = JSON.load(STDIN.gets.chomp)
  event = JSON.load(lambdaInput["event"]) # event is already serialized by the platform so need to turn it into a dict here before invoking
  context = lambdaInput["context"]

  # execute lambda and return result on stdout
  print '\n' # since we rely on the last line being the result, make sure the handler didn't already write something to the line
  print JSON.dump(Kernel.send(handlerName), event, context)
end

if __FILE__ == $0
  main
end
