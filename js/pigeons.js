// Pigeon Breeds, 3D Mesh Generator (including Balon & Hünkari), and Flocking AI

const PIGEON_BREEDS = {
    mardin: {
        id: 'mardin',
        name: 'Mardin Taklacısı',
        desc: 'Efsanevi Türk taklacısı. Dikine fişekler ve seri takla atar.',
        bodyColor: 0x9ca3af,
        breastColor: 0xb0b7c3,
        wingColor: 0x6b7280,
        neckSheen: 0x10b981,
        taklaSkill: 5,
        speed: 1.1,
        stamina: 100,
        price: 150,
        type: 'taklaci'
    },
    balon: {
        id: 'balon',
        name: 'Balon Güvercini (Pouter)',
        desc: 'Devasa şişkin göğsü ve dik duruşuyla köyün en gösterişli kuşu.',
        bodyColor: 0xe0e7ff,
        breastColor: 0xffffff,
        wingColor: 0xc7d2fe,
        neckSheen: 0xa855f7,
        taklaSkill: 3,
        speed: 0.95,
        stamina: 160,
        price: 480,
        type: 'balon',
        balloonChest: true
    },
    hunkari: {
        id: 'hunkari',
        name: 'Osmanlı Hünkarisi',
        desc: 'Tarihi saray kuşu. Tepeli başı ve desenli kanatlarıyla asil ırk.',
        bodyColor: 0xfef3c7,
        breastColor: 0xffedd5,
        wingColor: 0xd97706,
        neckSheen: 0xf59e0b,
        taklaSkill: 4,
        speed: 1.15,
        stamina: 140,
        price: 520,
        type: 'hunkari',
        crested: true
    },
    arap: {
        id: 'arap',
        name: 'Arap Karabaş',
        desc: 'Simsiyah parlak tüyler, beyaz paçalı, çok çevik ve dayanıklı.',
        bodyColor: 0x1f2937,
        breastColor: 0x111827,
        wingColor: 0x0f172a,
        neckSheen: 0x6366f1,
        taklaSkill: 4,
        speed: 1.3,
        stamina: 120,
        price: 250,
        type: 'taklaci'
    },
    sebap: {
        id: 'sebap',
        name: 'Şebap Kürenk',
        desc: 'Kuşçuların gözbebeği. Yüksek prestijli ve asil duruşlu güvercin.',
        bodyColor: 0xd1d5db,
        breastColor: 0xe5e7eb,
        wingColor: 0x94a3b8,
        neckSheen: 0xec4899,
        taklaSkill: 4,
        speed: 1.0,
        stamina: 140,
        price: 400,
        type: 'taklaci'
    },
    posta: {
        id: 'posta',
        name: 'Posta Kuşu',
        desc: 'Hızlı ve uzun menzilli uçuş uzmanı, fırtınaya en dayanıklı tür.',
        bodyColor: 0x475569,
        breastColor: 0x64748b,
        wingColor: 0x334155,
        neckSheen: 0x06b6d4,
        taklaSkill: 2,
        speed: 1.65,
        stamina: 180,
        price: 320,
        type: 'posta'
    },
    miro: {
        id: 'miro',
        name: 'Urfa Mirosu',
        desc: 'Kral taklacı. Çok yüksekten fişekleyip yere yakın açılır.',
        bodyColor: 0x374151,
        breastColor: 0x4b5563,
        wingColor: 0x1f2937,
        neckSheen: 0x8b5cf6,
        taklaSkill: 6,
        speed: 1.2,
        stamina: 150,
        price: 600,
        type: 'taklaci'
    },
    miski: {
        id: 'miski',
        name: 'Sarı Miski',
        desc: 'Sarı ve altın tonlarında, havalı ve bol taklalı geleneksel ırk.',
        bodyColor: 0xd97706,
        breastColor: 0xf59e0b,
        wingColor: 0xb45309,
        neckSheen: 0xfacc15,
        taklaSkill: 5,
        speed: 1.1,
        stamina: 110,
        price: 350,
        type: 'taklaci'
    }
};

