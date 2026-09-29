const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

describe('Task API', () => {
  beforeEach(() => {
    taskService._reset();
  });

  describe('POST /tasks', () => {
    test('should create a new task', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          title: 'New task',
          description: 'Task description',
          priority: 'high',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('New task');
      expect(response.body.description).toBe('Task description');
      expect(response.body.priority).toBe('high');
      expect(response.body.status).toBe('todo');
    });

    test('should reject a task without a title', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          description: 'No title',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'title is required and must be a non-empty string'
      );
    });

    test('should reject an invalid status', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          title: 'Invalid status task',
          status: 'invalid',
        });

      expect(response.status).toBe(400);
    });

    test('should reject an invalid priority', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          title: 'Invalid priority task',
          priority: 'urgent',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /tasks', () => {
    test('should return all tasks', async () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });

      const response = await request(app).get('/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    test('should filter tasks by status', async () => {
      taskService.create({
        title: 'Todo task',
        status: 'todo',
      });

      taskService.create({
        title: 'Done task',
        status: 'done',
      });

      const response = await request(app)
        .get('/tasks')
        .query({ status: 'todo' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].status).toBe('todo');
    });

    test('should not match a partial status', async () => {
      taskService.create({
        title: 'Progress task',
        status: 'in_progress',
      });

      const response = await request(app)
        .get('/tasks')
        .query({ status: 'in' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });

    test('should return paginated tasks', async () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });
      taskService.create({ title: 'Task 3' });

      const response = await request(app)
        .get('/tasks')
        .query({
          page: 1,
          limit: 2,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBe('Task 1');
      expect(response.body[1].title).toBe('Task 2');
    });
  });

  describe('GET /tasks/:id through update/delete/complete', () => {
    test('should update a task', async () => {
      const task = taskService.create({
        title: 'Old title',
      });

      const response = await request(app)
        .put(`/tasks/${task.id}`)
        .send({
          title: 'Updated title',
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated title');
      expect(response.body.id).toBe(task.id);
    });

    test('should return 404 when updating a missing task', async () => {
      const response = await request(app)
        .put('/tasks/non-existent-id')
        .send({
          title: 'Updated title',
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });

    test('should reject invalid update data', async () => {
      const task = taskService.create({
        title: 'Valid task',
      });

      const response = await request(app)
        .put(`/tasks/${task.id}`)
        .send({
          title: '',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /tasks/:id', () => {
    test('should delete an existing task', async () => {
      const task = taskService.create({
        title: 'Delete me',
      });

      const response = await request(app)
        .delete(`/tasks/${task.id}`);

      expect(response.status).toBe(204);

      const deletedTask = taskService.findById(task.id);
      expect(deletedTask).toBeUndefined();
    });

    test('should return 404 for a missing task', async () => {
      const response = await request(app)
        .delete('/tasks/non-existent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /tasks/:id/complete', () => {
    test('should mark a task as complete', async () => {
      const task = taskService.create({
        title: 'Complete me',
        priority: 'high',
      });

      const response = await request(app)
        .patch(`/tasks/${task.id}/complete`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('done');
      expect(response.body.completedAt).not.toBeNull();
    });

    test('should return 404 for a missing task', async () => {
      const response = await request(app)
        .patch('/tasks/non-existent-id/complete');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /tasks/stats', () => {
    test('should return task statistics', async () => {
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

      const response = await request(app)
        .get('/tasks/stats');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        todo: 1,
        in_progress: 1,
        done: 1,
        overdue: 0,
      });
    });
  });
});


    describe('PATCH /tasks/:id/assign', () => {
      test('should assign a task successfully', async () => {
        const createResponse = await request(app)
          .post('/tasks')
          .send({ title: 'Task to assign' });

        const taskId = createResponse.body.id;

        const response = await request(app)
          .patch(`/tasks/${taskId}/assign`)
          .send({ assignee: 'John Doe' });

        expect(response.status).toBe(200);
        expect(response.body.id).toBe(taskId);
        expect(response.body.assignee).toBe('John Doe');
      });

      test('should return 404 when task does not exist', async () => {
        const response = await request(app)
          .patch('/tasks/non-existent-id/assign')
          .send({ assignee: 'John Doe' });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Task not found');
      });

      test('should reject an empty assignee', async () => {
        const createResponse = await request(app)
          .post('/tasks')
          .send({ title: 'Task to assign' });

        const response = await request(app)
          .patch(`/tasks/${createResponse.body.id}/assign`)
          .send({ assignee: '' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe(
          'assignee is required and must be a non-empty string'
        );
      });

      test('should reject a whitespace-only assignee', async () => {
        const createResponse = await request(app)
          .post('/tasks')
          .send({ title: 'Task to assign' });

        const response = await request(app)
          .patch(`/tasks/${createResponse.body.id}/assign`)
          .send({ assignee: '   ' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe(
          'assignee is required and must be a non-empty string'
        );
      });

      test('should reject a non-string assignee', async () => {
        const createResponse = await request(app)
          .post('/tasks')
          .send({ title: 'Task to assign' });

        const response = await request(app)
          .patch(`/tasks/${createResponse.body.id}/assign`)
          .send({ assignee: 123 });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe(
          'assignee is required and must be a non-empty string'
        );
      });

      test('should return 409 when task is already assigned', async () => {
        const createResponse = await request(app)
          .post('/tasks')
          .send({ title: 'Already assigned task' });

        const taskId = createResponse.body.id;

        await request(app)
          .patch(`/tasks/${taskId}/assign`)
          .send({ assignee: 'John Doe' });

        const response = await request(app)
          .patch(`/tasks/${taskId}/assign`)
          .send({ assignee: 'Jane Doe' });

        expect(response.status).toBe(409);
        expect(response.body.error).toBe('Task is already assigned');
      });
    });