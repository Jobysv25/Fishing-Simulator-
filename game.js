// Canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
const gameState = {
    money: 1000,
    inventory: {},
    currentRod: 'Basic Rod',
    currentBait: 'Trash Bait',
    isFishing: false,
    fishCaught: null,
    caughtTime: 0,
    lineLength: 0,
    isWeatherSunset: false
};

// Fish data with rarities and catch times
const fishData = {
    'Bluegill': {
        rarity: 25,
        rarity_sunset: 20,
        catchTime: 5000,
        price: 50,
        color: '#4169E1'
    },
    'Sunfish': {
        rarity: 20,
        rarity_sunset: 18,
        catchTime: 6000,
        price: 75,
        color: '#FF6347'
    },
    'Crappie': {
        rarity: 18,
        rarity_sunset: 16,
        catchTime: 7000,
        price: 100,
        color: '#32CD32'
    },
    'Northern Pike': {
        rarity: 15,
        rarity_sunset: 14,
        catchTime: 8000,
        price: 150,
        color: '#FFD700'
    },
    'Largemouth Bass': {
        rarity: 12,
        rarity_sunset: 15,
        catchTime: 9000,
        price: 200,
        color: '#8B4513'
    },
    'Smallmouth Bass': {
        rarity: 8,
        rarity_sunset: 12,
        catchTime: 10000,
        price: 250,
        color: '#A0522D'
    },
    'Muksie': {
        rarity: 2,
        rarity_sunset: 3,
        catchTime: 12000,
        price: 500,
        color: '#1C1C1C'
    },
    'Golden Fish': {
        rarity: 5,
        rarity_sunset: 6,
        catchTime: 15000,
        price: 1000,
        color: '#FFD700'
    }
};

// Bait data
const baitData = {
    'Trash Bait': {
        price: 0,
        owned: true,
        description: '🪱 Worm',
        speedBonus: 1.0
    },
    'Good Bait': {
        price: 100,
        owned: false,
        description: '🐟 Small Fish',
        speedBonus: 0.8
    },
    'Best Bait': {
        price: 250,
        owned: false,
        description: '🌈 Rainbow Fish',
        speedBonus: 0.6
    }
};

// Rod data
const rodData = {
    'Basic Rod': {
        price: 0,
        owned: true,
        description: 'Standard wooden rod',
        speedBonus: 1.0
    },
    'Steel Rod': {
        price: 500,
        owned: false,
        description: 'Faster catch',
        speedBonus: 0.75
    },
    'Golden Rod': {
        price: 1500,
        owned: false,
        description: 'Much faster',
        speedBonus: 0.5
    },
    'Legendary Rod': {
        price: 3000,
        owned: false,
        description: 'Fastest rod',
        speedBonus: 0.3
    }
};

// Fishing pole position
const pole = {
    x: 150,
    y: 450,
    length: 100,
    angle: -0.3
};

// Dock position
const dock = {
    x: 50,
    y: 480,
    width: 250,
    height: 80
};

// Water properties
const water = {
    y: 400,
    waveOffset: 0
};

// Seagulls
const seagulls = [];
let seagullTimer = 0;

// Jumping Fish
const jumpingFish = [];
let silverFishTimer = 0;
let yellowFishTimer = 0;

// Initialize
function init() {
    updateUI();
    gameLoop();
    spawnSeagull();
    setInterval(spawnSeagull, 60000); // Spawn seagull every minute
    
    // Silver fish spawn every 1 minute
    setInterval(spawnSilverFish, 60000);
    spawnSilverFish(); // Spawn first one immediately
    
    // Yellow fish spawn every 10 minutes
    setInterval(spawnYellowFish, 600000);
    spawnYellowFish(); // Spawn first one immediately
}

