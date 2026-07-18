export const VALID_BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

export function normalizeBloodTypes(value) {
  const values = Array.isArray(value)
    ? value.flatMap((item) => normalizeBloodTypes(item))
    : String(value ?? '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)

  return [...new Set(values.filter((item) => VALID_BLOOD_TYPES.includes(item)))]
}

export function serializeBloodTypes(value) {
  return normalizeBloodTypes(value).join(', ')
}

export function formatBloodTypes(value) {
  const bloodTypes = normalizeBloodTypes(value)
  if (bloodTypes.length) return bloodTypes.join(', ')
  return Array.isArray(value) ? '' : String(value ?? '').trim()
}

export function requestIncludesBloodType(requestBloodTypes, bloodType) {
  return normalizeBloodTypes(requestBloodTypes).includes(bloodType)
}
