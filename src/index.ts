//pack please
import { join } from "path";
import { readFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { set } from "@raydeck/registry-manager";
import { findRegion } from "@raydeck/serverless-stage";
export function configureRegistry(path: string) {
  const startdir = process.cwd();
  if (!process.env.AWS_REGION) {
    process.chdir(path);
    process.env.AWS_REGION = findRegion() || "us-east-1";
    process.chdir(startdir);
  }
  const fullPath = join(
    path,
    ".serverless",
    "cloudformation-template-update-stack.json"
  );
  if (!existsSync(fullPath)) {
    process.chdir(path);
    const command = "yarn serverless-stage package";
    execSync(command, { stdio: "inherit" });
    process.chdir(startdir);
  }
  const text = readFileSync(fullPath, { encoding: "utf-8" });
  const json = JSON.parse(text);
  const { Resources } = <
    {
      Resources: [
        {
          Properties: { Environment: { [key: string]: any } | undefined };
        }
      ];
    }
  >json;
  const func = Object.entries(Resources).find(
    ([, value]) => value.Properties.Environment
  );
  if (func) {
    Object.entries(func[1].Properties.Environment?.Variables).map(([k, v]) => {
      set(k, <any>v);
    });
    return func[1].Properties.Environment?.Variables;
  }
  throw new Error(
    "Could not find a function in serverless package at path " + path
  );
}
