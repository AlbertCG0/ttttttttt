// Bird Village - Full Village Simulation, Live Auction, Tournaments, Free Roam Walking & Day/Night

class Game {
    constructor() {
        this.coins = 550;
        this.taklaPoints = 0;
        this.coopTier = 1;
        this.coopCapacity = 6;
        this.flock = [];
        this.selectedPigeon = null;
        this.cameraMode = 'ROOF'; // 'ROOF', 'VILLAGE', 'WALK', 'FOLLOW', 'COCKPIT', 'ORBIT'
        this.isMuted = false;
        this.isNight = false;

        // Breeding & Incubation
        this.incubating = false;
        this.incubationProgress = 0;

        // Weather
        this.weatherTypes = ['CLEAR', 'WINDY', 'STORM'];
        this.currentWeather = 'CLEAR';
        this.weatherTimer = 0;

        // Hawk Threat
        this.hawkActive = false;
        this.hawkCountdown = 45;

        // Windmill Production Timer
        this.millTimer = 0;

        // Player Career XP & Leveling System
        this.playerLevel = 1;
        this.playerXP = 0;
        this.xpToNextLevel = 100;
        this.comboChain = 0;
        this.lastTaklaTime = 0;

        this.initThree();
        this.initEnvironment();
        this.initVillage();
        this.initCharacter();
        this.initJoystick();
        this.initFlock();
        this.initMezat();
        this.initCompetition();
        this.initTraining();
        this.initStray();
        this.initVet();
        this.initQuests();
        this.initMarketExchange();
        this.initFortuneWheel();
        this.initPassport();
        this.initRadar();
        this.initSave();
        this.initControls();
        this.initUI();

        this.lastTime = performance.now();
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    initThree() {
        this.container = document.getElementById('canvas-container');
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            400
        );
        this.camera.position.set(0, 14, 20);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        if (window.THREE.OrbitControls) {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.maxPolarAngle = Math.PI / 2.05;
            this.controls.minDistance = 2.0;
            this.controls.maxDistance = 140;
            this.controls.target.set(0, 3, 0);
        }

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        window.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    }

    initEnvironment() {
        this.env = new Environment(this.scene);
    }

    initVillage() {
        this.village = new VillageManager(this.scene);
        window.village = this.village;
    }

    initCharacter() {
        this.character = new CharacterController(this.scene, this.camera);
        window.character = this.character;
    }

    initMezat() {
        this.mezat = new MezatManager(this);
        window.mezat = this.mezat;
    }

    initCompetition() {
        this.competition = new CompetitionManager(this);
        window.competition = this.competition;
    }

    initTraining() {
        if (typeof TrainingManager !== 'undefined') {
            this.training = new TrainingManager(this);
            window.training = this.training;
        }
    }

    initStray() {
        if (typeof StrayManager !== 'undefined') {
            this.stray = new StrayManager(this);
            window.stray = this.stray;
        }
    }

    initVet() {
        if (typeof VetManager !== 'undefined') {
            this.vet = new VetManager(this);
            window.vet = this.vet;
        }
    }

    initQuests() {
        if (typeof QuestManager !== 'undefined') {
            this.quests = new QuestManager(this);
            window.quests = this.quests;
        }
    }

    initJoystick() {
        if (typeof VirtualJoystick !== 'undefined' && this.character) {
            this.joystick = new VirtualJoystick(this.character);
            window.joystick = this.joystick;
        }
    }

    initMarketExchange() {
        if (typeof MarketExchangeManager !== 'undefined') {
            this.marketExchange = new MarketExchangeManager(this);
            window.marketExchange = this.marketExchange;
        }
    }

    initFortuneWheel() {
        if (typeof FortuneWheelManager !== 'undefined') {
            this.fortuneWheel = new FortuneWheelManager(this);
            window.fortuneWheel = this.fortuneWheel;
        }
    }

    initPassport() {
        if (typeof PassportManager !== 'undefined') {
            this.passport = new PassportManager(this);
            window.passport = this.passport;
        }
    }

    initRadar() {
        if (typeof MiniRadar !== 'undefined') {
            this.radar = new MiniRadar(this);
            window.radar = this.radar;
        }
    }

    initSave() {
        if (typeof SaveManager !== 'undefined') {
            this.saveManager = new SaveManager(this);
            window.saveManager = this.saveManager;
            this.saveManager.load();
        }
    }

    initFlock() {
        this.addPigeon('mardin', 'Mardin Fişekçisi');
        this.addPigeon('balon', 'Kral Balon');
        this.addPigeon('hunkari', 'Padişah Hünkarisi');
    }

    addPigeon(breedKey, customName, parents = null) {
        if (this.flock.length >= this.coopCapacity) {
            this.showNotification('Kümes kapasitesi dolu! Köyden yeni kümes inşa edin.', 'warning');
            return false;
        }

        const pigeon = new Pigeon(breedKey, customName, null, parents);
        this.flock.push(pigeon);
        this.scene.add(pigeon.mesh);
        this.updateHUD();
        this.renderFlockList();
        return true;
    }

    initControls() {
        window.addEventListener('keydown', (e) => {
            if (e.repeat) return; // Prevent spamming / holding down Space
            if (e.code === 'Space') {
                e.preventDefault();
                this.triggerTakla();
            } else if (e.code === 'KeyU') {
                this.launchFlock();
            } else if (e.code === 'KeyI' || e.code === 'KeyF') {
                this.callWhistle();
            } else if (e.code === 'KeyY') {
                this.throwFeed();
            } else if (e.code === 'KeyC') {
                this.toggleCameraMode();
            } else if (e.code === 'KeyK') {
                this.startBreeding();
            } else if (e.code === 'KeyM') {
                if (this.mezat) this.mezat.openMezatModal();
            } else if (e.code === 'KeyT') {
                if (this.competition) this.competition.openCompetitionModal();
            } else if (e.code === 'KeyP') {
                if (window.stray) window.stray.givePirilti();
            } else if (e.code === 'KeyE') {
                if (window.training) window.training.openTrainingModal();
            } else if (e.code === 'KeyV') {
                if (window.vet) window.vet.openVetModal();
            } else if (e.code === 'KeyQ') {
                if (window.quests) window.quests.openQuestModal();
            }
        });
    }

