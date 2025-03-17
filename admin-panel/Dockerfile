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
    echo '                    // Reset button state' >> /app/public/index.html && \
    echo '                    loginButton.disabled = false;' >> /app/public/index.html && \
    echo '                    spinner.style.visibility = "hidden";' >> /app/public/index.html && \
    echo '                    buttonText.textContent = "Login";' >> /app/public/index.html && \
    echo '                    ' >> /app/public/index.html && \
    echo '                    // Show success message' >> /app/public/index.html && \
    echo '                    alert("Login successful!");' >> /app/public/index.html && \
    echo '                }, 1500);' >> /app/public/index.html && \
    echo '            });' >> /app/public/index.html && \
    echo '        });' >> /app/public/index.html && \
    echo '    </script>' >> /app/public/index.html && \
    echo '</body>' >> /app/public/index.html && \
    echo '</html>' >> /app/public/index.html

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
