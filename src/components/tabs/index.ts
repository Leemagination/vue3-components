import {App} from 'vue';
import Tabs from './Tabs';
import TabPanel from './TabPanel';

export default function(app:App) {
    app.component('LeeTabs',Tabs)
    app.component('LeeTabPanel',TabPanel)
}
