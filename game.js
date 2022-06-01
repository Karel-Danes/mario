//const { default: kaboom } = require("kaboom");
// <script src="https://unpkg.com/kaboom/dist/kaboom.js"></script>
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

kaboom({
  global: true,
  fullscreen: true,
  scale: 1,
  debug: true,
  clearColor: [0, 0, 0, 1]
})



loadRoot('graphics/')
loadSprite('brick', 'brick.png')
loadSprite('coin', 'coin.png')
loadSprite('evil-shroom', 'evil-shroom.png')
loadSprite('block', 'block.png')
loadSprite('mario', 'mario.png')
loadSprite('mushroom', 'mushroom.png')
loadSprite('surprise', 'surprise.png')
loadSprite('unboxed', 'unboxed.png')
loadSprite('pipe-top-right', 'pipe-bottom-left.png')
loadSprite('pipe-bottom-right', 'pipe-bottom-right.png')
loadSprite('pipe-bottom-left', 'pipe-top-right.png')
loadSprite('pipe-top-left', 'pipe-top-left.png')
loadSprite('node5', 'node5.png')
loadSprite('flower', 'flower.png')
loadSprite('blue-shroom', 'blue-shroom.png')
loadSprite('blue-brick', 'blue-brick.png')
loadSprite('steel', 'steel.png')
loadSprite('lose', 'lose.png')
loadSprite('win', 'win.png')
loadSprite('bullet', 'bullet.png')
loadSprite('gun-shroom', 'gun-shroom.png')



