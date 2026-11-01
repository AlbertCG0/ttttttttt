// Grand Pigeon Acrobatics & Somersault Championship (Büyük Takla Festivali & Turnuva Sistemi)

class CompetitionManager {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.compPigeon = null;
        this.compTimer = 0;
        this.duration = 25; // 25 seconds acrobatic test
        this.taklaCount = 0;
        this.maxAltitude = 0;
        this.interval = null;
        this.currentTourney = null;

        this.tournaments = [
            {
                id: 'koy_kupasi',
                name: 'Köy Çayırı Başlangıç Kupası',
                desc: 'Acemi ve genç taklacıların hünerlerini sergilediği yerel turnuva.',
                entryFee: 60,
                rewardCoins: 280,
                minLevel: 1
            },
            {
                id: 'mardin_kupasi',
                name: 'Mardin Fişekleme & Takla Kupası',
                desc: 'Bölgenin en usta fişekçi güvercinlerinin kapıştığı prestijli yarışma.',
                entryFee: 180,
                rewardCoins: 750,
                minLevel: 3
            },
            {
                id: 'sampiyonlar_derbisi',
                name: 'Büyük Türkiye Güvercin Derbisi',
                desc: 'Yalnızca şampiyon kuşların katılabildiği altın kupa mücadelesi!',
                entryFee: 400,
                rewardCoins: 1800,
                minLevel: 5
            }
        ];
    }

    openCompetitionModal() {
        const modal = document.getElementById('comp-modal');
        if (!modal) return;
        modal.classList.remove('hidden');
        this.renderLobby();
    }

    closeCompetitionModal() {
        const modal = document.getElementById('comp-modal');
        if (modal) modal.classList.add('hidden');
        this.stopCompetition();
    }

    renderLobby() {
        const container = document.getElementById('comp-content');
        let tourneyHtml = '';

        this.tournaments.forEach(t => {
            tourneyHtml += `
                <div class="shop-card highlight">
                    <div class="shop-badge">Min. Lv.${t.minLevel}</div>
                    <h4>🏆 ${t.name}</h4>
                    <p>${t.desc}</p>
                    <div class="stats-mini">
                        <span>Giriş: ${t.entryFee} 🪙</span> | <span>1.lik Ödülü: <strong>${t.rewardCoins} 🪙</strong></span>
                    </div>
                    <button class="buy-btn" onclick="window.competition.selectPigeonForTourney('${t.id}')">Yarışmaya Katıl</button>
                </div>
            `;
        });

        container.innerHTML = `
            <div>
                <div class="mezat-banner" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(16, 185, 129, 0.2)); border-color: #f59e0b;">
                    <h2>🏆 BÜYÜK TAKLA & FİŞEKLEME FESTİVALİ</h2>
                    <p>Hakem heyetinin önünde 25 saniye boyunca en seri taklaları atın, kupayı ve dev ödülü kazanın!</p>
                </div>
                <h3 style="margin: 18px 0 10px 0;">Mevcut Turnuvalar:</h3>
                <div class="shop-grid">${tourneyHtml}</div>
            </div>
        `;
    }

    selectPigeonForTourney(tourneyId) {
        this.currentTourney = this.tournaments.find(t => t.id === tourneyId);
        if (!this.currentTourney) return;

        if (this.game.coins < this.currentTourney.entryFee) {
            this.game.showNotification('Katılım ücreti için yeterli altınınız yok!', 'warning');
            return;
        }

        const container = document.getElementById('comp-content');
        let pigeonsHtml = '';

        this.game.flock.forEach((p, idx) => {
            const isEligible = p.level >= this.currentTourney.minLevel;
            pigeonsHtml += `
                <div class="shop-card ${isEligible ? '' : 'disabled'}">
                    <h4>${p.name} (Lv.${p.level})</h4>
                    <p>${p.breed.name} - Takla Yeteneği: ${'⭐'.repeat(p.breed.taklaSkill)}</p>
                    <div class="stats-mini">Maksimum Kondisyon: %100 | Enerji: ${p.energy.toFixed(0)}</div>
                    ${isEligible ? `
                        <button class="buy-btn" onclick="window.competition.startTrial(${idx})">Bu Kuşla Yarışa Başla</button>
                    ` : `
                        <button class="buy-btn" disabled style="background:#64748b; cursor:not-allowed;">Yetersiz Seviye (Min Lv.${this.currentTourney.minLevel})</button>
                    `}
                </div>
            `;
        });

        container.innerHTML = `
            <div>
                <h3>Turnuvaya Katılacak Şampiyon Kuşunuzu Seçin:</h3>
                <div class="shop-grid" style="margin-top: 14px;">${pigeonsHtml}</div>
                <button class="action-btn secondary" style="margin-top: 16px;" onclick="window.competition.renderLobby()">Geri Dön</button>
            </div>
        `;
    }

    startTrial(pigeonIndex) {
        this.compPigeon = this.game.flock[pigeonIndex];
        if (!this.compPigeon) return;

        this.game.coins -= this.currentTourney.entryFee;
        this.closeCompetitionModal();

        this.active = true;
        this.compTimer = this.duration;
        this.taklaCount = 0;
        this.maxAltitude = 0;

        // Launch bird immediately into flight
        this.compPigeon.energy = this.compPigeon.maxEnergy;
        this.compPigeon.launch();
        this.game.selectedPigeon = this.compPigeon;
        this.game.cameraMode = 'FOLLOW';

        this.showCompetitionHUD();

        if (window.sounds) {
            window.sounds.playCheer();
            window.sounds.playWhistle();
        }

        this.interval = setInterval(() => {
            if (!this.active) return;
            this.compTimer--;

            // Track stats
            if (this.compPigeon.position.y > this.maxAltitude) {
                this.maxAltitude = this.compPigeon.position.y;
            }

            this.updateCompetitionHUD();

            if (this.compTimer <= 0) {
                this.finishTrial();
            }
        }, 1000);
    }

    recordTakla() {
        if (this.active) {
            this.taklaCount++;
            this.updateCompetitionHUD();
        }
    }

    showCompetitionHUD() {
        let hud = document.getElementById('competition-overlay');
        if (!hud) {
            hud = document.createElement('div');
            hud.id = 'competition-overlay';
            hud.className = 'competition-overlay glass';
            document.body.appendChild(hud);
        }
        hud.classList.remove('hidden');
        this.updateCompetitionHUD();
    }

    updateCompetitionHUD() {
        const hud = document.getElementById('competition-overlay');
        if (!hud) return;
        hud.innerHTML = `
            <div class="comp-box">
                <div class="comp-timer">⏱️ ${this.compTimer}s</div>
                <div class="comp-title">🏆 ${this.currentTourney.name}</div>
                <div class="comp-stats">
                    <span>Yarışan: <strong>${this.compPigeon.name}</strong></span>
                    <span>Taklalar: <strong style="color:#fbbf24;">${this.taklaCount}</strong></span>
                    <span>İrtifa: <strong>${this.maxAltitude.toFixed(1)}m</strong></span>
                </div>
                <div style="font-size: 0.85rem; color:#6ee7b7; margin-top:4px;">
                    ⚡ [Boşluk] tuşuna basarak hakemlerin önünde seri taklalar atın!
                </div>
            </div>
        `;
    }

    finishTrial() {
        clearInterval(this.interval);
        this.active = false;

        const hud = document.getElementById('competition-overlay');
        if (hud) hud.classList.add('hidden');

        // Jury Score calculation (scale 0-10)
        const taklaScore = Math.min(10, (this.taklaCount / 6) * 10);
        const altScore = Math.min(10, (this.maxAltitude / 22) * 10);
        const breedBonus = (this.compPigeon.breed.taklaSkill / 6) * 2;
        const totalScore = Math.min(10, (taklaScore * 0.6 + altScore * 0.4 + breedBonus * 0.2)).toFixed(1);

        const j1 = (parseFloat(totalScore) - 0.2 + Math.random() * 0.4).toFixed(1);
        const j2 = (parseFloat(totalScore) - 0.1 + Math.random() * 0.3).toFixed(1);
        const j3 = (parseFloat(totalScore) + 0.1 - Math.random() * 0.3).toFixed(1);
        const avg = ((parseFloat(j1) + parseFloat(j2) + parseFloat(j3)) / 3).toFixed(1);

        const wonFirst = avg >= 7.5;
        const wonSecond = avg >= 5.5 && avg < 7.5;

        if (window.sounds) window.sounds.playCheer();

        const modal = document.getElementById('comp-modal');
        modal.classList.remove('hidden');
        const container = document.getElementById('comp-content');

        if (wonFirst) {
            const reward = this.currentTourney.rewardCoins;
            this.game.coins += reward;
            this.compPigeon.gainXP(150);
            container.innerHTML = `
                <div style="text-align: center; padding: 24px;">
                    <div style="font-size: 3.5rem;">🥇 🏆</div>
                    <h2 style="color: #fbbf24; margin: 10px 0;">ŞAMPİYONLUK KUPASI KAZANILDI!</h2>
                    <p style="font-size: 1.1rem; color: #f8fafc;">${this.compPigeon.name} muazzam bir takla gösterisiyle 1. oldu!</p>
                    <div class="jury-scorecard glass" style="margin: 18px auto; max-width: 400px; padding: 14px; border-radius: 12px;">
                        <div>Hakem 1 (Mardin): <strong>${j1} / 10</strong></div>
                        <div>Hakem 2 (Urfa): <strong>${j2} / 10</strong></div>
                        <div>Hakem 3 (Bursa): <strong>${j3} / 10</strong></div>
                        <hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin:8px 0;">
                        <div style="font-size:1.2rem; color:#fef08a;">Ortalama Puan: <strong>${avg}</strong></div>
                    </div>
                    <p style="color:#34d399; font-weight:700; font-size:1.2rem;">Ödül: +${reward} 🪙 & +150 Kuş XP</p>
                    <button class="action-btn primary" style="margin: 18px auto 0 auto;" onclick="window.competition.renderLobby()">Harika!</button>
                </div>
            `;
        } else if (wonSecond) {
            const reward = Math.floor(this.currentTourney.rewardCoins * 0.4);
            this.game.coins += reward;
            this.compPigeon.gainXP(80);
            container.innerHTML = `
                <div style="text-align: center; padding: 24px;">
                    <div style="font-size: 3.5rem;">🥈</div>
                    <h2 style="color: #94a3b8; margin: 10px 0;">2.LİK GÜMÜŞ KUPA!</h2>
                    <p>${this.compPigeon.name} başarılı bir uçuş sergiledi.</p>
                    <div class="jury-scorecard glass" style="margin: 18px auto; max-width: 400px; padding: 14px; border-radius: 12px;">
                        <div>Ortalama Hakem Puanı: <strong>${avg} / 10</strong></div>
                    </div>
                    <p style="color:#38bdf8; font-weight:700;">Teselli Ödülü: +${reward} 🪙 & +80 Kuş XP</p>
                    <button class="action-btn secondary" style="margin: 18px auto 0 auto;" onclick="window.competition.renderLobby()">Tamam</button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div style="text-align: center; padding: 24px;">
                    <div style="font-size: 3.5rem;">🥉</div>
                    <h2 style="color: #fca5a5; margin: 10px 0;">Kürsü Dışı Kaldınız</h2>
                    <p>Takla sayısı veya irtifa hakemleri etkilemeye yetmedi (Ortalama: ${avg}/10).</p>
                    <p style="color: #94a3b8;">Kuşunuzu daha fazla antrenman yaptırıp tekrar deneyin!</p>
                    <button class="action-btn secondary" style="margin: 18px auto 0 auto;" onclick="window.competition.renderLobby()">Tekrar Dene</button>
                </div>
            `;
        }

        this.game.updateHUD();
        this.game.renderFlockList();
    }

    stopCompetition() {
        this.active = false;
        clearInterval(this.interval);
        const hud = document.getElementById('competition-overlay');
        if (hud) hud.classList.add('hidden');
    }
}

window.CompetitionManager = CompetitionManager;
