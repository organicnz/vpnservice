# Use a much simpler approach with just static files and a simple HTTP server
FROM node:20-alpine

# Create a non-root user first
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Install a simple HTTP server
RUN npm install -g http-server

# Create a beautiful HTML/CSS/JS admin panel
RUN mkdir -p /app/public

# Create index.html with a modern login form
RUN echo '<!DOCTYPE html>' > /app/public/index.html && \
    echo '<html lang="en">' >> /app/public/index.html && \
    echo '<head>' >> /app/public/index.html && \
    echo '    <meta charset="UTF-8">' >> /app/public/index.html && \
    echo '    <meta name="viewport" content="width=device-width, initial-scale=1.0">' >> /app/public/index.html && \
    echo '    <title>VPN Admin Panel</title>' >> /app/public/index.html && \
    echo '    <style>' >> /app/public/index.html && \
    echo '        body {' >> /app/public/index.html && \
    echo '            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;' >> /app/public/index.html && \
    echo '            margin: 0;' >> /app/public/index.html && \
    echo '            padding: 0;' >> /app/public/index.html && \
    echo '            background-color: #f5f7fa;' >> /app/public/index.html && \
    echo '            color: #333;' >> /app/public/index.html && \
    echo '            line-height: 1.6;' >> /app/public/index.html && \
    echo '        }' >> /app/public/index.html && \
    echo '        .container {' >> /app/public/index.html && \
    echo '            display: flex;' >> /app/public/index.html && \
    echo '            flex-direction: column;' >> /app/public/index.html && \
    echo '            justify-content: center;' >> /app/public/index.html && \
    echo '            align-items: center;' >> /app/public/index.html && \
    echo '            min-height: 100vh;' >> /app/public/index.html && \
    echo '            padding: 1rem;' >> /app/public/index.html && \
    echo '        }' >> /app/public/index.html && \
    echo '        .card {' >> /app/public/index.html && \
    echo '            background: white;' >> /app/public/index.html && \
    echo '            border-radius: 0.5rem;' >> /app/public/index.html && \
    echo '            box-shadow: 0 10px 25px rgba(0,0,0,0.05);' >> /app/public/index.html && \
    echo '            padding: 2rem;' >> /app/public/index.html && \
    echo '            max-width: 400px;' >> /app/public/index.html && \
    echo '            width: 100%;' >> /app/public/index.html && \
    echo '        }' >> /app/public/index.html && \
    echo '        h1 {' >> /app/public/index.html && \
    echo '            color: #3b82f6;' >> /app/public/index.html && \
    echo '            font-size: 1.875rem;' >> /app/public/index.html && \
    echo '            margin-bottom: 1rem;' >> /app/public/index.html && \
    echo '            text-align: center;' >> /app/public/index.html && \
    echo '        }' >> /app/public/index.html && \
    echo '        p {' >> /app/public/index.html && \
    echo '            color: #6b7280;' >> /app/public/index.html && \
    echo '            margin-bottom: 1.5rem;' >> /app/public/index.html && \
    echo '            text-align: center;' >> /app/public/index.html && \
    echo '        }' >> /app/public/index.html && \
    echo '        .form-group {' >> /app/public/index.html && \
    echo '            margin-bottom: 1.5rem;' >> /app/public/index.html && \
    echo '            width: 100%;' >> /app/public/index.html && \
    echo '        }' >> /app/public/index.html && \
    echo '        label {' >> /app/public/index.html && \
    echo '            display: block;' >> /app/public/index.html && \
    echo '            margin-bottom: 0.5rem;' >> /app/public/index.html && \
    echo '            font-weight: 500;' >> /app/public/index.html && \
    echo '            color: #4b5563;' >> /app/public/index.html && \
    echo '        }' >> /app/public/index.html && \
    echo '        input {' >> /app/public/index.html && \
    echo '            width: 100%;' >> /app/public/index.html && \
    echo '            padding: 0.75rem;' >> /app/public/index.html && \
    echo '            border: 1px solid #d1d5db;' >> /app/public/index.html && \
    echo '            border-radius: 0.375rem;' >> /app/public/index.html && \
    echo '            font-size: 1rem;' >> /app/public/index.html && \
    echo '        }' >> /app/public/index.html && \
    echo '        button {' >> /app/public/index.html && \
    echo '            width: 100%;' >> /app/public/index.html && \
    echo '            padding: 0.75rem;' >> /app/public/index.html && \
    echo '            background-color: #3b82f6;' >> /app/public/index.html && \
    echo '            color: white;' >> /app/public/index.html && \
    echo '            border: none;' >> /app/public/index.html && \
    echo '            border-radius: 0.375rem;' >> /app/public/index.html && \
    echo '            font-size: 1rem;' >> /app/public/index.html && \
    echo '            font-weight: 500;' >> /app/public/index.html && \
    echo '            cursor: pointer;' >> /app/public/index.html && \
    echo '        }' >> /app/public/index.html && \
    echo '        button:hover {' >> /app/public/index.html && \
    echo '            background-color: #2563eb;' >> /app/public/index.html && \
    echo '        }' >> /app/public/index.html && \
    echo '        .spinner {' >> /app/public/index.html && \
    echo '            display: inline-block;' >> /app/public/index.html && \
    echo '            width: 20px;' >> /app/public/index.html && \
    echo '            height: 20px;' >> /app/public/index.html && \
    echo '            margin-right: 8px;' >> /app/public/index.html && \
    echo '            border: 3px solid rgba(255,255,255,0.3);' >> /app/public/index.html && \
    echo '            border-radius: 50%;' >> /app/public/index.html && \
    echo '            border-top-color: white;' >> /app/public/index.html && \
    echo '            animation: spin 1s linear infinite;' >> /app/public/index.html && \
    echo '            visibility: hidden;' >> /app/public/index.html && \
    echo '        }' >> /app/public/index.html && \
    echo '        @keyframes spin {' >> /app/public/index.html && \
    echo '            to { transform: rotate(360deg); }' >> /app/public/index.html && \
    echo '        }' >> /app/public/index.html && \
    echo '        .footer {' >> /app/public/index.html && \
    echo '            margin-top: 2rem;' >> /app/public/index.html && \
    echo '            padding-top: 1rem;' >> /app/public/index.html && \
    echo '            border-top: 1px solid #e5e7eb;' >> /app/public/index.html && \
    echo '            text-align: center;' >> /app/public/index.html && \
    echo '        }' >> /app/public/index.html && \
    echo '        .footer p {' >> /app/public/index.html && \
    echo '            color: #9ca3af;' >> /app/public/index.html && \
    echo '            font-size: 0.875rem;' >> /app/public/index.html && \
    echo '            margin-bottom: 0;' >> /app/public/index.html && \
    echo '        }' >> /app/public/index.html && \
    echo '    </style>' >> /app/public/index.html && \
    echo '</head>' >> /app/public/index.html && \
    echo '<body>' >> /app/public/index.html && \
    echo '    <div class="container">' >> /app/public/index.html && \
    echo '        <div class="card">' >> /app/public/index.html && \
    echo '            <h1>VPN Admin Panel</h1>' >> /app/public/index.html && \
    echo '            <p>Welcome to the VPN Service administration panel.</p>' >> /app/public/index.html && \
    echo '            <form id="login-form">' >> /app/public/index.html && \
    echo '                <div class="form-group">' >> /app/public/index.html && \
    echo '                    <label for="username">Username</label>' >> /app/public/index.html && \
    echo '                    <input type="text" id="username" required>' >> /app/public/index.html && \
    echo '                </div>' >> /app/public/index.html && \
    echo '                <div class="form-group">' >> /app/public/index.html && \
    echo '                    <label for="password">Password</label>' >> /app/public/index.html && \
    echo '                    <input type="password" id="password" required>' >> /app/public/index.html && \
    echo '                </div>' >> /app/public/index.html && \
    echo '                <button type="submit" id="login-button">' >> /app/public/index.html && \
    echo '                    <span id="spinner" class="spinner"></span>' >> /app/public/index.html && \
    echo '                    <span id="button-text">Login</span>' >> /app/public/index.html && \
    echo '                </button>' >> /app/public/index.html && \
    echo '            </form>' >> /app/public/index.html && \
    echo '            <div class="footer">' >> /app/public/index.html && \
    echo '                <p>© 2023 VPN Service. All rights reserved.</p>' >> /app/public/index.html && \
    echo '            </div>' >> /app/public/index.html && \
    echo '        </div>' >> /app/public/index.html && \
    echo '    </div>' >> /app/public/index.html && \
    echo '    <script>' >> /app/public/index.html && \
    echo '        document.addEventListener("DOMContentLoaded", function() {' >> /app/public/index.html && \
    echo '            const loginForm = document.getElementById("login-form");' >> /app/public/index.html && \
    echo '            const loginButton = document.getElementById("login-button");' >> /app/public/index.html && \
    echo '            const spinner = document.getElementById("spinner");' >> /app/public/index.html && \
    echo '            const buttonText = document.getElementById("button-text");' >> /app/public/index.html && \
    echo '' >> /app/public/index.html && \
    echo '            loginForm.addEventListener("submit", function(event) {' >> /app/public/index.html && \
    echo '                event.preventDefault();' >> /app/public/index.html && \
    echo '                ' >> /app/public/index.html && \
    echo '                // Show loading state' >> /app/public/index.html && \
    echo '                loginButton.disabled = true;' >> /app/public/index.html && \
    echo '                spinner.style.visibility = "visible";' >> /app/public/index.html && \
    echo '                buttonText.textContent = "Processing...";' >> /app/public/index.html && \
    echo '                ' >> /app/public/index.html && \
    echo '                // Simulate authentication process' >> /app/public/index.html && \
    echo '                setTimeout(function() {' >> /app/public/index.html && \
    echo '                    // Redirect to dashboard page after successful login' >> /app/public/index.html && \
    echo '                    window.location.href = "dashboard.html";' >> /app/public/index.html && \
    echo '                }, 1500);' >> /app/public/index.html && \
    echo '            });' >> /app/public/index.html && \
    echo '        });' >> /app/public/index.html && \
    echo '    </script>' >> /app/public/index.html && \
    echo '</body>' >> /app/public/index.html && \
    echo '</html>' >> /app/public/index.html

