// Live Pigeon Market Exchange & Dynamic Price Index (Güvercin Borsası & Fiyat Endeksi)
// Inspired by APK's OKTradingView, candlestick charting, and crypto market mechanics

class MarketExchangeManager {
    constructor(game) {
        this.game = game;
        this.selectedBreed = 'mardin';
        this.newsTickerIndex = 0;

        // Market data for all breeds with fluctuating prices and history
        this.marketData = {
            mardin: { base: 150, current: 165, change: +10.0, history: [140, 145, 142, 150, 158, 165] },
            balon:  { base: 480, current: 512, change: +6.6,  history: [460, 470, 485, 478, 495, 512] },
            hunkari:{ base: 520, current: 545, change: +4.8,  history: [500, 510, 505, 520, 530, 545] },
            arap:   { base: 250, current: 238, change: -4.8,  history: [265, 260, 255, 248, 242, 238] },
            sebap:  { base: 400, current: 448, change: +12.0, history: [380, 395, 410, 415, 430, 448] },
            posta:  { base: 320, current: 308, change: -3.75, history: [340, 335, 325, 318, 312, 308] },
            miro:   { base: 600, current: 672, change: +12.0, history: [580, 595, 620, 610, 640, 672] },
            miski:  { base: 350, current: 368, change: +5.1,  history: [330, 340, 335, 350, 360, 368] }
        };

        this.newsItems = [
            '📈 Mardin Kupasını kazanan Fişekçiler piyasada tavan yaptı (+10%)!',
            '👑 Urfa Mirosu damızlık eşleri rekor talep görüyor!',
            '🌪️ Fırtınalı havalarda Posta güvercinlerine olan talep tırmanışta.',
            '🏆 Büyük Kuş Derbisi öncesi Şebap Kürenk fiyatları %12 yükseldi!',
            '🌾 Hasat döneminde kaliteli buğday üretimi güvercin sağlığını zirveye taşıdı.'
        ];

        this.updateInterval = setInterval(() => this.simulateMarketTick(), 5000);
    }

    simulateMarketTick() {
        Object.keys(this.marketData).forEach(key => {
            const data = this.marketData[key];
            const changePct = (Math.random() - 0.48) * 4.5; // slight upward bias
            data.current = Math.max(Math.floor(data.base * 0.6), Math.floor(data.current * (1 + changePct / 100)));
            data.change = +(((data.current - data.base) / data.base) * 100).toFixed(1);
            data.history.push(data.current);
            if (data.history.length > 20) data.history.shift();
        });

        this.newsTickerIndex = (this.newsTickerIndex + 1) % this.newsItems.length;

        const modal = document.getElementById('market-modal');
        if (modal && !modal.classList.contains('hidden')) {
            this.renderChart();
            this.renderTicker();
        }
    }

    openMarketModal() {
        const modal = document.getElementById('market-modal');
        if (!modal) return;
        modal.classList.remove('hidden');
        this.renderMarketUI();
    }

    closeMarketModal() {
        const modal = document.getElementById('market-modal');
        if (modal) modal.classList.add('hidden');
    }

    renderMarketUI() {
        const container = document.getElementById('market-content');
        if (!container) return;

        let breedTabs = '';
        Object.keys(this.marketData).forEach(k => {
            const b = PIGEON_BREEDS[k];
            const md = this.marketData[k];
            const isPos = md.change >= 0;
            const isSel = k === this.selectedBreed;
            breedTabs += `
                <div class="market-ticker-chip ${isSel ? 'active' : ''}" onclick="window.marketExchange.selectBreed('${k}')">
                    <div style="font-weight:700; font-size:0.86rem;">${b.name.split(' ')[0]}</div>
                    <div style="font-size:0.75rem; color:#94a3b8;">${md.current} 🪙</div>
                    <div style="font-size:0.72rem; color:${isPos ? '#10b981' : '#ef4444'}; font-weight:700;">
                        ${isPos ? '▲ +' : '▼ '}${md.change}%
                    </div>
                </div>
            `;
        });

        const activeB = PIGEON_BREEDS[this.selectedBreed];
        const activeMd = this.marketData[this.selectedBreed];
        const isPos = activeMd.change >= 0;

        container.innerHTML = `
            <div>
                <div class="mezat-banner" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2)); border-color: #10b981;">
                    <h2>📈 GÜVERCİN BORSASI & CANLI FİYAT ENDEKSİ</h2>
                    <p id="market-news" style="color: #6ee7b7; font-weight:600; font-size: 0.88rem;">${this.newsItems[this.newsTickerIndex]}</p>
                </div>

                <div class="market-ticker-scroll" style="display:flex; gap:8px; overflow-x:auto; padding: 10px 0; margin-bottom: 12px;">
                    ${breedTabs}
                </div>

                <div class="glass" style="padding: 16px; border-radius: 16px; margin-bottom: 14px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
                        <div>
                            <h3 style="margin:0; font-size:1.15rem; color:#f8fafc;">${activeB.name}</h3>
                            <span style="font-size:0.8rem; color:#94a3b8;">Canlı Borsa Fiyatı (1 Kuş / Damızlık)</span>
                        </div>
                        <div style="text-align:right;">
                            <span style="font-size:1.45rem; font-weight:800; color:#fbbf24;">${activeMd.current} 🪙</span>
                            <span style="font-size:0.82rem; font-weight:700; margin-left:8px; color:${isPos ? '#10b981' : '#ef4444'};">
                                ${isPos ? '▲ +' : '▼ '}${activeMd.change}%
                            </span>
                        </div>
                    </div>

                    <!-- Canvas Line Chart -->
                    <div style="position:relative; width:100%; height:180px; background:rgba(15,23,42,0.6); border-radius:12px; overflow:hidden; border:1px solid rgba(255,255,255,0.08);">
                        <canvas id="market-chart" width="700" height="180" style="width:100%; height:100%; display:block;"></canvas>
                    </div>
                </div>

                <div style="display:flex; gap:12px; justify-content:flex-end;">
                    <button class="buy-btn" style="background: linear-gradient(135deg, #10b981, #059669); font-size:0.95rem; padding: 10px 22px;"
                            onclick="window.marketExchange.buyAtMarket()">
                        📥 Borsadan Satın Al (-${activeMd.current} 🪙)
                    </button>
                    <button class="buy-btn" style="background: linear-gradient(135deg, #e11d48, #be123c); font-size:0.95rem; padding: 10px 22px;"
                            onclick="window.marketExchange.sellAtMarket()">
                        📤 Bu Irktan Birini Sat (+${Math.floor(activeMd.current * 0.88)} 🪙)
                    </button>
                </div>
            </div>
        `;

        this.renderChart();
    }