// Main game loop
function gameLoop() {
    // Clear canvas with sky gradient based on weather
    let gradient;
    if (gameState.isWeatherSunset) {
        gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#FF6B35');
        gradient.addColorStop(0.3, '#FF8C42');
        gradient.addColorStop(0.6, '#FFA500');
        gradient.addColorStop(0.8, '#FFB84D');
        gradient.addColorStop(1, '#FF8C69');
    } else {
        gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#E0F6FF');
        gradient.addColorStop(1, '#4A90E2');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw clouds
    drawClouds();

    // Draw water
    drawWater();

    // Draw jumping fish
    updateJumpingFish();
    drawJumpingFish();

    // Draw seagulls
    updateSeagulls();
    drawSeagulls();

    // Draw dock
    drawDock();

    // Draw fishing pole
    drawPole();

    // Draw fishing line and hook
    if (gameState.isFishing) {
        drawFishingLine();
        gameState.lineLength = Math.min(gameState.lineLength + 3, 150);
        
        gameState.caughtTime += 16.67; // Approximate 60fps
        
        // Check if fish is caught
        if (gameState.caughtTime >= gameState.fishCaught.catchTime) {
            caughtFish();
        }
    }

    // Draw instruction text
    if (!gameState.isFishing) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Click the fishing pole to start fishing', canvas.width / 2, canvas.height - 20);
    }

    // Draw weather indicator
    ctx.fillStyle = gameState.isWeatherSunset ? '#FF6B35' : '#87CEEB';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(gameState.isWeatherSunset ? '🌅 Sunset Mode' : '☀️ Sunny', 10, 25);

    requestAnimationFrame(gameLoop);
}

function drawClouds() {
    if (gameState.isWeatherSunset) {
        ctx.fillStyle = 'rgba(255, 100, 50, 0.6)';
    } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    }
    
    // Cloud 1
    drawCloud(100 + (Date.now() % 10000) / 10, 80, 60);
    
    // Cloud 2
    drawCloud(400 + (Date.now() % 12000) / 12, 120, 80);
    
    // Cloud 3
    drawCloud(600 + (Date.now() % 15000) / 15, 100, 70);
}