class Pigeon {
    constructor(breedKey, name, id, parents = null) {
        this.id = id || 'p_' + Math.floor(Math.random() * 100000);
        this.breed = PIGEON_BREEDS[breedKey] || PIGEON_BREEDS.mardin;
        this.name = name || `${this.breed.name} #${Math.floor(Math.random() * 90 + 10)}`;
        this.parents = parents || { mother: 'Doğal Soy', father: 'Doğal Soy' };
        
        // Progression & Stats
        this.level = 1;
        this.xp = 0;
        this.xpNeeded = 100;
        this.taklaCount = 0;
        this.consecutiveFlips = 0;
        
        // Status & Health
        this.health = 100;
        this.maxEnergy = this.breed.stamina;
        this.energy = this.maxEnergy;
        this.hunger = 10;
        this.thirst = 10;
        this.state = 'PERCHED'; // PERCHED, FLYING, FLIPPING, LANDING, EATING, DRINKING

        // Physics & 3D
        this.position = new THREE.Vector3(
            (Math.random() - 0.5) * 8,
            1.2 + Math.random() * 0.4,
            (Math.random() - 0.5) * 8
        );
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(0, 0, 0);
        this.targetPos = null;

        // Animation timing
        this.flapPhase = Math.random() * Math.PI * 2;
        this.headBobPhase = Math.random() * Math.PI * 2;
        this.flipProgress = 0;
        this.flipDuration = 0.4;
        this.flipRotStart = 0;

        this.mesh = this.createMesh();
        this.mesh.position.copy(this.position);
    }

