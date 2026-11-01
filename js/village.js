// Bird Village (Kuşçu Köyü) 3D Terrain, Building Construction & Village Simulation

class VillageManager {
    constructor(scene) {
        this.scene = scene;
        this.buildings = [];
        this.windmillBlades = null;
        this.streetLamps = [];
        this.teaSteam = null;

        this.initTerrain();
        this.initDefaultBuildings();
    }

    initTerrain() {
        // Lush green village ground with cobblestone pathways
        const groundGeo = new THREE.PlaneGeometry(160, 160, 24, 24);
        const groundMat = new THREE.MeshLambertMaterial({ color: 0x4ade80 });
        this.ground = new THREE.Mesh(groundGeo, groundMat);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.position.y = -0.05;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);

        // Cobblestone Pathways
        const pathMat = new THREE.MeshLambertMaterial({ color: 0xd6d3d1 });
        const mainRoad = new THREE.Mesh(new THREE.PlaneGeometry(6, 120), pathMat);
        mainRoad.rotation.x = -Math.PI / 2;
        mainRoad.position.set(0, 0.01, 0);
        mainRoad.receiveShadow = true;
        this.scene.add(mainRoad);

        const plazaRoad = new THREE.Mesh(new THREE.PlaneGeometry(90, 6), pathMat);
        plazaRoad.rotation.x = -Math.PI / 2;
        plazaRoad.position.set(0, 0.01, 0);
        plazaRoad.receiveShadow = true;
        this.scene.add(plazaRoad);

        const plazaCircle = new THREE.Mesh(new THREE.CircleGeometry(12, 24), new THREE.MeshLambertMaterial({ color: 0xa8a29e }));
        plazaCircle.rotation.x = -Math.PI / 2;
        plazaCircle.position.set(0, 0.02, 0);
        plazaCircle.receiveShadow = true;
        this.scene.add(plazaCircle);

