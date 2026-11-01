// Pigeon Training & Acrobatics Gym (Güvercin Fişekleme & Takla Talim Modülü)

class TrainingManager {
    constructor(game) {
        this.game = game;
        this.selectedPigeon = null;
        this.isTraining = false;
        this.trainingProgress = 0;

        this.trainingDrills = [
            {
                id: 'fisek',
                name: '🚀 Fişekleme & Dikine Tırmanış',
                desc: 'Kuşun dikine fişekleyip göğe asılma yeteneğini keskinleştirir. Takla puanını ve yüksekliğini kalıcı olarak artırır.',
                cost: 45,
                xpGain: 60,
                duration: 4, // seconds
                applyBonus: (p) => {
                    p.breed.taklaSkill = Math.min(10, p.breed.taklaSkill + 1);
                    p.gainXP(60);
                }
            },
            {
                id: 'taban',
                name: '⚡ Taban Taklası & Perdah Talimi',
                desc: 'Kümesten fırlarken ve inişte seri takla atma refleksini kazandırır. Kombo takla katsayısını yükseltir.',
                cost: 50,
                xpGain: 75,
                duration: 5,
                applyBonus: (p) => {
                    p.consecutiveFlips = 0;
                    p.gainXP(75);
                }
            },
            {
                id: 'kondisyon',
                name: '💨 Nefes Açma & Kondisyon Uçuşu',
                desc: 'Kanat kaslarını ve ciğer kapasitesini güçlendirir. Maksimum enerjisini kalıcı olarak +20 birim artırır.',
                cost: 60,
                xpGain: 90,
                duration: 6,
                applyBonus: (p) => {
                    p.maxEnergy += 20;
                    p.energy = p.maxEnergy;
                    p.gainXP(90);
                }
            },
            {
                id: 'sadakat',
                name: '📢 Islık & Pırıltı Refleksi',
                desc: 'Kuşun sahibinin ıslığına ve pırıltısına anında itaat etmesini sağlar. Yabani kuş indirmede lider kuş olur.',
                cost: 40,
                xpGain: 50,
                duration: 4,
                applyBonus: (p) => {
                    p.gainXP(50);
                }
            }
        ];
    }

    openTrainingModal() {
        const modal = document.getElementById('train-modal');
        if (!modal) return;
        modal.classList.remove('hidden');
        this.renderTrainingUI();
    }

    closeTrainingModal() {
        const modal = document.getElementById('train-modal');
        if (modal) modal.classList.add('hidden');
    }

