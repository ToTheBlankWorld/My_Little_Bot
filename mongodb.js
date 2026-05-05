const { MongoClient } = require('mongodb');
const colors = require('./UI/colors/colors');
const config = require("./config.js");
require('dotenv').config();

let client; 

if (config.mongodbUri) {
    const uri = config.mongodbUri;
    client = new MongoClient(uri);
} else {
    try {
        const { getLangSync } = require('./utils/languageLoader.js');
        const lang = getLangSync();
        console.warn("\x1b[33m[ WARNING ]\x1b[0m " + (lang.console?.mongodb?.uriNotDefined || "MongoDB URI is not defined in the configuration."));
    } catch (e) {
        console.warn("\x1b[33m[ WARNING ]\x1b[0m MongoDB URI is not defined in the configuration.");
    }
}

async function connectToDatabase() {
    try {
        const { getLangSync } = require('./utils/languageLoader.js');
        const lang = getLangSync();
        if (!client) {
            console.warn("\x1b[33m[ WARNING ]\x1b[0m " + (lang.console?.mongodb?.skippingConnection || "Skipping MongoDB connection as URI is not provided."));
            return;
        }

        await client.connect();
        console.log('\n' + '─'.repeat(40));
        console.log(`${colors.magenta}${colors.bright}${lang.console?.bot?.databaseConnection || '🕸️  DATABASE CONNECTION'}${colors.reset}`);
        console.log('─'.repeat(40));
        console.log('\x1b[36m[ DATABASE ]\x1b[0m', '\x1b[32m' + (lang.console?.mongodb?.connected || 'Connected to MongoDB ✅') + '\x1b[0m');
    } catch (err) {
        const { getLangSync } = require('./utils/languageLoader.js');
        const lang = getLangSync();
        console.warn("\x1b[33m[ WARNING ]\x1b[0m " + (lang.console?.mongodb?.connectionFailed || "Could not connect to MongoDB. Continuing without database functionality."));
        console.error(err.message);
    }
}

let collections = {
    playlist: null,
    autoplay: null,
    language: null
};

async function initializeCollections() {
    try {
        if (!client) return;
        
        const db = client.db("PrimeMusicSSRR");
        collections.playlist = db.collection("SongPlayLists");
        collections.autoplay = db.collection("AutoplaySettings");
        collections.language = db.collection("GuildLanguages");
    } catch (error) {
        console.error("Failed to initialize collections:", error.message);
    }
}

function getPlaylistCollection() {
    return collections.playlist;
}

function getAutoplayCollection() {
    return collections.autoplay;
}

function getLanguageCollection() {
    return collections.language;
}

module.exports = {
    connectToDatabase,
    initializeCollections,
    getPlaylistCollection,
    getAutoplayCollection,
    getLanguageCollection,
};
