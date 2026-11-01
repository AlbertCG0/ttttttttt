// Mobile Virtual Touch Joystick & Mobile Controls for 3D Walk & Flight

class VirtualJoystick {
    constructor(characterController) {
        this.character = characterController;
        this.container = null;
        this.base = null;
        this.thumb = null;
        this.sprintBtn = null;

        this.active = false;
        this.touchId = null;
        this.basePos = { x: 0, y: 0 };
        this.maxRadius = 55;
        this.vector = { x: 0, y: 0 };
        this.isSprinting = false;

        this.initUI();
    }

    initUI() {
        this.container = document.createElement('div');
        this.container.id = 'virtual-joystick-zone';
        this.container.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 20px;
            width: 140px;
            height: 140px;
            z-index: 80;
            user-select: none;
            -webkit-user-select: none;
            touch-action: none;
            display: none;
        `;

        this.base = document.createElement('div');
        this.base.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 120px;
            height: 120px;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            background: radial-gradient(circle, rgba(15, 23, 42, 0.65) 0%, rgba(30, 41, 59, 0.85) 100%);
            border: 2px solid rgba(245, 158, 11, 0.45);
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.6), inset 0 0 15px rgba(245, 158, 11, 0.15);
            pointer-events: none;
        `;

        this.thumb = document.createElement('div');
        this.thumb.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 52px;
            height: 52px;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            border: 2px solid #fef08a;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5), 0 0 12px rgba(245, 158, 11, 0.6);
            pointer-events: none;
            transition: transform 0.05s ease-out;
        `;

        this.base.appendChild(this.thumb);
        this.container.appendChild(this.base);

        // Mobile Sprint Button
        this.sprintBtn = document.createElement('button');
        this.sprintBtn.id = 'btn-mobile-sprint';
        this.sprintBtn.innerHTML = '⚡';
        this.sprintBtn.title = 'Hızlı Koş (Sprint)';
        this.sprintBtn.style.cssText = `
            position: fixed;
            bottom: 170px;
            left: 28px;
            width: 54px;
            height: 54px;
            border-radius: 50%;
            background: rgba(30, 41, 59, 0.9);
            border: 2px solid rgba(245, 158, 11, 0.5);
            color: #fbbf24;
            font-size: 1.4rem;
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 80;
            box-shadow: 0 4px 16px rgba(0,0,0,0.5);
            touch-action: none;
        `;

        document.body.appendChild(this.container);
        document.body.appendChild(this.sprintBtn);

        this.bindEvents();
    }

    bindEvents() {
        const onStart = (e) => {
            const touch = e.changedTouches ? e.changedTouches[0] : e;
            this.active = true;
            this.touchId = touch.identifier !== undefined ? touch.identifier : 'mouse';

            const rect = this.container.getBoundingClientRect();
            this.basePos = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
            this.handleMove(touch.clientX, touch.clientY);
        };

        const onMove = (e) => {
            if (!this.active) return;
            let touch = null;
            if (e.changedTouches) {
                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (e.changedTouches[i].identifier === this.touchId) {
                        touch = e.changedTouches[i];
                        break;
                    }
                }
            } else if (this.touchId === 'mouse') {
                touch = e;
            }

            if (touch) {
                this.handleMove(touch.clientX, touch.clientY);
            }
        };

        const onEnd = (e) => {
            if (!this.active) return;
            if (e.changedTouches) {
                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (e.changedTouches[i].identifier === this.touchId) {
                        this.reset();
                        break;
                    }
                }
            } else {
                this.reset();
            }
        };

        this.container.addEventListener('touchstart', onStart, { passive: false });
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onEnd, { passive: false });
        window.addEventListener('touchcancel', onEnd, { passive: false });

        // Mouse fallback
        this.container.addEventListener('mousedown', onStart);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onEnd);

        // Sprint button touch
        const startSprint = (e) => {
            e.preventDefault();
            this.isSprinting = true;
            this.sprintBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            this.sprintBtn.style.transform = 'scale(0.92)';
            if (window.sounds) window.sounds.triggerHaptic([15]);
        };
        const endSprint = (e) => {
            e.preventDefault();
            this.isSprinting = false;
            this.sprintBtn.style.background = 'rgba(30, 41, 59, 0.9)';
            this.sprintBtn.style.transform = 'scale(1)';
        };

        this.sprintBtn.addEventListener('touchstart', startSprint, { passive: false });
        this.sprintBtn.addEventListener('touchend', endSprint, { passive: false });
        this.sprintBtn.addEventListener('mousedown', startSprint);
        this.sprintBtn.addEventListener('mouseup', endSprint);
    }

    handleMove(clientX, clientY) {
        let dx = clientX - this.basePos.x;
        let dy = clientY - this.basePos.y;
        const dist = Math.hypot(dx, dy);

        if (dist > this.maxRadius) {
            dx = (dx / dist) * this.maxRadius;
            dy = (dy / dist) * this.maxRadius;
        }

        this.thumb.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        this.vector.x = dx / this.maxRadius;
        this.vector.y = dy / this.maxRadius;

        if (this.character) {
            this.character.setMobileJoystickInput(this.vector.x, this.vector.y, this.isSprinting);
        }
    }

    reset() {
        this.active = false;
        this.touchId = null;
        this.vector.x = 0;
        this.vector.y = 0;
        this.thumb.style.transform = 'translate(-50%, -50%)';

        if (this.character) {
            this.character.setMobileJoystickInput(0, 0, this.isSprinting);
        }
    }

    setVisible(visible) {
        const display = visible ? 'flex' : 'none';
        if (this.container) this.container.style.display = visible ? 'block' : 'none';
        if (this.sprintBtn) this.sprintBtn.style.display = display;
    }
}

window.VirtualJoystick = VirtualJoystick;
