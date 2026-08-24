import { deleteStudentMessage } from '../messages';

describe('deleteStudentMessage', () => {
  it('asks a plain question when there are no attempts', () => {
    expect(deleteStudentMessage('Ana', 0)).toBe('Delete "Ana"?');
  });

  it('treats a negative count as none', () => {
    expect(deleteStudentMessage('Ana', -1)).toBe('Delete "Ana"?');
  });

  it('warns that a single attempt is deleted too', () => {
    expect(deleteStudentMessage('Ana', 1)).toBe(
      '"Ana" has 1 reading attempt. Deleting the student permanently deletes it too. This cannot be undone.'
    );
  });

  it('warns that multiple attempts are deleted too', () => {
    expect(deleteStudentMessage('Ana', 3)).toBe(
      '"Ana" has 3 reading attempts. Deleting the student permanently deletes them too. This cannot be undone.'
    );
  });
});