    bindBtn(id, fn) {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', fn);
    }

    initUI() {
        this.bindBtn('btn-launch', () => this.launchFlock());
        this.bindBtn('btn-takla', () => this.triggerTakla());
        this.bindBtn('btn-whistle', () => this.callWhistle());
        this.bindBtn('btn-feed', () => this.throwFeed());
        this.bindBtn('btn-breed', () => this.startBreeding());
        this.bindBtn('btn-camera', () => this.toggleCameraMode());
        this.bindBtn('btn-mezat', () => { if (this.mezat) this.mezat.openMezatModal(); });
        this.bindBtn('btn-comp', () => { if (this.competition) this.competition.openCompetitionModal(); });
        this.bindBtn('btn-train', () => { if (window.training) window.training.openTrainingModal(); });
        this.bindBtn('btn-stray', () => { if (window.stray) window.stray.givePirilti(); });
        this.bindBtn('btn-vet', () => { if (window.vet) window.vet.openVetModal(); });
        this.bindBtn('btn-quest', () => { if (window.quests) window.quests.openQuestModal(); });
        this.bindBtn('btn-shop', () => this.openShop());
        this.bindBtn('btn-defter', () => this.openDefterModal());
        this.bindBtn('btn-market', () => { if (window.marketExchange) window.marketExchange.openMarketModal(); });
        this.bindBtn('btn-wheel', () => { if (window.fortuneWheel) window.fortuneWheel.openWheelModal(); });
        this.bindBtn('btn-drawer-toggle', () => this.toggleMobileDrawer());
        this.bindBtn('btn-drawer-close', () => this.toggleMobileDrawer());
        this.bindBtn('btn-mobile-menu', () => this.openMobileMenu());
        this.bindBtn('close-mobile-menu', () => this.closeMobileMenu());
        this.bindBtn('btn-floating-cam', () => this.toggleCameraMode());

        // Mobile Menu Quick Settings
        this.bindBtn('m-btn-camera', () => { this.toggleCameraMode(); this.updateMobileMenuUI(); });
        this.bindBtn('m-btn-time', () => { this.toggleDayNight(); this.updateMobileMenuUI(); });
        this.bindBtn('m-btn-sound', () => { this.toggleSound(); this.updateMobileMenuUI(); });
        this.bindBtn('m-btn-save', () => {
            if (this.saveManager) this.saveManager.save();
            this.showNotification('💾 Oyun başarıyla kaydedildi!', 'success');
        });

        // Mobile Menu Arcade Cards
        this.bindBtn('m-card-market', () => this.openFromMobile(() => { if (window.marketExchange) window.marketExchange.openMarketModal(); }));
        this.bindBtn('m-card-wheel', () => this.openFromMobile(() => { if (window.fortuneWheel) window.fortuneWheel.openWheelModal(); }));
        this.bindBtn('m-card-mezat', () => this.openFromMobile(() => { if (this.mezat) this.mezat.openMezatModal(); }));
        this.bindBtn('m-card-comp', () => this.openFromMobile(() => { if (this.competition) this.competition.openCompetitionModal(); }));
        this.bindBtn('m-card-train', () => this.openFromMobile(() => { if (window.training) window.training.openTrainingModal(); }));
        this.bindBtn('m-card-vet', () => this.openFromMobile(() => { if (window.vet) window.vet.openVetModal(); }));
        this.bindBtn('m-card-quest', () => this.openFromMobile(() => { if (window.quests) window.quests.openQuestModal(); }));
        this.bindBtn('m-card-breed', () => this.openFromMobile(() => this.startBreeding()));
        this.bindBtn('m-card-defter', () => this.openFromMobile(() => this.openDefterModal()));
        this.bindBtn('m-card-shop', () => this.openFromMobile(() => this.openShop()));
        this.bindBtn('m-card-clean', () => this.openFromMobile(() => this.cleanCoop()));

        // Close on backdrop tap
        const mobileMenuModal = document.getElementById('mobile-menu-modal');
        if (mobileMenuModal) {
            mobileMenuModal.addEventListener('click', (e) => {
                if (e.target === mobileMenuModal) this.closeMobileMenu();
            });
        }

        this.bindBtn('btn-clean', () => this.cleanCoop());
        this.bindBtn('btn-time', () => this.toggleDayNight());
        this.bindBtn('btn-sound', () => this.toggleSound());

        this.bindBtn('btn-spin-wheel', () => { if (window.fortuneWheel) window.fortuneWheel.spin(); });

        this.bindBtn('close-shop', () => {
            const el = document.getElementById('shop-modal');
            if (el) el.classList.add('hidden');
        });
        this.bindBtn('close-market', () => {
            if (window.marketExchange) window.marketExchange.closeMarketModal();
        });
        this.bindBtn('close-wheel', () => {
            if (window.fortuneWheel) window.fortuneWheel.closeWheelModal();
        });
        this.bindBtn('close-mezat', () => {
            if (this.mezat) this.mezat.closeMezatModal();
        });
        this.bindBtn('close-comp', () => {
            if (this.competition) this.competition.closeCompetitionModal();
        });
        this.bindBtn('close-train', () => {
            if (window.training) window.training.closeTrainingModal();
        });
        this.bindBtn('close-vet', () => {
            if (window.vet) window.vet.closeVetModal();
        });
        this.bindBtn('close-quest', () => {
            if (window.quests) window.quests.closeQuestModal();
        });
        this.bindBtn('close-defter', () => {
            const el = document.getElementById('defter-modal');
            if (el) el.classList.add('hidden');
        });

        this.updateHUD();
        this.renderFlockList();
    }

