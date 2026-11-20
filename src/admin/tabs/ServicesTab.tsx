import type { FC } from 'react'
import type { ToastState } from '../components/AdminToast'
import type { AdminDictionary } from '../i18n'
import CatalogTab from './CatalogTab'

interface Props {
  dict: AdminDictionary
  onToast: (toast: ToastState) => void
  onChanged?: () => void
}

/** Dedicated Services manager (`services.category = 'service'`). */
const ServicesTab: FC<Props> = (props) => <CatalogTab {...props} category="service" />

export default ServicesTab
