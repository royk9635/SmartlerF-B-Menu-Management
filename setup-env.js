#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function setupEnvironment() {
  console.log('🔧 Environment Setup for F&B Menu Management\n');
  
  const useRealAPI = await question('Do you want to use a real backend API? (y/n): ');
  
  let envContent = '';
  
  if (useRealAPI.toLowerCase() === 'y' || useRealAPI.toLowerCase() === 'yes') {
    envContent += 'VITE_USE_REAL_API=true\n';
    
    const apiUrl = await question('Enter your backend API URL (e.g., https://api.yourdomain.com/api): ');
    envContent += `VITE_API_BASE_URL=${apiUrl}\n`;
    
    const wsUrl = await question('Enter your WebSocket URL (optional, press Enter to skip): ');
    if (wsUrl.trim()) {
      envContent += `VITE_WS_URL=${wsUrl}\n`;
    }
  } else {
    envContent += 'VITE_USE_REAL_API=false\n';
    console.log('✅ Using mock data mode - no backend required');
  }
  
  const geminiKey = await question('Enter your Gemini API key (optional, press Enter to skip): ');
  if (geminiKey.trim()) {
    envContent += `GEMINI_API_KEY=${geminiKey}\n`;
  }
  
  // Write .env file
  const envPath = path.join(process.cwd(), '.env');
  
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Environment file created successfully!');
    console.log(`📁 File location: ${envPath}`);
    console.log('\n📋 Your configuration:');
    console.log(envContent);
    console.log('🚀 You can now start the application with: npm run dev');
  } catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
    console.log('\n📝 Please create .env file manually with this content:');
    console.log(envContent);
  }
  
  rl.close();
}

setupEnvironment().catch(console.error);
