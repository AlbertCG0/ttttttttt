// Advanced 3D Environment with Full Bird Village Integration & Dynamic Atmosphere

class Environment {
    constructor(scene) {
        this.scene = scene;
        this.coopTier = 1;
        this.coopGroup = null;
        this.clouds = [];
        this.featherParticles = [];
        this.activeFeeds = [];

        // Weather & Wind
        this.timeOfDay = 0.35;
        this.weatherState = 'CLEAR';
        this.windX = 0;
        this.windZ = 0;
        this.windSpeed = 0;

        // Hawk Threat
        this.hawkActive = false;
        this.hawkMesh = null;
        this.hawkAngle = 0;

        this.buildScene();
    }

    buildScene() {
        // 1. Lighting Setup
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(this.ambientLight);

        this.sun = new THREE.DirectionalLight(0xffedd5, 1.2);
        this.sun.position.set(30, 50, 25);
        this.sun.castShadow = true;
        this.sun.shadow.mapSize.width = 2048;
        this.sun.shadow.mapSize.height = 2048;
        this.sun.shadow.camera.near = 0.5;
        this.sun.shadow.camera.far = 160;
        this.sun.shadow.camera.left = -45;
        this.sun.shadow.camera.right = 45;
        this.sun.shadow.camera.top = 45;
        this.sun.shadow.camera.bottom = -45;
        this.scene.add(this.sun);

        this.hemiLight = new THREE.HemisphereLight(0x93c5fd, 0xd97706, 0.35);
        this.scene.add(this.hemiLight);

        // Night Lantern
        this.terraceLantern = new THREE.PointLight(0xfbbf24, 0, 22);
        this.terraceLantern.position.set(0, 3.8, -4.5);
        this.scene.add(this.terraceLantern);

        // 2. Main Rooftop Terrace
        const terraceGeo = new THREE.BoxGeometry(18, 1.2, 18);
        const terraceMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
        const terrace = new THREE.Mesh(terraceGeo, terraceMat);
        terrace.position.set(0, 0, 0);
        terrace.receiveShadow = true;
        this.scene.add(terrace);

        // Kiremit Bordür
        const kiremitMat = new THREE.MeshLambertMaterial({ color: 0xb91c1c });
        [-9.2, 9.2].forEach(x => {
            const tileEdge = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.6, 19.2), kiremitMat);
            tileEdge.position.set(x, 0.2, 0);
            tileEdge.castShadow = true;
            tileEdge.receiveShadow = true;
            this.scene.add(tileEdge);
        });
        [-9.2, 9.2].forEach(z => {
            const tileEdge = new THREE.Mesh(new THREE.BoxGeometry(18, 1.6, 0.8), kiremitMat);
            tileEdge.position.set(0, 0.2, z);
            tileEdge.castShadow = true;
            tileEdge.receiveShadow = true;
            this.scene.add(tileEdge);
        });

        // Railings
        const railMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
        const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6);
        for (let i = -8; i <= 8; i += 2.0) {
            [-8.5, 8.5].forEach(z => {
                const post = new THREE.Mesh(postGeo, railMat);
                post.position.set(i, 1.2, z);
                this.scene.add(post);
            });
            [-8.5, 8.5].forEach(x => {
                const post = new THREE.Mesh(postGeo, railMat);
                post.position.set(x, 1.2, i);
                this.scene.add(post);
            });
        }
        const barGeoX = new THREE.CylinderGeometry(0.03, 0.03, 17, 6);
        barGeoX.rotateZ(Math.PI / 2);
        [-8.5, 8.5].forEach(z => {
            const bar = new THREE.Mesh(barGeoX, railMat);
            bar.position.set(0, 1.8, z);
            this.scene.add(bar);
        });
        const barGeoZ = new THREE.CylinderGeometry(0.03, 0.03, 17, 6);
        barGeoZ.rotateX(Math.PI / 2);
        [-8.5, 8.5].forEach(x => {
            const bar = new THREE.Mesh(barGeoZ, railMat);
            bar.position.set(x, 1.8, 0);
            this.scene.add(bar);
        });

        // 3. Loft & Perches
        this.buildPigeonLoft(this.coopTier);
        this.buildPerchesAndFeeder();
        this.buildTerraceDecorations();
        this.buildClouds();
        this.buildHawk();
    }

    buildPigeonLoft(tier = 1) {
        if (this.coopGroup) {
            this.scene.remove(this.coopGroup);
        }
        this.coopTier = tier;
        this.coopGroup = new THREE.Group();
        this.coopGroup.position.set(0, 0.6, -6.0);

        const woodMat = new THREE.MeshLambertMaterial({ color: tier >= 3 ? 0x1e293b : (tier >= 2 ? 0x92400e : 0x78350f) });
        const woodTrimMat = new THREE.MeshLambertMaterial({ color: tier >= 3 ? 0xf59e0b : 0xb45309 });
        const roofMat = new THREE.MeshLambertMaterial({ color: tier >= 3 ? 0x0f766e : (tier >= 2 ? 0xb91c1c : 0x047857) });

        const shedW = tier === 1 ? 5.4 : (tier === 2 ? 7.2 : 9.0);
        const shedH = tier === 1 ? 3.2 : (tier === 2 ? 4.6 : 5.8);
        const shedD = tier === 1 ? 2.8 : 3.6;

        const shed = new THREE.Mesh(new THREE.BoxGeometry(shedW, shedH, shedD), woodMat);
        shed.position.set(0, shedH / 2, 0);
        shed.castShadow = true;
        shed.receiveShadow = true;
        this.coopGroup.add(shed);

        const roof = new THREE.Mesh(new THREE.ConeGeometry(shedW * 0.72, 1.4, 4), roofMat);
        roof.rotation.y = Math.PI / 4;
        roof.scale.set(1.1, 0.9, 0.75);
        roof.position.set(0, shedH + 0.6, 0);
        roof.castShadow = true;
        this.coopGroup.add(roof);

        const boardCount = tier === 1 ? 1 : (tier === 2 ? 2 : 3);
        for (let b = 0; b < boardCount; b++) {
            const bY = 2.1 + b * 1.5;
            const board = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 1.4), woodTrimMat);
            board.position.set((b - (boardCount - 1) / 2) * 2.8, bY, shedD / 2 + 0.1);
            board.castShadow = true;
            this.coopGroup.add(board);

            const door = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.1, 0.05), new THREE.MeshBasicMaterial({ color: 0x334155, wireframe: true }));
            door.position.set((b - (boardCount - 1) / 2) * 2.8, bY + 0.65, shedD / 2);
            this.coopGroup.add(door);
        }

        if (tier >= 3) {
            const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.1, 1.8, 8), new THREE.MeshLambertMaterial({ color: 0xfbbf24 }));
            spire.position.set(0, shedH + 1.8, 0);
            this.coopGroup.add(spire);

            const statue = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 6), new THREE.MeshLambertMaterial({ color: 0xfbbf24 }));
            statue.scale.set(1, 1, 1.6);
            statue.position.set(0, shedH + 2.6, 0);
            this.coopGroup.add(statue);
        }

        const sign = new THREE.Mesh(new THREE.BoxGeometry(shedW * 0.5, 0.45, 0.08), new THREE.MeshLambertMaterial({ color: 0xfef08a }));
        sign.position.set(0, shedH - 0.2, shedD / 2 + 0.1);
        this.coopGroup.add(sign);

        this.scene.add(this.coopGroup);
    }

    buildPerchesAndFeeder() {
        const poleMat = new THREE.MeshLambertMaterial({ color: 0x57534e });
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4.2, 8), poleMat);
        pole.position.set(6.5, 2.7, -3.5);
        pole.castShadow = true;
        this.scene.add(pole);

        const tBarMat = new THREE.MeshLambertMaterial({ color: 0xb45309 });
        for (let y = 2.4; y <= 4.4; y += 0.7) {
            const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 6), tBarMat);
            bar.rotation.z = Math.PI / 2;
            bar.position.set(6.5, y, -3.5);
            bar.castShadow = true;
            this.scene.add(bar);
        }

        const waterMat = new THREE.MeshLambertMaterial({ color: 0x38bdf8 });
        const trough = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 0.4, 12), waterMat);
        trough.position.set(-5.5, 0.8, -2.5);
        trough.castShadow = true;
        this.scene.add(trough);

        const feedMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
        const feeder = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.3, 0.7), feedMat);
        feeder.position.set(-5.5, 0.75, -1.0);
        feeder.castShadow = true;
        this.scene.add(feeder);
    }

    buildTerraceDecorations() {
        const tableMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
        const table = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.8, 12), tableMat);
        table.position.set(6.0, 1.0, 4.0);
        table.castShadow = true;
        this.scene.add(table);

        const semaver = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.5, 8), new THREE.MeshLambertMaterial({ color: 0x94a3b8 }));
        semaver.position.set(6.0, 1.65, 4.0);
        semaver.castShadow = true;
        this.scene.add(semaver);

        const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.8, 6), new THREE.MeshLambertMaterial({ color: 0x475569 }));
        flagPole.position.set(-7.5, 2.5, 7.0);
        this.scene.add(flagPole);

        const flagMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide });
        this.flagMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), flagMat);
        this.flagMesh.position.set(-6.9, 4.0, 7.0);
        this.scene.add(this.flagMesh);
    }

    buildClouds() {
        const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
        for (let i = 0; i < 18; i++) {
            const cloud = new THREE.Group();
            const puffCount = 4 + Math.floor(Math.random() * 4);
            for (let p = 0; p < puffCount; p++) {
                const puff = new THREE.Mesh(new THREE.SphereGeometry(3.5 + Math.random() * 4.0, 7, 6), cloudMat);
                puff.position.set((p - puffCount / 2) * 3.2, Math.random() * 1.5, (Math.random() - 0.5) * 3.5);
                cloud.add(puff);
            }
            cloud.position.set((Math.random() - 0.5) * 160, 26 + Math.random() * 18, (Math.random() - 0.5) * 160);
            cloud.userData.speed = 0.6 + Math.random() * 0.8;
            this.clouds.push(cloud);
            this.scene.add(cloud);
        }
    }

    buildHawk() {
        this.hawkMesh = new THREE.Group();
        const hawkMat = new THREE.MeshLambertMaterial({ color: 0x451a03 });
        const hawkWingMat = new THREE.MeshLambertMaterial({ color: 0x1c1917 });

        const body = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.6, 6), hawkMat);
        body.rotation.x = Math.PI / 2;
        this.hawkMesh.add(body);

        const lWing = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.7), hawkWingMat);
        lWing.position.set(1.2, 0, 0);
        this.hawkMesh.add(lWing);
        const rWing = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.7), hawkWingMat);
        rWing.position.set(-1.2, 0, 0);
        this.hawkMesh.add(rWing);

        this.hawkMesh.position.set(0, -50, 0);
        this.scene.add(this.hawkMesh);
    }

    triggerHawkAttack() {
        this.hawkActive = true;
        this.hawkAngle = Math.random() * Math.PI * 2;
        this.hawkMesh.position.set(Math.cos(this.hawkAngle) * 38, 26, Math.sin(this.hawkAngle) * 38);
        if (window.sounds) window.sounds.playHawk();
    }

    retreatHawk() {
        this.hawkActive = false;
        this.hawkMesh.position.set(0, -50, 0);
    }

    setWeather(type) {
        this.weatherState = type;
        if (type === 'CLEAR') {
            this.windSpeed = 0.5;
            this.windX = 0.2;
            this.windZ = 0.1;
        } else if (type === 'WINDY') {
            this.windSpeed = 3.5;
            this.windX = (Math.random() - 0.5) * 4.0;
            this.windZ = (Math.random() - 0.5) * 4.0;
        } else if (type === 'STORM') {
            this.windSpeed = 6.0;
            this.windX = (Math.random() - 0.5) * 7.0;
            this.windZ = (Math.random() - 0.5) * 7.0;
        }
    }

    spawnFeed(centerPos) {
        const seedMat = new THREE.MeshLambertMaterial({ color: 0xfacc15 });
        const seedGeo = new THREE.SphereGeometry(0.05, 4, 4);

        for (let i = 0; i < 30; i++) {
            const seed = new THREE.Mesh(seedGeo, seedMat);
            const ox = (Math.random() - 0.5) * 4.0;
            const oz = (Math.random() - 0.5) * 4.0;
            seed.position.set(centerPos.x + ox, 0.62, centerPos.z + oz);
            this.scene.add(seed);
            this.activeFeeds.push(seed);
        }

        setTimeout(() => {
            while (this.activeFeeds.length > 0) {
                const s = this.activeFeeds.pop();
                this.scene.remove(s);
            }
        }, 12000);
    }

    spawnTaklaFeathers(pos) {
        const featherMat = new THREE.MeshBasicMaterial({ color: 0xf1f5f9, transparent: true, opacity: 0.9 });
        const featherGeo = new THREE.PlaneGeometry(0.14, 0.07);

        for (let i = 0; i < 10; i++) {
            const f = new THREE.Mesh(featherGeo, featherMat);
            f.position.copy(pos);
            f.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            f.userData = {
                vel: new THREE.Vector3(
                    (Math.random() - 0.5) * 2.5,
                    (Math.random() - 0.2) * 1.8,
                    (Math.random() - 0.5) * 2.5
                ),
                life: 1.4
            };
            this.featherParticles.push(f);
            this.scene.add(f);
        }
    }

    update(delta) {
        this.clouds.forEach(c => {
            c.position.x += delta * (c.userData.speed + this.windSpeed * 0.4);
            if (c.position.x > 95) c.position.x = -95;
        });

        if (this.flagMesh) {
            this.flagMesh.rotation.y = Math.atan2(this.windZ, this.windX) + Math.sin(performance.now() * 0.01) * 0.25;
        }

        if (this.hawkActive) {
            this.hawkAngle += delta * 1.1;
            const radius = 24;
            this.hawkMesh.position.x = Math.cos(this.hawkAngle) * radius;
            this.hawkMesh.position.z = Math.sin(this.hawkAngle) * radius;
            this.hawkMesh.position.y = 18 + Math.sin(this.hawkAngle * 2) * 3;
            this.hawkMesh.lookAt(new THREE.Vector3(
                Math.cos(this.hawkAngle + 0.1) * radius,
                18,
                Math.sin(this.hawkAngle + 0.1) * radius
            ));
        }

        for (let i = this.featherParticles.length - 1; i >= 0; i--) {
            const f = this.featherParticles[i];
            f.userData.life -= delta;
            f.position.addScaledVector(f.userData.vel, delta);
            f.userData.vel.y -= delta * 0.5;
            f.material.opacity = Math.max(0, f.userData.life);
            if (f.userData.life <= 0) {
                this.scene.remove(f);
                this.featherParticles.splice(i, 1);
            }
        }
    }
}

window.Environment = Environment;
