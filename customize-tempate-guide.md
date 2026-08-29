ঠিক আছে। তাহলে **user নিজে custom template তৈরি করবে না**—সে শুধু **Custom Template Order/Request** করবে। এরপর তোমরা/admin request review করে template তৈরি করবে এবং নির্দিষ্ট user-এর account-এ assign করবে। User multiple reference image/file upload করতে পারবে।

এই business logic অনুযায়ী পুরো AI command-টা rewrite করে দিলাম:

You are working inside my existing `@facebook-automation/` SaaS project.

I want to add a complete **Template Customization + Custom Template Request** system.

Before changing anything, thoroughly inspect the existing project architecture, including:

* Laravel structure
* Models
* Migrations
* Controllers
* Services / Actions
* Helpers
* Media Helper
* Facebook/OpenGraph integration
* Image post creation flow
* Scheduling system
* Comments system
* Authentication
* Authorization / Policies
* Inertia
* Vue components
* Sidebar/navigation
* Admin system
* Existing file/media upload system
* Existing order/request-related functionality

Do NOT create an isolated architecture.

The new feature must integrate naturally with the existing SaaS architecture.

---

# BUSINESS MODEL

The application will have two types of templates:

## 1. Common / Predefined Templates

These templates are created and managed by the application/admin.

They are available to all users.

Examples:

* News
* Breaking News
* Promotion
* Announcement
* Quote
* Product
* Social Media
* Story
* etc.

Some or all of these can be free.

Users can select a common template and customize it for creating a post.

---

# 2. Custom Templates

Users CANNOT create their own custom templates directly.

Instead, a user must submit a **Custom Template Request / Order**.

The workflow is:

User
→ Custom Template Request
→ Upload reference images/files
→ Add requirements/instructions
→ Submit request
→ Admin/team reviews request
→ Admin/team creates the template
→ Template is assigned to that specific user
→ User can see/use the assigned template
→ User can customize content within the template
→ Generate final image
→ Create Facebook image post
→ Publish or schedule

This distinction is extremely important.

A user should never be able to create arbitrary custom template definitions themselves.

---

# SIDEBAR

Add a new sidebar parent menu:

**Customization**

Under it:

* Templates
* Custom Template Requests

Use the existing sidebar/navigation architecture, icons, active states and permission system.

If "Create Template" currently exists in the planned architecture, DO NOT expose it as a user feature.

Users should request custom templates instead.

---

# TEMPLATES PAGE

Create a Templates page.

The page should show:

## Common Templates

Templates available to everyone.

## My Custom Templates

Only templates that have been assigned to the currently authenticated user.

A user must NOT see another user's custom templates.

Template cards should contain:

* Preview image
* Template name
* Template type
* Aspect ratio
* Common / My Template indicator
* Edit/Customize action
* Use Template action

The UI should follow the existing application's design system.

---

# TEMPLATE TYPES / ASPECT RATIOS

The template architecture should support different dimensions/aspect ratios.

At minimum support:

* Square — 1:1
* Portrait — 4:5
* Story — 9:16
* Landscape — 16:9

The system must not be hard-coded so that future ratios can be added easily.

A template should be able to define:

* Type
* Aspect ratio
* Width
* Height
* Preview
* Editable elements
* Template configuration/definition

Follow the existing database conventions.

---

# COMMON TEMPLATE CUSTOMIZATION

A user can select a common template.

For example:

Templates
→ Breaking News 1:1
→ Customize

The user can edit the allowed fields/elements of the template.

Possible editable elements:

* Text
* Title
* Subtitle
* Description
* Font
* Font size
* Font weight
* Text color
* Alignment
* Images
* Logo
* Background image
* Shapes
* Overlays
* Position
* Size
* Cropping

The exact editor implementation should be decided after inspecting the current frontend architecture.

Do not unnecessarily introduce a huge canvas framework if a simpler maintainable approach fits the project.

---

# CUSTOM TEMPLATE REQUEST SYSTEM

Users should have a dedicated page:

**Custom Template Requests**

This is where they request templates from the application/admin team.

The user should be able to create a request.

Example:

Title:
"Daily News Template"

Template Type:

* Square
* 4:5
* Story
* 16:9
* etc.

Requirements:
A rich text/textarea field describing what they want.

The user should also be able to upload **multiple reference files/images**.

For example:

