import type { InitOptions, PluginConfig } from './types';
import { loadPlugins, definePlugin, requirePlugin } from './loader';
import { registerSharedModule, resolvePluginDependencies, exposeLoadedModules } from './helper';

export async function initMiniStar(options: InitOptions): Promise<void> {
  const { plugins, pluginUrlBuilder, sharedModules } = options;

  if (sharedModules) {
    for (const [name, factory] of Object.entries(sharedModules)) {
      const module = await factory();
      registerSharedModule(name, module);
    }
  }

  const resolvedPlugins = pluginUrlBuilder
    ? plugins.map(p => ({
        ...p,
        url: pluginUrlBuilder(p.name),
      }))
    : plugins;

  const sortedPlugins = resolvePluginDependencies(resolvedPlugins);

  await loadPlugins(sortedPlugins);
  
  exposeLoadedModules();
  
  console.log('MiniStar initialized successfully');
}

export function regSharedModule(name: string, factory: () => Promise<unknown>): void {
  factory().then(module => {
    registerSharedModule(name, module);
  });
}

export async function loadSinglePlugin(plugin: PluginConfig, pluginUrlBuilder?: (name: string) => string): Promise<void> {
  const url = pluginUrlBuilder ? pluginUrlBuilder(plugin.name) : plugin.url;
  await loadPlugins([{ ...plugin, url }]);
}

export { definePlugin, requirePlugin };