    createMesh() {
        const group = new THREE.Group();

        const bodyMat = new THREE.MeshLambertMaterial({ color: this.breed.bodyColor });
        const breastMat = new THREE.MeshLambertMaterial({ color: this.breed.breastColor });
        const wingMat = new THREE.MeshLambertMaterial({ color: this.breed.wingColor });
        const beakMat = new THREE.MeshLambertMaterial({ color: 0xfbbf24 });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xd97706 });
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
        const footMat = new THREE.MeshLambertMaterial({ color: 0xf87171 });
        const pacaMat = new THREE.MeshLambertMaterial({ color: 0xf3f4f6 });

        // 1. Torso
        const bodyGeo = new THREE.SphereGeometry(0.35, 12, 10);
        bodyGeo.scale(0.85, 0.95, 1.4);
        const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
        bodyMesh.position.set(0, 0.35, 0);
        bodyMesh.castShadow = true;
        group.add(bodyMesh);

        // 2. Chest (Special: Balon Güvercini has gigantic balloon globe!)
        const isBalon = !!this.breed.balloonChest;
        const chestGeo = new THREE.SphereGeometry(isBalon ? 0.52 : 0.32, 12, 10);
        if (isBalon) {
            chestGeo.scale(1.2, 1.4, 1.2);
        } else {
            chestGeo.scale(0.8, 1.0, 0.9);
        }
        const chestMesh = new THREE.Mesh(chestGeo, breastMat);
        chestMesh.position.set(0, isBalon ? 0.55 : 0.42, isBalon ? 0.28 : 0.22);
        group.add(chestMesh);

        // 3. Neck & Head
        this.headGroup = new THREE.Group();
        this.headGroup.position.set(0, isBalon ? 0.75 : 0.55, isBalon ? 0.25 : 0.35);

        const neckGeo = new THREE.CylinderGeometry(0.12, 0.18, 0.25, 8);
        const neckMat = new THREE.MeshLambertMaterial({ color: this.breed.neckSheen });
        const neckMesh = new THREE.Mesh(neckGeo, neckMat);
        neckMesh.rotation.x = 0.2;
        this.headGroup.add(neckMesh);

        const headGeo = new THREE.SphereGeometry(0.16, 10, 8);
        const headMesh = new THREE.Mesh(headGeo, bodyMat);
        headMesh.position.set(0, 0.16, 0.05);
        this.headGroup.add(headMesh);

        // Hünkari Royal Crest (Tepelik)
        if (this.breed.crested) {
            const crestGeo = new THREE.ConeGeometry(0.12, 0.2, 6);
            const crestMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
            const crest = new THREE.Mesh(crestGeo, crestMat);
            crest.position.set(0, 0.3, -0.06);
            crest.rotation.x = -0.5;
            this.headGroup.add(crest);
        }

        // Beak
        const beakGeo = new THREE.ConeGeometry(0.05, 0.18, 6);
        const beakMesh = new THREE.Mesh(beakGeo, beakMat);
        beakMesh.position.set(0, 0.14, 0.22);
        beakMesh.rotation.x = Math.PI / 2.2;
        this.headGroup.add(beakMesh);

        // Eyes
        [-0.12, 0.12].forEach(x => {
            const eyeGeo = new THREE.SphereGeometry(0.04, 6, 6);
            const eyeMesh = new THREE.Mesh(eyeGeo, eyeMat);
            eyeMesh.position.set(x, 0.18, 0.08);

            const pupGeo = new THREE.SphereGeometry(0.02, 4, 4);
            const pupMesh = new THREE.Mesh(pupGeo, pupilMat);
            pupMesh.position.set(x > 0 ? 0.02 : -0.02, 0, 0.02);
            eyeMesh.add(pupMesh);
            this.headGroup.add(eyeMesh);
        });

        group.add(this.headGroup);

        // 4. Tail
        const tailGeo = new THREE.BoxGeometry(0.28, 0.04, 0.65);
        tailGeo.translate(0, 0, -0.3);
        this.tailMesh = new THREE.Mesh(tailGeo, wingMat);
        this.tailMesh.position.set(0, 0.38, -0.45);
        this.tailMesh.rotation.x = -0.25;
        this.tailMesh.castShadow = true;
        group.add(this.tailMesh);

        // 5. Wings
        this.leftWing = new THREE.Group();
        this.leftWing.position.set(0.24, 0.45, 0.05);
        const lWingGeo = new THREE.BoxGeometry(0.7, 0.04, 0.4);
        lWingGeo.translate(0.35, 0, -0.1);
        const lWingMesh = new THREE.Mesh(lWingGeo, wingMat);
        lWingMesh.castShadow = true;
        this.leftWing.add(lWingMesh);
        group.add(this.leftWing);

        this.rightWing = new THREE.Group();
        this.rightWing.position.set(-0.24, 0.45, 0.05);
        const rWingGeo = new THREE.BoxGeometry(0.7, 0.04, 0.4);
        rWingGeo.translate(-0.35, 0, -0.1);
        const rWingMesh = new THREE.Mesh(rWingGeo, wingMat);
        rWingMesh.castShadow = true;
        this.rightWing.add(rWingMesh);
        group.add(this.rightWing);

        // 6. Feet & Paça
        [-0.1, 0.1].forEach(x => {
            const pacaGeo = new THREE.SphereGeometry(0.08, 6, 6);
            pacaGeo.scale(1, 1.4, 1);
            const paca = new THREE.Mesh(pacaGeo, pacaMat);
            paca.position.set(x, 0.16, -0.05);
            group.add(paca);

            const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.14, 4);
            const leg = new THREE.Mesh(legGeo, footMat);
            leg.position.set(x, 0.07, -0.05);
            group.add(leg);
        });

        group.scale.set(0.9, 0.9, 0.9);
        return group;
    }

    getEstimatedMarketValue() {
        return Math.floor(
            this.breed.price * (0.8 + this.level * 0.25) +
            this.taklaCount * 8 +
            (this.breed.taklaSkill * 25)
        );
    }

    gainXP(amount) {
        this.xp += amount;
        if (this.xp >= this.xpNeeded && this.level < 10) {
            this.level++;
            this.xp -= this.xpNeeded;
            this.xpNeeded = Math.floor(this.xpNeeded * 1.5);
            this.maxEnergy += 15;
            this.energy = this.maxEnergy;
            if (window.sounds) window.sounds.playCombo(this.level);
            return true;
        }
        return false;
    }

    launch() {
        if (this.state === 'PERCHED' || this.state === 'EATING' || this.state === 'DRINKING') {
            if (this.energy < 15) return false;
            this.state = 'FLYING';
            this.consecutiveFlips = 0;
            this.velocity.set(
                (Math.random() - 0.5) * 4,
                4.2 + Math.random() * 2,
                (Math.random() - 0.5) * 4
            );
            if (window.sounds) window.sounds.playFlap(1.2);
            return true;
        }
        return false;
    }

    doTakla(timingBonus = 1.0) {
        return this.startFisekOrTakla(timingBonus);
    }

    startFisekOrTakla(timingBonus = 1.0) {
        if ((this.state === 'FLYING' || this.state === 'FISEK' || this.state === 'PERDAH') && this.energy >= 8) {
            if (this.state === 'FLYING' || this.state === 'PERDAH') {
                // Phase 1: FİŞEKLEME - Steep vertical rocket climb with rapid wings
                this.state = 'FISEK';
                this.fisekTimer = 0.38;
                this.consecutiveFlips = 0;
                this.energy = Math.max(0, this.energy - 6);

                const skillFactor = (this.breed.taklaSkill + this.level * 0.5) / 4;
                this.velocity.y = 8.5 * skillFactor * timingBonus;
                this.velocity.x *= 0.4;
                this.velocity.z *= 0.4;
                this.mesh.rotation.x = -Math.PI / 2.6; // Nose up!

                if (window.sounds) {
                    window.sounds.playFlap(1.9);
                    window.sounds.playFisek();
                }

                return {
                    success: true,
                    stage: 'FISEK',
                    combo: 0,
                    points: 30,
                    coins: 6
                };
            } else if (this.state === 'FISEK') {
                // Rhythmic tap during Fişek -> Snap into Taban Taklası!
                return this.doSnapFlip(timingBonus * 1.25);
            }
        }
        return { success: false };
    }

    doSnapFlip(timingBonus = 1.0) {
        this.state = 'FLIPPING';
        this.flipProgress = 0;
        this.flipDuration = 0.32 / (1 + this.level * 0.05);
        this.flipRotStart = this.mesh.rotation.x;

        this.energy = Math.max(0, this.energy - Math.max(4, 10 - this.level));
        this.taklaCount++;
        this.consecutiveFlips++;

        const skillFactor = (this.breed.taklaSkill + this.level * 0.5) / 4;
        this.velocity.y = Math.max(2.5, this.velocity.y * 0.6 + 3.2 * skillFactor);

        if (window.sounds) {
            window.sounds.playTakla();
            if (this.consecutiveFlips >= 2) {
                window.sounds.playCombo(this.consecutiveFlips);
            }
        }

        this.gainXP(25 * timingBonus);
        return {
            success: true,
            stage: 'FLIP',
            combo: this.consecutiveFlips,
            points: Math.floor((55 + this.breed.taklaSkill * 18 + this.level * 10) * timingBonus * (1 + (this.consecutiveFlips - 1) * 0.45)),
            coins: Math.floor((12 + this.breed.taklaSkill * 4 + this.level * 2) * timingBonus)
        };
    }

    callToRooftop(targetTerracePoint, isFeed = false) {
        if (this.state === 'FLYING' || this.state === 'FISEK' || this.state === 'FLIPPING' || this.state === 'PERDAH') {
            this.state = 'LANDING';
            this.consecutiveFlips = 0;
            this.isFeedTarget = isFeed;
            this.targetPos = targetTerracePoint.clone();
            if (isFeed) {
                this.targetPos.x += (Math.random() - 0.5) * 2.2;
                this.targetPos.z += (Math.random() - 0.5) * 2.2;
            } else {
                this.targetPos.x += (Math.random() - 0.5) * 5.0;
                this.targetPos.z += (Math.random() - 0.5) * 5.0;
            }
            this.targetPos.y = 1.0;
        }
    }

    update(delta, flock, villageCenter, weather = { windX: 0, windZ: 0, storm: false }, hawkActive = false) {
        this.flapPhase += delta * 18;
        this.headBobPhase += delta * 6;

        switch (this.state) {
            case 'PERCHED':
                this.updatePerched(delta);
                break;
            case 'FLYING':
                this.updateFlying(delta, flock, villageCenter, weather, hawkActive);
                break;
            case 'FISEK':
                this.updateFisek(delta);
                break;
            case 'FLIPPING':
                this.updateFlipping(delta);
                break;
            case 'PERDAH':
                this.updatePerdah(delta);
                break;
            case 'LANDING':
                this.updateLanding(delta);
                break;
            case 'EATING':
                this.updateEating(delta);
                break;
            case 'DRINKING':
                this.updateDrinking(delta);
                break;
        }

        this.mesh.position.copy(this.position);
    }

    updatePerched(delta) {
        this.leftWing.rotation.set(0, -0.3, 0.25);
        this.rightWing.rotation.set(0, 0.3, -0.25);

        this.headGroup.position.z = 0.35 + Math.sin(this.headBobPhase) * 0.05;
        this.headGroup.position.y = 0.55 + Math.cos(this.headBobPhase * 2) * 0.02;

        if (this.energy < this.maxEnergy) {
            this.energy = Math.min(this.maxEnergy, this.energy + delta * 12);
        }

        if (Math.random() < 0.003 && window.sounds) {
            window.sounds.playCoo();
        }
    }

    updateFlying(delta, flock, villageCenter, weather, hawkActive) {
        const flapAngle = Math.sin(this.flapPhase) * 0.75;
        this.leftWing.rotation.z = flapAngle;
        this.rightWing.rotation.z = -flapAngle;

        const steer = this.calculateFlockingSteer(flock, villageCenter);
        steer.x += weather.windX * 3.2;
        steer.z += weather.windZ * 3.2;

        if (hawkActive) {
            steer.y -= 9.0;
            steer.x += (Math.random() - 0.5) * 6.0;
            steer.z += (Math.random() - 0.5) * 6.0;
        }

        this.acceleration.add(steer);
        this.velocity.addScaledVector(this.acceleration, delta);

        const maxSpd = (9.0 * this.breed.speed) * (1 + this.level * 0.04);
        if (this.velocity.length() > maxSpd) {
            this.velocity.setLength(maxSpd);
        }

        this.position.addScaledVector(this.velocity, delta);
        this.acceleration.set(0, 0, 0);

        if (this.position.y < 5.0) {
            this.velocity.y += delta * 14.0;
        } else if (this.position.y > 28.0) {
            this.velocity.y -= delta * 12.0;
        }

        if (this.velocity.lengthSq() > 0.1) {
            const lookTarget = this.position.clone().add(this.velocity);
            this.mesh.lookAt(lookTarget);
            const turnRate = (this.velocity.x * Math.cos(this.mesh.rotation.y) - this.velocity.z * Math.sin(this.mesh.rotation.y));
            this.mesh.rotation.z = -turnRate * 0.08;
        }

        const weatherMultiplier = weather.storm ? 1.8 : 1.0;
        this.energy = Math.max(0, this.energy - delta * 2.0 * weatherMultiplier);
        this.hunger = Math.min(100, this.hunger + delta * 0.8);
        this.thirst = Math.min(100, this.thirst + delta * 1.0);

        if (this.energy <= 0) {
            this.callToRooftop(villageCenter);
        }
    }

    calculateFlockingSteer(flock, villageCenter) {
        const steer = new THREE.Vector3();
        let neighborCount = 0;
        const separate = new THREE.Vector3();
        const align = new THREE.Vector3();
        const cohere = new THREE.Vector3();

        flock.forEach(other => {
            if (other === this || other.state !== 'FLYING') return;
            const dist = this.position.distanceTo(other.position);
            if (dist < 8.0 && dist > 0.01) {
                const diff = this.position.clone().sub(other.position).divideScalar(dist * dist);
                separate.add(diff);
                align.add(other.velocity);
                cohere.add(other.position);
                neighborCount++;
            }
        });

        if (neighborCount > 0) {
            separate.divideScalar(neighborCount).multiplyScalar(2.8);
            align.divideScalar(neighborCount).sub(this.velocity).multiplyScalar(1.2);
            cohere.divideScalar(neighborCount).sub(this.position).multiplyScalar(0.8);
            steer.add(separate).add(align).add(cohere);
        }

        // Circular loft flight pattern over the village
        const toCenter = villageCenter.clone().sub(this.position);
        toCenter.y = 0;
        const distToCenter = toCenter.length();
        
        const tangent = new THREE.Vector3(-toCenter.z, 0, toCenter.x).normalize().multiplyScalar(4.8);
        steer.add(tangent);

        if (distToCenter > 38.0) {
            toCenter.normalize().multiplyScalar((distToCenter - 38.0) * 0.4);
            steer.add(toCenter);
        } else if (distToCenter < 7.0) {
            toCenter.normalize().multiplyScalar(-3.0);
            steer.add(toCenter);
        }

        return steer;
    }

    updateFisek(delta) {
        this.fisekTimer -= delta;
        this.mesh.rotation.x = -Math.PI / 2.5; // Nose-up climb angle

        // Rapid flapping wings in vertical surge
        this.flapPhase += delta * 32;
        const flapAngle = Math.sin(this.flapPhase) * 1.05;
        this.leftWing.rotation.z = flapAngle;
        this.rightWing.rotation.z = -flapAngle;

        this.position.addScaledVector(this.velocity, delta);
        this.velocity.y = Math.max(1.5, this.velocity.y - delta * 12.0);

        // Climax of the climb: trigger snap backflip!
        if (this.fisekTimer <= 0) {
            this.doSnapFlip(1.1);
        }
    }

    updateFlipping(delta) {
        this.flipProgress += delta / this.flipDuration;
        this.position.addScaledVector(this.velocity, delta);
        this.velocity.y -= delta * 6.5;

        // Backward 360 flip
        this.mesh.rotation.x = this.flipRotStart - this.flipProgress * Math.PI * 2;
        const clap = Math.sin(this.flipProgress * Math.PI * 4);
        this.leftWing.rotation.z = clap * 1.15;
        this.rightWing.rotation.z = -clap * 1.15;

        if (this.flipProgress >= 1.0) {
            // Chance of auto-chaining consecutive flips for master breeds!
            const bonusChance = (this.breed.taklaSkill - 2) * 0.16;
            if (this.consecutiveFlips < 4 && Math.random() < bonusChance && this.energy >= 8) {
                this.doSnapFlip(1.15);
            } else {
                // Transition into smooth Perdah glide
                this.state = 'PERDAH';
                this.perdahTimer = 0.45;
                this.mesh.rotation.x = 0.1;
                this.velocity.y = 0.2;
            }
        }
    }

    updatePerdah(delta) {
        this.perdahTimer -= delta;
        this.leftWing.rotation.set(0, -0.2, 0.35);
        this.rightWing.rotation.set(0, 0.2, -0.35);
        this.mesh.rotation.x = 0;
        this.velocity.y = Math.sin(this.perdahTimer * 6) * 0.6;
        this.position.addScaledVector(this.velocity, delta);

        if (this.perdahTimer <= 0) {
            this.state = 'FLYING';
            this.consecutiveFlips = 0;
            if (window.game) window.game.renderFlockList();
        }
    }

    updateLanding(delta) {
        if (!this.targetPos) {
            this.state = 'PERCHED';
            if (window.game) window.game.renderFlockList();
            return;
        }

        const toTarget = this.targetPos.clone().sub(this.position);
        const horizontalDist = Math.hypot(toTarget.x, toTarget.z);
        const verticalDist = Math.abs(toTarget.y - this.position.y);

        this.leftWing.rotation.z = 0.18 + Math.sin(this.flapPhase * 0.45) * 0.22;
        this.rightWing.rotation.z = -0.18 - Math.sin(this.flapPhase * 0.45) * 0.22;

        // Immediately touch down if near target or close to terrace floor (y <= 1.25)
        if (this.position.y <= 1.25 && horizontalDist < 2.2) {
            this.position.copy(this.targetPos);
            this.position.y = 1.0;
            this.velocity.set(0, 0, 0);
            this.targetPos = null;

            if (this.isFeedTarget) {
                this.state = 'EATING';
                this.eatingTimer = 7.0; // feed animation duration
                this.hunger = 80;
                this.isFeedTarget = false;
            } else if (this.thirst > 35) {
                this.state = 'DRINKING';
                this.drinkingTimer = 5.0;
            } else {
                this.state = 'PERCHED';
            }

            if (window.sounds) window.sounds.playFlap(0.6);
            if (window.game) {
                window.game.updateHUD();
                window.game.renderFlockList();
            }
            return;
        }

        // Steer towards target smoothly
        toTarget.normalize().multiplyScalar(Math.min(horizontalDist * 2.8 + verticalDist * 2.2, 7.5));
        this.velocity.lerp(toTarget, delta * 4.5);
        this.position.addScaledVector(this.velocity, delta);

        if (this.position.y < 1.0) {
            this.position.y = 1.0;
        }

        const lookTarget = this.position.clone().add(this.velocity);
        lookTarget.y = this.position.y;
        this.mesh.lookAt(lookTarget);
    }

    updateEating(delta) {
        this.leftWing.rotation.set(0, -0.3, 0.25);
        this.rightWing.rotation.set(0, 0.3, -0.25);
        this.headBobPhase += delta * 14;
        this.headGroup.rotation.x = 0.5 + Math.abs(Math.sin(this.headBobPhase)) * 0.8;

        if (this.eatingTimer) {
            this.eatingTimer -= delta;
        }
        this.hunger = Math.max(0, this.hunger - delta * 25);
        this.energy = Math.min(this.maxEnergy, this.energy + delta * 20);

        if ((this.eatingTimer && this.eatingTimer <= 0) || this.hunger <= 0) {
            this.state = 'PERCHED';
            this.headGroup.rotation.x = 0;
            if (window.game) {
                window.game.updateHUD();
                window.game.renderFlockList();
            }
        }
    }

    updateDrinking(delta) {
        this.headBobPhase += delta * 8;
        this.headGroup.rotation.x = -0.3 + Math.sin(this.headBobPhase) * 0.6;
        if (this.drinkingTimer) {
            this.drinkingTimer -= delta;
        }
        this.thirst = Math.max(0, this.thirst - delta * 30);
        this.energy = Math.min(this.maxEnergy, this.energy + delta * 15);

        if ((this.drinkingTimer && this.drinkingTimer <= 0) || this.thirst <= 0) {
            this.state = 'PERCHED';
            this.headGroup.rotation.x = 0;
            if (window.game) {
                window.game.updateHUD();
                window.game.renderFlockList();
            }
        }
    }
}

window.Pigeon = Pigeon;
window.PIGEON_BREEDS = PIGEON_BREEDS;