    renderTrainingUI() {
        const container = document.getElementById('train-content');
        if (!container) return;

        if (this.game.flock.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding:20px;">Kümeste eğitilecek güvercin bulunmuyor!</p>';
            return;
        }

        if (!this.selectedPigeon) {
            this.selectedPigeon = this.game.flock[0];
        }

        // Pigeon Selector Dropdown / Row
        let pigeonOptions = '';
        this.game.flock.forEach(p => {
            const isSel = p === this.selectedPigeon;
            pigeonOptions += `
                <button class="action-btn ${isSel ? 'primary' : 'secondary'}" 
                        style="padding: 6px 12px; font-size: 0.8rem;"
                        onclick="window.training.selectPigeonById('${p.id}')">
                    ${p.name} (Lv.${p.level})
                </button>
            `;
        });

        // Drills Grid
        let drillsHtml = '';
        this.trainingDrills.forEach(d => {
            drillsHtml += `
                <div class="shop-card highlight">
                    <div class="shop-badge">+${d.xpGain} XP</div>
                    <h4>${d.name}</h4>
                    <p>${d.desc}</p>
                    <div class="stats-mini">
                        <span>Süre: ${d.duration} sn</span> | <span>Ücret: <strong>${d.cost} 🪙</strong></span>
                    </div>
                    <button class="buy-btn" onclick="window.training.startDrill('${d.id}')" ${this.isTraining ? 'disabled' : ''}>
                        Talime Başla (-${d.cost} 🪙)
                    </button>
                </div>
            `;
        });

        const p = this.selectedPigeon;
        container.innerHTML = `
            <div>
                <div class="mezat-banner" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(16, 185, 129, 0.2)); border-color: #3b82f6;">
                    <h2>🏋️ GÜVERCİN TALİMGAHI & FİŞEK TALİMİ</h2>
                    <p>Usta kuşçular güvercinlerini göğe salmadan önce talimle pişirir! Kuşunuzun nefesini açın, takla yeteneğini zirveye taşıyın.</p>
                </div>

                <div style="margin: 14px 0 10px 0;">
                    <label style="font-size:0.85rem; color:#94a3b8; display:block; margin-bottom: 6px;">Eğitilecek Kuşu Seçin:</label>
                    <div style="display:flex; flex-wrap:wrap; gap:8px;">${pigeonOptions}</div>
                </div>

                <div class="glass" style="padding: 12px 18px; border-radius: 12px; margin-bottom: 16px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong style="font-size:1.05rem; color:#f8fafc;">${p.name}</strong> 
                        <span style="color:#fbbf24; font-size:0.85rem; margin-left:8px;">[Lv.${p.level} ${p.breed.name}]</span>
                        <div style="font-size:0.8rem; color:#94a3b8; margin-top:3px;">
                            Takla: ${'⭐'.repeat(p.breed.taklaSkill)} | Maks Enerji: ${p.maxEnergy} | Toplam Takla: ${p.taklaCount}
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <span style="font-size:0.75rem; color:#94a3b8; display:block;">Deneyim Puanı (XP)</span>
                        <strong style="color:#10b981;">${p.xp} / ${p.xpNeeded}</strong>
                    </div>
                </div>

                <div id="train-status" style="margin-bottom:12px; display:${this.isTraining ? 'block' : 'none'};">
                    <div style="font-size:0.85rem; color:#fbbf24; margin-bottom:4px;">⏳ Talim yapılıyor... (%<span id="train-pct">0</span>)</div>
                    <div class="energy-bar" style="height:10px;"><div id="train-bar" class="fill" style="width:0%; background:#3b82f6;"></div></div>
                </div>

                <h3 style="margin: 10px 0;">Mevcut Talim Programları:</h3>
                <div class="shop-grid">${drillsHtml}</div>
            </div>
        `;
    }

    selectPigeonById(id) {
        const found = this.game.flock.find(p => p.id === id);
        if (found) {
            this.selectedPigeon = found;
            this.renderTrainingUI();
        }
    }

    startDrill(drillId) {
        if (this.isTraining) return;
        const drill = this.trainingDrills.find(d => d.id === drillId);
        if (!drill) return;

        if (this.game.coins < drill.cost) {
            this.game.showNotification('Talim ücreti için yeterli altınınız yok!', 'warning');
            return;
        }

        const p = this.selectedPigeon;
        if (p.energy < 25) {
            this.game.showNotification('Bu güvercin çok yorgun! Önce yem ve su ile dinlendirin.', 'warning');
            return;
        }

        this.game.coins -= drill.cost;
        p.energy = Math.max(0, p.energy - 25);
        this.isTraining = true;
        this.trainingProgress = 0;
        this.game.updateHUD();

        if (window.sounds) window.sounds.playFlap(1.5);
        this.renderTrainingUI();

        const statusEl = document.getElementById('train-status');
        const barEl = document.getElementById('train-bar');
        const pctEl = document.getElementById('train-pct');

        if (statusEl) statusEl.style.display = 'block';

        const stepTime = (drill.duration * 1000) / 20;
        const interval = setInterval(() => {
            this.trainingProgress += 5;
            if (barEl) barEl.style.width = `${this.trainingProgress}%`;
            if (pctEl) pctEl.innerText = this.trainingProgress;

            if (this.trainingProgress >= 100) {
                clearInterval(interval);
                this.isTraining = false;
                drill.applyBonus(p);

                if (window.sounds) window.sounds.playCombo(3);
                this.game.showNotification(`🎉 ${p.name} talimi başarıyla tamamladı! (+${drill.xpGain} XP)`, 'success');
                this.game.updateHUD();
                this.renderTrainingUI();

                // Trigger quest check if exists
                if (window.quests) window.quests.onAction('train');
            }
        }, stepTime);
    }
}