scene('game', ({ adult, level, score, ammo, HAS_GUN }) => {
  layers(['bg', 'obj', 'ui'], 'obj')


  const maps = [
    [
      '                                             ',
      '                                             ',
      '                                             ',
      '                                             ',
      '                                             ',
      '                   =*====                    ',
      '                                             ',
      '                            ==               ',
      '                                             ',
      '              ==%=%=    %=                   ',
      '                             ^               ',
      '                            -+               ',
      '                            ()    ========   ',
      '==============================    ==========='

    ],
    [
      '                                             ',
      '                      %          &           ',
      's    s                                       ',
      's    s                                       ',
      's    s         sss@@sss                ^     ',
      's    s                    %       s   -+     ',
      's    s                            s   ()     ',
      's    s             !f             s@@@()s    ',
      's    s             ss%       s               ',
      's    s           ss       s  s               ',
      's                    s    s  s               ',
      's                    s    s         f        ',
      's                  ! @   s@  @@@@@@@@        ',
      '@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  @@@@@@'

    ],
    [
      '    sss                                      ',
      '    s                                        ',
      's   ss                                       ',
      's     s                                      ',
      's      ss      ssssss                       @',
      's      s             ss                   @s@',
      's    sss            ss                 @@ss @',
      's    s@sss         !f sss            sss@@@@@',
      's      ss        f s             ssssss@@@@@@',
      's   &    s       s@s&            ss          ',
      's        sss    s@                 s         ',
      's              s@@@                s     N   ',
      's    f     f   fs s @ f        s             ',
      '@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@'

    ]

  ]
  const levelCfg = {
    width: 20,
    height: 20,
    '=': [sprite('brick'), solid(), 'wall'],
    '$': [sprite('coin'), solid(), 'coin'],
    '%': [sprite('surprise'), solid(), 'coin-surprise'],
    '*': [sprite('surprise'), solid(), 'mushroom-surprise'],
    '&': [sprite('surprise'), solid(), 'gun-shroom-surprise'],
    '}': [sprite('unboxed'), solid()],
    '^': [sprite('evil-shroom'), solid(), 'dangerous', body()],
    '(': [sprite('pipe-bottom-left'), 'wall', solid(), scale(0.5)],
    ')': [sprite('pipe-bottom-right'), 'wall', solid(), scale(0.5)],
    '-': [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
    '+': [sprite('pipe-top-right'), solid(), scale(0.5), 'pipe'],
    '#': [sprite('mushroom'), solid(), 'mushroom', body()],
    'g': [sprite('gun-shroom'), solid(), 'gun-shroom', body()],
    'N': [sprite('node5'), solid(), 'win'],
    '@': [sprite('blue-brick'), solid(), 'wall', scale(0.5)],
    's': [sprite('steel'), solid(), 'wall', scale(0.5)],
    '!': [sprite('blue-shroom'), solid(), 'dangerous2', body(), scale(0.5)],
    'f': [sprite('flower'), 'flower', solid()],


  }
  // let score = 100;
  const MOVE_SPEED = 120;
  const JUMP_FORCE = 360;
  let CURRENT_JUMP_FORCE = JUMP_FORCE;
  const BIG_JUMP_FORCE = 500;
  let ENEMY_SPEED = 25;
  let ENEMY_SPEED2 = 30;
  let isjumping = false;
  const FALL_DEATH = 1500;
  //let HAS_GUN = false;
  //let AMMO = ammo;

  const gameLevel = addLevel(maps[level], levelCfg)

  const scoreLabel = add([
    text(`score: ${score}`),
    pos(10, 6),
    layer('ui'),
    {
      value: score,
    }
  ])

  const levelSign = add([
    text(`level: ${level + 1}`),
    pos(100, 6),
    layer('ui')
  ])

  const ammoSign = add([
    text(`ammo: ${ammo}`),
    pos(200, 6),
    layer('ui')
  ])


  function big() {
    let timer = 0
    let isBig = false;
    return {
      update() {
        if (isBig) {
          timer -= dt()
          if (timer <= 0) {
            this.smallify()
          }
        }
      },
      isBig() {
        return isBig
      },
      smallify() {
        adult = false
        this.scale = vec2(1)
        CURRENT_JUMP_FORCE = JUMP_FORCE
        timer = 0
        isBig = false
      },
      biggify() {
        adult = true
        this.scale = vec2(2)
        CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
        timer = time
        isBig = true
      }
    }
  }


  const player = add([
    sprite('mario'),
    solid(),
    pos(30, 0),
    body(),
    big(),
    origin('bot')
  ])


  if (adult) {
    player.biggify(6)
  }
  let MUSH_SPEED = 40;

  action('mushroom', (mush) => {
    mush.move(MUSH_SPEED, 0)
  })
  action('gun-shroom', (mush) => {
    mush.move(MUSH_SPEED, 0)
  })

  player.collides("flower", (obj) => {
    destroy(obj)
    for (let i = 0; i < (getRandomInt(1, 2)); i++) {
      add([sprite('blue-shroom'), scale(0.5), solid(), 'dangerous2', body(), pos(getRandomInt(50, 700), getRandomInt(10, 250))])
    }
    for (let i = 0; i < (getRandomInt(1, 2)); i++) {
      add([sprite('evil-shroom'), solid(), 'dangerous', body(), pos(getRandomInt(50, 700), getRandomInt(10, 250))])
    }
  })

  player.collides("flower2", (obj) => {
    destroy(obj)
    add([sprite('blue-shroom'), solid(), 'dangerous2', body(), pos(700, 100)])
    add([sprite('blue-shroom'), solid(), 'dangerous2', body(), pos(400, 30)])

  })

  player.on('headbump', (obj) => {
    if (obj.is('coin-surprise')) {
      gameLevel.spawn('$', obj.gridPos.sub(0, 1))
      destroy(obj)
      gameLevel.spawn('}', obj.gridPos.sub(0, 0))
    }
    if (obj.is('mushroom-surprise')) {
      gameLevel.spawn('#', obj.gridPos.sub(0, 1))
      destroy(obj)
      gameLevel.spawn('}', obj.gridPos.sub(0, 0))
    }
    if (obj.is('gun-shroom-surprise')) {
      gameLevel.spawn('g', obj.gridPos.sub(0, 1))
      destroy(obj)
      gameLevel.spawn('}', obj.gridPos.sub(0, 0))
    }

  })
  action('dangerous2', (d) => {
    d.move(-ENEMY_SPEED2, 0)
    d.collides('bullet', () => {
      destroy(d)
    })

  })

  action('dangerous', (d2) => {
    d2.move(-ENEMY_SPEED, 0)
    d2.collides('bullet', () => {
      destroy(d2)
    })

  })
  let BULLET_SPEED = 500;
  action('bullet', (b) => {
    b.move(BULLET_SPEED, 0)
    if (b.pos.x > 1000) {
      destroy(b)
    }
    b.collides('wall', () => {
      destroy(b)
    })
  })


  player.collides('dangerous', (dang) => {
    if (isjumping || !player.grounded()) {
      destroy(dang)
    } else if (!adult && !isjumping) {
      go('lose', { score: scoreLabel.value })
    } else if (adult && !isjumping) {
      destroy(dang)
      player.smallify(6)
    }
  })
  player.collides('dangerous2', (dang) => {
    if (isjumping || !player.grounded()) {
      destroy(dang)
    } else if (!adult && !isjumping) {
      go('lose', { score: scoreLabel.value })
    } else if (adult && !isjumping) {
      destroy(dang)
      player.smallify(6)
    }
  })

  player.collides('pipe', () => {
    keyPress('down', () => {
      go('game', {
        adult: adult,
        level: (level + 1),
        score: scoreLabel.value,
        ammo: ammo,
        HAS_GUN: HAS_GUN
      })
    })
  })

  player.collides('win', () => {
    keyPress('down', () => {
      go('win', {
        score: scoreLabel.value
      })
    })
  })

  player.collides('mushroom', (mush) => {
    destroy(mush)
    player.biggify(6)
  })

  player.collides('gun-shroom', (mush) => {
    destroy(mush)
    ammo = ammo + 2;
    ammoSign.text = (`ammo: ${ammo}`)
    HAS_GUN = true;
  })

  player.collides('coin', (co) => {
    destroy(co)
    add([sprite('evil-shroom'), solid(), 'dangerous', body(), pos(getRandomInt(50, 700), getRandomInt(10, 250))])
    scoreLabel.value++
    scoreLabel.text = (`score: ${scoreLabel.value}`)
  })
  keyPress('space', () => {
    // player.gridPos.sub(1, 0)
    if (HAS_GUN && ammo > 0) {
      add([sprite('bullet'), solid(), scale(0.5), 'bullet', pos((parseInt(player.pos['x'])), (parseInt(player.pos['y'])) - 15)])
      ammo--
      ammoSign.text = (`ammo: ${ammo}`)
    }

  })

  keyDown('left', () => {
    player.move(-MOVE_SPEED, 0)
  })
  keyDown('right', () => {
    player.move(MOVE_SPEED, 0)
  })

  player.action(() => {
    if (player.grounded()) {
      isjumping = false
    }
  })

  player.action(() => {
    //camPos(player.pos)
    if (player.pos.y > FALL_DEATH) {
      go('lose', { score: scoreLabel.value })
    }
  })

  keyPress('up', () => {
    if (player.grounded()) {
      player.jump(CURRENT_JUMP_FORCE)
      isjumping = true
    }
  })
})

scene('lose', ({ score }) => {
  add([sprite('lose'), pos((width() / 2) - 300, 100), scale(2)])
  add([text(`(score: ${score})`, 30), origin('center'), pos(width() / 2, height() / 2)])
})

scene('win', ({ score }) => {
  add([sprite('win'), pos((width() / 2) - 300, 100), scale(2)])
  add([text(`(score(kisses at home): ${score})`, 30), origin('center'), pos(width() / 2, height() / 2)])
})

start('game', { adult: false, level: 0, score: 0, ammo: 0, HAS_GUN: false })

