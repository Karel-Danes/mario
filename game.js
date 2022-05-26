//const { default: kaboom } = require("kaboom");
// <script src="https://unpkg.com/kaboom/dist/kaboom.js"></script>
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



scene('game', ({ adult, level, score }) => {
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
      '                      %          %           ',
      's    s                                       ',
      's    s                                       ',
      's    s         sss@@sss                ^     ',
      's    s                    %       s   N      ',
      's    s                            s          ',
      's    s             !f             s@@@@ss    ',
      's    s             ss%       s               ',
      's    s           ss       s  s               ',
      's                    s    s  s               ',
      's                    s    s         f        ',
      's                    @   s@  @@@@@@@@        ',
      '@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  @@@@@@'

    ]
  ]
  const levelCfg = {
    width: 20,
    height: 20,
    '=': [sprite('brick'), solid()],
    '$': [sprite('coin'), solid(), 'coin'],
    '%': [sprite('surprise'), solid(), 'coin-surprise'],
    '*': [sprite('surprise'), solid(), 'mushroom-surprise'],
    '}': [sprite('unboxed'), solid()],
    '^': [sprite('evil-shroom'), solid(), 'dangerous', body()],
    '(': [sprite('pipe-bottom-left'), 'wall', solid(), scale(0.5)],
    ')': [sprite('pipe-bottom-right'), 'wall', solid(), scale(0.5)],
    '-': [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
    '+': [sprite('pipe-top-right'), solid(), scale(0.5), 'pipe'],
    '#': [sprite('mushroom'), solid(), 'mushroom', body()],
    'N': [sprite('node5'), solid(), 'win'],
    '@': [sprite('blue-brick'), solid(), 'wall', scale(0.5)],
    's': [sprite('steel'), solid(), 'wall', scale(0.5)],
    '!': [sprite('blue-shroom'), solid(), 'dangerous2', body(), scale(0.5)],
    'f': [sprite('flower'),'flower', solid()],


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
    text(`level: ${level+1}`),
    pos(100, 6),
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
/*
  player.on('collides', (obj) => {
    if (obj.is('flower')) {
      gameLevel.spawn('!', obj.gridPos.sub(10, 1))
      gameLevel.spawn('!', obj.gridPos.sub(50, 1))
      gameLevel.spawn('!', obj.gridPos.sub(400, 1))
      destroy(obj)
    }
  })
*/

player.collides("flower", (obj) => {
  destroy(obj)
  add([sprite('blue-shroom'), solid(), 'dangerous2', body(), pos(700,100)])
  add([sprite('blue-shroom'), solid(), 'dangerous2', body(), pos(400,30)])
    /*
    sprite('blue-shroom'), solid(), 'dangerous2', body(), pos(500,100)

    sprite('blue-shroom'), solid(), 'dangerous2', body(), pos(700,100)
    */
  
})
/*
  player.collides('flower', (flo) => {

    destroy(flo)
    gameLevel.spawn('!', gridPos.sub(10, 50))
    gameLevel.spawn('!', gridPos.sub(-50, 1))
  })
*/
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
  })
  action('dangerous2', (d) => {
    d.move(-ENEMY_SPEED2, 0)

  })

  action('dangerous', (d2) => {
    d2.move(-ENEMY_SPEED, 0)
    /*
        d2.collides('wall', () => {
          ENEMY_SPEED = -ENEMY_SPEED
        })
    */

  })

  player.collides('dangerous', (dang) => {
    if (isjumping) {
      destroy(dang)
    } else if (!adult && !isjumping) {
      go('lose', { score: scoreLabel.value })
    } else if (adult && !isjumping) {
      destroy(dang)
      player.smallify(6)
    }
  })
  player.collides('dangerous2', (dang) => {
    if (isjumping) {
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
        score: scoreLabel.value
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

  player.collides('coin', (co) => {
    destroy(co)
    scoreLabel.value++
    scoreLabel.text = (`score: ${scoreLabel.value}`)
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
  add([sprite('lose'), pos((width() / 2)-300,100), scale(2)])
  add([text(`(score: ${score})`, 30), origin('center'), pos(width() / 2, height() / 2)])
})

scene('win', ({ score }) => {
  add([sprite('win'), pos((width() / 2)-300,100), scale(2)])
  add([text(`(score(kisses at home): ${score})`, 30), origin('center'), pos(width() / 2, height() / 2)])
})

start('game', { adult: false, level: 0, score: 0 })

