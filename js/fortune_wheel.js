// Daily Fortune Wheel & Lucky Spin (Günün Kuşçu Şans Çarkı)
// Inspired by mobile reward loops and celebration features in APK

class FortuneWheelManager {
    constructor(game) {
        this.game = game;
        this.isSpinning = false;
        this.currentAngle = 0;
        this.spinVelocity = 0;
        this.animFrame = null;
        this.lastPegIndex = -1;

        this.slices = [
            { text: '300 🪙 Altın', color: '#f59e0b', action: () => this.game.coins += 300 },
            { text: '🌾 10x Yem', color: '#10b981', action: () => { if (window.vet) window.vet.activeBuffs.championFeedPockets += 10; } },
            { text: '🧪 B-Vitamin', color: '#06b6d4', action: () => { if (window.vet) window.vet.items[0].apply(); } },
            { text: '150 🪙 Altın', color: '#eab308', action: () => this.game.coins += 150 },
            { text: '🥚 Efsanevi Yumurta', color: '#a855f7', action: () => {
                const keys = ['miro', 'hunkari', 'sebap'];
                const b = keys[Math.floor(Math.random() * keys.length)];
                this.game.addPigeon(b, `Şanslı ${PIGEON_BREEDS[b].name}`);
            }},
            { text: '🧄 Maya Yağı', color: '#ec4899', action: () => { if (window.vet) window.vet.items[1].apply(); } },
            { text: '600 🪙 BÜYÜK!', color: '#ef4444', action: () => this.game.coins += 600 },
            { text: '🪨 Kalsiyum Taşı', color: '#3b82f6', action: () => { if (window.vet) window.vet.items[2].apply(); } }
        ];
    }

    openWheelModal() {
        const modal = document.getElementById('wheel-modal');
        if (!modal) return;
        modal.classList.remove('hidden');
        this.drawWheel();
    }

    closeWheelModal() {
        const modal = document.getElementById('wheel-modal');
        if (modal) modal.classList.add('hidden');
    }

    drawWheel() {
        const canvas = document.getElementById('wheel-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const radius = cx - 12;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const sliceAngle = (Math.PI * 2) / this.slices.length;

        // Draw segments
        for (let i = 0; i < this.slices.length; i++) {
            const angle = this.currentAngle + i * sliceAngle;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, angle, angle + sliceAngle);
            ctx.fillStyle = this.slices[i].color;
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#0f172a';
            ctx.stroke();

            // Label text
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle + sliceAngle / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px sans-serif';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 4;
            ctx.fillText(this.slices[i].text, radius - 14, 4);
            ctx.restore();
        }

        // Center hub
        ctx.beginPath();
        ctx.arc(cx, cy, 26, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#f59e0b';
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🕊️', cx, cy + 5);

        // Top pointer indicator
        ctx.beginPath();
        ctx.moveTo(cx - 10, 8);
        ctx.lineTo(cx + 10, 8);
        ctx.lineTo(cx, 26);
        ctx.closePath();
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
    }

    spin() {
        if (this.isSpinning) return;

        // Cost check
        if (this.game.coins < 40) {
            this.game.showNotification('Çarkı çevirmek için en az 40 🪙 gerekli!', 'warning');
            return;
        }

        this.game.coins -= 40;
        this.game.updateHUD();
        this.isSpinning = true;

        if (window.sounds) window.sounds.playCoin();

        // Random initial impulse: between 0.28 and 0.45 rad/frame
        this.spinVelocity = 0.32 + Math.random() * 0.18;
        this.animateSpin();
    }

    animateSpin() {
        this.currentAngle += this.spinVelocity;
        this.currentAngle = this.currentAngle % (Math.PI * 2);

        // Sound on peg tick
        const sliceAngle = (Math.PI * 2) / this.slices.length;
        const normalizedAngle = ((Math.PI * 2) - (this.currentAngle % (Math.PI * 2))) % (Math.PI * 2);
        const currentPeg = Math.floor(normalizedAngle / sliceAngle);

        if (currentPeg !== this.lastPegIndex) {
            this.lastPegIndex = currentPeg;
            if (window.sounds) window.sounds.playWheelTick();
        }

        this.drawWheel();

        // Deceleration friction
        this.spinVelocity *= 0.985;

        if (this.spinVelocity > 0.002) {
            this.animFrame = requestAnimationFrame(() => this.animateSpin());
        } else {
            this.isSpinning = false;
            this.spinVelocity = 0;
            this.awardPrize();
        }
    }

    awardPrize() {
        // Pointer is at the top (angle -Math.PI / 2 or 3*Math.PI/2)
        const sliceAngle = (Math.PI * 2) / this.slices.length;
        const topAngle = (3 * Math.PI / 2);
        const relativeAngle = ((topAngle - this.currentAngle) % (Math.PI * 2) + (Math.PI * 2)) % (Math.PI * 2);
        const winningIndex = Math.floor(relativeAngle / sliceAngle) % this.slices.length;

        const won = this.slices[winningIndex];
        won.action();

        if (window.confetti) window.confetti.burst();
        if (window.sounds) window.sounds.playWin();

        this.game.showNotification(`🎉 TEBRİKLER! Şans Çarkından Kazandınız: ${won.text}!`, 'success');
        this.game.updateHUD();
        this.game.renderFlockList();
    }
}
