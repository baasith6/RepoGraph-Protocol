export interface ScannedFile {
  path: string;
  language: string;
  module?: string;
  layer?: string;
  extension: string;
}

export interface FileDependency {
  source: string;
  target: string;
  type: "import" | "project-reference" | "using";
}

export interface ScanResult {
  files: ScannedFile[];
  dependencies: FileDependency[];
  unmappedFiles: string[];
  detectedStack: {
    csharp: boolean;
    angular: boolean;
    dotnet: boolean;
    node: boolean;
  };
}
