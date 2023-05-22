import { App } from 'vue';
import Breadcrumb from './Breadcrumb';
import BreadcrumbItem from './BreadcrumbItem';
export default function (app: App) {
  app.component('LeeBreadcrumb', Breadcrumb);
  app.component('LeeBreadcrumbItem', BreadcrumbItem);
}
