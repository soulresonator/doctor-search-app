# Sprint 1 Review

This review is written by myself, not by an AI. This review covers the business requirement more than technical requirement, all technical requirements must be covered by test cases.

# Sprint Goal Review

# Each task Review

## Registration

Pros:
- There is a form with enough fields for registration included "username", "password", "full_name", "phone_number", "age", "gender", "occupation"

Cons:
- We can type another type in "phone number", "age", "gender", and "occupation",  and these fields didn't apply the limiting rules, this is wierd, and there aren't test cases that cover these edge cases. The error, warning or hint notification at here should be appeared earlier, not only after submission, we need it be clearer, concise and real-time.
- Why there is only 1 field for password, it must be 2 fields for "password" and "confirm password" for security reasons.

## Login & Logout

Pros:
 - It is all good, clear, concise and easy to use.

Cons:
 - No problem here.

## Doctor listing at the dashboard

Pros:
 - Nice UI/UX

Cons:
 - Did we apply the pagination or infinite scroll for doctor listing?
  - There must be image for each doctor in the list, the image is large enough.

## Appointments listing at the dashboard

Pros:
 - Nothing

Cons:
 - Why did we need the field "Update Status" that only works for doctor role in the dashboard of the patient, and is that necessary for a patient to see this field?
 - There must be a modal that show more information of the appointment when click on the appointment in the dashboard, the modal is interactive and user-friendly.
 - Why can't the patient update or cancel the appointment?
 - 

## Find a doctor

Pros:
 - Gender search is good.
  
Cons:
 - Why aren't there dropdown menus for Specialty and location, the user can't know what is Specialization or location he/she should choose. These dropdown menu should be dynamic.
 - It will better if we have a real-time search (not recommend).
 - There should be a button "reset" to reset the search. 

## Make an appointment

Pros:
 - Act well.
  
Cons:
 - There must be a nice modal for the user to booking the appointment, the modal should show the doctor's information and allow the user to choose the date and time, the date and time should be real-time.


## More than it

1. There must be a page for user profile.
2. A doctor can login to see the list of appointments with him/her and confirm them, and a page for doctor profile.
3. Django works well but should we have a terminal UI app for the dev can easily migrating, creating superuser, run server, do actions,...?
