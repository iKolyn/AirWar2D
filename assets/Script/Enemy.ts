import { _decorator, Animation, CCInteger, Component, director, Node, UITransform, view } from 'cc';
import { EnemyManager } from './EnemyManager';
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends Component {
    @property({ type: CCInteger, tooltip: "移動速度" })
    speed: number = 300;
    //注意我們使用的是Animation組件，而不是Interface。
    @property({ type: Animation, tooltip: "擊落動畫" })
    downAnim: Animation = null;
    @property({ type: CCInteger, tooltip: "敵人種類，依照enemyN的N來決定。" })
    enemyN: number = 0;
    //敵人管理器
    enemyManager: EnemyManager = null!;
    myHeight: number;
    protected onLoad(): void {
        this.myHeight = this.node.getComponent(UITransform).height * 0.5;
        this.enemyManager = director.getScene().getComponentInChildren(EnemyManager);
        if (this.enemyManager == null) {
            console.error("EnemyManager is null");
        }
    }

    update(deltaTime: number) {
        //控制移動
        const p = this.node.position;
        const dy = p.y - this.speed * deltaTime;
        //超出螢幕就回收
        if (dy < -view.getVisibleSize().height * 0.5 - this.myHeight) {
            this.die();
        }
        this.node.setPosition(p.x, dy, p.z);
    }

    die() {
        this.enemyManager.enemyRecycle(this.node, this.enemyN);
    }

}


