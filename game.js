
// Enterprise-level Catch the Falling Stars Game
class Basket {
    constructor(canvas) {
        this.width = 80;
        this.height = 30;
        this.originalWidth = 80;  // Fixed: should match initial width
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - 60;
        this.speed = 7;
        this.expanded = false;
        this.expandTimer = 0;
        this.lightningTimer = 0;
        this.colors = [
            '#ffb347', // orange
            '#7ec850', // green
            '#4cc9f0', // blue
            '#f72585', // pink
            '#ffd166', // yellow
            '#8338ec', // purple
            '#ff006e', // magenta
            '#06d6a0'  // teal
        ];
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.skin = Math.floor(Math.random() * 3); // 0: normal, 1: rounded, 2: smiley
    }
    moveLeft() { this.x = Math.max(0, this.x - this.speed); }
    moveRight(canvas) { this.x = Math.min(canvas.width - this.width, this.x + this.speed); }
    
    expand(game) {
        this.expanded = true;
        this.expandTimer = 900; // 15 seconds at 60fps - longer duration!
        this.width = this.originalWidth * 4; // MASSIVE 400% expansion!
        this.megaExpanded = true;
        this.explosionParticles = this.createExpansionExplosion();
        
        // Play rock-style mega expansion sound
        if (game && game.playSound) {
            game.playSound('megaExpansion');
            // Trigger screen shake for dramatic effect
            game.triggerScreenShake(20, 30);
            // Trigger screen flash for mega impact
            game.triggerScreenFlash('#ffff00', 0.4, 15);
            // Also play explosion sound for the particles
            setTimeout(() => {
                if (game.playSound) game.playSound('explosion');
                game.triggerScreenShake(15, 20);
                game.triggerScreenFlash('#ff6600', 0.3, 10);
            }, 200);
        }
    }
    
    createExpansionExplosion() {
        const particles = [];
        for (let i = 0; i < 30; i++) {
            particles.push({
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                life: 60,
                maxLife: 60,
                color: `hsl(${Math.random() * 360}, 100%, 50%)`
            });
        }
        return particles;
    }
    
    update() {
        if (this.expanded) {
            this.expandTimer--;
            // Update explosion particles
            if (this.explosionParticles) {
                for (let i = this.explosionParticles.length - 1; i >= 0; i--) {
                    const p = this.explosionParticles[i];
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vx *= 0.98;
                    p.vy *= 0.98;
                    p.life--;
                    if (p.life <= 0) {
                        this.explosionParticles.splice(i, 1);
                    }
                }
            }
            
            if (this.expandTimer <= 0) {
                this.expanded = false;
                this.megaExpanded = false;
                this.width = this.originalWidth;
                this.explosionParticles = null;
            }
        }
    }
    
    draw(ctx, rainbowMode = false, game = null) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#fff';
        
