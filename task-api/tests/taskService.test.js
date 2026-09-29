const taskService = require('../src/services/taskService');

describe('Task Service', () => {
  beforeEach(() => {
    taskService._reset();
  });

  describe('create()', () => {
    test('should create a task with default values', () => {
      const task = taskService.create({
        title: 'Test task',
      });

      expect(task).toHaveProperty('id');
      expect(task.title).toBe('Test task');
      expect(task.description).toBe('');
      expect(task.status).toBe('todo');
      expect(task.priority).toBe('medium');
      expect(task.dueDate).toBeNull();
      expect(task.completedAt).toBeNull();
      expect(task).toHaveProperty('createdAt');
    });

    test('should create a task with provided values', () => {
      const task = taskService.create({
        title: 'Important task',
        description: 'Test description',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2026-10-01T00:00:00.000Z',
      });

      expect(task.title).toBe('Important task');
      expect(task.description).toBe('Test description');
      expect(task.status).toBe('in_progress');
      expect(task.priority).toBe('high');
      expect(task.dueDate).toBe('2026-10-01T00:00:00.000Z');
    });
  });

  describe('getAll()', () => {
    test('should return all tasks', () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });

      const tasks = taskService.getAll();

      expect(tasks).toHaveLength(2);
      expect(tasks[0].title).toBe('Task 1');
      expect(tasks[1].title).toBe('Task 2');
    });

    test('should return an empty array when there are no tasks', () => {
      expect(taskService.getAll()).toEqual([]);
    });
  });

  describe('findById()', () => {
    test('should find a task by id', () => {
      const task = taskService.create({ title: 'Find me' });

      expect(taskService.findById(task.id)).toEqual(task);
    });

    test('should return undefined for an unknown id', () => {
      expect(taskService.findById('unknown-id')).toBeUndefined();
    });
  });

  describe('getByStatus()', () => {
    test('should return tasks with the requested status', () => {
      taskService.create({
        title: 'Todo task',
        status: 'todo',
      });

      taskService.create({
        title: 'Progress task',
        status: 'in_progress',
      });

      taskService.create({
        title: 'Done task',
        status: 'done',
      });

      const result = taskService.getByStatus('todo');

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('todo');
    });

    test('should not match partial status values', () => {
      taskService.create({
        title: 'Progress task',
        status: 'in_progress',
      });

      const result = taskService.getByStatus('in');

      expect(result).toHaveLength(0);
    });
  });

  describe('getPaginated()', () => {
    test('should return the first page correctly', () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });
      taskService.create({ title: 'Task 3' });

      const result = taskService.getPaginated(1, 2);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Task 1');
      expect(result[1].title).toBe('Task 2');
    });

    test('should return the second page correctly', () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });
      taskService.create({ title: 'Task 3' });

      const result = taskService.getPaginated(2, 2);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Task 3');
    });
  });

  describe('update()', () => {
    test('should update an existing task', () => {
      const task = taskService.create({
        title: 'Old title',
      });

      const updated = taskService.update(task.id, {
        title: 'New title',
      });

      expect(updated.title).toBe('New title');
      expect(updated.id).toBe(task.id);
    });

    test('should return null for an unknown task', () => {
      expect(
        taskService.update('unknown-id', {
          title: 'New title',
        })
      ).toBeNull();
    });
  });

  describe('remove()', () => {
    test('should remove an existing task', () => {
      const task = taskService.create({
        title: 'Delete me',
      });

      expect(taskService.remove(task.id)).toBe(true);
      expect(taskService.findById(task.id)).toBeUndefined();
    });

    test('should return false for an unknown task', () => {
      expect(taskService.remove('unknown-id')).toBe(false);
    });
  });

  describe('completeTask()', () => {
    test('should mark a task as completed', () => {
      const task = taskService.create({
        title: 'Complete me',
        priority: 'high',
      });

      const completed = taskService.completeTask(task.id);

      expect(completed.status).toBe('done');
      expect(completed.priority).toBe('medium');
      expect(completed.completedAt).not.toBeNull();
    });

    test('should return null for an unknown task', () => {
      expect(
        taskService.completeTask('unknown-id')
      ).toBeNull();
    });
  });

  describe('getStats()', () => {
    test('should return counts by status', () => {
      taskService.create({
        title: 'Todo',
        status: 'todo',
      });

      taskService.create({
        title: 'Progress',
        status: 'in_progress',
      });

      taskService.create({
        title: 'Done',
        status: 'done',
      });

      expect(taskService.getStats()).toEqual({
        todo: 1,
        in_progress: 1,
        done: 1,
        overdue: 0,
      });
    });
  });
});