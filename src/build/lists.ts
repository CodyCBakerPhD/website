/**
 * The items that appear more than once in `items`, each named once. Records
 * need this check for the lists schemas/records.yaml marks
 * list_elements_unique, since LinkML's JSON Schema generator does not carry
 * that over as uniqueItems.
 */
export function duplicates<T>(items: readonly T[]): T[] {
  return [...new Set(items.filter((item, index) => items.indexOf(item) !== index))];
}
