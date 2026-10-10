document.addEventListener('DOMContentLoaded', () => {
    // Add passcode-active body class immediately to prevent any viewport scrollbars
    document.body.classList.add('passcode-active');

    // ==========================================
    // DOM Elements
    // ==========================================
    const screens = {
        passcode: document.getElementById('screen-passcode'),
        loading: document.getElementById('screen-loading'),
        transition: document.getElementById('screen-transition'),
        gifts: document.getElementById('screen-gifts'),
        main: document.getElementById('screen-main')
    };

    // Passcode Screen Elements
    const avatarContainer = document.getElementById('avatar-container');
    const magicFairy = document.getElementById('magic-fairy');
    const fairyDialog = document.getElementById('fairy-dialog');
    const pinDots = document.querySelectorAll('.pin-dot');
    const numBtns = document.querySelectorAll('.num-btn');
    const errorMessage = document.getElementById('error-message');
    const passcodeCard = document.querySelector('.passcode-card');

    // Loading Screen Elements
    const progressBarFill = document.getElementById('progress-bar-fill');
    const loadingStatus = document.getElementById('loading-status');
    const loadingPercentage = document.getElementById('loading-percentage');
    const reaperChaser = document.getElementById('reaper-chaser');
    const proceedBtn = document.getElementById('proceed-btn');
    const headphonePhase = document.getElementById('headphone-phase');
    const loadingPhase = document.getElementById('loading-phase');
    const readyBtn = document.getElementById('ready-btn');
    const bgMusic = document.getElementById('bg-music');
    const giftBoxWrappers = document.querySelectorAll('.gift-box-wrapper');
    const giftMessage1 = document.getElementById('gift-message-1');
    const giftMessage2 = document.getElementById('gift-message-2');
    const countdownText = document.getElementById('countdown-text');

    // Main Screen Elements
    const balloonsContainer = document.getElementById('balloons-container');
    const giftBtn = document.getElementById('gift-btn');
    const revealArea = document.getElementById('reveal-area');
    const letterTriggerContainer = document.getElementById('letter-trigger-container');
    const readLetterBtn = document.getElementById('read-letter-btn');
    const letterModal = document.getElementById('letter-modal');
    const closeLetterBtn = document.getElementById('close-letter-btn');
    const letterCard = document.querySelector('.letter-card');
    
    // Lightbox Modal Elements
    const imageModal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const modalCaption = document.getElementById('modal-caption');
    const closeModalBtn = document.getElementById('close-modal');

    let popperIntervalId = null;
    let activeBirthdayFairies = [];
    let fireworksSidesOnly = false;
    let fireworksAnimationFrameId;
    let fireworksActive = true;
    let fireworksSoundInterval = null;
    let currentFireworksVolume = 0.25;
    let fwSound1 = null;
    let fwSound2 = null;

    let audioFadeInterval = null;

    function lowerBackgroundAudioForModal() {
        if (audioFadeInterval) clearInterval(audioFadeInterval);
        
        const targetBgVol = 0.12;
        const targetFwVol = 0.04;
        const steps = 15;
        let stepCount = 0;
        
        const startBgVol = bgMusic ? bgMusic.volume : 0.85;
        const startFwVol = currentFireworksVolume;

        audioFadeInterval = setInterval(() => {
            stepCount++;
            const progress = stepCount / steps;

            if (bgMusic) {
                bgMusic.volume = Math.max(0, startBgVol + (targetBgVol - startBgVol) * progress);
            }
            currentFireworksVolume = Math.max(0, startFwVol + (targetFwVol - startFwVol) * progress);
            if (fwSound1) {
                try { fwSound1.volume = currentFireworksVolume; } catch(e) {}
            }

            if (stepCount >= steps) {
                clearInterval(audioFadeInterval);
                audioFadeInterval = null;
                if (bgMusic) bgMusic.volume = targetBgVol;
                currentFireworksVolume = targetFwVol;
            }
        }, 50); // 0.75s smooth gradual fade down
    }

    function restoreBackgroundAudioFromModal() {
        if (audioFadeInterval) clearInterval(audioFadeInterval);

        const targetBgVol = 0.85;
        const targetFwVol = 0.25;
        const steps = 15;
        let stepCount = 0;

        const startBgVol = bgMusic ? bgMusic.volume : 0.12;
        const startFwVol = currentFireworksVolume;

        audioFadeInterval = setInterval(() => {
            stepCount++;
            const progress = stepCount / steps;

            if (bgMusic) {
                bgMusic.volume = Math.min(0.85, startBgVol + (targetBgVol - startBgVol) * progress);
            }
            currentFireworksVolume = Math.min(0.25, startFwVol + (targetFwVol - startFwVol) * progress);
            if (fwSound1) {
                try { fwSound1.volume = currentFireworksVolume; } catch(e) {}
            }

            if (stepCount >= steps) {
                clearInterval(audioFadeInterval);
                audioFadeInterval = null;
                if (bgMusic) bgMusic.volume = targetBgVol;
                currentFireworksVolume = targetFwVol;
            }
        }, 50); // 0.75s smooth gradual fade back up
    }

    // ==========================================
    // Config, Mute State & Global Audio Helpers
    // ==========================================
    const CORRECT_PASSCODE = '2002';

    let isMuted = false;
    const activeAudios = [];
    if (bgMusic) activeAudios.push(bgMusic);

    function broadcastMuteStateToIframes(muted) {
        document.querySelectorAll('iframe').forEach(iframe => {
            if (iframe && iframe.contentWindow) {
                try {
                    iframe.contentWindow.postMessage({ type: 'SET_MUTE', muted: muted }, '*');
                } catch(e) {}
            }
        });
    }

    // Mute state listener
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            isMuted = !isMuted;
            const icon = muteBtn.querySelector('i');
            if (isMuted) {
                icon.className = 'fa-solid fa-volume-xmark';
                muteBtn.title = 'Unmute';
            } else {
                icon.className = 'fa-solid fa-volume-high';
                muteBtn.title = 'Mute';
            }
            activeAudios.forEach(audio => {
                audio.muted = isMuted;
            });

            // Broadcast mute state to all gift modal iframes
            broadcastMuteStateToIframes(isMuted);
        });
    }

    let isWishSequenceComplete = false;
    let toastTimeout = null;

    function showEarlyCloseToast(msg) {
        const toast = document.getElementById('early-close-toast');
        if (!toast) return;
        toast.innerText = msg;
        toast.classList.add('show');
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3500);
    }

    window.addEventListener('message', (e) => {
        if (e.data && e.data.type === 'WISH_SEQUENCE_STATE') {
            isWishSequenceComplete = !!e.data.complete;
        }
    });

    // Listen for iframe load events to pass current mute state immediately
    document.querySelectorAll('.garden-iframe').forEach(iframe => {
        iframe.addEventListener('load', () => {
            if (iframe.contentWindow) {
                try {
                    iframe.contentWindow.postMessage({ type: 'SET_MUTE', muted: isMuted }, '*');
                } catch(e) {}
            }
        });
    });

    // Helper to register and play a sound respecting the mute state
    function playSound(audioObj) {
        activeAudios.push(audioObj);
        audioObj.muted = isMuted;
        audioObj.play().catch(e => console.log("Audio play blocked:", e));
    }

    function playMagicChimeSound() {
        if (isMuted) return;
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
            notes.forEach((freq, idx) => {
                setTimeout(() => {
                    if (isMuted) return;
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, ctx.currentTime);
                    gain.gain.setValueAtTime(0.30, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + 1.2);
                }, idx * 120);
            });
        } catch(e) {}
    }

    // Loading messages matching the deadline chase theme
    const loadingMessages = [
        { progress: 0, text: 'Deadline is coming... 🏃‍♂️💀' },
        { progress: 25, text: 'It is right behind you! 😱' },
        { progress: 55, text: 'Run faster! It is gaining ground! 💻🔥' },
        { progress: 85, text: 'Oh no, it is almost here! ☠️' }
    ];

    // ==========================================
    // Screen Navigation
    // ==========================================
    function switchScreen(fromScreen, toScreen) {
        if (!fromScreen || !toScreen) return;
        // Fade out old screen
        fromScreen.classList.remove('active');
        fromScreen.style.opacity = '0';
        
        // Immediately make new screen display:flex and fade it in simultaneously
        toScreen.style.display = 'flex';
        toScreen.style.opacity = '1';
        // Force reflow
        toScreen.offsetHeight;
        toScreen.classList.add('active');

        // Toggle body classes for styling adaptation
        if (toScreen === screens.passcode) {
            document.body.classList.add('passcode-active');
            document.body.classList.remove('loading-active');
            document.body.classList.remove('light-theme');
        } else if (toScreen === screens.loading) {
            document.body.classList.remove('passcode-active');
            document.body.classList.add('loading-active');
            document.body.classList.remove('light-theme');
        } else if (toScreen === screens.transition) {
            document.body.classList.remove('passcode-active');
            document.body.classList.remove('loading-active');
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('passcode-active');
            document.body.classList.remove('loading-active');
            document.body.classList.remove('light-theme');
        }
        
        // Set display: none on the old screen after the transition finishes
        setTimeout(() => {
            fromScreen.style.display = 'none';
        }, 800);
    }

    // ==========================================
    // Passcode Logic & Flying Fairy Physics
    // ==========================================
    let fairy = {
        x: document.documentElement.clientWidth / 2,
        y: 100,
        vx: 6.5,
        vy: 5.5,
        targetX: Math.random() * (document.documentElement.clientWidth - 240) + 120,
        targetY: Math.random() * (document.documentElement.clientHeight - 240) + 120,
        isCaught: false,
        avoidMouse: true
    };

    let mouse = { x: 0, y: 0 };
    let flightInterval = null;
    let evasionTimerStarted = false;

    // Track mouse coordinates for evasion
    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    function updateFairyPosition() {
        if (fairy.isCaught) return;

        const w = document.documentElement.clientWidth;
        const h = document.documentElement.clientHeight;

        // Distance to target
        let dx = fairy.targetX - fairy.x;
        let dy = fairy.targetY - fairy.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        // If arrived at target, choose another random spot (well within viewport)
        if (dist < 40) {
            fairy.targetX = Math.random() * (w - 240) + 120;
            fairy.targetY = Math.random() * (h - 240) + 120;
        }

        // Evasive push from mouse pointer (only active for 5 seconds starting from first cursor contact)
        if (fairy.avoidMouse) {
            let mdx = fairy.x - mouse.x;
            let mdy = fairy.y - mouse.y;
            let mdist = Math.sqrt(mdx * mdx + mdy * mdy);

            if (mdist < 120) {
                // First cursor contact: trigger the 5-second evasion countdown
                if (!evasionTimerStarted) {
                    evasionTimerStarted = true;
                    startAvoidanceTimer();
                }

                // Push away direction (moderate evasive burst)
                let angle = Math.atan2(mdy, mdx);
                let pushForce = (120 - mdist) * 0.45;
                fairy.vx += Math.cos(angle) * pushForce;
                fairy.vy += Math.sin(angle) * pushForce;
            }
        }

        // Standard gravity pull to targets
        let targetAngle = Math.atan2(dy, dx);
        fairy.vx += Math.cos(targetAngle) * 0.35;
        fairy.vy += Math.sin(targetAngle) * 0.35;

        // Speed limit (friction and max cap)
        fairy.vx *= 0.94; 
        fairy.vy *= 0.94;
        let currentSpeed = Math.sqrt(fairy.vx * fairy.vx + fairy.vy * fairy.vy);
        const maxSpeed = 10.5; // zippy but catchable velocity cap
        if (currentSpeed > maxSpeed) {
            fairy.vx = (fairy.vx / currentSpeed) * maxSpeed;
            fairy.vy = (fairy.vy / currentSpeed) * maxSpeed;
        }

        // Apply movement
        fairy.x += fairy.vx;
        fairy.y += fairy.vy;

        // Bounce boundaries check with strict margins to keep fairy and bubble inside window
        const padLeft = 65;
        const padTop = 65;
        const padRight = w - 120; // safe margin from right side to avoid scrollbar triggers
        const padBottom = h - 65;

        if (fairy.x < padLeft) { fairy.x = padLeft; fairy.vx = Math.abs(fairy.vx); }
        if (fairy.x > padRight) { fairy.x = padRight; fairy.vx = -Math.abs(fairy.vx); }
        if (fairy.y < padTop) { fairy.y = padTop; fairy.vy = Math.abs(fairy.vy); }
        if (fairy.y > padBottom) { fairy.y = padBottom; fairy.vy = -Math.abs(fairy.vy); }

        // Render positions
        magicFairy.style.left = `${fairy.x}px`;
        magicFairy.style.top = `${fairy.y}px`;

        // Spawn colorful sand / pixie dust trail
        if (!fairy.isCaught && Math.random() < 0.65) {
            const spawnCount = Math.floor(Math.random() * 2) + 1;
            for (let i = 0; i < spawnCount; i++) {
                fairyDust.push(new FairyDustParticle(fairy.x, fairy.y, fairy.vx, fairy.vy));
            }
            if (!animationFrameId) {
                animateConfetti();
            }
        }
    }

    let avoidanceTimer = null;
    function startAvoidanceTimer() {
        if (avoidanceTimer) clearTimeout(avoidanceTimer);
        fairy.avoidMouse = true;
        avoidanceTimer = setTimeout(() => {
            fairy.avoidMouse = false;
        }, 10000); // 10 seconds of evasion
    }

    function startFairyFlight() {
        if (!flightInterval) {
            flightInterval = setInterval(updateFairyPosition, 25);
        }
    }

    function stopFairyFlight() {
        if (flightInterval) {
            clearInterval(flightInterval);
            flightInterval = null;
        }
        if (avoidanceTimer) {
            clearTimeout(avoidanceTimer);
            avoidanceTimer = null;
        }
        magicFairy.style.display = 'none';
    }

    // Capture/click listener for Fairy
    magicFairy.addEventListener('click', (e) => {
        e.stopPropagation();
        if (fairy.isCaught || jokeActive) return;

        fairy.isCaught = true;
        magicFairy.classList.add('caught');
        
        // Spawn small confetti burst on fairy spot
        fireConfetti(35, fairy.x, fairy.y);

        // Customize dialogue bubble text based on prank sequence
        const dialogSpan = fairyDialog.querySelector('span');
        if (catchCount === 0) {
            catchCount = 1;
            // Generate a random 4 digit code
            fakePasscode = Math.floor(1000 + Math.random() * 9000).toString();
            dialogSpan.innerHTML = `Ah! You caught me! 🌟 The passcode is <strong>${fakePasscode}</strong>! 🔑`;
        } else {
            if (hasBeenTricked) {
                dialogSpan.innerHTML = `Okay, okay! No more lies. 🌸 The real passcode is <strong>2002</strong>! 🤫🔑`;
            } else {
                dialogSpan.innerHTML = `Hey! I already gave you the code: <strong>${fakePasscode}</strong>! Go type it in! 😜`;
            }
        }

        // Resume flying after 5.5 seconds
        setTimeout(() => {
            if (jokeActive) return; // if joke is currently playing, keep it caught
            magicFairy.classList.remove('caught');
            const w = document.documentElement.clientWidth;
            const h = document.documentElement.clientHeight;
            fairy.vx = Math.random() * 8 - 4;
            fairy.vy = Math.random() * 8 - 4;
            fairy.targetX = Math.random() * (w - 240) + 120;
            fairy.targetY = Math.random() * (h - 240) + 120;
            fairy.isCaught = false;
            
            // Reset evasive trigger state (countdown will restart on next cursor contact)
            evasionTimerStarted = false;
            fairy.avoidMouse = true;
        }, 5500);
    });

    // Handle screen resize events
    window.addEventListener('resize', () => {
        const w = document.documentElement.clientWidth;
        const h = document.documentElement.clientHeight;
        if (fairy.x > w - 120) fairy.x = w - 120;
        if (fairy.y > h - 65) fairy.y = h - 65;
        if (fairy.targetX > w - 120) fairy.targetX = w - 120;
        if (fairy.targetY > h - 120) fairy.targetY = h - 120;
    });

    // Start flying on initialization
    startFairyFlight();

    let enteredPin = '';
    let catchCount = 0;
    let fakePasscode = '';
    let hasBeenTricked = false;
    let jokeActive = false; // block inputs/resets during prank speech

    // Function to update the dots display
    function updatePinDisplay() {
        pinDots.forEach((dot, index) => {
            if (index < enteredPin.length) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
            dot.classList.remove('error');
        });
    }

    // Function to handle keypad press
    function handleKeypadPress(val) {
        if (jokeActive) return; // ignore numpad clicks during prank speech
        if (val === 'clear') {
            enteredPin = '';
            errorMessage.classList.remove('show');
            updatePinDisplay();
        } else if (val === 'backspace') {
            enteredPin = enteredPin.slice(0, -1);
            errorMessage.classList.remove('show');
            updatePinDisplay();
        } else if (/^\d$/.test(val)) {
            if (enteredPin.length < 4) {
                enteredPin += val;
                updatePinDisplay();
                errorMessage.classList.remove('show');
                
                // If 4 digits entered, automatically check
                if (enteredPin.length === 4) {
                    setTimeout(checkPasscode, 300);
                }
            }
        }
    }

    // Shatter explosion effect for passcode screen elements (Soft Glass Shatter Theme)
    function shatterPasscodeScreen() {
        const elements = [];
        
        // Collect keypad buttons
        numBtns.forEach(btn => elements.push(btn));
        
        // Collect card elements
        const avatar = document.getElementById('avatar-container');
        const title = document.querySelector('.passcode-title');
        const subtitle = document.querySelector('.passcode-subtitle');
        const pinContainer = document.querySelector('.pin-container');
        
        if (avatar) elements.push(avatar);
        if (title) elements.push(title);
        if (subtitle) elements.push(subtitle);
        if (pinContainer) elements.push(pinContainer);
        
        // Dissolve each element with a very soft, elegant outward drift and scale-down
        elements.forEach((el) => {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 40 + 20; // very gentle, elegant drift (20px to 60px)
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            const spin = Math.random() * 24 - 12; // gentle rotation (-12 to 12 degrees)
            
            el.style.transition = 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.9s ease-out';
            el.style.transform = `translate(${x}px, ${y}px) rotate(${spin}deg) scale(0.92)`;
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
        });

        // Dissolve the glass container card background itself
        passcodeCard.style.transition = 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)';
        passcodeCard.style.opacity = '0';
        passcodeCard.style.transform = 'scale(0.93) translateY(-15px)';
        passcodeCard.style.boxShadow = 'none';
        passcodeCard.style.background = 'transparent';
        passcodeCard.style.borderColor = 'transparent';
        
        // Spawn glowing confetti fragments on canvas at center coordinates
        const cardRect = passcodeCard.getBoundingClientRect();
        const cardX = cardRect.left + cardRect.width / 2;
        const cardY = cardRect.top + cardRect.height / 2;
        
        fireConfetti(65, cardX, cardY);
    }

    // Unlock logic (ONLY 2002 and date variations allowed)
    const VALID_PASSCODES = ['2002', '2207', '22072002', '0722', '20020722'];
    function checkPasscode() {
        if (VALID_PASSCODES.includes(enteredPin) || enteredPin === CORRECT_PASSCODE) {
            errorMessage.classList.remove('show');
            
            // Shatter/scatter the passcode card components into pieces!
            shatterPasscodeScreen();
            
            // Wait for shatter animation to finish, then proceed to loading screen (Headphone phase & deadline chase)
            setTimeout(() => {
                document.body.classList.remove('passcode-active');
                stopFairyFlight();
                
                // Switch to loading screen (Headphone recommendation -> Deadline chase loading bar)
                switchScreen(screens.passcode, screens.loading);
            }, 850);
        } else if (fakePasscode && enteredPin === fakePasscode) {
            // Trigger the TRAP prank!
            hasBeenTricked = true;
            jokeActive = true;
            fairy.isCaught = true;
            
            // Immediately stop flight, spin it caught (leaves fairy in its current spot)
            if (flightInterval) clearInterval(flightInterval);
            flightInterval = null;
            if (avoidanceTimer) clearTimeout(avoidanceTimer);
            
            magicFairy.classList.add('caught');

            // Dialogue says they are trapped
            const dialogSpan = fairyDialog.querySelector('span');
            dialogSpan.innerHTML = `Haha! You fell for it! That was a trap! 😜<br>Catch me again for the real passcode! 🦋✨`;
            
            // Shake the card and flash red dots
            passcodeCard.classList.add('shake');
            pinDots.forEach(dot => dot.classList.add('error'));
            
            // Fire some small joke confetti
            fireConfetti(20, fairy.x, fairy.y);

            // Wait 6.5 seconds for them to read the joke bubble, then resume flying
            setTimeout(() => {
                enteredPin = '';
                updatePinDisplay();
                passcodeCard.classList.remove('shake');
                
                magicFairy.classList.remove('caught');
                jokeActive = false;
                
                const w = document.documentElement.clientWidth;
                const h = document.documentElement.clientHeight;
                fairy.vx = Math.random() * 8 - 4;
                fairy.vy = Math.random() * 8 - 4;
                fairy.targetX = Math.random() * (w - 240) + 120;
                fairy.targetY = Math.random() * (h - 240) + 120;
                fairy.isCaught = false;
                
                // Reset evasive trigger state (countdown will restart on next cursor contact)
                evasionTimerStarted = false;
                fairy.avoidMouse = true;
                
                // Restart flight
                startFairyFlight();
            }, 6500);
        } else {
            // Trigger shake, show error, flash red dots
            errorMessage.classList.add('show');
            passcodeCard.classList.add('shake');
            pinDots.forEach(dot => dot.classList.add('error'));
            
            // Clear input after a short delay
            setTimeout(() => {
                enteredPin = '';
                updatePinDisplay();
                passcodeCard.classList.remove('shake');
            }, 600);
        }
    }

    // Numpad button click listeners
    numBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.getAttribute('data-val');
            handleKeypadPress(val);
        });
    });

    // Support keyboard input for premium UX
    document.addEventListener('keydown', (e) => {
        if (jokeActive) return; // block inputs during prank speech
        // Only accept input if passcode screen is active
        if (screens.passcode.classList.contains('active')) {
            if (/^\d$/.test(e.key)) {
                handleKeypadPress(e.key);
            } else if (e.key === 'Backspace') {
                handleKeypadPress('backspace');
            } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
                handleKeypadPress('clear');
            }
        }
    });

    // Proceed button click listener (Loading Screen -> Decorative Transition Screen)
    if (proceedBtn) {
        proceedBtn.addEventListener('click', () => {
            // Switch from loading to transition screen
            switchScreen(screens.loading, screens.transition);
        
        // Play birthday-song.mp3 and birthday-song-02.mp3 in an alternating endless playlist
        if (bgMusic) {
            bgMusic.pause();
            const playlist = [
                'assets/sound/birthday-song.mp3',
                'assets/sound/birthday-song-02.mp3'
            ];
            let currentTrackIdx = 0;

            function playNextTrack() {
                bgMusic.src = playlist[currentTrackIdx];
                bgMusic.loop = false;
                bgMusic.muted = isMuted;
                bgMusic.play().catch(err => console.log("Track play failed:", err));
            }

            bgMusic.onended = () => {
                currentTrackIdx = (currentTrackIdx + 1) % playlist.length;
                playNextTrack();
                bgMusic.volume = isMuted ? 0 : 0.85;
            };

            bgMusic.volume = 0;
            playNextTrack();

            let vol = 0;
            const fadeInterval = setInterval(() => {
                vol += 0.05;
                if (vol >= 0.85) {
                    if (!isMuted) bgMusic.volume = 0.85;
                    clearInterval(fadeInterval);
                } else {
                    if (!isMuted) bgMusic.volume = vol;
                }
            }, 100);
        }

        // Trigger the one-by-one decorations entry animation
        animateDecorations();
    });
    }

    // Helper to fire directional confetti bursts from card poppers
    function popConfettiFromPopper(isLeft) {
        resizeCanvas();
        // Configure origin offsets (Right side is 95px from screen edge and 1cm lower to match nozzle)
        const topRatio = isLeft ? 0.35 : 0.39;
        const startY = window.innerHeight * topRatio + 100;
        // Position X: Left is 110px, Right is 95px (closer to screen edge to follow right-popper decoration)
        const startX = isLeft ? 110 : window.innerWidth - 95;
        
        // Left shoots up/right (-Math.PI/6), Right shoots up/left (-Math.PI * 5/6)
        const angleBase = isLeft ? -Math.PI / 6 : -Math.PI * 5 / 6;
        
        for (let i = 0; i < 45; i++) {
            confetti.push(new ConfettiParticle(startX, startY, angleBase));
        }
        
        if (!animationFrameId) {
            animateConfetti();
        }
    }

    // Helper to animate birthday decorations moving in one-by-one
    function animateDecorations() {
        // Ordered array of elements to animate in
        const decorItems = [
            document.querySelector('.decor-bunting'),
            document.querySelector('.decor-title'),
            document.querySelector('.decor-frame-left'),
            document.querySelector('.decor-profile-box'),
            document.querySelector('.decor-frame-right'),
            document.querySelector('.decor-message'),
            document.querySelector('.decor-cake-left'),
            document.querySelector('.decor-cake-right'),
            document.querySelector('.decor-popper-left'),
            document.querySelector('.decor-popper-right'),
            document.querySelector('.decor-gifts'),
            document.querySelector('.decor-stars')
        ];

        // Ensure all items are initialized as hidden (remove visible class)
        decorItems.forEach(item => {
            if (item) item.classList.remove('visible');
        });

        // Staggered pop-in sequence (350ms delay between each item)
        decorItems.forEach((item, index) => {
            if (item) {
                setTimeout(() => {
                    item.classList.add('visible');
                    
                    // If it is a popper, blow out confetti!
                    if (item.classList.contains('decor-popper-left')) {
                        popConfettiFromPopper(true);
                    } else if (item.classList.contains('decor-popper-right')) {
                        popConfettiFromPopper(false);
                    }
                }, index * 350);
            }
        });

        // Set up periodic confetti popping from left and right poppers
        setTimeout(() => {
            if (popperIntervalId) clearInterval(popperIntervalId);
            popperIntervalId = setInterval(() => {
                popConfettiFromPopper(true);
                // Slight stagger for a natural dual popping look
                setTimeout(() => {
                    popConfettiFromPopper(false);
                }, 350);
            }, 4000); // every 4 seconds
        }, decorItems.length * 350 + 500);

        // Trigger fireworks animation once all elements have arrived (4.2 seconds)
        setTimeout(() => {
            startFireworks();
        }, decorItems.length * 350 + 350);
    }

    // ==========================================
    // Fireworks Particle System (Cream Theme)
    // ==========================================
    function startFireworks() {
        const canvas = document.getElementById('fireworks-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        fireworksActive = true;

        // Play fireworks-01 to fireworks-04 sequentially, each sound track plays 3s after the other, repeated forever
        const fwSounds = [
            'assets/sound/fireworks-01.mp3',
            'assets/sound/fireworks-02.mp3',
            'assets/sound/fireworks-03.mp3',
            'assets/sound/fireworks-04.mp3'
        ];
        let currentFwIndex = 0;

        function playNextFireworkSound() {
            if (!fireworksActive) return;
            const path = fwSounds[currentFwIndex];
            const audio = new Audio(path);
            audio.volume = currentFireworksVolume;
            
            // Store reference so we can stop it if needed
            fwSound1 = audio;
            
            playSound(audio);
            
            currentFwIndex = (currentFwIndex + 1) % fwSounds.length;
        }

        // Trigger first firework sound immediately
        playNextFireworkSound();
        
        // Loop firework sounds every 3 seconds
        fireworksSoundInterval = setInterval(playNextFireworkSound, 3000);
        
        // Match canvas dimensions to viewport
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        const rockets = [];
        const particles = [];
        
        // Colors from birthday theme (pink, gold, purple, coral, blue)
        const colors = [
            'rgba(255, 117, 140, ', // Accent pink
            'rgba(255, 208, 166, ', // Accent gold
            'rgba(91, 77, 130, ',   // Purple indigo
            'rgba(246, 137, 126, ',  // Coral peach
            'rgba(164, 205, 231, '   // Sky blue
        ];
        
        class Rocket {
            constructor() {
                // Constrain launching to left and right 25% if sides-only mode is active (leaving middle 50% clean)
                if (fireworksSidesOnly) {
                    const sideWidth = canvas.width * 0.25;
                    if (Math.random() < 0.5) {
                        this.x = Math.random() * (sideWidth - 60) + 30; // Left 25%
                    } else {
                        this.x = canvas.width - (Math.random() * (sideWidth - 60) + 30); // Right 25%
                    }
                } else {
                    this.x = Math.random() * (canvas.width - 200) + 100;
                }
                this.y = canvas.height;

                // Target height (explodes in upper 20% to 60% of screen height)
                const wander = (Math.random() - 0.5) * 80;
                if (fireworksSidesOnly) {
                    // Prevent target coordinate tx from drifting into the middle 50%
                    if (this.x < canvas.width * 0.5) {
                        this.tx = Math.min(canvas.width * 0.28, Math.max(15, this.x + wander));
                    } else {
                        this.tx = Math.max(canvas.width * 0.72, Math.min(canvas.width - 15, this.x + wander));
                    }
                } else {
                    this.tx = this.x + wander;
                }
                this.ty = Math.random() * (canvas.height * 0.40) + (canvas.height * 0.15);
                
                // Flight velocity
                const dx = this.tx - this.x;
                const dy = this.ty - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const steps = Math.random() * 20 + 35; // flight duration
                
                this.vx = dx / steps;
                this.vy = dy / steps;
                
                this.color = colors[Math.floor(Math.random() * colors.length)] + '0.95)';
                this.size = Math.random() * 2.5 + 2.5;
                this.exploded = false;
            }
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                
                // If rocket reaches target height or velocity is positive
                if (this.vy >= 0 || this.y <= this.ty) {
                    this.explode();
                    this.exploded = true;
                }
            }
            
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
            
            explode() {
                // Spark particle count - increased for a much richer, dense display!
                const count = Math.floor(Math.random() * 60) + 100;
                const baseColor = colors[Math.floor(Math.random() * colors.length)];
                
                for (let i = 0; i < count; i++) {
                    particles.push(new Particle(this.x, this.y, baseColor));
                }
            }
        }
        
        class Particle {
            constructor(x, y, colorStr) {
                this.x = x;
                this.y = y;
                
                // Radial velocity distribution
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 7 + 2.5;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed;
                
                this.colorStr = colorStr;
                this.alpha = 1.0;
                this.decay = Math.random() * 0.012 + 0.012; // slightly slower decay for longer trails
                this.gravity = 0.08;
                this.friction = 0.955;
                this.size = Math.random() * 2.5 + 1.5;
            }
            
            update() {
                this.vx *= this.friction;
                this.vy *= this.friction;
                this.vy += this.gravity;
                this.x += this.vx;
                this.y += this.vy;
                this.alpha -= this.decay;
            }
            
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.colorStr + this.alpha + ')';
                ctx.fill();
            }
        }
        
        // Main loop
        let frameCount = 0;
        function loop() {
            frameCount++;
            
            // Fading trail clear logic using transparent clear (since canvas is z-indexed on top of everything)
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'source-over';
            
            // Launch rockets much more frequently (every 15 frames instead of 45)
            if (frameCount % 15 === 0) {
                rockets.push(new Rocket());
            }
            // Frequently launch secondary extra rocket
            if (frameCount % 35 === 0 && Math.random() > 0.3) {
                rockets.push(new Rocket());
            }
            
            // Update & Draw Rockets
            for (let i = rockets.length - 1; i >= 0; i--) {
                const r = rockets[i];
                r.update();
                if (!r.exploded) {
                    r.draw();
                } else {
                    rockets.splice(i, 1);
                }
            }
            
            // Update & Draw Particles
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.update();
                if (p.alpha > 0) {
                    p.draw();
                } else {
                    particles.splice(i, 1);
                }
            }
            
            if (fireworksActive) {
                fireworksAnimationFrameId = requestAnimationFrame(loop);
            }
        }
        
        // Prime several fireworks immediately
        rockets.push(new Rocket());
        setTimeout(() => { rockets.push(new Rocket()); }, 300);
        setTimeout(() => { rockets.push(new Rocket()); }, 600);
        
        loop();

        // Spawn golden fairies 3 seconds after fireworks start
        setTimeout(() => {
            if (fireworksActive) {
                startBirthdayFairies();
                
                // Fade in the "Unwrap Your Gift 🎁" button 10 seconds after the 4 golden fairies fly in
                setTimeout(() => {
                    if (!fireworksActive) return;
                    const nextBtn = document.getElementById('transition-next-btn');
                    if (nextBtn) {
                        nextBtn.style.display = 'inline-flex';
                        nextBtn.offsetHeight;
                        nextBtn.style.opacity = '1';
                    }
                }, 10000); // 10 seconds after fairies fly in
            }
        }, 3000);

        // Click handler for next button to transition layout
        const nextBtn = document.getElementById('transition-next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                // Keep fireworks running on sides with louder audio volume
                fireworksSidesOnly = true;
                if (fwSound1) fwSound1.volume = 0.25;
                if (fwSound2) fwSound2.volume = 0.25;
                
                // Keep the periodic popper confetti loop running

                // Immediately fade out and hide the next button itself
                nextBtn.style.opacity = '0';
                setTimeout(() => {
                    nextBtn.style.display = 'none';
                }, 800);

                // Step 1: Shift greeting card text top (split-top) and scale down corner decorations
                setTimeout(() => {
                    const poppers = document.querySelectorAll('.decor-popper');
                    const stars = document.querySelector('.decor-stars');
                    const bottomGifts = document.querySelector('.decor-gifts');
                    const corners = document.querySelectorAll('.decor-corner-left, .decor-corner-right, .decor-cake-left, .decor-cake-right');
                    
                    // Keep poppers on screen but scale down
                    poppers.forEach(p => p.classList.add('shrunk'));
                    // Scale down corner decorations by 80%
                    corners.forEach(c => c.classList.add('shrunk'));

                    if (stars) stars.classList.add('fade-out');
                    if (bottomGifts) bottomGifts.classList.add('fade-out');

                    // KEEP 2 CAROUSELS VISIBLE (Do NOT add fade-out to .decor-frame)

                    const textGroup = document.querySelector('.decor-text-group');
                    if (textGroup) {
                        textGroup.classList.add('split-top');
                    }
                }, 1200);

                // Step 2: Reveal the 3 gift boxes and direct ALL 4 fairies to fly around the upper part of giftbox-frame
                setTimeout(() => {
                    const splitGifts = document.getElementById('gifts-split-container');
                    if (splitGifts) {
                        splitGifts.style.display = 'flex';
                        setTimeout(() => {
                            splitGifts.classList.add('show');
                        }, 50);
                    }

                    const openedGifts = new Set();
                    let grandFinalSequenceStarted = false;

                    function checkAllGiftsOpened() {
                        if (grandFinalSequenceStarted) return;
                        const openedBoxes = document.querySelectorAll('.gift-box-wrapper.opened');
                        if (openedBoxes.length >= 3 || openedGifts.size >= 3) {
                            grandFinalSequenceStarted = true;
                            setTimeout(triggerGrandFinalSequence, 800);
                        }
                    }

                    function triggerGrandFinalSequence() {
                        if (giftFairySpeakerInterval) clearInterval(giftFairySpeakerInterval);

                        // Fairies pause and hover naturally above gift box area
                        activeBirthdayFairies.forEach((f) => {
                            if (f && f.el) {
                                f.mode = 'pausing';
                                f.baseY = f.y;
                                const dialog = f.el.querySelector('.birthday-fairy-dialog');
                                if (dialog) dialog.classList.remove('show');
                            }
                        });

                        // Fairies speak farewell messages sequentially (one by one, no overlapping bubbles)
                        const finalMessages = [
                            "All gifts are delivered! ✨",
                            "Every wish has been granted! 💖",
                            "We'll miss you so much... 🌸",
                            "Goodbye! Stay magical! 💕"
                        ];

                        let fairyMsgIdx = 0;
                        function speakFairySequentially() {
                            activeBirthdayFairies.forEach(f => {
                                if (f && f.el) {
                                    const d = f.el.querySelector('.birthday-fairy-dialog');
                                    if (d) d.classList.remove('show');
                                }
                            });

                            if (fairyMsgIdx < activeBirthdayFairies.length) {
                                const currentFairy = activeBirthdayFairies[fairyMsgIdx];
                                if (currentFairy && currentFairy.el) {
                                    const dialog = currentFairy.el.querySelector('.birthday-fairy-dialog');
                                    const span = dialog ? dialog.querySelector('span') : null;
                                    if (span && dialog) {
                                        span.innerText = finalMessages[fairyMsgIdx % finalMessages.length];
                                        dialog.classList.add('show');
                                    }
                                }
                                fairyMsgIdx++;
                                setTimeout(speakFairySequentially, 2400);
                            } else {
                                startFairyAscend();
                            }
                        }

                        setTimeout(speakFairySequentially, 1000);

                        function startFairyAscend() {
                            activeBirthdayFairies.forEach((f) => {
                                if (f && f.el) {
                                    f.mode = 'ascended';
                                    const dialog = f.el.querySelector('.birthday-fairy-dialog');
                                    if (dialog) dialog.classList.remove('show');
                                }
                            });

                            // Thanos Snap Sand Disintegration Effect for giftbox-frame.png & gift elements
                            setTimeout(() => {
                                const giftsContainer = document.getElementById('gifts-split-container');
                                
                                // Step 1: Continuous Thanos Snap sand particle burst across giftbox-frame.png
                                if (giftsContainer) {
                                    const containerRect = giftsContainer.getBoundingClientRect();
                                    let snapInterval = setInterval(() => {
                                        for (let i = 0; i < 28; i++) {
                                            // Sweep from left to right simulating Thanos snap ash disintegration
                                            const rx = containerRect.left + Math.random() * containerRect.width;
                                            const ry = containerRect.top + Math.random() * containerRect.height;
                                            fairyDust.push(new ThanosSandParticle(rx, ry));
                                        }
                                        if (!animationFrameId) animateConfetti();
                                    }, 35);

                                    setTimeout(() => { clearInterval(snapInterval); }, 1400);
                                }

                                giftWrappers.forEach(box => {
                                    const rect = box.getBoundingClientRect();
                                    for (let i = 0; i < 15; i++) {
                                        fairyDust.push(new ThanosSandParticle(rect.left + Math.random() * rect.width, rect.top + Math.random() * rect.height));
                                    }
                                });

                                // Step 2: Thanos Sand Disintegration (Smooth in-place opacity fade to 0, no rightward movement)
                                if (giftsContainer) {
                                    giftsContainer.classList.remove('show');
                                    giftsContainer.style.transition = 'opacity 1.8s ease-out';
                                    giftsContainer.style.opacity = '0';
                                    giftsContainer.style.transform = 'translate(-50%, 0)';
                                    giftsContainer.style.filter = 'none';
                                }

                                giftWrappers.forEach((box) => {
                                    box.style.transition = 'opacity 1.8s ease-out';
                                    box.style.opacity = '0';
                                    box.style.pointerEvents = 'none';
                                });

                                // Step 3: Complete DOM removal of gift container & smoothly restore screen decorations to original positions & sizes
                                setTimeout(() => {
                                    if (giftsContainer) {
                                        giftsContainer.classList.remove('show');
                                        giftsContainer.style.setProperty('display', 'none', 'important');
                                        giftsContainer.style.opacity = '0';
                                        giftsContainer.style.visibility = 'hidden';
                                        giftsContainer.style.filter = 'none';
                                    }

                                    // Re-enable fireworks launching in the center area!
                                    fireworksSidesOnly = false;
                                    for (let r = 0; r < 6; r++) {
                                        setTimeout(() => {
                                            if (typeof Rocket !== 'undefined') {
                                                rockets.push(new Rocket());
                                            }
                                        }, r * 150);
                                    }

                                    // Smoothly restore all decorations (poppers, stars, bottom cake, corner photo cards, title text group)
                                    const poppers = document.querySelectorAll('.decor-popper');
                                    const stars = document.querySelector('.decor-stars');
                                    const bottomGifts = document.querySelector('.decor-gifts');
                                    const corners = document.querySelectorAll('.decor-corner-left, .decor-corner-right, .decor-cake-left, .decor-cake-right');
                                    const textGroup = document.querySelector('.decor-text-group');

                                    poppers.forEach(p => p.classList.remove('shrunk'));
                                    corners.forEach(c => c.classList.remove('shrunk'));
                                    if (stars) stars.classList.remove('fade-out');
                                    if (bottomGifts) bottomGifts.classList.remove('fade-out');
                                    if (textGroup) {
                                        textGroup.classList.remove('split-top');
                                        textGroup.style.transition = 'transform 1.6s cubic-bezier(0.25, 1, 0.3, 1)';
                                        textGroup.style.transform = 'translate3d(0, 0, 0) scale(1)';
                                    }

                                    // Trigger the 4 fairies to fly back into screen ONE BY ONE after 15 seconds off-screen
                                    setTimeout(reenterFairiesOneByOne, 15000);
                                }, 1500);
                            }, 800);
                        }

                        function reenterFairiesOneByOne() {
                            const reentryGreetingMessages = [
                                "It's me again! Glad to see you again! 🌸",
                                "We're back to celebrate with you! ✨",
                                "We couldn't stay away from the magic! 💖",
                                "Here we are once more! 💕"
                            ];

                            const bdayMessages = [
                                "Happy Birthday, Evelyn! 🎂✨",
                                "Wishing you endless joy & magic! 🌸💖",
                                "May all your dreams come true! 🌟💕",
                                "Have the most wonderful day! 🎉✨"
                            ];

                            const completionMessages = [
                                "It's all done now! You can leave whenever you like! 🌸",
                                "All gifts & surprises have been delivered! ✨",
                                "Our celebration is complete! Nothing left to expect! 💖",
                                "Hope you loved your birthday surprise! 💕"
                            ];

                            const centerX = window.innerWidth / 2;
                            const centerY = window.innerHeight / 2;

                            activeBirthdayFairies.forEach((f, idx) => {
                                if (!f || !f.el) return;

                                setTimeout(() => {
                                    // Position fairy off-screen initially on a random edge
                                    const side = idx % 4; // 0: Top, 1: Right, 2: Bottom, 3: Left
                                    if (side === 0) {
                                        f.x = centerX + (Math.random() - 0.5) * 400;
                                        f.y = -100;
                                    } else if (side === 1) {
                                        f.x = window.innerWidth + 100;
                                        f.y = centerY + (Math.random() - 0.5) * 250;
                                    } else if (side === 2) {
                                        f.x = centerX + (Math.random() - 0.5) * 400;
                                        f.y = window.innerHeight + 100;
                                    } else {
                                        f.x = -100;
                                        f.y = centerY + (Math.random() - 0.5) * 250;
                                    }

                                    // Target landing spot in the main central area (orbiting around center)
                                    f.targetX = centerX + (Math.random() - 0.5) * 550;
                                    f.targetY = centerY + (Math.random() - 0.5) * 380;

                                    f.mode = 'reentering';
                                    f.settledOnGifts = false;

                                    // Step 1 Speech: "It's me again! Glad to see you again!"
                                    f.el.style.opacity = '1';
                                    const dialog = f.el.querySelector('.birthday-fairy-dialog');
                                    const span = dialog ? dialog.querySelector('span') : null;

                                    if (dialog && span) {
                                        span.innerText = reentryGreetingMessages[idx % reentryGreetingMessages.length];
                                        setTimeout(() => {
                                            dialog.classList.add('show');
                                        }, 600);

                                        // Step 2 Speech: After 3.2s, transition to Happy Birthday message
                                        setTimeout(() => {
                                            dialog.classList.remove('show');
                                            setTimeout(() => {
                                                span.innerText = bdayMessages[idx % bdayMessages.length];
                                                dialog.classList.add('show');

                                                // After 3.8s, hide bubble and switch fairy to normal flight orbiting center
                                                setTimeout(() => {
                                                    dialog.classList.remove('show');
                                                    f.mode = 'normal';
                                                }, 3800);
                                            }, 400);
                                        }, 3200);
                                    }
                                }, idx * 1800); // 1.8s slow, calm staggered entry between each fairy
                            });

                            // Step 3: Once all 4 fairies have re-entered, start continuous speech loop with higher frequency completion reminders and longer reading duration (5.2s)
                            setTimeout(() => {
                                if (giftFairySpeakerInterval) clearInterval(giftFairySpeakerInterval);
                                let speechTurn = 0;

                                // Weighted list: Completion reminders pop up much more frequently (2:1 ratio) with longer display time (5.2s)
                                const alternatingLoopMessages = [
                                    "It's all done now! You can leave whenever you like! 🌸",
                                    "All gifts & surprises have been delivered! ✨",
                                    "Happy Birthday, Evelyn! 🎂✨",
                                    "Our celebration is complete! Nothing left to expect! 💖",
                                    "Hope you loved your birthday surprise! Feel free to close the tab anytime! 💕",
                                    "Wishing you endless joy & magic! 🌸💖",
                                    "Everything has been opened! You may leave now! 🌟",
                                    "All wishes granted! Have a wonderful day ahead! 💕",
                                    "May all your dreams come true! 🌟💕"
                                ];

                                giftFairySpeakerInterval = setInterval(() => {
                                    if (!activeBirthdayFairies || activeBirthdayFairies.length === 0) return;
                                    activeBirthdayFairies.forEach(f => {
                                        if (f && f.el) {
                                            const d = f.el.querySelector('.birthday-fairy-dialog');
                                            if (d) d.classList.remove('show');
                                        }
                                    });
                                    const speaker = activeBirthdayFairies[speechTurn % activeBirthdayFairies.length];
                                    if (speaker && speaker.el) {
                                        const dialog = speaker.el.querySelector('.birthday-fairy-dialog');
                                        const span = dialog ? dialog.querySelector('span') : null;
                                        if (span && dialog) {
                                            span.innerText = alternatingLoopMessages[speechTurn % alternatingLoopMessages.length];
                                            dialog.classList.add('show');
                                        }
                                    }
                                    speechTurn++;
                                }, 5200); // 5.2 seconds reading duration
                            }, 4 * 1800 + 4000);
                        }
                    }

                    // Attach click handlers for smooth PNG open animation on gift boxes
                    const giftWrappers = document.querySelectorAll('.gift-box-wrapper');
                    giftWrappers.forEach(box => {
                        box.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const boxNum = box.getAttribute('data-box');
                            if (boxNum) openedGifts.add(boxNum);

                            if (box.classList.contains('opened')) return;
                            box.classList.add('opened');
                            
                            // Play delicate magic chime sound
                            playMagicChimeSound();
                            
                            // Fire celebratory confetti burst
                            const rect = box.getBoundingClientRect();
                            fireConfetti(100, rect.left + rect.width / 2, rect.top + rect.height / 2);

                            // Open Gift Modals!
                            if (boxNum === '1') {
                                setTimeout(() => {
                                    const gardenModal = document.getElementById('garden-modal');
                                    if (gardenModal) {
                                        lowerBackgroundAudioForModal();
                                        gardenModal.style.display = 'flex';
                                        const iframe = gardenModal.querySelector('iframe');
                                        if (iframe) iframe.src = iframe.getAttribute('data-src');
                                        setTimeout(() => { gardenModal.classList.add('show'); }, 50);
                                    }
                                }, 600);
                            } else if (boxNum === '2') {
                                setTimeout(() => {
                                    const cloverModal = document.getElementById('clover-modal');
                                    if (cloverModal) {
                                        lowerBackgroundAudioForModal();
                                        cloverModal.style.display = 'flex';
                                        const iframe = cloverModal.querySelector('iframe');
                                        if (iframe) iframe.src = iframe.getAttribute('data-src');
                                        setTimeout(() => { cloverModal.classList.add('show'); }, 50);
                                    }
                                }, 600);
                            } else if (boxNum === '3') {
                                isWishSequenceComplete = false;
                                setTimeout(() => {
                                    const wishModal = document.getElementById('wish-modal');
                                    if (wishModal) {
                                        lowerBackgroundAudioForModal();
                                        wishModal.style.display = 'flex';
                                        const iframe = wishModal.querySelector('iframe');
                                        if (iframe) iframe.src = iframe.getAttribute('data-src');
                                        setTimeout(() => { wishModal.classList.add('show'); }, 50);
                                    }
                                }, 600);
                            }
                        });
                    });

                    // Garden Modal Close Handler
                    const closeGardenBtn = document.getElementById('close-garden-modal');
                    const gardenModal = document.getElementById('garden-modal');
                    if (closeGardenBtn && gardenModal) {
                        closeGardenBtn.addEventListener('click', () => {
                            restoreBackgroundAudioFromModal();
                            gardenModal.classList.remove('show');
                            const iframe = gardenModal.querySelector('iframe');
                            if (iframe) iframe.src = 'about:blank';
                            setTimeout(() => { 
                                gardenModal.style.display = 'none'; 
                                checkAllGiftsOpened();
                            }, 500);
                        });
                        gardenModal.addEventListener('click', (e) => {
                            if (e.target === gardenModal) {
                                restoreBackgroundAudioFromModal();
                                gardenModal.classList.remove('show');
                                const iframe = gardenModal.querySelector('iframe');
                                if (iframe) iframe.src = 'about:blank';
                                setTimeout(() => { 
                                    gardenModal.style.display = 'none'; 
                                    checkAllGiftsOpened();
                                }, 500);
                            }
                        });
                    }

                    // Clover Modal Close Handler
                    const closeCloverBtn = document.getElementById('close-clover-modal');
                    const cloverModal = document.getElementById('clover-modal');
                    if (closeCloverBtn && cloverModal) {
                        closeCloverBtn.addEventListener('click', () => {
                            restoreBackgroundAudioFromModal();
                            cloverModal.classList.remove('show');
                            const iframe = cloverModal.querySelector('iframe');
                            if (iframe) iframe.src = 'about:blank';
                            setTimeout(() => { 
                                cloverModal.style.display = 'none'; 
                                checkAllGiftsOpened();
                            }, 500);
                        });
                        cloverModal.addEventListener('click', (e) => {
                            if (e.target === cloverModal) {
                                restoreBackgroundAudioFromModal();
                                cloverModal.classList.remove('show');
                                const iframe = cloverModal.querySelector('iframe');
                                if (iframe) iframe.src = 'about:blank';
                                setTimeout(() => { 
                                    cloverModal.style.display = 'none'; 
                                    checkAllGiftsOpened();
                                }, 500);
                            }
                        });
                    }

                    // Wish Modal Close Handler
                    const closeWishBtn = document.getElementById('close-wish-modal');
                    const wishModal = document.getElementById('wish-modal');
                    if (closeWishBtn && wishModal) {
                        function handleWishCloseAttempt() {
                            if (!isWishSequenceComplete) {
                                const iframe = wishModal.querySelector('iframe');
                                if (iframe && iframe.contentWindow) {
                                    try {
                                        iframe.contentWindow.postMessage({ type: 'CHECK_WISH_COMPLETE' }, '*');
                                    } catch(err) {}
                                }
                                showEarlyCloseToast("Oops, we're not done yet, don't leave so soon! ✨");
                                return;
                            }

                            restoreBackgroundAudioFromModal();
                            wishModal.classList.remove('show');
                            const iframe = wishModal.querySelector('iframe');
                            if (iframe) iframe.src = 'about:blank';
                            setTimeout(() => { 
                                wishModal.style.display = 'none'; 
                                checkAllGiftsOpened();
                            }, 500);
                        }

                        closeWishBtn.addEventListener('click', handleWishCloseAttempt);
                        wishModal.addEventListener('click', (e) => {
                            if (e.target === wishModal) {
                                handleWishCloseAttempt();
                            }
                        });
                    }

                    // Direct ALL 4 golden fairies to fly around the upper part of the gift frame and drop confetti
                    activeBirthdayFairies.forEach((f, idx) => {
                        if (f) {
                            f.settledOnGifts = true;
                            f.fairyIndex = idx;
                            f.speed = 4.5;
                        }
                    });

                    // Start alternating speech loop among the 4 fairies (only 1 speaks at a time to prevent overlap)
                    if (giftFairySpeakerInterval) clearInterval(giftFairySpeakerInterval);
                    const giftPhrases = [
                        "Here is your surprise gift! 🎁",
                        "Choose a magical box below! ✨",
                        "Which box holds your secret wish? 💖",
                        "Pick any gift box to open! 🎉"
                    ];
                    let currentSpeaker = 0;
                    
                    function speakNextFairy() {
                        if (!activeBirthdayFairies || activeBirthdayFairies.length === 0) return;
                        
                        // Hide dialog on all fairies first
                        activeBirthdayFairies.forEach(f => {
                            if (f && f.el) {
                                const d = f.el.querySelector('.birthday-fairy-dialog');
                                if (d) d.classList.remove('show');
                            }
                        });
                        
                        // Show speech bubble ONLY on the current active speaker fairy
                        const speakerFairy = activeBirthdayFairies[currentSpeaker % activeBirthdayFairies.length];
                        if (speakerFairy && speakerFairy.el) {
                            const dialog = speakerFairy.el.querySelector('.birthday-fairy-dialog');
                            const span = dialog.querySelector('span');
                            if (span && dialog) {
                                span.innerText = giftPhrases[currentSpeaker % giftPhrases.length];
                                dialog.classList.add('show');
                            }
                        }
                        
                        currentSpeaker = (currentSpeaker + 1) % activeBirthdayFairies.length;
                    }

                    // Start alternating turns immediately
                    speakNextFairy();
                    giftFairySpeakerInterval = setInterval(speakNextFairy, 3200);
                }, 2200);
            });
        }
    }

    let giftFairySpeakerInterval = null;

    // ==========================================
    // Golden Birthday Fairies (4 flying around)
    // ==========================================
    function startBirthdayFairies() {
        activeBirthdayFairies = [];
        const messages = [
            'Happy Birthday! 🎉',
            'Make a wish! ✨',
            'Wishing you the best! 💖',
            'Have a magical day! 🌟',
            'Yay, cake time! 🎂',
            'Sending love! 💕',
            'You are amazing! 🦄',
            'Cheers to you! 🥂',
            'Stay awesome! 😎',
            'Sparkle all day! ✨'
        ];

        // Create 4 golden fairies
        for (let i = 0; i < 4; i++) {
            const fairyEl = document.createElement('div');
            fairyEl.className = 'birthday-fairy';
            
            fairyEl.innerHTML = `
              <svg viewBox="0 0 100 100" class="fairy-svg">
                <defs>
                  <linearGradient id="wing-grad-bf-${i}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ffd0a6" stop-opacity="0.9" />
                    <stop offset="100%" stop-color="#ff758c" stop-opacity="0.4" />
                  </linearGradient>
                  <radialGradient id="body-grad-bf-${i}" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#ffffff" />
                    <stop offset="60%" stop-color="#ffe683" />
                    <stop offset="100%" stop-color="#ffa726" />
                  </radialGradient>
                  <filter id="fairy-glow-filter-bf-${i}" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <path class="svg-wing left-wing" d="M 40,42 C 15,20 5,35 12,52 C 16,62 30,55 42,48 Z" fill="url(#wing-grad-bf-${i})" />
                <path class="svg-wing right-wing" d="M 60,42 C 85,20 95,35 88,52 C 84,62 70,55 58,48 Z" fill="url(#wing-grad-bf-${i})" />
                <path class="fairy-star-body" d="M 50,22 L 57,38 L 74,40 L 61,52 L 65,69 L 50,60 L 35,69 L 39,52 L 26,40 L 43,38 Z" fill="url(#body-grad-bf-${i})" filter="url(#fairy-glow-filter-bf-${i})" />
                <circle cx="44" cy="46" r="2.5" fill="#221b1b" />
                <circle cx="43.2" cy="44.8" r="0.8" fill="#ffffff" />
                <circle cx="56" cy="46" r="2.5" fill="#221b1b" />
                <circle cx="55.2" cy="44.8" r="0.8" fill="#ffffff" />
                <circle cx="41.5" cy="50.5" r="2" fill="#ff758c" opacity="0.7" />
                <circle cx="58.5" cy="50.5" r="2" fill="#ff758c" opacity="0.7" />
                <path d="M 48.5,50.8 Q 50,52.8 51.5,50.8" stroke="#221b1b" stroke-width="1.5" fill="none" stroke-linecap="round" />
              </svg>
              <div class="birthday-fairy-dialog"><span></span></div>
            `;
            
            document.body.appendChild(fairyEl);
            
            // Start positions completely off-screen, coming from random sides
            let x, y;
            const side = Math.floor(Math.random() * 4); // 0: Top, 1: Right, 2: Bottom, 3: Left
            if (side === 0) { // Top off-screen
                x = Math.random() * window.innerWidth;
                y = -100;
            } else if (side === 1) { // Right off-screen
                x = window.innerWidth + 100;
                y = Math.random() * window.innerHeight;
            } else if (side === 2) { // Bottom off-screen
                x = Math.random() * window.innerWidth;
                y = window.innerHeight + 100;
            } else { // Left off-screen
                x = -100;
                y = Math.random() * window.innerHeight;
            }
            
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            activeBirthdayFairies.push({
                el: fairyEl,
                x: x,
                y: y,
                vx: 0,
                vy: 0,
                // Initial target is strictly the center area to guide them in first
                targetX: centerX + (Math.random() - 0.5) * 200,
                targetY: centerY + (Math.random() - 0.5) * 150,
                speed: Math.random() * 2 + 2.2, // slightly faster entry speed
                speaking: false
            });
        }
        
        // Physics update loop
        function updateBirthdayFairies() {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            activeBirthdayFairies.forEach((f, idx) => {
                if (f.mode === 'reentering') {
                    // Very slow, calm flight into viewport from edge toward center screen
                    f.x += (f.targetX - f.x) * 0.026;
                    f.y += (f.targetY - f.y) * 0.026;
                    f.el.style.opacity = '1';
                    f.el.style.transform = `translate3d(${f.x}px, ${f.y}px, 0) translate(-50%, -50%)`;

                    // Drop soft rounded glowing pixie dust spark trail (same as passcode fairy)
                    if (Math.random() < 0.6) {
                        fairyDust.push(new FairyDustParticle(f.x, f.y + 6, 0, 1.2));
                        if (!animationFrameId) animateConfetti();
                    }
                    return;
                }

                if (f.mode === 'ascended') {
                    // Slow, graceful upward flight out of the top of the screen
                    f.y -= 1.8;
                    f.x += Math.sin(Date.now() * 0.003 + idx * 2) * 1.5;
                    
                    if (f.y < -120) {
                        f.el.style.opacity = '0';
                    } else {
                        f.el.style.opacity = '1';
                    }
                    f.el.style.transform = `translate3d(${f.x}px, ${f.y}px, 0) translate(-50%, -50%)`;

                    // Drop continuous pixie dust trails while visible
                    if (f.y >= -120 && Math.random() < 0.75) {
                        fairyDust.push(new FairyDustParticle(f.x, f.y + 10, 0, 2.5));
                        if (!animationFrameId) animateConfetti();
                    }
                    return;
                }

                if (f.mode === 'pausing') {
                    f.targetY = f.baseY || f.targetY;
                    f.y += (f.targetY + Math.sin(Date.now() * 0.003 + idx) * 12 - f.y) * 0.08;
                    f.x += (f.targetX - f.x) * 0.08;
                    f.el.style.transform = `translate3d(${f.x}px, ${f.y}px, 0) translate(-50%, -50%)`;

                    if (Math.random() < 0.5) {
                        fairyDust.push(new FairyDustParticle(f.x, f.y + 8, 0, 1.8));
                        if (!animationFrameId) animateConfetti();
                    }
                    return;
                }
                const dx = f.targetX - f.x;
                const dy = f.targetY - f.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 45) {
                    if (f.settledOnGifts) {
                        const frameEl = document.getElementById('gifts-split-container');
                        if (frameEl) {
                            const rect = frameEl.getBoundingClientRect();
                            // Distribute all 4 fairies evenly across the upper rim of giftbox-frame.png
                            const fairyRatios = [0.18, 0.38, 0.62, 0.82];
                            const ratio = fairyRatios[idx % 4];
                            f.targetX = rect.left + rect.width * ratio + (Math.random() - 0.5) * 80;
                            f.targetY = rect.top - 20 + Math.sin(Date.now() * 0.003 + idx * 1.5) * 22;
                        } else {
                            f.targetX = window.innerWidth / 2 + (Math.random() - 0.5) * 400;
                            f.targetY = window.innerHeight * 0.55;
                        }
                    } else {
                        const isSplit = document.querySelector('.decor-text-group').classList.contains('split-top');
                        if (isSplit) {
                            const isMobile = window.innerWidth <= 900;
                            if (isMobile) {
                                f.targetX = centerX + (Math.random() - 0.5) * 360; // Slightly broader area on mobile
                                f.targetY = (window.innerHeight * 0.44) + (Math.random() - 0.5) * 140;
                            } else {
                                f.targetX = centerX + (Math.random() - 0.5) * 560; // Slightly broader area on desktop
                                f.targetY = (window.innerHeight * 0.46) + (Math.random() - 0.5) * 120;
                            }
                        } else {
                            // Get new target constrained around the center of the screen, but broader (900px by 640px)
                            f.targetX = centerX + (Math.random() - 0.5) * 900;
                            f.targetY = centerY + (Math.random() - 0.5) * 640;
                        }
                    }
                }
                
                // Standard gravity pull toward target
                let targetAngle = Math.atan2(dy, dx);
                f.vx += Math.cos(targetAngle) * 0.35;
                f.vy += Math.sin(targetAngle) * 0.35;

                // Evasive push from user's cursor
                let mdx = f.x - mouse.x;
                let mdy = f.y - mouse.y;
                let mdist = Math.sqrt(mdx * mdx + mdy * mdy);
                if (mdist < 120) {
                    let angle = Math.atan2(mdy, mdx);
                    let pushForce = (120 - mdist) * 0.40;
                    f.vx += Math.cos(angle) * pushForce;
                    f.vy += Math.sin(angle) * pushForce;

                    // Show a chase reaction bubble if hovered during wandering phase
                    if (!f.settledOnGifts && !f.speaking) {
                        const chasePhrases = ["Don't chase me! 😜", "Hey, stop that! ✨", "Eek! Too close! 🏃‍♂️", "Catch me if you can! 🦋", "Ah! Don't tickle me! 😂"];
                        const randomReaction = chasePhrases[Math.floor(Math.random() * chasePhrases.length)];
                        
                        const dialog = f.el.querySelector('.birthday-fairy-dialog');
                        const span = dialog.querySelector('span');
                        span.innerText = randomReaction;
                        f.speaking = true;
                        dialog.classList.add('show');
                        
                        setTimeout(() => {
                            dialog.classList.remove('show');
                            setTimeout(() => { f.speaking = false; }, 850);
                        }, 1800);
                    }
                }

                // Speed limit (friction and max cap)
                f.vx *= 0.94;
                f.vy *= 0.94;
                let currentSpeed = Math.sqrt(f.vx * f.vx + f.vy * f.vy);
                const maxSpeed = 8.5; // zippy and lively velocity
                if (currentSpeed > maxSpeed) {
                    f.vx = (f.vx / currentSpeed) * maxSpeed;
                    f.vy = (f.vy / currentSpeed) * maxSpeed;
                }

                // Apply movement coordinates
                f.x += f.vx;
                f.y += f.vy;

                // Bounce boundaries check to keep inside screen viewport (based on center coordinates)
                const pad = 35;
                if (f.x < pad) { f.x = pad; f.vx = Math.abs(f.vx); }
                if (f.x > window.innerWidth - pad) { f.x = window.innerWidth - pad; f.vx = -Math.abs(f.vx); }
                if (f.y < pad) { f.y = pad; f.vy = Math.abs(f.vy); }
                if (f.y > window.innerHeight - pad) { f.y = window.innerHeight - pad; f.vy = -Math.abs(f.vy); }

                // Spawn colorful sand / pixie dust trail drop effect (centered and offset behind the flight vector)
                if (Math.random() < 0.65) {
                    const centerX = f.x;
                    const centerY = f.y + 5; // Aligned with the 60% height of the star body center
                    const trailX = centerX - f.vx * 3.5; // Pushed backward along velocity vector
                    const trailY = centerY - f.vy * 3.5;
                    
                    fairyDust.push(new FairyDustParticle(trailX, trailY, f.vx, f.vy));
                    if (!animationFrameId) {
                        animateConfetti();
                    }
                }
                
                // Tilt based on actual velocity vector direction & hover flap
                const angle = Math.atan2(f.vy, f.vx) * (180 / Math.PI);
                let tilt = angle > 90 || angle < -90 ? 180 : 0;
                const flap = Math.sin(Date.now() * 0.015 + f.speed) * 6;
                
                // Apply positioning translation on parent container with translate(-50%, -50%) to align center to f.x, f.y
                f.el.style.transform = `translate3d(${f.x}px, ${f.y}px, 0) translate(-50%, -50%) rotate(${flap}deg)`;

                // Flip only the SVG body (so dialog bubble stays upright and readable)
                const svgEl = f.el.querySelector('.fairy-svg');
                if (svgEl) {
                    svgEl.style.transform = `scaleX(${tilt === 180 ? -1 : 1})`;
                }
            });
            
            requestAnimationFrame(updateBirthdayFairies);
        }
        
        updateBirthdayFairies();
        
        // Random message bubble popping interval
        setInterval(() => {
            const idleFairies = activeBirthdayFairies.filter(f => !f.speaking && !f.settledOnGifts);
            if (idleFairies.length > 0 && Math.random() > 0.25) {
                const randomFairy = idleFairies[Math.floor(Math.random() * idleFairies.length)];
                
                const isSplit = document.querySelector('.decor-text-group').classList.contains('split-top');
                const selectedPhrases = isSplit ? [
                    'Here is your surprise! 🎁',
                    'Pick a gift box! ✨',
                    'Choose one! 🦋',
                    'Which one will it be? 🤔',
                    'Confetti magic! 🎉',
                    'So exciting! 🌟'
                ] : messages;
                
                const randomMsg = selectedPhrases[Math.floor(Math.random() * selectedPhrases.length)];
                
                const dialog = randomFairy.el.querySelector('.birthday-fairy-dialog');
                const span = dialog.querySelector('span');
                
                span.innerText = randomMsg;
                randomFairy.speaking = true;
                dialog.classList.add('show');
                
                setTimeout(() => {
                    dialog.classList.remove('show');
                    setTimeout(() => {
                        randomFairy.speaking = false;
                    }, 500);
                }, 2800);
            }
        }, 3500);
    }



    // Fade in background music smoothly
    function fadeInAudio(audioElement) {
        if (!audioElement) return;
        audioElement.volume = 0;
        audioElement.play().catch(err => {
            console.log("Audio play blocked by browser autoplay policy. It will play on next interaction.", err);
        });
        
        let vol = 0;
        const fadeInterval = setInterval(() => {
            if (vol < 0.85) {
                vol += 0.05;
                audioElement.volume = Math.min(vol, 0.85);
            } else {
                clearInterval(fadeInterval);
            }
        }, 100);
    }

    // "I'm Ready" button click listener (Phase 1 -> Phase 2 Transition)
    if (readyBtn) {
        readyBtn.addEventListener('click', () => {
            // Start background music with a smooth fade-in
            fadeInAudio(bgMusic);
        
        // Fade out headphone recommendation content
        headphonePhase.style.opacity = '0';
        headphonePhase.style.transform = 'scale(0.96)';
        
        // Wait for fade-out to finish, then swap content and fade in loading phase
        setTimeout(() => {
            headphonePhase.style.display = 'none';
            loadingPhase.style.display = 'block';
            
            // Force reflow
            loadingPhase.offsetHeight;
            
            loadingPhase.style.opacity = '1';
            loadingPhase.style.transform = 'scale(1)';
            
            // Start the actual loading progress bar chase (Phase 2)
            startLoading();
        }, 500);
    });
    }

    // ==========================================
    // Loading Screen Progress
    // ==========================================
    function startLoading() {
        let progress = 0;
        const duration = 8000; // 8.0 seconds total (slower to enjoy the chase!)
        const intervalTime = 30; // update frequency
        const step = (100 / (duration / intervalTime));

        // Play clock ticking sound on loading screen
        const tickingAudio = new Audio('assets/sound/clock-ticking.mp3');
        tickingAudio.loop = true;
        tickingAudio.volume = 0.6;
        playSound(tickingAudio);

        const timer = setInterval(() => {
            progress += step;
            if (progress >= 100) {
                progress = 100;
                clearInterval(timer);
                
                // Stop ticking clock audio
                if (tickingAudio) tickingAudio.pause();
                
                // Play hit target song
                const hitAudio = new Audio('assets/sound/target-hit.mp3');
                hitAudio.volume = 0.8;
                playSound(hitAudio);
                
                progressBarFill.style.width = '100%';
                if (reaperChaser) reaperChaser.style.left = '100%';
                if (loadingPercentage) loadingPercentage.innerText = '100%';
                
                // Trigger programmer panic shake when caught!
                const programmer = document.querySelector('.programmer-target');
                if (programmer) programmer.classList.add('panic');

                // Update status text on completion (deadline caught you!)
                loadingStatus.innerText = 'Oh no! The deadline caught you! 💀';

                // Display the proceed button
                proceedBtn.style.display = 'block';
            } else {
                progressBarFill.style.width = `${progress}%`;
                if (reaperChaser) reaperChaser.style.left = `${progress}%`;
                if (loadingPercentage) loadingPercentage.innerText = `${Math.floor(progress)}%`;
                
                // Update status text based on progress milestone
                const currentMsg = loadingMessages.reduce((prev, curr) => {
                    return (progress >= curr.progress) ? curr : prev;
                });
                loadingStatus.innerText = currentMsg.text;
            }
        }, intervalTime);
    }

    // ==========================================
    // Main Birthday Screen Logic
    // ==========================================
    function initializeMainScreen() {
        // Trigger initial Confetti burst
        fireConfetti(150);
        
        // Spawn floating balloons
        createBalloons(15);
    }

    // Floating Balloons generator
    function createBalloons(count) {
        const colors = [
            'rgba(255, 117, 140, 0.7)',  // Rose gold pink
            'rgba(255, 208, 166, 0.7)',  // Peach cream
            'rgba(184, 98, 255, 0.6)',   // Pastel violet
            'rgba(255, 230, 109, 0.7)',  // Soft yellow
            'rgba(107, 203, 119, 0.6)'   // Mint green
        ];

        for (let i = 0; i < count; i++) {
            const balloon = document.createElement('div');
            balloon.classList.add('balloon');
            
            // Random styling
            const color = colors[Math.floor(Math.random() * colors.length)];
            balloon.style.backgroundColor = color;
            balloon.style.setProperty('--accent-color', color);
            
            const size = Math.random() * 30 + 50; // 50px to 80px width
            balloon.style.width = `${size}px`;
            balloon.style.height = `${size * 1.25}px`;
            
            balloon.style.left = `${Math.random() * 90 + 5}%`;
            balloon.style.animationDelay = `${Math.random() * 8}s`;
            balloon.style.animationDuration = `${Math.random() * 10 + 10}s`; // 10s to 20s
            
            // Wind swing custom variables
            balloon.style.setProperty('--wind', `${Math.random() * 100 - 50}px`);
            balloon.style.setProperty('--angle', `${Math.random() * 20 - 10}deg`);

            // String
            const string = document.createElement('div');
            string.classList.add('balloon-string');
            balloon.appendChild(string);
            
            balloonsContainer.appendChild(balloon);
        }
    }

    // Gift Box reveal action
    if (giftBtn) {
        giftBtn.addEventListener('click', () => {
            giftBtn.classList.add('exploded');
            fireConfetti(80);

            setTimeout(() => {
                if (revealArea) revealArea.style.display = 'none';
                if (letterTriggerContainer) {
                    letterTriggerContainer.style.display = 'block';
                    setTimeout(() => {
                        letterTriggerContainer.classList.add('show');
                    }, 50);
                }
            }, 600);
        });
    }

    // ==========================================
    // Polaroid Frame Slideshow & Lightbox Click Logic
    // ==========================================
    const leftFrame = document.querySelector('.decor-frame-left');
    const rightFrame = document.querySelector('.decor-frame-right');
    
    if (leftFrame && imageModal && modalImg && modalCaption) {
        leftFrame.addEventListener('click', (e) => {
            if (e.target.closest('.frame-controls')) {
                return; // Let the control buttons handle manual swapping
            }
            const activeSlide = leftFrame.querySelector('.frame-slide.active');
            if (activeSlide) {
                const img = activeSlide.querySelector('.frame-img');
                const caption = activeSlide.querySelector('.frame-caption');
                if (img && caption) {
                    modalImg.src = img.src;
                    modalCaption.innerText = caption.innerText;
                    imageModal.style.display = 'block';
                }
            }
        });
    }
    
    if (rightFrame && imageModal && modalImg && modalCaption) {
        rightFrame.addEventListener('click', (e) => {
            if (e.target.closest('.frame-controls')) {
                return; // Let the control buttons handle manual swapping
            }
            const activeSlide = rightFrame.querySelector('.frame-slide.active');
            if (activeSlide) {
                const img = activeSlide.querySelector('.frame-img');
                const caption = activeSlide.querySelector('.frame-caption');
                if (img && caption) {
                    modalImg.src = img.src;
                    modalCaption.innerText = caption.innerText;
                    imageModal.style.display = 'block';
                }
            }
        });
    }

    // Polaroid Frame Auto-cycle & Manual controls Setup
    function setupFrameSlideshows() {
        const leftSlides = document.querySelectorAll('.decor-frame-left .frame-slide');
        const rightSlides = document.querySelectorAll('.decor-frame-right .frame-slide');
        
        let leftIdx = 0;
        let rightIdx = 0;
        
        let leftInterval = null;
        let rightInterval = null;
        
        function changeSlide(slides, currentIndex, direction, isLeft) {
            if (!slides || slides.length === 0) return;
            
            const currentSlide = slides[currentIndex];
            let nextIndex;
            if (direction === 'next') {
                nextIndex = (currentIndex + 1) % slides.length;
            } else {
                nextIndex = (currentIndex - 1 + slides.length) % slides.length;
            }
            const nextSlide = slides[nextIndex];
            
            // Clean any previous animation classes on all slides
            slides.forEach(s => {
                s.classList.remove('active', 'exit-to-left', 'exit-to-right');
            });
            
            if (direction === 'next') {
                // Current slide exits to left
                if (currentSlide) currentSlide.classList.add('exit-to-left');
            } else {
                // Current slide exits to right
                if (currentSlide) currentSlide.classList.add('exit-to-right');
            }
            
            // Next slide becomes active and enters cleanly
            if (nextSlide) nextSlide.classList.add('active');
            
            if (isLeft) {
                leftIdx = nextIndex;
            } else {
                rightIdx = nextIndex;
            }
        }
        
        function startLeftInterval() {
            if (leftInterval) clearInterval(leftInterval);
            leftInterval = setInterval(() => {
                changeSlide(leftSlides, leftIdx, 'next', true);
            }, 3000);
        }
        
        function startRightInterval() {
            if (rightInterval) clearInterval(rightInterval);
            rightInterval = setInterval(() => {
                changeSlide(rightSlides, rightIdx, 'next', false);
            }, 3000);
        }
        
        // Manual controls Left Frame
        const leftPrev = document.querySelector('.decor-frame-left .btn-prev');
        const leftNext = document.querySelector('.decor-frame-left .btn-next');
        if (leftPrev) {
            leftPrev.onclick = (e) => {
                e.stopPropagation();
                changeSlide(leftSlides, leftIdx, 'prev', true);
                startLeftInterval();
            };
        }
        if (leftNext) {
            leftNext.onclick = (e) => {
                e.stopPropagation();
                changeSlide(leftSlides, leftIdx, 'next', true);
                startLeftInterval();
            };
        }
        
        // Manual controls Right Frame
        const rightPrev = document.querySelector('.decor-frame-right .btn-prev');
        const rightNext = document.querySelector('.decor-frame-right .btn-next');
        if (rightPrev) {
            rightPrev.onclick = (e) => {
                e.stopPropagation();
                changeSlide(rightSlides, rightIdx, 'prev', false);
                startRightInterval();
            };
        }
        if (rightNext) {
            rightNext.onclick = (e) => {
                e.stopPropagation();
                changeSlide(rightSlides, rightIdx, 'next', false);
                startRightInterval();
            };
        }
        
        // Start automatic cycling
        startLeftInterval();
        
        // Offset right side for staggered flow
        setTimeout(() => {
            startRightInterval();
        }, 1500);
    }

    // ==========================================
    // Dynamic Carousel Auto-Scanner (image-# & images-# pattern)
    // Even numbers -> Left Frame | Odd numbers -> Right Frame
    // ==========================================
    async function loadAndBuildCarousel() {
        const extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const prefixes = ['image-', 'images-', 'image_', 'images_', 'image', 'images'];
        const probePromises = [];

        // Probe numbers 1 through 100
        for (let num = 1; num <= 100; num++) {
            prefixes.forEach(prefix => {
                extensions.forEach(ext => {
                    const filename = `${prefix}${num}${ext}`;
                    const fullPath = `assets/carousel/${filename}`;
                    probePromises.push(new Promise(resolve => {
                        const img = new Image();
                        img.onload = () => resolve({ num, filename, path: fullPath });
                        img.onerror = () => resolve(null);
                        img.src = fullPath;
                    }));
                });
            });
        }

        // Also check manifest.json if present
        let manifestFiles = [];
        try {
            const resp = await fetch('assets/carousel/manifest.json?t=' + Date.now());
            if (resp.ok) manifestFiles = await resp.json();
        } catch (e) {}

        manifestFiles.forEach(filename => {
            const match = filename.match(/\d+/);
            const num = match ? parseInt(match[0], 10) : 1;
            probePromises.push(Promise.resolve({ num, filename, path: `assets/carousel/${filename}` }));
        });

        const results = await Promise.all(probePromises);
        
        // Map unique numbers to found image items
        const foundMap = new Map();
        results.forEach(res => {
            if (res && !foundMap.has(res.num)) {
                foundMap.set(res.num, res);
            }
        });

        const sortedNums = Array.from(foundMap.keys()).sort((a, b) => a - b);
        const leftItems = [];
        const rightItems = [];

        sortedNums.forEach(num => {
            const item = foundMap.get(num);
            if (num % 2 === 0) {
                // EVEN -> LEFT FRAME
                leftItems.push(item);
            } else {
                // ODD -> RIGHT FRAME
                rightItems.push(item);
            }
        });

        buildCarouselDOM(leftItems, rightItems);
    }

    function buildCarouselDOM(leftItems, rightItems) {
        const leftViewport = document.querySelector('.decor-frame-left .frame-slides-viewport');
        const rightViewport = document.querySelector('.decor-frame-right .frame-slides-viewport');
        if (!leftViewport || !rightViewport) return;

        leftViewport.innerHTML = '';
        rightViewport.innerHTML = '';

        const emojis = ['🎂', '🎈', '✨', '🎁', '💖', '🌸', '🌟', '🎉', '💕', '🦄'];

        function createSlide(item) {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'frame-slide';
            
            const imgEl = document.createElement('img');
            imgEl.src = item.path;
            imgEl.alt = item.filename;
            imgEl.className = 'frame-img';

            slideDiv.appendChild(imgEl);
            return slideDiv;
        }

        leftItems.forEach((item, idx) => {
            const slide = createSlide(item, idx);
            if (idx === 0) slide.classList.add('active');
            leftViewport.appendChild(slide);
        });

        rightItems.forEach((item, idx) => {
            const slide = createSlide(item, idx);
            if (idx === 0) slide.classList.add('active');
            rightViewport.appendChild(slide);
        });

        // Fallback: If one viewport is empty while the other has slides, mirror so both frames show slides
        if (leftViewport.children.length === 0 && rightViewport.children.length > 0) {
            leftViewport.innerHTML = rightViewport.innerHTML;
        } else if (rightViewport.children.length === 0 && leftViewport.children.length > 0) {
            rightViewport.innerHTML = leftViewport.innerHTML;
        }

        setupFrameSlideshows();
    }

    // Run carousel auto-loader on init
    loadAndBuildCarousel();

    // Lightbox close
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            if (imageModal) imageModal.style.display = 'none';
        });
    }
    
    if (imageModal) {
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal || e.target === closeModalBtn) {
                imageModal.style.display = 'none';
            }
        });
    }

    // ==========================================
    // Heartfelt Letter Reveal Logic
    // ==========================================
    if (readLetterBtn) {
        readLetterBtn.addEventListener('click', () => {
            if (letterModal) letterModal.classList.add('show');
            fireConfetti(30);
            spawnHearts(10);
        });
    }

    if (closeLetterBtn) {
        closeLetterBtn.addEventListener('click', () => {
            if (letterModal) letterModal.classList.remove('show');
        });
    }

    if (letterModal) {
        letterModal.addEventListener('click', (e) => {
            if (e.target === letterModal) {
                letterModal.classList.remove('show');
            }
        });
    }

    function spawnHearts(count) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const heart = document.createElement('i');
                heart.className = 'fa-solid fa-heart floating-heart';
                heart.style.position = 'fixed';
                heart.style.bottom = '-50px';
                heart.style.left = `${Math.random() * 80 + 10}vw`;
                heart.style.fontSize = `${Math.random() * 1.5 + 1}rem`;
                heart.style.color = `rgba(255, 117, 140, ${Math.random() * 0.4 + 0.3})`;
                heart.style.pointerEvents = 'none';
                heart.style.zIndex = '999';
                
                // Animation settings
                const duration = Math.random() * 3 + 4;
                const wind = Math.random() * 100 - 50;
                
                heart.style.transition = `transform ${duration}s linear, opacity ${duration}s ease`;
                document.body.appendChild(heart);

                // Start transition
                setTimeout(() => {
                    heart.style.transform = `translateY(-110vh) translateX(${wind}px) scale(1.3) rotate(${Math.random() * 45 - 22.5}deg)`;
                    heart.style.opacity = '0';
                }, 50);

                // Cleanup
                setTimeout(() => {
                    heart.remove();
                }, duration * 1000);
            }, i * 300);
        }
    }

    // ==========================================
    // Confetti Engine (Canvas)
    // ==========================================
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    let confetti = [];
    let fairyDust = [];
    let glassShards = [];
    let animationFrameId = null;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class ConfettiParticle {
        constructor(startX, startY, angleBase) {
            if (startX !== undefined && startY !== undefined) {
                this.x = startX;
                this.y = startY;
                let angle;
                let speed;
                if (angleBase !== undefined) {
                    // Spray direction +/- 25 degrees spread
                    angle = angleBase + (Math.random() - 0.5) * (Math.PI / 3.6);
                    speed = Math.random() * 11 + 7; // high velocity popper blast
                } else {
                    angle = Math.random() * Math.PI * 2;
                    speed = Math.random() * 6 + 3;
                }
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed - 1.5;
            } else {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + Math.random() * 100;
                this.vx = Math.random() * 6 - 3;
                this.vy = -Math.random() * 15 - 10;
            }
            this.size = Math.random() * 6 + 4;
            this.color = this.getRandomColor();
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 10 - 5;
            this.gravity = 0.3;
        }

        getRandomColor() {
            const h = Math.random() * 40 + 340; // Reds, Pinks, Purples
            const s = Math.random() * 20 + 80;
            const l = Math.random() * 20 + 60;
            return `hsl(${h}, ${s}%, ${l}%)`;
        }

        update() {
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotationSpeed;
            
            // Slow down horizontal velocity
            this.vx *= 0.98;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            ctx.restore();
        }
    }

    class FairyDustParticle {
        constructor(x, y, fairyVx, fairyVy) {
            this.x = x + (Math.random() * 6 - 3);
            this.y = y + (Math.random() * 6 - 3);
            
            // Check if card is split (meaning we are on the gift screen)
            const textGroup = document.querySelector('.decor-text-group');
            this.isConfetti = textGroup && textGroup.classList.contains('split-top');
            
            if (this.isConfetti) {
                // Confetti shape dimensions
                this.size = Math.random() * 5 + 3.5; // Larger confetti size
                this.width = this.size;
                this.height = this.size * (Math.random() * 0.4 + 0.65);
                
                // Falling speed (downward gravity)
                this.vx = (Math.random() * 1.6 - 0.8);
                this.vy = Math.random() * 1.2 + 1.8; // Constant downward drift
                
                this.fadeSpeed = Math.random() * 0.0035 + 0.0018; // Very slow fade so it drifts to bottom of screen
                this.flutterOffset = Math.random() * Math.PI * 2;
                this.flutterSpeed = Math.random() * 0.08 + 0.04;
                this.rotation = Math.random() * 360;
                this.rotSpeed = (Math.random() * 4 - 2);
            } else {
                // Normal pixie dust spark - drifting downwards for falling down effect
                this.size = Math.random() * 2.2 + 0.8;
                this.vx = Math.random() * 1.2 - 0.6;
                this.vy = Math.random() * 1.5 + 0.6; // Positive vy = drifting downwards
                this.fadeSpeed = Math.random() * 0.015 + 0.01;
            }
            
            this.color = this.getRandomDustColor();
            this.opacity = 1;
        }

        getRandomDustColor() {
            const hues = [
                340, // Pink
                275, // Violet
                195, // Sky Blue
                48,  // Gold/Yellow
                130  // Mint Green
            ];
            const h = hues[Math.floor(Math.random() * hues.length)];
            const s = 100;
            const l = Math.random() * 15 + 65; // vibrant pastel
            return `hsla(${h}, ${s}%, ${l}%, `;
        }

        update() {
            if (this.isConfetti) {
                // Flutter wave (sinusoidal horizontal movement)
                this.flutterOffset += this.flutterSpeed;
                this.x += this.vx + Math.sin(this.flutterOffset) * 0.7;
                this.y += this.vy;
                this.rotation += this.rotSpeed;
            } else {
                this.x += this.vx;
                this.y += this.vy;
                this.vx *= 0.98;
            }
            this.opacity -= this.fadeSpeed;
        }

        draw() {
            ctx.save();
            ctx.beginPath();
            if (this.isConfetti) {
                // Draw rotating rectangular confetti
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation * Math.PI / 180);
                ctx.fillStyle = this.color + this.opacity + ')';
                ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            } else {
                // Draw rounded pixie dust
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color + this.opacity + ')';
                ctx.shadowColor = this.color + '0.8)';
                ctx.shadowBlur = 3;
                ctx.fill();
            }
            ctx.restore();
        }
    }

    class ThanosSandParticle {
        constructor(x, y) {
            this.x = x + (Math.random() * 20 - 10);
            this.y = y + (Math.random() * 20 - 10);
            this.size = Math.random() * 2.8 + 0.8;
            this.vx = Math.random() * 4.8 + 1.2;
            this.vy = -Math.random() * 3.5 - 0.5;
            this.opacity = 1;
            this.fadeSpeed = Math.random() * 0.012 + 0.006;
            this.turbulence = Math.random() * 0.16 - 0.08;
            
            const sandColors = [
                '#ffd0a6', '#ffb703', '#ffa726', '#ffe683', '#fefae0', '#e0c3fc', '#d4af37'
            ];
            this.color = sandColors[Math.floor(Math.random() * sandColors.length)];
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vx += this.turbulence;
            this.vy += 0.04;
            this.opacity -= this.fadeSpeed;
        }

        draw() {
            if (this.opacity <= 0) return;
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.opacity);
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    class GlassShardParticle {
        constructor(x, y) {
            // Spawn randomly inside the lock-screen card area bounds
            this.x = x + (Math.random() * 260 - 130);
            this.y = y + (Math.random() * 320 - 160);
            
            // Small glowing geometric shard sizes
            this.width = Math.random() * 10 + 4;
            this.height = Math.random() * 7 + 3;
            
            // Random polygon types (0: triangle, 1: diamond, 2: trapezoid/shard)
            this.shapeType = Math.floor(Math.random() * 3);
            
            // Elegant, gentle outward velocity vector (smooth drift, not violent)
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 2.0 + 0.8;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed - 0.3; // slight floating lift
            
            // Spin
            this.rotation = Math.random() * Math.PI * 2;
            this.spinSpeed = Math.random() * 0.03 - 0.015; // slow elegant rotation
            
            // Frosted glass color theme matching the background/cards
            this.color = this.getRandomGlassColor();
            this.opacity = Math.random() * 0.4 + 0.55; // 0.55 - 0.95 opacity
            this.fadeSpeed = Math.random() * 0.012 + 0.007; // elegant fade out (1.5 - 2s)
        }

        getRandomGlassColor() {
            const colors = [
                'hsla(0, 0%, 100%, ',       // Frosted white glass
                'hsla(195, 100%, 85%, ',    // Frost blue glass
                'hsla(340, 100%, 85%, ',    // Soft glowing rose glass
                'hsla(48, 100%, 82%, '      // Soft glowing gold glass
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            // Apply slight air friction deceleration for smooth stopping
            this.vx *= 0.96;
            this.vy *= 0.96;
            this.rotation += this.spinSpeed;
            this.opacity -= this.fadeSpeed;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            
            // Magical glowing blur borders
            ctx.shadowColor = this.color + '0.7)';
            ctx.shadowBlur = 6;
            
            ctx.fillStyle = this.color + this.opacity + ')';
            ctx.strokeStyle = 'rgba(255, 255, 255, ' + (this.opacity * 0.4) + ')';
            ctx.lineWidth = 0.8;
            
            ctx.beginPath();
            if (this.shapeType === 0) {
                // Triangle
                ctx.moveTo(0, -this.height / 2);
                ctx.lineTo(this.width / 2, this.height / 2);
                ctx.lineTo(-this.width / 2, this.height / 2);
            } else if (this.shapeType === 1) {
                // Diamond
                ctx.moveTo(0, -this.height / 2);
                ctx.lineTo(this.width / 2, 0);
                ctx.lineTo(0, this.height / 2);
                ctx.lineTo(-this.width / 2, 0);
            } else {
                // Polygon shard
                ctx.moveTo(-this.width / 3, -this.height / 2);
                ctx.lineTo(this.width / 2, -this.height / 3);
                ctx.lineTo(this.width / 3, this.height / 2);
                ctx.lineTo(-this.width / 2, this.height / 3);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
    }

    function fireConfetti(count, startX, startY) {
        resizeCanvas();
        for (let i = 0; i < count; i++) {
            confetti.push(new ConfettiParticle(startX, startY));
        }
        
        if (!animationFrameId) {
            animateConfetti();
        }
    }

    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update & Render Confetti
        for (let i = confetti.length - 1; i >= 0; i--) {
            const p = confetti[i];
            p.update();
            p.draw();
            
            // Remove if off screen
            if (p.y > canvas.height + 20 && p.vy > 0) {
                confetti.splice(i, 1);
            }
        }

        // Update & Render Fairy Dust (colorful sand)
        for (let i = fairyDust.length - 1; i >= 0; i--) {
            const p = fairyDust[i];
            p.update();
            p.draw();
            
            // Remove if faded
            if (p.opacity <= 0) {
                fairyDust.splice(i, 1);
            }
        }

        // Update & Render Glass Shards
        for (let i = glassShards.length - 1; i >= 0; i--) {
            const p = glassShards[i];
            p.update();
            p.draw();
            
            // Remove if faded
            if (p.opacity <= 0) {
                glassShards.splice(i, 1);
            }
        }

        if (confetti.length > 0 || fairyDust.length > 0 || glassShards.length > 0) {
            animationFrameId = requestAnimationFrame(animateConfetti);
        } else {
            animationFrameId = null;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
});
