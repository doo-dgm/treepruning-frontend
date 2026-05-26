/**
 * Mapeo de códigos de error del backend a mensajes legibles.
 * Se usa como fallback cuando Strapi no tiene la entrada en la colección `mensajes`.
 */
const ERROR_MESSAGES_ES: Record<string, string> = {
  'ERROR.PRUNING.PLANNED_DATE_PAST':            'La fecha planeada no puede ser una fecha pasada.',
  'ERROR.PRUNING.PLANNED_DATE_NULL':            'La fecha de poda es obligatoria.',
  'ERROR.PRUNING.PLANNED_DATE_BEYOND_HORIZON':  'La fecha excede el horizonte máximo de planificación.',
  'ERROR.PRUNING.TREE_ALREADY_SCHEDULED':       'El árbol ya tiene una poda programada para esa fecha.',
  'ERROR.PRUNING.TREE_NOT_FOUND':               'El árbol seleccionado no fue encontrado.',
  'ERROR.PRUNING.QUADRILLE_NOT_FOUND':          'La cuadrilla seleccionada no fue encontrada.',
  'ERROR.PRUNING.STATUS_NOT_FOUND':             'El estado de poda especificado no existe.',
  'ERROR.PRUNING.TYPE_NOT_FOUND':               'El tipo de poda especificado no existe.',
  'ERROR.PRUNING.PHOTO_NOT_AVAILABLE':          'La foto no está disponible.',
  'ERROR.PRUNING.PHOTO_READ_FAILED':            'No se pudo leer el archivo de foto.',
}

/**
 * Devuelve un mensaje legible para el código de error dado.
 * Si no hay mapeo, devuelve el código original sin cambios.
 */
export function resolveErrorMessage(codeOrMessage: string): string {
  return ERROR_MESSAGES_ES[codeOrMessage] ?? codeOrMessage
}
