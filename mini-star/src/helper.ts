import type { PluginConfig, LoadedModuleMap } from './types';

const loadedModules: LoadedModuleMap = new Map();
const sharedModules: Map<string, unknown> = new Map();

export function getLoadedModules(): LoadedModuleMap {
  return loadedModules;
}

export function setLoadedModule(name: string, exports: unknown): void {
  loadedModules.set(name, { name, exports });
}

export function getSharedModule(name: string): unknown | undefined {
  return sharedModules.get(name);
}

export function registerSharedModule(name: string, module: unknown): void {
  sharedModules.set(name, module);
}

export function resolvePluginDependencies(plugins: PluginConfig[]): PluginConfig[] {
  const pluginMap = new Map<string, PluginConfig>();
  const visited = new Set<string>();
  const result: PluginConfig[] = [];

  plugins.forEach(p => pluginMap.set(p.name, p));

  function visit(pluginName: string): void {
    if (visited.has(pluginName)) return;
    visited.add(pluginName);

    const plugin = pluginMap.get(pluginName);
    if (!plugin) return;

    if (plugin.deps) {
      plugin.deps.forEach(dep => visit(dep));
    }

    result.push(plugin);
  }

  plugins.forEach(p => visit(p.name));
  return result;
}

declare global {
  interface Window {
    __ministar_loadedModules?: LoadedModuleMap;
  }
}

export function exposeLoadedModules(): void {
  (window as any).__ministar_loadedModules = loadedModules;
}