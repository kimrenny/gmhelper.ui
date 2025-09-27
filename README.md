# GMHelper Frontend

This is the frontend of the GMHelper application, built with Angular (standalone components).

## Table of Contents

- [Overview](#overview)
- [Technologies](#technologies)
- [Getting Started](#getting-started)
  - [Running with Docker](#running-with-docker)
  - [Running without Docker](#running-without-docker)
  - [HTTPS / Secure Mode](#https--secure-mode)
- [Configuration](#configuration)
- [Notes](#notes)

## Overview

The frontend provides the user interface for the GMHelper application.
It communicates with the backend API for user authentication, data management, and admin functionalities.  
GMHelper is intended to assist in solving mathematical and geometry problems with the help of AI.
This feature is planned for future implementation.

## Technologies

- Angular (standalone components)
- SCSS for styling
- ngx-translate for translations
- ngRx for state management

## Getting Started

### Running with Docker

To run the full application (frontend + backend) using Docker:

1. Clone both repositories into the same folder:

   - GMHelper UI: [https://github.com/kimrenny/gmhelper.ui](https://github.com/kimrenny/gmhelper.ui)
   - GMHelper Backend: [https://github.com/kimrenny/gmhelper.backend](https://github.com/kimrenny/gmhelper.backend)

2. Open a terminal in the `backend` folder and run:

```bash
docker compose up --build
```

After the containers are running, the application will be available at:

Frontend: [http://localhost:4200](http://localhost:4200)

Backend/API: [http://localhost:7057](http://localhost:7057)

### Running without Docker

To run the frontend locally without Docker:

1. Open a terminal in the frontend folder.

2. Run the application:

```bash
ng serve
```

3. The frontend will be available at [http://localhost:4200](http://localhost:4200)

**Note**: Backend must be running separately if you want the frontend to interact with it.

### HTTPS / Secure Mode

For proper operation, both the frontend and backend must be run in HTTPS mode.

To run the frontend in development mode with HTTPS, use:

```bash
ng serve --ssl true
```

Make sure the backend API is also configured to use HTTPS if you want to avoid mixed content issues.

### Configuration

You can change the API URL the frontend connects to by modifying the `apiUrl` parameter in the following files:
`src/environments/environment.ts`

`src/environments/environment.prod.ts`

### Notes

- Make sure Node.js and Angular CLI are installed if running locally.

- Docker and Docker Compose are required for running via containers.

- Translations are handled via ngx-translate.

- SCSS is used for all styling; no plain CSS is included.

- Application state is managed using ngRx. Most data interactions are handled through the store.
