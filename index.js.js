// Discord Channel Cloner Bot
// This bot clones messages from one channel to another private channel

require('dotenv').config();
const { Client, GatewayIntentBits, Partials, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Discord bot token and channel IDs
const TOKEN = process.env.DISCORD_TOKEN;
const SOURCE_CHANNEL_ID = process.env.SOURCE_CHANNEL_ID;
const DESTINATION_CHANNEL_ID = process.env.DESTINATION_CHANNEL_ID;

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
client.login(TOKEN);

// Handle errors
client.on('error', console.error);
process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

// Create a .env file with the following variables:
// DISCORD_TOKEN=your_discord_bot_token
// SOURCE_CHANNEL_ID=id_of_channel_to_monitor
// DESTINATION_CHANNEL_ID=id_of_channel_to_send_cloned_messages
