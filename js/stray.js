// Stray Pigeon Hunting & Decoy (Kaçak Güvercin İndirmece & Pırıltı Verme Mekaniği)

class StrayManager {
    constructor(game) {
        this.game = game;
        this.activeStray = null;
        this.strayMesh = null;
        this.spawnCountdown = 50; // seconds
        this.lureProgress = 0;
        this.isLuring = false;
        this.capturedStrayData = null;

        this.strayBreeds = [
            { breedKey: 'miro', name: 'Kaçak Urfa Mirosu', desc: 'Sert kanat vuran usta bir kaçak.' },
            { breedKey: 'sebap', name: 'Yaban Şebap Kürenk', desc: 'Komşu köyün kaçırdığı asil damızlık.' },
            { breedKey: 'arap', name: 'Gözüpek Arap Karabaş', desc: 'Rüzgarda tek başına süzülen çevik kuş.' },
            { breedKey: 'miski', name: 'Kaçak Sarı Miski', desc: 'Göz alıcı sarı tüyleriyle göğe asılan kuş.' },
            { breedKey: 'posta', name: 'Kayıp Posta Güvercini', desc: 'Balkan rotasından sapmış süper hızlı posta.' }
        ];
    }

    update(delta) {
        if (!this.activeStray) {
            this.spawnCountdown -= delta;
            if (this.spawnCountdown <= 0) {
                this.spawnStray();
            }
            return;
        }

        // Stray pigeon physics & circle pattern
        const stray = this.activeStray;
        stray.angle += delta * stray.flightSpeed;
        const radius = stray.radius;

        if (this.isLuring) {
            // Lure towards rooftop center (0, 1.2, 0)
            stray.position.x = Math.sin(stray.angle) * radius;
            stray.position.z = Math.cos(stray.angle) * radius;
            stray.position.y = Math.max(1.2, stray.position.y - delta * 3.5);
            stray.radius = Math.max(2.5, stray.radius - delta * 4.0);

            this.lureProgress += delta * 18;
            if (this.lureProgress >= 100) {
                this.completeCapture();
            }
        } else {
            // High altitude wander
            stray.position.x = Math.sin(stray.angle) * radius;
            stray.position.z = Math.cos(stray.angle) * radius;
            stray.position.y = 22 + Math.sin(stray.angle * 2) * 3;

            stray.lifetime -= delta;
            if (stray.lifetime <= 0) {
                this.dismissStray('Kaçak güvercin uzaklaşarak köyün üzerinden uçup gitti!');
            }
        }

        if (this.strayMesh) {
            this.strayMesh.position.copy(stray.position);
            this.strayMesh.rotation.y = stray.angle + Math.PI / 2;
        }
    }

