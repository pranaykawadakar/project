(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const r of o.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function t(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(i){if(i.ep)return;i.ep=!0;const o=t(i);fetch(i.href,o)}})();class n{constructor(){this.items=[],this.isOpen=!1,this.temperature=4,this.alertInterval=null,this.init()}init(){document.querySelector("#app").innerHTML=`
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
    `,this.setupEventListeners(),this.loadItems(),this.startExpiryCheck()}setupEventListeners(){document.getElementById("addFood").addEventListener("click",()=>this.addFoodItem()),document.getElementById("stopAlert").addEventListener("click",()=>this.stopAlert()),document.querySelector(".fridge-door").addEventListener("click",t=>{t.target.closest(".fridge-screen")||this.toggleDoor()})}toggleDoor(){this.isOpen=!this.isOpen;const e=document.querySelector(".fridge-door");this.isOpen?e.classList.add("open"):e.classList.remove("open")}addFoodItem(){const e=document.getElementById("foodName"),t=document.getElementById("expiryDate"),s=document.getElementById("expiryTime");if(!e.value||!t.value||!s.value)return;const i=`${t.value}T${s.value}`,o={name:e.value,expiryDate:i,id:Date.now()};this.items.push(o),this.saveItems(),this.renderItems(),e.value="",t.value="",s.value=""}removeFoodItem(e){this.items=this.items.filter(t=>t.id!==e),this.saveItems(),this.renderItems()}isExpired(e){return new Date(e)<new Date}isExpiringIn24Hours(e){const t=new Date,i=(new Date(e)-t)/(1e3*60*60);return i>0&&i<=24}renderItems(){const e=document.getElementById("foodList");e.innerHTML="",this.items.sort((t,s)=>new Date(t.expiryDate)-new Date(s.expiryDate)),this.items.forEach(t=>{const s=this.isExpired(t.expiryDate),i=document.createElement("div");i.className=`food-item ${s?"expired":""}`;const o=new Date(t.expiryDate);i.innerHTML=`
        <span>${t.name}</span>
        <div class="food-item-actions">
          <span>
            ${o.toLocaleDateString()} ${o.toLocaleTimeString()}
            ${s?'<span class="warning-icon">⚠️</span>':""}
          </span>
          <button class="remove-btn" data-id="${t.id}">❌</button>
        </div>
      `,i.querySelector(".remove-btn").addEventListener("click",()=>this.removeFoodItem(t.id)),e.appendChild(i)})}startExpiryCheck(){this.alertInterval=setInterval(()=>{const e=this.items.filter(t=>this.isExpiringIn24Hours(t.expiryDate));if(e.length>0){const t=document.getElementById("alertBox"),s=document.getElementById("alertMessage");s.innerHTML=e.map(i=>{const o=Math.round((new Date(i.expiryDate)-new Date)/36e5);return`${i.name} will expire in ${o} hours!`}).join("<br>"),t.classList.remove("hidden"),this.playAlertSound()}},6e4)}stopAlert(){document.getElementById("alertBox").classList.add("hidden"),this.stopAlertSound()}playAlertSound(){const e=new(window.AudioContext||window.webkitAudioContext),t=e.createOscillator(),s=e.createGain();t.connect(s),s.connect(e.destination),t.type="sine",t.frequency.value=800,s.gain.value=.5,t.start(),setTimeout(()=>t.stop(),500)}stopAlertSound(){}saveItems(){localStorage.setItem("fridgeItems",JSON.stringify(this.items))}loadItems(){const e=localStorage.getItem("fridgeItems");e&&(this.items=JSON.parse(e),this.renderItems())}}new n;