        // MEGA EXPANSION EFFECTS
        if (this.megaExpanded) {
            // Massive electric glow
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 60;
            
            // Triple-layer glow effect
            for (let i = 0; i < 3; i++) {
                ctx.save();
                ctx.globalAlpha = 0.3;
                ctx.shadowBlur = 80 + (i * 20);
                ctx.shadowColor = `hsl(${120 + (Date.now() * 0.2) % 240}, 100%, 50%)`;
                ctx.fillRect(this.x - 10, this.y - 10, this.width + 20, this.height + 20);
                ctx.restore();
            }
            
            // Lightning bolts around the basket
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.8;
            
            // Trigger lightning sounds occasionally
            if (game && this.lightningTimer % 60 === 0) { // Every second
                game.playSound('lightning');
            }
            this.lightningTimer++;
            
            for (let i = 0; i < 6; i++) {
                const angle = (Date.now() * 0.01 + i) * Math.PI / 3;
                const x1 = this.x + this.width/2 + Math.cos(angle) * (this.width/2 + 20);
                const y1 = this.y + this.height/2 + Math.sin(angle) * (this.height/2 + 20);
                const x2 = this.x + this.width/2 + Math.cos(angle) * (this.width/2 + 40);
                const y2 = this.y + this.height/2 + Math.sin(angle) * (this.height/2 + 40);
                
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
        }
        
        // Rainbow effect
        if (rainbowMode) {
            const hue = (Date.now() * 0.1) % 360;
            ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
            ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
            ctx.shadowBlur = 25;
        }
        
        // Enhanced glow effect when expanded
        if (this.expanded) {
            const time = Date.now() * 0.005;
            ctx.shadowColor = `hsl(${120 + Math.sin(time) * 60}, 100%, 50%)`;
            ctx.shadowBlur = 50 + Math.sin(time * 2) * 20;
            // Intense pulsing effect
            const pulse = Math.sin(Date.now() * 0.02) * 0.3 + 0.7;
            ctx.globalAlpha = pulse;
        }
        
        if (this.skin === 0) {
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        } else if (this.skin === 1) {
            // Rounded basket
            ctx.beginPath();
            ctx.moveTo(this.x + 10, this.y);
            ctx.lineTo(this.x + this.width - 10, this.y);
            ctx.quadraticCurveTo(this.x + this.width, this.y, this.x + this.width, this.y + 10);
            ctx.lineTo(this.x + this.width, this.y + this.height - 10);
            ctx.quadraticCurveTo(this.x + this.width, this.y + this.height, this.x + this.width - 10, this.y + this.height);
            ctx.lineTo(this.x + 10, this.y + this.height);
            ctx.quadraticCurveTo(this.x, this.y + this.height, this.x, this.y + this.height - 10);
            ctx.lineTo(this.x, this.y + 10);
            ctx.quadraticCurveTo(this.x, this.y, this.x + 10, this.y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else {
            // Smiley basket
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            // Draw smiley face
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2 + 2, 10, 0, Math.PI, false);
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2 - 6, this.y + this.height / 2 - 2, 2, 0, Math.PI * 2);
            ctx.arc(this.x + this.width / 2 + 6, this.y + this.height / 2 - 2, 2, 0, Math.PI * 2);
            ctx.fillStyle = '#222';
            ctx.fill();
            ctx.lineWidth = 1;
        }
        
        // Draw expansion indicator
        if (this.expanded) {
            ctx.font = 'bold 20px Comic Sans MS';  // Bigger text
            ctx.fillStyle = '#00ff00';  // Bright green
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.textAlign = 'center';
            ctx.strokeText('SUPER WIDE!', this.x + this.width / 2, this.y - 15);
            ctx.fillText('SUPER WIDE!', this.x + this.width / 2, this.y - 15);
        }
        
        // Draw explosion particles
        if (this.explosionParticles && this.explosionParticles.length > 0) {
            this.explosionParticles.forEach(particle => {
                ctx.save();
                ctx.globalAlpha = particle.alpha;
                ctx.fillStyle = particle.color;
                ctx.shadowBlur = 15;
                ctx.shadowColor = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
        }
        
        ctx.restore();
    }
    randomizeColor() {
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.skin = Math.floor(Math.random() * 3);
    }
}

class Star {
    constructor(canvas, difficulty = 'normal') {
        this.radius = 18;
        this.x = Math.random() * (canvas.width - 2 * this.radius) + this.radius;
        this.y = -this.radius;
        
        // Difficulty-based speed
        if (difficulty === 'easy') {
            this.speed = 2 + Math.random() * 1.5;
        } else if (difficulty === 'hard') {
            this.speed = 4 + Math.random() * 3;
        } else {
            this.speed = 3 + Math.random() * 2;
        }
        
        this.colors = [
            '#ffe066', '#f72585', '#b5179e', '#7209b7', '#3a86ff', 
            '#43aa8b', '#ffbe0b', '#fb5607', '#ff006e', '#8338ec'
        ];
        
        // Difficulty-based power-up rates
        const powerupRate = difficulty === 'easy' ? 0.40 : difficulty === 'hard' ? 0.20 : 0.30;
        const r = Math.random();
        
        if (r < powerupRate * 0.15) {
            this.type = 'double';
            this.color = '#ffe066';
        } else if (r < powerupRate * 0.30) {
            this.type = 'slow';
            this.color = '#3a86ff';
        } else if (r < powerupRate * 0.45) {
            this.type = 'shield';
            this.color = '#7209b7';
        } else if (r < powerupRate * 0.60) {
            this.type = 'life';
            this.color = '#f72585';
        } else if (r < powerupRate * 0.70) {
            this.type = 'expand';
            this.color = '#43aa8b';
        } else if (r < powerupRate * 0.80) {
            this.type = 'magnet';
            this.color = '#e74c3c';
        } else if (r < powerupRate * 0.85) {
            this.type = 'freeze';
            this.color = '#74b9ff';
        } else if (r < powerupRate * 0.90) {
            this.type = 'combo';
            this.color = '#fd79a8';
        } else if (r < powerupRate * 0.95) {
            this.type = 'rainbow';
            this.color = '#ff1493';
        } else if (r < powerupRate * 0.98) {
            this.type = 'invincible';
            this.color = '#ffd700';
        } else if (r < powerupRate) {
            this.type = 'shower';
            this.color = '#9b59b6';
            this.color = '#fd79a8';
        } else {
            this.type = 'normal';
            this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
        }
    }
    update(slowMotion = false) {
        this.y += slowMotion ? this.speed * 0.4 : this.speed;
    }
    draw(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (this.type === 'double') {
            ctx.fillStyle = '#ffe066';
            ctx.shadowColor = '#ffe066';
            ctx.shadowBlur = 20;
        } else if (this.type === 'slow') {
            ctx.fillStyle = '#3a86ff';
            ctx.shadowColor = '#3a86ff';
            ctx.shadowBlur = 20;
        } else if (this.type === 'shield') {
            ctx.fillStyle = '#7209b7';
            ctx.shadowColor = '#7209b7';
            ctx.shadowBlur = 20;
        } else if (this.type === 'life') {
            ctx.fillStyle = '#f72585';
            ctx.shadowColor = '#f72585';
            ctx.shadowBlur = 20;
        } else if (this.type === 'expand') {
            ctx.fillStyle = '#43aa8b';
            ctx.shadowColor = '#43aa8b';
            ctx.shadowBlur = 20;
        } else if (this.type === 'magnet') {
            ctx.fillStyle = '#e74c3c';
            ctx.shadowColor = '#e74c3c';
            ctx.shadowBlur = 20;
        } else if (this.type === 'freeze') {
            ctx.fillStyle = '#74b9ff';
            ctx.shadowColor = '#74b9ff';
            ctx.shadowBlur = 20;
        } else if (this.type === 'combo') {
            ctx.fillStyle = '#fd79a8';
            ctx.shadowColor = '#fd79a8';
            ctx.shadowBlur = 20;
        } else if (this.type === 'rainbow') {
            ctx.fillStyle = '#ff1493';
            ctx.shadowColor = '#ff1493';
            ctx.shadowBlur = 25;
        } else if (this.type === 'invincible') {
            ctx.fillStyle = '#ffd700';
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 30;
        } else if (this.type === 'shower') {
            ctx.fillStyle = '#9b59b6';
            ctx.shadowColor = '#9b59b6';
            ctx.shadowBlur = 25;
        } else {
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
        }
        ctx.fill();
        ctx.closePath();
        ctx.shadowBlur = 0;
        ctx.restore();
        // Draw icon for powerups
        if (this.type === 'double') {
            ctx.save();
            ctx.font = 'bold 18px Comic Sans MS';
            ctx.fillStyle = '#b5179e';
            ctx.textAlign = 'center';
            ctx.fillText('2x', this.x, this.y + 6);
            ctx.restore();
        } else if (this.type === 'slow') {
            ctx.save();
            ctx.font = 'bold 18px Comic Sans MS';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText('🐢', this.x, this.y + 7);
            ctx.restore();
        } else if (this.type === 'shield') {
            ctx.save();
            ctx.font = 'bold 18px Comic Sans MS';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText('🛡️', this.x, this.y + 7);
            ctx.restore();
        } else if (this.type === 'life') {
            ctx.save();
            ctx.font = 'bold 18px Comic Sans MS';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText('❤️', this.x, this.y + 7);
            ctx.restore();
        } else if (this.type === 'expand') {
            ctx.save();
            ctx.font = 'bold 18px Comic Sans MS';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText('🎯', this.x, this.y + 7);
            ctx.restore();
        } else if (this.type === 'magnet') {
            ctx.save();
            ctx.font = 'bold 18px Comic Sans MS';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText('🧲', this.x, this.y + 7);
            ctx.restore();
        } else if (this.type === 'freeze') {
            ctx.save();
            ctx.font = 'bold 18px Comic Sans MS';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText('❄️', this.x, this.y + 7);
            ctx.restore();
        } else if (this.type === 'combo') {
            ctx.save();
            ctx.font = 'bold 18px Comic Sans MS';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText('🔥', this.x, this.y + 7);
            ctx.restore();
        } else if (this.type === 'rainbow') {
            ctx.save();
            ctx.font = 'bold 18px Comic Sans MS';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText('🌈', this.x, this.y + 7);
            ctx.restore();
        } else if (this.type === 'invincible') {
            ctx.save();
            ctx.font = 'bold 18px Comic Sans MS';
            ctx.fillStyle = '#000';
            ctx.textAlign = 'center';
            ctx.fillText('⭐', this.x, this.y + 7);
            ctx.restore();
        } else if (this.type === 'shower') {
            ctx.save();
            ctx.font = 'bold 18px Comic Sans MS';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText('🌟', this.x, this.y + 7);
            ctx.restore();
        }
    }
}

class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.initializeGame();
    }

