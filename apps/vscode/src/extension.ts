import * as fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";

interface GraphNode {
  id: string;
  type: string;
  label: string;
  metadata?: Record<string, unknown>;
}

interface Violation {
  severity: string;
  message: string;
  ruleId?: string;
}

interface RepoGraph {
  nodes: GraphNode[];
  violations: Violation[];
  stats?: Record<string, number>;
}

function findWorkspaceRoot(): string | undefined {
  const folder = vscode.workspace.workspaceFolders?.[0];
  return folder?.uri.fsPath;
}

function loadGraph(root: string): RepoGraph | null {
  const graphPath = path.join(root, ".repograph", "generated", "graph.json");
  if (!fs.existsSync(graphPath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(graphPath, "utf-8")) as RepoGraph;
  } catch {
    return null;
  }
}

class ModuleTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChange = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChange.event;
  private moduleFiles = new Map<string, vscode.TreeItem[]>();

  refresh(): void {
    this.moduleFiles.clear();
    this._onDidChange.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): vscode.TreeItem[] {
    const root = findWorkspaceRoot();
    if (!root) {
      return [new vscode.TreeItem("No workspace folder")];
    }
    if (element && (element as vscode.TreeItem & { moduleKey?: string }).moduleKey) {
      const key = (element as vscode.TreeItem & { moduleKey?: string }).moduleKey!;
      return this.moduleFiles.get(key) ?? [];
    }
    const graph = loadGraph(root);
    if (!graph) {
      return [new vscode.TreeItem("Run repograph scan first")];
    }
    const modules = graph.nodes.filter((n) => n.type === "MODULE");
    const fileNodes = graph.nodes.filter((n) => n.type === "FILE");
    return modules.map((mod) => {
      const item = new vscode.TreeItem(mod.label, vscode.TreeItemCollapsibleState.Collapsed);
      (item as vscode.TreeItem & { moduleKey?: string }).moduleKey = mod.label;
      if (mod.metadata?.critical) {
        item.description = "critical";
      }
      const children = fileNodes
        .filter(
          (f) =>
            f.label.toLowerCase().includes(`/${mod.label.toLowerCase()}/`) ||
            f.label.toLowerCase().includes(`\\${mod.label.toLowerCase()}\\`)
        )
        .map((f) => {
          const child = new vscode.TreeItem(path.basename(f.label), vscode.TreeItemCollapsibleState.None);
          child.description = f.label;
          child.command = {
            command: "vscode.open",
            title: "Open file",
            arguments: [vscode.Uri.file(path.join(root, f.label))],
          };
          return child;
        });
      this.moduleFiles.set(mod.label, children);
      return item;
    });
  }
}

class ViolationsProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChange = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChange.event;

  refresh(): void {
    this._onDidChange.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(): vscode.TreeItem[] {
    const root = findWorkspaceRoot();
    if (!root) {
      return [new vscode.TreeItem("No workspace folder")];
    }
    const graph = loadGraph(root);
    if (!graph) {
      return [new vscode.TreeItem("No graph.json — run repograph scan")];
    }
    if (!graph.violations.length) {
      return [new vscode.TreeItem("No violations")];
    }
    return graph.violations.map((v, i) => {
      const item = new vscode.TreeItem(
        `[${v.severity}] ${v.message.slice(0, 80)}`,
        vscode.TreeItemCollapsibleState.None
      );
      item.description = v.ruleId;
      item.tooltip = v.message;
      item.iconPath =
        v.severity === "error" || v.severity === "critical"
          ? new vscode.ThemeIcon("error")
          : new vscode.ThemeIcon("warning");
      void i;
      return item;
    });
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const modulesProvider = new ModuleTreeProvider();
  const violationsProvider = new ViolationsProvider();

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider("repographModules", modulesProvider),
    vscode.window.registerTreeDataProvider("repographViolations", violationsProvider),
    vscode.commands.registerCommand("repograph.refresh", () => {
      modulesProvider.refresh();
      violationsProvider.refresh();
    }),
    vscode.commands.registerCommand("repograph.openGraph", () => {
      const root = findWorkspaceRoot();
      if (!root) return;
      const graphPath = path.join(root, ".repograph", "generated", "graph.json");
      if (fs.existsSync(graphPath)) {
        void vscode.window.showTextDocument(vscode.Uri.file(graphPath));
      } else {
        void vscode.window.showWarningMessage("graph.json not found. Run repograph scan.");
      }
    })
  );

  const watcher = vscode.workspace.createFileSystemWatcher("**/.repograph/generated/graph.json");
  watcher.onDidChange(() => {
    modulesProvider.refresh();
    violationsProvider.refresh();
  });
  context.subscriptions.push(watcher);
}

export function deactivate(): void {}
