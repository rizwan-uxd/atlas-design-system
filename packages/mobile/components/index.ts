// Atlas Mobile — Component exports
// Phase 1 · Primitives

export { Badge }   from './Badge/Badge'
export { Label }   from './Label/Label'
export { Alert }   from './Alert/Alert'
export { Button }  from './Button/Button'

export type { BadgeProps }  from './Badge/Badge'
export type { LabelProps }  from './Label/Label'
export type { AlertProps }  from './Alert/Alert'
export type { ButtonProps } from './Button/Button'

export type { BadgeVariant, BadgeSize } from './Badge/Badge.styles'
export type { LabelSize }              from './Label/Label.styles'
export type { AlertVariant }           from './Alert/Alert.styles'
export type { ButtonVariant, ButtonSize } from './Button/Button.styles'

// Phase 2 · Forms

export { Input }    from './Input/Input'
export { Textarea } from './Textarea/Textarea'
export { Checkbox } from './Checkbox/Checkbox'
export { Switch }   from './Switch/Switch'

export type { InputProps }                          from './Input/Input'
export type { InputVariant, InputSize, InputState } from './Input/Input.styles'

export type { TextareaProps }                                   from './Textarea/Textarea'
export type { TextareaVariant, TextareaSize, TextareaState }    from './Textarea/Textarea.styles'

export type { CheckboxProps }    from './Checkbox/Checkbox'
export type { CheckboxSize }     from './Checkbox/Checkbox.styles'

export type { SwitchProps }      from './Switch/Switch'
export type { SwitchSize }       from './Switch/Switch.styles'

// Phase 3 · Layout

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card/Card'

export type { CardProps, CardHeaderProps, CardTitleProps, CardDescriptionProps, CardContentProps, CardFooterProps, CardFooterJustify } from './Card/Card'
export type { CardVariant, CardPadding } from './Card/Card.styles'

export { Header } from './NavBar/Header'
export { TabBar } from './NavBar/TabBar'

export type { HeaderProps, HeaderVariant }  from './NavBar/Header'
export type { TabBarProps, TabBarVariant, TabItem, TabIconRenderer } from './NavBar/TabBar'

// Phase 4 · Overlays

export { Dialog } from './Dialog/Dialog'
export { Tabs }   from './Tabs/Tabs'

export type { DialogProps, DialogVariant }       from './Dialog/Dialog'
export type { TabsProps, TabsItem, TabsVariant } from './Tabs/Tabs'