    launchFlock() {
        let count = 0;
        this.flock.forEach(p => {
            if (p.state === 'PERCHED' || p.state === 'EATING' || p.state === 'DRINKING') {
                if (p.launch()) count++;
            }
        });
        if (count > 0) {
            this.showNotification(`🕊️ ${count} güvercin köyün semalarına salındı! (Pır pır!)`);
            if (window.sounds) window.sounds.playWhistle();
            if (window.quests) window.quests.onAction('launch', count);
        } else {
            this.showNotification('Kuşların enerjisi yetersiz veya hepsi zaten havada!');
        }
        this.updateHUD();
        this.renderFlockList();
    }

    triggerTakla() {
        if (this.taklaCooldown > 0) return;
        this.taklaCooldown = 0.22; // 220ms rhythm cooldown

        const activeFlock = this.flock.filter(p => p.state === 'FLYING' || p.state === 'FISEK' || p.state === 'FLIPPING' || p.state === 'PERDAH');
        if (activeFlock.length === 0) {
            this.showNotification('Önce güvercinleri havalandırın! (U tuşu veya Uçur butonu)', 'info');
            return;
        }

        let targetPigeons = activeFlock;
        if (this.selectedPigeon && activeFlock.includes(this.selectedPigeon)) {
            targetPigeons = [this.selectedPigeon, ...activeFlock.filter(p => p !== this.selectedPigeon)];
        }

        const now = performance.now();
        if (now - this.lastTaklaTime < 3400) {
            this.comboChain++;
        } else {
            this.comboChain = 1;
        }
        this.lastTaklaTime = now;

        if (this.comboChain >= 2) {
            const bonusCoins = this.comboChain * 6;
            const bonusScore = this.comboChain * 15;
            this.coins += bonusCoins;
            this.taklaPoints += bonusScore;
            this.addPlayerXP(this.comboChain * 4, 'combo');
            this.showNotification(`🔥 TAKLA KOMBOSU x${this.comboChain}! +${bonusScore} Puan & +${bonusCoins} 🪙`, 'success');
            if (window.sounds) window.sounds.triggerHaptic([30, 25, 60]);
        }

        let flipped = 0;
        targetPigeons.forEach((p, idx) => {
            setTimeout(() => {
                let weatherBonus = this.currentWeather === 'STORM' ? 1.4 : 1.0;
                if (window.vet && window.vet.activeBuffs && window.vet.activeBuffs.vitaminBoostTimer > 0) {
                    weatherBonus *= 1.25;
                }
                const res = p.startFisekOrTakla(weatherBonus);
                if (res.success) {
                    flipped++;
                    this.taklaPoints += res.points;
                    this.coins += res.coins;
                    this.addPlayerXP(Math.max(3, Math.floor(res.points / 3)), 'takla');

                    if (this.competition && this.competition.active) {
                        this.competition.recordTakla();
                    }

                    this.env.spawnTaklaFeathers(p.position);

                    const rhythmEl = document.getElementById('rhythm-text');
                    if (res.stage === 'FISEK') {
                        if (rhythmEl) rhythmEl.innerText = `🚀 ${p.name}: DİKİNE FİŞEKLEMEDE! [Boşluk] ile Zirvede Taklayı Çak!`;
                        this.showFloatingScore(`🚀 ${p.breed.name}: FİŞEKLEME! +${res.points} Puan`, p.position);
                    } else {
                        const comboText = res.combo > 1 ? ` (x${res.combo} Seri Takla!)` : ' (Taban Taklası!)';
                        if (rhythmEl) rhythmEl.innerText = `⚡ ${p.name}: ${comboText} (+${res.coins} 🪙)`;
                        this.showFloatingScore(`🔥 ${p.breed.name}: TAKLA! +${res.points} Puan${comboText} (+${res.coins} 🪙)`, p.position);
                    }

                    this.updateHUD();
                    this.renderFlockList();
                }
            }, idx * 90);
        });

        if (window.quests) window.quests.onAction('takla', 1);
    }

    callWhistle() {
        if (window.sounds) window.sounds.playWhistle();
        const roofTarget = new THREE.Vector3(0, 1.0, 0);
        let count = 0;
        this.flock.forEach(p => {
            if (p.state === 'FLYING' || p.state === 'FISEK' || p.state === 'FLIPPING' || p.state === 'PERDAH') {
                p.callToRooftop(roofTarget, false);
                count++;
            }
        });

        if (this.hawkActive) {
            this.hawkActive = false;
            this.env.retreatHawk();
            this.coins += 70;
            this.addPlayerXP(18, 'hawk_retreat');
            if (window.quests) window.quests.onAction('whistle');
            this.showNotification('🛡️ Harika! Islıkla sürüyü güvenle çatıya indirdiniz, atmaca uzaklaştı! (+70 🪙 Bonus)', 'success');
        } else {
            this.addPlayerXP(6, 'whistle');
            this.showNotification(`📢 Kuşçu ıslığı çalındı! ${count} güvercin çatıya iniyor.`);
        }

        this.updateHUD();
        this.renderFlockList();
    }

