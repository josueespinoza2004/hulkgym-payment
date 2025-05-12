# Gym Payment Control System

## Overview
This project is a Gym Payment Control System built using plain JavaScript and HTML, with Bootstrap for styling and Supabase as the database. The application provides CRUD functionality for managing gym payment records, allowing users to filter by payment type and gender. It also includes notifications for expired services and overdue payments.

## Project Structure
```
gym-payment-control
├── src
│   ├── index.html          # Main HTML document
│   ├── css
│   │   └── styles.css      # Custom styles
│   ├── js
│   │   ├── app.js          # Application initialization and flow
│   │   ├── crud.js         # CRUD operations
│   │   ├── filter.js       # Filtering functionality
│   │   ├── notifications.js # Notifications for expired services
│   │   └── supabase.js     # Supabase database interactions
│   └── assets              # Additional assets (images/icons)
├── README.md               # Project documentation
└── package.json            # NPM configuration file
```

## Setup Instructions
1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd gym-payment-control
   ```

2. **Install dependencies**:
   Although this project does not use any frameworks, ensure you have Node.js installed. You can initialize npm and install any required packages if necessary:
   ```
   npm init -y
   ```

3. **Set up Supabase**:
   - Create a Supabase account and project.
   - Set up your database schema for payment records.
   - Update the `src/js/supabase.js` file with your Supabase URL and public API key.

4. **Open the application**:
   - Open `src/index.html` in your web browser to view the application.

## Usage Guidelines
- Use the provided forms to add, update, or delete payment records.
- Filter records by payment type (weekly, biweekly, monthly) and gender (male, female).
- Notifications will appear for any expired services or overdue payments.

## Contributing
Feel free to submit issues or pull requests for improvements or bug fixes. 

## License
This project is open-source and available under the MIT License.