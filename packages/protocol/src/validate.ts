import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { resolveSchemaDir } from "./schema-path.js";
import type { ValidationError, ValidationResult } from "./types.js";

const SCHEMA_MAP: Record<string, string> = {
  "project.yml": "project.schema.json",
  "modules.yml": "modules.schema.json",
  "architecture.yml": "architecture.schema.json",
  "rules.yml": "rules.schema.json",
  "tests.yml": "tests.schema.json",
  "ai.yml": "ai.schema.json",
  "api.yml": "api.schema.json",
  "database.yml": "database.schema.json",
  "risk.yml": "risk.schema.json",
  "ownership.yml": "ownership.schema.json",
  "glossary.yml": "glossary.schema.json",
};

function loadSchema(name: string): object {
  const schemaPath = path.join(resolveSchemaDir(), name);
  return JSON.parse(fs.readFileSync(schemaPath, "utf-8")) as object;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ajvInstance: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getAjv(): Promise<any> {
  if (!ajvInstance) {
    const { createRequire } = await import("node:module");
    const require = createRequire(import.meta.url);
    const Ajv = require("ajv") as new (opts?: object) => {
      addSchema: (schema: object) => void;
      getSchema: (id: string) => ((data: unknown) => boolean) | undefined;
    };
    const addFormats = require("ajv-formats") as (ajv: unknown) => void;
    ajvInstance = new Ajv({ allErrors: true, strict: false });
    addFormats(ajvInstance);
    for (const schemaFile of Object.values(SCHEMA_MAP)) {
      ajvInstance.addSchema(loadSchema(schemaFile));
    }
  }
  return ajvInstance;
}

export async function validateConfigFile(
  fileName: string,
  content: string
): Promise<ValidationResult> {
  const schemaFile = SCHEMA_MAP[fileName];
  if (!schemaFile) {
    return { valid: true, errors: [] };
  }

  const errors: ValidationError[] = [];
  let data: unknown;

  try {
    data = parseYaml(content);
  } catch (err) {
    return {
      valid: false,
      errors: [
        {
          file: fileName,
          message: `YAML parse error: ${(err as Error).message}`,
        },
      ],
    };
  }

  const ajv = await getAjv();
  const validate = ajv.getSchema(schemaFile);
  if (!validate) {
    return {
      valid: false,
      errors: [{ file: fileName, message: `Schema not found: ${schemaFile}` }],
    };
  }

  const valid = validate(data);
  if (!valid && validate.errors) {
    for (const err of validate.errors) {
      errors.push({
        file: fileName,
        message: err.message ?? "Validation failed",
        path: err.instancePath || undefined,
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

export async function validateRepographDir(
  repographDir: string
): Promise<ValidationResult> {
  const allErrors: ValidationError[] = [];

  for (const fileName of Object.keys(SCHEMA_MAP)) {
    const filePath = path.join(repographDir, fileName);
    try {
      const content = await fs.promises.readFile(filePath, "utf-8");
      const result = await validateConfigFile(fileName, content);
      allErrors.push(...result.errors);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
        allErrors.push({
          file: fileName,
          message: (err as Error).message,
        });
      }
    }
  }

  return { valid: allErrors.length === 0, errors: allErrors };
}

export { SCHEMA_MAP };
