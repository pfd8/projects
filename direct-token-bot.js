// Discord Channel Cloner Bot
// This bot clones messages from one channel to another private channel
// This version uses direct token assignment instead of .env

const { Client, GatewayIntentBits, Partials } = require('discord.js');

// === CONFIGURATION (EDIT THESE VALUES) ===
// Replace with your actual Discord bot token
const TOKEN = 'MTM2NzkwMTIyNzk1Nzg4Mjk2Mg.G5_V84.qb7lKLd3vL3E_GNMUgUDeqmc7q_2fQDJ0sL8Rw'; 

// Replace with your channel IDs (right-click channel → Copy ID)
const SOURCE_CHANNEL_ID = '1366584112344989837';
const DESTINATION_CHANNEL_ID = '1366600851988152411';
// ==========================================

// Initialize Discord client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel]
});

// Bot ready event
client.once('ready', () => {
  console.log(`Bot is online as ${client.user.tag}`);
  console.log(`Monitoring messages from channel ID: ${SOURCE_CHANNEL_ID}`);
  console.log(`Sending cloned messages to channel ID: ${DESTINATION_CHANNEL_ID}`);
});

// Message event handler
client.on('messageCreate', async (message) => {
  // Ignore bot messages to prevent loops
  if (message.author.bot) return;
  
  // Check if the message is from the source channel
  if (message.channelId === SOURCE_CHANNEL_ID) {
    try {
      const destinationChannel = await client.channels.fetch(DESTINATION_CHANNEL_ID);
      
      // Initialize an array to store attachments
      const attachments = [];
      
      // Process images/attachments if any
      if (message.attachments.size > 0) {
        for (const [_, attachment] of message.attachments) {
          try {
            // Forward the original attachment
            attachments.push(attachment.url);
          } catch (error) {
            console.error('Error processing attachment:', error);
          }
        }
      }
      
      // Format the message content to preserve formatting
      let contentToSend = '';
      
      // Add author information
      contentToSend += `**${message.author.username}**: `;
      
      // Add original message content
      contentToSend += message.content;
      
      // Send the message to the destination channel
      await destinationChannel.send({
        content: contentToSend,
        files: attachments
      });
      
      console.log(`Cloned message from ${message.author.username}`);
    } catch (error) {
      console.error('Error cloning message:', error);
    }
  }
});

// Login to Discord with your bot token
console.log('Attempting to connect to Discord...');
client.login(TOKEN).catch(error => {
  console.error('Failed to login:', error.message);
  
  if (error.code === 'TokenInvalid') {
    console.error('\n=== TOKEN ERROR ===');
    console.error('Your Discord bot token appears to be invalid.');
    console.error('Please make sure you copied the entire token from the Discord Developer Portal.');
  }
  
  process.exit(1);
});

// Handle errors
client.on('error', error => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});