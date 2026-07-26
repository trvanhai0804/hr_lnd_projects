/* ==========================================
   Gift #3: Cinematic Birthday Wish Scene Script
   ========================================== */

const FRIEND_NAME = "Evelyn";

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. Audio Hooks (Web Audio API Synthesizer)
    // ==========================================
    let isMuted = false;
    let audioCtx = null;
    let isFinalSentenceReached = false;

    window.addEventListener('message', (e) => {
        if (e.data && e.data.type === 'SET_MUTE') {
            isMuted = !!e.data.muted;
            if (audioCtx) {
                if (isMuted && audioCtx.state === 'running') {
                    audioCtx.suspend();
                } else if (!isMuted && audioCtx.state === 'suspended') {
                    audioCtx.resume();
                }
            }
        }
        if (e.data && e.data.type === 'CHECK_WISH_COMPLETE') {
            try {
                window.parent.postMessage({ type: 'WISH_SEQUENCE_STATE', complete: isFinalSentenceReached }, '*');
            } catch(err) {}
        }
    });

    function getAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (!isMuted && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    // Sound Hook: Candle Extinguish Chime
    window.playCandleSound = function() {
        if (isMuted) return;
        try {
            const ctx = getAudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5 note
            osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.3); // C6 note

            gain.gain.setValueAtTime(0.25, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) { console.log(e); }
    };

    // Sound Hook: Celestial Wish & Shooting Star Shimmer
    window.playWishSound = function() {
        if (isMuted) return;
        try {
            const ctx = getAudioContext();
            const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C Major Arpeggio
            notes.forEach((freq, idx) => {
                setTimeout(() => {
                    if (isMuted) return;
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, ctx.currentTime);

                    gain.gain.setValueAtTime(0.2, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    osc.start();
                    osc.stop(ctx.currentTime + 1.2);
                }, idx * 120);
            });
        } catch (e) { console.log(e); }
    };

    // Sound Hook: Disabled firework boom sound
    window.playFireworkSound = function() {};

    // ==========================================
    // 2. Starry Sky & Canvas Animation Engine
    // ==========================================
    const canvas = document.getElementById('sky-canvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Stars Array
    const stars = [];
    const numStars = 550;
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height * 0.75,
            baseRadius: Math.random() * 1.5 + 0.5,
            radius: 1,
            alpha: Math.random(),
            twinkleSpeed: Math.random() * 0.02 + 0.005,
            targetX: null,
            targetY: null
        });
    }

    // Atmospheric Floating Particles
    const dustParticles = [];
    for (let i = 0; i < 40; i++) {
        dustParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            vy: -Math.random() * 0.4 - 0.1,
            alpha: Math.random() * 0.5 + 0.2
        });
    }

    // Shooting Stars Array & Spawner
    const shootingStars = [];
    class ShootingStar {
        constructor(isFinale = false) {
            this.x = Math.random() * canvas.width * 0.7 + canvas.width * 0.1;
            this.y = Math.random() * canvas.height * 0.3;
            this.length = isFinale ? (Math.random() * 180 + 150) : (Math.random() * 130 + 80);
            this.speed = isFinale ? (Math.random() * 14 + 16) : (Math.random() * 10 + 10);
            this.angle = Math.PI / 4 + (Math.random() * 0.2 - 0.1); // ~45 deg diagonal
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
            this.opacity = 1;
            this.life = 0;
            this.maxLife = isFinale ? 65 : 45;
            this.isFinale = isFinale;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life++;
            if (this.life > this.maxLife - 15) {
                this.opacity -= 0.07;
            }
        }

        draw() {
            ctx.save();
            ctx.strokeStyle = `rgba(255, 253, 231, ${Math.max(0, this.opacity)})`;
            ctx.lineWidth = this.isFinale ? 3.5 : 2.5;
            ctx.lineCap = 'round';

            const tailX = this.x - Math.cos(this.angle) * this.length;
            const tailY = this.y - Math.sin(this.angle) * this.length;

            const grad = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
            grad.addColorStop(0, `rgba(255, 253, 231, ${Math.max(0, this.opacity)})`);
            grad.addColorStop(0.3, `rgba(255, 209, 102, ${Math.max(0, this.opacity * 0.6)})`);
            grad.addColorStop(1, 'rgba(255, 209, 102, 0)');

            ctx.strokeStyle = grad;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(tailX, tailY);
            ctx.stroke();
            ctx.restore();
        }
    }

    // Schedule random shooting stars continuously with high frequency
    function scheduleRandomShootingStar() {
        const delay = Math.random() * 1000 + 600; // Every 0.6s to 1.6s
        setTimeout(() => {
            shootingStars.push(new ShootingStar(false));
            scheduleRandomShootingStar();
        }, delay);
    }
    // Spawn initial shooting stars shortly after entrance
    setTimeout(() => {
        shootingStars.push(new ShootingStar(false));
        setTimeout(() => shootingStars.push(new ShootingStar(false)), 400);
        scheduleRandomShootingStar();
    }, 1000);

    // Fireworks Particles Array
    let fireworks = [];
    function spawnFirework(x, y) {
        const particleCount = 45;
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            fireworks.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1,
                decay: Math.random() * 0.02 + 0.015,
                color: `hsl(${Math.random() * 40 + 35}, 100%, 70%)`
            });
        }
    }

    // Constellation Mode State
    let constellationActive = false;

    // Main 60fps Loop
    function renderSky() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Render Stars
        stars.forEach(s => {
            s.alpha += s.twinkleSpeed;
            if (s.alpha > 1 || s.alpha < 0.2) {
                s.twinkleSpeed = -s.twinkleSpeed;
            }

            if (constellationActive && s.targetX !== undefined && s.targetX !== null) {
                // Smooth, slow, graceful interpolation into constellation letter points
                s.x += (s.targetX - s.x) * 0.008;
                s.y += (s.targetY - s.y) * 0.008;
            }

            ctx.beginPath();
            if (constellationActive && s.isLetterStar) {
                // Constellation Letter Stars: Brilliant Glowing Gold-White Nodes!
                ctx.arc(s.x, s.y, 2.8, 0, Math.PI * 2);
                ctx.fillStyle = '#fffef0';
                ctx.shadowBlur = 12;
                ctx.shadowColor = '#ffd166';
            } else {
                s.radius = s.baseRadius * (0.8 + Math.sin(s.alpha * Math.PI) * 0.4);
                ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 253, 231, ${Math.min(1, Math.max(0.1, s.alpha))})`;
                if (s.radius > 1.2) {
                    ctx.shadowBlur = 6;
                    ctx.shadowColor = 'rgba(255, 253, 231, 0.8)';
                } else {
                    ctx.shadowBlur = 0;
                }
            }
            ctx.fill();
        });

        // Render Dust Particles
        dustParticles.forEach(d => {
            d.y += d.vy;
            if (d.y < 0) d.y = canvas.height;
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 209, 102, ${d.alpha * 0.4})`;
            ctx.fill();
        });

        // Render Active Shooting Stars
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const star = shootingStars[i];
            star.update();
            star.draw();
            if (star.life > star.maxLife || star.opacity <= 0) {
                shootingStars.splice(i, 1);
            }
        }

        // Render Fireworks
        for (let i = fireworks.length - 1; i >= 0; i--) {
            const p = fireworks[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05; // gravity
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                fireworks.splice(i, 1);
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }
        }

        requestAnimationFrame(renderSky);
    }
    renderSky();

    // ==========================================
    // 3. Scene Timeline & Interactive Candle Logic
    // ==========================================
    const moonContainer = document.querySelector('.moon-container');
    const cakeContainer = document.querySelector('.cake-scene-container');
    const candles = document.querySelectorAll('.cake.candle-item');
    const msgText = document.getElementById('message-text');
    const hintBadge = document.getElementById('hint-badge');
    const micIndicator = document.getElementById('mic-indicator');

    let candlesBlown = 0;
    const totalCandles = candles.length;
    let interactivePhase = false;

    // Timeline Step 1: Entrance Animations
    setTimeout(() => {
        if (moonContainer) moonContainer.classList.add('visible');
    }, 600);

    setTimeout(() => {
        if (cakeContainer) cakeContainer.classList.add('visible');
    }, 1200);

    // Timeline Step 2: Message Sequence
    setTimeout(() => {
        showMessage("Close your eyes...", false);
    }, 2500);

    setTimeout(() => {
        showMessage("Make a birthday wish...", false);
    }, 5500);

    setTimeout(() => {
        showMessage("When you're ready, blow out the candles.", false);
        if (hintBadge) hintBadge.classList.add('visible');
        interactivePhase = true;
    }, 8800);

    function showMessage(text, isGold) {
        if (!msgText) return;
        msgText.classList.remove('active');
        setTimeout(() => {
            msgText.innerText = text;
            if (isGold) {
                msgText.classList.add('gold-glow');
            } else {
                msgText.classList.remove('gold-glow');
            }
            msgText.classList.add('active');
        }, 600);
    }

    // Extinguish Candle Helper
    function extinguishCandle(candleObj) {
        if (!candleObj || candleObj.classList.contains('extinguished')) return;
        candleObj.classList.add('extinguished');
        candlesBlown++;

        // Sound Hook
        playCandleSound();

        // Spawn Smoke Particle
        const smoke = candleObj.querySelector('.smoke');
        if (smoke) {
            smoke.classList.add('active');
        }

        // Check if all candles blown!
        if (candlesBlown >= totalCandles) {
            triggerFinalSequence();
        }
    }

    // Option A: Click Candle / Flame
    candles.forEach(c => {
        c.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!interactivePhase) return;
            extinguishCandle(c);
        });
    });

    // Option B: Optional Microphone Blowing Detector
    if (micIndicator) {
        micIndicator.addEventListener('click', initMicBlowing);
    }

    function initMicBlowing() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            const ctx = getAudioContext();
            const mic = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            mic.connect(analyser);

            if (micIndicator) micIndicator.classList.add('listening');
            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            function checkBlowing() {
                if (candlesBlown >= totalCandles) return;
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    sum += dataArray[i];
                }
                let average = sum / dataArray.length;

                // Threshold for blow detection
                if (average > 65 && interactivePhase) {
                    const litCandles = Array.from(candles).filter(c => !c.classList.contains('extinguished'));
                    if (litCandles.length > 0) {
                        const randomLit = litCandles[Math.floor(Math.random() * litCandles.length)];
                        extinguishCandle(randomLit);
                    }
                }
                requestAnimationFrame(checkBlowing);
            }
            checkBlowing();
        }).catch(err => {
            console.log("Mic access not granted:", err);
        });
    }

    // ==========================================
    // 4. Finale Sequence: Shooting Star & Wish Realized
    // ==========================================
    function triggerFinalSequence() {
        interactivePhase = false;
        if (hintBadge) hintBadge.classList.remove('visible');

        // Hide message text smoothly
        if (msgText) msgText.classList.remove('active');

        // Quiet pause 2s, stars brighten
        stars.forEach(s => { s.baseRadius *= 1.3; });

        setTimeout(() => {
            // Sound Hook: Celestial Wish
            playWishSound();

            // Spawn Finale Bright Shooting Star
            shootingStars.push(new ShootingStar(true));
        }, 2200);

        // Step 5: Fireworks & Constellation Formation
        setTimeout(() => {
            // Distant fireworks visual burst
            spawnFirework(canvas.width * 0.3, canvas.height * 0.35);
            setTimeout(() => {
                spawnFirework(canvas.width * 0.7, canvas.height * 0.28);
            }, 600);

            // Trigger Star Constellation
            triggerConstellation();

            // Reignite Birthday Cake Candles One by One!
            setTimeout(() => {
                reigniteCandlesOneByOne();
            }, 6000);
        }, 4500);
    }

    // Reignite Birthday Cake Candles sequentially one by one
    function reigniteCandlesOneByOne() {
        const cArray = Array.from(candles);
        cArray.forEach((c, idx) => {
            setTimeout(() => {
                c.classList.remove('extinguished');
                const smoke = c.querySelector('.smoke');
                if (smoke) smoke.classList.remove('active');
                playCandleSound();
            }, idx * 700); // 700ms gap between each candle burning again
        });

        setTimeout(() => {
            candlesBlown = 0;
            interactivePhase = true;
        }, cArray.length * 700 + 400);
    }

    // Constellation Phase Management (20-second alternating loop with Sequential Lightning Wave)
    let currentConstellationPhase = 0;
    let constellationTimer = null;
    let currentLightningIndex = 0;
    let lightningTimer = null;

    function getConstellationPoints(phaseIndex) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');

        const points = [];

        if (phaseIndex === 0) {
            // Phase 1: HAPPY BIRTHDAY / EVELYN
            const line1 = "HAPPY BIRTHDAY";
            const line2 = FRIEND_NAME.toUpperCase();

            const fontSize1 = Math.min(canvas.width * 0.058, 48);
            const fontSize2 = Math.min(canvas.width * 0.085, 70);

            const y1 = canvas.height * 0.17;
            const y2 = y1 + fontSize1 * 1.5;

            tempCtx.textAlign = 'center';
            tempCtx.fillStyle = '#ffffff';

            tempCtx.font = `900 ${fontSize1}px "Outfit", -apple-system, sans-serif`;
            tempCtx.fillText(line1, tempCanvas.width / 2, y1);

            tempCtx.font = `900 ${fontSize2}px "Outfit", -apple-system, sans-serif`;
            tempCtx.fillText(line2, tempCanvas.width / 2, y2);
        } else {
            // Phase 2: MAY EVERY WISH / YOU MADE / FIND ITS WAY TO YOU (TONIGHT removed)
            const line1 = "MAY EVERY WISH";
            const line2 = "YOU MADE";
            const line3 = "FIND ITS WAY TO YOU";

            const fontSize = Math.min(canvas.width * 0.046, 36);

            const y1 = canvas.height * 0.14;
            const y2 = y1 + fontSize * 1.45;
            const y3 = y2 + fontSize * 1.45;

            tempCtx.textAlign = 'center';
            tempCtx.fillStyle = '#ffffff';
            tempCtx.font = `900 ${fontSize}px "Outfit", -apple-system, sans-serif`;

            tempCtx.fillText(line1, tempCanvas.width / 2, y1);
            tempCtx.fillText(line2, tempCanvas.width / 2, y2);
            tempCtx.fillText(line3, tempCanvas.width / 2, y3);
        }

        const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

        // Dense sampling (step = 4px) for solid, crisp, ultra-legible letter strokes
        const step = 4;
        for (let y = 0; y < tempCanvas.height; y += step) {
            for (let x = 0; x < tempCanvas.width; x += step) {
                const index = (y * tempCanvas.width + x) * 4;
                if (imgData.data[index + 3] > 120) {
                    points.push({ x: x, y: y });
                }
            }
        }
        return points;
    }

    function applyConstellationPhase(phaseIndex) {
        currentConstellationPhase = phaseIndex;
        if (phaseIndex === 1) {
            isFinalSentenceReached = true;
            try {
                window.parent.postMessage({ type: 'WISH_SEQUENCE_STATE', complete: true }, '*');
            } catch(e) {}
        }
        const points = getConstellationPoints(phaseIndex);

        // Dynamically spawn additional stars if needed so 100% of letter points are filled!
        while (stars.length < points.length) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                baseRadius: Math.random() * 1.5 + 0.5,
                radius: 1,
                alpha: Math.random(),
                twinkleSpeed: Math.random() * 0.02 + 0.005,
                targetX: null,
                targetY: null
            });
        }

        // Assign target coordinates & sequential letter indices to stars
        for (let i = 0; i < stars.length; i++) {
            if (i < points.length) {
                stars[i].targetX = points[i].x;
                stars[i].targetY = points[i].y;
                stars[i].isLetterStar = true;
                stars[i].letterIdx = i;
            } else {
                // Background stars drift ambiently
                stars[i].targetX = Math.random() * canvas.width;
                stars[i].targetY = Math.random() * canvas.height * 0.75;
                stars[i].isLetterStar = false;
                stars[i].letterIdx = undefined;
            }
        }
        constellationActive = true;

        // Reset and start sequential lightning wave across letters
        currentLightningIndex = 0;
        if (lightningTimer) clearInterval(lightningTimer);
        lightningTimer = setInterval(() => {
            currentLightningIndex = (currentLightningIndex + 1) % (points.length + 30);
        }, 35); // 35ms per star point = continuous sweeping lightning wave!
    }

    // Trigger Constellation & Start 20-Second Alternating Loop
    function triggerConstellation() {
        applyConstellationPhase(0);

        if (constellationTimer) clearInterval(constellationTimer);
        constellationTimer = setInterval(() => {
            const nextPhase = (currentConstellationPhase === 0) ? 1 : 0;
            applyConstellationPhase(nextPhase);
        }, 20000); // Alternates every 20 seconds for comfortable reading
    }
});