* Existing design screenshots
* Logos
* Brand images
* Sample designs
* Background images
* Reference photos
* PSD/PDF/etc. if supported by the existing media/file architecture
* Multiple images at once

Do NOT limit the request to one image.

Use the existing media/file upload infrastructure where possible.

If the project already has a Media Helper, file service, attachment system or storage abstraction, reuse it.

---

# MULTIPLE FILE UPLOAD

A custom template request must support multiple attachments.

The data model should properly represent:

Custom Template Request
→ Multiple Attachments

Do not store multiple file paths in one database column.

Use a proper related attachment/media structure.

For example, conceptually:

custom_template_requests
custom_template_request_attachments

But first inspect the existing media/attachment architecture and reuse it if appropriate.

Each attachment should retain appropriate metadata such as:

* File/media ID
* Original filename
* Type/MIME
* Path/storage reference
* Size
* Uploaded timestamp

Do not duplicate file storage logic if the application already provides it.

---

# REQUEST STATUS

A custom template request should have a clear lifecycle.

For example:

* Draft
* Submitted
* Under Review
* In Progress
* Awaiting Information
* Completed
* Rejected
* Cancelled

Do not blindly use these exact statuses if the existing project has an established status architecture.

Choose a clean status workflow compatible with the existing application.

The user should be able to see the current status of their request.

---

# ADMIN / TEAM WORKFLOW

The admin/team side should be able to:

* View requests
* View requesting user
* View all uploaded reference files/images
* Read requirements
* Change status
* Add internal notes if the existing architecture supports notes
* Create/build the requested template
* Assign the completed template to the requesting user
* Optionally request additional information
* Mark request as completed

The exact admin UI should follow the existing admin architecture.

Do NOT expose other users' private template information to normal users.

---

# TEMPLATE ASSIGNMENT

When the admin/team finishes a custom template:

The template is assigned to a specific user.

Example:

User A requests:

"News Breaking Template"

Admin creates the template.

Admin assigns it to User A.

Now:

User A → can see and use the template.

User B → cannot see or access it.

This ownership must be enforced at the backend.

Do NOT rely only on frontend filtering.

---

# PRIVACY / AUTHORIZATION

This is mandatory.

A private custom template belongs to exactly one user unless the system explicitly marks it as common/public.

Backend authorization must prevent users from accessing another user's:

* Custom template
* Template configuration
* Template preview
* Template generated assets
* Custom template request
* Request attachments
* Private template data

Changing an ID in:

* URL
* Inertia request
* API request
* Form request
* AJAX request

must NOT allow unauthorized access.

Use Laravel Policies, Gates, Form Requests or the project's existing authorization architecture.

---

# TEMPLATE OWNERSHIP MODEL

Design the template model so it can clearly represent:

### Common template

Owned/managed by the system/admin.

Visible to all users.

### User template

Owned/assigned to one specific user.

Visible only to that user.

Avoid confusing "created_by" and "owned_by" if they represent different concepts.

For example, the admin/team may create a template but assign ownership to User A.

The architecture should correctly represent this distinction.

---

# TEMPLATE REQUEST → TEMPLATE RELATIONSHIP

A completed custom template should be traceable back to the request that generated it.

Conceptually:

User
→ Custom Template Request
→ Attachments
→ Created Template
→ Assigned User

This allows future auditing and management.

If one request can result in multiple templates, design the relationship accordingly.

Do not unnecessarily assume one request = one template unless that is clearly the best architecture.

---

# USER TEMPLATE REUSE

Once a custom template is assigned to a user, the user can reuse it many times.

Example:

My Custom Templates
→ Daily Breaking News
→ Customize
→ Change headline
→ Change image
→ Generate
→ Create Post

The template itself remains reusable.

The generated image is an individual output/snapshot.

Changing the template later must NOT modify already generated/published/scheduled post images.

---

# TEMPLATE EDITOR

When the user selects a template:

Templates
→ Select Template
→ Editor

The editor should load the template definition/configuration.

The user can modify only the elements that are intended to be editable.

For example, a template may have:

* Fixed logo
* Fixed background
* Editable headline
* Editable subtitle
* Editable main image

The template configuration should define which elements are editable.

Do not allow users to accidentally modify protected/master elements unless the template explicitly allows it.

---

# GENERATED IMAGE

After customization:

User clicks:

**Generate Image**

The application renders the final template into a real image.

The generated image should preserve the template's configured:

* Width
* Height
* Aspect ratio
* Quality

The final image must be stored through the application's existing media/storage architecture.

