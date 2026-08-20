# Sprint 2 Review

Based on Sprint 2 Backlog, this review will cover all tasks of the backlog.

## Epic 1: Registration & Profile Polish
- **Task 1.1**: Add real-time validation and boundary limits to registration fields (age, phone, etc.). -> Finished, work well.
- **Task 1.2**: Add "Confirm Password" field to registration. -> Finished, work well.
- **Task 1.3**: Create a User Profile page (View & Edit). -> Finished, but can't update profile, need to add avatar image upload for user.

## Epic 2: Patient Booking & Dashboard
- **Task 2.1**: Implement dynamic dropdowns for Specialty and Location in the search bar. -> Finished, work pretty well.
- **Task 2.2**: Add a "Reset" button to clear search filters. -> Finished.
- **Task 2.3**: Update Doctor Listing to include Doctor images and implement pagination/infinite scroll. -> Not done, no mocking find here, we need to complete this feature in sprint 03.
SPECIAL: at Sprint 03, we should add a feature that we contact to the doctor by a other chat app platform, then, the doctor can receive the appointment request and confirm or cancel it, the doctor also can update his/her profile and availability, including profile image by just in the chat, we need an automation bot to do these.
- **Task 2.4**: Create a rich Booking Modal showing doctor info and allowing Date/Time selection. -> Finished, but we need some buttons for user can fast book by choosing tomorrow, day after tomorrow, weekend, or some day. Also we need to add a cancel button for user can cancel the appointment, and when the user cancels the appointment, the doctor should be notified by chat, and that is weird when I can make an appointment for 200 years in the future, that is hilarious, we need to limit the date range for booking.
- **Task 2.5**: Create an Appointment Details Modal on the dashboard. -> Finished
- **Task 2.6**: Allow patients to Cancel their appointments (remove Doctor-only 'Update Status' from patient view). -> Finished,

## Epic 3: Doctor Experience
- **Task 3.1**: Create a dedicated Doctor Profile page. -> Give up this task, there is a replacement in sprint 03
- **Task 3.2**: Create a Doctor Dashboard view for managing incoming appointments (Confirm/Cancel). -> Give up this task, there is a replace ment in sprint 03.

## Epic 4: Developer Experience (DX)
- **Task 4.1**: Build a terminal UI app (TUI) to wrap `manage.py` commands  (migrations, superuser, runserver) for easier backend management. -> Finished.

## More than features

- Reminded at the top, there is a connection to other chat applications to send notifications or receive appointment requests, the applications are Telegram Bot, Whatsapp Bot, and Facebook Messenger Bot - but now we only complete the Discord Bot for testing in Sprint 03.

- For developing process, we need a command to reset the database (drop all tables and create all tables again), and a command to reset the database and seed with mock data for testing purposes.

- In the next Sprint, we need to apply CI/CD for auto testing for this app.