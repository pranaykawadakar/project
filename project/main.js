import './style.css'

class SmartFridge {
  constructor() {
    this.items = [];
    this.isOpen = false;
    this.temperature = 4; // Default temperature in Celsius
    this.alertInterval = null;
    this.init();
  }

  init() {
    document.querySelector('#app').innerHTML = `
      <div class="fridge-container">
        <div class="fridge">
          <div class="fridge-interior">
            <div class="shelf">
              <div class="food-item-visual">🥛</div>
              <div class="food-item-visual">🧀</div>
            </div>
            <div class="shelf">
              <div class="food-item-visual">🥕</div>
              <div class="food-item-visual">🥬</div>
            </div>
            <div class="shelf">
              <div class="food-item-visual">🍎</div>
              <div class="food-item-visual">🍊</div>
            </div>
            <div class="shelf">
              <div class="food-item-visual">🥚</div>
              <div class="food-item-visual">🧃</div>
            </div>
          </div>
          <div class="fridge-door">
            <div class="fridge-handle"></div>
            <div class="fridge-screen">
              <div class="temperature-display">${this.temperature}°C</div>
            </div>
          </div>
        </div>
        
        <div class="connecting-arrow"></div>
        
        <div class="digital-display">
          <div class="display-header">
            <h2>Smart Fridge Digital Display</h2>
          </div>
          
          <div class="input-group">
            <input type="text" id="foodName" placeholder="Food name">
          </div>
          
          <div class="input-group datetime-group">
            <input type="date" id="expiryDate">
            <input type="time" id="expiryTime">
          </div>
          
          <button class="add-btn" id="addFood">Add Food Item</button>

          <div id="alertBox" class="alert-box hidden">
            <div class="alert-content">
              <h3>Food Expiry Alert!</h3>
              <p id="alertMessage"></p>
              <button id="stopAlert" class="stop-btn">Stop Alert</button>
            </div>
          </div>
          
          <div class="food-list" id="foodList"></div>
        </div>
      </div>
    `;

    this.setupEventListeners();
    this.loadItems();
    this.startExpiryCheck();
  }

  setupEventListeners() {
    document.getElementById('addFood').addEventListener('click', () => this.addFoodItem());
    document.getElementById('stopAlert').addEventListener('click', () => this.stopAlert());
    
    const fridgeDoor = document.querySelector('.fridge-door');
    fridgeDoor.addEventListener('click', (e) => {
      if (e.target.closest('.fridge-screen')) return;
      this.toggleDoor();
    });
  }

  toggleDoor() {
    this.isOpen = !this.isOpen;
    const door = document.querySelector('.fridge-door');
    if (this.isOpen) {
      door.classList.add('open');
    } else {
      door.classList.remove('open');
    }
  }

  addFoodItem() {
    const nameInput = document.getElementById('foodName');
    const dateInput = document.getElementById('expiryDate');
    const timeInput = document.getElementById('expiryTime');
    
    if (!nameInput.value || !dateInput.value || !timeInput.value) return;

    const expiryDateTime = `${dateInput.value}T${timeInput.value}`;
    
    const item = {
      name: nameInput.value,
      expiryDate: expiryDateTime,
      id: Date.now()
    };

    this.items.push(item);
    this.saveItems();
    this.renderItems();

    nameInput.value = '';
    dateInput.value = '';
    timeInput.value = '';
  }

  removeFoodItem(id) {
    this.items = this.items.filter(item => item.id !== id);
    this.saveItems();
    this.renderItems();
  }

  isExpired(date) {
    return new Date(date) < new Date();
  }

  isExpiringIn24Hours(date) {
    const now = new Date();
    const expiryDate = new Date(date);
    const hoursUntilExpiry = (expiryDate - now) / (1000 * 60 * 60);
    return hoursUntilExpiry > 0 && hoursUntilExpiry <= 24;
  }

  renderItems() {
    const foodList = document.getElementById('foodList');
    foodList.innerHTML = '';

    this.items.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

    this.items.forEach(item => {
      const isExpired = this.isExpired(item.expiryDate);
      const itemElement = document.createElement('div');
      itemElement.className = `food-item ${isExpired ? 'expired' : ''}`;
      
      const dateTime = new Date(item.expiryDate);
      
      itemElement.innerHTML = `
        <span>${item.name}</span>
        <div class="food-item-actions">
          <span>
            ${dateTime.toLocaleDateString()} ${dateTime.toLocaleTimeString()}
            ${isExpired ? '<span class="warning-icon">⚠️</span>' : ''}
          </span>
          <button class="remove-btn" data-id="${item.id}">❌</button>
        </div>
      `;

      const removeBtn = itemElement.querySelector('.remove-btn');
      removeBtn.addEventListener('click', () => this.removeFoodItem(item.id));

      foodList.appendChild(itemElement);
    });
  }

  startExpiryCheck() {
    // Check every minute
    this.alertInterval = setInterval(() => {
      const expiringItems = this.items.filter(item => this.isExpiringIn24Hours(item.expiryDate));
      
      if (expiringItems.length > 0) {
        const alertBox = document.getElementById('alertBox');
        const alertMessage = document.getElementById('alertMessage');
        
        alertMessage.innerHTML = expiringItems.map(item => {
          const hours = Math.round((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60));
          return `${item.name} will expire in ${hours} hours!`;
        }).join('<br>');
        
        alertBox.classList.remove('hidden');
        this.playAlertSound();
      }
    }, 60000); // Check every minute
  }

  stopAlert() {
    const alertBox = document.getElementById('alertBox');
    alertBox.classList.add('hidden');
    this.stopAlertSound();
  }

  playAlertSound() {
    // Create and play a beeping sound
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 800;
    gainNode.gain.value = 0.5;
    
    oscillator.start();
    setTimeout(() => oscillator.stop(), 500);
  }

  stopAlertSound() {
    // The sound is already stopped after 500ms
  }

  saveItems() {
    localStorage.setItem('fridgeItems', JSON.stringify(this.items));
  }

  loadItems() {
    const savedItems = localStorage.getItem('fridgeItems');
    if (savedItems) {
      this.items = JSON.parse(savedItems);
      this.renderItems();
    }
  }
}

new SmartFridge();