    throwFeed() {
        if (this.coins < 5) {
            this.showNotification('Yem almak için paranız yetersiz!', 'warning');
            return;
        }
        this.coins -= 5;
        if (window.sounds) window.sounds.playFeed();

        let extraMsg = '';
        if (window.vet && window.vet.activeBuffs && window.vet.activeBuffs.championFeedPockets > 0) {
            window.vet.activeBuffs.championFeedPockets--;
            extraMsg = ` (✨ Şampiyon Yemi Dopingi! Kalan: ${window.vet.activeBuffs.championFeedPockets})`;
        }

        const feedPos = new THREE.Vector3(
            (Math.random() - 0.5) * 4.5,
            1.0,
            (Math.random() - 0.5) * 4.5
        );
        this.env.spawnFeed(feedPos);

        this.flock.forEach(p => {
            p.callToRooftop(feedPos, true); // isFeed = true!
        });

        if (window.quests) window.quests.onAction('feed');
        this.addPlayerXP(4, 'feed');
        this.showNotification(`🌾 Kaliteli altın buğday terasa saçıldı! Güvercinler yeme koşuyor (-5 🪙)${extraMsg}`);
        this.updateHUD();
        this.renderFlockList();
    }

    cleanCoop() {
        if (window.sounds) window.sounds.playSweep();
        this.addPlayerXP(12, 'clean');
        this.flock.forEach(p => {
            p.health = 100;
            p.energy = Math.min(p.maxEnergy, p.energy + 20);
        });
        this.coins += 15;
        this.showNotification('🧹 Kümes süpürüldü ve dezenfekte edildi! Kuşların sağlığı %100 oldu (+15 🪙 Hijyen Bonusu)', 'success');
        this.updateHUD();
        this.renderFlockList();
    }

    startBreeding() {
        if (this.incubating) {
            this.showNotification('Kuluçkada zaten yumurta var, çatlamasını bekleyin!', 'warning');
            return;
        }
        if (this.flock.length >= this.coopCapacity) {
            this.showNotification('Kümes tamamen dolu! Yeni yavru için önce kümes inşa edin.', 'warning');
            return;
        }
        if (this.coins < 80) {
            this.showNotification('Kuluçka ve özel vitamin hazırlığı için en az 80 🪙 gerekli!', 'warning');
            return;
        }

        this.coins -= 80;
        this.incubating = true;
        this.incubationProgress = 0;
        const mineralSpeed = (window.vet && window.vet.activeBuffs && window.vet.activeBuffs.mineralBlockActive) ? 650 : 1200;
        this.showNotification(`🥚 Kuluçka başladı! İki damızlık güvercin yumurtaya yattı (-80 🪙)${mineralSpeed < 1000 ? ' (Kalsiyum Hızı Aktif!)' : ''}`);
        this.updateHUD();

        let progressInterval = setInterval(() => {
            this.incubationProgress += 10;
            if (this.incubationProgress >= 100) {
                clearInterval(progressInterval);
                this.incubating = false;

                const breedKeys = Object.keys(PIGEON_BREEDS);
                const randomBreed = breedKeys[Math.floor(Math.random() * breedKeys.length)];
                const babyName = `Yavru ${PIGEON_BREEDS[randomBreed].name}`;
                this.addPigeon(randomBreed, babyName, { mother: 'Köyün Damızlığı', father: 'Kral Soy' });

                if (window.sounds) window.sounds.playHatch();
                this.showNotification(`🐣 YUMURTA ÇATLADI! Yeni bir ${babyName} dünyaya geldi! 🎉`, 'success');
                if (window.quests) window.quests.onAction('breed');
                this.updateHUD();
            }
        }, mineralSpeed);
    }

    toggleDayNight() {
        this.isNight = !this.isNight;
        const btn = document.getElementById('btn-time');

        if (this.isNight) {
            this.scene.background = new THREE.Color(0x090d16);
            this.scene.fog.color = new THREE.Color(0x0f172a);
            this.env.ambientLight.intensity = 0.25;
            this.env.sun.intensity = 0.3;
            this.env.sun.color = new THREE.Color(0x93c5fd); // Moon blue
            this.env.terraceLantern.intensity = 2.0;
            this.village.setNightLighting(true);
            btn.innerText = '🌙 Gece';
            this.showNotification('🌙 Gece çöktü! Fenerler yandı, köy sessizliğe büründü.');
        } else {
            this.scene.background = new THREE.Color(0x7dd3fc);
            this.scene.fog.color = new THREE.Color(0xbae6fd);
            this.env.ambientLight.intensity = 0.7;
            this.env.sun.intensity = 1.2;
            this.env.sun.color = new THREE.Color(0xffedd5); // Warm sun
            this.env.terraceLantern.intensity = 0;
            this.village.setNightLighting(false);
            btn.innerText = '☀️ Gündüz';
            this.showNotification('☀️ Güneş doğdu! Köyde yeni bir gün başlıyor.');
        }
    }

    upgradeCoopBuilding() {
        if (this.coopTier >= 3) {
            this.showNotification('Kümes zaten maksimum seviyede (3. Kademe Saray)!', 'info');
            return;
        }

        const costs = { 1: 350, 2: 750 };
        const nextCost = costs[this.coopTier];

        if (this.coins < nextCost) {
            this.showNotification(`Kümes geliştirme için ${nextCost} 🪙 gerekli!`, 'warning');
            return;
        }

        this.coins -= nextCost;
        this.coopTier++;
        this.coopCapacity = this.coopTier === 2 ? 12 : 20;

        this.env.buildPigeonLoft(this.coopTier);

        if (window.sounds) {
            window.sounds.playBuild();
            window.sounds.playCoin();
        }
        const tierNames = { 2: 'Katlı Ahşap Kümes (Kapasite: 12)', 3: 'Lüks Güvercin Sarayı (Kapasite: 20)' };
        this.showNotification(`🏰 MİMARİ GELİŞTİRME TAMAMLANDI! Yeni Yapı: ${tierNames[this.coopTier]}`, 'success');
        this.openShop();
        this.updateHUD();
    }

