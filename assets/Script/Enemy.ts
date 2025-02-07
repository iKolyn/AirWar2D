import { _decorator, Animation, CCFloat, CCInteger, Collider2D, Component, Contact2DType, director, Node, UITransform, view } from 'cc';
import { EnemyManager } from './EnemyManager';
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends Component {
    @property({ type: Collider2D, tooltip: "敵人的碰撞器" })
    collider2D: Collider2D = null!;
    //字典
    @property({ type: [String, String], tooltip: "敵人當前狀態" })
    stateDirc: { [key: string]: string } = {};
    //注意我們使用的是Animation組件，而不是Interface。
    @property({ type: Animation, tooltip: "動畫" })
    animation: Animation = null;
    @property({ type: CCInteger, tooltip: "敵人種類，依照enemyN的N來決定。" })
    enemyN: number = 0;
    @property({ type: CCInteger, tooltip: "移動速度" })
    speed: number = 300;
    @property({ type: CCInteger, tooltip: "我的血量" })
    maxHp: number = 0;
    hp: number = 0;

    //我要一個固定血量、會被扣的血量。
    @property({ type: CCFloat, tooltip: "我的高度" })
    myHeight: number;//我的高度

    enemyManager: EnemyManager = null!;//敵人管理器
    isDown: boolean = false;//是否擊落

    protected onLoad(): void {
        this.myHeight = this.node.getComponent(UITransform).height * 0.5;
        this.enemyManager = director.getScene().getComponentInChildren(EnemyManager);
        this.stateDirc = {
            "idle": "Enemy" + this.enemyN + "_Idle",
            "hit": "Enemy" + this.enemyN + "_Hit",
            "down": "Enemy" + this.enemyN + "_Down",
        };
        this.initEnemy();
    }
    initEnemy() {
        this.isDown = false;
        this.hp = this.maxHp;
        if (this.collider2D == null) {
            this.collider2D = this.node.getComponent(Collider2D);
        }
        this.collider2D.enabled = true;
        this.collider2D.on(Contact2DType.BEGIN_CONTACT, this.hit, this);
        this.playAnimWithState('idle');
    }

    update(deltaTime: number) {
        if (this.isDown == true) return;

        //控制移動
        const p = this.node.position;
        const dy = p.y - this.speed * deltaTime;
        //超出螢幕就回收
        if (dy < -view.getVisibleSize().height * 0.5 - this.myHeight) {
            this.die();
        }
        this.node.setPosition(p.x, dy, p.z);
    }

    playAnimWithState(animName: string) {
        this.animation.play(this.stateDirc[animName]);
    }

    hit(selfCollider: Collider2D, otherCollider: Collider2D) {
        this.hp--;
        
        if (this.hp <= 0 && this.isDown == false) {
            this.animation.stop();//先重製動畫

            this.isDown = true;
            this.collider2D.enabled = false;
            this.playAnimWithState('down');
            console.log("死了");
            //this.scheduleOnce(() => this.die, 0.5);//not work
            this.scheduleOnce(() => this.die(), 0.5);//work
        }

        //因為enemy0是唯一沒有hit動畫的，所以這樣寫，輕鬆避免掉。
        if (this.enemyN != 0 && this.isDown == false) {
            this.animation.stop();
            this.playAnimWithState('hit');
            this.scheduleOnce(() => {if(!this.isDown) this.playAnimWithState('idle');}, 0.2)
        }
    }

    die() {
        this.enemyManager.enemyRecycle(this.node, this.enemyN);
        this.collider2D.off(Contact2DType.BEGIN_CONTACT, this.hit, this);
    }

}
