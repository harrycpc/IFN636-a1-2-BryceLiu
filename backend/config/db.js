// config/db.js
const mongoose = require("mongoose");

// Set strictQuery explicitly to suppress the warning
//mongoose.set('strictQuery', true);

// database connection class. this class is a singleton, to ensure a single connection to the database and prevent waste of resources.
class DatabaseConnection {
    constructor() {
        this.connection = null;
    }

    async connect() {
        if (!this.connection) {
            this.connection = await mongoose.connect(process.env.MONGO_URI);
            console.log('MongoDB Connected');
        }
        return this.connection;
    }

    static getInstance() {
        if (!DatabaseConnection._instance) {
            DatabaseConnection._instance = new DatabaseConnection();
        }
        return DatabaseConnection._instance;
    }
}

module.exports = DatabaseConnection.getInstance();
