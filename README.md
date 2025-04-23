


### 🛠️ **Pre-requisites**

#### 1️⃣ **Install Node.js**
React requires Node.js to work. Follow these steps to install it:

1. **Download Node.js**
   - Visit the official Node.js website: [https://nodejs.org/](https://nodejs.org/).
   - Download the **LTS (Long Term Support)** version, as it is more stable.

2. **Install Node.js**
   - Run the installer and follow the instructions for your operating system.
   - The installer will also include **npm (Node Package Manager)**, which is required to manage dependencies.

3. **Verify the installation**
   - Open your terminal and run:
     ```bash
     node -v
     npm -v
     ```
   - This should display the installed versions of Node.js and npm.

---

### 🚀 **Project Setup**

#### ✅ 1. Clone the Repository
- If you're using GitHub CLI:
  ```bash
  gh repo clone angiegdg/Brand-Savings-Calculator
  cd Brand-Savings-Calculator
  ```
- If you don't have GitHub CLI:
  ```bash
  git clone https://github.com/angiegdg/Brand-Savings-Calculator.git
  cd Brand-Savings-Calculator
  ```

#### 📦 2. Install Dependencies
Make sure you're inside the project folder, then run:
```bash
npm install
```

This will install all required packages listed in `package.json`.

#### 🚀 3. Start the Development Server
Once the installation finishes, start the development server by running:
```bash
npm start
```

The app will launch at **http://localhost:3000**.

---

### 🎨 Tailwind CSS
Tailwind CSS is already configured in this project. It includes:
- `tailwind.config.js`
- `postcss.config.js`
- `src/index.css` with:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```

You're all set! Let me know if you need further assistance. 😊
