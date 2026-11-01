// Vet Clinic, Pharmacy & Feed Supplements (Veteriner, Eczane & Güvercin Bakım Merkezi)

class VetManager {
    constructor(game) {
        this.game = game;
        this.activeBuffs = {
            vitaminBoostTimer: 0,
            championFeedPockets: 0,
            mineralBlockActive: false
        };

        this.items = [
            {
                id: 'vitamin_b',
                name: '🧪 B-Kompleks & Elektrolit Vitamini',
                desc: 'Suluktaki suya katılır. Tüm sürünün enerjisini fulleyip 3 dakika boyunca takla çevikliğini artırır.',
                cost: 35,
                apply: () => {
                    this.game.flock.forEach(p => {
                        p.energy = p.maxEnergy;
                        p.health = 100;
                    });
                    this.activeBuffs.vitaminBoostTimer = 180; // 3 minutes
                    if (window.sounds) window.sounds.playMedicine();
                    this.game.showNotification('🧪 Vitaminli su verildi! Tüm sürünün enerjisi yenilendi ve çeviklik kazandı.', 'success');
                }
            },
            {
                id: 'garlic_oil',
                name: '🧄 Sarımsak & Bira Mayası Yağı',
                desc: 'Doğal antibiyotik ve tüy parlatıcı. Sürüyü hastalıklara ve fırtınaya karşı %100 korur.',
                cost: 50,
                apply: () => {
                    this.game.flock.forEach(p => {
                        p.health = 100;
                    });
                    if (window.sounds) window.sounds.playMedicine();
                    this.game.showNotification('🧄 Sarımsaklı maya yağı uygulandı! Tüyler parıldıyor, bağışıklık zirvede.', 'success');
                }
            },
            {
                id: 'mineral_stone',
                name: '🪨 Doğal Kalsiyum & Folluk Taşı',
                desc: 'Kümes folluklarına yerleştirilir. Yumurta kabuğunu güçlendirir, kuluçka süresini %50 hızlandırır.',
                cost: 45,
                apply: () => {
                    this.activeBuffs.mineralBlockActive = true;
                    if (window.sounds) window.sounds.playBuild();
                    this.game.showNotification('🪨 Kalsiyum taşları folluklara yerleştirildi! Kuluçka artık iki kat hızlı.', 'success');
                }
            },
            {
                id: 'champion_grain',
                name: '🌾 Şampiyon Karışık Yemi (Fiğ, Burçak, Darı)',
                desc: '10 porsiyon süper yem. Yem serptiğinizde takla puanları ve altın ödülleri 2 katına çıkar!',
                cost: 60,
                apply: () => {
                    this.activeBuffs.championFeedPockets += 10;
                    if (window.sounds) window.sounds.playFeed();
                    this.game.showNotification(`🌾 Şampiyon yem ambarı dolduruldu! Kalan porsiyon: ${this.activeBuffs.championFeedPockets}`, 'success');
                }
            }
        ];
    }

    openVetModal() {
        const modal = document.getElementById('vet-modal');
        if (!modal) return;
        modal.classList.remove('hidden');
        this.renderVetUI();
    }

    closeVetModal() {
        const modal = document.getElementById('vet-modal');
        if (modal) modal.classList.add('hidden');
    }

    renderVetUI() {
        const container = document.getElementById('vet-content');
        if (!container) return;

        let itemsHtml = '';
        this.items.forEach(it => {
            itemsHtml += `
                <div class="shop-card highlight">
                    <div class="shop-badge">Eczane</div>
                    <h4>${it.name}</h4>
                    <p>${it.desc}</p>
                    <div class="stats-mini">
                        <span>Fiyat: <strong>${it.cost} 🪙</strong></span>
                    </div>
                    <button class="buy-btn" onclick="window.vet.buyItem('${it.id}')">Satın Al & Uygula</button>
                </div>
            `;
        });

        // Current status banner
        const boostText = this.activeBuffs.vitaminBoostTimer > 0 
            ? `<span style="color:#10b981;">Aktif (${Math.ceil(this.activeBuffs.vitaminBoostTimer)} sn)</span>` 
            : '<span style="color:#94a3b8;">Yok</span>';

        container.innerHTML = `
            <div>
                <div class="mezat-banner" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 182, 212, 0.2)); border-color: #10b981;">
                    <h2>🏥 KÖY VETERİNERİ & KUŞ ECZANESİ</h2>
                    <p>Güvercinlerinizin sağlığı, nefesi ve kuluçka verimi için en kaliteli vitamin ve takviyeleri temin edin.</p>
                </div>

                <div class="glass" style="padding: 12px 18px; border-radius: 12px; margin: 14px 0 16px 0; display:flex; justify-content:space-around; text-align:center;">
                    <div>
                        <span style="font-size:0.75rem; color:#94a3b8; display:block;">Vitamin Dopingi</span>
                        <strong>${boostText}</strong>
                    </div>
                    <div>
                        <span style="font-size:0.75rem; color:#94a3b8; display:block;">Şampiyon Yemi</span>
                        <strong style="color:#fbbf24;">${this.activeBuffs.championFeedPockets} Porsiyon</strong>
                    </div>
                    <div>
                        <span style="font-size:0.75rem; color:#94a3b8; display:block;">Kalsiyum Folluk Taşı</span>
                        <strong style="color:${this.activeBuffs.mineralBlockActive ? '#10b981' : '#94a3b8'};">
                            ${this.activeBuffs.mineralBlockActive ? 'Kurulu ✅' : 'Yok ❌'}
                        </strong>
                    </div>
                </div>

                <h3 style="margin: 10px 0;">Mevcut İlaç & Takviyeler:</h3>
                <div class="shop-grid">${itemsHtml}</div>
            </div>
        `;
    }

    buyItem(itemId) {
        const it = this.items.find(i => i.id === itemId);
        if (!it) return;

        if (this.game.coins < it.cost) {
            this.game.showNotification('Yetersiz altın! Satın alamazsınız.', 'warning');
            return;
        }

        this.game.coins -= it.cost;
        it.apply();
        this.game.updateHUD();
        this.renderVetUI();

        if (window.quests) window.quests.onAction('vet');
    }

    update(delta) {
        if (this.activeBuffs.vitaminBoostTimer > 0) {
            this.activeBuffs.vitaminBoostTimer = Math.max(0, this.activeBuffs.vitaminBoostTimer - delta);
        }
    }
}
