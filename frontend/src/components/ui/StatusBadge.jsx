import { statusClass } from '../../utils/constants'
import { statusText } from '../../utils/formatters'

export function StatusBadge(props) {
  const value =
    props && typeof props === 'object' && Object.hasOwn(props, 'value') ? props.value : props

  return <span className={`badge ${statusClass[value] || 'neutral'}`}>{statusText(value)}</span>
}
