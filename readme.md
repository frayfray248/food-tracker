# Food Tracker Discord App

A Discord application that determines who should buy food for a regular group of friends. It uses a simple algorithm to ensure that everyone gets a turn, and that the same person doesn't have to buy food too often.

# Algorithm

Each user is assigned a score that is increased when they attend and decreased when they buy food. The user with the highest score is the next one to buy food. 

# Commands

This application adds the following commands to the Discord server:

- `/food-tracker-add-user @username`: Adds a user to the food tracker.
- `/food-tracker-remove-user @username`: Removes a user from the food tracker.
- `/food-tracker-attend @username`: Marks a user as attending, increasing their score by attendScore. Default 1.
- `/food-tracker-user-buy @username attendees`: Marks a user as buying food, decreasing their score by `buyScore * attendees`.
- `/food-tracker-report`: Displays the current scores of all users in the food tracker.
- `/food-tracker-ping-buyer`: Pings the user with the highest score, indicating that it's their turn to buy food.
- `/food-tracker-set-attend-score x`: Sets the score increase for attending to x. Default 1.
- `/food-tracker-set-buy-score x`: Sets the score decrease for buying food to x (per person). Default 1.
- `/food-tracker-set-score @username x`: Sets the score of a user to x.

# Scripts

- `npm start`: Compiles the TypeScript code and runs the application.
- `npm run dev`: Compiles the TypeScript code in watch mode, allowing for automatic recompilation when files change.
- `npm run build`: Compiles the TypeScript code without running the application.

# Example ENV
```
DISCORD_BOT_TOKEN=ABC123....
DISCORD_APP_ID=ABC123....
```

# OAuth2 Setup

Scopes:
- ✅ `applications.commands`
- ✅ `bot`

Bot Permissions:
- ✅ `Send Messages`

# Installation

1. Create a new Discord app and bot on the Discord Developer Portal.
2. Clone this repository and navigate to the project directory.
3. Install the dependencies using `npm install`.
4. Set up your environment variables in a `.env` file with your Discord bot token and app ID. (see example above)
5. Run the application using `npm start`
6. Install the app to your Discord server using the OAuth2 URL generated in the Discord Developer Portal.

# App Usage

1. Use the `/food-tracker-add-user @username` command to add users to the food tracker.
2. Use the `/food-tracker-attend @username` command to mark users as attending, which will increase their score.
3. Use the `/food-tracker-user-buy @username attendees` command to mark users as buying food, which will decrease their score based on the number of attendees.
4. Repeat steps 2 and 3 at each gathering to keep scores up to date.

# Data Storage

All data is stored in a simple SQLite database using Prisma ORM. The database is created automatically when the application is run for the first time. The database file is located at `./data/food-tracker.db`.