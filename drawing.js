// Magic Drawing Board - Enterprise-level Drawing Game for Kids
class DrawingApp {
    constructor() {
        this.canvas = document.getElementById('drawingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.currentTool = 'brush';
        this.currentColor = '#ff0000';
        this.brushSize = 10;
        this.lastX = 0;
        this.lastY = 0;
        this.rainbowHue = 0;
        this.stamps = ['⭐', '🌟', '💫', '🎈', '🌈', '🦄', '🎀', '🌸', '🍭', '🎪'];
        this.currentStamp = 0;
        this.magicMode = false;
        this.particles = [];
        
        this.resizeCanvas();
        this.initializeEventListeners();
        this.setupCanvas();
        this.animate();
        
        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const maxWidth = Math.min(window.innerWidth * 0.9, 800);
        const maxHeight = Math.min(window.innerHeight * 0.6, 600);
        
        // Save current drawing if canvas exists
        let imageData = null;
        if (this.canvas.width > 0) {
            imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        }
        
        this.canvas.width = maxWidth;
        this.canvas.height = maxHeight;
        
        // Restore drawing if it existed
        if (imageData) {
            this.ctx.putImageData(imageData, 0, 0);
        } else {
            this.setupCanvas();
        }
    }

    setupCanvas() {
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        // Set canvas background to white
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    initializeEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', this.handleTouch.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouch.bind(this));
        this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));

