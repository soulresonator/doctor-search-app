# Sprint 2 Plan

## Goal
Execute the tasks defined in `Sprint02Backlog.md` to polish the MVP, improve the UX for both patients and doctors, and add developer tooling.

## Scope & Technical Strategy

### 1. Frontend Enhancements (Next.js & Tailwind)
- **Forms**: Integrate `react-hook-form` + `zod` or simple state-based validation for real-time form validation on Registration.
- **UI Components**: Build reusable Modals for Booking and Appointment Details.
- **Search**: Fetch unique Specialties and Locations from the backend to populate `<select>` dropdowns on load. Add a Reset button.
- **Images**: Update UI to render placeholders or actual URLs for Doctor images.

### 2. Backend Enhancements (Django)
- **Models**: Add an `image_url` field to `Doctor`, the images can be stored in the backend and there must be a config file for setting up a path to store images, default path is `~/project-contents/doctor-app/images/`
- **API**: 
  - Expose `/api/v1/doctors/options/` to return available specialties and locations for the dropdowns.
  - Implement patient-side cancellation logic on the Appointment endpoint.
- **Pagination**: Enable DRF `PageNumberPagination` on the doctor list view.

### 3. Developer Tooling
- **Terminal UI**: Use `Textual` or `rich` in Python (or just a bash menu) to create a simple interactive CLI wrapper for Django management commands.

## Execution Order
1. **Backend API updates**: Pagination, Image field, Dropdown options endpoint, Patient cancel logic.
2. **Frontend UI updates**: Registration validation, Dashboard dropdowns, Reset button, Image display.
3. **Frontend Modals**: Booking Modal, Appointment Details Modal.
4. **Roles/Profiles**: User Profile Page, Doctor Dashboard.
5. **Dev Tools**: Terminal UI app.

## Definition of Done
- All backend changes covered by pytest.
- Frontend builds cleanly without errors.
- All UX feedback from Sprint 1 Review is addressed.
- Documentation updated as needed.
