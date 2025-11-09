import {
    getMoveDownValue,
    getLandBlockVelocity,
    getSwingBlockVelocity,
    addSuccessCount,
    addFailedCount,
    addScore
} from './utils'
import * as constant from './constant'

// Проверка коллизии
const checkCollision = (block, line) => {
    if (block.y + block.height >= line.y) {
        if (block.x < line.x - block.calWidth || block.x > line.collisionX + block.calWidth) return 1
        if (block.x < line.x) return 2
        if (block.x > line.collisionX) return 3
        if (block.x > line.x + (block.calWidth * 0.8) && block.x < line.x + (block.calWidth * 1.2)) return 5
        return 4
    }
    return 0
}

// Покачивание блока
const swing = (instance, engine, time) => {
    const ropeHeight = engine.getVariable(constant.ropeHeight)
    const initialAngle = engine.getVariable(constant.initialAngle)
    instance.angle = initialAngle * getSwingBlockVelocity(engine, time)
    instance.weightX = instance.x + Math.sin(instance.angle) * ropeHeight
    instance.weightY = instance.y + Math.cos(instance.angle) * ropeHeight
}

// Проверка выхода блока за экран
const checkBlockOut = (instance, engine) => {
    if (instance.y >= engine.height + instance.height) {
        instance.visible = false
        instance.status = constant.out
        addFailedCount(engine)
    }
}

// Основная логика
export const blockAction = (instance, engine, time) => {
    const ropeHeight = engine.getVariable(constant.ropeHeight)

    if (!instance.visible) return

    // 🔧 Инициализация
    if (!instance.ready) {
        instance.ready = true
        instance.visible = true
        instance.status = constant.swing
        instance.updateWidth(engine.getVariable(constant.blockWidth))
        instance.updateHeight(engine.getVariable(constant.blockHeight))
        instance.x = engine.width / 2
        instance.y = ropeHeight * -0.8 // чуть выше крюка

        const count = engine.getVariable(constant.successCount) || 0
        instance.assetKey = count % 2 === 0 ? 'block-rope' : 'block-perfect'
        console.log('🧱 Создан блок:', instance.assetKey)
    }

    const line = engine.getInstance('line')

    switch (instance.status) {
        case constant.swing:
            swing(instance, engine, time)
            instance.x = instance.weightX - instance.calWidth
            instance.y = instance.weightY - instance.height / 2
            break

        case constant.beforeDrop:
            instance.x = instance.weightX - instance.calWidth
            instance.y = instance.weightY
            instance.rotate = 0
            instance.ay = engine.pixelsPerFrame(0.0003 * engine.height)
            instance.startDropTime = time
            instance.status = constant.drop
            break

        case constant.drop:
            const dt = time - instance.startDropTime
            instance.startDropTime = time
            instance.vy += instance.ay * dt
            instance.y += instance.vy * dt + 0.5 * instance.ay * (dt ** 2)

            const collision = checkCollision(instance, line)
            const blockY = line.y - instance.height + 1

            if (collision === 4 || collision === 5) {
                instance.status = constant.land
                addSuccessCount(engine)
                instance.y = blockY
                line.y = blockY
                line.x = instance.x - instance.calWidth
                line.collisionX = line.x + instance.width
                addScore(engine)
                engine.playAudio('drop')
            } else if (collision === 1) {
                checkBlockOut(instance, engine)
            }
            break

        case constant.land:
            instance.x += getLandBlockVelocity(engine, time)
            break
    }
}

// Рисование блока
const drawBlock = (instance, engine) => {
    const ctx = engine.ctx
    const img = engine.getImg(instance.assetKey)
    if (img) {
        ctx.drawImage(img, instance.x, instance.y, instance.width, instance.height)
    } else {
        ctx.fillStyle = 'red'
        ctx.fillRect(instance.x, instance.y, instance.width, instance.height)
    }
}

// Основная отрисовка
export const blockPainter = (instance, engine) => {
    if (!instance.visible) return
    const ctx = engine.ctx
    ctx.save()
    if (instance.status === constant.rotateLeft || instance.status === constant.rotateRight) {
        ctx.translate(instance.x, instance.y)
        ctx.rotate(instance.rotate)
        ctx.translate(-instance.x, -instance.y)
    }
    drawBlock(instance, engine)
    ctx.restore()
}