function drawCloud(x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
    ctx.arc(x + size * 0.3, y, size * 0.5, 0, Math.PI * 2);
    ctx.arc(x + size * 0.6, y, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
}

function drawWater() {
    water.waveOffset = (water.waveOffset + 0.02) % (Math.PI * 2);
    
    // Water surface with waves
    if (gameState.isWeatherSunset) {
        ctx.fillStyle = '#FF8C69';
    } else {
        ctx.fillStyle = '#4A90E2';
    }
    ctx.beginPath();
    ctx.moveTo(0, water.y);
    
    for (let x = 0; x <= canvas.width; x += 5) {
        const wave = Math.sin(x * 0.02 + water.waveOffset) * 5;
        ctx.lineTo(x, water.y + wave);
    }
    
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fill();
}

function drawDock() {
    // Dock platform
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(dock.x, dock.y, dock.width, dock.height);
    
    // Dock detail
    ctx.fillStyle = '#654321';
    for (let i = 0; i < 5; i++) {
        ctx.fillRect(dock.x + i * 50, dock.y + 30, 40, 10);
    }
    
    // Dock posts
    ctx.fillStyle = '#654321';
    ctx.fillRect(dock.x + 10, dock.y + dock.height, 15, 30);
    ctx.fillRect(dock.x + dock.width - 25, dock.y + dock.height, 15, 30);
}

function drawPole() {
    const tipX = pole.x + Math.cos(pole.angle) * pole.length;
    const tipY = pole.y + Math.sin(pole.angle) * pole.length;
    
    // Pole
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(pole.x, pole.y);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();
    
    // Handle
    ctx.fillStyle = '#654321';
    ctx.beginPath();
    ctx.arc(pole.x, pole.y, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Reel
    ctx.strokeStyle = '#D4A574';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(pole.x - 20, pole.y + 20, 12, 0, Math.PI * 2);
    ctx.stroke();
}

function drawFishingLine() {
    const tipX = pole.x + Math.cos(pole.angle) * pole.length;
    const tipY = pole.y + Math.sin(pole.angle) * pole.length;
    
    const lineEndX = tipX + Math.cos(pole.angle + Math.PI / 6) * gameState.lineLength;
    const lineEndY = tipY + Math.sin(pole.angle + Math.PI / 6) * gameState.lineLength;
    
    // Fishing line
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(lineEndX, lineEndY);
    ctx.stroke();
    
    // Hook
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(lineEndX, lineEndY, 5, 0, Math.PI * 2);
    ctx.stroke();
}

function drawSeagulls() {
    for (let seagull of seagulls) {
        ctx.fillStyle = '#FFF';
        
        // Body
        ctx.beginPath();
        ctx.ellipse(seagull.x, seagull.y, 20, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Wing (wave effect)
        const wingY = seagull.y - 8 + Math.sin(seagull.wingFlap) * 3;
        ctx.beginPath();
        ctx.moveTo(seagull.x - 10, seagull.y);
        ctx.quadraticCurveTo(seagull.x - 25, wingY, seagull.x - 20, seagull.y - 8);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(seagull.x + 10, seagull.y);
        ctx.quadraticCurveTo(seagull.x + 25, wingY, seagull.x + 20, seagull.y - 8);
        ctx.fill();
        
        // Head
        ctx.beginPath();
        ctx.arc(seagull.x + 8, seagull.y - 5, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(seagull.x + 12, seagull.y - 7, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function updateSeagulls() {
    for (let i = seagulls.length - 1; i >= 0; i--) {
        seagulls[i].x += seagulls[i].speedX;
        seagulls[i].y += Math.sin(seagulls[i].time * 0.02) * 0.5;
        seagulls[i].wingFlap += 0.2;
        seagulls[i].time++;
        
        if (seagulls[i].x > canvas.width + 50) {
            seagulls.splice(i, 1);
        }
    }
}

function spawnSeagull() {
    seagulls.push({
        x: -50,
        y: 50 + Math.random() * 100,
        speedX: 1 + Math.random() * 1.5,
        time: 0,
        wingFlap: 0
    });
}

// Jumping Fish Functions
function drawJumpingFish() {
    for (let fish of jumpingFish) {
        // Calculate jump arc
        const jumpProgress = fish.time / fish.jumpDuration;
        const yOffset = Math.sin(jumpProgress * Math.PI) * fish.jumpHeight;
        
        const fishX = fish.startX + (fish.endX - fish.startX) * jumpProgress;
        const fishY = fish.startY - yOffset;
        
        // Draw fish body
        ctx.fillStyle = fish.color;
        ctx.beginPath();
        ctx.ellipse(fishX, fishY, 20, 12, fish.angle, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw tail
        ctx.fillStyle = fish.color;
        ctx.beginPath();
        ctx.moveTo(fishX - 20, fishY);
        ctx.lineTo(fishX - 35, fishY - 10);
        ctx.lineTo(fishX - 35, fishY + 10);
        ctx.fill();
        
        // Draw eye
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(fishX + 15, fishY - 5, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(fishX + 10, fishY - 8, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw clickable area (invisible)
        fish.x = fishX;
        fish.y = fishY;
    }
}

function updateJumpingFish() {
    for (let i = jumpingFish.length - 1; i >= 0; i--) {
        jumpingFish[i].time += 16.67;
        
        if (jumpingFish[i].time >= jumpingFish[i].jumpDuration) {
            jumpingFish.splice(i, 1);
        }
    }
}

function spawnSilverFish() {
    jumpingFish.push({
        startX: 200 + Math.random() * 400,
        startY: water.y,
        endX: 250 + Math.random() * 300,
        jumpHeight: 100,
        jumpDuration: 1500,
        time: 0,
        color: '#C0C0C0', // Silver/Grey
        angle: 0,
        type: 'silver',
        reward: 1000,
        x: 0,
        y: 0
    });
    
    showNotification('🐟 Silver fish jumped! Click it! $1,000');
}

function spawnYellowFish() {
    jumpingFish.push({
        startX: 200 + Math.random() * 400,
        startY: water.y,
        endX: 250 + Math.random() * 300,
        jumpHeight: 120,
        jumpDuration: 2000,
        time: 0,
        color: '#FFD700', // Yellow/Gold
        angle: 0,
        type: 'yellow',
        reward: 1000000,
        x: 0,
        y: 0
    });
    
    showNotification('💛 RARE YELLOW FISH! Click it! $1,000,000');
}

function getCatchableRarities() {
    let totalRarity = 0;
    for (let fish in fishData) {
        const rarityType = gameState.isWeatherSunset ? 'rarity_sunset' : 'rarity';
        totalRarity += fishData[fish][rarityType];
    }
    return totalRarity;
}

function getCaughtFish() {
    let random = Math.random() * getCatchableRarities();
    let currentRarity = 0;
    
    for (let fish in fishData) {
        const rarityType = gameState.isWeatherSunset ? 'rarity_sunset' : 'rarity';
        currentRarity += fishData[fish][rarityType];
        if (random <= currentRarity) {
            return fish;
        }
    }
    
    return 'Bluegill';
}

function startFishing() {
    if (gameState.isFishing) return;
    
    gameState.isFishing = true;
    gameState.lineLength = 0;
    gameState.caughtTime = 0;
    
    const fish = getCaughtFish();
    gameState.fishCaught = {
        name: fish,
        catchTime: fishData[fish].catchTime * getCatchTimeMultiplier(),
        price: fishData[fish].price
    };
    
    showNotification(`Fishing started! ${fish} incoming...`);
}

function getCatchTimeMultiplier() {
    let multiplier = 1.0;
    
    // Rod speed bonus
    multiplier *= rodData[gameState.currentRod].speedBonus;
    
    // Bait speed bonus
    multiplier *= baitData[gameState.currentBait].speedBonus;
    
    return multiplier;
}

function caughtFish() {
    gameState.isFishing = false;
    const fish = gameState.fishCaught.name;
    
    gameState.inventory[fish] = (gameState.inventory[fish] || 0) + 1;
    
    showNotification(`🎣 Caught ${fish}!`);
    updateUI();
}

function clickJumpingFish(fish) {
    gameState.money += fish.reward;
    showNotification(`💰 Caught a ${fish.type === 'yellow' ? 'YELLOW' : 'SILVER'} fish! +$${fish.reward}`);
    
    // Remove the fish
    const index = jumpingFish.indexOf(fish);
    if (index > -1) {
        jumpingFish.splice(index, 1);
    }
    
    updateUI();
}

function sellAllFish() {
    let totalMoney = 0;
    
    for (let fish in gameState.inventory) {
        if (gameState.inventory[fish] > 0) {
            totalMoney += fishData[fish].price * gameState.inventory[fish];
        }
    }
    
    if (totalMoney === 0) {
        showNotification('No fish to sell!');
        return;
    }
    
    gameState.money += totalMoney;
    gameState.inventory = {};
    
    showNotification(`Sold all fish for $${totalMoney}!`);
    updateUI();
}

function buyBait(baitName) {
    const bait = baitData[baitName];
    
    if (bait.owned && gameState.currentBait === baitName) {
        showNotification(`${baitName} is already equipped!`);
        return;
    }
    
    if (!bait.owned) {
        if (gameState.money < bait.price) {
            showNotification(`Not enough money! Need $${bait.price}`);
            return;
        }
        
        gameState.money -= bait.price;
        baitData[baitName].owned = true;
        showNotification(`Bought ${baitName}!`);
    }
    
    gameState.currentBait = baitName;
    showNotification(`Equipped ${baitName}!`);
    updateUI();
}

function buyRod(rodName) {
    const rod = rodData[rodName];
    
    if (rod.owned && gameState.currentRod === rodName) {
        showNotification(`${rodName} is already equipped!`);
        return;
    }
    
    if (!rod.owned) {
        if (gameState.money < rod.price) {
            showNotification(`Not enough money! Need $${rod.price}`);
            return;
        }
        
        gameState.money -= rod.price;
        rodData[rodName].owned = true;
        showNotification(`Bought ${rodName}!`);
    }
    
    gameState.currentRod = rodName;
    showNotification(`Equipped ${rodName}!`);
    updateUI();
}

function toggleSunset() {
    const sunsetPrice = 5000000;
    
    if (gameState.isWeatherSunset) {
        gameState.isWeatherSunset = false;
        showNotification('Weather changed to sunny! 🌞');
        return;
    }
    
    if (gameState.money < sunsetPrice) {
        showNotification(`Not enough money for sunset! Need $${sunsetPrice}`);
        return;
    }
    
    gameState.money -= sunsetPrice;
    gameState.isWeatherSunset = true;
    showNotification('Weather changed to sunset! 🌅 Better catch rates now!');
    updateUI();
}

function updateUI() {
    // Money display
    document.getElementById('moneyDisplay').textContent = `$${gameState.money}`;
    
    // Rod display
    document.getElementById('rodDisplay').textContent = gameState.currentRod;
    
    // Bait display
    document.getElementById('baitDisplay').textContent = gameState.currentBait;
    
    // Inventory display
    const inventoryDiv = document.getElementById('inventory');
    if (Object.keys(gameState.inventory).length === 0) {
        inventoryDiv.innerHTML = '<p>No fish caught yet</p>';
    } else {
        let html = '';
        for (let fish in gameState.inventory) {
            html += `<div class="fish-entry">🐟 ${fish} x${gameState.inventory[fish]}</div>`;
        }
        inventoryDiv.innerHTML = html;
    }
    
    // Fish prices display
    const fishPricesDiv = document.getElementById('fishPrices');
    let pricesHtml = '';
    for (let fish in fishData) {
        if (gameState.inventory[fish] && gameState.inventory[fish] > 0) {
            pricesHtml += `<div class="price-item">
                <div class="price-name">${fish}</div>
                <div class="price-value">$${fishData[fish].price}</div>
            </div>`;
        }
    }
    fishPricesDiv.innerHTML = pricesHtml;
    
    // Bait shop
    const baitShopDiv = document.getElementById('baitShop');
    let baitHtml = '';
    for (let bait in baitData) {
        const baitInfo = baitData[bait];
        const owned = baitInfo.owned ? ' owned' : '';
        baitHtml += `<div class="shop-item${owned}" onclick="buyBait('${bait}')">
            <div class="shop-name">${bait}</div>
            <div class="shop-description">${baitInfo.description}</div>
            <div class="shop-price">${baitInfo.price === 0 ? 'Starting item' : `$${baitInfo.price}`}</div>
        </div>`;
    }
    baitShopDiv.innerHTML = baitHtml;
    
    // Rod shop
    const rodShopDiv = document.getElementById('rodShop');
    let rodHtml = '';
    for (let rod in rodData) {
        const rodInfo = rodData[rod];
        const owned = rodInfo.owned ? ' owned' : '';
        rodHtml += `<div class="shop-item${owned}" onclick="buyRod('${rod}')">
            <div class="shop-name">${rod}</div>
            <div class="shop-description">${rodInfo.description}</div>
            <div class="shop-price">${rodInfo.price === 0 ? 'Starting item' : `$${rodInfo.price}`}</div>
        </div>`;
    }
    rodShopDiv.innerHTML = rodHtml;
    
    // Weather button
    const weatherBtn = document.getElementById('weatherBtn');
    if (gameState.isWeatherSunset) {
        weatherBtn.innerHTML = 'Change to Sunny ☀️<br><span class="sunset-cost">Currently: Sunset Mode</span>';
        weatherBtn.style.background = 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)';
    } else {
        weatherBtn.innerHTML = 'Change to Sunset 🌅<br><span class="sunset-cost">Cost: $5,000,000</span>';
        weatherBtn.style.background = 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)';
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Canvas click handler
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if click is on jumping fish
    for (let fish of jumpingFish) {
        const distance = Math.sqrt((x - fish.x) ** 2 + (y - fish.y) ** 2);
        if (distance < 25) {
            clickJumpingFish(fish);
            return;
        }
    }
    
    // Check if click is on pole
    const tipX = pole.x + Math.cos(pole.angle) * pole.length;
    const tipY = pole.y + Math.sin(pole.angle) * pole.length;
    
    const distance = Math.sqrt((x - tipX) ** 2 + (y - tipY) ** 2);
    
    if (distance < 30 || (x > dock.x && x < dock.x + dock.width && y > dock.y && y < dock.y + dock.height)) {
        startFishing();
    }
});

// Start the game
init();