        this.buildPond();
        this.buildFoliage();
        this.buildStreetLamps();
        this.buildTeaGarden();
    }

    buildPond() {
        const rimMat = new THREE.MeshLambertMaterial({ color: 0x78716c });
        const waterMat = new THREE.MeshLambertMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 });

        const pondRim = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.4, 0.4, 16), rimMat);
        pondRim.position.set(0, 0.2, 0);
        pondRim.castShadow = true;
        this.scene.add(pondRim);

        const water = new THREE.Mesh(new THREE.CylinderGeometry(3.9, 3.9, 0.35, 16), waterMat);
        water.position.set(0, 0.22, 0);
        this.scene.add(water);

        const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 1.2, 8), rimMat);
        spout.position.set(0, 0.8, 0);
        this.scene.add(spout);

        const statue = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.8, 6), new THREE.MeshLambertMaterial({ color: 0xfbbf24 }));
        statue.position.set(0, 1.6, 0);
        this.scene.add(statue);
    }

    buildFoliage() {
        const trunkMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
        const leavesMat = new THREE.MeshLambertMaterial({ color: 0x15803d });

        const treeCoords = [
            [-18, 14], [-24, -16], [22, 18], [26, -20],
            [-12, -28], [14, -28], [-32, 4], [34, 6]
        ];

        treeCoords.forEach(([x, z]) => {
            const tree = new THREE.Group();
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 2.5, 6), trunkMat);
            trunk.position.y = 1.25;
            trunk.castShadow = true;
            tree.add(trunk);

            const foliage = new THREE.Mesh(new THREE.ConeGeometry(2.2, 4.5, 7), leavesMat);
            foliage.position.y = 4.2;
            foliage.castShadow = true;
            tree.add(foliage);

            tree.position.set(x, 0, z);
            this.scene.add(tree);
        });
    }

    buildStreetLamps() {
        const lampCoords = [
            [-4.5, 8], [4.5, 8], [-4.5, -8], [4.5, -8],
            [-15, 4.5], [15, 4.5], [-15, -4.5], [15, -4.5]
        ];

        const poleMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
        const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

        lampCoords.forEach(([x, z]) => {
            const lampGroup = new THREE.Group();
            lampGroup.position.set(x, 0, z);

            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4.2, 6), poleMat);
            pole.position.y = 2.1;
            lampGroup.add(pole);

            const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), bulbMat);
            bulb.position.y = 4.2;
            lampGroup.add(bulb);

            const pLight = new THREE.PointLight(0xfef08a, 0, 15);
            pLight.position.y = 4.2;
            lampGroup.add(pLight);

            this.scene.add(lampGroup);
            this.streetLamps.push(pLight);
        });
    }

    buildTeaGarden() {
        // Turkish Village Tea Garden (Kuşçu Kahvehanesi Çardağı)
        const woodMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
        const garden = new THREE.Group();
        garden.position.set(16, 0, 16);

        // Canopy Posts & Fabric
        for (let x = -3; x <= 3; x += 6) {
            for (let z = -3; z <= 3; z += 6) {
                const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 6), woodMat);
                post.position.set(x, 1.6, z);
                garden.add(post);
            }
        }
        const roof = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.1, 6.6), new THREE.MeshLambertMaterial({ color: 0xb91c1c }));
        roof.position.set(0, 3.2, 0);
        garden.add(roof);

        // Semaver Table
        const table = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.8, 12), woodMat);
        table.position.set(0, 0.4, 0);
        garden.add(table);

        const semaver = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.7, 8), new THREE.MeshLambertMaterial({ color: 0x94a3b8 }));
        semaver.position.set(0, 1.15, 0);
        garden.add(semaver);

        this.scene.add(garden);
    }

    initDefaultBuildings() {
        this.constructBuilding('MAIN_LOFT', 0, -14, 'Ana Kuşçu Kümesi');
        this.constructBuilding('AUCTION_HALL', -22, 0, 'Kuşçu Mezat Salonu');
        this.constructBuilding('FEED_MILL', 22, 0, 'Yem Değirmeni & Silo');
        this.constructBuilding('VET_CLINIC', -16, 22, 'Veteriner & Vitamin Ocağı');
    }

    constructBuilding(type, x, z, name) {
        const bGroup = new THREE.Group();
        bGroup.position.set(x, 0, z);

        if (type === 'MAIN_LOFT') {
            this.buildLoftStructure(bGroup);
        } else if (type === 'AUCTION_HALL') {
            this.buildAuctionHallStructure(bGroup);
        } else if (type === 'FEED_MILL') {
            this.buildFeedMillStructure(bGroup);
        } else if (type === 'VET_CLINIC') {
            this.buildVetClinicStructure(bGroup);
        }

        this.scene.add(bGroup);
        this.buildings.push({ type, name, x, z, group: bGroup });
        return bGroup;
    }

    buildAuctionHallStructure(group) {
        const wallMat = new THREE.MeshLambertMaterial({ color: 0x991b1b });
        const roofMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
        const signMat = new THREE.MeshLambertMaterial({ color: 0xfef08a });

        const hall = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 8), wallMat);
        hall.position.set(0, 2.5, 0);
        hall.castShadow = true;
        hall.receiveShadow = true;
        group.add(hall);

        const roof = new THREE.Mesh(new THREE.ConeGeometry(7.5, 2.4, 4), roofMat);
        roof.rotation.y = Math.PI / 4;
        roof.scale.set(1.2, 1, 0.9);
        roof.position.set(0, 6.2, 0);
        roof.castShadow = true;
        group.add(roof);

        const sign = new THREE.Mesh(new THREE.BoxGeometry(6, 1.2, 0.2), signMat);
        sign.position.set(0, 4.2, 4.1);
        group.add(sign);

        const awning = new THREE.Mesh(new THREE.BoxGeometry(4, 0.2, 2.2), new THREE.MeshLambertMaterial({ color: 0xf59e0b }));
        awning.position.set(0, 2.8, 4.8);
        group.add(awning);
    }

    buildFeedMillStructure(group) {
        const stoneMat = new THREE.MeshLambertMaterial({ color: 0xd6d3d1 });
        const woodMat = new THREE.MeshLambertMaterial({ color: 0x78350f });

        const silo = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.6, 9, 12), stoneMat);
        silo.position.set(0, 4.5, 0);
        silo.castShadow = true;
        silo.receiveShadow = true;
        group.add(silo);

        const dome = new THREE.Mesh(new THREE.SphereGeometry(3.2, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), woodMat);
        dome.position.set(0, 9.0, 0);
        group.add(dome);

        this.windmillBlades = new THREE.Group();
        this.windmillBlades.position.set(0, 7.5, 3.3);

        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.4, 8), woodMat);
        hub.rotation.x = Math.PI / 2;
        this.windmillBlades.add(hub);

        const bladeGeo = new THREE.BoxGeometry(0.4, 5.5, 0.05);
        for (let b = 0; b < 4; b++) {
            const blade = new THREE.Mesh(bladeGeo, new THREE.MeshLambertMaterial({ color: 0xfef3c7 }));
            blade.rotation.z = (b * Math.PI) / 2;
            blade.position.set(Math.sin((b * Math.PI) / 2) * 2.8, Math.cos((b * Math.PI) / 2) * 2.8, 0);
            blade.castShadow = true;
            this.windmillBlades.add(blade);
        }
        group.add(this.windmillBlades);
    }

    buildVetClinicStructure(group) {
        const clinicMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
        const roofMat = new THREE.MeshLambertMaterial({ color: 0x0284c7 });

        const clinic = new THREE.Mesh(new THREE.BoxGeometry(7, 4, 6), clinicMat);
        clinic.position.set(0, 2.0, 0);
        clinic.castShadow = true;
        group.add(clinic);

        const roof = new THREE.Mesh(new THREE.ConeGeometry(5.2, 1.8, 4), roofMat);
        roof.rotation.y = Math.PI / 4;
        roof.position.set(0, 4.8, 0);
        group.add(roof);

        const crossH = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 0.1), new THREE.MeshLambertMaterial({ color: 0x10b981 }));
        crossH.position.set(0, 3.2, 3.06);
        group.add(crossH);
        const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.6, 0.1), new THREE.MeshLambertMaterial({ color: 0x10b981 }));
        crossV.position.set(0, 3.2, 3.06);
        group.add(crossV);
    }

    buildLoftStructure(group) {
        const woodMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
        const roofMat = new THREE.MeshLambertMaterial({ color: 0x047857 });

        const shed = new THREE.Mesh(new THREE.BoxGeometry(8, 4.5, 6), woodMat);
        shed.position.set(0, 2.25, 0);
        shed.castShadow = true;
        group.add(shed);

        const roof = new THREE.Mesh(new THREE.ConeGeometry(6, 2.2, 4), roofMat);
        roof.rotation.y = Math.PI / 4;
        roof.scale.set(1.2, 1, 0.9);
        roof.position.set(0, 5.4, 0);
        group.add(roof);
    }

    setNightLighting(isNight) {
        const intensity = isNight ? 1.4 : 0;
        this.streetLamps.forEach(lamp => {
            lamp.intensity = intensity;
        });
    }

    update(delta) {
        if (this.windmillBlades) {
            this.windmillBlades.rotation.z += delta * 1.5;
        }
    }
}

window.VillageManager = VillageManager;
