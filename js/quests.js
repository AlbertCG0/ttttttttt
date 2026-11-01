// Daily Quests & Pigeon Master Achievements (Günlük Görevler & Başarımlar)

class QuestManager {
    constructor(game) {
        this.game = game;
        this.quests = [
            {
                id: 'q_takla',
                title: '⚡ Gökyüzü Akrobatı',
                desc: 'Havada 15 kez takla attırın.',
                target: 15,
                current: 0,
                reward: 90,
                completed: false,
                claimed: false,
                actionType: 'takla'
            },
            {
                id: 'q_mezat',
                title: '🏛️ Mezat Tüccarı',
                desc: 'Canlı mezata katılıp bir kuş alın veya satın.',
                target: 1,
                current: 0,
                reward: 140,
                completed: false,
                claimed: false,
                actionType: 'mezat'
            },
            {
                id: 'q_capture',
                title: '🕊️ Pırıltı Ustası',
                desc: 'Köy semalarından 1 adet kaçak kuşu pırıltıyla çatıya indirin.',
                target: 1,
                current: 0,
                reward: 200,
                completed: false,
                claimed: false,
                actionType: 'capture'
            },
            {
                id: 'q_train',
                title: '🏋️ Talimgah Çırağı',
                desc: 'Güvercinlerinden birine talimgahında özel talim yaptırın.',
                target: 1,
                current: 0,
                reward: 100,
                completed: false,
                claimed: false,
                actionType: 'train'
            },
            {
                id: 'q_breed',
                title: '🐣 Yeni Nesil Damızlık',
                desc: 'Kuluçka yaparak kümese yeni bir yavru güvercin kazandırın.',
                target: 1,
                current: 0,
                reward: 120,
                completed: false,
                claimed: false,
                actionType: 'breed'
            },
            {
                id: 'q_tourney',
                title: '🏆 Şampiyona Heyecanı',
                desc: 'Büyük Takla Turnuvalarından birinde kuşunuzu yarıştırın.',
                target: 1,
                current: 0,
                reward: 180,
                completed: false,
                claimed: false,
                actionType: 'tourney'
            }
        ];
    }

    onAction(type, amount = 1) {
        let changed = false;
        this.quests.forEach(q => {
            if (q.actionType === type && !q.completed) {
                q.current = Math.min(q.target, q.current + amount);
                if (q.current >= q.target) {
                    q.completed = true;
                    changed = true;
                    if (window.sounds) window.sounds.playQuest();
                    this.game.showNotification(`🎖️ GÖREV TAMAMLANDI: "${q.title}"! Görevler menüsünden ödülünüzü alın!`, 'success');
                }
            }
        });
        if (changed) {
            this.updateBadge();
        }
    }

    claimReward(questId) {
        const q = this.quests.find(item => item.id === questId);
        if (!q || !q.completed || q.claimed) return;

        q.claimed = true;
        this.game.coins += q.reward;
        if (window.sounds) window.sounds.playCoin();
        this.game.showNotification(`🎉 Görev ödülü alındı: +${q.reward} 🪙`, 'success');
        this.game.updateHUD();
        this.renderQuestUI();
        this.updateBadge();
    }

    openQuestModal() {
        const modal = document.getElementById('quest-modal');
        if (!modal) return;
        modal.classList.remove('hidden');
        this.renderQuestUI();
    }

    closeQuestModal() {
        const modal = document.getElementById('quest-modal');
        if (modal) modal.classList.add('hidden');
    }

    updateBadge() {
        const uncollected = this.quests.filter(q => q.completed && !q.claimed).length;
        const btn = document.getElementById('btn-quest');
        if (btn) {
            btn.innerHTML = `<span>🎖️</span> Görevler ${uncollected > 0 ? `(${uncollected}!)` : ''}`;
        }
    }

    renderQuestUI() {
        const container = document.getElementById('quest-content');
        if (!container) return;

        let listHtml = '';
        this.quests.forEach(q => {
            const pct = Math.floor((q.current / q.target) * 100);
            let btnState = '';

            if (q.claimed) {
                btnState = `<button class="buy-btn" disabled style="background:#475569; opacity:0.6;">Alındı ✅</button>`;
            } else if (q.completed) {
                btnState = `<button class="buy-btn" style="background: linear-gradient(135deg, #10b981, #059669);" onclick="window.quests.claimReward('${q.id}')">Ödülü Al (+${q.reward} 🪙)</button>`;
            } else {
                btnState = `<button class="buy-btn" disabled style="opacity:0.5;">Devam Ediyor (${q.current}/${q.target})</button>`;
            }

            listHtml += `
                <div class="shop-card ${q.completed && !q.claimed ? 'highlight' : ''}" style="margin-bottom: 10px;">
                    <div class="shop-badge">${q.reward} 🪙 Ödül</div>
                    <h4>${q.title}</h4>
                    <p>${q.desc}</p>
                    <div style="margin: 8px 0;">
                        <div class="energy-bar" style="height: 8px;">
                            <div class="fill" style="width: ${pct}%; background: ${q.completed ? '#10b981' : '#f59e0b'};"></div>
                        </div>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
                        <span style="font-size:0.8rem; color:#94a3b8;">İlerleme: ${q.current} / ${q.target}</span>
                        ${btnState}
                    </div>
                </div>
            `;
        });

        container.innerHTML = `
            <div>
                <div class="mezat-banner" style="background: linear-gradient(135deg, rgba(234, 179, 8, 0.25), rgba(16, 185, 129, 0.2)); border-color: #eab308;">
                    <h2>🎖️ KUŞÇUNUN GÜNLÜK GÖREVLERİ</h2>
                    <p>Görevleri yerine getirerek bolca altın kazanın, sürünüzü genişletin ve köyün 1 numaralı kuşçusu olun!</p>
                </div>
                <div style="margin-top: 14px;">${listHtml}</div>
            </div>
        `;
    }
}
