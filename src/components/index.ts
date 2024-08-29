import * as components from './components';
import { App } from 'vue';
export * from './components';
export * from './composables';

function install(app: App) {
  const componentList: any[] = Object.keys(components).map(
    (key) => components[key as keyof typeof components]
  );
  componentList.forEach((component) => {
    app.component(`Lee${component.name}`, component);
  });
}

export default { install };