    selectBreed(breedKey) {
        this.selectedBreed = breedKey;
        this.renderMarketUI();
    }

    renderTicker() {
        const newsEl = document.getElementById('market-news');
        if (newsEl) newsEl.innerText = this.newsItems[this.newsTickerIndex];
    }

    renderChart() {
        const canvas = document.getElementById('market-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        const data = this.marketData[this.selectedBreed];
        const history = data.history;
        if (history.length < 2) return;

        const min = Math.min(...history) * 0.95;
        const max = Math.max(...history) * 1.05;
        const range = max - min || 1;

        // Grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;
        for (let i = 1; i <= 3; i++) {
            const y = (h / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        const isPos = data.change >= 0;
        const strokeColor = isPos ? '#10b981' : '#ef4444';
        const gradColor = isPos ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)';

        // Plot points
        const step = w / (history.length - 1);
        ctx.beginPath();
        history.forEach((val, i) => {
            const x = i * step;
            const y = h - ((val - min) / range) * (h - 20) - 10;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        // Fill area under curve
        ctx.save();
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, gradColor);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();

        // Stroke line
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 3;
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        history.forEach((val, i) => {
            const x = i * step;
            const y = h - ((val - min) / range) * (h - 20) - 10;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Draw last point dot
        const lastX = (history.length - 1) * step;
        const lastY = h - ((history[history.length - 1] - min) / range) * (h - 20) - 10;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    buyAtMarket() {
        const md = this.marketData[this.selectedBreed];
        const cost = md.current;

        if (this.game.coins < cost) {
            this.game.showNotification('Borsa alımı için altın yetersiz!', 'warning');
            return;
        }

        if (this.game.addPigeon(this.selectedBreed)) {
            this.game.coins -= cost;
            if (window.sounds) window.sounds.playCoin();
            if (window.confetti) window.confetti.burst();
            this.game.showNotification(`📈 Borsadan yeni ${PIGEON_BREEDS[this.selectedBreed].name} satın alındı! (-${cost} 🪙)`, 'success');
            this.game.updateHUD();
        }
    }

    sellAtMarket() {
        const md = this.marketData[this.selectedBreed];
        const sellValue = Math.floor(md.current * 0.88);

        const targetPigeon = this.game.flock.find(p => p.breed.id === this.selectedBreed);
        if (!targetPigeon) {
            this.game.showNotification(`Kümesinizde satılacak ${PIGEON_BREEDS[this.selectedBreed].name} bulunmuyor!`, 'warning');
            return;
        }

        if (this.game.flock.length <= 1) {
            this.game.showNotification('Kümesteki son güvercini satamazsınız!', 'warning');
            return;
        }

        // Remove from scene and flock
        this.game.scene.remove(targetPigeon.mesh);
        this.game.flock = this.game.flock.filter(p => p !== targetPigeon);
        this.game.coins += sellValue;

        if (window.sounds) window.sounds.playCoin();
        this.game.showNotification(`📉 ${targetPigeon.name} borsada satıldı: +${sellValue} 🪙`, 'success');
        this.game.updateHUD();
        this.game.renderFlockList();
        this.renderMarketUI();
    }
}
