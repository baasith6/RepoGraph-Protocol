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

export interface ScannedSymbol {
  file: string;
  name: string;
  kind: string;
  namespace: string;
}

export interface ScannedApiEndpoint {
  file: string;
  controller: string;
  method: string;
  route: string;
}

export interface ScanResult {
  files: ScannedFile[];
  dependencies: FileDependency[];
  unmappedFiles: string[];
  symbols: ScannedSymbol[];
  apiEndpoints: ScannedApiEndpoint[];
  analyzer: "roslyn" | "heuristic";
  detectedStack: {
    csharp: boolean;
    angular: boolean;
    dotnet: boolean;
    node: boolean;
  };
}
