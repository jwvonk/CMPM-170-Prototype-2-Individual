title = "TRAPPED HERE WITH ME";

description =
`
Dash Through Enemies
     to Survive
`;

characters = [
`
g Y gg
g Yg  
 gyyYY
YYyyg 
  gY g
gg Y g
`,
  `
  r r 
rr  r
     r
r     
 r  rr
 r r  
`,
];

const G = {
  WIDTH: 144,
  HEIGHT: 96,
  ENEMY_SPEED: 1,
  PLAYER_BASE_SPEED: 1,
  DASH_COOLDOWN: 0,
  MIN_X: 3,
  MIN_Y: 3,
  MAX_X: 141,
  MAX_Y: 93,
  TELEPORT_DIST: 30,

  TL: 0,
  TR: 1,
  BL: 2,
  BR: 3,
  L: 4,
  R: 5,
  T: 6,
  B: 7,
  N: 8,
};

options = {
  viewSize: { x: G.WIDTH, y: G.HEIGHT },
  theme: "dark",
  isReplayEnabled: true,
};

/**
 * @typedef {{
 * pos: Vector,
 * target: Vector,
 * dashCooldown: number,
 * speed: number,
 * isMovingLeft: boolean,
 * isMovingUp: boolean,
 * }} Player
 */

/**
 * @type { Player }
 */
let player; 

/**
 * @typedef {{
 * pos: Vector
 * isMovingLeft: boolean,
 * isMovingUp: boolean,
 * }} Enemy
 */

/**
 * @type { Enemy [] }
 */
let enemies;

function update() {
  if (!ticks) {
    player = {
      pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
      target: vec(),
      dashCooldown: G.DASH_COOLDOWN,
      speed: G.PLAYER_BASE_SPEED,
      isMovingLeft: false,
      isMovingUp: false,
    };

    enemies = [];
  }

  if (enemies.length < difficulty * 3 - 1) {
      let pos = vec();
      do {
        pos.set(rnd(G.MIN_X, G.MAX_X), rnd(G.MIN_Y, G.MAX_Y));
      } while (pos.distanceTo(player.pos) < 30);
      enemies.push({ pos, isMovingLeft: rnd() > 0.5, isMovingUp: rnd() > 0.5 });
    }

  player.pos.add(
    player.isMovingLeft ? -player.speed : player.speed,
    player.isMovingUp ? -player.speed : player.speed
  );

  player.dashCooldown--;

  if (input.isJustPressed && player.dashCooldown <= 0) {
    color ("light_green");
    particle(player.pos, undefined, .5);
    LineToTarget(player);
    player.pos.add(
      player.isMovingLeft ? -G.TELEPORT_DIST : G.TELEPORT_DIST,
      player.isMovingUp ? -G.TELEPORT_DIST : G.TELEPORT_DIST
    );
    player.dashCooldown = G.DASH_COOLDOWN;
    play("laser");
  }

  Bounce(player);
  AdjustPos(player.pos);

  player.target.x = player.isMovingLeft
    ? player.pos.x - G.TELEPORT_DIST
    : player.pos.x + G.TELEPORT_DIST;
  player.target.y = player.isMovingUp
    ? player.pos.y - G.TELEPORT_DIST
    : player.pos.y + G.TELEPORT_DIST;

  AdjustPos(player.target);

  color("light_yellow");
  box(player.target, 1);

  remove(enemies, (e) => {
    e.pos.add(
      e.isMovingLeft ? -G.ENEMY_SPEED * 2 : G.ENEMY_SPEED * 2,
      e.isMovingUp ? -G.ENEMY_SPEED : G.ENEMY_SPEED
    );

    Bounce(e);
    AdjustPos(e.pos);

    color("black");
    const isCollidingWithLine = char("b", e.pos).isColliding.rect.yellow;

    if (isCollidingWithLine) {
      color("yellow");
      particle(e.pos);
      play("explosion");
      addScore(enemies.length, e.pos)
    }

    return isCollidingWithLine;
  });

  color("black");
  const isCollidingWithEnemy = char("a", player.pos).isColliding.char.b;
  if (isCollidingWithEnemy) {
    end();
  }
}

/**
 * @param {Vector} pos
 */
function GetOOB(pos) {
  if (pos.x < G.MIN_X && pos.y < G.MIN_Y) {
    return G.TL;
  } else if (pos.x < G.MIN_X && pos.y > G.MAX_Y) {
    return G.BL;
  } else if (pos.x > G.MAX_X && pos.y < G.MIN_Y) {
    return G.TR;
  } else if (pos.x > G.MAX_X && pos.y > G.MAX_Y) {
    return G.BR;
  } else if (pos.x < G.MIN_X) {
    return G.L;
  } else if (pos.x > G.MAX_X) {
    return G.R;
  } else if (pos.y < G.MIN_Y) {
    return G.T;
  } else if (pos.y > G.MAX_Y) {
    return G.B;
  } else {
    return G.N;
  }
}

/**
 * @param {Player} player
 */
