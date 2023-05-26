<p align="center">
  <a href="http://localhost:3000/" target="blank"><img src="https://i.pinimg.com/564x/94/2d/4a/942d4a0d8dba0da5fa359b9d76a73c3b.jpg" width="600" alt="Project Logo_ CRM Programming school" /></a>
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

2. Navigate to the project directory:

```
cd crm
```

3. Install the project dependencies:

```
npm install
```

4. Create a configuration file named `.env` in the project's root directory and set the required environment variables. Here's an example of the .env file:

```
# Configuration for MongoDB Atlas
MONGO_URI=<MongoDB Atlas connection URI>

# Configuration for MySQL
MYSQL_HOST=<MySQL server host>
MYSQL_PORT=<MySQL server port>
MYSQL_USER=<MySQL user>
MYSQL_PASSWORD=<MySQL user password>
MYSQL_DATABASE=<database name>

# Server configuration
PORT=<server port>
```

Replace the values according to your own configuration.

5. We are utilizing the Prisma CLI. As a best practice, it's recommended to invoke the CLI locally by prefixing it with npx: 

```
npx prisma
```
Now create your initial Prisma setup using the init command of the Prisma CLI: 

```
npx prisma init
```

6. Start the server:

```
npm run start
```

Once the server is successfully running, you will see a message indicating its status.

6. Open your web browser and access the following URL:

```
http://localhost:<PORT>
```

Replace `<PORT>` with the port number you specified in the `.env` configuration file.

7. Enjoy the application :)

----
## Database Migration

The project utilizes database migration to set up the necessary schemas and tables. To perform the migration, execute the following command:

```
npm run migration:run
```
This command will create the required tables in the MySQL database.

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

The available statuses (Status) are:

- In Work
- New
- Aggre
- Disaggre
- Dubbing

The available courses are:

- FS
- QACX
- JCX
- JSCX
- FE
- PCX

The available course types are:

- pro
- minimal
- premium
- incubator
- vip

The available course formats are:

- static
- online

----
## Execution of business logic:

1. __Admin:__
- AdminController: A controller used for administrative operations that include managing users, applications, setting access rights, and more.

- AdminService: Contains logic related to administrative operations. Includes user management, application management, access rights, and other administrative functions.

- AdminModule: Combines AdminController and AdminService. Used to inject AdminService into the controller and register the corresponding routes.

2. __Application:__
- ApplicationController: The controller that handles application operations. This includes creating a new application, retrieving the application list, updating the application status, etc.

- ApplicationService: Contains the logic associated with applications. This includes operations for creating, retrieving, and updating applications, as well as working with application statuses.

- ApplicationModule: Combines ApplicationController and ApplicationService. It is used to inject the ApplicationService into the controller and register the corresponding routes.

3. __Auth:__
- AuthController: A controller for user authentication and authorization. This controller will contain operations such as registration, login, logout, session management, etc.

- AuthService: Responsible for user authentication and authorization. Includes registration, login, logout, session management, and other related functions.

- AuthModule: Combines AuthController and AuthService. It is used to inject AuthService into the controller and register the corresponding routes.

4. __User:__
- UserController: A controller that is responsible for user-related operations such as creating a new user, retrieving user data, updating a profile, etc.

- UserService: Responsible for user-related logic. This includes operations for creating, retrieving, and updating users, as well as managing their profiles.

- UserModule: Combines UserController and UserService. It is used to inject UserService into the controller and register the corresponding routes.

Routing is configured to associate URLs with the appropriate controllers and methods.

----
## Postman help
To make a request in Postman, you can follow these steps:

1. Open Postman and select the appropriate query method.
2. Enter the URL, replacing :the appropriate parameter with the actual value.
3. Customize any necessary headers or parameters for the request.
4. Click the Send button (or press the Enter hotkey) to send the request.<p> Remember that you must have the server running on your `http://localhost:<PORT>` to successfully connect and receive a response.</p>

Here is the link for the postman: __ВСТАВИТИ__

----
## Stay in touch
- Author - [Anna Kochkina](https://github.com/KochkinAnna)
- Mail me - kochkinaanichka@gmail.com
- Call me - +380500554417

----