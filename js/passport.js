// Digital Pigeon Pedigree Passport & Registry Barcode (Dijital Güvercin Pasaportu & Künye)
// Inspired by APK's identity verification, blockchain wallet passport, and QR/barcode models

class PassportManager {
    constructor(game) {
        this.game = game;
    }

    openPassport(pigeon) {
        if (!pigeon) return;

        let modal = document.getElementById('passport-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'passport-modal';
            modal.className = 'modal-overlay hidden';
            modal.innerHTML = `
                <div class="modal-box glass" style="width: 580px; max-width: 95vw;">
                    <div class="modal-header">
                        <h3>📜 Tescilli Güvercin Pasaportu & Soy Kütüğü</h3>
                        <button class="close-btn" onclick="document.getElementById('passport-modal').classList.add('hidden')">&times;</button>
                    </div>
                    <div id="passport-content"></div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        const b = pigeon.breed;
        const ringCode = `TR-${new Date().getFullYear()}-${pigeon.id.toUpperCase()}`;
        const container = modal.querySelector('#passport-content');

        // Draw dynamic barcode in HTML/CSS
        let barcodeBars = '';
        for (let i = 0; i < 36; i++) {
            const w = (i % 3 === 0) ? 3 : ((i % 2 === 0) ? 2 : 1);
            barcodeBars += `<span style="display:inline-block; width:${w}px; height:32px; background:#f8fafc; margin-right:2px;"></span>`;
        }

        container.innerHTML = `
            <div class="passport-card" style="
                background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
                border: 2px solid #f59e0b;
                border-radius: 18px;
                padding: 20px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.7), inset 0 0 20px rgba(245, 158, 11, 0.15);
                position: relative;
                overflow: hidden;
            ">
                <!-- Watermark Logo -->
                <div style="position:absolute; right:-20px; bottom:-20px; font-size:9rem; opacity:0.04; pointer-events:none;">🕊️</div>

                <!-- Header -->
                <div style="text-align:center; border-bottom: 1px dashed rgba(245, 158, 11, 0.4); padding-bottom: 12px; margin-bottom: 14px;">
                    <div style="font-size:0.75rem; letter-spacing:2px; color:#fbbf24; font-weight:800;">TÜRKİYE GÜVERCİN YETİŞTİRİCİLERİ FEDERASYONU</div>
                    <h2 style="font-size:1.35rem; margin: 4px 0; color:#f8fafc;">${pigeon.name}</h2>
                    <span style="font-size:0.85rem; color:#38bdf8; font-weight:700;">${b.name} (Lv.${pigeon.level})</span>
                </div>

                <!-- Main Info Grid -->
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size:0.85rem; margin-bottom: 16px;">
                    <div><span style="color:#94a3b8;">Tescil No:</span> <strong>${ringCode}</strong></div>
                    <div><span style="color:#94a3b8;">Irk Tipi:</span> <strong>${b.type.toUpperCase()}</strong></div>
                    <div><span style="color:#94a3b8;">Anne Soyu:</span> <strong>${pigeon.parents.mother}</strong></div>
                    <div><span style="color:#94a3b8;">Baba Soyu:</span> <strong>${pigeon.parents.father}</strong></div>
                    <div><span style="color:#94a3b8;">Toplam Takla:</span> <strong style="color:#ef4444;">${pigeon.taklaCount} Adet</strong></div>
                    <div><span style="color:#94a3b8;">Mezat Değeri:</span> <strong style="color:#fbbf24;">${pigeon.getEstimatedMarketValue()} 🪙</strong></div>
                </div>

                <!-- Skill Ratings -->
                <div style="background:rgba(0,0,0,0.3); padding:10px 14px; border-radius:12px; margin-bottom: 16px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:0.8rem;">
                        <span>Fişekleme & Dikine Çekiş:</span>
                        <span style="color:#fbbf24;">${'⭐'.repeat(Math.min(5, b.taklaSkill))}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:0.8rem;">
                        <span>Kanat Gücü & Hız:</span>
                        <span style="color:#38bdf8;">${b.speed}x (${b.speed > 1.2 ? 'Süratli' : 'Dengeli'})</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:0.8rem;">
                        <span>Nefes & Dayanıklılık:</span>
                        <span style="color:#10b981;">${pigeon.maxEnergy} Puan</span>
                    </div>
                </div>

                <!-- Barcode & Stamp -->
                <div style="display:flex; justify-content:space-between; align-items:flex-end; border-top: 1px dashed rgba(245, 158, 11, 0.4); padding-top: 12px;">
                    <div>
                        <div style="display:flex; align-items:center; margin-bottom:4px;">${barcodeBars}</div>
                        <span style="font-family:monospace; font-size:0.75rem; color:#94a3b8; letter-spacing:1px;">${ringCode}</span>
                    </div>
                    <div style="text-align:right;">
                        <span style="display:block; font-size:0.7rem; color:#94a3b8;">Mühür / Onay:</span>
                        <span style="font-family:'Brush Script MT', cursive; font-size:1.1rem; color:#f59e0b;">Kuşçu Selman</span>
                    </div>
                </div>
            </div>

            <div style="margin-top: 14px; text-align:center;">
                <button class="buy-btn" style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 8px 24px;"
                        onclick="window.passport.sharePassport('${pigeon.name}')">
                    📱 Pasaportu Paylaş & Onayla
                </button>
            </div>
        `;

        modal.classList.remove('hidden');
    }

    sharePassport(name) {
        if (navigator.share) {
            navigator.share({
                title: 'Kuşçu Pasaportu',
                text: `${name} isimli şampiyon güvercinimin resmi soy kütüğü belgesi!`
            }).catch(() => {});
        } else {
            this.game.showNotification(`📜 ${name} resmi pasaport kaydı federasyon onayına sunuldu!`, 'success');
        }
    }
}

window.passport = null; // initialized in game
