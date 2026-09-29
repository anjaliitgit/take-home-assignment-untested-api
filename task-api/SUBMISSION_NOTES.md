# Submission Notes

## What I Would Test Next

If I had additional time, I would extend the test suite with:

* Tests for malformed JSON request bodies.
* Tests for unexpected or extra fields in request payloads.
* Tests for invalid pagination values such as negative, zero, and non-numeric values.
* Tests for boundary conditions around due dates and overdue tasks.
* Tests for concurrent updates to the same task.
* Tests for large task collections and pagination performance.
* Tests for unexpected internal service errors and the API's `500 Internal Server Error` handler.

## What Surprised Me

The main surprise was that several behaviors that appeared straightforward required explicit tests to verify correctly.

The pagination implementation used an offset based directly on the requested page number, which caused the first page to skip records. Writing tests for the expected first and second pages exposed this issue.

The status filtering also used partial string matching, which allowed a value such as `in` to match the `in_progress` status. An edge-case test exposed this behavior.

These issues reinforced the importance of testing boundary conditions and unexpected input rather than testing only the normal happy path.

## Production Questions

Before considering this API production-ready, I would clarify:

1. How should tasks be persisted in production instead of using in-memory storage?
2. What authentication and authorization requirements should be applied to task operations?
3. Should task assignments be restricted to existing users?
4. What are the expected pagination limits and maximum page size?
5. What logging and monitoring requirements are expected?
6. What API rate-limiting requirements should be applied?
7. What should happen when concurrent requests attempt to update or assign the same task?
8. What API versioning strategy should be used?
9. What database and backup/recovery strategy should be used?
10. What deployment, CI/CD, and environment-management requirements are expected?

## Test Summary

Final test result:

* Test Suites: 2 passed
* Tests: 39 passed
* Statement Coverage: 93.63%
* Branch Coverage: 81.81%
* Function Coverage: 93.33%
* Line Coverage: 93.70%

All implemented functionality is covered by passing automated tests.
