# Bug Report

## Bug 1: Partial Status Matching

### Expected Behavior

The API should filter tasks by their exact status.

Valid task statuses are:

- `todo`
- `in_progress`
- `done`

A request such as `GET /tasks?status=in` should not return tasks with the status `in_progress`.

### Actual Behavior

The API returns tasks whose status contains the requested value.

For example:

```text
GET /tasks?status=in