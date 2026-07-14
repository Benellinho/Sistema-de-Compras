import { useSistemaCompras } from '../../context/comprasContext'
import { Alert } from './Alert'

export function ActionFeedback({ actions }) {
  const { actionFeedback, feedbackAction } = useSistemaCompras()
  const acceptedActions = Array.isArray(actions) ? actions : [actions]

  if (!actionFeedback || !acceptedActions.includes(feedbackAction)) {
    return null
  }

  const tone = /^(nao|não|falha)/i.test(actionFeedback) ? 'danger' : 'success'

  return (
    <div className="action-feedback">
      <Alert tone={tone}>{actionFeedback}</Alert>
    </div>
  )
}
