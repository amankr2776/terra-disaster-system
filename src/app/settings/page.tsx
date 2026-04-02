import { SettingsClient } from "./SettingsClient"

export const metadata = {
  title: 'TERRA | Settings',
  description: 'TERRA system configuration and preferences',
}

export default function SettingsPage() {
  return <SettingsClient />
}
