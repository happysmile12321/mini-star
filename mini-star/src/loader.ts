import type { PluginConfig } from './types';
import { setLoadedModule, getSharedModule } from './helper';
import { mergeUrl } from './utils';

export async function loadScript(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.type = 'module';
    script.onload = () => {
      script.remove();
      resolve(undefined);
    };
    script.onerror = (error) => {
      script.remove();
      reject(error);
    };
    document.head.appendChild(script);
  });
}

export async function loadPlugin(plugin: PluginConfig, baseUrl?: string): Promise<void> {
  const url = baseUrl ? mergeUrl(baseUrl, plugin.url) : plugin.url;
  
  try {
    await loadScript(url);
    console.log(`Plugin loaded: ${plugin.name}`);
  } catch (error) {
    console.error(`Failed to load plugin ${plugin.name}:`, error);
    throw error;
  }
}

export async function loadPlugins(plugins: PluginConfig[], baseUrl?: string): Promise<PromiseSettledResult<void>[]> {
  const promises = plugins.map(plugin => loadPlugin(plugin, baseUrl));
  const results = await Promise.allSettled(promises);
  const failures = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
  if (failures.length > 0) {
    console.warn(`${failures.length} plugins failed to load`);
  }
  return results;
}

export function definePlugin(name: string, factory: () => unknown): void {
  const exports = factory();
  setLoadedModule(name, exports);
}

export function requirePlugin(name: string): unknown {
  const module = getSharedModule(name);
  if (module !== undefined) {
    return module;
  }
  throw new Error(`Plugin ${name} not found`);
}