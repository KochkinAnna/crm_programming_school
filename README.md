<p align="center">
  <a href="http://localhost:5000/api/doc" target="blank"><img src="https://i.pinimg.com/564x/94/2d/4a/942d4a0d8dba0da5fa359b9d76a73c3b.jpg" width="600" alt="Project Logo_ CRM Programming school" /></a>
</p>

_<p align="center"> Welcome to the backend of CRM Programming School! This project serves as the backend component of the CRM system, providing a robust and efficient API for managing student applications and inquiries. Powered by Nest.js, TypeScript, and integrated with MySQL database, this backend solution offers seamless data storage and retrieval.</p>_

Features:

- Exposes RESTful APIs for creating, updating, and retrieving student applications.
- Implements authentication and authorization mechanisms to ensure secure access.
- Utilizes MySQL service for efficient data management.
- Supports flexible query parameters for filtering and sorting applications.
- Integrates with frontend applications to provide a complete CRM experience.

The CRM Programming School backend offers a scalable and reliable foundation to handle your application management needs. Streamline your processes, enhance collaboration, and provide excellent service to your students with this powerful backend solution.

Please refer to the accompanying documentation for detailed instructions on setting up and using the CRM Programming School backend.

Note: This repository contains the backend code only. For the frontend application, please refer to the corresponding repository.

If you would like to contribute to the project, feel free to submit a pull request. Please follow the existing code style. Happy coding!

----
## Technical Specification

This project aims to develop a request management system for Programming School. It utilizes the following technologies and tools:

- Nest.js
- TypeScript
- MySQL (with http://owu.linkpc.net/mysql service)

----
## Requirements

Before getting started, ensure that the following dependencies are installed on your computer:

- Node.js (recommended version 14.x.x or higher)
- NPM (recommended version 6.x.x or higher)

----
## Setup Instructions

Follow the steps below to run the project:

1. Clone the repository to your local machine:

```
git clone <repository-url>
```

Replace <repository-url> with the actual URL of the project repository.


2. Install the project dependencies:

```
npm install
```


3. Start the server:

```
npm run start
```

Once the server is successfully running, you will see a message indicating its status.

4. Open your web browser and access the following URL:

```
http://localhost:<PORT>
```

Replace `<PORT>` with the port number you specified in the `.env` configuration file.

5. Enjoy the application :)


----
## Project Details

Upon accessing the project's host, you will be directed to the login page.

The project includes two roles: **admin** and **manager**.

By default, an admin account is available for authentication with the following credentials:

- **Email**: admin@gmail.com
- **Password**: admin

After successful login, you will be redirected to the applications page. The displayed fields for each application include:

- id, name, surname, email, phone, age, course, course_format, course_type, status, sum, alreadyPaid, created_at

The applications are paginated, with a default of 25 applications per page, listed in descending order.

The pagination panel operates as follows:

- When you are on the first page: **First Page**
- When you are on a page in the first half of all pages, excluding the first: **First Half**
- When you are on a page in the second half of all pages, excluding the last: **Second Half**
- When you are on the last page: **Last Page**

The current page should be reflected in the query parameters. When accessing the project via a query parameter, you should be directed to the corresponding page.

Ordering can be applied to each column by clicking on the column name. This triggers sorting in either ascending or descending order, and the sorting choice is stored in the query parameters.

Additional columns are added:

- **manager**: Indicates the manager assigned to process the application.
- **group**: Represents the group to which the application can be assigned.

Clicking on an application expands its details:

- The "Message" and "UTM" fields display information from the database table.
- An input field allows you to enter comments.
- Comments can only be added to applications without an assigned manager.
- Upon submitting a comment, the current user's surname is recorded in the "manager" column, and the status is set to "In Work" if it was previously null or "New."
- The comment, author, and date should be displayed.

Clicking the "EDIT" button opens a modal window with an edit form:

- Only applications without an assigned manager can be edited.
- All form fields can be left empty.
- The form include functionality to add a new group directly from the form (the group name must be unique).
- Performed validation.


----
## Postman help
To make a request in Postman, you can follow these steps:

1. Open Postman and select the appropriate query method.
2. Enter the URL, replacing :the appropriate parameter with the actual value.
3. Customize any necessary headers or parameters for the request.
4. Click the Send button (or press the Enter hotkey) to send the request.<p> Remember that you must have the server running on your `http://localhost:<PORT>` to successfully connect and receive a response.</p>

Here is the link for the postman:    
https://api.postman.com/collections/25901530-faedb7f6-91d1-486a-81d8-0f44b0528465?access_key=PMAT-01H1MG0HV42PSQJS3Q4Q40G92X


----
## Stay in touch
- Author - [Anna Kochkina](https://github.com/KochkinAnna)
- Mail me - kochkinaanichka@gmail.com
- Call me - +380500554417

----