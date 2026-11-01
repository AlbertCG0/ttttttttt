// Live Pigeon Auction System (Canlı Türk Kuşçu Mezatı Simülasyonu)

class MezatManager {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.currentLot = null;
        this.currentBid = 0;
        this.highestBidder = '';
        this.timer = 0;
        this.phase = 0; // 0: Open, 1: Bir!, 2: İki!, 3: Sattım!
        this.interval = null;

        this.aiBidders = [
            'Kuşçu İbrahim', 'Mardinli Şeyhmus', 'Şebapçı Selim',
            'Postacı Ali Reis', 'Urfa Mirosu Sevdalısı', 'Kuşçu Dayı'
        ];
    }

    openMezatModal() {
        const modal = document.getElementById('mezat-modal');
        if (!modal) return;
        modal.classList.remove('hidden');
        this.showLobby();
    }

    closeMezatModal() {
        const modal = document.getElementById('mezat-modal');
        if (modal) modal.classList.add('hidden');
        this.stopAuction();
    }

    showLobby() {
        const content = document.getElementById('mezat-content');
        content.innerHTML = `
            <div class="mezat-lobby">
                <div class="mezat-banner">
                    <h2>🏛️ BİRD VİLLAGE GELENEKSEL KUŞ MEZATI</h2>
                    <p>Türkiye'nin en seçkin damızlık taklacı, balon ve şebap güvercinleri kürsüde!</p>
                </div>
                <div class="mezat-options">
                    <button class="mezat-big-btn" id="btn-start-buying">
                        <span class="icon">🏷️</span>
                        <div>
                            <strong>Mezatta Kuş Satın Al</strong>
                            <p>Kürsüye çıkan nadir ve şampiyon kuşlara pey sürerek teklif verin.</p>
                        </div>
                    </button>
                    <button class="mezat-big-btn secondary" id="btn-start-selling">
                        <span class="icon">💰</span>
                        <div>
                            <strong>Kendi Kuşunu Satışa Çıkar</strong>
                            <p>Yetiştirdiğiniz taklacıları açık artırmaya koyup rekor fiyata satın.</p>
                        </div>
                    </button>
                </div>
            </div>
        `;

        document.getElementById('btn-start-buying').onclick = () => this.startBuyAuction();
        document.getElementById('btn-start-selling').onclick = () => this.showSellList();
    }

    startBuyAuction() {
        const breedKeys = Object.keys(PIGEON_BREEDS);
        const randomKey = breedKeys[Math.floor(Math.random() * breedKeys.length)];
        const breed = PIGEON_BREEDS[randomKey];
        const isChampion = Math.random() < 0.4;
        const level = isChampion ? Math.floor(Math.random() * 4 + 4) : 1;
        const title = isChampion ? `🏆 Şampiyon ${breed.name} (Damızlık)` : `${breed.name}`;

        this.currentLot = {
            breedKey: randomKey,
            breed: breed,
            title: title,
            level: level,
            taklaCount: isChampion ? Math.floor(Math.random() * 50 + 40) : 5,
            seller: 'Mezatçı Selman Usta',
            isPlayerSeller: false
        };

        this.currentBid = Math.floor(breed.price * (isChampion ? 1.3 : 0.8));
        this.highestBidder = 'Mezat Başlangıç Fiyatı';
        this.phase = 0;
        this.runAuctionUI();
    }

    showSellList() {
        const content = document.getElementById('mezat-content');
        if (this.game.flock.length <= 1) {
            content.innerHTML = `
                <div style="padding: 24px; text-align: center;">
                    <h3>Kümeste En Az 2 Kuş Bulunmalıdır!</h3>
                    <p style="color: #94a3b8; margin: 12px 0;">Tüm sürünüzü satamazsınız.</p>
                    <button class="action-btn primary" onclick="window.mezat.showLobby()">Geri Dön</button>
                </div>
            `;
            return;
        }

        let rowsHtml = '';
        this.game.flock.forEach((p, idx) => {
            const val = p.getEstimatedMarketValue();
            rowsHtml += `
                <div class="shop-card">
                    <h4>${p.name} (Lv.${p.level})</h4>
                    <p>${p.breed.name} - Takla: ${p.taklaCount} adet</p>
                    <div class="stats-mini">Tahmini Mezat Açılışı: ${val} 🪙</div>
                    <button class="buy-btn" onclick="window.mezat.startSellAuction(${idx})">Mezata Çıkar (${val} 🪙)</button>
                </div>
            `;
        });

        content.innerHTML = `
            <div>
                <h3>Satılacak Kuşu Seçin:</h3>
                <div class="shop-grid" style="margin-top: 14px;">${rowsHtml}</div>
                <button class="action-btn secondary" style="margin-top: 16px;" onclick="window.mezat.showLobby()">Geri Dön</button>
            </div>
        `;
    }

    startSellAuction(pigeonIndex) {
        const p = this.game.flock[pigeonIndex];
        if (!p) return;

        this.currentLot = {
            pigeon: p,
            pigeonIndex: pigeonIndex,
            breedKey: p.breed.id,
            breed: p.breed,
            title: `${p.name} [Lv.${p.level}]`,
            level: p.level,
            taklaCount: p.taklaCount,
            seller: 'Siz (Kümes Sahibi)',
            isPlayerSeller: true
        };

        this.currentBid = p.getEstimatedMarketValue();
        this.highestBidder = 'Açılış Fiyatı';
        this.phase = 0;
        this.runAuctionUI();
    }

    runAuctionUI() {
        this.active = true;
        const content = document.getElementById('mezat-content');
        content.innerHTML = `
            <div class="mezat-arena">
                <div class="podium-card glass">
                    <div class="podium-badge">${this.currentLot.title}</div>
                    <div class="podium-details">
                        <p><strong>Irk:</strong> ${this.currentLot.breed.name}</p>
                        <p><strong>Seviye:</strong> Lv.${this.currentLot.level} | <strong>Kondisyon:</strong> %100</p>
                        <p><strong>Kayıtlı Takla:</strong> ${this.currentLot.taklaCount} kez</p>
                        <p><strong>Satıcı:</strong> ${this.currentLot.seller}</p>
                    </div>
                    <div class="bid-display">
                        <span class="label">GÜNCEL TEKLİF:</span>
                        <span class="bid-amount" id="current-bid-num">${this.currentBid} 🪙</span>
                        <span class="bidder-tag" id="current-bidder-name">${this.highestBidder}</span>
                    </div>
                    <div class="gavel-status" id="gavel-status">Teklifler Açık...</div>
                </div>

                <div class="mezat-log glass" id="mezat-log">
                    <div class="log-line">🔔 Mezat açıldı! Kuş podyumda turluyor.</div>
                </div>
            </div>

            <div class="mezat-footer glass" style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center;">
                <div id="player-bid-controls">
                    ${!this.currentLot.isPlayerSeller ? `
                        <button class="action-btn primary" id="btn-player-bid">
                            🔨 Pey Sür (+30 🪙 Teklif Ver)
                        </button>
                    ` : `
                        <button class="action-btn takla-glow" id="btn-accept-sale">
                            ⚖️ Çekici Vur / SAT!
                        </button>
                    `}
                </div>
                <button class="action-btn secondary" onclick="window.mezat.showLobby()">Mezattan Ayrıl</button>
            </div>
        `;

        if (!this.currentLot.isPlayerSeller) {
            document.getElementById('btn-player-bid').onclick = () => this.playerBids();
        } else {
            document.getElementById('btn-accept-sale').onclick = () => this.finalizeSale();
        }

        this.startBiddingLoop();
    }

    logMessage(msg) {
        const log = document.getElementById('mezat-log');
        if (!log) return;
        const line = document.createElement('div');
        line.className = 'log-line';
        line.innerHTML = msg;
        log.appendChild(line);
        log.scrollTop = log.scrollHeight;
    }

    playerBids() {
        const next = this.currentBid + 30;
        if (this.game.coins < next) {
            this.game.showNotification('Teklif vermek için yeterli altınınız yok!', 'warning');
            return;
        }

        this.currentBid = next;
        this.highestBidder = 'Siz';
        this.phase = 0; // reset gavel count
        if (window.sounds) window.sounds.playCoin();
        this.updateBidDisplay();
        this.logMessage(`🟢 <strong>Siz pey sürdünüz:</strong> ${this.currentBid} 🪙!`);
    }

    startBiddingLoop() {
        clearInterval(this.interval);
        this.timer = 0;

        this.interval = setInterval(() => {
            if (!this.active) return;
            this.timer++;

            // AI Bid chance
            const aiChance = this.currentLot.isPlayerSeller ? 0.75 : 0.45;
            if (Math.random() < aiChance && this.highestBidder === 'Siz') {
                const randomAI = this.aiBidders[Math.floor(Math.random() * this.aiBidders.length)];
                const raise = (Math.floor(Math.random() * 3) + 1) * 20;
                this.currentBid += raise;
                this.highestBidder = randomAI;
                this.phase = 0;
                if (window.sounds) window.sounds.playGavel();
                this.updateBidDisplay();
                this.logMessage(`📢 <strong>${randomAI}:</strong> ${this.currentBid} 🪙 teklif etti!`);
            } else if (Math.random() < 0.3 && this.highestBidder !== 'Siz' && this.currentLot.isPlayerSeller) {
                const randomAI = this.aiBidders[Math.floor(Math.random() * this.aiBidders.length)];
                this.currentBid += 25;
                this.highestBidder = randomAI;
                this.phase = 0;
                if (window.sounds) window.sounds.playGavel();
                this.updateBidDisplay();
                this.logMessage(`📢 <strong>${randomAI} fiyat yükseltti:</strong> ${this.currentBid} 🪙!`);
            } else {
                // Advance gavel countdown
                this.phase++;
                const statusEl = document.getElementById('gavel-status');
                if (!statusEl) return;

                if (this.phase === 1) {
                    statusEl.innerText = `${this.currentBid} 🪙... BİR!`;
                    if (window.sounds) window.sounds.playGavel();
                    this.logMessage(`🔨 <em>${this.currentBid} 🪙... BİR!</em>`);
                } else if (this.phase === 2) {
                    statusEl.innerText = `${this.currentBid} 🪙... İKİ!`;
                    if (window.sounds) window.sounds.playGavel();
                    this.logMessage(`🔨 <em>${this.currentBid} 🪙... İKİ!</em>`);
                } else if (this.phase >= 3) {
                    statusEl.innerText = `🔨 SATTIM!`;
                    if (window.sounds) window.sounds.playGavel();
                    this.finalizeSale();
                }
            }
        }, 2200);
    }

    updateBidDisplay() {
        const num = document.getElementById('current-bid-num');
        const bidder = document.getElementById('current-bidder-name');
        if (num) num.innerText = `${this.currentBid} 🪙`;
        if (bidder) bidder.innerText = `En Yüksek Teklif: ${this.highestBidder}`;
    }

    finalizeSale() {
        clearInterval(this.interval);
        this.active = false;

        if (this.currentLot.isPlayerSeller) {
            // Player sold their pigeon!
            const earnings = this.currentBid;
            this.game.coins += earnings;
            const removed = this.game.flock.splice(this.currentLot.pigeonIndex, 1)[0];
            if (removed && removed.mesh) this.game.scene.remove(removed.mesh);

            if (window.sounds) window.sounds.playCoin();
            this.logMessage(`🎉 <strong>KUŞ SATILDI!</strong> ${this.highestBidder} kuşu ${earnings} 🪙 karşılığında satın aldı!`);
            this.game.showNotification(`💰 Mezat Başarılı! Kuşunuz ${earnings} 🪙 karşılığında satıldı!`, 'success');
        } else {
            // Player bought the pigeon!
            if (this.highestBidder === 'Siz') {
                this.game.coins -= this.currentBid;
                this.game.addPigeon(this.currentLot.breedKey, this.currentLot.title);
                if (window.sounds) window.sounds.playCoin();
                this.logMessage(`🏆 <strong>TEBRİKLER!</strong> ${this.currentLot.title} artık sizin kümesinizde!`);
                this.game.showNotification(`🎉 Mezatı Kazandınız! ${this.currentLot.title} kümesinize katıldı!`, 'success');
            } else {
                this.logMessage(`😔 Kuş ${this.highestBidder} tarafından ${this.currentBid} 🪙 fiyata alındı.`);
                this.game.showNotification('Mezatta kuşu başka bir alıcı kaptı!', 'info');
            }
        }

        this.game.updateHUD();
        this.game.renderFlockList();

        setTimeout(() => {
            this.showLobby();
        }, 3000);
    }

    stopAuction() {
        this.active = false;
        clearInterval(this.interval);
    }
}

window.MezatManager = MezatManager;
