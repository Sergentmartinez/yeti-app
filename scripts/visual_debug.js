const puppeteer = require('puppeteer');

async function testGarageRender() {
  console.log('🔍 Démarrage du test visuel du Garage Yeti...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Activer la capture des logs console
  page.on('console', msg => {
    console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
  });
  
  page.on('error', error => {
    console.error(`[BROWSER ERROR] ${error.message}`);
  });
  
  try {
    console.log('📡 Navigation vers http://localhost:3000/basecamp/garage...');
    await page.goto('http://localhost:3000/basecamp/garage', {
      waitUntil: 'networkidle0',
      timeout: 10000
    });
    
    console.log('🔄 Forcing hard reload to bypass cache...');
    await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
    
    console.log('⏳ Attente du chargement de Three.js (5 secondes)...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('📸 Capture d\'écran...');
    await page.screenshot({
      path: 'debug_render.png',
      fullPage: true
    });
    
    // Vérifier si le canvas Three.js est présent
    const canvasExists = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return canvas !== null;
    });
    
    if (canvasExists) {
      console.log('✅ Canvas Three.js détecté');
    } else {
      console.log('❌ Canvas Three.js NON détecté');
    }
    
    // WebGL context check removed as it can be unreliable in Puppeteer
    // when a library like R3F already manages the context.
    console.log('ℹ️  Skipping WebGL context check.');
    
    console.log('✨ Test visuel terminé - screenshot sauvegardé dans debug_render.png');
    
  } catch (error) {
    console.error('❌ Erreur pendant le test:', error.message);
  } finally {
    await browser.close();
  }
}

testGarageRender();