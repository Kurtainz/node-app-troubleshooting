# Node.js Application Troubleshooting & Security Improvements

A practical application troubleshooting and security project involving the investigation, repair and improvement of an existing Node.js/Express to-do application.

The project began with an intentionally faulty application provided as part of a technical assessment. The objective was to identify and resolve functional defects, investigate security weaknesses, improve application reliability and document the work undertaken.

The exercise covered REST API troubleshooting, JavaScript debugging, input validation, cross-site scripting (XSS) prevention, configuration management, data persistence and CI/CD security checks.

## Technologies Used

- **Backend:** Node.js, Express
- **Frontend:** JavaScript, HTML
- **Data storage:** Local JSON file
- **Logging:** Morgan
- **Automation:** GitHub Actions
- **Security:** npm audit, input validation, XSS remediation
- **Utilities:** Python log-analysis script
- **Development tools:** Git, VS Code

## Project Objectives

The primary objectives were to:

1. Restore the application's broken functionality.
2. Investigate and resolve defects affecting its REST API.
3. Identify and remediate significant security vulnerabilities.
4. Improve application configuration and reliability.
5. Implement persistence so that data survives application restarts.
6. Introduce automated security checks through CI/CD.
7. Document the findings, fixes and potential production improvements.

## Issues Identified and Resolved

Ten issues were identified and addressed during the assessment.

| # | Issue | Root cause | Resolution |
|---|---|---|---|
| 1 | Application entry point not found | Incorrect filename | Renamed `server.js` to `index.js` |
| 2 | Missing Morgan dependency | Package absent from `package.json` | Added the required dependency |
| 3 | Application unavailable on port 3000 | Incorrect port configuration | Corrected the default port and added support for the `PORT` environment variable |
| 4 | Vulnerable Lodash dependency | Outdated dependency version | Updated the dependency |
| 5 | To-do completion functionality broken | Strict comparison between numeric and string IDs | Added explicit ID type conversion |
| 6 | Incorrect to-do deletion | Array index confused with record ID | Corrected the record lookup and deletion logic |
| 7 | Malformed POST requests caused errors | Missing server-side input validation | Added input validation and controlled HTTP 400 responses |
| 8 | Debug endpoint exposed environment information | `process.env` returned in the response | Removed environment disclosure and restricted endpoint access |
| 9 | Hardcoded administrator token | Credential embedded in source code | Moved the token to an environment variable |
| 10 | Stored XSS vulnerability | Untrusted content inserted using `innerHTML` | Replaced unsafe HTML insertion with safe DOM manipulation |

## Key Technical Improvements

### 1. REST API troubleshooting and input validation

The application exposed REST endpoints for managing to-do records. Several operations were not functioning correctly.

**Updating records**

The PUT endpoint failed to locate records because the application compared numeric IDs against string values using strict equality.

The issue was resolved by explicitly converting the supplied ID to a number before performing the lookup.

**Deleting records**

The DELETE endpoint incorrectly handled record IDs as array indices, which could result in the wrong record being removed.

The logic was updated to locate the correct array index associated with the requested record ID.

**Request validation**

The `POST /api/todos` endpoint assumed incoming data contained a valid string and attempted to call `trim()` without checking the input type.

Malformed requests could therefore trigger application errors.

Server-side validation was introduced to reject missing, invalid, empty or excessively long values with controlled HTTP 400 responses.

### 2. Security improvements

Several security weaknesses were identified during the assessment.

**Sensitive information disclosure**

The `/api/debug` endpoint was accessible without authentication and exposed the application's environment variables through `process.env`.

This was particularly concerning because environment variables can contain credentials, tokens and other sensitive configuration information.

The environment disclosure was removed, and access to the endpoint was restricted using an administrator token.

**Hardcoded credentials**

The administrator token was originally stored directly in the source code.

It was moved to an environment variable to separate sensitive configuration from application code.

This reduces the risk of credentials being accidentally exposed through source control.

**Stored cross-site scripting (XSS)**

The frontend used `innerHTML` to insert user-controlled to-do content into the page.

This allowed untrusted input to be interpreted as HTML, potentially enabling JavaScript injection.

The vulnerable logic was replaced with safer DOM manipulation, ensuring that user-provided text is treated as text rather than executable HTML.

**Vulnerable dependencies**

A critically vulnerable Lodash dependency was identified and updated.

