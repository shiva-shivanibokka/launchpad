import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Published to https://shiva-shivanibokka.github.io/launchpad/
// so every asset must be served from that sub-path.
export default defineConfig({
  base: '/launchpad/',
  plugins: [react()],
})