# Create dashboard.html for after successful login
RUN echo '<!DOCTYPE html>' > /app/public/dashboard.html && \
    echo '<html lang="en">' >> /app/public/dashboard.html && \
    echo '<head>' >> /app/public/dashboard.html && \
    echo '    <meta charset="UTF-8">' >> /app/public/dashboard.html && \
    echo '    <meta name="viewport" content="width=device-width, initial-scale=1.0">' >> /app/public/dashboard.html && \
    echo '    <title>VPN Admin Dashboard</title>' >> /app/public/dashboard.html && \
    echo '    <style>' >> /app/public/dashboard.html && \
    echo '        body {' >> /app/public/dashboard.html && \
    echo '            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;' >> /app/public/dashboard.html && \
    echo '            margin: 0;' >> /app/public/dashboard.html && \
    echo '            padding: 0;' >> /app/public/dashboard.html && \
    echo '            background-color: #f5f7fa;' >> /app/public/dashboard.html && \
    echo '            color: #333;' >> /app/public/dashboard.html && \
    echo '            line-height: 1.6;' >> /app/public/dashboard.html && \
    echo '        }' >> /app/public/dashboard.html && \
    echo '        .navbar {' >> /app/public/dashboard.html && \
    echo '            background-color: #3b82f6;' >> /app/public/dashboard.html && \
    echo '            padding: 1rem;' >> /app/public/dashboard.html && \
    echo '            color: white;' >> /app/public/dashboard.html && \
    echo '            display: flex;' >> /app/public/dashboard.html && \
    echo '            justify-content: space-between;' >> /app/public/dashboard.html && \
    echo '            align-items: center;' >> /app/public/dashboard.html && \
    echo '        }' >> /app/public/dashboard.html && \
    echo '        .navbar h1 {' >> /app/public/dashboard.html && \
    echo '            margin: 0;' >> /app/public/dashboard.html && \
    echo '            font-size: 1.5rem;' >> /app/public/dashboard.html && \
    echo '        }' >> /app/public/dashboard.html && \
    echo '        .logout-btn {' >> /app/public/dashboard.html && \
    echo '            background-color: rgba(255, 255, 255, 0.2);' >> /app/public/dashboard.html && \
    echo '            color: white;' >> /app/public/dashboard.html && \
    echo '            border: none;' >> /app/public/dashboard.html && \
    echo '            padding: 0.5rem 1rem;' >> /app/public/dashboard.html && \
    echo '            border-radius: 0.25rem;' >> /app/public/dashboard.html && \
    echo '            cursor: pointer;' >> /app/public/dashboard.html && \
    echo '        }' >> /app/public/dashboard.html && \
    echo '        .container {' >> /app/public/dashboard.html && \
    echo '            max-width: 1200px;' >> /app/public/dashboard.html && \
    echo '            margin: 0 auto;' >> /app/public/dashboard.html && \
    echo '            padding: 2rem;' >> /app/public/dashboard.html && \
    echo '        }' >> /app/public/dashboard.html && \
    echo '        .dashboard-card {' >> /app/public/dashboard.html && \
    echo '            background: white;' >> /app/public/dashboard.html && \
    echo '            border-radius: 0.5rem;' >> /app/public/dashboard.html && \
    echo '            box-shadow: 0 2px 10px rgba(0,0,0,0.05);' >> /app/public/dashboard.html && \
    echo '            padding: 1.5rem;' >> /app/public/dashboard.html && \
    echo '            margin-bottom: 1.5rem;' >> /app/public/dashboard.html && \
    echo '        }' >> /app/public/dashboard.html && \
    echo '        .card-title {' >> /app/public/dashboard.html && \
    echo '            font-size: 1.25rem;' >> /app/public/dashboard.html && \
    echo '            color: #1f2937;' >> /app/public/dashboard.html && \
    echo '            margin-top: 0;' >> /app/public/dashboard.html && \
    echo '            margin-bottom: 1rem;' >> /app/public/dashboard.html && \
    echo '            border-bottom: 1px solid #e5e7eb;' >> /app/public/dashboard.html && \
    echo '            padding-bottom: 0.75rem;' >> /app/public/dashboard.html && \
    echo '        }' >> /app/public/dashboard.html && \
    echo '        .stats {' >> /app/public/dashboard.html && \
    echo '            display: grid;' >> /app/public/dashboard.html && \
    echo '            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));' >> /app/public/dashboard.html && \
    echo '            gap: 1.5rem;' >> /app/public/dashboard.html && \
    echo '        }' >> /app/public/dashboard.html && \
    echo '        .stat-card {' >> /app/public/dashboard.html && \
    echo '            background: #f9fafb;' >> /app/public/dashboard.html && \
    echo '            padding: 1.5rem;' >> /app/public/dashboard.html && \
    echo '            border-radius: 0.5rem;' >> /app/public/dashboard.html && \
    echo '            text-align: center;' >> /app/public/dashboard.html && \
    echo '        }' >> /app/public/dashboard.html && \
    echo '        .stat-value {' >> /app/public/dashboard.html && \
    echo '            font-size: 2rem;' >> /app/public/dashboard.html && \
    echo '            font-weight: bold;' >> /app/public/dashboard.html && \
    echo '            color: #3b82f6;' >> /app/public/dashboard.html && \
    echo '            margin-bottom: 0.5rem;' >> /app/public/dashboard.html && \
    echo '        }' >> /app/public/dashboard.html && \
    echo '        .stat-label {' >> /app/public/dashboard.html && \
    echo '            color: #6b7280;' >> /app/public/dashboard.html && \
    echo '            font-size: 0.875rem;' >> /app/public/dashboard.html && \
    echo '        }' >> /app/public/dashboard.html && \
    echo '        .btn {' >> /app/public/dashboard.html && \
    echo '            padding: 0.5rem 1rem;' >> /app/public/dashboard.html && \
    echo '            border-radius: 0.25rem;' >> /app/public/dashboard.html && \
    echo '            font-weight: 500;' >> /app/public/dashboard.html && \
    echo '            cursor: pointer;' >> /app/public/dashboard.html && \
    echo '            border: none;' >> /app/public/dashboard.html && \
    echo '        }' >> /app/public/dashboard.html && \
    echo '        .btn-primary {' >> /app/public/dashboard.html && \
    echo '            background-color: #3b82f6;' >> /app/public/dashboard.html && \
    echo '            color: white;' >> /app/public/dashboard.html && \
    echo '        }' >> /app/public/dashboard.html && \
    echo '        .btn-primary:hover {' >> /app/public/dashboard.html && \
    echo '            background-color: #2563eb;' >> /app/public/dashboard.html && \
    echo '        }' >> /app/public/dashboard.html && \
    echo '        .footer {' >> /app/public/dashboard.html && \
    echo '            text-align: center;' >> /app/public/dashboard.html && \
    echo '            margin-top: 2rem;' >> /app/public/dashboard.html && \
    echo '            padding-top: 1rem;' >> /app/public/dashboard.html && \
    echo '            color: #9ca3af;' >> /app/public/dashboard.html && \
    echo '            font-size: 0.875rem;' >> /app/public/dashboard.html && \
    echo '        }' >> /app/public/dashboard.html && \
    echo '    </style>' >> /app/public/dashboard.html && \
    echo '</head>' >> /app/public/dashboard.html && \
    echo '<body>' >> /app/public/dashboard.html && \
    echo '    <div class="navbar">' >> /app/public/dashboard.html && \
    echo '        <h1>VPN Admin Dashboard</h1>' >> /app/public/dashboard.html && \
    echo '        <button class="logout-btn" id="logout-btn">Logout</button>' >> /app/public/dashboard.html && \
    echo '    </div>' >> /app/public/dashboard.html && \
    echo '    <div class="container">' >> /app/public/dashboard.html && \
    echo '        <div class="dashboard-card">' >> /app/public/dashboard.html && \
    echo '            <h2 class="card-title">System Overview</h2>' >> /app/public/dashboard.html && \
    echo '            <div class="stats">' >> /app/public/dashboard.html && \
    echo '                <div class="stat-card">' >> /app/public/dashboard.html && \
    echo '                    <div class="stat-value">42</div>' >> /app/public/dashboard.html && \
    echo '                    <div class="stat-label">Active Users</div>' >> /app/public/dashboard.html && \
    echo '                </div>' >> /app/public/dashboard.html && \
    echo '                <div class="stat-card">' >> /app/public/dashboard.html && \
    echo '                    <div class="stat-value">125 GB</div>' >> /app/public/dashboard.html && \
    echo '                    <div class="stat-label">Total Traffic</div>' >> /app/public/dashboard.html && \
    echo '                </div>' >> /app/public/dashboard.html && \
    echo '                <div class="stat-card">' >> /app/public/dashboard.html && \
    echo '                    <div class="stat-value">99.9%</div>' >> /app/public/dashboard.html && \
    echo '                    <div class="stat-label">Uptime</div>' >> /app/public/dashboard.html && \
    echo '                </div>' >> /app/public/dashboard.html && \
    echo '                <div class="stat-card">' >> /app/public/dashboard.html && \
    echo '                    <div class="stat-value">12</div>' >> /app/public/dashboard.html && \
    echo '                    <div class="stat-label">Servers Online</div>' >> /app/public/dashboard.html && \
    echo '                </div>' >> /app/public/dashboard.html && \
    echo '            </div>' >> /app/public/dashboard.html && \
    echo '        </div>' >> /app/public/dashboard.html && \
    echo '        <div class="dashboard-card">' >> /app/public/dashboard.html && \
    echo '            <h2 class="card-title">Recent Activity</h2>' >> /app/public/dashboard.html && \
    echo '            <p>User <strong>john_doe</strong> connected from IP 192.168.1.1 at 10:23 AM</p>' >> /app/public/dashboard.html && \
    echo '            <p>User <strong>jane_smith</strong> disconnected after 2.5 hours at 9:15 AM</p>' >> /app/public/dashboard.html && \
    echo '            <p>Server <strong>us-west-1</strong> restarted at 8:30 AM</p>' >> /app/public/dashboard.html && \
    echo '            <p>New user <strong>alex_wilson</strong> registered at 7:45 AM</p>' >> /app/public/dashboard.html && \
    echo '        </div>' >> /app/public/dashboard.html && \
    echo '        <div class="dashboard-card">' >> /app/public/dashboard.html && \
    echo '            <h2 class="card-title">Quick Actions</h2>' >> /app/public/dashboard.html && \
    echo '            <div style="display: flex; gap: 1rem;">' >> /app/public/dashboard.html && \
    echo '                <button class="btn btn-primary">Add New User</button>' >> /app/public/dashboard.html && \
    echo '                <button class="btn btn-primary">Generate Report</button>' >> /app/public/dashboard.html && \
    echo '                <button class="btn btn-primary">System Settings</button>' >> /app/public/dashboard.html && \
    echo '                <button class="btn btn-primary">View All Users</button>' >> /app/public/dashboard.html && \
    echo '            </div>' >> /app/public/dashboard.html && \
    echo '        </div>' >> /app/public/dashboard.html && \
    echo '    </div>' >> /app/public/dashboard.html && \
    echo '    <div class="footer">' >> /app/public/dashboard.html && \
    echo '        <p>© 2023 VPN Service. All rights reserved.</p>' >> /app/public/dashboard.html && \
    echo '    </div>' >> /app/public/dashboard.html && \
    echo '    <script>' >> /app/public/dashboard.html && \
    echo '        document.addEventListener("DOMContentLoaded", function() {' >> /app/public/dashboard.html && \
    echo '            const logoutBtn = document.getElementById("logout-btn");' >> /app/public/dashboard.html && \
    echo '            logoutBtn.addEventListener("click", function() {' >> /app/public/dashboard.html && \
    echo '                // In a real app, would clear session/token here' >> /app/public/dashboard.html && \
    echo '                window.location.href = "index.html";' >> /app/public/dashboard.html && \
    echo '            });' >> /app/public/dashboard.html && \
    echo '            ' >> /app/public/dashboard.html && \
    echo '            // Set a welcome message' >> /app/public/dashboard.html && \
    echo '            setTimeout(function() {' >> /app/public/dashboard.html && \
    echo '                alert("Welcome to the VPN Admin Dashboard!");' >> /app/public/dashboard.html && \
    echo '            }, 500);' >> /app/public/dashboard.html && \
    echo '        });' >> /app/public/dashboard.html && \
    echo '    </script>' >> /app/public/dashboard.html && \
    echo '</body>' >> /app/public/dashboard.html && \
    echo '</html>' >> /app/public/dashboard.html

# Create a health check file
RUN echo '<!DOCTYPE html>' > /app/public/health.html && \
    echo '<html><body>OK</body></html>' >> /app/public/health.html

# Set correct permissions
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose the port the app runs on
EXPOSE 3000

# Set up a health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q -O - http://localhost:3000/health.html || exit 1

# Command to run the application
CMD ["http-server", "/app/public", "-p", "3000", "--cors"]