Automated dependency vulnerability checking was also introduced through GitHub Actions.

### 3. Data persistence

The original application did not provide persistent storage for to-do records.

A file-based persistence mechanism was introduced, allowing records to be saved to a local JSON file and restored when the application restarts.

The application also checks whether saved to-do data exists and uses default records when appropriate.

This is suitable for demonstrating persistence in a small application, although a database such as PostgreSQL or MySQL would be more appropriate for a production environment.

### 4. CI/CD security checks

A GitHub Actions workflow was added to perform automated checks when changes are pushed to the repository.

The workflow uses `npm audit` to identify known vulnerabilities in the application's dependency tree.

This provides an initial automated security check and demonstrates how dependency scanning can be incorporated into the development workflow.

Potential future improvements include:

- Automated unit and integration tests
- Static application security testing (SAST)
- Secret scanning
- Linting and code quality checks
- Dynamic application security testing (DAST)

### 5. Logging and log analysis

Morgan was added to provide HTTP request logging.

A separate Python utility, `analyse.sh`, was also provided to analyse a supplied log file using a specified log level.

The utility can be invoked using:

```bash
./analyse.sh <LEVEL> <path-to-log-file>
```

This work provided additional experience with application diagnostics and processing log data.

## Running the Application

### Prerequisites

- Node.js and npm

### Installation

Navigate to the application directory and install its dependencies:

```bash
cd app
npm install
```

Start the application:

```bash
npm start
```

By default, the application listens on port `3000`.

To use another port, set the `PORT` environment variable before starting the application:

```bash
PORT=4000 npm start
```

The application also requires an administrator token to access its restricted debug functionality. Configure this through the relevant environment variable rather than embedding the token in source code.

## Production Readiness Considerations

Although the assessment addressed several significant defects and vulnerabilities, the application is not intended to represent a production-ready service.

Three areas were identified as priorities for further development.

### Authentication and authorisation

Replace the shared administrator token with a proper user authentication and authorisation system.

This would enable individual user accounts, private to-do records and role-based access to privileged functionality.

### Database-backed persistence

Replace the local JSON file with a database such as PostgreSQL or MySQL.

This would provide a more robust foundation for concurrent access, data integrity and future application functionality.

### Application security hardening

Introduce additional security controls, including:

- Appropriate HTTP security headers
- HTTPS for deployed environments
- Further review or removal of diagnostic functionality
- Expanded automated testing and security scanning

## Lessons Learned

### Prioritising work under time constraints

One of the main challenges was deciding which issues to address within the limited time available.

The exercise required balancing functional fixes, security remediation, optional improvements and testing.

### Validating security findings

The assessment reinforced the importance of investigating security findings rather than accepting automated tool output without further analysis.

For example, an AI-assisted review identified the absence of CSRF protection as a potential concern.

After reviewing the application's behaviour and authentication model, I concluded that this was not among the most urgent risks in its existing configuration.

This highlighted the importance of evaluating vulnerabilities in the context of the application and its actual attack surface.

### Understanding unfamiliar code

The project provided practical experience investigating an existing codebase, tracing application behaviour, identifying root causes and implementing targeted fixes.

Rather than building a new application from scratch, the work focused on diagnosing and improving an unfamiliar system.

## Use of AI Tools

ChatGPT and GitHub Copilot were used during the assessment.

ChatGPT was primarily used for planning, discussing troubleshooting approaches and identifying useful API test scenarios.

GitHub Copilot was used within VS Code to assist with code investigation, modification and security review.

AI-generated changes were manually reviewed and tested before being accepted. Security findings were also evaluated for their relevance and practical impact.

## Further Development

If I continue developing the project, the main priorities would be:

1. Add automated API tests to verify functionality and prevent regressions.
2. Expand the CI/CD pipeline with additional code quality and security checks.
3. Replace JSON-file persistence with a relational database.
4. Introduce proper user authentication and authorisation.
5. Add additional application monitoring and diagnostic capabilities.

## Project Summary

This project demonstrates practical experience in:

- Investigating and fixing defects in an unfamiliar application
- Troubleshooting REST API functionality and HTTP request handling
- Identifying and remediating application security vulnerabilities
- Improving configuration and data persistence
- Introducing basic CI/CD security automation
- Documenting technical findings and evaluating production-readiness improvements

The emphasis was on understanding existing software, diagnosing problems systematically and implementing improvements that make the application more reliable and secure.