    spawnStray() {
        this.spawnCountdown = 65 + Math.random() * 45;
        const pick = this.strayBreeds[Math.floor(Math.random() * this.strayBreeds.length)];

        this.activeStray = {
            breedKey: pick.breedKey,
            name: pick.name,
            desc: pick.desc,
            position: new THREE.Vector3(25, 24, 25),
            angle: Math.random() * Math.PI * 2,
            radius: 28,
            flightSpeed: 0.65,
            lifetime: 35, // 35 seconds to lure
        };

        this.lureProgress = 0;
        this.isLuring = false;

        // Create 3D mesh with distinct glowing halo or purple shimmer
        const strayBreed = PIGEON_BREEDS[pick.breedKey] || PIGEON_BREEDS.mardin;
        const group = new THREE.Group();

        const bGeo = new THREE.SphereGeometry(0.42, 10, 8);
        bGeo.scale(0.85, 0.95, 1.4);
        const bMat = new THREE.MeshLambertMaterial({ color: strayBreed.bodyColor });
        const body = new THREE.Mesh(bGeo, bMat);
        body.position.y = 0.35;
        group.add(body);

        // Shiny aura beacon
        const auraGeo = new THREE.SphereGeometry(0.8, 8, 8);
        const auraMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, wireframe: true, transparent: true, opacity: 0.5 });
        const aura = new THREE.Mesh(auraGeo, auraMat);
        group.add(aura);

        group.position.copy(this.activeStray.position);
        this.game.scene.add(group);
        this.strayMesh = group;

        if (window.sounds) window.sounds.playWhistle();
        this.game.showNotification(`🚨 DİKKAT: Gökyüzünde ${pick.name} süzülüyor! [P] ile pırıltı verip çatıya çekin!`, 'warning');
    }

    givePirilti() {
        if (!this.activeStray) {
            this.game.showNotification('Şu an gökyüzünde kaçak bir güvercin görünmüyor.', 'info');
            return;
        }

        // Must have at least 1 flying pigeon to act as decoy flock
        const flyingCount = this.game.flock.filter(p => p.state === 'FLYING' || p.state === 'FLIPPING').length;
        if (flyingCount === 0) {
            this.game.showNotification('⚠️ Kaçak kuşu indirmek için önce kendi güvercinlerinizi uçurmalısınız (Pırıltı & Yemleme kuşu)!', 'warning');
            return;
        }

        this.isLuring = true;
        if (window.sounds) window.sounds.playPirilti();

        this.game.showNotification('✨ PIRILTI VERİLDİ! Sürünüz kaçak kuşu sarmaladı, terasa indiriyor...', 'success');
    }

    completeCapture() {
        if (!this.activeStray) return;
        const captured = this.activeStray;
        this.dismissStray();

        if (window.sounds) {
            window.sounds.playBilezik();
            window.sounds.playCheer();
        }

        this.capturedStrayData = captured;
        this.openCaptureModal(captured);

        if (window.quests) window.quests.onAction('capture');
    }

    openCaptureModal(captured) {
        let modal = document.getElementById('capture-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'capture-modal';
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-box glass" style="width: 580px; text-align:center;">
                    <div class="modal-header">
                        <h3>🕊️ TEBRİKLER! KAÇAK KUŞ İNDİRİLDİ</h3>
                        <button class="close-btn" onclick="document.getElementById('capture-modal').classList.add('hidden')">&times;</button>
                    </div>
                    <div id="capture-content" style="padding: 16px 0;"></div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        const b = PIGEON_BREEDS[captured.breedKey];
        const ringNumber = `TR-2026-KUŞÇU-${Math.floor(Math.random() * 899 + 100)}`;

        const container = modal.querySelector('#capture-content');
        container.innerHTML = `
            <div style="font-size: 3.5rem; margin-bottom: 8px;">👑</div>
            <h2 style="color: #fbbf24; margin-bottom: 6px;">${captured.name}</h2>
            <p style="color: #94a3b8; font-size: 0.95rem; margin-bottom: 14px;">${captured.desc}</p>
            <div class="glass" style="padding: 12px; border-radius: 12px; margin-bottom: 16px; display:inline-block; text-align:left;">
                <p><strong>Irk:</strong> ${b.name}</p>
                <p><strong>Takla Yeteneği:</strong> ${'⭐'.repeat(b.taklaSkill)}</p>
                <p><strong>Tahmini Değer:</strong> ${b.price + 100} 🪙</p>
                <p><strong>Tescil Bileziği:</strong> <span style="color:#10b981; font-weight:700;">${ringNumber}</span></p>
            </div>
            <div style="display:flex; justify-content:center; gap: 12px;">
                <button class="buy-btn" id="btn-keep-stray" style="background: linear-gradient(135deg, #10b981, #059669); font-size:1rem; padding: 10px 24px;">
                    🏠 Bilezik Tak & Kümese Kat (Ücretsiz)
                </button>
                <button class="buy-btn" id="btn-sell-stray" style="background: linear-gradient(135deg, #e11d48, #be123c); font-size:1rem; padding: 10px 24px;">
                    💰 Mezatçıya Sat (+${b.price + 100} 🪙)
                </button>
            </div>
        `;

        modal.querySelector('#btn-keep-stray').onclick = () => {
            if (this.game.flock.length >= this.game.coopCapacity) {
                this.game.showNotification('Kümes dolu! Kuşu barındırmak için önce kümesi büyütün veya bir kuşu mezatta satın.', 'warning');
                return;
            }
            this.game.addPigeon(captured.breedKey, captured.name, { mother: 'Dağ Yabanı', father: 'Doğal Soy' });
            modal.classList.add('hidden');
            this.game.showNotification(`🎉 ${captured.name} artık sizin kümesinizde!`, 'success');
        };

        modal.querySelector('#btn-sell-stray').onclick = () => {
            const reward = b.price + 100;
            this.game.coins += reward;
            if (window.sounds) window.sounds.playCoin();
            modal.classList.add('hidden');
            this.game.showNotification(`💰 Kaçak güvercin tüccara satıldı: +${reward} 🪙`, 'success');
            this.game.updateHUD();
        };

        modal.classList.remove('hidden');
    }

    dismissStray(msg = null) {
        if (this.strayMesh) {
            this.game.scene.remove(this.strayMesh);
            this.strayMesh = null;
        }
        this.activeStray = null;
        this.isLuring = false;
        this.lureProgress = 0;
        if (msg) this.game.showNotification(msg, 'info');
    }
}