    toggleCameraMode() {
        const modes = ['ROOF', 'VILLAGE', 'WALK', 'FOLLOW', 'COCKPIT', 'ORBIT'];
        const nextIdx = (modes.indexOf(this.cameraMode) + 1) % modes.length;
        this.cameraMode = modes[nextIdx];

        const labels = {
            'ROOF': 'Teras Bakışı',
            'VILLAGE': 'Kuşbakışı Köy',
            'WALK': '🚶 Kuşçu Yürüme (WASD)',
            'FOLLOW': 'Kuş Takip Kamerası',
            'COCKPIT': '🦅 Kuşun Gözünden (Kokpit)',
            'ORBIT': 'Serbest Döner Kamera'
        };
        this.showNotification(`🎥 Kamera Modu: ${labels[this.cameraMode]}`);
        const btnCam = document.getElementById('btn-camera');
        if (btnCam) btnCam.innerText = `🎥 ${labels[this.cameraMode]}`;
        const floatCamText = document.getElementById('float-cam-text');
        if (floatCamText) {
            floatCamText.innerText = labels[this.cameraMode];
            floatCamText.style.display = 'inline';
        }
        const mobileCamLabel = document.getElementById('mobile-cam-label');
        if (mobileCamLabel) mobileCamLabel.innerText = labels[this.cameraMode];

        if (this.cameraMode === 'VILLAGE') {
            this.camera.position.set(0, 48, 60);
            if (this.controls) this.controls.target.set(0, 4, 0);
        } else if (this.cameraMode === 'ROOF') {
            this.camera.position.set(0, 14, 20);
            if (this.controls) this.controls.target.set(0, 3, 0);
        }

        if (this.joystick) {
            this.joystick.setVisible(this.cameraMode === 'WALK');
        }
    }

    toggleSound() {
        this.isMuted = !this.isMuted;
        if (window.sounds) window.sounds.setEnabled(!this.isMuted);
        const btnSound = document.getElementById('btn-sound');
        if (btnSound) btnSound.innerText = this.isMuted ? '🔇 Ses: Kapalı' : '🔊 Ses: Açık';
        const mobileSoundLabel = document.getElementById('mobile-sound-label');
        if (mobileSoundLabel) mobileSoundLabel.innerText = this.isMuted ? 'Kapalı' : 'Açık';
        this.showNotification(this.isMuted ? '🔇 Ses kapatıldı.' : '🔊 Ses açıldı.', 'info');
    }

    openShop() {
        const modal = document.getElementById('shop-modal');
        const shopList = document.getElementById('shop-items');
        shopList.innerHTML = '';

        if (this.coopTier < 3) {
            const costs = { 1: 350, 2: 750 };
            const nextCost = costs[this.coopTier];
            const upCard = document.createElement('div');
            upCard.className = 'shop-card highlight';
            upCard.innerHTML = `
                <div class="shop-badge">İnşaat / Mimari</div>
                <h4>Kümes Kademe ${this.coopTier + 1}</h4>
                <p>${this.coopTier === 1 ? 'Çift katlı geniş ahşap kümes ve ilave iniş ızgarası.' : 'Altın alemli lüks Güvercin Sarayı & Islah Köşkü.'}</p>
                <div class="stats-mini">Kapasite: ${this.coopTier === 1 ? '12 Kuş' : '20 Kuş'}</div>
                <button class="buy-btn" id="btn-upgrade-coop">İnşa Et (${nextCost} 🪙)</button>
            `;
            upCard.querySelector('#btn-upgrade-coop').onclick = () => this.upgradeCoopBuilding();
            shopList.appendChild(upCard);
        }

        Object.keys(PIGEON_BREEDS).forEach(key => {
            const b = PIGEON_BREEDS[key];
            const item = document.createElement('div');
            item.className = 'shop-card';
            item.innerHTML = `
                <div class="shop-badge">Takla: ${'⭐'.repeat(b.taklaSkill)}</div>
                <h4>${b.name}</h4>
                <p>${b.desc}</p>
                <div class="stats-mini">
                    <span>Hız: ${b.speed}x</span> | <span>Dayanıklılık: ${b.stamina}</span>
                </div>
                <button class="buy-btn" data-breed="${key}">Satın Al (${b.price} 🪙)</button>
            `;
            item.querySelector('.buy-btn').onclick = () => {
                if (this.coins < b.price) {
                    this.showNotification('Yetersiz bakiye!', 'warning');
                    return;
                }
                if (this.addPigeon(key)) {
                    this.coins -= b.price;
                    if (window.sounds) window.sounds.playCoin();
                    this.showNotification(`🎉 Tebrikler! Yeni ${b.name} kümesinize katıldı!`);
                    this.updateHUD();
                    this.renderFlockList();
                }
            };
            shopList.appendChild(item);
        });

        modal.classList.remove('hidden');
    }

