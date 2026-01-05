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
    function resizeCanvas() {
        const container = canvas.parentElement;
        const maxWidth = Math.min(window.innerWidth - 40, 800);
        const maxHeight = Math.min(window.innerHeight - 200, 500);

        // Maintain aspect ratio (16:10)
        const aspectRatio = 800 / 500;
        let canvasWidth = maxWidth;
        let canvasHeight = canvasWidth / aspectRatio;

        if (canvasHeight > maxHeight) {
            canvasHeight = maxHeight;
            canvasWidth = canvasHeight * aspectRatio;
        }

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Scale game elements based on canvas size
        const scale = canvasWidth / 800;
        PADDLE_WIDTH = 10 * scale;
        PADDLE_HEIGHT = 100 * scale;
        BALL_SIZE = 15 * scale;
        paddleSpeed = 8 * scale;

        // Initialize or update paddle positions
        if (!leftPaddle) {
            leftPaddle = { x: 30 * scale, y: canvas.height / 2 - PADDLE_HEIGHT / 2, dy: 0 };
            rightPaddle = { x: canvas.width - (40 * scale), y: canvas.height / 2 - PADDLE_HEIGHT / 2, dy: 0 };
            ball = {
                x: canvas.width / 2,
                y: canvas.height / 2,
                dx: baseSpeed * scale,
                dy: baseSpeed * scale
            };
        } else {
            // Update positions proportionally when resizing
            const oldWidth = leftPaddle.x / scale;
            leftPaddle.x = 30 * scale;
            rightPaddle.x = canvas.width - (40 * scale);
        }
    }

    // Initial resize
    resizeCanvas();

    // Resize on window resize with debounce
    let resizeTimeout;
    window.addEventListener("resize", function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resizeCanvas, 100);
    });

    function update() {
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

        // Ball collision with paddles
        if (
            (ball.x <= leftPaddle.x + PADDLE_WIDTH && ball.y >= leftPaddle.y && ball.y <= leftPaddle.y + PADDLE_HEIGHT) ||
            (ball.x + BALL_SIZE >= rightPaddle.x && ball.y >= rightPaddle.y && ball.y <= rightPaddle.y + PADDLE_HEIGHT)
        ) {
            ball.dx *= -1;
        }

        // Ball out of bounds
        if (ball.x <= 0) {
            rightScore++;
            resetBall();
        }
        if (ball.x >= canvas.width) {
            leftScore++;
            resetBall();
        }
    }

    function resetBall() {
        let combinedScore = leftScore + rightScore;

        // Calculate new speed (base + increase every 5 points)
        const scale = canvas.width / 800;
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
        if (event.key === "w") leftPaddle.dy = -paddleSpeed;
        if (event.key === "s") leftPaddle.dy = paddleSpeed;
        if (event.key === "ArrowUp") rightPaddle.dy = -paddleSpeed;
        if (event.key === "ArrowDown") rightPaddle.dy = paddleSpeed;
    });

    document.addEventListener("keyup", function(event) {
        if (event.key === "w" || event.key === "s") leftPaddle.dy = 0;
        if (event.key === "ArrowUp" || event.key === "ArrowDown") rightPaddle.dy = 0;
    });

    // Touch controls for mobile
    let touchStartY = null;
    let activeTouches = new Map(); // Track multiple touches

    canvas.addEventListener("touchstart", function(event) {
        event.preventDefault();

        for (let i = 0; i < event.touches.length; i++) {
            const touch = event.touches[i];
            const rect = canvas.getBoundingClientRect();
            const touchX = touch.clientX - rect.left;
            const touchY = touch.clientY - rect.top;

            // Store touch info with identifier
            activeTouches.set(touch.identifier, {
                x: touchX,
                y: touchY,
                isLeft: touchX < canvas.width / 2
            });
        }
    });

    canvas.addEventListener("touchmove", function(event) {
        event.preventDefault();

        for (let i = 0; i < event.touches.length; i++) {
            const touch = event.touches[i];
            const rect = canvas.getBoundingClientRect();
            const touchY = touch.clientY - rect.top;

            const touchInfo = activeTouches.get(touch.identifier);
            if (touchInfo) {
                if (touchInfo.isLeft) {
                    // Control left paddle
                    leftPaddle.y = touchY - PADDLE_HEIGHT / 2;
                    leftPaddle.y = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, leftPaddle.y));
                } else {
                    // Control right paddle
                    rightPaddle.y = touchY - PADDLE_HEIGHT / 2;
                    rightPaddle.y = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, rightPaddle.y));
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