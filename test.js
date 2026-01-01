// Test script for BITECRAFT web application
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testApplication() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const errors = [];
    
    // Collect console errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(`Console Error: ${msg.text()}`);
        }
    });
    
    page.on('pageerror', err => {
        errors.push(`Page Error: ${err.message}`);
    });
    
    const pages = ['index.html', 'menu.html', 'order.html', 'about.html', 'contact.html', 'order-confirmation.html'];
    const basePath = path.resolve(__dirname);
    
    console.log('Testing BITECRAFT Web Application...\n');
    
    for (const pageName of pages) {
        const filePath = `file://${path.join(basePath, pageName)}`;
        console.log(`Testing: ${pageName}`);
        
        try {
            await page.goto(filePath, { waitUntil: 'networkidle', timeout: 30000 });
            await page.waitForTimeout(1000);
            console.log(`  ✓ ${pageName} loaded successfully`);
        } catch (err) {
            errors.push(`Failed to load ${pageName}: ${err.message}`);
            console.log(`  ✗ ${pageName} failed to load`);
        }
    }
    
    await browser.close();
    
    console.log('\n========================================');
    if (errors.length > 0) {
        console.log('ERRORS FOUND:');
        errors.forEach(err => console.log(`  - ${err}`));
        process.exit(1);
    } else {
        console.log('✓ All pages loaded successfully with no errors!');
        console.log('========================================');
    }
}

testApplication().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});
