document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    // Set canvas size
    canvas.width = 800;
    canvas.height = 500;

    // Colors
    const WHITE = "#FFFFFF";
    const RED = "#FF0000";
    const BLUE = "#0000FF";
    const BLACK = "#000000";

    // Paddle and ball dimensions
    const PADDLE_WIDTH = 10;
    const PADDLE_HEIGHT = 100;
    const BALL_SIZE = 15;

    // Paddle positions
    let leftPaddle = { x: 30, y: canvas.height / 2 - PADDLE_HEIGHT / 2, dy: 0 };
    let rightPaddle = { x: canvas.width - 40, y: canvas.height / 2 - PADDLE_HEIGHT / 2, dy: 0 };

    // Scores
    let leftScore = 0;
    let rightScore = 0;

    // Base ball speed
    let baseSpeed = 3;

    // Ball position and speed
    let ball = { x: canvas.width / 2, y: canvas.height / 2, dx: baseSpeed, dy: baseSpeed };

    // Movement speed
    const paddleSpeed = 8;

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
        let newSpeed = baseSpeed + Math.floor(combinedScore / 5) * 0.5;

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

        ctx.fillStyle = WHITE;
        ctx.font = "24px Arial";
        ctx.fillText(`Player 1: ${leftScore}`, canvas.width / 4, 30);
        ctx.fillText(`Player 2: ${rightScore}`, (3 * canvas.width) / 4, 30);
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

    // Start game loop
    gameLoop();
});