    openDefterModal() {
        const modal = document.getElementById('defter-modal');
        const list = document.getElementById('defter-items');
        list.innerHTML = '';

        this.flock.forEach(p => {
            const card = document.createElement('div');
            card.className = 'defter-card glass';
            card.innerHTML = `
                <div class="defter-badge">Lv.${p.level}</div>
                <h3>${p.name}</h3>
                <span class="defter-breed">${p.breed.name}</span>
                <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 8px 0;">
                <p><strong>Anne/Baba:</strong> ${p.parents.mother} / ${p.parents.father}</p>
                <p><strong>Takla Yeteneği:</strong> ${'⭐'.repeat(p.breed.taklaSkill)}</p>
                <p><strong>Toplam Takla:</strong> ${p.taklaCount} adet</p>
                <p><strong>Maks. Enerji:</strong> ${p.maxEnergy} | <strong>Hız:</strong> ${p.breed.speed}x</p>
                <p><strong>Mezat Değeri:</strong> <span style="color:#fbbf24; font-weight:700;">${p.getEstimatedMarketValue()} 🪙</span></p>
            `;
            list.appendChild(card);
        });

        modal.classList.remove('hidden');
    }

    onPointerDown(event) {
        if (event.target && (
            event.target.closest('.hero-controls') || 
            event.target.closest('.top-quick-dock') || 
            event.target.closest('.modal-overlay') || 
            event.target.closest('#virtual-joystick-zone') || 
            event.target.closest('.side-panel') || 
            event.target.closest('#mini-radar-container') ||
            event.target.closest('.mobile-drawer-toggle') ||
            event.target.closest('.mobile-menu-btn') ||
            event.target.closest('button')
        )) {
            return;
        }

        const clientX = event.clientX !== undefined ? event.clientX : (event.touches && event.touches[0] ? event.touches[0].clientX : 0);
        const clientY = event.clientY !== undefined ? event.clientY : (event.touches && event.touches[0] ? event.touches[0].clientY : 0);
        if (!clientX && !clientY) return;

        this.mouse.x = (clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const meshes = this.flock.map(p => p.mesh);
        const intersects = this.raycaster.intersectObjects(meshes, true);

        if (intersects.length > 0) {
            let hitObj = intersects[0].object;
            while (hitObj.parent && !meshes.includes(hitObj)) {
                hitObj = hitObj.parent;
            }
            const hitPigeon = this.flock.find(p => p.mesh === hitObj);
            if (hitPigeon) {
                this.selectPigeon(hitPigeon);
                if (hitPigeon.state === 'FLYING' || hitPigeon.state === 'FISEK') {
                    const res = hitPigeon.startFisekOrTakla(1.25);
                    if (res.success) {
                        this.taklaPoints += res.points;
                        this.coins += res.coins;
                        this.env.spawnTaklaFeathers(hitPigeon.position);
                        this.showFloatingScore(`🎯 Dokunma Taklası! +${res.points} Puan`, hitPigeon.position);
                        this.updateHUD();
                    }
                } else if (hitPigeon.state === 'PERCHED') {
                    hitPigeon.launch();
                }
            }
        }
    }

    selectPigeon(pigeon) {
        this.selectedPigeon = pigeon;
        this.showNotification(`Seçilen: ${pigeon.name} [Lv.${pigeon.level} ${pigeon.breed.name}]`);
        this.renderFlockList();
    }

    openPassportForPigeon(id) {
        const p = this.flock.find(item => item.id === id);
        if (p && window.passport) {
            window.passport.openPassport(p);
        }
    }

    toggleMobileDrawer() {
        const panel = document.getElementById('side-panel');
        if (panel) panel.classList.toggle('drawer-open');
    }

    toggleMobileMenu() {
        const modal = document.getElementById('mobile-menu-modal');
        if (modal && !modal.classList.contains('hidden')) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        const modal = document.getElementById('mobile-menu-modal');
        if (!modal) return;
        modal.classList.remove('hidden');
        if (window.sounds) {
            window.sounds.playFeed();
            window.sounds.triggerHaptic(20);
        }
        this.updateMobileMenuUI();
    }

    closeMobileMenu() {
        const modal = document.getElementById('mobile-menu-modal');
        if (modal) modal.classList.add('hidden');
    }

    openFromMobile(action) {
        this.closeMobileMenu();
        if (window.sounds) window.sounds.triggerHaptic(15);
        setTimeout(() => {
            if (typeof action === 'function') action();
        }, 100);
    }

    getPlayerRankTitle() {
        const titles = [
            '🌱 Acemi Kuşçu',
            '🕊️ Kuşçu Çırağı',
            '🎖️ Mahalle Kalfası',
            '👑 Usta Kuşçu',
            '⚡ Şampiyon Yetiştirici',
            '🌟 Efsane Kuş Ağası'
        ];
        const idx = Math.min(titles.length - 1, Math.max(0, this.playerLevel - 1));
        return `${titles[idx]} (Lv. ${this.playerLevel})`;
    }

    addPlayerXP(amount, reason = '') {
        this.playerXP += Math.floor(amount);
        if (this.playerXP >= this.xpToNextLevel) {
            this.levelUp();
        } else {
            this.updateMobileMenuUI();
        }
    }

    levelUp() {
        this.playerLevel++;
        this.playerXP = Math.max(0, this.playerXP - this.xpToNextLevel);
        this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.55);
        const rewardCoins = this.playerLevel * 85;
        this.coins += rewardCoins;

        if (window.confettiEngine) window.confettiEngine.burst();
        if (window.sounds) {
            window.sounds.playWin();
            window.sounds.triggerHaptic([80, 40, 80, 40, 160]);
        }

        this.showNotification(`🎉 TEBRİKLER! ${this.getPlayerRankTitle()} unvanına yükseldin! (+${rewardCoins} 🪙)`, 'success');
        this.updateHUD();
        this.updateMobileMenuUI();
    }

