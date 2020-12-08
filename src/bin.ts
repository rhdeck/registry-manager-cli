#!/usr/bin/env node
import commander from "commander";
import { configureRegistry } from "./";
commander.arguments("[path]");
commander.description("Get registry options from serverless source path");
commander.parse(process.argv);
const path = commander.args[0] || ".";
const o = configureRegistry(path);
process.stdout.write(JSON.stringify(o, null, 2));
export { commander };
