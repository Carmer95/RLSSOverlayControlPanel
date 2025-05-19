import { mount } from 'svelte'
import './app.css'
import ControlPanel from './ControlPanel.svelte'

const app = mount(ControlPanel, {
  target: document.getElementById('app'),
})

export default app