    updateMobileMenuUI() {
        const rankTitleEl = document.getElementById('mobile-rank-title');
        if (rankTitleEl) rankTitleEl.innerText = this.getPlayerRankTitle();

        const xpFillEl = document.getElementById('mobile-xp-fill');
        const xpPct = Math.min(100, Math.floor((this.playerXP / this.xpToNextLevel) * 100));
        if (xpFillEl) xpFillEl.style.width = `${xpPct}%`;

        const xpTextEl = document.getElementById('mobile-xp-text');
        if (xpTextEl) xpTextEl.innerText = `${this.playerXP} / ${this.xpToNextLevel} XP (%${xpPct})`;

        const mCoins = document.getElementById('m-stat-coins');
        if (mCoins) mCoins.innerText = this.coins;

        const mScore = document.getElementById('m-stat-score');
        if (mScore) mScore.innerText = this.taklaPoints;

        const mCap = document.getElementById('m-stat-capacity');
        if (mCap) mCap.innerText = `${this.flock.length} / ${this.coopCapacity}`;

        const mFly = document.getElementById('m-stat-flying');
        const flyingCount = this.flock.filter(p => p.state === 'FLYING' || p.state === 'FISEK' || p.state === 'FLIPPING' || p.state === 'PERDAH').length;
        if (mFly) mFly.innerText = flyingCount;

        const camLabel = document.getElementById('mobile-cam-label');
        const camLabels = { 'ROOF': 'Teras', 'VILLAGE': 'Kuşbakışı', 'WALK': 'Yürüyüş', 'FOLLOW': 'Kuş Takip', 'COCKPIT': 'Kokpit', 'ORBIT': 'Dönüş' };
        if (camLabel) camLabel.innerText = camLabels[this.cameraMode] || this.cameraMode;

        const timeLabel = document.getElementById('mobile-time-label');
        if (timeLabel) timeLabel.innerText = this.isNight ? 'Gece' : 'Gündüz';

        const soundLabel = document.getElementById('mobile-sound-label');
        if (soundLabel) soundLabel.innerText = this.isMuted ? 'Kapalı' : 'Açık';
    }

    updateHUD() {
        document.getElementById('hud-coins').innerText = this.coins;
        document.getElementById('hud-score').innerText = this.taklaPoints;
        document.getElementById('hud-capacity').innerText = `${this.flock.length} / ${this.coopCapacity} (Kademe ${this.coopTier})`;
        const flyingCount = this.flock.filter(p => p.state === 'FLYING' || p.state === 'FISEK' || p.state === 'FLIPPING' || p.state === 'PERDAH').length;
        document.getElementById('hud-flying').innerText = flyingCount;
        
        const weatherIcons = { 'CLEAR': '☀️ Güneşli', 'WINDY': '💨 Rüzgarlı', 'STORM': '⛈️ Fırtına' };
        document.getElementById('hud-weather').innerText = weatherIcons[this.currentWeather] || this.currentWeather;

        const breedBtn = document.getElementById('btn-breed');
        if (breedBtn) {
            breedBtn.innerText = this.incubating ? `🥚 Kuluçka (%${this.incubationProgress})` : '🥚 Kuluçka [K]';
        }
    }

    renderFlockList() {
        const listContainer = document.getElementById('flock-items');
        if (!listContainer) return;
        listContainer.innerHTML = '';

        this.flock.forEach((p) => {
            const row = document.createElement('div');
            row.className = `pigeon-row ${this.selectedPigeon === p ? 'active' : ''}`;
            const stateLabels = {
                'PERCHED': '🟢 Kümeste',
                'FLYING': '🕊️ Havada',
                'FISEK': '🚀 Fişekliyor!',
                'FLIPPING': '⚡ Taklada!',
                'PERDAH': '🪶 Perdahta',
                'LANDING': '🛬 İniyor',
                'EATING': '🌾 Yemleniyor',
                'DRINKING': '💧 Su İçiyor'
            };
            const stateClasses = {
                'PERCHED': 'state-perched',
                'FLYING': 'state-flying',
                'FISEK': 'state-fisek',
                'FLIPPING': 'state-flipping',
                'PERDAH': 'state-perdah',
                'LANDING': 'state-landing',
                'EATING': 'state-eating',
                'DRINKING': 'state-drinking'
            };
            row.innerHTML = `
                <div class="p-info">
                    <strong>${p.name} <span class="badge-lv">Lv.${p.level}</span></strong>
                    <span class="p-breed">${p.breed.name}</span>
                </div>
                <div class="p-status">
                    <span class="p-state ${stateClasses[p.state] || ''}">${stateLabels[p.state] || p.state}</span>
                    <div style="display:flex; align-items:center; gap:6px;">
                        <div class="energy-bar"><div class="fill" style="width: ${(p.energy / p.maxEnergy) * 100}%"></div></div>
                        <button class="passport-icon-btn" title="Pasaportu Görüntüle" onclick="event.stopPropagation(); window.game.openPassportForPigeon('${p.id}')">📜</button>
                    </div>
                </div>
            `;
            row.onclick = () => this.selectPigeon(p);
            listContainer.appendChild(row);
        });

        const drawerCount = document.getElementById('drawer-count');
        if (drawerCount) drawerCount.innerText = this.flock.length;
    }

    showNotification(msg, type = 'info') {
        const el = document.getElementById('notification-toast');
        if (!el) return;
        el.innerText = msg;
        el.className = `notification-toast show ${type}`;
        clearTimeout(this.notifTimer);
        this.notifTimer = setTimeout(() => {
            el.className = 'notification-toast';
        }, 3400);
    }

    showFloatingScore(text, worldPos) {
        const screenPos = worldPos.clone().project(this.camera);
        const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(screenPos.y * 0.5) + 0.5) * window.innerHeight;

