import { _decorator, Animation, CCFloat, CCInteger, Collider2D, Component, Contact2DType, EventTouch, Input, input, instantiate, IPhysics2DContact, math, Node, NodePool, Prefab, Vec3, } from 'cc';
import { Bullet } from './Bullet';
const { ccclass, property } = _decorator;

//發射子彈的類型。
enum ShootType {
    OneShoot,
    TwoShoot,
};

@ccclass('Player')
export class Player extends Component {
    @property({ type: Collider2D, tooltip: "碰撞器" })
    collider2D: Collider2D = null!;
    @property({ type: Animation, tooltip: "動畫" })
    animation: Animation = null!;
    @property({ type: [String, String], tooltip: "動畫名稱" })
    playerState: { [key: string]: string } = {
        "idle": "Player_Idle",
        "hit": "Player_Hit",
        "down": "Player_Down",
    };
    @property({ type: CCInteger, tooltip: "玩家血量" })
    maxLifeCount: number = 0;
    private lifeCount: number = 0;
    @property({ type: CCFloat, tooltip: "玩家的無敵時間" })
    invincibleTime : number = 0.75;
    @property({ type: CCInteger, tooltip: "子彈池最大數量" })
    bulletMaxCount: number = 20;
    bullet1Pool: NodePool = new NodePool();//子彈池1
    bullet2Pool: NodePool = new NodePool();//子彈池2
    @property({ type: Node, tooltip: "子彈父節點" })
    bulletParent: Node = null!;
    @property({ type: Prefab, tooltip: "子彈1預製物" })
    bullet1Prefab: Prefab = null!;
    @property({ type: Prefab, tooltip: "子彈2預製物" })
    bullet2Prefab: Prefab = null!;
    @property({ type: Node, tooltip: "子彈發射點們" })
    bulletShootPoint: Node[] = [];

    //預設的子彈射擊型態是單發射擊
    @property({ type: CCInteger, tooltip: "子彈射擊型態" })
    shootType: ShootType = ShootType.OneShoot;
    @property({ type: CCFloat, tooltip: "子彈發射頻率" })
    shootRate: number = 0.5;
    shootTimer: number = 0;//計時器
    isDown: boolean = false;//是否擊落

    protected onLoad(): void {
        //初始化子彈池們
        for (let i = 0; i < this.bulletMaxCount; i++) {
            let bullet1 = instantiate(this.bullet1Prefab);
            this.bullet1Pool.put(bullet1);
        }
        for (let i = 0; i < this.bulletMaxCount * 2; i++) {
            let bullet2 = instantiate(this.bullet2Prefab);
            this.bullet2Pool.put(bullet2);
        }
        this.initPlayer();

    }
    initPlayer() {
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.collider2D ??= this.node.getComponent(Collider2D);
        if (this.collider2D) {
            this.collider2D.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
        this.lifeCount = this.maxLifeCount;
        this.isDown = false;
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        this.lifeCount--;
        this.collider2D.enabled = false;
        if (this.lifeCount <= 0) {
            this.isDown = true;
            this.animation.stop();
            this.playAnimWithState("down");
            this.scheduleOnce(() => this.die(), 0.5);
        }
        else {
            this.animation.stop();
            this.playAnimWithState("hit");
            this.scheduleOnce(() => this.collider2D.enabled = true,this.invincibleTime);
        }
    }

    playAnimWithState(animName: string) {
        this.animation.play(this.playerState[animName]);
    }

    onTouchMove(event: EventTouch) {
        if (this.lifeCount < 1) return;
        const p = this.node.position;
        //允許飛機一部分可以移出螢幕，但是不能完全移出螢幕
        const targetPosition = new Vec3(
            math.clamp(p.x + event.getDeltaX(), -230, 230),
            math.clamp(p.y + event.getDeltaY(), -380, 380),
            p.z);

        this.node.setPosition(targetPosition);

    }

    update(deltaTime: number) {
        if (this.isDown) return;

        this.shootTimer += deltaTime;
        if (this.shootTimer >= this.shootRate) {
            //物件映射
            this.shootTimer = 0;
            const shootAction = {
                [ShootType.OneShoot]: () => this.useBullet1(),
                [ShootType.TwoShoot]: () => this.useBullet2(),
            };
            shootAction[this.shootType]?.();
        }
    }

    //間隔一段時間就會自動發射子彈，同時也要發射頻率。
    useBullet1() {
        const bullet = this.bullet1Pool.size() > 0
            ? this.bullet1Pool.get()
            : instantiate(this.bullet1Prefab);
        bullet.getComponent(Bullet).initBullet();
        this.bulletParent.addChild(bullet);
        //注意要使用世界座標
        bullet.setWorldPosition(this.bulletShootPoint[0].worldPosition);
    }
    useBullet2() {
        // Create bullets for positions 1 and 2
        for (let i = 1; i <= 2; i++) {
            const bullet = this.bullet2Pool.size() > 0
                ? this.bullet2Pool.get()
                : instantiate(this.bullet2Prefab);
            bullet.getComponent(Bullet).initBullet();
            this.bulletParent.addChild(bullet);
            bullet.setWorldPosition(this.bulletShootPoint[i].worldPosition);
        }
    }

    public unuseBullet(bullet: Node, type: number) {
        if (type == 0)
            this.bullet1Pool.put(bullet);
        else
            this.bullet2Pool.put(bullet);
    }
    die() {
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        if (this.collider2D) {
            this.collider2D.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
        this.unscheduleAllCallbacks();
    }
}