    initializeGame() {
        this.basket = new Basket(this.canvas);
        this.stars = [];
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('highScore') || '0');
        this.gameOver = false;
        this.leftPressed = false;
        this.rightPressed = false;
        this.starTimer = 0;
        this.state = 'difficulty'; // difficulty, start, playing, paused, gameover
        this.selectedDifficulty = 'normal'; // easy, normal, hard
        this.isPaused = false;
        this.soundEnabled = localStorage.getItem('soundEnabled') !== 'false'; // default true
        this.difficultySettings = {
            easy: { starSpeed: 1.5, spawnRate: 80, powerupChance: 25, lives: 5 },
            normal: { starSpeed: 2.5, spawnRate: 60, powerupChance: 15, lives: 3 },
            hard: { starSpeed: 4, spawnRate: 40, powerupChance: 8, lives: 1 }
        };
        this.powerupActive = false;
        this.powerupTimer = 0;
        this.slowMotion = false;
        this.slowMotionTimer = 0;
        this.bgStars = this.createBackgroundStars();
        this.messages = [];
        this.lives = 3;
        this.maxLives = 5;
        this.streak = 0;
        this.shield = false;
        this.shieldTimer = 0;
        this.difficulty = 1;
        this.gameTime = 0;
        this.comboMultiplier = 1;
        this.comboTimer = 0;
        this.magnetActive = false;
        this.magnetTimer = 0;
        this.freezeActive = false;
        this.freezeTimer = 0;
        // Additional exciting features
        this.rainbowMode = false;
        this.rainbowTimer = 0;
        this.scoreMultiplierActive = false;
        this.scoreMultiplierTimer = 0;
        this.invincibilityActive = false;
        this.invincibilityTimer = 0;
        this.starShower = false;
        this.starShowerTimer = 0;
        // Screen shake effects for dramatic moments
        this.screenShake = 0;
        this.shakeX = 0;
        this.shakeY = 0;
        // Screen flash effects
        this.screenFlash = 0;
        this.flashColor = '#ffff00';
        this.flashIntensity = 0.3;
        // Sound effects - Create audio context with multiple sounds
        this.sounds = this.createSounds();
        this.initControls();
    }

    createSounds() {
        // Using different frequency tones for different sound effects
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        return {
            catch: this.createTone(audioContext, 800, 0.1, 'sine'),      // High pitch for catch
            powerup: this.createTone(audioContext, 1200, 0.15, 'triangle'), // Higher for powerup
            miss: this.createTone(audioContext, 200, 0.3, 'sawtooth'),     // Low for miss
            start: this.createTone(audioContext, 600, 0.2, 'sine'),        // Medium for start
            pause: this.createTone(audioContext, 400, 0.1, 'triangle'),    // Lower for pause
            resume: this.createTone(audioContext, 500, 0.1, 'sine'),       // Medium for resume
            gameOver: this.createTone(audioContext, 150, 0.5, 'sawtooth'), // Very low for game over
            click: this.createTone(audioContext, 1000, 0.05, 'square'),    // Quick click
            // ROCK-STYLE MEGA EXPANSION SOUNDS
            megaExpansion: this.createMegaExpansionSound(audioContext),    // Epic expansion sound
            explosion: this.createExplosionSound(audioContext),            // Explosion particles
            lightning: this.createLightningSound(audioContext)             // Lightning bolts
        };
    }

    createMegaExpansionSound(audioContext) {
        return {
            play: () => {
                if (!this.soundEnabled) return;
                
                try {
                    // Create a dramatic multi-layered expansion sound
                    const oscillator1 = audioContext.createOscillator();
                    const oscillator2 = audioContext.createOscillator();
                    const oscillator3 = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator1.connect(gainNode);
                    oscillator2.connect(gainNode);
                    oscillator3.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    // Low rumbling bass
                    oscillator1.frequency.setValueAtTime(60, audioContext.currentTime);
                    oscillator1.frequency.exponentialRampToValueAtTime(120, audioContext.currentTime + 0.8);
                    oscillator1.type = 'sawtooth';
                    
                    // Mid-range power
                    oscillator2.frequency.setValueAtTime(200, audioContext.currentTime);
                    oscillator2.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.6);
                    oscillator2.type = 'square';
                    
                    // High sparkle
                    oscillator3.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
                    oscillator3.frequency.exponentialRampToValueAtTime(1600, audioContext.currentTime + 0.8);
                    oscillator3.type = 'triangle';
                    
                    // Dramatic volume envelope
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.0);
                    
                    oscillator1.start(audioContext.currentTime);
                    oscillator2.start(audioContext.currentTime + 0.1);
                    oscillator3.start(audioContext.currentTime + 0.2);
                    
                    oscillator1.stop(audioContext.currentTime + 1.0);
                    oscillator2.stop(audioContext.currentTime + 0.8);
                    oscillator3.stop(audioContext.currentTime + 0.8);
                } catch (e) {
                    console.log('Audio not supported');
                }
            }
        };
    }

    createExplosionSound(audioContext) {
        return {
            play: () => {
                if (!this.soundEnabled) return;
                
                try {
                    // Create explosive particle burst sound
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    // Sharp explosive burst
                    oscillator.frequency.setValueAtTime(2000, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
                    oscillator.type = 'sawtooth';
                    
                    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.3);
                } catch (e) {
                    console.log('Audio not supported');
                }
            }
        };
    }

    createLightningSound(audioContext) {
        return {
            play: () => {
                if (!this.soundEnabled) return;
                
                try {
                    // Create electric crackling sound
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    // Electric crackling
                    oscillator.frequency.setValueAtTime(3000, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(6000, audioContext.currentTime + 0.1);
                    oscillator.frequency.exponentialRampToValueAtTime(1500, audioContext.currentTime + 0.2);
                    oscillator.type = 'square';
                    
                    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.2);
                } catch (e) {
                    console.log('Audio not supported');
                }
            }
        };
    }

    createTone(audioContext, frequency, duration, waveType = 'sine') {
        return {
            play: () => {
                if (!this.soundEnabled) return;
                
                try {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
                    oscillator.type = waveType;
                    
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + duration);
                } catch (e) {
                    console.log('Audio not supported');
                }
            }
        };
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem('soundEnabled', this.soundEnabled);
        this.sounds.click.play(); // Play click sound for feedback
    }

    playSound(soundName) {
        if (this.soundEnabled && this.sounds[soundName]) {
            this.sounds[soundName].play();
        }
    }

    triggerScreenShake(intensity, duration) {
        this.screenShake = Math.max(this.screenShake, duration);
        this.shakeIntensity = intensity;
    }

    triggerScreenFlash(color = '#ffff00', intensity = 0.3, duration = 10) {
        this.screenFlash = duration;
        this.flashColor = color;
        this.flashIntensity = intensity;
    }

    loadSounds() {
        // Legacy method - keeping for compatibility
        return this.sounds;
    }

    createBackgroundStars() {
        let arr = [];
        for (let i = 0; i < 60; i++) {
            arr.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                r: Math.random() * 1.5 + 0.5,
                twinkle: Math.random() * Math.PI * 2
            });
        }
        return arr;
    }

    showMessage(text, color = '#fff') {
        this.messages.push({
            text: text,
            color: color,
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            alpha: 1,
            timer: 120 // frames
        });
    }

    updateMessages() {
        for (let i = this.messages.length - 1; i >= 0; i--) {
            const msg = this.messages[i];
            msg.timer--;
            msg.alpha = msg.timer / 120;
            msg.y -= 1;
            if (msg.timer <= 0) {
                this.messages.splice(i, 1);
            }
        }
    }

    drawMessages() {
        for (const msg of this.messages) {
            this.ctx.save();
            this.ctx.globalAlpha = msg.alpha;
            this.ctx.font = 'bold 28px Comic Sans MS';
            this.ctx.fillStyle = msg.color;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(msg.text, msg.x, msg.y);
            this.ctx.restore();
        }
    }

    initControls() {
        document.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft') this.leftPressed = true;
            if (e.key === 'ArrowRight') this.rightPressed = true;
            if (e.key === ' ' && (this.state === 'start' || this.state === 'gameover')) this.startGame();
            if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
                if (this.state === 'playing') {
                    this.pauseGame();
                } else if (this.state === 'paused') {
                    this.resumeGame();
                }
            }
            if (e.key === 'm' || e.key === 'M') {
                this.toggleSound();
            }
        });
        document.addEventListener('keyup', e => {
            if (e.key === 'ArrowLeft') this.leftPressed = false;
            if (e.key === 'ArrowRight') this.rightPressed = false;
        });
        this.canvas.addEventListener('click', (e) => {
            if (this.state === 'difficulty') {
                this.handleDifficultyClick(e);
            } else if (this.state === 'start' || this.state === 'gameover') {
                this.startGame();
            } else if (this.state === 'paused') {
                this.resumeGame();
            }
        });
        
        // Touch event handling for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            
            if (this.state === 'difficulty') {
                this.handleDifficultyTouch(touch);
            } else if (this.state === 'start' || this.state === 'gameover') {
                this.startGame();
            } else if (this.state === 'paused') {
                this.resumeGame();
            } else if (this.state === 'playing') {
                // Touch control for basket movement
                const basketCenter = this.basket.x + this.basket.width / 2;
                if (x < basketCenter - 50) {
                    this.leftPressed = true;
                } else if (x > basketCenter + 50) {
                    this.rightPressed = true;
                }
            }
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.leftPressed = false;
            this.rightPressed = false;
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.state === 'playing') {
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                
                // Direct basket positioning for smoother mobile control
                const basketX = Math.max(0, Math.min(this.canvas.width - this.basket.width, x - this.basket.width / 2));
                this.basket.x = basketX;
            }
        }, { passive: false });
    }

    handleDifficultyClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const buttonY = this.canvas.height / 2 - 20;
        const buttonHeight = 60;
        const buttonWidth = 200;
        const spacing = 220;
        
        if (y >= buttonY - buttonHeight/2 && y <= buttonY + buttonHeight/2) {
            const easyX = this.canvas.width / 2 - spacing;
            const normalX = this.canvas.width / 2;
            const hardX = this.canvas.width / 2 + spacing;
            
            if (x >= easyX - buttonWidth/2 && x <= easyX + buttonWidth/2) {
                this.selectedDifficulty = 'easy';
                this.playSound('click');
                this.state = 'start';
                this.render();
            } else if (x >= normalX - buttonWidth/2 && x <= normalX + buttonWidth/2) {
                this.selectedDifficulty = 'normal';
                this.playSound('click');
                this.state = 'start';
                this.render();
            } else if (x >= hardX - buttonWidth/2 && x <= hardX + buttonWidth/2) {
                this.selectedDifficulty = 'hard';
                this.playSound('click');
                this.state = 'start';
                this.render();
            }
        }
    }

    handleDifficultyTouch(touch) {
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // Mobile vertical layout
            const buttonWidth = Math.min(this.canvas.width * 0.8, 250);
            const buttonHeight = 80;
            const buttonY = this.canvas.height / 2 - 20;
            const buttonSpacing = 100;
            
            // Check each button
            const easyY = buttonY - buttonSpacing;
            const normalY = buttonY;
            const hardY = buttonY + buttonSpacing;
            
            const leftEdge = this.canvas.width/2 - buttonWidth/2;
            const rightEdge = this.canvas.width/2 + buttonWidth/2;
            
            if (x >= leftEdge && x <= rightEdge) {
                if (y >= easyY - buttonHeight/2 && y <= easyY + buttonHeight/2) {
                    this.selectedDifficulty = 'easy';
                    this.playSound('click');
                    this.state = 'start';
                    this.render();
                } else if (y >= normalY - buttonHeight/2 && y <= normalY + buttonHeight/2) {
                    this.selectedDifficulty = 'normal';
                    this.playSound('click');
                    this.state = 'start';
                    this.render();
                } else if (y >= hardY - buttonHeight/2 && y <= hardY + buttonHeight/2) {
                    this.selectedDifficulty = 'hard';
                    this.playSound('click');
                    this.state = 'start';
                    this.render();
                }
            }
        } else {
            // Desktop horizontal layout
            const buttonY = this.canvas.height / 2 - 20;
            const buttonHeight = 60;
            const buttonWidth = 200;
            const spacing = 220;
            
            if (y >= buttonY - buttonHeight/2 && y <= buttonY + buttonHeight/2) {
                const easyX = this.canvas.width / 2 - spacing;
                const normalX = this.canvas.width / 2;
                const hardX = this.canvas.width / 2 + spacing;
                
                if (x >= easyX - buttonWidth/2 && x <= easyX + buttonWidth/2) {
                    this.selectedDifficulty = 'easy';
                    this.playSound('click');
                    this.state = 'start';
                    this.render();
                } else if (x >= normalX - buttonWidth/2 && x <= normalX + buttonWidth/2) {
                    this.selectedDifficulty = 'normal';
                    this.playSound('click');
                    this.state = 'start';
                    this.render();
                } else if (x >= hardX - buttonWidth/2 && x <= hardX + buttonWidth/2) {
                    this.selectedDifficulty = 'hard';
                    this.playSound('click');
                    this.state = 'start';
                    this.render();
                }
            }
        }
    }

    pauseGame() {
        if (this.state === 'playing') {
            this.state = 'paused';
            this.isPaused = true;
            this.playSound('pause');
        }
    }

    resumeGame() {
        if (this.state === 'paused') {
            this.state = 'playing';
            this.isPaused = false;
            this.playSound('resume');
            this.loop();
        }
    }

    togglePause() {
        if (this.state === 'playing') {
            this.pauseGame();
        } else if (this.state === 'paused') {
            this.resumeGame();
        }
    }

    startGame() {
        // Apply difficulty settings
        const settings = this.difficultySettings[this.selectedDifficulty];
        
        this.basket = new Basket(this.canvas);
        this.stars = [];
        this.score = 0;
        this.gameOver = false;
        this.starTimer = 0;
        this.powerupActive = false;
        this.powerupTimer = 0;
        this.slowMotion = false;
        this.slowMotionTimer = 0;
        this.basket.randomizeColor();
        this.messages = [];
        this.lives = settings.lives;
        this.maxLives = settings.lives + 2;
        this.streak = 0;
        this.shield = false;
        this.shieldTimer = 0;
        this.difficulty = 1;
        this.gameTime = 0;
        this.comboMultiplier = 1;
        this.comboTimer = 0;
        this.magnetActive = false;
        this.magnetTimer = 0;
        this.freezeActive = false;
        this.freezeTimer = 0;
        this.playSound('start');
        this.state = 'playing';
        this.loop();
    }

    spawnStar() {
        const star = new Star(this.canvas, this.selectedDifficulty);
        star.speed = star.speed + (this.difficulty * 0.3); // increase speed with progression
        this.stars.push(star);
    }

    updateStars() {
        for (let i = this.stars.length - 1; i >= 0; i--) {
            const star = this.stars[i];
            // Don't update star position if freeze is active
            if (!this.freezeActive) {
                star.update(this.slowMotion);
            }
            
            // Warning system - flash screen when star is about to be missed
            if (star.y > this.canvas.height - 100 && star.y < this.canvas.height - 80) {
                this.ctx.save();
                this.ctx.globalAlpha = 0.1;
                this.ctx.fillStyle = '#ff4c4c';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.restore();
            }
            
            // Check for catch
            if (
                star.y + star.radius > this.basket.y &&
                star.x > this.basket.x &&
                star.x < this.basket.x + this.basket.width
            ) {
                // Calculate score with combo multiplier
                const baseScore = (this.powerupActive ? 2 : 1) * this.comboMultiplier;
                
                if (star.type === 'double') {
                    this.playSound('powerup');
                    this.powerupActive = true;
                    this.powerupTimer = 300; // frames
                    this.score += baseScore;
                    this.streak++;
                    this.showMessage('🌟 Double Points! 🌟', '#ffe066');
                } else if (star.type === 'slow') {
                    this.playSound('powerup');
                    this.slowMotion = true;
                    this.slowMotionTimer = 300; // frames
                    this.score += baseScore;
                    this.streak++;
                    this.showMessage('🐢 Slow Motion! 🐢', '#3a86ff');
                } else if (star.type === 'shield') {
                    this.playSound('powerup');
                    this.shield = true;
                    this.shieldTimer = 600; // frames
                    this.score += baseScore;
                    this.streak++;
                    this.showMessage('🛡️ Shield Active! 🛡️', '#7209b7');
                } else if (star.type === 'life') {
                    this.playSound('powerup');
                    if (this.lives < this.maxLives) {
                        this.lives++;
                        this.showMessage('❤️ Extra Life! ❤️', '#f72585');
                    } else {
                        this.score += 5 * this.comboMultiplier; // bonus points if max lives
                        this.showMessage('💎 Bonus Points! 💎', '#f72585');
                    }
                    this.streak++;
                } else if (star.type === 'expand') {
                    this.playSound('powerup');
                    this.basket.expand(this);
                    this.score += this.powerupActive ? 2 : 1;
                    this.streak++;
                    this.showMessage('🎯 SUPER WIDE BASKET! 🎯', '#43aa8b');
                } else if (star.type === 'magnet') {
                    this.playSound('powerup');
                    this.magnetActive = true;
                    this.magnetTimer = 450; // 7.5 seconds
                    this.score += this.powerupActive ? 2 : 1;
                    this.streak++;
                    this.showMessage('🧲 MAGNET POWER! 🧲', '#e74c3c');
                } else if (star.type === 'freeze') {
                    this.playSound('powerup');
                    this.freezeActive = true;
                    this.freezeTimer = 300; // 5 seconds
                    this.score += this.powerupActive ? 2 : 1;
                    this.streak++;
                    this.showMessage('❄️ TIME FREEZE! ❄️', '#74b9ff');
                } else if (star.type === 'combo') {
                    this.playSound('powerup');
                    this.comboMultiplier = Math.min(this.comboMultiplier + 1, 5);
                    this.comboTimer = 600; // 10 seconds
                    this.score += this.powerupActive ? 2 : 1;
                    this.streak++;
                    this.showMessage(`🔥 ${this.comboMultiplier}x COMBO! 🔥`, '#fd79a8');
                } else if (star.type === 'rainbow') {
                    this.playSound('powerup');
                    this.rainbowMode = true;
                    this.rainbowTimer = 450; // 7.5 seconds
                    this.score += baseScore;
                    this.streak++;
                    this.showMessage('🌈 RAINBOW MADNESS! 🌈', '#ff1493');
                } else if (star.type === 'invincible') {
                    this.playSound('powerup');
                    this.invincibilityActive = true;
                    this.invincibilityTimer = 600; // 10 seconds
                    this.score += baseScore;
                    this.streak++;
                    this.showMessage('⭐ INVINCIBLE! ⭐', '#ffd700');
                } else if (star.type === 'shower') {
                    this.playSound('powerup');
                    this.starShower = true;
                    this.starShowerTimer = 360; // 6 seconds
                    this.score += baseScore;
                    this.streak++;
                    this.showMessage('🌟 STAR SHOWER! 🌟', '#9b59b6');
                } else {
                    this.playSound('catch'); // Normal star catch sound
                    this.score += this.powerupActive ? 2 : 1;
                    this.streak++;
                    if (this.streak % 10 === 0) {
                        this.showMessage(`🔥 ${this.streak} Streak! 🔥`, '#43aa8b');
                        this.score += this.streak; // bonus points for streak
                    } else if (this.score % 10 === 0) {
                        this.showMessage('🎉 Great Job! 🎉', '#43aa8b');
                    }
                }
                this.stars.splice(i, 1);
            } else if (star.y - star.radius > this.canvas.height) {
                // Missed star - check if protected by shield or invincibility
                if (this.shield) {
                    this.showMessage('🛡️ Shield Protected! 🛡️', '#7209b7');
                    this.playSound('catch');
                } else if (this.invincibilityActive) {
                    this.showMessage('⭐ INVINCIBLE! ⭐', '#ffd700');
                    this.playSound('catch');
                } else {
                    this.lives--;
                    this.streak = 0; // reset streak on miss
                    this.playSound('miss');
                    
                    if (this.lives > 0) {
                        this.showMessage(`💔 Life Lost! ${this.lives} Left`, '#ff4c4c');
                        this.basket.randomizeColor(); // change basket color for visual feedback
                    } else {
                        this.playSound('gameOver');
                        this.state = 'gameover';
                        if (this.score > this.highScore) {
                            this.highScore = this.score;
                            localStorage.setItem('highScore', this.highScore);
                        }
                    }
                }
                this.stars.splice(i, 1);
            }
        }
    }

    drawScore() {
        this.ctx.font = '24px Comic Sans MS';
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText('Score: ' + this.score, 20, 40);
        this.ctx.fillText('High: ' + this.highScore, 20, 70);
        
        // Draw lives
        this.ctx.fillText('Lives: ', 20, 100);
        for (let i = 0; i < this.lives; i++) {
            this.ctx.fillText('❤️', 100 + (i * 25), 100);
        }
        
        // Draw streak
        if (this.streak > 0) {
            this.ctx.font = '20px Comic Sans MS';
            this.ctx.fillStyle = '#43aa8b';
            this.ctx.fillText(`Streak: ${this.streak}`, 20, 130);
        }
        
        // Draw level and difficulty
        this.ctx.font = '20px Comic Sans MS';
        this.ctx.fillStyle = '#ffd166';
        this.ctx.fillText(`Level: ${this.difficulty}`, 20, 160);
        this.ctx.font = '16px Comic Sans MS';
        this.ctx.fillStyle = '#ccc';
        this.ctx.fillText(`Mode: ${this.selectedDifficulty.toUpperCase()}`, 20, 185);
        
        // Draw sound status
        this.ctx.font = '16px Comic Sans MS';
        this.ctx.fillStyle = this.soundEnabled ? '#4CAF50' : '#f44336';
        this.ctx.fillText(`🔊 Sound: ${this.soundEnabled ? 'ON' : 'OFF'}`, 20, 210);
        this.ctx.fillStyle = '#999';
        this.ctx.fillText('(Press M to toggle)', 150, 210);
        
        // Power-up status - right side
        let statusY = 40;
        if (this.powerupActive) {
            this.ctx.font = '18px Comic Sans MS';
            this.ctx.fillStyle = '#fff700';
            this.ctx.fillText('🌟 Double Points!', this.canvas.width - 160, statusY);
            statusY += 25;
        }
        if (this.slowMotion) {
            this.ctx.font = '18px Comic Sans MS';
            this.ctx.fillStyle = '#3a86ff';
            this.ctx.fillText('🐢 Slow Motion!', this.canvas.width - 160, statusY);
            statusY += 25;
        }
        if (this.shield) {
            this.ctx.font = '18px Comic Sans MS';
            this.ctx.fillStyle = '#7209b7';
            this.ctx.fillText('🛡️ Shield Active!', this.canvas.width - 160, statusY);
            statusY += 25;
        }
        if (this.basket.expanded) {
            this.ctx.font = '18px Comic Sans MS';
            this.ctx.fillStyle = '#43aa8b';
            this.ctx.fillText('🎯 SUPER WIDE!', this.canvas.width - 160, statusY);
            statusY += 25;
        }
        if (this.magnetActive) {
            this.ctx.font = '18px Comic Sans MS';
            this.ctx.fillStyle = '#e74c3c';
            this.ctx.fillText('🧲 Magnet Power!', this.canvas.width - 160, statusY);
            statusY += 25;
        }
        if (this.freezeActive) {
            this.ctx.font = '18px Comic Sans MS';
            this.ctx.fillStyle = '#74b9ff';
            this.ctx.fillText('❄️ Time Freeze!', this.canvas.width - 160, statusY);
            statusY += 25;
        }
        if (this.comboMultiplier > 1) {
            this.ctx.font = '18px Comic Sans MS';
            this.ctx.fillStyle = '#fd79a8';
            this.ctx.fillText(`🔥 ${this.comboMultiplier}x Combo!`, this.canvas.width - 160, statusY);
            statusY += 25;
        }
        if (this.rainbowMode) {
            this.ctx.font = '18px Comic Sans MS';
            this.ctx.fillStyle = '#ff1493';
            this.ctx.fillText('🌈 Rainbow Mode!', this.canvas.width - 160, statusY);
            statusY += 25;
        }
        if (this.invincibilityActive) {
            this.ctx.font = '18px Comic Sans MS';
            this.ctx.fillStyle = '#ffd700';
            this.ctx.fillText('⭐ Invincible!', this.canvas.width - 160, statusY);
            statusY += 25;
        }
        if (this.starShower) {
            this.ctx.font = '18px Comic Sans MS';
            this.ctx.fillStyle = '#9b59b6';
            this.ctx.fillText('🌟 Star Shower!', this.canvas.width - 160, statusY);
            statusY += 25;
        }
    }

    drawStartScreen() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBackground();
        this.ctx.font = '40px Comic Sans MS';
        this.ctx.fillStyle = '#ffe066';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Catch the Falling Stars!', this.canvas.width / 2, this.canvas.height / 2 - 100);
        
        this.ctx.font = '24px Comic Sans MS';
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText(`${this.selectedDifficulty.toUpperCase()} MODE`, this.canvas.width / 2, this.canvas.height / 2 - 60);
        
        this.ctx.font = '24px Comic Sans MS';
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText('Click or press SPACE to start', this.canvas.width / 2, this.canvas.height / 2 - 20);
        this.ctx.font = '16px Comic Sans MS';
        this.ctx.fillStyle = '#ccc';
        this.ctx.fillText('Press ESC or P to pause • Press M to toggle sound', this.canvas.width / 2, this.canvas.height / 2 + 5);
        
        // Sound status indicator
        this.ctx.font = '18px Comic Sans MS';
        this.ctx.fillStyle = this.soundEnabled ? '#4CAF50' : '#f44336';
        this.ctx.fillText(`🔊 Sound: ${this.soundEnabled ? 'ON' : 'OFF'}`, this.canvas.width / 2, this.canvas.height / 2 + 30);
        
        // Power-ups guide - smaller text for more items
        this.ctx.font = '14px Comic Sans MS';
        this.ctx.fillStyle = '#ffe066';
        this.ctx.fillText('🌟 Yellow = Double Points', this.canvas.width / 2 - 120, this.canvas.height / 2 + 60);
        this.ctx.fillStyle = '#3a86ff';
        this.ctx.fillText('🐢 Blue = Slow Motion', this.canvas.width / 2 + 120, this.canvas.height / 2 + 60);
        this.ctx.fillStyle = '#7209b7';
        this.ctx.fillText('🛡️ Purple = Shield Protection', this.canvas.width / 2 - 120, this.canvas.height / 2 + 80);
        this.ctx.fillStyle = '#f72585';
        this.ctx.fillText('❤️ Pink = Extra Life', this.canvas.width / 2 + 120, this.canvas.height / 2 + 80);
        this.ctx.fillStyle = '#43aa8b';
        this.ctx.fillText('🎯 Green = Expand Basket', this.canvas.width / 2 - 120, this.canvas.height / 2 + 100);
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillText('🧲 Red = Magnet Power', this.canvas.width / 2 + 120, this.canvas.height / 2 + 100);
        this.ctx.fillStyle = '#74b9ff';
        this.ctx.fillText('❄️ Ice Blue = Time Freeze', this.canvas.width / 2 - 120, this.canvas.height / 2 + 120);
        this.ctx.fillStyle = '#fd79a8';
        this.ctx.fillText('🔥 Hot Pink = Combo Multiplier', this.canvas.width / 2 + 120, this.canvas.height / 2 + 120);
        this.ctx.fillStyle = '#ff1493';
        this.ctx.fillText('🌈 Deep Pink = Rainbow Mode', this.canvas.width / 2 - 120, this.canvas.height / 2 + 140);
        this.ctx.fillStyle = '#ffd700';
        this.ctx.fillText('⭐ Gold = Invincible Mode', this.canvas.width / 2 + 120, this.canvas.height / 2 + 140);
        this.ctx.fillStyle = '#9b59b6';
        this.ctx.fillText('🌟 Violet = Star Shower', this.canvas.width / 2, this.canvas.height / 2 + 160);
        
        this.ctx.textAlign = 'start';
    }

    drawGameOver() {
        this.ctx.font = '48px Comic Sans MS';
        this.ctx.fillStyle = '#ff4c4c';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.font = '32px Comic Sans MS';
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText('Final Score: ' + this.score, this.canvas.width / 2, this.canvas.height / 2 + 50);
        this.ctx.font = '28px Comic Sans MS';
        this.ctx.fillStyle = '#43aa8b';
        this.ctx.fillText('High Score: ' + this.highScore, this.canvas.width / 2, this.canvas.height / 2 + 90);
        this.ctx.font = '24px Comic Sans MS';
        this.ctx.fillStyle = '#ffe066';
        this.ctx.fillText('Click or press SPACE to restart', this.canvas.width / 2, this.canvas.height / 2 + 130);
        this.ctx.textAlign = 'start';
    }

    update() {
        if (this.leftPressed) this.basket.moveLeft();
        if (this.rightPressed) this.basket.moveRight(this.canvas);
        
        // Update basket
        this.basket.update();
        
        // Update screen shake
        if (this.screenShake > 0) {
            this.shakeX = (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeY = (Math.random() - 0.5) * this.shakeIntensity;
            this.screenShake--;
        } else {
            this.shakeX = 0;
            this.shakeY = 0;
        }
        
        // Update screen flash
        if (this.screenFlash > 0) {
            this.screenFlash--;
        }
        
        // Apply magnet effect to stars
        if (this.magnetActive) {
            this.stars.forEach(star => {
                const dx = this.basket.x + this.basket.width/2 - star.x;
                const dy = this.basket.y - star.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                if (distance < 150) { // magnet range
                    star.x += dx * 0.02;
                    star.y += dy * 0.02;
                }
            });
        }
        
        this.updateStars();
        
        // Update power-up timers
        if (this.powerupActive) {
            this.powerupTimer--;
            if (this.powerupTimer <= 0) this.powerupActive = false;
        }
        if (this.slowMotion) {
            this.slowMotionTimer--;
            if (this.slowMotionTimer <= 0) this.slowMotion = false;
        }
        if (this.shield) {
            this.shieldTimer--;
            if (this.shieldTimer <= 0) this.shield = false;
        }
        if (this.magnetActive) {
            this.magnetTimer--;
            if (this.magnetTimer <= 0) this.magnetActive = false;
        }
        if (this.freezeActive) {
            this.freezeTimer--;
            if (this.freezeTimer <= 0) this.freezeActive = false;
        }
        if (this.comboMultiplier > 1) {
            this.comboTimer--;
            if (this.comboTimer <= 0) {
                this.comboMultiplier = 1;
            }
        }
        if (this.rainbowMode) {
            this.rainbowTimer--;
            if (this.rainbowTimer <= 0) this.rainbowMode = false;
        }
        if (this.invincibilityActive) {
            this.invincibilityTimer--;
            if (this.invincibilityTimer <= 0) this.invincibilityActive = false;
        }
        if (this.starShower) {
            this.starShowerTimer--;
            if (this.starShowerTimer <= 0) this.starShower = false;
        }
        
        // Difficulty progression
        this.gameTime++;
        if (this.gameTime % 1800 === 0) { // every 30 seconds at 60fps
            this.difficulty++;
            this.showMessage(`⚡ Level ${this.difficulty}! ⚡`, '#ffd166');
        }
        
        this.updateMessages();
    }

    drawBackground() {
        // Animated twinkling stars
        for (let s of this.bgStars) {
            s.twinkle += 0.02 + Math.random() * 0.01;
            let alpha = 0.5 + 0.5 * Math.sin(s.twinkle);
            this.ctx.globalAlpha = alpha;
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            this.ctx.fillStyle = '#fff';
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply screen shake effect
        this.ctx.save();
        this.ctx.translate(this.shakeX, this.shakeY);
        
        this.drawBackground();
        this.basket.draw(this.ctx, this.rainbowMode, this);
        this.stars.forEach(star => star.draw(this.ctx));
        this.drawScore();
        this.drawMessages();
        
        // Draw screen flash effect
        if (this.screenFlash > 0) {
            this.ctx.save();
            this.ctx.globalAlpha = this.flashIntensity * (this.screenFlash / 10);
            this.ctx.fillStyle = this.flashColor;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        }
        
        this.ctx.restore();
    }

    loop() {
        if (this.state === 'playing') {
            this.update();
            this.draw();
            this.starTimer++;
            
            // Difficulty-based spawn rate
            const settings = this.difficultySettings[this.selectedDifficulty];
            const baseSpawnRate = settings.spawnRate;
            const spawnRate = Math.max(15, baseSpawnRate - (this.difficulty * 2));
            
            if (this.starTimer > spawnRate) {
                this.spawnStar();
                this.starTimer = 0;
            }
            
            // Star shower effect - spawn extra stars
            if (this.starShower && Math.random() < 0.7) {
                this.spawnStar();
            }
            
            if (this.state === 'playing') {
                requestAnimationFrame(() => this.loop());
            } else {
                this.draw();
                this.drawGameOver();
            }
        }
    }

    render() {
        if (this.state === 'difficulty') {
            this.drawDifficultyScreen();
        } else if (this.state === 'start') {
            this.drawStartScreen();
        } else if (this.state === 'paused') {
            this.drawPauseScreen();
        } else if (this.state === 'gameover') {
            this.draw();
            this.drawGameOver();
        }
    }

    drawPauseScreen() {
        // Draw game background first
        this.draw();
        
        // Draw pause overlay
        this.ctx.save();
        this.ctx.globalAlpha = 0.8;
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
        
        this.ctx.font = '60px Comic Sans MS';
        this.ctx.fillStyle = '#ffe066';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        this.ctx.font = '28px Comic Sans MS';
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText('Press ESC or P to Resume', this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        this.ctx.font = '24px Comic Sans MS';
        this.ctx.fillStyle = '#ccc';
        this.ctx.fillText('Click anywhere to resume', this.canvas.width / 2, this.canvas.height / 2 + 60);
        
        this.ctx.font = '20px Comic Sans MS';
        this.ctx.fillStyle = '#999';
        this.ctx.fillText('Press M to toggle sound', this.canvas.width / 2, this.canvas.height / 2 + 90);
        
        // Sound status on pause screen
        this.ctx.font = '18px Comic Sans MS';
        this.ctx.fillStyle = this.soundEnabled ? '#4CAF50' : '#f44336';
        this.ctx.fillText(`🔊 Sound: ${this.soundEnabled ? 'ON' : 'OFF'}`, this.canvas.width / 2, this.canvas.height / 2 + 120);
        
        this.ctx.textAlign = 'start';
    }

    drawDifficultyScreen() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBackground();
        
        const isMobile = window.innerWidth <= 768;
        
        this.ctx.font = isMobile ? '28px Comic Sans MS' : '40px Comic Sans MS';
        this.ctx.fillStyle = '#ffe066';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Choose Your Challenge!', this.canvas.width / 2, this.canvas.height / 2 - 120);
        
        // Draw difficulty options - responsive sizing
        const buttonWidth = isMobile ? Math.min(this.canvas.width * 0.8, 250) : 200;
        const buttonHeight = isMobile ? 80 : 60;
        const buttonY = this.canvas.height / 2 - 20;
        
        if (isMobile) {
            // Stack buttons vertically on mobile for better touch
            const buttonSpacing = 100;
            
            // Easy button
            const easyY = buttonY - buttonSpacing;
            this.ctx.fillStyle = this.selectedDifficulty === 'easy' ? '#4CAF50' : '#2E7D32';
            this.ctx.fillRect(this.canvas.width/2 - buttonWidth/2, easyY - buttonHeight/2, buttonWidth, buttonHeight);
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(this.canvas.width/2 - buttonWidth/2, easyY - buttonHeight/2, buttonWidth, buttonHeight);
            this.ctx.font = '24px Comic Sans MS';
            this.ctx.fillStyle = '#fff';
            this.ctx.fillText('🌟 EASY', this.canvas.width/2, easyY - 5);
            this.ctx.font = '14px Comic Sans MS';
            this.ctx.fillText('5 Lives • More Power-ups', this.canvas.width/2, easyY + 20);
            
            // Normal button
            const normalY = buttonY;
            this.ctx.fillStyle = this.selectedDifficulty === 'normal' ? '#FF9800' : '#F57C00';
            this.ctx.fillRect(this.canvas.width/2 - buttonWidth/2, normalY - buttonHeight/2, buttonWidth, buttonHeight);
            this.ctx.strokeRect(this.canvas.width/2 - buttonWidth/2, normalY - buttonHeight/2, buttonWidth, buttonHeight);
            this.ctx.font = '24px Comic Sans MS';
            this.ctx.fillStyle = '#fff';
            this.ctx.fillText('⚡ NORMAL', this.canvas.width/2, normalY - 5);
            this.ctx.font = '14px Comic Sans MS';
            this.ctx.fillText('3 Lives • Balanced', this.canvas.width/2, normalY + 20);
            
            // Hard button
            const hardY = buttonY + buttonSpacing;
            this.ctx.fillStyle = this.selectedDifficulty === 'hard' ? '#F44336' : '#C62828';
            this.ctx.fillRect(this.canvas.width/2 - buttonWidth/2, hardY - buttonHeight/2, buttonWidth, buttonHeight);
            this.ctx.strokeRect(this.canvas.width/2 - buttonWidth/2, hardY - buttonHeight/2, buttonWidth, buttonHeight);
            this.ctx.font = '24px Comic Sans MS';
            this.ctx.fillStyle = '#fff';
            this.ctx.fillText('🔥 HARD', this.canvas.width/2, hardY - 5);
            this.ctx.font = '14px Comic Sans MS';
            this.ctx.fillText('1 Life • Fast & Furious', this.canvas.width/2, hardY + 20);
            
            this.ctx.font = '18px Comic Sans MS';
            this.ctx.fillStyle = '#fff';
            this.ctx.fillText('Tap a difficulty to continue!', this.canvas.width / 2, this.canvas.height / 2 + 150);
        } else {
            // Horizontal layout for desktop
            const spacing = 220;
            
            // Easy button
            const easyX = this.canvas.width / 2 - spacing;
            this.ctx.fillStyle = this.selectedDifficulty === 'easy' ? '#4CAF50' : '#2E7D32';
            this.ctx.fillRect(easyX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight);
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(easyX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight);
            this.ctx.font = '28px Comic Sans MS';
            this.ctx.fillStyle = '#fff';
            this.ctx.fillText('🌟 EASY', easyX, buttonY - 10);
            this.ctx.font = '16px Comic Sans MS';
            this.ctx.fillText('5 Lives • More Power-ups', easyX, buttonY + 15);
            
            // Normal button
            const normalX = this.canvas.width / 2;
            this.ctx.fillStyle = this.selectedDifficulty === 'normal' ? '#FF9800' : '#F57C00';
            this.ctx.fillRect(normalX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight);
            this.ctx.strokeRect(normalX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight);
            this.ctx.font = '28px Comic Sans MS';
            this.ctx.fillStyle = '#fff';
            this.ctx.fillText('⚡ NORMAL', normalX, buttonY - 10);
            this.ctx.font = '16px Comic Sans MS';
            this.ctx.fillText('3 Lives • Balanced', normalX, buttonY + 15);
            
            // Hard button
            const hardX = this.canvas.width / 2 + spacing;
            this.ctx.fillStyle = this.selectedDifficulty === 'hard' ? '#F44336' : '#C62828';
            this.ctx.fillRect(hardX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight);
            this.ctx.strokeRect(hardX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight);
            this.ctx.font = '28px Comic Sans MS';
            this.ctx.fillStyle = '#fff';
            this.ctx.fillText('🔥 HARD', hardX, buttonY - 10);
            this.ctx.font = '16px Comic Sans MS';
            this.ctx.fillText('1 Life • Fast & Furious', hardX, buttonY + 15);
            
            this.ctx.font = '24px Comic Sans MS';
            this.ctx.fillStyle = '#fff';
            this.ctx.fillText('Click a difficulty to continue!', this.canvas.width / 2, this.canvas.height / 2 + 80);
        }
        
        this.ctx.textAlign = 'start';
    }
}

// Initialize game - game variable is declared in index.html
function initializeGame() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    game = new Game(canvas, ctx);
    window.game = game; // Make globally accessible for resize
    game.render();
}

// Wait for canvas to be properly sized before initializing game
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeGame, 100); // Small delay to ensure canvas is resized
    });
} else {
    setTimeout(initializeGame, 100);
}

// Handle window resize - reinitialize game with new canvas dimensions
window.addEventListener('resize', () => {
    if (game) {
        setTimeout(() => {
            game.canvas = document.getElementById('gameCanvas');
            game.ctx = game.canvas.getContext('2d');
            game.basket = new Basket(game.canvas);
            game.bgStars = game.createBackgroundStars();
        }, 100);
    }
});
