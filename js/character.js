// 3D Player Character (Kuşçu) & Village Walking Controller

class CharacterController {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.position = new THREE.Vector3(0, 0, 4);
        this.velocity = new THREE.Vector3();
        this.speed = 7.0;
        this.rotationY = 0;
        this.walkPhase = 0;
        this.isMoving = false;

        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            shift: false
        };

        this.joystickInput = new THREE.Vector2(0, 0);
        this.joystickSprint = false;

        this.mesh = this.createCharacterMesh();
        this.scene.add(this.mesh);

        this.initInput();
    }

    setMobileJoystickInput(jx, jy, sprint = false) {
        this.joystickInput.set(jx, jy);
        this.joystickSprint = sprint;
    }

    createCharacterMesh() {
        const group = new THREE.Group();

        const skinMat = new THREE.MeshLambertMaterial({ color: 0xfbcfe8 });
        const vestMat = new THREE.MeshLambertMaterial({ color: 0x334155 }); // Dark vest
        const shirtMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc }); // White shirt
        const pantsMat = new THREE.MeshLambertMaterial({ color: 0x475569 }); // Slate pants
        const shoeMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
        const capMat = new THREE.MeshLambertMaterial({ color: 0x64748b }); // Flat cap

        // Torso / Body
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.4), vestMat);
        torso.position.y = 1.35;
        torso.castShadow = true;
        group.add(torso);

        // Shirt Collar
        const collar = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.42), shirtMat);
        collar.position.set(0, 1.75, 0);
        group.add(collar);

        // Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), skinMat);
        head.position.set(0, 2.05, 0);
        head.castShadow = true;
        group.add(head);

        // Turkish Flat Cap (Kuşçu Kasketi)
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.12, 12), capMat);
        cap.position.set(0, 2.22, -0.02);
        group.add(cap);
        const brim = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.18), capMat);
        brim.position.set(0, 2.18, 0.22);
        group.add(brim);

        // Left Leg
        this.leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.85, 0.25), pantsMat);
        this.leftLeg.position.set(0.18, 0.5, 0);
        this.leftLeg.castShadow = true;
        group.add(this.leftLeg);

        // Right Leg
        this.rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.85, 0.25), pantsMat);
        this.rightLeg.position.set(-0.18, 0.5, 0);
        this.rightLeg.castShadow = true;
        group.add(this.rightLeg);

        // Left Arm
        this.leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.8, 0.2), vestMat);
        this.leftArm.position.set(0.48, 1.35, 0);
        this.leftArm.castShadow = true;
        group.add(this.leftArm);

        // Right Arm
        this.rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.8, 0.2), vestMat);
        this.rightArm.position.set(-0.48, 1.35, 0);
        this.rightArm.castShadow = true;
        group.add(this.rightArm);

        group.scale.set(1.2, 1.2, 1.2);
        return group;
    }

    initInput() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyW' || e.code === 'ArrowUp') this.keys.forward = true;
            if (e.code === 'KeyS' || e.code === 'ArrowDown') this.keys.backward = true;
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = true;
            if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = true;
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.keys.shift = true;
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'KeyW' || e.code === 'ArrowUp') this.keys.forward = false;
            if (e.code === 'KeyS' || e.code === 'ArrowDown') this.keys.backward = false;
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = false;
            if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = false;
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.keys.shift = false;
        });
    }

    update(delta, activeMode) {
        if (activeMode !== 'WALK') {
            this.mesh.position.copy(this.position);
            return;
        }

        const moveDir = new THREE.Vector3();
        if (this.keys.forward) moveDir.z -= 1;
        if (this.keys.backward) moveDir.z += 1;
        if (this.keys.left) moveDir.x -= 1;
        if (this.keys.right) moveDir.x += 1;

        // Apply analog mobile joystick input
        if (this.joystickInput && (Math.abs(this.joystickInput.x) > 0.05 || Math.abs(this.joystickInput.y) > 0.05)) {
            moveDir.x = this.joystickInput.x;
            moveDir.z = this.joystickInput.y;
        }

        const isSprinting = this.keys.shift || this.joystickSprint;
        this.isMoving = moveDir.lengthSq() > 0.01;

        if (this.isMoving) {
            if (moveDir.length() > 1.0) moveDir.normalize();
            const currentSpeed = isSprinting ? this.speed * 1.6 : this.speed;
            this.velocity.copy(moveDir).multiplyScalar(currentSpeed);
            this.position.addScaledVector(this.velocity, delta);

            // Clamp position within village boundary
            this.position.x = Math.max(-50, Math.min(50, this.position.x));
            this.position.z = Math.max(-50, Math.min(50, this.position.z));

            // Rotate towards movement
            const targetAngle = Math.atan2(moveDir.x, moveDir.z);
            this.rotationY = targetAngle;
            this.mesh.rotation.y = this.rotationY;

            // Leg and arm swing animation
            this.walkPhase += delta * (isSprinting ? 16 : 10);
            const swing = Math.sin(this.walkPhase) * 0.6;
            this.leftLeg.rotation.x = swing;
            this.rightLeg.rotation.x = -swing;
            this.leftArm.rotation.x = -swing * 0.8;
            this.rightArm.rotation.x = swing * 0.8;
        } else {
            this.leftLeg.rotation.x = 0;
            this.rightLeg.rotation.x = 0;
            this.leftArm.rotation.x = 0;
            this.rightArm.rotation.x = 0;
        }

        this.mesh.position.copy(this.position);
    }
}

window.CharacterController = CharacterController;
