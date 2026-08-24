/**
 * Confirmation copy for deleting a student. Deleting a student also deletes
 * every reading attempt recorded for them, so the message has to say so.
 */
export function deleteStudentMessage(name: string, attemptCount: number): string {
  if (attemptCount <= 0) return `Delete "${name}"?`;
  const records = attemptCount === 1 ? '1 reading attempt' : `${attemptCount} reading attempts`;
  const pronoun = attemptCount === 1 ? 'it' : 'them';
  return `"${name}" has ${records}. Deleting the student permanently deletes ${pronoun} too. This cannot be undone.`;
}
