# Windows Setup Guide - Maryland Food Bank Forecasting System

Complete step-by-step guide to set up both the **Frontend (Next.js)** and **Backend (Python + Docker)** on Windows.

---

## Table of Contents

1. [Prerequisites Installation](#prerequisites-installation)
2. [Frontend Setup (Next.js)](#frontend-setup-nextjs)
3. [Backend Setup (Docker)](#backend-setup-docker)
4. [Verification & Testing](#verification--testing)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites Installation

### Step 1: Install Node.js

Node.js is required to run the Next.js frontend.

1. **Download Node.js:**

   - Visit: [https://nodejs.org/](https://nodejs.org/)
   - Download the **LTS (Long Term Support)** version for Windows
   - Current recommended: Node.js 20.x or later

2. **Install Node.js:**

   - Run the downloaded `.msi` installer
   - Click "Next" through the installation wizard
   - **IMPORTANT:** Make sure "Add to PATH" is checked
   - Click "Install" and wait for completion

3. **Verify Installation:**
   - Open **Command Prompt** (search "cmd" in Start menu)
   - Run these commands:
   ```bash
   node -v
   npm -v
   ```
   - You should see version numbers (e.g., `v20.10.0` and `10.2.3`)

### Step 2: Install Git

Git is required to clone the project repository.

1. **Download Git:**

   - Visit: [https://git-scm.com/download/win](https://git-scm.com/download/win)
   - Download the latest version for Windows

2. **Install Git:**

   - Run the downloaded installer
   - Use default settings (just click "Next")
   - **IMPORTANT:** Select "Git from the command line and also from 3rd-party software"
   - Complete the installation

3. **Verify Installation:**
   - Open a new **Command Prompt**
   - Run:
   ```bash
   git --version
   ```
   - You should see the Git version (e.g., `git version 2.43.0`)

### Step 3: Install Docker Desktop

Docker is required to run the Python backend in a container.

1. **Download Docker Desktop:**

   - Visit: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
   - Click "Download for Windows"
   - Save the `Docker Desktop Installer.exe` file

2. **Install Docker Desktop:**

   - Run the installer as Administrator (right-click > Run as administrator)
   - During installation:
     - **Check** "Use WSL 2 instead of Hyper-V" (recommended)
     - **Check** "Add shortcut to desktop"
   - Click "Ok" to install
   - Restart your computer when prompted

3. **Start Docker Desktop:**

   - After restart, open **Docker Desktop** from Start menu
   - Accept the Docker Subscription Service Agreement
   - Wait for Docker to start (you'll see "Docker Desktop is running" in system tray)
   - The Docker icon should appear in the system tray (bottom-right corner)

4. **Verify Docker Installation:**
   - Open **Command Prompt**
   - Run:
   ```bash
   docker --version
   docker-compose --version
   ```
   - You should see version numbers

> **Note:** If Docker asks to enable WSL 2, follow the prompts. You may need to install the WSL 2 Linux kernel update from Microsoft.

---

## Frontend Setup (Next.js)

### Step 1: Clone the Frontend Repository

1. **Open Command Prompt:**

   - Press `Win + R`, type `cmd`, press Enter

2. **Navigate to Your Workspace:**

   ```bash
   cd C:\Users\YourUsername\Documents
   mkdir Projects
   cd Projects
   ```

   - Replace `YourUsername` with your Windows username

3. **Clone the Repository:**
   ```bash
   git clone https://github.com/Aijazshaikrx21259/mfb-forecasting-ui.git
   cd mfb-forecasting-ui
   ```

   - Repository URL: [https://github.com/Aijazshaikrx21259/mfb-forecasting-ui.git](https://github.com/Aijazshaikrx21259/mfb-forecasting-ui.git)

### Step 2: Install Frontend Dependencies

1. **Install npm Packages:**

   ```bash
   npm install
   ```

   - This will take 2-5 minutes
   - You'll see progress as packages are downloaded

2. **Wait for Completion:**
   - Look for "added XXX packages" message
   - If you see any warnings, that's usually okay

### Step 3: Set Up Environment Variables

1. **Create Environment File:**

   - In the `mfb-forecasting-ui` folder, create a new file named `.env.local`
   - You can use Notepad:

   ```bash
   notepad .env.local
   ```

   - Click "Yes" when asked to create a new file

2. **Add Environment Variables:**

   - Copy and paste this template into `.env.local`:

   ```env
   # Backend API Configuration
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   NEXT_PUBLIC_API_KEY=your-api-key-here

   # Clerk Authentication (if using)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key-here
   CLERK_SECRET_KEY=your-clerk-secret-key-here
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/login
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/register
   ```

3. **Replace Placeholders:**
   - Replace `your-api-key-here` with your actual API key
   - Replace Clerk keys if you're using authentication
   - **Save and close** the file (Ctrl+S, then close Notepad)

### Step 4: Start the Frontend

1. **Run the Development Server:**

   ```bash
   npm run dev
   ```

2. **Verify Frontend is Running:**

   - You should see:

   ```
   - ready started server on 0.0.0.0:3000
   - Local: http://localhost:3000
   ```

   - Open your browser and go to: [http://localhost:3000](http://localhost:3000)
   - You should see the Maryland Food Bank Forecasting homepage

3. **Keep This Window Open:**
   - Don't close this Command Prompt window
   - The frontend will continue running here

---

## Backend Setup (Docker)

### Step 1: Clone the Backend Repository

1. **Open a NEW Command Prompt Window:**

   - Press `Win + R`, type `cmd`, press Enter

2. **Navigate to Your Workspace:**

   ```bash
   cd C:\Users\YourUsername\Documents\Projects
   ```

3. **Clone the Backend Repository:**
   ```bash
   git clone https://github.com/Aijazshaikrx21259/mfb-forecasting-api.git
   cd mfb-forecasting-api
   ```

   - Repository URL: [https://github.com/Aijazshaikrx21259/mfb-forecasting-api.git](https://github.com/Aijazshaikrx21259/mfb-forecasting-api.git)

### Step 2: Set Up Backend Environment Variables

1. **Copy Example Environment File:**

   ```bash
   copy env.example .env
   ```

2. **Edit Environment File:**

   - Open `.env` file in Notepad:

   ```bash
   notepad .env
   ```

3. **Configure Environment Variables:**

   - Replace placeholders with your actual values:

   ```env
   # Database Configuration
   DATABASE_URL=your-postgres-connection-string-here

   # API Configuration
   API_KEY=your-api-key-here

   # Optional: Perplexity AI for research features
   PERPLEXITY_API_KEY=your-perplexity-key-here
   ```

4. **Save and Close:**
   - Press Ctrl+S to save
   - Close Notepad

### Step 3: Build the Docker Image

1. **Ensure Docker Desktop is Running:**

   - Check the system tray for the Docker icon
   - It should say "Docker Desktop is running"

2. **Build the Backend Image:**

   ```bash
   docker-compose build
   ```

   - This will take 5-10 minutes the first time
   - Docker is downloading and installing all Python dependencies

3. **Wait for Completion:**
   - You'll see many lines of output
   - Look for "Successfully built" message

### Step 4: Start the Backend Container

1. **Start the Backend:**

   ```bash
   docker-compose up -d
   ```

   - The `-d` flag runs it in the background (detached mode)

2. **Check Container Status:**

   ```bash
   docker-compose ps
   ```

   - You should see a container running on port 8000

3. **View Logs (Optional):**
   ```bash
   docker-compose logs -f
   ```
   - This shows real-time backend logs
   - Press `Ctrl+C` to stop viewing logs (container keeps running)

### Step 5: Verify Backend is Running

1. **Test the Health Endpoint:**

   - Open your browser
   - Go to: [http://localhost:8000/health](http://localhost:8000/health)
   - You should see: `{"status": "healthy"}`

2. **Test the API Docs:**
   - Go to: [http://localhost:8000/docs](http://localhost:8000/docs)
   - You should see the FastAPI interactive documentation

---

## Verification & Testing

### Full System Check

1. **Frontend Running:**

   - Open: [http://localhost:3000](http://localhost:3000)
   - You should see the homepage

2. **Backend Running:**

   - Open: [http://localhost:8000/health](http://localhost:8000/health)
   - You should see `{"status": "healthy"}`

3. **Frontend-Backend Connection:**
   - In the frontend, go to: [http://localhost:3000/items](http://localhost:3000/items)
   - If you see items loading, the connection is working!
   - If you see an error, check that both servers are running

### Common Commands

**Frontend (in `mfb-forecasting-ui` folder):**

```bash
# Start development server
npm run dev

# Stop server (press in the terminal)
Ctrl+C

# Reinstall dependencies
npm install
```

**Backend (in `mfb-forecasting-api` folder):**

```bash
# Start backend
docker-compose up -d

# Stop backend
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose up -d --build

# Check running containers
docker ps
```

---

## Troubleshooting

### Frontend Issues

**Problem: `npm install` fails**

- Solution: Delete `node_modules` folder and `package-lock.json`, then run `npm install` again
- Make sure you have a stable internet connection

**Problem: Port 3000 already in use**

- Solution: Kill the process using port 3000:
  ```bash
  netstat -ano | findstr :3000
  taskkill /PID <PID-NUMBER> /F
  ```
- Or run on a different port:
  ```bash
  npm run dev -- -p 3001
  ```

**Problem: Environment variables not loading**

- Make sure file is named `.env.local` (not `.env.local.txt`)
- Restart the dev server after changing environment variables

### Backend Issues

**Problem: Docker Desktop won't start**

- Restart your computer
- Make sure virtualization is enabled in BIOS
- Try running Docker Desktop as Administrator

**Problem: `docker-compose` command not found**

- Use `docker compose` (space instead of hyphen) with newer Docker versions
- Or reinstall Docker Desktop

**Problem: Port 8000 already in use**

- Stop any other services using port 8000
- Or change the port in `docker-compose.yaml`:
  ```yaml
  ports:
    - "8001:8000" # Use 8001 on host, 8000 in container
  ```
- Don't forget to update `.env.local` in frontend to use the new port

**Problem: Container won't start**

- Check logs:
  ```bash
  docker-compose logs
  ```
- Make sure `.env` file has all required variables
- Try rebuilding:
  ```bash
  docker-compose down
  docker-compose up -d --build
  ```

**Problem: Database connection error**

- Verify your `DATABASE_URL` in `.env` is correct
- Make sure your database is accessible from your Windows machine
- Check firewall settings

### General Tips

1. **Always run Docker Desktop before starting the backend**
2. **Use separate Command Prompt windows for frontend and backend**
3. **Check the system tray for Docker status**
4. **Restart both services after changing environment variables**
5. **Check Windows Firewall if services can't connect**

---

## Next Steps

Once everything is running:

1. **Explore the Frontend:**

   - Homepage: [http://localhost:3000](http://localhost:3000)
   - Items Page: [http://localhost:3000/items](http://localhost:3000/items)
   - Purchase Plan: [http://localhost:3000/purchase-plan](http://localhost:3000/purchase-plan)

2. **Explore the Backend API:**

   - API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
   - Health Check: [http://localhost:8000/health](http://localhost:8000/health)

3. **Start Development:**
   - Frontend code is in: `mfb-forecasting-ui/app` and `mfb-forecasting-ui/components`
   - Backend code is in: `mfb-forecasting-api/app`
   - Make changes and see them live!

---

## Quick Reference Card

| Task                | Command                                          |
| ------------------- | ------------------------------------------------ |
| Start Frontend      | `cd mfb-forecasting-ui && npm run dev`           |
| Stop Frontend       | Press `Ctrl+C` in terminal                       |
| Start Backend       | `cd mfb-forecasting-api && docker-compose up -d` |
| Stop Backend        | `cd mfb-forecasting-api && docker-compose down`  |
| View Backend Logs   | `docker-compose logs -f`                         |
| Rebuild Backend     | `docker-compose up -d --build`                   |
| Check Docker Status | `docker ps`                                      |
| Frontend URL        | http://localhost:3000                            |
| Backend URL         | http://localhost:8000                            |
| API Docs            | http://localhost:8000/docs                       |

---

## Need Help?

- Check the FAQ page in the application: [http://localhost:3000/faq](http://localhost:3000/faq)
- Review Docker logs for backend issues: `docker-compose logs`
- Check browser console for frontend issues (F12 in browser)
- Refer to the main README files in each repository

---

**Setup Complete!** You're now ready to develop and test the Maryland Food Bank Forecasting System on Windows.