function LineToTarget(player) {
  const copy = { ...player };
  let xOff = copy.isMovingLeft ? -G.TELEPORT_DIST : G.TELEPORT_DIST;
  let yOff = copy.isMovingUp ? -G.TELEPORT_DIST : G.TELEPORT_DIST;

  let oob = GetOOB(vec(copy.pos.x + xOff, copy.pos.y + yOff));
  let p1 = vec(copy.pos.x + xOff, copy.pos.y + yOff);
  let p2;
  let off;
  color("yellow");
  switch (oob) {
    case G.TL:
      p2 = vec(copy.target.x + xOff, copy.target.y + yOff);

      off = Math.max(G.MIN_X - p1.x, G.MIN_Y - p1.y);
      p1.add(off, off);

      off = Math.max(G.MIN_X - p2.x, G.MIN_Y - p2.y);
      p2.add(off, off);

      line(copy.pos, p1, 6);
      line(p1, p2, 6);
      line(copy.target, p2, 6);
      break;
    case G.BL:
      p2 = vec(copy.target.x + xOff, copy.target.y + yOff);

      off = Math.max(G.MIN_X - p1.x, p1.y - G.MAX_Y);
      p1.add(off, -off);

      off = Math.max(G.MIN_X - p2.x, p2.y - G.MAX_Y);
      p2.add(off, -off);

      line(copy.pos, p1, 6);
      line(p1, p2, 6);
      line(copy.target, p2, 6);
      break;
    case G.TR:
      p2 = vec(copy.target.x + xOff, copy.target.y + yOff);
      off = Math.max(p1.x - G.MAX_X, G.MIN_Y - p1.y);
      p1.add(-off, off);

      off = Math.max(p2.x - G.MAX_X, G.MIN_Y - p2.y);
      p2.add(-off, off);

      line(copy.pos, p1, 6);
      line(p1, p2, 6);
      line(copy.target, p2, 6);
      break;
    case G.BR:
      p2 = vec(copy.target.x + xOff, copy.target.y + yOff);
      off = Math.max(p1.x - G.MAX_X, p1.y - G.MAX_Y);
      p1.add(-off, -off);

      off = Math.max(p2.x - G.MAX_X, p2.y - G.MAX_Y);
      p2.add(-off, -off);

      line(copy.pos, p1, 6);
      line(p1, p2, 6);
      line(copy.target, p2, 6);
      break;
    case G.L:
      p2 = vec(copy.target.x + xOff, copy.target.y - yOff);

      off = G.MIN_X - p1.x;

      p1.add(off, copy.isMovingUp ? off : -off);

      off = G.MIN_X - p2.x;
      p2.add(off, copy.isMovingUp ? -off : off);

      line(copy.pos, p1, 6);
      line(copy.target, p2, 6);
      break;
    case G.R:
      p2 = vec(copy.target.x + xOff, copy.target.y - yOff);

      off = p1.x - G.MAX_X;

      p1.add(-off, copy.isMovingUp ? off : -off);

      off = p2.x - G.MAX_X;
      p2.add(-off, copy.isMovingUp ? -off : off);

      line(copy.pos, p1, 6);
      line(copy.target, p2, 6);
      break;
    case G.T:
      p2 = vec(copy.target.x - xOff, copy.target.y + yOff);

      off = G.MIN_Y - p1.y;

      p1.add(copy.isMovingLeft ? off : -off, off);

      off = G.MIN_Y - p2.y;
      p2.add(copy.isMovingLeft ? -off : off, off);

      line(copy.pos, p1, 6);
      line(copy.target, p2, 6);
      break;
    case G.B:
      p2 = vec(copy.target.x - xOff, copy.target.y + yOff);

      off = p1.y - G.MAX_Y;

      p1.add(copy.isMovingLeft ? off : -off, -off);

      off = p2.y - G.MAX_Y;
      p2.add(copy.isMovingLeft ? -off : off, -off);

      line(copy.pos, p1, 6);
      line(copy.target, p2, 6);
      break;
    default:
      line(copy.pos, copy.target, 6);
      break;
  }
}

/**
 * @param {Vector} pos
 */
function AdjustPos(pos) {
  if (pos.x > G.MAX_X || pos.x < G.MIN_X) {
    pos.x = pos.x > G.MAX_X ? 2 * G.MAX_X - pos.x : 2 * G.MIN_X - pos.x;
  }

  if (pos.y > G.MAX_Y || pos.y < G.MIN_Y) {
    pos.y = pos.y > G.MAX_Y ? 2 * G.MAX_Y - pos.y : 2 * G.MIN_Y - pos.y;
  }
}

/**
 * @param {{pos: Vector, isMovingLeft: boolean, isMovingUp: boolean}} obj
 */
function Bounce(obj) {
  if (obj.pos.x >= G.MAX_X || obj.pos.x <= G.MIN_X) {
    obj.isMovingLeft = !obj.isMovingLeft;
  }

  if (obj.pos.y >= G.MAX_Y || obj.pos.y <= G.MIN_Y) {
    obj.isMovingUp = !obj.isMovingUp;
  }
}