If the project already has a Media Helper/service:

USE IT.

Do not create another unrelated upload/storage system.

---

# FACEBOOK IMAGE POST INTEGRATION

The generated image must become a normal image post.

The flow should be:

Template
→ Customize
→ Generate Image
→ Media Helper
→ Existing Media System
→ Existing Image Post Creation
→ Existing Facebook/OpenGraph Pipeline

Do NOT create a separate Facebook posting implementation for templates.

Find the existing image-post/OpenGraph implementation and reuse it.

The user should be able to:

* Select Facebook Page/account
* Add caption/content
* Generate image
* Publish immediately
* Save draft
* Schedule
* View publishing status
* Handle errors

The generated image should behave exactly like an existing image post.

---

# SCHEDULING

Template-generated posts must support the existing scheduling system.

Do NOT create a new scheduler.

Reuse:

* Existing scheduled post model
* Existing jobs
* Existing queues
* Existing commands
* Existing status handling

If normal image posts already support scheduling, template-generated images should use the same pipeline.

---

# COMMENTS

Template-generated Facebook posts must use the existing comments architecture.

Do NOT create a separate comments system.

If the existing image-post flow already supports comments, template-generated image posts should automatically inherit that behavior.

---

# POST SNAPSHOT / IMMUTABILITY

A generated image used for a post should be treated as a snapshot.

Example:

Monday:
User creates template image → schedules post.

Tuesday:
Admin modifies the template.

Monday's scheduled post must still publish the original generated image.

Template modifications must never silently change existing generated/published/scheduled post assets.

Design the relationships and storage accordingly.

---

# CUSTOM TEMPLATE REQUEST ATTACHMENTS

A user can attach multiple files when submitting a request.

The UI should support:

* Multiple file selection
* Drag & drop if consistent with existing UI
* Image preview where appropriate
* File name
* File size
* Remove attachment before submission
* Upload progress if supported
* Validation errors
* Maximum file count/size based on application configuration

Do not invent arbitrary restrictive limits without checking existing application/storage configuration.

---

# REQUEST DETAILS

A custom template request can contain information such as:

* Template name/title
* Template type
* Aspect ratio
* Desired dimensions
* Description
* Design requirements
* Text placement requirements
* Brand/logo requirements
* Color/style requirements
* Reference images
* Other attachments

The structure should remain extensible.

---

# FREE / PAID CONCEPT

Some common templates will be free.

Custom template creation is a service that users request/order.

The user does not directly create the design.

The user submits the request and the application/team handles the creation.

Design the system so that future billing/payment integration can be added.

If the current project already has:

* Orders
* Payments
* Subscriptions
* Billing

integrate with that architecture.

If not, do NOT build a complete payment system just for this feature.

Create a clean extension point for future billing.

---

# ADMIN TEMPLATE LIBRARY

The admin/team should be able to manage common templates.

Common templates should support:

* Create
* Edit
* Activate/deactivate
* Preview
* Template type
* Aspect ratio
* Template configuration
* Editable elements
* Delete/archive if appropriate

Follow existing admin patterns.

---

# TEMPLATE CATEGORIES

If useful based on the current architecture, support categories such as:

* News
* Business
* Promotion
* Quote
* Announcement
* Product
* Story
* Event
* Other

Do not over-engineer categories if the existing project does not need them.

---

# DATABASE DESIGN

Before writing migrations, inspect the existing schema.

Determine whether existing tables can be reused.

Potential concepts may include:

* templates
* template_types
* template_attachments
* custom_template_requests
* custom_template_request_attachments
* template_assignments
* template_versions

But DO NOT automatically create all of these.

Use the smallest clean architecture that fits the existing project.

Important requirements:

* Common templates must be globally available.
* Private templates must have clear user ownership/assignment.
* Requests must belong to users.
* Requests must support multiple attachments.
* Templates should be traceable to their request when applicable.
* Generated images must use existing media infrastructure.
* Existing posts must remain compatible.

---

# FRONTEND PAGES

Implement appropriate Inertia/Vue pages based on the existing project.

Potential pages:

### User

`Customization / Templates`

Shows:

* Common templates
* My custom templates
* Filters
* Search
* Template previews

### User

`Customization / Templates / Edit`

Template editor.

### User

`Customization / Custom Template Requests`

Shows user's requests and statuses.

### User

`Customization / Custom Template Requests / Create`

Request form with:

