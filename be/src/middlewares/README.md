# Middleware Documentation

## Overview

This directory contains all middleware functions used in the application for authentication, authorization, validation, and error handling.

## Authentication & Authorization Middleware

### auth.js

Core authentication and authorization middleware.

#### `protect`
Verifies JWT token and attaches authenticated user to `req.user`.

**Usage:**
```javascript
router.get('/profile', protect, userController.getProfile);
```

**Behavior:**
- Extracts JWT token from `Authorization: Bearer <token>` header
- Verifies token validity
- Loads user from database
- Attaches user object to `req.user`
- Returns 401 if token is missing or invalid

#### `restrictTo(...roles)`
Restricts route access to specific user roles.

**Usage:**
```javascript
router.post('/admin/articles', protect, restrictTo('admin'), articleController.create);
```

**Parameters:**
- `roles` - Array of allowed roles (e.g., 'admin', 'user')

**Behavior:**
- Must be used after `protect` middleware
- Checks if `req.user.role` is in allowed roles
- Returns 403 if user role is not authorized

#### `optionalAuth`
Optional authentication - allows both authenticated and anonymous requests.

**Usage:**
```javascript
router.get('/articles/:slug', optionalAuth, articleController.getBySlug);
```

**Behavior:**
- Attempts to verify JWT token if present
- Attaches user to `req.user` if token is valid
- Continues without error if token is missing or invalid
- Useful for routes that show different content for authenticated users

---

### articleAuth.js

Article-specific authorization middleware.

#### `verifyArticleExists`
Verifies that an article exists and attaches it to the request.

**Usage:**
```javascript
router.get('/articles/:id', verifyArticleExists, articleController.getById);
```

**Behavior:**
- Looks up article by `req.params.id`
- Attaches article to `req.article`
- Returns 404 if article not found

#### `verifyArticlePublished`
Verifies that an article exists and is published.

**Usage:**
```javascript
router.get('/public/articles/:id', verifyArticlePublished, articleController.getPublic);
```

**Behavior:**
- Looks up article by `req.params.id` with status 'published'
- Attaches article to `req.article`
- Returns 404 if article not found or not published

#### `validateArticleStatusTransition(targetStatus)`
Validates article status transitions to prevent invalid state changes.

**Usage:**
```javascript
router.post('/admin/articles/:id/publish', 
  protect, 
  restrictTo('admin'),
  validateArticleStatusTransition('published'),
  articleController.publish
);
```

**Parameters:**
- `targetStatus` - The target status ('published', 'draft', 'archived')

**Behavior:**
- Checks current article status
- Validates if transition to target status is allowed
- Returns 400 if transition is invalid (e.g., publishing already published article)
- Attaches article to `req.article`

---

### commentAuth.js

Comment-specific authorization middleware.

#### `verifyCommentOwnership`
Verifies that the user is the comment author or an admin.

**Usage:**
```javascript
router.put('/comments/:commentId', 
  protect, 
  verifyCommentOwnership, 
  commentController.update
);
```

**Behavior:**
- Looks up comment by `req.params.commentId`
- Checks if `req.user._id` matches comment author OR user is admin
- Attaches comment to `req.comment`
- Sets `req.isCommentOwner` boolean flag
- Returns 404 if comment not found
- Returns 401 if user is neither owner nor admin

#### `verifyCommentOwnerOnly`
Verifies that the user is the comment author (admin not allowed).

**Usage:**
```javascript
router.put('/comments/:commentId/edit', 
  protect, 
  verifyCommentOwnerOnly, 
  commentController.edit
);
```

**Behavior:**
- Looks up comment by `req.params.commentId`
- Checks if `req.user._id` matches comment author (admin NOT allowed)
- Attaches comment to `req.comment`
- Returns 404 if comment not found
- Returns 401 if user is not the owner

**Use Case:** Operations that should only be performed by the original author, not admins (e.g., editing comment content).

---

## Validation Middleware

### validate.js

Generic Joi schema validation middleware.

#### `validate(schema)`
Validates request params, query, and body against Joi schema.

**Usage:**
```javascript
import { validate } from '../middlewares/validate.js';
import { createArticleSchema } from '../schemas/article.schema.js';

router.post('/articles', validate(createArticleSchema), articleController.create);
```

**Schema Format:**
```javascript
const createArticleSchema = {
  params: Joi.object({ ... }),  // Optional
  query: Joi.object({ ... }),   // Optional
  body: Joi.object({ ... })     // Optional
};
```

**Behavior:**
- Validates specified parts of request against schema
- Returns 400 with detailed error messages if validation fails
- Assigns validated values to request object
- Continues to next middleware if validation passes

---

## Error Handling Middleware

### error.js

Global error handling middleware (should be last in middleware chain).

**Usage:**
```javascript
// In app.js
app.use(errorHandler);
```

**Behavior:**
- Catches all errors thrown by previous middleware/controllers
- Formats error response consistently
- Logs errors appropriately
- Returns appropriate HTTP status codes

---

## Upload Middleware

### upload.js

File upload handling middleware using Multer and Cloudinary.

**Usage:**
```javascript
router.post('/articles/image', upload.single('image'), uploadController.uploadImage);
```

---

## Middleware Chaining Best Practices

### Order Matters
Always chain middleware in this order:
1. Validation (`validate`)
2. Authentication (`protect` or `optionalAuth`)
3. Authorization (`restrictTo`, `verifyCommentOwnership`, etc.)
4. Controller function

**Example:**
```javascript
router.put(
  '/comments/:commentId',
  validate(updateCommentSchema),      // 1. Validate input
  protect,                             // 2. Authenticate user
  verifyCommentOwnership,              // 3. Authorize action
  commentController.update             // 4. Execute controller
);
```

### Reusability
Create specific middleware for common authorization patterns:
- ✅ Good: `verifyCommentOwnership` - reusable across routes
- ❌ Bad: Checking ownership in every controller

### Error Handling
All middleware should use `next(error)` to pass errors to error handler:
```javascript
if (!comment) {
  return next(new NotFoundError('Không tìm thấy bình luận'));
}
```

### Request Object Enrichment
Middleware can attach data to `req` for use in controllers:
```javascript
req.user        // Attached by protect
req.article     // Attached by verifyArticleExists
req.comment     // Attached by verifyCommentOwnership
req.isCommentOwner  // Attached by verifyCommentOwnership
```

---

## Common Patterns

### Admin-Only Route
```javascript
router.post('/admin/articles', 
  protect, 
  restrictTo('admin'), 
  validate(createArticleSchema),
  articleController.create
);
```

### User-Owned Resource Update
```javascript
router.put('/comments/:commentId',
  protect,
  validate(updateCommentSchema),
  verifyCommentOwnership,
  commentController.update
);
```

### Public Route with Optional Auth
```javascript
router.get('/articles/:slug',
  optionalAuth,
  validate(getArticleBySlugSchema),
  articleController.getBySlug
);
```

### Status Transition with Validation
```javascript
router.post('/admin/articles/:id/publish',
  protect,
  restrictTo('admin'),
  validate(getArticleByIdSchema),
  validateArticleStatusTransition('published'),
  articleController.publish
);
```
