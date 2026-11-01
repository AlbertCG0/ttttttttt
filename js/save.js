// Game Save & Load System (LocalStorage Persistence)

class SaveManager {
    constructor(game) {
        this.game = game;
        this.storageKey = 'bird_village_save_data_v1';
        this.autoSaveInterval = 15; // seconds
        this.timer = 0;

        window.addEventListener('beforeunload', () => this.save());
    }

    save() {
        try {
            const data = {
                coins: this.game.coins,
                taklaPoints: this.game.taklaPoints,
                coopTier: this.game.coopTier,
                playerLevel: this.game.playerLevel || 1,
                playerXP: this.game.playerXP || 0,
                xpToNextLevel: this.game.xpToNextLevel || 100,
                flock: this.game.flock.map(p => ({
                    id: p.id,
                    name: p.name,
                    breedKey: p.breed.id,
                    level: p.level,
                    xp: p.xp,
                    xpNeeded: p.xpNeeded,
                    taklaCount: p.taklaCount,
                    parents: p.parents,
                    maxEnergy: p.maxEnergy,
                    health: p.health
                })),
                timestamp: Date.now()
            };

            if (window.quests && window.quests.quests) {
                data.quests = window.quests.quests.map(q => ({
                    id: q.id,
                    current: q.current,
                    completed: q.completed,
                    claimed: q.claimed
                }));
            }

            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (e) {
            console.warn('Save error:', e);
        }
    }

    load() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (!raw) return false;
            const data = JSON.parse(raw);

            if (typeof data.coins === 'number') this.game.coins = data.coins;
            if (typeof data.taklaPoints === 'number') this.game.taklaPoints = data.taklaPoints;
            if (typeof data.playerLevel === 'number') this.game.playerLevel = data.playerLevel;
            if (typeof data.playerXP === 'number') this.game.playerXP = data.playerXP;
            if (typeof data.xpToNextLevel === 'number') this.game.xpToNextLevel = data.xpToNextLevel;
            if (typeof data.coopTier === 'number') {
                this.game.coopTier = data.coopTier;
                this.game.coopCapacity = this.game.coopTier === 1 ? 6 : (this.game.coopTier === 2 ? 12 : 20);
                if (this.game.env) this.game.env.buildPigeonLoft(this.game.coopTier);
            }

            if (Array.isArray(data.flock) && data.flock.length > 0) {
                // Clear default flock
                this.game.flock.forEach(p => {
                    if (p.mesh) this.game.scene.remove(p.mesh);
                });
                this.game.flock = [];

                data.flock.forEach(pData => {
                    const pigeon = new Pigeon(pData.breedKey, pData.name, pData.id, pData.parents);
                    pigeon.level = pData.level || 1;
                    pigeon.xp = pData.xp || 0;
                    pigeon.xpNeeded = pData.xpNeeded || 100;
                    pigeon.taklaCount = pData.taklaCount || 0;
                    if (pData.maxEnergy) pigeon.maxEnergy = pData.maxEnergy;
                    if (pData.health) pigeon.health = pData.health;
                    pigeon.energy = pigeon.maxEnergy;

                    this.game.flock.push(pigeon);
                    this.game.scene.add(pigeon.mesh);
                });
            }

            if (data.quests && window.quests) {
                data.quests.forEach(savedQ => {
                    const match = window.quests.quests.find(q => q.id === savedQ.id);
                    if (match) {
                        match.current = savedQ.current;
                        match.completed = savedQ.completed;
                        match.claimed = savedQ.claimed;
                    }
                });
                window.quests.updateBadge();
            }

            return true;
        } catch (e) {
            console.warn('Load error:', e);
            return false;
        }
    }

    resetSave() {
        if (confirm('Tüm köy ilerlemeniz ve kuşlarınız sıfırlanacak! Emin misiniz?')) {
            localStorage.removeItem(this.storageKey);
            location.reload();
        }
    }

    update(delta) {
        this.timer += delta;
        if (this.timer >= this.autoSaveInterval) {
            this.timer = 0;
            this.save();
        }
    }
}
