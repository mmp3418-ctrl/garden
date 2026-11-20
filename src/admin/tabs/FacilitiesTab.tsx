import type { FC } from 'react'
import type { ToastState } from '../components/AdminToast'
import type { AdminDictionary } from '../i18n'
import CatalogTab from './CatalogTab'

interface Props {
  dict: AdminDictionary
  onToast: (toast: ToastState) => void
  onChanged?: () => void
}

/** Recreational & Sports Facilities (`services.category = 'recreation'`). */
const FacilitiesTab: FC<Props> = (props) => <CatalogTab {...props} category="recreation" />

export default FacilitiesTab
