document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    // Colors
    const WHITE = "#FFFFFF";
    const RED = "#FF0000";
    const BLUE = "#0000FF";
    const BLACK = "#000000";

    // Scores
    let leftScore = 0;
    let rightScore = 0;

    // Base ball speed (will be scaled)
    let baseSpeed = 3;

    // Game objects (will be initialized after canvas sizing)
    let leftPaddle, rightPaddle, ball;
    let PADDLE_WIDTH, PADDLE_HEIGHT, BALL_SIZE, paddleSpeed;

    // Function to resize canvas and scale game elements
    let lastScale = null;
    let lastCanvasWidth = null;
    let lastCanvasHeight = null;

    function resizeCanvas() {
        const isLandscape = window.innerWidth > window.innerHeight;

        // Set a logical base size depending on orientation
        const baseWidth = isLandscape ? 800 : 500;
        const baseHeight = isLandscape ? 500 : 800;

        const paddingX = 40;
        const paddingY = 200;

        const maxWidth = Math.min(window.innerWidth - paddingX, baseWidth);
        const maxHeight = Math.min(window.innerHeight - (isLandscape ? 200 : 120), baseHeight);

        // Calculate canvas size maintaining base aspect ratio
        const aspectRatio = baseWidth / baseHeight;
        let canvasWidth = maxWidth;
        let canvasHeight = canvasWidth / aspectRatio;

        if (canvasHeight > maxHeight) {
            canvasHeight = maxHeight;
            canvasWidth = canvasHeight * aspectRatio;
        }

        // Toggle body class for CSS if needed
        document.body.classList.toggle('landscape', isLandscape);
        document.body.classList.toggle('portrait', !isLandscape);

        // Preserve old dimensions to proportionally move elements
        const oldWidth = lastCanvasWidth || canvas.width || baseWidth;
        const oldHeight = lastCanvasHeight || canvas.height || baseHeight;

        // Compute new scale
        const scale = canvasWidth / baseWidth;

        // Update canvas size
        canvas.width = Math.round(canvasWidth);
        canvas.height = Math.round(canvasHeight);

        // Compute sizes for game elements (swap in portrait)
        if (isLandscape) {
            PADDLE_WIDTH = 10 * scale;
            PADDLE_HEIGHT = 100 * scale;
        } else {
            // horizontal paddles for portrait (top/bottom)
            PADDLE_WIDTH = 100 * scale;
            PADDLE_HEIGHT = 10 * scale;
        }
        BALL_SIZE = 15 * scale;
        paddleSpeed = 8 * scale;

        if (!leftPaddle) {
            // Initial positions
            if (isLandscape) {
                leftPaddle = { x: 30 * scale, y: canvas.height / 2 - PADDLE_HEIGHT / 2, dy: 0 };
                rightPaddle = { x: canvas.width - (40 * scale), y: canvas.height / 2 - PADDLE_HEIGHT / 2, dy: 0 };
            } else {
                // portrait: player1 top, player2 bottom (paddles move horizontally)
                leftPaddle = { x: canvas.width / 2 - PADDLE_WIDTH / 2, y: 30 * scale, dx: 0 };
                rightPaddle = { x: canvas.width / 2 - PADDLE_WIDTH / 2, y: canvas.height - (40 * scale) - PADDLE_HEIGHT, dx: 0 };
            }
            ball = {
                x: canvas.width / 2,
                y: canvas.height / 2,
                dx: baseSpeed * scale,
                dy: baseSpeed * scale
            };
        } else {
            // Preserve relative positions and directions when resizing
            const leftRatioY = leftPaddle.y / oldHeight;
            const rightRatioY = rightPaddle.y / oldHeight;
            const ballRatioX = ball.x / oldWidth;
            const ballRatioY = ball.y / oldHeight;

            if (isLandscape) {
                leftPaddle.x = 30 * scale;
                rightPaddle.x = canvas.width - (40 * scale);
                leftPaddle.y = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, leftRatioY * canvas.height));
                rightPaddle.y = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, rightRatioY * canvas.height));
            } else {
                // preserve horizontal positions as ratios
                const leftRatioX = leftPaddle.x / oldWidth;
                const rightRatioX = rightPaddle.x / oldWidth;
                leftPaddle.x = Math.max(0, Math.min(canvas.width - PADDLE_WIDTH, leftRatioX * canvas.width));
                rightPaddle.x = Math.max(0, Math.min(canvas.width - PADDLE_WIDTH, rightRatioX * canvas.width));
                leftPaddle.y = 30 * scale;
                rightPaddle.y = canvas.height - (40 * scale) - PADDLE_HEIGHT;
            }

            ball.x = Math.max(BALL_SIZE / 2, Math.min(canvas.width - BALL_SIZE / 2, ballRatioX * canvas.width));
            ball.y = Math.max(BALL_SIZE / 2, Math.min(canvas.height - BALL_SIZE / 2, ballRatioY * canvas.height));

            // Recompute velocities keeping direction but adjusting magnitude to new scale
            const speedMagnitude = (baseSpeed + Math.floor((leftScore + rightScore) / 5) * 0.5) * scale;
            ball.dx = (ball.dx >= 0 ? 1 : -1) * Math.abs(speedMagnitude);
            ball.dy = (ball.dy >= 0 ? 1 : -1) * Math.abs(speedMagnitude);
        }

        lastScale = scale;
        lastCanvasWidth = canvas.width;
        lastCanvasHeight = canvas.height;
    }

    // Initial resize
    resizeCanvas();

    // Resize on window resize with debounce
    let resizeTimeout;
    window.addEventListener("resize", function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resizeCanvas, 100);
    });

    // Also handle orientation changes on mobile devices
    window.addEventListener('orientationchange', function() {
        // small delay to allow layout to settle
        setTimeout(resizeCanvas, 150);
    });

    function update() {
        const isLandscape = canvas.width > canvas.height;

        if (isLandscape) {
            // Vertical paddles (left/right) behavior
            leftPaddle.y += leftPaddle.dy;
            rightPaddle.y += rightPaddle.dy;

            // Keep paddles inside canvas
            leftPaddle.y = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, leftPaddle.y));
            rightPaddle.y = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, rightPaddle.y));

            // Move ball
            ball.x += ball.dx;
            ball.y += ball.dy;

            // Ball collision with top/bottom
            if (ball.y <= 0 || ball.y + BALL_SIZE >= canvas.height) {
                ball.dy *= -1;
            }

            // Ball collision with vertical paddles
            if (
                (ball.x <= leftPaddle.x + PADDLE_WIDTH && ball.y + BALL_SIZE >= leftPaddle.y && ball.y <= leftPaddle.y + PADDLE_HEIGHT) ||
                (ball.x + BALL_SIZE >= rightPaddle.x && ball.y + BALL_SIZE >= rightPaddle.y && ball.y <= rightPaddle.y + PADDLE_HEIGHT)
            ) {
                ball.dx *= -1;
            }

            // Ball out of bounds (left/right)
            if (ball.x <= 0) {
                rightScore++;
                resetBall();
            }
            if (ball.x + BALL_SIZE >= canvas.width) {
                leftScore++;
                resetBall();
            }
        } else {
            // Portrait: paddles are top (player1) and bottom (player2), move horizontally
            leftPaddle.x += (leftPaddle.dx || 0);
            rightPaddle.x += (rightPaddle.dx || 0);

            // Keep paddles inside canvas horizontally
            leftPaddle.x = Math.max(0, Math.min(canvas.width - PADDLE_WIDTH, leftPaddle.x));
            rightPaddle.x = Math.max(0, Math.min(canvas.width - PADDLE_WIDTH, rightPaddle.x));

            // Move ball
            ball.x += ball.dx;
            ball.y += ball.dy;

            // Ball collision with left/right walls
            if (ball.x <= 0 || ball.x + BALL_SIZE >= canvas.width) {
                ball.dx *= -1;
            }

            // Ball collision with horizontal paddles (top/bottom)
            if (
                (ball.y <= leftPaddle.y + PADDLE_HEIGHT && ball.x + BALL_SIZE >= leftPaddle.x && ball.x <= leftPaddle.x + PADDLE_WIDTH) ||
                (ball.y + BALL_SIZE >= rightPaddle.y && ball.x + BALL_SIZE >= rightPaddle.x && ball.x <= rightPaddle.x + PADDLE_WIDTH)
            ) {
                ball.dy *= -1;
            }

            // Ball out of bounds (top/bottom) — top is player1, bottom is player2
            if (ball.y <= 0) {
                // ball left through top: player2 (bottom) scores
                rightScore++;
                resetBall();
            }
            if (ball.y + BALL_SIZE >= canvas.height) {
                // ball left through bottom: player1 (top) scores
                leftScore++;
                resetBall();
            }
        }
    }

    function resetBall() {
        let combinedScore = leftScore + rightScore;
        // Calculate new speed (base + increase every 5 points), use lastScale when available
        const scale = lastScale || (canvas.width / 800);
        let newSpeed = (baseSpeed + Math.floor(combinedScore / 5) * 0.5) * scale;

        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;

        // Maintain direction while increasing speed
        ball.dx = (ball.dx > 0 ? 1 : -1) * newSpeed;
        ball.dy = (ball.dy > 0 ? 1 : -1) * newSpeed;
    }

    function draw() {
        ctx.fillStyle = BLACK;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = RED;
        ctx.fillRect(leftPaddle.x, leftPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
        ctx.fillStyle = BLUE;
        ctx.fillRect(rightPaddle.x, rightPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);

        ctx.fillStyle = WHITE;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();

        // Scale font size based on canvas width
        const fontSize = Math.max(16, canvas.width / 33);
        ctx.fillStyle = WHITE;
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`Player 1: ${leftScore}`, canvas.width / 4, fontSize + 10);
        ctx.fillText(`Player 2: ${rightScore}`, (3 * canvas.width) / 4, fontSize + 10);
    }

    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    document.addEventListener("keydown", function(event) {
        const isLandscape = canvas.width > canvas.height;
        if (isLandscape) {
            if (event.key === "w") leftPaddle.dy = -paddleSpeed;
            if (event.key === "s") leftPaddle.dy = paddleSpeed;
            if (event.key === "ArrowUp") rightPaddle.dy = -paddleSpeed;
            if (event.key === "ArrowDown") rightPaddle.dy = paddleSpeed;
        } else {
            // portrait: horizontal paddles — use A/D and ArrowLeft/ArrowRight
            if (event.key === "a") leftPaddle.dx = -paddleSpeed;
            if (event.key === "d") leftPaddle.dx = paddleSpeed;
            if (event.key === "ArrowLeft") rightPaddle.dx = -paddleSpeed;
            if (event.key === "ArrowRight") rightPaddle.dx = paddleSpeed;
        }
    });

    document.addEventListener("keyup", function(event) {
        const isLandscape = canvas.width > canvas.height;
        if (isLandscape) {
            if (event.key === "w" || event.key === "s") leftPaddle.dy = 0;
            if (event.key === "ArrowUp" || event.key === "ArrowDown") rightPaddle.dy = 0;
        } else {
            if (event.key === "a" || event.key === "d") leftPaddle.dx = 0;
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") rightPaddle.dx = 0;
        }
    });

    // Touch controls for mobile
    let touchStartY = null;
    let activeTouches = new Map(); // Track multiple touches

    canvas.addEventListener("touchstart", function(event) {
        event.preventDefault();
        const isLandscape = canvas.width > canvas.height;
        for (let i = 0; i < event.touches.length; i++) {
            const touch = event.touches[i];
            const rect = canvas.getBoundingClientRect();
            const touchX = touch.clientX - rect.left;
            const touchY = touch.clientY - rect.top;

            // Store touch info with identifier
            if (isLandscape) {
                activeTouches.set(touch.identifier, {
                    x: touchX,
                    y: touchY,
                    isLeft: touchX < canvas.width / 2
                });
            } else {
                // portrait: top/bottom control
                activeTouches.set(touch.identifier, {
                    x: touchX,
                    y: touchY,
                    isTop: touchY < canvas.height / 2
                });
            }
        }
    });

    canvas.addEventListener("touchmove", function(event) {
        event.preventDefault();
        const isLandscape = canvas.width > canvas.height;
        for (let i = 0; i < event.touches.length; i++) {
            const touch = event.touches[i];
            const rect = canvas.getBoundingClientRect();
            const touchX = touch.clientX - rect.left;
            const touchY = touch.clientY - rect.top;

            const touchInfo = activeTouches.get(touch.identifier);
            if (touchInfo) {
                if (isLandscape) {
                    if (touchInfo.isLeft) {
                        // Control left paddle (vertical)
                        leftPaddle.y = touchY - PADDLE_HEIGHT / 2;
                        leftPaddle.y = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, leftPaddle.y));
                    } else {
                        // Control right paddle (vertical)
                        rightPaddle.y = touchY - PADDLE_HEIGHT / 2;
                        rightPaddle.y = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, rightPaddle.y));
                    }
                } else {
                    if (touchInfo.isTop) {
                        // Control top paddle (horizontal)
                        leftPaddle.x = touchX - PADDLE_WIDTH / 2;
                        leftPaddle.x = Math.max(0, Math.min(canvas.width - PADDLE_WIDTH, leftPaddle.x));
                    } else {
                        // Control bottom paddle (horizontal)
                        rightPaddle.x = touchX - PADDLE_WIDTH / 2;
                        rightPaddle.x = Math.max(0, Math.min(canvas.width - PADDLE_WIDTH, rightPaddle.x));
                    }
                }
            }
        }
    });

    canvas.addEventListener("touchend", function(event) {
        event.preventDefault();

        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            activeTouches.delete(touch.identifier);
        }
    });

    canvas.addEventListener("touchcancel", function(event) {
        event.preventDefault();

        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            activeTouches.delete(touch.identifier);
        }
    });

    // Start game loop
    gameLoop();
});