        // Tool selection
        document.querySelectorAll('[data-tool]').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectTool(e.target.dataset.tool, e.target));
        });

        // Color pickers
        document.querySelectorAll('.color-picker').forEach(picker => {
            picker.addEventListener('change', (e) => this.currentColor = e.target.value);
            picker.addEventListener('click', (e) => this.currentColor = e.target.value);
        });

        // Brush size
        const sizeSlider = document.getElementById('brushSize');
        const sizeDisplay = document.getElementById('sizeDisplay');
        sizeSlider.addEventListener('input', (e) => {
            this.brushSize = e.target.value;
            sizeDisplay.textContent = e.target.value + 'px';
        });

        // Action buttons
        document.getElementById('clearBtn').addEventListener('click', this.clearCanvas.bind(this));
        document.getElementById('saveBtn').addEventListener('click', this.saveDrawing.bind(this));
        document.getElementById('stampBtn').addEventListener('click', this.cycleStamp.bind(this));
        document.getElementById('magicBtn').addEventListener('click', this.toggleMagic.bind(this));
    }

    handleTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        if (e.type === 'touchstart') {
            this.startDrawing({ offsetX: x, offsetY: y });
        } else if (e.type === 'touchmove') {
            this.draw({ offsetX: x, offsetY: y });
        }
    }

    selectTool(tool, button) {
        // Remove active class from all buttons
        document.querySelectorAll('[data-tool]').forEach(btn => btn.classList.remove('active'));
        // Add active class to selected button
        button.classList.add('active');
        this.currentTool = tool;
        
        // Change cursor based on tool
        if (tool === 'eraser') {
            this.canvas.style.cursor = 'grab';
        } else {
            this.canvas.style.cursor = 'crosshair';
        }
    }

    startDrawing(e) {
        this.isDrawing = true;
        this.lastX = e.offsetX;
        this.lastY = e.offsetY;
        
        if (this.currentTool === 'stamp') {
            this.placeStamp(e.offsetX, e.offsetY);
        }
    }

    draw(e) {
        if (!this.isDrawing) return;

        const currentX = e.offsetX;
        const currentY = e.offsetY;

        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(currentX, currentY);

        switch (this.currentTool) {
            case 'brush':
                this.drawNormal();
                break;
            case 'rainbow':
                this.drawRainbow();
                break;
            case 'glitter':
                this.drawGlitter(currentX, currentY);
                break;
            case 'eraser':
                this.erase();
                break;
        }

        this.ctx.stroke();

        // Add magic particles if magic mode is on
        if (this.magicMode) {
            this.addMagicParticles(currentX, currentY);
        }

        // Add sparkle effects
        this.addSparkles(currentX, currentY);

        this.lastX = currentX;
        this.lastY = currentY;
    }

    drawNormal() {
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.brushSize;
    }

    drawRainbow() {
        this.ctx.globalCompositeOperation = 'source-over';
        this.rainbowHue += 2;
        this.ctx.strokeStyle = `hsl(${this.rainbowHue % 360}, 100%, 50%)`;
        this.ctx.lineWidth = this.brushSize;
    }

    drawGlitter(x, y) {
        this.ctx.globalCompositeOperation = 'source-over';
        
        // Main stroke
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.brushSize;
        
        // Add glitter particles
        for (let i = 0; i < 5; i++) {
            const glitterX = x + (Math.random() - 0.5) * this.brushSize * 2;
            const glitterY = y + (Math.random() - 0.5) * this.brushSize * 2;
            const glitterSize = Math.random() * 3 + 1;
            
            this.ctx.save();
            this.ctx.fillStyle = ['#ffd700', '#ffff00', '#ff69b4', '#00ffff', '#ff1493'][Math.floor(Math.random() * 5)];
            this.ctx.beginPath();
            this.ctx.arc(glitterX, glitterY, glitterSize, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }

    erase() {
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.lineWidth = this.brushSize;
    }

    addSparkles(x, y) {
        if (Math.random() < 0.3) { // 30% chance to add sparkle
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = (x + this.canvas.offsetLeft) + 'px';
            sparkle.style.top = (y + this.canvas.offsetTop) + 'px';
            sparkle.style.background = ['gold', 'silver', '#ff69b4', '#00ffff'][Math.floor(Math.random() * 4)];
            document.body.appendChild(sparkle);
            
            setTimeout(() => sparkle.remove(), 1000);
        }
    }

    addMagicParticles(x, y) {
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 60,
                maxLife: 60,
                color: `hsl(${Math.random() * 360}, 100%, 50%)`
            });
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            this.ctx.save();
            this.ctx.globalAlpha = p.life / p.maxLife;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }

    placeStamp(x, y) {
        this.ctx.font = `${this.brushSize * 3}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.stamps[this.currentStamp], x, y);
    }

    cycleStamp() {
        this.currentStamp = (this.currentStamp + 1) % this.stamps.length;
        this.currentTool = 'stamp';
        // Update button states
        document.querySelectorAll('[data-tool]').forEach(btn => btn.classList.remove('active'));
        document.getElementById('stampBtn').style.background = 'linear-gradient(45deg, #4ecdc4, #44a08d)';
        setTimeout(() => {
            document.getElementById('stampBtn').style.background = '';
        }, 200);
    }

    toggleMagic() {
        this.magicMode = !this.magicMode;
        const btn = document.getElementById('magicBtn');
        if (this.magicMode) {
            btn.style.background = 'linear-gradient(45deg, #ff6b9d, #c44569)';
            btn.textContent = '🔮 Magic ON';
        } else {
            btn.style.background = '';
            btn.textContent = '✨ Magic';
        }
    }

    clearCanvas() {
        // Fun clear animation
        const clearBtn = document.getElementById('clearBtn');
        clearBtn.textContent = '🌪️ Clearing...';
        
        // Spiral clear effect
        let radius = 0;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        const clearAnimation = () => {
            if (radius < Math.max(this.canvas.width, this.canvas.height)) {
                this.ctx.save();
                this.ctx.globalCompositeOperation = 'destination-out';
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
                
                radius += 20;
                requestAnimationFrame(clearAnimation);
            } else {
                // Reset canvas
                this.ctx.fillStyle = 'white';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                clearBtn.textContent = '🗑️ Clear';
            }
        };
        
        clearAnimation();
    }

    saveDrawing() {
        const link = document.createElement('a');
        link.download = 'my-awesome-drawing.png';
        link.href = this.canvas.toDataURL();
        link.click();
        
        // Fun save feedback
        const saveBtn = document.getElementById('saveBtn');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = '✅ Saved!';
        saveBtn.style.background = 'linear-gradient(45deg, #2ecc71, #27ae60)';
        
        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.style.background = '';
        }, 2000);
    }

    stopDrawing() {
        this.isDrawing = false;
    }

    animate() {
        this.updateParticles();
        requestAnimationFrame(this.animate.bind(this));
    }
}

// Initialize the drawing app when page loads
document.addEventListener('DOMContentLoaded', () => {
    new DrawingApp();
    
    // Add some welcome sparkles
    setTimeout(() => {
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.className = 'sparkle';
                sparkle.style.left = Math.random() * window.innerWidth + 'px';
                sparkle.style.top = Math.random() * window.innerHeight + 'px';
                sparkle.style.background = ['gold', 'silver', '#ff69b4', '#00ffff'][Math.floor(Math.random() * 4)];
                document.body.appendChild(sparkle);
                
                setTimeout(() => sparkle.remove(), 1000);
            }, i * 100);
        }
    }, 500);
});

// Add some fun keyboard shortcuts
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'c':
        case 'C':
            if (e.ctrlKey) return; // Don't interfere with Ctrl+C
            document.getElementById('clearBtn').click();
            break;
        case 's':
        case 'S':
            if (e.ctrlKey) {
                e.preventDefault();
                document.getElementById('saveBtn').click();
            }
            break;
        case 'm':
        case 'M':
            document.getElementById('magicBtn').click();
            break;
        case ' ':
            e.preventDefault();
            document.getElementById('stampBtn').click();
            break;
    }
});
