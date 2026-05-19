export interface PluginConfig {
  name: string;
  url: string;
  version?: string;
  deps?: string[];
}

export interface InitOptions {
  plugins: PluginConfig[];
  pluginUrlBuilder?: (pluginName: string) => string;
  sharedModules?: Record<string, () => Promise<unknown>>;
}

export interface LoadedModule {
  name: string;
  exports: unknown;
}

export type LoadedModuleMap = Map<string, LoadedModule>;