* Template requirements
* Aspect ratio/type
* Multiple file uploads
* Submit request

### User

`Customization / Custom Template Requests / Show`

Shows:

* Request information
* Status
* Uploaded attachments
* Admin/team response if supported
* Assigned template when completed

Admin pages should follow the existing admin architecture.

---

# ROUTES

Use the existing route naming conventions.

Protect user routes with authentication.

Protect private template/request routes with proper authorization.

Do not expose private template endpoints publicly.

---

# SERVICES / ACTIONS

Inspect the existing application first.

Where possible, reuse existing services/actions for:

* Media
* Image generation
* Post creation
* Facebook publishing
* OpenGraph
* Scheduling
* File upload
* Authorization

Only create new services where a new responsibility genuinely exists.

Possible responsibilities include:

* Template rendering
* Template customization
* Custom template request management
* Template assignment

But follow existing project conventions.

---

# TESTING

Add tests for the important business rules.

At minimum:

### Common Templates

* Any authenticated user can view common templates.
* Common templates can be customized.
* Common template master is not modified by user customization.

### Private Templates

* User A can see User A's template.
* User B cannot see User A's template.
* User B cannot access User A's template by changing IDs.
* User B cannot access User A's template configuration.
* User B cannot use User A's private template.

### Requests

* User can create a custom template request.
* Request belongs to the correct user.
* Request supports multiple attachments.
* User can only view their own requests.
* User cannot access another user's request.
* Admin/team can manage requests.

### Assignment

* Admin/team can assign a completed template to a user.
* Assigned user can see the template.
* Other users cannot see it.

### Image Generation

* Template can generate a final image.
* Generated image is stored through the existing Media Helper/system.
* Generated image has correct dimensions/aspect ratio.

### Posts

* Generated image can create a normal image post.
* Existing OpenGraph/Facebook pipeline is reused.
* Immediate publishing works.
* Scheduling works.
* Generated image remains immutable after template changes.

---

# IMPORTANT ARCHITECTURAL RULES

Do NOT:

* Allow users to directly create arbitrary custom templates.
* Allow users to access another user's templates.
* Store multiple attachments in one database column.
* Create a duplicate media upload system.
* Create a duplicate Facebook/OpenGraph service.
* Create a duplicate scheduling system.
* Create a duplicate comments system.
* Modify the common/master template when a user customizes it.
* Let template changes affect already generated posts.
* Build unnecessary payment infrastructure.
* Add unnecessary dependencies.

DO:

* Reuse the existing architecture.
* Reuse existing Media Helper.
* Reuse existing image-post pipeline.
* Reuse existing Facebook/OpenGraph implementation.
* Reuse existing scheduler.
* Reuse existing authorization.
* Reuse existing upload/storage system.
* Reuse existing UI components.
* Keep common and private templates clearly separated.
* Support multiple request attachments.
* Make private templates backend-protected.
* Keep generated post images as immutable snapshots.

---

# IMPLEMENTATION PROCESS

Do NOT start by immediately creating migrations.

First:

1. Inspect the complete relevant architecture.
2. Identify reusable models/services.
3. Identify the existing image-post flow.
4. Identify Media Helper.
5. Identify Facebook/OpenGraph integration.
6. Identify scheduler.
7. Identify comments.
8. Identify authorization/policies.
9. Identify existing file upload architecture.
10. Identify admin architecture.
11. Identify existing order/request architecture if any.
12. Create an implementation plan.
13. Then implement the feature.

Make architectural decisions based on the actual project instead of assuming a generic Laravel application.

After implementation, run the relevant tests and fix any regressions.

---

# FINAL RESULT

The final user experience should be:

### Common template

Customization
→ Templates
→ Common Template
→ Customize
→ Generate Image
→ Create Image Post
→ Publish / Schedule

### Custom template

Customization
→ Custom Template Requests
→ Create Request
→ Describe requirements
→ Select template type/aspect ratio
→ Upload multiple reference images/files
→ Submit
→ Admin/team creates template
→ Admin assigns template to user
→ User sees it under My Templates
→ Customize
→ Generate Image
→ Create Image Post
→ Publish / Schedule

The key business rule is:

**Users request custom templates; they do not create custom template designs themselves. The application/admin/team creates the design and assigns it to the requesting user.**

Common templates are shared and available to everyone, while assigned custom templates are private to the assigned user.

Implement this as a first-class part of the existing SaaS, not as a separate isolated system.
