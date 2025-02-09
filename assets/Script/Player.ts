import { _decorator, Animation, AudioClip, CCFloat, CCInteger, Collider2D, Component, Contact2DType, EventTouch, Game, Input, input, instantiate, IPhysics2DContact, math, Node, NodePool, Prefab, ResolutionPolicy, screen, Screen, UITransform, Vec3, view, } from 'cc';
import { Bullet } from './Bullet';
import { Reward, RewardType } from './Reward';
import { GameManager } from './GameManager';
import { LifeCountUI } from './UI/LifeCountUI';
import { AudioMgr } from './AudioMgr';
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
    @property({ type: LifeCountUI, tooltip: "玩家生命值UI" })
    lifeCountUI: LifeCountUI = null!;
    @property({ type: CCInteger, tooltip: "玩家血量" })
    maxLifeCount: number = 0;
    private lifeCount: number = 0;
    @property({ type: CCFloat, tooltip: "玩家的無敵時間" })
    invincibleTime: number = 0.75;
    @property({ type: AudioClip, tooltip: "發射子彈的音效" })
    shootAudio: AudioClip = null!;
    @property({ type: AudioClip, tooltip: "玩家死亡的音效" })
    dieAudio: AudioClip = null!;
    speed: number = 300;
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
    canControl: Boolean;
    isDown: boolean = false;//是否擊落

    @property({ type: CCInteger, tooltip: "獎勵雙擊發的持續時間" })
    twoShootDuration: number = 5;

    //紀錄當前的螢幕尺寸，並計算出移動比例T
    private invScaleFactorX: number;
    private invScaleFactorY: number;

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
        window.addEventListener('resize', this.onResize.bind(this));
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.onResize();
        this.collider2D ??= this.node.getComponent(Collider2D);
        if (this.collider2D) {
            this.collider2D.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
        this.lifeCount = this.maxLifeCount;
        this.lifeCountUI.updateUI(this.lifeCount);//注意順序
        this.canControl = true;
        this.isDown = false;
    }

    onResize() {
        this.invScaleFactorX = 1 / view.getScaleX() //預先計算倒數
        this.invScaleFactorY = 1 / view.getScaleY() 
        console.log("螢幕變化了,X跟Y是" + this.invScaleFactorX + "," + this.invScaleFactorY);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        const reward = otherCollider.getComponent(Reward);
        if (reward) {
            const action = {
                [RewardType.TwoShoot]: () => {
                    this.shootType = ShootType.TwoShoot
                    this.shootRate = 0.15;
                    //計時器，等一段時間後恢復為單發射擊
                    this.scheduleOnce(() => { this.shootType = ShootType.OneShoot; this.shootRate = 0.3 }, this.twoShootDuration);
                },
                [RewardType.Bomb]: () => GameManager.getInstance().addBomb(),
            }
            action[reward.rewardType]?.();
            return;
        }

        this.changeLifeCount(-1);
        this.collider2D.enabled = false;
        if (this.lifeCount <= 0) {
            this.isDown = true;
            this.animation.stop();
            AudioMgr.inst.playOneShot(this.dieAudio, 2);
            this.playAnimWithState("down");
            this.scheduleOnce(() => this.die(), 1);
        }
        else {
            this.animation.stop();
            this.playAnimWithState("hit");
            this.scheduleOnce(() => this.collider2D.enabled = true, this.invincibleTime);
        }
    }

    //!!!注意這邊的寫法，調用方法來改變生命值，同時改變UI。
    changeLifeCount(count: number) {
        this.lifeCount += count;
        this.lifeCountUI.updateUI(this.lifeCount);
    }


    playAnimWithState(animName: string) {
        this.animation.play(this.playerState[animName]);
    }

    onTouchMove(event: EventTouch) {
        if (this.lifeCount < 1 || this.canControl == false) return;

        const p = this.node.position;
        const visiableSize = view.getVisibleSize();
        const nodeSize = this.node.getComponent(UITransform).contentSize;//當前節點的邊界大小
        //小筆記，cocos Creator使用的是中心點座標，所以最底是-0.5，最頂是0.5
        const maxX = (visiableSize.width - nodeSize.width) * 0.55
        const maxY = (visiableSize.height - nodeSize.height) * 0.55
        const targetPosition = new Vec3(
            math.clamp(p.x + (event.getDeltaX() * this.invScaleFactorX), -maxX, maxX),
            math.clamp(p.y + (event.getDeltaY() * this.invScaleFactorY), -maxY, maxY),
            p.z
        );
        this.node.setPosition(targetPosition);
    }

    public disableControl() {
        this.canControl = false;
    }

    public enableControl() {
        this.canControl = true;
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
            AudioMgr.inst.playOneShot(this.shootAudio, 0.7);
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
        GameManager.getInstance().gameOver();//利用gameManager呼叫gameOver
        window.removeEventListener('resize', this.onResize.bind(this));
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        if (this.collider2D) {
            this.collider2D.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
        this.unscheduleAllCallbacks();
    }
}

