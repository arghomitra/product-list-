# ProList: Your Smart Inventory Management Assistant

ProList is a modern, AI-powered web application designed to streamline inventory and order management for convenience stores, small businesses, or personal use. It provides an intuitive interface for managing a list of products, suggesting new orders based on historical data, and exporting lists in various formats.

Built with a professional tech stack, ProList is designed to be fast, reliable, and easy to use.

## ✨ Key Features

- **Dynamic Product List:** The list of available products is dynamically fetched from a Google Sheet, making it easy for administrators to update without code changes.
- **AI-Powered Order Suggestions:** Leverages Genkit and Google's Gemini AI to analyze your past 15 orders and intelligently suggest quantities for your next order, identifying trends and optimizing your inventory.
- **Persistent Lists:** Your current list quantities and notes are automatically saved to your browser's cookies, so your work is never lost, even if you close the tab.
- **Custom Comments:** Add extra notes, reminders, or one-off items to any order using the dedicated comment section.
- **Export & Share:**
    - **Download as PDF:** Generate a professional, clean PDF of your current order list, complete with your business logo.
    - **Print:** A print-friendly format allows for easy physical copies.
    - **Share:** Use your device's native share functionality to send the PDF list via email, messaging apps, and more.
- **Admin Management:** A password-protected admin section provides a direct link to the master Google Sheet for easy management of the product list.
- **User Privacy:** A cookie consent banner ensures transparency and compliance by informing users about data storage.
- **Responsive Design:** A clean, modern, and fully responsive UI built with ShadCN and Tailwind CSS ensures a great experience on any device.

## 🚀 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/)
- **AI Integration:** [Genkit (Google's Generative AI Toolkit)](https://firebase.google.com/docs/genkit)
- **Deployment:** Ready for [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

## 🔧 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation & Running Locally

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of your project and add your Google AI API key:
    ```
    GEMINI_API_KEY=your_google_ai_api_key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9002`.

## 🎛️ Features in Detail

### AI-Powered Order Suggestion

To help you order smarter, ProList can analyze your order history.
- The **"Suggest Order"** button becomes active once you have at least 15 saved orders.
- The AI considers the frequency and quantity of items in your recent orders to predict what you'll need next.
- The suggested quantities are automatically filled into your list, which you can then adjust as needed.

### List Management

- **Add Quantities:** Simply input the desired quantity next to each item.
- **Save List:** While the app saves automatically, a **"Save List"** button is provided in the "Comment" card for manual confirmation.
- **Clear List:** The **"Clear List"** button allows you to reset all quantities and notes in your current list.

### Admin Panel

- Access the admin panel via the **Settings** icon.
- Enter the password (`admin`) to get a link to the Google Sheet that populates the product list.
- From the Google Sheet, you can add, remove, or rename items, and the changes will be reflected in the app on the next page load.
