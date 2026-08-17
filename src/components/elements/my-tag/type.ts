export type TagTone = 'success' | 'neutral' | 'alert' | 'warning' | 'info'

export type TagSize = 'default' | 'compact'

export type MyTagProps = {
  label: string
  tone?: TagTone
  size?: TagSize
}