        const pop = document.createElement('div');
        pop.className = 'floating-score';
        pop.innerText = text;
        pop.style.left = `${x}px`;
        pop.style.top = `${y}px`;
        document.body.appendChild(pop);

        setTimeout(() => pop.remove(), 1400);
    }

    animate(now) {
        requestAnimationFrame(this.animate);
        const delta = Math.min((now - this.lastTime) / 1000, 0.1);
        this.lastTime = now;

        if (this.taklaCooldown > 0) {
            this.taklaCooldown -= delta;
        }

        // Live automatic refresh for state and energy bars
        this.uiRefreshTimer = (this.uiRefreshTimer || 0) + delta;
        if (this.uiRefreshTimer > 0.35) {
            this.uiRefreshTimer = 0;
            this.updateHUD();
            this.renderFlockList();
        }

        const villageCenter = new THREE.Vector3(0, 10, 0);

        // Update player character walking
        this.character.update(delta, this.cameraMode);

        // Windmill automated grain production
        this.millTimer += delta;
        if (this.millTimer > 15) {
            this.millTimer = 0;
            this.coins += 15;
            this.showNotification('🌾 Köy Değirmeni buğday öğüttü! (+15 🪙 Yem Geliri)');
            this.updateHUD();
        }

        // Weather cycle countdown
        this.weatherTimer += delta;
        if (this.weatherTimer > 45) {
            this.weatherTimer = 0;
            const nextWeather = this.weatherTypes[(this.weatherTypes.indexOf(this.currentWeather) + 1) % this.weatherTypes.length];
            this.currentWeather = nextWeather;
            this.env.setWeather(this.currentWeather);
            const wDesc = { 'CLEAR': '☀️ Hava açıldı, rüzgar sakin.', 'WINDY': '💨 Dikkat: Sert rüzgar çıktı! Taklalar daha zor.', 'STORM': '⛈️ Fırtına yaklaşıyor! Yüksek enerji harcanır.' };
            this.showNotification(wDesc[this.currentWeather], 'warning');
            this.updateHUD();
        }

        // Hawk Threat Countdown
        this.hawkCountdown -= delta;
        if (this.hawkCountdown <= 0 && !this.hawkActive) {
            this.hawkCountdown = 50 + Math.random() * 40;
            const flyingCount = this.flock.filter(p => p.state === 'FLYING' || p.state === 'FLIPPING').length;
            if (flyingCount > 0) {
                this.hawkActive = true;
                this.env.triggerHawkAttack();
                this.showNotification('⚠️ TEHLİKE: YIRTICI ATMACA HAVALANDI! ISLIKLA SÜRÜYÜ HEMEN İNDİRİN [F]!', 'warning');
                
                setTimeout(() => {
                    if (this.hawkActive) {
                        this.showNotification('🦅 Atmaca sürüyü darmadağın etti! Kuşlar panikle dağıldı.', 'warning');
                        this.flock.forEach(p => {
                            if (p.state === 'FLYING') p.energy = Math.max(0, p.energy - 35);
                        });
                        this.hawkActive = false;
                        this.env.retreatHawk();
                    }
                }, 12000);
            }
        }

        // Update environment & village
        this.env.update(delta);
        this.village.update(delta);

        // Flock update
        const weatherObj = {
            windX: this.env.windX,
            windZ: this.env.windZ,
            storm: this.currentWeather === 'STORM'
        };

        this.flock.forEach(p => {
            p.update(delta, this.flock, villageCenter, weatherObj, this.hawkActive);
        });

        // Stray Pigeon Luring
        if (window.stray) window.stray.update(delta);

        // Vet & Supplements
        if (window.vet) window.vet.update(delta);

        // Mini Radar HUD
        if (this.radar) this.radar.update();

        // Local Storage Auto-Save
        if (this.saveManager) this.saveManager.update(delta);

        // Camera Modes
        if (this.cameraMode === 'WALK') {
            // Third-person camera following the player character
            const charPos = this.character.position;
            const camOffset = new THREE.Vector3(0, 3.8, 6.5);
            this.camera.position.lerp(charPos.clone().add(camOffset), delta * 5.0);
            this.camera.lookAt(charPos.clone().add(new THREE.Vector3(0, 1.8, 0)));
        } else if (this.cameraMode === 'COCKPIT') {
            const target = this.selectedPigeon || this.flock.find(p => p.state === 'FLYING') || this.flock[0];
            if (target) {
                const forward = target.velocity.clone().normalize().multiplyScalar(0.6);
                const eyePos = target.position.clone().add(new THREE.Vector3(0, 0.45, 0)).add(forward);
                this.camera.position.copy(eyePos);
                const lookAtPos = eyePos.clone().add(forward.multiplyScalar(10));
                this.camera.lookAt(lookAtPos);
            }
        } else if (this.cameraMode === 'FOLLOW') {
            const target = this.selectedPigeon || this.flock.find(p => p.state === 'FLYING') || this.flock[0];
            if (target) {
                const desiredPos = target.position.clone().add(new THREE.Vector3(0, 3.0, 7.0));
                this.camera.position.lerp(desiredPos, delta * 3.5);
                if (this.controls) this.controls.target.lerp(target.position, delta * 4);
            }
        } else if (this.cameraMode === 'ORBIT') {
            const time = now * 0.0003;
            this.camera.position.x = Math.sin(time) * 35;
            this.camera.position.z = Math.cos(time) * 35;
            this.camera.position.y = 18 + Math.sin(time * 0.5) * 5;
            if (this.controls) this.controls.target.set(0, 5, 0);
        }

        if (this.controls && this.cameraMode !== 'COCKPIT' && this.cameraMode !== 'WALK') {
            this.controls.update();
        }

        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
