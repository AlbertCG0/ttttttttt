// HUD 2D Mini-Radar / Village & Pigeon Compass

class MiniRadar {
    constructor(game) {
        this.game = game;
        this.size = 130;
        this.radarScale = 1.6; // world units to radar pixels

        this.initCanvas();
    }

    initCanvas() {
        this.container = document.createElement('div');
        this.container.id = 'mini-radar-container';
        this.container.className = 'mini-radar-box glass';

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.size;
        this.canvas.height = this.size;
        this.canvas.style.cssText = 'width: 100%; height: 100%; display: block; border-radius: 50%;';
        this.container.appendChild(this.canvas);
        document.body.appendChild(this.container);

        this.ctx = this.canvas.getContext('2d');
    }

    update() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const w = this.size;
        const h = this.size;
        const cx = w / 2;
        const cy = h / 2;

        ctx.clearRect(0, 0, w, h);

        // Background radar grid
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.arc(cx, cy, cx - 2, 0, Math.PI * 2);
        ctx.fill();

        // Rings
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        [cx * 0.35, cx * 0.7, cx * 0.95].forEach(r => {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
        });

        // Crosshairs
        ctx.beginPath();
        ctx.moveTo(cx, 4);
        ctx.lineTo(cx, h - 4);
        ctx.moveTo(4, cy);
        ctx.lineTo(w - 4, cy);
        ctx.stroke();

        // 1. Center / Terrace Marker (Gold)
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(cx - 3, cy - 3, 6, 6);

        // 2. Player Character (Cyan)
        if (this.game.character && this.game.character.position) {
            const charPos = this.game.character.position;
            const px = cx + (charPos.x * this.radarScale * 0.5);
            const py = cy + (charPos.z * this.radarScale * 0.5);
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(px, py, 3.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // 3. Flock Pigeons
        this.game.flock.forEach(p => {
            const rx = cx + (p.position.x * this.radarScale * 0.5);
            const ry = cy + (p.position.z * this.radarScale * 0.5);

            if (p.state === 'FLYING' || p.state === 'FLIPPING') {
                ctx.fillStyle = p.state === 'FLIPPING' ? '#ef4444' : '#f8fafc';
                ctx.beginPath();
                ctx.arc(rx, ry, 2.8, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = 'rgba(74, 222, 128, 0.7)';
                ctx.beginPath();
                ctx.arc(rx, ry, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // 4. Stray Pigeon (Blinking Magenta)
        if (window.stray && window.stray.activeStray) {
            const sPos = window.stray.activeStray.position;
            const sx = cx + (sPos.x * this.radarScale * 0.5);
            const sy = cy + (sPos.z * this.radarScale * 0.5);
            const pulse = (Math.sin(performance.now() * 0.01) + 1) * 0.5;

            ctx.fillStyle = `rgba(217, 70, 239, ${0.5 + pulse * 0.5})`;
            ctx.beginPath();
            ctx.arc(sx, sy, 4.5 + pulse * 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // 5. Hawk Predator (Pulsing Red)
        if (this.game.hawkActive && this.game.env && this.game.env.hawkMesh) {
            const hPos = this.game.env.hawkMesh.position;
            const hx = cx + (hPos.x * this.radarScale * 0.5);
            const hy = cy + (hPos.z * this.radarScale * 0.5);

            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.arc(hx, hy, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#f87171';
            ctx.stroke();
        }

        // Radar Label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('KÖY RADARI', cx, h - 6);
    }
}
